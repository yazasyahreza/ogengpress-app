import { contextBridge, ipcRenderer } from "electron";

console.log("🔥 PRELOAD LOADED: Ogeng Press System Ready! 🔥");

contextBridge.exposeInMainWorld("api", {
  // ==========================
  // 1. MANAJEMEN PRODUK (GUDANG)
  // ==========================
  fetchProducts: () => ipcRenderer.invoke("fetch-products"),
  addProduct: (product: any) => ipcRenderer.invoke("add-product", product),
  editProduct: (id: number, product: any) =>
    ipcRenderer.invoke("edit-product", id, product),
  deleteProduct: (id: number) => ipcRenderer.invoke("delete-product", id),

  // ==========================
  // 2. TRANSAKSI (KASIR)
  // ==========================
  // Menangani checkout barang database maupun input manual
  createTransaction: (
    items: any[],
    total: number,
    discount: number,
    paymentMethod: string,
  ) =>
    ipcRenderer.invoke(
      "create-transaction",
      items,
      total,
      discount,
      paymentMethod,
    ),

  deleteTransaction: (id: number) =>
    ipcRenderer.invoke("delete-transaction", id),
  updateTransaction: (id: number, data: any) =>
    ipcRenderer.invoke("update-transaction", id, data),

  // ==========================
  // 3. LAPORAN & KEUANGAN
  // ==========================
  fetchTodayReport: () => ipcRenderer.invoke("fetch-today-report"),
  fetchTodayTransactions: () => ipcRenderer.invoke("fetch-today-transactions"),
  fetchFinanceSummary: () => ipcRenderer.invoke("fetch-finance-summary"),
  fetchDailyHistory: () => ipcRenderer.invoke("fetch-daily-history"),

  // Mencatat pengeluaran operasional / pemasukan lain
  addFinancialRecord: (data: any) =>
    ipcRenderer.invoke("add-financial-record", data),

  // ==========================
  // 4. ANALISA & GRAFIK
  // ==========================
  fetchMonthlyChart: () => ipcRenderer.invoke("fetch-monthly-chart"),
  fetchTopProducts: () => ipcRenderer.invoke("fetch-top-products"),

  // Fitur Adjustment (Edit Grafik Manual)
  saveMonthlyAdjustment: (data: any) =>
    ipcRenderer.invoke("save-monthly-adjustment", data),
  resetMonthlyAdjustment: (period: string) =>
    ipcRenderer.invoke("reset-monthly-adjustment", period),

  // ==========================
  // 5. MISSED ITEMS (BARANG KOSONG)
  // ==========================
  fetchMissedItems: () => ipcRenderer.invoke("fetch-missed-items"),
  addMissedItem: (name: string) => ipcRenderer.invoke("add-missed-item", name),
  deleteMissedItem: (id: number) =>
    ipcRenderer.invoke("delete-missed-item", id),

  // ==========================
  // 6. SYSTEM & TOOLS
  // ==========================
  syncToCloud: () => ipcRenderer.invoke("sync-to-cloud"),
  backupDatabase: () => ipcRenderer.invoke("backup-database"),
  restoreDatabase: () => ipcRenderer.invoke("restore-database"),

  // AI
  askAI: (prompt: string) => ipcRenderer.invoke("ask-ai", prompt),
  askAIImage: (base64: string) => ipcRenderer.invoke("ask-ai-image", base64),

  // Listener IP Server (Untuk ditampilkan di QR Code HP)
  onServerIp: (callback: (ip: string) => void) =>
    ipcRenderer.on("server-ip", (_event, value) => callback(value)),
});
