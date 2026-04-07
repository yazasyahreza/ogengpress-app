import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "fs";
import express from "express";
import ip from "ip";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load Environment Variables (.env)
dotenv.config();

// --- DATABASE IMPORTS ---
import {
  initDB,
  db,
  dbPath,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getTopProductsByCategory,
  getCombinedFinanceReport,
  addFinancialRecord,
  deleteFinancialRecord,
  getTodayReport,
  getDailyHistory,
  resetAllTransactions,
  deleteTransaction,
  saveMonthlyLedger,
  getMonthlyLedger,
} from "./database/db";

// --- CONFIGURATION ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzSiltxtE6zqtOAZKtUYXFPAXRYYgftWsL2_rMIdkdOaRM6KPTbvAk7lXdHM5V7Amsy/exec";
const PORT = 3000;

// --- SETUP AI (GEMINI) ---
// 1. Bersihkan API Key dari spasi tidak sengaja (trim)
const API_KEY = (process.env.GEMINI_API_KEY || "").trim();
const genAI = new GoogleGenerativeAI(API_KEY);

// 2. Gunakan model terbaru yang paling stabil
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

process.env.APP_ROOT = path.join(__dirname, "..");
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });
  win.maximize();
  win.show();

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.whenReady().then(async () => {
  initDB();

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS missed_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      count INTEGER DEFAULT 1,
      last_requested DATETIME
    )
  `,
  ).run();

  // ==========================================
  //  FUNGSI PUSAT OTAK AI (UNTUK PC & HP)
  // ==========================================

  // --- OTAK 1: MASTER MEKANIK & KEUANGAN ---
  async function processAskAi(userPrompt: string) {
    try {
      if (!API_KEY) throw new Error("API Key belum disetting di file .env!");

      const today = new Date();

      // ✨ SUNTIKAN INFO WAKTU UNTUK MENCEGAH HALUSINASI AI ✨
      const namaHari = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
      ][today.getDay()];
      const tglIndo = `${namaHari}, ${today.getDate()} ${today.toLocaleString("id-ID", { month: "long" })} ${today.getFullYear()}`;

      const dayOfWeek = today.getDay(); // 0 = Minggu, 1 = Senin, 2 = Selasa, dst
      const offsetThisWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Mundur ke Senin ini
      const offsetLastWeek = offsetThisWeek + 7; // Mundur ke Senin lalu

      const thisWeek: any = db
        .prepare(
          `SELECT COUNT(*) as total_trx, COALESCE(SUM(total_amount), 0) as gross_sales, COALESCE(SUM(total_profit), 0) as net_profit 
           FROM transactions 
           WHERE substr(payment_date, 1, 10) >= date('now', 'localtime', '-${offsetThisWeek} days')`,
        )
        .get();

      const lastWeek: any = db
        .prepare(
          `SELECT COUNT(*) as total_trx, COALESCE(SUM(total_amount), 0) as gross_sales, COALESCE(SUM(total_profit), 0) as net_profit 
           FROM transactions 
           WHERE substr(payment_date, 1, 10) >= date('now', 'localtime', '-${offsetLastWeek} days') 
           AND substr(payment_date, 1, 10) < date('now', 'localtime', '-${offsetThisWeek} days')`,
        )
        .get();

      let percentChange = 0;
      let trend = "stabil";
      if (lastWeek.gross_sales > 0) {
        percentChange =
          ((thisWeek.gross_sales - lastWeek.gross_sales) /
            lastWeek.gross_sales) *
          100;
        if (percentChange > 0) trend = "NAIK";
        else if (percentChange < 0) trend = "TURUN";
      } else if (thisWeek.gross_sales > 0) {
        percentChange = 100;
        trend = "NAIK (Minggu lalu tidak ada pemasukan)";
      }

      const allProducts: any = db
        .prepare(
          `SELECT name, stock, item_number, price, compatibility, category FROM products`,
        )
        .all();

      const catalogText =
        allProducts.length > 0
          ? allProducts
              .map(
                (p: any) =>
                  `- ${p.name} | Stok: ${p.stock} | Nomor Item: ${p.item_number || "-"} | Harga: Rp${p.price.toLocaleString("id-ID")} | Kategori: ${p.category || "-"} | Tipe: ${p.compatibility || "-"}`,
              )
              .join("\n")
          : "Gudang kosong.";

      const contextPrompt = `
        Kamu adalah "Master Mekanik Tingkat Dewa" yang sangat jenius, presisi, dan tahu SEMUA hal tentang spesifikasi otomotif roda dua KHUSUS PASAR INDONESIA (Honda, Yamaha, Suzuki, Kawasaki). Kamu juga Asisten di bengkel 'Ogeng Press'.

        === INFO WAKTU SAAT INI (SANGAT PENTING!) ===
        Hari ini adalah: ${tglIndo}.
        DILARANG KERAS MENEBAK HARI! Jika Omset Minggu Ini adalah Rp 0, itu murni karena belum ada pembeli/pelanggan yang datang, BUKAN karena ini hari Senin. Jangan berasumsi macam-macam!

        === DATA KEUANGAN BENGKEL (Senin - Minggu) ===
        Hanya dibahas jika ditanya.
        
        [MINGGU INI]
        - Omset: Rp ${thisWeek.gross_sales.toLocaleString("id-ID")}
        - Profit: Rp ${thisWeek.net_profit.toLocaleString("id-ID")}
        - Total Transaksi: ${thisWeek.total_trx}
        
        [MINGGU LALU]
        - Omset: Rp ${lastWeek.gross_sales.toLocaleString("id-ID")}
        - Profit: Rp ${lastWeek.net_profit.toLocaleString("id-ID")}
        - Total Transaksi: ${lastWeek.total_trx}

        [PERBANDINGAN]
        - Status Performa: ${trend} sebesar ${Math.abs(percentChange).toFixed(1)}%.

        === DAFTAR STOK GUDANG OGENG PRESS ===
        ${catalogText}

        === TUGAS & ATURAN MASTER MEKANIK (ANTI-BLUNDER) ===
        1. AKURASI SPESIFIKASI INDONESIA: Jika Bos bertanya hal teknis (ukuran laher, kode busi, seal, takaran oli), kamu WAJIB menjawab dengan data spesifik motor pabrikan Indonesia! 
          - Hati-hati dengan perbedaan merek! (Contoh: Laher depan matic Honda rata-rata 6201, bebek Honda 6301, tapi NMAX/Aerox adalah 6300, Mio/Jupiter adalah 6300 atau 6203). 
          - Jika motor punya versi berbeda tiap tahun (Misal: Scoopy karbu ring 14 vs Scoopy FI ring 12), WAJIB sebutkan perbedaannya atau tanya balik ke Bos tahun berapa motornya.
          - JANGAN PERNAH MENEBAK! Jika kamu ragu, bilang: "Wah Bos, untuk motor ini variasinya banyak, tahun berapa ya motornya biar saya nggak salah sebut?"
        2. REKOMENDASI CERDAS DARI GUDANG: Jika Bos minta rekomendasi, tentukan spek yang pas LALU cari barang dengan spek/peruntukan tersebut di [DAFTAR STOK GUDANG]. Beritahu nama barang, harga, dan lokasinya.
        3. VISUALISASI & PENGARAHAN LOKASI: Jika Bos bertanya bentuk suatu barang, jelaskan singkat bentuknya, LALU cari di [DAFTAR STOK GUDANG] dan arahkan ke lokasi raknya.
        4. KEJUJURAN GUDANG: Jika barang secara spesifikasi teknis KOSONG di [DAFTAR STOK GUDANG], jujurlah bilang kosong, tapi tetap berikan jawaban teori teknisnya.
        5. LAPORAN KEUANGAN: Jika Bos menanyakan laporan/perbandingan, jelaskan dengan bahasa yang asik (seperti "Wah mantap Bos, minggu ini kita cuan..."), lalu berikan angka perbandingan minggu ini dan minggu lalu secara jelas.
        6. FORMAT TAMPILAN (SANGAT PENTING): 
          - Buat jawabanmu SUPER RAPI dan MUDAH DIBACA. 
          - WAJIB gunakan baris baru (Enter) ganda untuk memisahkan paragraf sapaan, daftar barang, dan penutup.
          - Gunakan list/bullet points (berupa tanda strip "-" atau angka "1.") untuk menyebutkan lebih dari satu barang.
          - Gunakan tanda bintang ganda (**kata**) HANYA untuk menebalkan NAMA BARANG dan HARGA agar menonjol.
        
        Pertanyaan Bos: "${userPrompt}"
        
        Aturan Menjawab: Jawab dengan gaya asik, seperti mekanik senior profesional yang sangat teliti. Selalu panggil user dengan "Bos".
      `;

      const result = await model.generateContent(contextPrompt);
      const response = await result.response;
      return { success: true, text: response.text() };
    } catch (e: any) {
      console.error("AI Chat Error:", e);
      return { success: false, error: e.message || "Gagal menghubungi AI." };
    }
  }

  // --- OTAK 2: AI MATA ELANG (VISUAL SEARCH) ---
  async function processAskAiImage(base64Image: string) {
    try {
      if (!API_KEY) throw new Error("API Key belum disetting!");

      const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3)
        throw new Error("Format gambar tidak valid.");
      const mimeType = matches[1];
      const rawBase64 = matches[2];

      const products: any = db
        .prepare("SELECT name, stock, item_number, part_code FROM products")
        .all();
      const catalog =
        products.length > 0
          ? products
              .map(
                (p: any) =>
                  `- ${p.name} (Stok: ${p.stock}, Item Number: ${p.item_number || "Belum diatur"}, Kode: ${p.part_code || "-"})`,
              )
              .join("\n")
          : "Gudang masih kosong.";

      const imagePart = {
        inlineData: { data: rawBase64, mimeType: mimeType },
      };

      const prompt = `
        Kamu adalah Asisten Gudang yang sangat teliti di bengkel 'Ogeng Press'.
        Tugasmu HANYA mencocokkan gambar sparepart yang dikirim dengan daftar stok gudang di bawah ini. 
        JANGAN menebak-nebak nama barang dari internet, fokus saja pada data yang ada di gudang.

        DAFTAR STOK GUDANG OGENG PRESS:
        ${catalog}

        ATURAN PENCOCOKAN (SANGAT KETAT & ANTI-SOTOY):
        1. Amati gambar baik-baik. Cari petunjuk visual yang KUAT (seperti tulisan di kardus, merek, kode part, atau bentuk yang sangat spesifik).
        2. Jika petunjuk visualnya COCOK dengan salah satu barang di daftar stok, beritahu Bos nama barangnya, sisa stok, dan lokasi raknya.
        3. JIKA BARANG POLOS: Apabila di gambar hanya terlihat barang yang bentuknya sangat umum (seperti sil karet hitam polos, pelor/bearing polos, baut biasa) TANPA BUNGKUS atau kode yang bisa dibaca, KAMU DILARANG KERAS MENEBAK! 
        4. Jika kamu tidak menemukan kecocokan yang pasti 100% di daftar stok, atau gambarnya terlalu polos, jujurlah dan minta Bos untuk memfotokan bungkusnya.

        PENTING! Kamu WAJIB menjawab HANYA dengan format JSON yang valid persis seperti ini (tanpa teks apapun di luar JSON):
        {
          "reply": "Halo Bos! Di gambar terlihat kampas rem. Stok kita ada 6 pcs di rak G5."
        }
        
        Aturan JSON:
        - "reply": Jawaban santai ke Bos. Berikan info lokasi & stok JIKA YAKIN 100%. Jika barang polos/tidak ada petunjuk jelas, minta Bos memfotokan bungkusnya.
      `;

      const result = await model.generateContent([prompt, imagePart]);
      let rawText = await result.response.text();
      rawText = rawText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      let aiData;
      try {
        aiData = JSON.parse(rawText);
      } catch (parseErr) {
        return { success: true, text: rawText };
      }

      return { success: true, text: aiData.reply };
    } catch (e: any) {
      console.error("AI Image Error:", e);
      return { success: false, error: e.message };
    }
  }

  // ==========================================
  //  IPC HANDLERS (Komunikasi PC -> DB & AI)
  // ==========================================

  // --- KONEKSI PC KE OTAK AI ---
  ipcMain.handle("ask-ai", async (_, prompt) => await processAskAi(prompt));
  ipcMain.handle(
    "ask-ai-image",
    async (_, base64Image) => await processAskAiImage(base64Image),
  );

  // 1. PRODUK
  ipcMain.handle("fetch-products", async () => getProducts());
  ipcMain.handle("add-product", async (_, p) => addProduct(p));
  ipcMain.handle("edit-product", async (_, id, p) => updateProduct(id, p));
  ipcMain.handle("delete-product", async (_, id) => {
    try {
      return deleteProduct(id);
    } catch (e: any) {
      return { success: false, msg: e.message };
    }
  });
  ipcMain.handle("fetch-top-products", async () => getTopProductsByCategory());

  // 2. TRANSAKSI & KASIR
  ipcMain.handle(
    "create-transaction",
    async (_, items, total, discount, paymentMethod, activeDate) => {
      try {
        const txDate = activeDate
          ? `${activeDate} ${new Date().toLocaleTimeString("id-ID", { hour12: false })}`
          : null;

        const result = db.transaction(() => {
          for (const item of items) {
            if (item.id && typeof item.id === "number") {
              const product: any = db
                .prepare("SELECT stock, name FROM products WHERE id = ?")
                .get(item.id);
              if (product && product.stock < item.qty) {
                throw new Error(
                  `Stok kurang: ${product.name}. Sisa: ${product.stock}`,
                );
              }
            }
          }
          const finalAmount = total - discount;

          let info;
          if (txDate) {
            info = db
              .prepare(
                `INSERT INTO transactions (total_amount, discount, final_amount, total_profit, payment_method, payment_date) VALUES (?, ?, ?, 0, ?, ?)`,
              )
              .run(total, discount, finalAmount, paymentMethod, txDate);
          } else {
            info = db
              .prepare(
                `INSERT INTO transactions (total_amount, discount, final_amount, total_profit, payment_method, payment_date) VALUES (?, ?, ?, 0, ?, datetime('now', 'localtime'))`,
              )
              .run(total, discount, finalAmount, paymentMethod);
          }
          const transactionId = info.lastInsertRowid;
          let totalProfit = 0;
          for (const item of items) {
            let costPrice = 0,
              productId = null;
            if (item.id && typeof item.id === "number") {
              productId = item.id;
              const product: any = db
                .prepare("SELECT cost_price FROM products WHERE id = ?")
                .get(productId);
              costPrice = product?.cost_price || 0;
              db.prepare(
                "UPDATE products SET stock = stock - ? WHERE id = ?",
              ).run(item.qty, productId);
            } else {
              costPrice = item.cost_price || 0;
            }
            totalProfit += (item.price - costPrice) * item.qty;
            db.prepare(
              `INSERT INTO transaction_items (transaction_id, product_id, product_name, qty, price_at_transaction, cost_at_transaction) VALUES (?, ?, ?, ?, ?, ?)`,
            ).run(
              transactionId,
              productId,
              item.name,
              item.qty,
              item.price,
              costPrice,
            );
          }
          db.prepare(
            "UPDATE transactions SET total_profit = ? WHERE id = ?",
          ).run(totalProfit - discount, transactionId);
          return { success: true };
        })();
        return result;
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },
  );

  ipcMain.handle("delete-transaction", async (_, idStr) => {
    try {
      if (String(idStr).startsWith("MAN-")) {
        const id = parseInt(String(idStr).replace("MAN-", ""));
        return deleteFinancialRecord(id);
      } else {
        const id = String(idStr).startsWith("TX-")
          ? parseInt(String(idStr).replace("TX-", ""))
          : Number(idStr);
        return deleteTransaction(id);
      }
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });
  ipcMain.handle("update-transaction", async (_, idStr, data) => {
    try {
      const { itemName, gross, discount, profit, paymentMethod } = data;

      if (String(idStr).startsWith("MAN-")) {
        // [PERBAIKAN] Tabel pengeluaran tidak pakai payment_method, jadi kita hapus dari query!
        const id = parseInt(String(idStr).replace("MAN-", ""));
        db.prepare(
          `UPDATE financial_records SET description=?, amount=? WHERE id=?`,
        ).run(itemName, gross, id);
        return { success: true };
      } else {
        // Jika yang diedit adalah transaksi penjualan (Ini aman pakai payment_method)
        const id = String(idStr).startsWith("TX-")
          ? parseInt(String(idStr).replace("TX-", ""))
          : Number(idStr);
        const finalAmount = Number(gross) - (Number(discount) || 0);

        db.transaction(() => {
          db.prepare(
            `UPDATE transactions SET total_amount=?, discount=?, final_amount=?, total_profit=?, payment_method=? WHERE id=?`,
          ).run(gross, discount, finalAmount, profit, paymentMethod, id);
        })();
        return { success: true };
      }
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });
  ipcMain.handle("reset-transactions", async () => resetAllTransactions());

  // 3. LAPORAN & KEUANGAN
  ipcMain.handle("fetch-today-report", async () => getTodayReport());
  ipcMain.handle("fetch-finance-summary", () => getCombinedFinanceReport());
  ipcMain.handle("fetch-daily-history", async () => getDailyHistory());
  // ✨ FUNGSI HITUNG TOTALAN MINGGUAN (ANTI-LIMIT) ✨
  ipcMain.handle("fetch-weekly-stats", (_, startDate, endDate) => {
    try {
      const sales: any = db
        .prepare(
          `
        SELECT COALESCE(SUM(total_amount), 0) as gross, 
               COALESCE(SUM(total_profit), 0) as profit 
        FROM transactions 
        WHERE substr(payment_date, 1, 10) >= ? AND substr(payment_date, 1, 10) <= ?
      `,
        )
        .get(startDate, endDate);

      const exps: any = db
        .prepare(
          `
        SELECT COALESCE(SUM(amount), 0) as expense 
        FROM financial_records 
        WHERE substr(date, 1, 10) >= ? AND substr(date, 1, 10) <= ?
      `,
        )
        .get(startDate, endDate);

      return {
        success: true,
        gross: sales.gross,
        profit: sales.profit,
        expense: exps.expense,
      };
    } catch (e) {
      return { success: false, gross: 0, profit: 0, expense: 0 };
    }
  });
  ipcMain.handle("add-financial-record", (_, data) => addFinancialRecord(data));
  ipcMain.handle("fetch-monthly-chart", async () => {
    try {
      const chartData: any[] = [];
      const today = new Date();
      const allTx = db
        .prepare(
          `SELECT payment_date, total_amount, (total_amount - total_profit) as total_cost FROM transactions`,
        )
        .all();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label =
          d.toLocaleString("id-ID", { month: "short" }) +
          " '" +
          d.getFullYear().toString().slice(-2);
        let realRevenue = 0,
          realExpense = 0;
        allTx.forEach((row: any) => {
          const tDate = new Date(row.payment_date);
          if (!isNaN(tDate.getTime())) {
            const tKey = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, "0")}`;
            if (tKey === key) {
              realRevenue += row.total_amount;
              realExpense += row.total_cost;
            }
          }
        });
        const ledger: any = getMonthlyLedger(key);
        const adjRev = ledger ? ledger.revenue_adj : 0;
        const adjExp = ledger ? ledger.expense_adj : 0;
        chartData.push({
          key,
          label,
          revenue: realRevenue + adjRev,
          expense: realExpense + adjExp,
          profit: realRevenue + adjRev - (realExpense + adjExp),
          isManual: adjRev !== 0 || adjExp !== 0,
        });
      }
      return chartData;
    } catch (error) {
      return [];
    }
  });
  ipcMain.handle("save-monthly-adjustment", async (_, p) => {
    try {
      const stmt = db.prepare(
        `SELECT COALESCE(SUM(total_amount), 0) as real_rev, COALESCE(SUM(total_amount - total_profit), 0) as real_exp FROM transactions WHERE strftime('%Y-%m', payment_date) = ?`,
      );
      const r: any = stmt.get(p.period);
      return saveMonthlyLedger(
        p.period,
        p.targetRevenue - (r?.real_rev || 0),
        p.targetExpense - (r?.real_exp || 0),
      );
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  // 4. MISSED ITEMS
  ipcMain.handle("fetch-missed-items", () =>
    db
      .prepare(
        "SELECT * FROM missed_items ORDER BY count DESC, last_requested DESC",
      )
      .all(),
  );
  ipcMain.handle("add-missed-item", (_, name) => {
    try {
      const cleanName = name.trim();
      const exist: any = db
        .prepare(
          "SELECT id, count FROM missed_items WHERE name = ? COLLATE NOCASE",
        )
        .get(cleanName);
      if (exist)
        db.prepare(
          "UPDATE missed_items SET count = count + 1, last_requested = datetime('now', 'localtime') WHERE id = ?",
        ).run(exist.id);
      else
        db.prepare(
          "INSERT INTO missed_items (name, count, last_requested) VALUES (?, 1, datetime('now', 'localtime'))",
        ).run(cleanName);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });
  ipcMain.handle("delete-missed-item", (_, id) => {
    db.prepare("DELETE FROM missed_items WHERE id = ?").run(id);
    return { success: true };
  });

  // 5. SYSTEM
  ipcMain.handle("sync-to-cloud", async () => {
    try {
      const tr: any = getTodayReport();
      const payload = {
        date: new Date().toLocaleDateString("id-ID"),
        total_trx: tr.total_transaction,
        gross_sales: tr.gross_sales,
        total_discount: tr.total_discount,
        net_sales: tr.net_sales,
        profit: tr.total_profit,
        tunai: tr.tunai_today,
        qris: tr.qris_today,
      };
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "text/plain;charset=utf-8" },
      });
      const result = JSON.parse(await res.text());
      if (result.result === "success")
        return { success: true, msg: "Data terkirim!" };
      throw new Error(result.message);
    } catch (e: any) {
      return { success: false, msg: e.message };
    }
  });
  ipcMain.handle("backup-database", async () => {
    const { filePath } = await dialog.showSaveDialog({
      title: "Backup Database",
      defaultPath: `Backup_Toko_${new Date().toISOString().slice(0, 10)}.db`,
      filters: [{ name: "DB", extensions: ["db"] }],
    });
    if (!filePath) return { success: false };
    try {
      db.pragma("wal_checkpoint(RESTART)");
      fs.copyFileSync(dbPath, filePath);
      return { success: true };
    } catch (e: any) {
      return { success: false, msg: e.message };
    }
  });
  ipcMain.handle("restore-database", async () => {
    const { filePaths } = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "DB", extensions: ["db"] }],
    });
    if (!filePaths?.[0]) return { success: false };
    try {
      db.close();
      fs.copyFileSync(filePaths[0], dbPath);
      app.relaunch();
      app.exit();
      return { success: true };
    } catch (e: any) {
      return { success: false, msg: e.message };
    }
  });

  // ==========================================
  //  SERVER EXPRESS UNTUK HP
  // ==========================================
  const server = express();
  server.use(cors());
  server.use(express.json({ limit: "50mb" }));
  const uploadsPath = path.join(process.env.APP_ROOT, "uploads");
  if (!fs.existsSync(uploadsPath))
    fs.mkdirSync(uploadsPath, { recursive: true });
  server.use("/uploads", express.static(uploadsPath));

  // --- KONEKSI HP KE OTAK AI ---
  server.post("/api/ask-ai", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt)
      return res.status(400).json({ success: false, error: "Prompt kosong" });
    const result = await processAskAi(prompt);
    res.json(result);
  });

  server.post("/api/ask-ai-image", async (req, res) => {
    const { base64 } = req.body;
    if (!base64)
      return res.status(400).json({ success: false, error: "Gambar kosong" });
    const result = await processAskAiImage(base64);
    res.json(result);
  });
  // -----------------------------

  server.get("/api/products", (_, res) => {
    try {
      res.json(db.prepare("SELECT * FROM products ORDER BY name ASC").all());
    } catch {
      res.status(500).json([]);
    }
  });
  server.get("/api/mobile-stats", (_, res) => {
    try {
      const r: any = db
        .prepare(
          `SELECT COUNT(*) as total_transaction, SUM(final_amount) as net_sales, SUM(total_profit) as total_profit FROM transactions WHERE DATE(payment_date) = DATE('now', 'localtime')`,
        )
        .get();
      res.json({
        total_transaction: r?.total_transaction || 0,
        net_sales: r?.net_sales || 0,
        total_profit: r?.total_profit || 0,
      });
    } catch {
      res.status(500).json({ net_sales: 0, total_profit: 0 });
    }
  });
  // --- FUNGSI CHECKOUT API (MODIFIKASI MESIN WAKTU) ---
  server.post("/api/checkout", (req, res) => {
    // Penanda di terminal PC biar kita tahu ini kode yang baru!
    console.log(">>> CHECKOUT MESIN WAKTU JALAN! TANGGAL:", req.body.date);

    try {
      const { items, total, discount, paymentMethod, date } = req.body;
      const transactionDate = date || new Date().toISOString();

      db.transaction(() => {
        // PERBAIKAN FINAL: Tanpa kolom type, category, dll. Murni schema database kasir!
        const insertTx = db.prepare(
          `INSERT INTO transactions (payment_date, total_amount, discount, final_amount, total_profit, payment_method) 
           VALUES (?, ?, ?, ?, ?, ?)`,
        );

        let totalProfit = 0;

        items.forEach((item: any) => {
          const profitPerItem = item.price - (item.cost_price || 0);
          totalProfit += profitPerItem * item.qty;
        });

        const finalAmount = total - discount;

        // Eksekusi insert utama
        const txResult = insertTx.run(
          transactionDate,
          total,
          discount,
          finalAmount,
          totalProfit,
          paymentMethod || "TUNAI",
        );

        const txId = txResult.lastInsertRowid;

        const insertItem = db.prepare(
          `INSERT INTO transaction_items (transaction_id, product_id, product_name, qty, price_at_transaction, cost_at_transaction) 
           VALUES (?, ?, ?, ?, ?, ?)`,
        );
        const updateStock = db.prepare(
          `UPDATE products SET stock = stock - ? WHERE id = ?`,
        );

        items.forEach((item: any) => {
          insertItem.run(
            txId,
            item.id || null,
            item.name,
            item.qty,
            item.price,
            item.price * item.qty,
          );
          if (item.id && !item.id.toString().startsWith("manual")) {
            updateStock.run(item.qty, item.id);
          }
        });
      })();

      res.json({ success: true });
    } catch (err: any) {
      console.error("ERROR CHECKOUT:", err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  });
  server.get("/api/transactions", (_, res) =>
    res.json(getCombinedFinanceReport()),
  );
  // --- API GRAFIK BULANAN UNTUK HP (100% AKURAT DENGAN PC) ---
  server.get("/api/monthly-chart", (_, res) => {
    try {
      const chartData: any[] = [];
      const today = new Date();
      // Tarik semua transaksi mentah
      const allTx = db
        .prepare(
          `SELECT payment_date, total_amount, (total_amount - total_profit) as total_cost FROM transactions`,
        )
        .all();

      // Siapkan 6 bulan terakhir
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label =
          d.toLocaleString("id-ID", { month: "short" }) +
          " '" +
          d.getFullYear().toString().slice(-2);

        let realRevenue = 0,
          realExpense = 0;

        allTx.forEach((row: any) => {
          const tDate = new Date(row.payment_date);
          if (!isNaN(tDate.getTime())) {
            const tKey = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, "0")}`;
            if (tKey === key) {
              realRevenue += row.total_amount;
              realExpense += row.total_cost;
            }
          }
        });

        // KUNCI RAHASIA: Ambil data editan manual/ledger seperti di PC
        const ledger: any = getMonthlyLedger(key);
        const adjRev = ledger ? ledger.revenue_adj : 0;
        const adjExp = ledger ? ledger.expense_adj : 0;

        chartData.push({
          key,
          label,
          revenue: realRevenue + adjRev,
          expense: realExpense + adjExp,
          profit: realRevenue + adjRev - (realExpense + adjExp),
          isManual: adjRev !== 0 || adjExp !== 0,
        });
      }
      res.json(chartData);
    } catch (error: any) {
      console.error("Gagal load grafik HP:", error);
      res.status(500).json({ error: error.message });
    }
  });
  server.post("/api/transactions", (req, res) =>
    res.json(addFinancialRecord(req.body)),
  );
  server.delete("/api/transactions/:id", (req, res) => {
    try {
      const idStr = req.params.id;
      if (idStr.toString().startsWith("TX-"))
        res.json(deleteTransaction(parseInt(idStr.replace("TX-", ""))));
      else res.json(deleteFinancialRecord(parseInt(idStr.replace("MAN-", ""))));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  server.put("/api/transactions/:id", (req, res) => {
    try {
      const idStr = req.params.id;
      const { itemName, gross, discount, profit, paymentMethod } = req.body;

      if (idStr.toString().startsWith("TX-")) {
        const id = parseInt(idStr.replace("TX-", ""));
        const finalAmount = Number(gross) - Number(discount);

        db.transaction(() => {
          db.prepare(
            `UPDATE transactions SET total_amount=?, discount=?, final_amount=?, total_profit=?, payment_method=? WHERE id=?`,
          ).run(gross, discount, finalAmount, profit, paymentMethod, id);
          db.prepare(
            `UPDATE transaction_items SET product_name=? WHERE transaction_id=?`,
          ).run(itemName, id);
        })();
        res.json({ success: true });
      } else if (idStr.toString().startsWith("MAN-")) {
        // [PERBAIKAN] Tabel pengeluaran tidak pakai payment_method!
        const id = parseInt(idStr.replace("MAN-", ""));
        db.prepare(
          `UPDATE financial_records SET description=?, amount=? WHERE id=?`,
        ).run(itemName, gross, id);
        res.json({ success: true });
      } else {
        res.status(400).json({ success: false, error: "ID tidak valid" });
      }
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  server.post("/api/product/save", (req, res) => {
    try {
      req.body.id ? updateProduct(req.body.id, req.body) : addProduct(req.body);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  server.delete("/api/product/:id", (req, res) => {
    try {
      res.json(deleteProduct(parseInt(req.params.id)));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  server.get("/api/missed-items", (_, res) =>
    res.json(
      db
        .prepare("SELECT * FROM missed_items ORDER BY last_requested DESC")
        .all(),
    ),
  );
  server.post("/api/missed-items", (req, res) => {
    try {
      const cleanName = req.body.name.trim();
      const exist: any = db
        .prepare(
          "SELECT id, count FROM missed_items WHERE name = ? COLLATE NOCASE",
        )
        .get(cleanName);
      if (exist)
        db.prepare(
          "UPDATE missed_items SET count = count + 1, last_requested = datetime('now', 'localtime') WHERE id = ?",
        ).run(exist.id);
      else
        db.prepare(
          "INSERT INTO missed_items (name, count, last_requested) VALUES (?, 1, datetime('now', 'localtime'))",
        ).run(cleanName);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  server.delete("/api/missed-items/:id", (req, res) => {
    try {
      db.prepare("DELETE FROM missed_items WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  server.get("/api/top-products", (req, res) => {
    try {
      const cat = (req.query.category as string) || "Semua";
      let q = `SELECT p.name, p.category, p.brand, p.stock as current_stock, SUM(ti.qty) as total_sold, SUM(ti.qty * ti.price_at_transaction) as total_revenue FROM transaction_items ti LEFT JOIN products p ON ti.product_id = p.id WHERE p.name IS NOT NULL`;
      const p = [];
      if (cat !== "Semua") {
        q += " AND p.category = ?";
        p.push(cat);
      }
      q += " GROUP BY ti.product_id ORDER BY total_sold DESC LIMIT 5";
      res.json(db.prepare(q).all(p));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  server.get("/api/categories", (_, res) => {
    try {
      const all: any = getProducts();
      res.json([...new Set(all.map((p: any) => p.category))].sort());
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  server.use(express.static(path.join(__dirname, "../dist")));
  server.get("/mobile", (_, res) =>
    res.sendFile(path.join(__dirname, "../dist/index.html")),
  );
  server.get("/", (_, res) =>
    res.sendFile(path.join(__dirname, "../dist/index.html")),
  );

  server.listen(PORT, "0.0.0.0", () => {
    const fullUrl = `http://${ip.address()}:${PORT}`;
    console.log(`🚀 SERVER HP AKTIF: ${fullUrl}`);
    win?.webContents.on("did-finish-load", () =>
      win?.webContents.send("server-ip", fullUrl),
    );
    win?.webContents.send("server-ip", fullUrl);
  });

  createWindow();
});
