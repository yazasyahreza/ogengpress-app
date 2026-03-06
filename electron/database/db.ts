import Database from "better-sqlite3";
import path from "path";
import { app } from "electron";

// --- KONFIGURASI DATABASE ---
const dbFolder = app.getPath("userData");
export const dbPath = path.join(dbFolder, "ogeng-press.db");

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Helper: Waktu Lokal Indonesia
const getLocalTime = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const local = new Date(now.getTime() - offset);
  return local.toISOString().slice(0, 19).replace("T", " ");
};

// --- INISIALISASI TABEL ---
export function initDB() {
  // 1. Tabel Produk
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT UNIQUE,
      name TEXT NOT NULL,
      cost_price INTEGER DEFAULT 0,
      price INTEGER NOT NULL,
      stock INTEGER DEFAULT 0,
      category TEXT,
      item_number TEXT, 
      brand TEXT,
      compatibility TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  ).run();

  // Migrasi Kolom Baru (Untuk update dari versi lama)
  try {
    db.prepare("ALTER TABLE products ADD COLUMN brand TEXT").run();
  } catch (e) {}
  try {
    db.prepare("ALTER TABLE products ADD COLUMN compatibility TEXT").run();
  } catch (e) {}
  try {
    db.prepare("ALTER TABLE products ADD COLUMN image_url TEXT").run();
  } catch (e) {}

  // 2. Tabel Transaksi (Header)
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_amount INTEGER DEFAULT 0,
      discount INTEGER DEFAULT 0,
      final_amount INTEGER DEFAULT 0,
      total_profit INTEGER DEFAULT 0,
      payment_method TEXT DEFAULT 'TUNAI',
      payment_date DATETIME 
    )
  `,
  ).run();

  // 3. Tabel Detail Item Transaksi
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS transaction_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id INTEGER,
      product_id INTEGER,
      product_name TEXT,
      qty INTEGER,
      price_at_transaction INTEGER,
      cost_at_transaction INTEGER,
      FOREIGN KEY(transaction_id) REFERENCES transactions(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    )
  `,
  ).run();

  // 4. Tabel Riwayat Stok
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS stock_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT,
      qty_added INTEGER,
      log_type TEXT, 
      log_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  ).run();

  // 5. Tabel Ledger Bulanan (Untuk Grafik)
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS monthly_ledger (
      period TEXT PRIMARY KEY, -- Format: 'YYYY-MM'
      revenue_adj INTEGER DEFAULT 0,
      expense_adj INTEGER DEFAULT 0
    )
  `,
  ).run();

  // 6. Tabel Catatan Keuangan Manual
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS financial_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      type TEXT,      -- 'MASUK' atau 'KELUAR'
      category TEXT,  -- 'OPERASIONAL', 'GAJI', 'LAINNYA'
      amount INTEGER DEFAULT 0,
      description TEXT
    )
  `,
  ).run();

  // (Tabel daily_adjustments dihapus karena tidak digunakan)
}

// ==========================================
//  A. MANAJEMEN PRODUK & GUDANG
// ==========================================

export function getProducts() {
  try {
    return db.prepare("SELECT * FROM products ORDER BY name ASC").all();
  } catch (e) {
    return [];
  }
}

export function addProduct(p: any) {
  try {
    const stmt = db.prepare(`
      INSERT INTO products (barcode, name, cost_price, price, stock, category, item_number, brand, compatibility, image_url) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      p.barcode,
      p.name,
      p.cost_price,
      p.price,
      p.stock,
      p.category || "",
      p.item_number || "",
      p.brand || "",
      p.compatibility || "",
      p.image_url || "",
    );

    if (p.stock > 0) {
      db.prepare(
        "INSERT INTO stock_logs (product_name, qty_added, log_type, log_date) VALUES (?, ?, ?, ?)",
      ).run(p.name, p.stock, "Barang Baru", getLocalTime());
    }
    return { success: true, id: info.lastInsertRowid };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export function updateProduct(id: number, p: any) {
  try {
    const oldProd: any = db
      .prepare("SELECT stock, name FROM products WHERE id = ?")
      .get(id);
    const stmt = db.prepare(`
      UPDATE products SET barcode=?, name=?, cost_price=?, price=?, stock=?, category=?, item_number=?, brand=?, compatibility=?, image_url=? 
      WHERE id=?
    `);
    const info = stmt.run(
      p.barcode,
      p.name,
      p.cost_price,
      p.price,
      p.stock,
      p.category || "",
      p.item_number || "",
      p.brand || "",
      p.compatibility || "",
      p.image_url || "",
      id,
    );

    if (oldProd && p.stock > oldProd.stock) {
      const added = p.stock - oldProd.stock;
      db.prepare(
        "INSERT INTO stock_logs (product_name, qty_added, log_type, log_date) VALUES (?, ?, ?, ?)",
      ).run(p.name, added, "Tambah Stok", getLocalTime());
    }
    return { success: info.changes > 0 };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export function deleteProduct(id: number) {
  try {
    const check: any = db
      .prepare(
        "SELECT COUNT(*) as count FROM transaction_items WHERE product_id = ?",
      )
      .get(id);
    if (check.count > 0)
      return {
        success: false,
        reason: "LOCKED",
        msg: "Barang sedang digunakan dalam transaksi hari ini!",
      };

    const info = db.prepare("DELETE FROM products WHERE id = ?").run(id);
    return { success: info.changes > 0 };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ==========================================
//  B. TRANSAKSI & KASIR (CORE)
// ==========================================

// Fungsi ini dipakai jika transaksi dilakukan langsung dari Database (Server-side logic)
// Namun saat ini IPC Main di main.ts memiliki logika sendiri untuk handling stok manual/db.
// Fungsi ini tetap disimpan sebagai fallback/utility.
export function createTransaction(
  items: any[],
  totalAmount: number,
  discount: number,
  paymentMethod: string,
) {
  const executeTx = db.transaction(() => {
    let totalCost = 0;
    items.forEach((item) => {
      totalCost += item.cost_price * item.qty;
    });

    const finalAmount = totalAmount - discount;
    const totalProfit = finalAmount - totalCost;

    const info = db
      .prepare(
        `
      INSERT INTO transactions (total_amount, discount, final_amount, total_profit, payment_method, payment_date) 
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      )
      .run(
        totalAmount,
        discount,
        finalAmount,
        totalProfit,
        paymentMethod,
        getLocalTime(),
      );

    const txId = info.lastInsertRowid;
    const stmtDetail = db.prepare(
      `INSERT INTO transaction_items (transaction_id, product_id, product_name, qty, price_at_transaction, cost_at_transaction) VALUES (?, ?, ?, ?, ?, ?)`,
    );
    const stmtUpdateStock = db.prepare(
      `UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?`,
    );

    for (const item of items) {
      // Hanya kurangi stok jika ID valid (bukan manual)
      if (item.id && typeof item.id === "number") {
        const updateResult = stmtUpdateStock.run(item.qty, item.id, item.qty);
        if (updateResult.changes === 0)
          throw new Error(`Stok kurang untuk barang: ${item.name}`);
      }
      stmtDetail.run(
        txId,
        item.id,
        item.name,
        item.qty,
        item.price,
        item.cost_price,
      );
    }
    return txId;
  });

  try {
    const id = executeTx();
    return { success: true, id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export function deleteTransaction(id: number) {
  try {
    const executeDelete = db.transaction(() => {
      // Kembalikan Stok
      const items: any[] = db
        .prepare(
          "SELECT product_id, product_name, qty FROM transaction_items WHERE transaction_id = ?",
        )
        .all(id);
      const updateStockStmt = db.prepare(
        "UPDATE products SET stock = stock + ? WHERE id = ?",
      );
      const logStockStmt = db.prepare(
        "INSERT INTO stock_logs (product_name, qty_added, log_type, log_date) VALUES (?, ?, ?, ?)",
      );
      const now = getLocalTime();

      for (const item of items) {
        if (item.product_id) {
          updateStockStmt.run(item.qty, item.product_id);
          logStockStmt.run(item.product_name, item.qty, "Batal Transaksi", now);
        }
      }

      // Hapus Data
      db.prepare("DELETE FROM transaction_items WHERE transaction_id = ?").run(
        id,
      );
      const info = db.prepare("DELETE FROM transactions WHERE id = ?").run(id);

      if (info.changes === 0) throw new Error("Transaksi tidak ditemukan");
    });

    executeDelete();
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export const resetAllTransactions = () => {
  try {
    const transaction = db.transaction(() => {
      db.prepare("DELETE FROM transaction_items").run();
      db.prepare("DELETE FROM transactions").run();
    });
    transaction();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ==========================================
//  C. LAPORAN & KEUANGAN
// ==========================================

export function getTodayReport() {
  try {
    const stmt = db.prepare(`
      SELECT 
        COUNT(id) as total_transaction, 
        COALESCE(SUM(total_amount), 0) as gross_sales, 
        COALESCE(SUM(discount), 0) as total_discount, 
        COALESCE(SUM(final_amount), 0) as net_sales, 
        COALESCE(SUM(total_profit), 0) as total_profit,
        COALESCE(SUM(CASE WHEN payment_method = 'TUNAI' THEN final_amount ELSE 0 END), 0) as tunai_today,
        COALESCE(SUM(CASE WHEN payment_method = 'QRIS' THEN final_amount ELSE 0 END), 0) as qris_today
       FROM transactions 
       WHERE date(payment_date) = date('now', 'localtime')
    `);
    const result: any = stmt.get();
    return { ...result, is_manual: false };
  } catch (e) {
    return {
      total_transaction: 0,
      gross_sales: 0,
      total_discount: 0,
      net_sales: 0,
      total_profit: 0,
      tunai_today: 0,
      qris_today: 0,
      is_manual: false,
    };
  }
}

export function getDailyHistory() {
  try {
    return db
      .prepare(
        `
      SELECT 
        date(payment_date) as period_id, 
        SUM(final_amount) as revenue, 
        SUM(final_amount - total_profit) as expense, 
        SUM(total_profit) as profit, 
        SUM(CASE WHEN payment_method = 'TUNAI' THEN final_amount ELSE 0 END) as tunai, 
        SUM(CASE WHEN payment_method = 'QRIS' THEN final_amount ELSE 0 END) as qris
      FROM transactions 
      GROUP BY period_id ORDER BY period_id DESC LIMIT 30
    `,
      )
      .all();
  } catch (e) {
    return [];
  }
}

export function getTopProductsByCategory() {
  try {
    return db
      .prepare(
        `
      SELECT 
        p.category, p.name, p.brand, p.stock as current_stock, 
        COALESCE(SUM(ti.qty), 0) as total_sold, 
        COALESCE(SUM(ti.price_at_transaction * ti.qty), 0) as total_revenue 
      FROM transaction_items ti 
      JOIN products p ON ti.product_id = p.id 
      WHERE p.category IS NOT NULL AND p.category != '' 
      GROUP BY p.id 
      ORDER BY total_sold DESC, total_revenue DESC
    `,
      )
      .all();
  } catch (e) {
    return [];
  }
}

// 1. Tambah Catatan Manual (Pengeluaran/Pemasukan Lain)
export function addFinancialRecord(data: any) {
  try {
    const stmt = db.prepare(
      "INSERT INTO financial_records (date, type, category, amount, description) VALUES (?, ?, ?, ?, ?)",
    );
    const info = stmt.run(
      data.date || getLocalTime(),
      data.type,
      data.category,
      data.amount,
      data.description,
    );
    return { success: true, id: info.lastInsertRowid };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// 2. Hapus Catatan Manual
export function deleteFinancialRecord(id: number) {
  try {
    const info = db
      .prepare("DELETE FROM financial_records WHERE id = ?")
      .run(id);
    return { success: info.changes > 0 };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// 3. Ambil Laporan GABUNGAN (Penjualan + Manual)
export function getCombinedFinanceReport() {
  try {
    const sql = `
      SELECT 
        'TX-' || t.id as unique_id,
        t.id as original_id,
        t.payment_date as date, 
        'MASUK' as type, 
        'PENJUALAN' as category, 
        t.final_amount as amount, 
        t.total_amount as gross_amount, 
        t.discount as discount,
        t.total_profit as profit, 
        'Penjualan Kasir (' || t.payment_method || ')' as description,
        GROUP_CONCAT(COALESCE(p.name, ti.product_name) || ' (x' || ti.qty || ')', ', ') as items_summary
      FROM transactions t
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      LEFT JOIN products p ON ti.product_id = p.id
      GROUP BY t.id
      
      UNION ALL
      
      SELECT 
        'MAN-' || id as unique_id,
        id as original_id,
        date, type, category, amount, amount as gross_amount, 0 as discount, 0 as profit, description, NULL as items_summary
      FROM financial_records
      
      ORDER BY date DESC LIMIT 100
    `;
    return db.prepare(sql).all();
  } catch (e) {
    return [];
  }
}

// 4. Edit Data Keuangan Transaksi (Manual Override)
export function updateTransactionFinancials(
  id: number,
  gross: number,
  discount: number,
  profit: number,
) {
  try {
    const finalAmount = gross - discount;
    const stmt = db.prepare(
      `UPDATE transactions SET total_amount = ?, discount = ?, final_amount = ?, total_profit = ? WHERE id = ?`,
    );
    const info = stmt.run(gross, discount, finalAmount, profit, id);
    return { success: info.changes > 0 };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ==========================================
//  D. LEDGER & CHART UTILS
// ==========================================

export function saveMonthlyLedger(
  period: string,
  revAdj: number,
  expAdj: number,
) {
  try {
    const stmt = db.prepare(`
      INSERT INTO monthly_ledger (period, revenue_adj, expense_adj) VALUES (?, ?, ?)
      ON CONFLICT(period) DO UPDATE SET revenue_adj = excluded.revenue_adj, expense_adj = excluded.expense_adj
    `);
    stmt.run(period, revAdj, expAdj);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export function getMonthlyLedger(period: string) {
  try {
    return db
      .prepare("SELECT * FROM monthly_ledger WHERE period = ?")
      .get(period);
  } catch (e) {
    return null;
  }
}

export function deleteMonthlyAdjustment(period: string) {
  try {
    db.prepare("DELETE FROM monthly_ledger WHERE period = ?").run(period);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
