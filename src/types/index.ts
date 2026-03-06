// ==========================================
//  A. DATA INTERFACES (Model Data)
// ==========================================

export interface Product {
  id: number;
  barcode: string;
  name: string;
  cost_price: number; // Harga Modal
  price: number; // Harga Jual
  stock: number;
  category?: string;
  item_number?: string;
  brand?: string;
  compatibility?: string;
  image_url?: string;
  created_at?: string;
}

export interface CartItem extends Product {
  qty: number | string;
  isManual?: boolean;
}

export type PaymentMethod = "TUNAI" | "QRIS";

export interface Transaction {
  id: number;
  payment_date: string;
  payment_method: PaymentMethod;
  items_summary: string;
  gross_total: number;
  discount: number;
  net_total: number;
  profit: number;
}

export interface DailyReport {
  total_transaction: number;
  gross_sales: number;
  total_discount: number;
  net_sales: number;
  total_profit: number;
  tunai_today: number;
  qris_today: number;
  is_manual?: boolean;
}

// Laporan Grafik & History
export interface PeriodReport {
  period_id: string; // Tgl (2024-02-20) atau Bulan (2024-02)
  label?: string;
  revenue: number;
  expense: number;
  profit: number;
  tunai?: number;
  qris?: number;
  isManual?: boolean; // Penanda jika data hasil adjustment
}

export interface TopProduct {
  category: string;
  name: string;
  brand: string;
  current_stock: number;
  total_sold: number;
  total_revenue: number;
}

// Barang Kosong / Missed Items
export interface MissedItem {
  id: number;
  name: string;
  count: number;
  last_requested: string;
}

// ==========================================
//  B. GLOBAL WINDOW API (Jembatan ke Electron)
// ==========================================

declare global {
  interface Window {
    api: {
      // 1. MANAJEMEN PRODUK
      fetchProducts: () => Promise<Product[]>;
      addProduct: (
        data: any,
      ) => Promise<{ success: boolean; id?: number; error?: string }>;
      editProduct: (
        id: number,
        data: any,
      ) => Promise<{ success: boolean; error?: string }>;
      // [UPDATE] Tambah error?: string
      deleteProduct: (id: number) => Promise<{
        success: boolean;
        reason?: string;
        msg?: string;
        error?: string;
      }>;

      // 2. TRANSAKSI (KASIR)
      createTransaction: (
        items: any[],
        total: number,
        discount: number,
        paymentMethod: string,
      ) => Promise<{ success: boolean; id?: number; error?: string }>;

      deleteTransaction: (
        id: number,
      ) => Promise<{ success: boolean; error?: string }>;
      updateTransaction: (
        id: number,
        data: any,
      ) => Promise<{ success: boolean; error?: string }>;
      resetTransactions: () => Promise<{ success: boolean; error?: string }>;

      // 3. LAPORAN & KEUANGAN
      fetchTodayReport: () => Promise<DailyReport>;
      fetchTodayTransactions: () => Promise<Transaction[]>;
      fetchFinanceSummary: () => Promise<any[]>; // Laporan Gabungan
      fetchDailyHistory: () => Promise<PeriodReport[]>;

      // [UPDATE] Tambah error?: string agar Laporan.tsx tidak merah
      addFinancialRecord: (
        data: any,
      ) => Promise<{ success: boolean; id?: number; error?: string }>;

      // 4. GRAFIK & ANALISA
      fetchMonthlyChart: () => Promise<PeriodReport[]>;
      fetchTopProducts: () => Promise<TopProduct[]>;

      // [UPDATE] Tambah error?: string
      saveMonthlyAdjustment: (data: {
        period: string;
        targetRevenue: number;
        targetExpense: number;
      }) => Promise<{ success: boolean; error?: string }>;
      // [UPDATE] Tambah error?: string
      resetMonthlyAdjustment: (
        period: string,
      ) => Promise<{ success: boolean; error?: string }>;

      // 5. MISSED ITEMS (Barang Kosong)
      fetchMissedItems: () => Promise<MissedItem[]>;
      // [UPDATE] Tambah error?: string
      addMissedItem: (
        name: string,
      ) => Promise<{ success: boolean; error?: string }>;
      // [UPDATE] Tambah error?: string
      deleteMissedItem: (
        id: number,
      ) => Promise<{ success: boolean; error?: string }>;

      // 6. SYSTEM
      syncToCloud: () => Promise<{ success: boolean; msg: string }>;
      backupDatabase: () => Promise<{ success: boolean; msg?: string }>;
      restoreDatabase: () => Promise<{ success: boolean; msg?: string }>;

      // AI
      askAI: (
        prompt: string,
      ) => Promise<{ success: boolean; text?: string; error?: string }>;

      askAIImage: (
        base64: string,
      ) => Promise<{
        success: boolean;
        text?: string;
        searchKeyword?: string;
        error?: string;
      }>;

      // Server IP Listener (Untuk QR Code)
      onServerIp: (callback: (ip: string) => void) => void;
    };
  }
}
