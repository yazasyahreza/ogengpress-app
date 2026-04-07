import { useState, useEffect } from "react";
import { TopProduct, PaymentMethod } from "../types";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// --- UTILS ---
const formatRp = (num: number) => `Rp ${Number(num).toLocaleString("id-ID")}`;

// --- ASSETS: ICONS (Minified) ---
const Icons = {
  Calendar: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Receipt: () => (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
    </svg>
  ),
  Box: () => (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  ),
  Chart: () => (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
  ),
  Plus: () => (
    <svg
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      viewBox="0 0 24 24"
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  Cloud: () => (
    <svg
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
    >
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
    </svg>
  ),
  Trash: () => (
    <svg
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  ),
  Check: () => (
    <svg
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Alert: () => (
    <svg
      width="40"
      height="40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Edit: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Wallet: () => (
    <svg
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5zm-6 2h.01" />
    </svg>
  ),
  ArrowDown: () => (
    <svg
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <polyline points="19 12 12 19 5 12"></polyline>
    </svg>
  ),
  Trophy: () => (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M8 21h8m-4-9v9m0-9a5 5 0 0 1-5-5V3h10v4a5 5 0 0 1-5 5z" />
    </svg>
  ),
  Note: () => (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  ),
  WhatsApp: () => (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.305-.883-.653-1.48-1.459-1.653-1.756-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  ),
};

// --- SUB-COMPONENTS ---
const StatCard = ({ title, value, subtext, color, icon }: any) => (
  <div
    style={{
      background: "#1e293b",
      borderLeft: `4px solid ${color}`,
      borderRadius: "8px",
      padding: "15px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      border: "1px solid #334155",
    }}
  >
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            color: "#94a3b8",
            textTransform: "uppercase",
          }}
        >
          {title}
        </div>
        {icon && <div style={{ color: color, opacity: 0.8 }}>{icon}</div>}
      </div>
      <div
        style={{
          fontSize: "1.3rem",
          fontWeight: "800",
          color: "#f8fafc",
          marginTop: "5px",
        }}
      >
        {value}
      </div>
      {subtext && (
        <div
          style={{
            fontSize: "0.7rem",
            color: color,
            marginTop: "4px",
            fontWeight: "500",
          }}
        >
          {subtext}
        </div>
      )}
    </div>
  </div>
);

const ProChart = ({
  data,
  onBarClick,
}: {
  data: any[];
  onBarClick: (item: any) => void;
}) => {
  const handleItemClick = (data: any) => {
    if (data && data.payload) onBarClick(data.payload);
  };
  const formatCompact = (num: any) => {
    const n = Number(num);
    if (isNaN(n)) return "0";
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "jt";
    if (n >= 1000) return (n / 1000).toFixed(0) + "k";
    return n.toString();
  };

  return (
    <ResponsiveContainer width="100%" height="100%" style={{ outline: "none" }}>
      <ComposedChart
        data={data}
        margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
        onClick={(e: any) => {
          if (e && e.activePayload && e.activePayload[0])
            onBarClick(e.activePayload[0].payload);
        }}
        style={{ cursor: "pointer", outline: "none" }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#334155"
          vertical={false}
          opacity={0.3}
        />
        <XAxis
          dataKey="label"
          stroke="#94a3b8"
          fontSize={11}
          axisLine={{ stroke: "#475569" }}
          tickLine={false}
          dy={10}
        />
        <YAxis
          stroke="#64748b"
          fontSize={11}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatCompact}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0f172a",
            borderColor: "#334155",
            borderRadius: "8px",
            color: "#fff",
            outline: "none",
          }}
          formatter={(value: any) => formatRp(value)}
          cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
        />
        <Legend
          verticalAlign="top"
          height={36}
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ top: 0, fontSize: "12px", opacity: 0.8 }}
        />
        <Bar
          dataKey="revenue"
          name="Omset"
          fill="#3b82f6"
          barSize={20}
          radius={[4, 4, 0, 0]}
          onClick={handleItemClick}
        />
        <Bar
          dataKey="expense"
          name="Modal"
          fill="#ec4899"
          barSize={20}
          radius={[4, 4, 0, 0]}
          onClick={handleItemClick}
        />
        <Line
          type="monotone"
          dataKey="profit"
          name="Profit"
          stroke="#fbbf24"
          strokeWidth={2}
          dot={{ r: 4, fill: "#1e293b", stroke: "#fbbf24", strokeWidth: 2 }}
          activeDot={{ r: 6, stroke: "none", onClick: handleItemClick }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default function Laporan() {
  const [mode, setMode] = useState<"transaction" | "products" | "chart">(
    "transaction",
  );

  const [selectedDate, setSelectedDate] = useState(() => {
    const savedDate = localStorage.getItem("active_date");
    if (savedDate) return savedDate;
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });

  const [combinedRecords, setCombinedRecords] = useState<any[]>([]);
  const [stats, setStats] = useState({
    count: 0,
    gross: 0,
    discount: 0,
    net: 0,
    profit: 0,
    expense: 0,
    cashBalance: 0,
  });
  const [missedItems, setMissedItems] = useState<any[]>([]);
  const [newMissedItem, setNewMissedItem] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [selectedRankCategory, setSelectedRankCategory] =
    useState<string>("Semua");
  const [isSyncing, setIsSyncing] = useState(false);

  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<
    string | number | null
  >(null);
  const [showChartEditModal, setShowChartEditModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [showDeleteMissedModal, setShowDeleteMissedModal] = useState(false);
  const [missedItemToDelete, setMissedItemToDelete] = useState<number | null>(
    null,
  );

  const [chartForm, setChartForm] = useState({
    key: "",
    label: "",
    revenue: 0,
    expense: 0,
    isManual: false,
  });
  const [editItemForm, setEditItemForm] = useState({
    id: "" as string | number,
    name: "",
    gross: "" as string | number,
    discount: "" as string | number,
    profit: "" as string | number,
    payment: "TUNAI" as PaymentMethod,
  });
  const [manualForm, setManualForm] = useState({
    name: "",
    gross: "",
    payment: "TUNAI" as PaymentMethod,
  });
  const [toast, setToast] = useState<{
    show: boolean;
    msg: string;
    type: "success" | "error";
  }>({ show: false, msg: "", type: "success" });

  useEffect(() => {
    loadData();
  }, [mode, selectedDate]);

  const loadData = async () => {
    try {
      if (mode === "transaction") {
        const allData = await window.api.fetchFinanceSummary();
        const todayData = Array.isArray(allData)
          ? allData.filter((r: any) => r.date.startsWith(selectedDate))
          : [];
        setCombinedRecords(todayData);

        const s = {
          count: 0,
          gross: 0,
          discount: 0,
          net: 0,
          profit: 0,
          expense: 0,
          cashBalance: 0,
        };
        let grossProfitFromSales = 0;

        todayData.forEach((r: any) => {
          if (r.type === "MASUK") {
            s.count++;
            s.gross += r.gross_amount || r.amount;
            s.discount += r.discount || 0;
            s.net += r.amount;
            grossProfitFromSales += r.profit || 0;
          } else {
            s.expense += r.amount;
          }
        });
        s.profit = grossProfitFromSales - s.expense;
        s.cashBalance = s.net - s.expense;
        setStats(s);
      } else if (mode === "products") {
        const missed = await window.api.fetchMissedItems();
        setMissedItems(missed || []);
        const tops = await window.api.fetchTopProducts();
        setTopProducts(tops || []);
      } else if (mode === "chart") {
        const charts = await window.api.fetchMonthlyChart();
        setChartData(charts || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const showNotification = (
    msg: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ show: true, msg, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // ✨ JALUR KHUSUS WA MINGGUAN (ANTI-LIMIT) ✨
  const handleKirimWA = async () => {
    try {
      if (typeof window.api.fetchWeeklyStats !== "function") {
        showNotification(
          "Sistem WA belum terhubung ke Database! Restart terminal.",
          "error",
        );
        return;
      }

      showNotification("Menarik data performa bengkel...", "success");

      const allProducts = await window.api.fetchProducts();
      const missedData = await window.api.fetchMissedItems();
      const lowStock = allProducts.filter((p: any) => p.stock <= 3);

      // ✨ HITUNG TANGGAL MINGGU INI & MINGGU LALU ✨
      const [y, m, d] = selectedDate.split("-").map(Number);
      const targetDate = new Date(y, m - 1, d);

      const dayOfWeek = targetDate.getDay();
      const offsetToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      // -- MINGGU INI (Senin - Minggu)
      const monday = new Date(y, m - 1, d - offsetToMonday);
      const sunday = new Date(y, m - 1, d - offsetToMonday + 6);

      const startStr = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
      const endStr = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, "0")}-${String(sunday.getDate()).padStart(2, "0")}`;

      // -- MINGGU LALU (Senin - Minggu sebelumnya)
      const lastMonday = new Date(y, m - 1, d - offsetToMonday - 7);
      const lastSunday = new Date(y, m - 1, d - offsetToMonday - 1);

      const lastStartStr = `${lastMonday.getFullYear()}-${String(lastMonday.getMonth() + 1).padStart(2, "0")}-${String(lastMonday.getDate()).padStart(2, "0")}`;
      const lastEndStr = `${lastSunday.getFullYear()}-${String(lastSunday.getMonth() + 1).padStart(2, "0")}-${String(lastSunday.getDate()).padStart(2, "0")}`;

      // ✨ SEDOT DATA 2 MINGGU SEKALIGUS DARI DATABASE
      const weekly = await window.api.fetchWeeklyStats(startStr, endStr);
      const lastWeekly = await window.api.fetchWeeklyStats(
        lastStartStr,
        lastEndStr,
      );

      if (!weekly.success || !lastWeekly.success)
        throw new Error("Gagal mengambil data SQL");

      // Rekap Minggu Ini
      const weekOmset = weekly.gross || 0;
      const weekNetProfit = (weekly.profit || 0) - (weekly.expense || 0);

      // Rekap Minggu Lalu
      const lastWeekOmset = lastWeekly.gross || 0;
      const lastWeekNetProfit =
        (lastWeekly.profit || 0) - (lastWeekly.expense || 0);

      // Format Teks Tanggal Indo
      const tglIndo = targetDate.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const tglSeninIndo = monday.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
      const tglMingguIndo = sunday.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const tglSeninLaluIndo = lastMonday.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
      const tglMingguLaluIndo = lastSunday.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      // ✨ MERAKIT PESAN WA SUPER LENGKAP
      let text = `📊 *LAPORAN OGENG PRESS* 📊\n`;
      text += `📅 Harian: ${tglIndo}\n\n`;

      text += `💰 *RINGKASAN HARI INI*\n`;
      text += `- Total Transaksi: ${stats.count}\n`;
      text += `- Omset Kotor: ${formatRp(stats.gross)}\n`;
      text += `- Pengeluaran: ${formatRp(stats.expense)}\n`;
      text += `- Laba Bersih: ${formatRp(stats.profit)}\n`;
      text += `- Uang di Laci: *${formatRp(stats.cashBalance)}*\n\n`;

      text += `🗓️ *MINGGU INI*\n`;
      text += `_(${tglSeninIndo} - ${tglMingguIndo})_\n`;
      text += `- Total Omset: ${formatRp(weekOmset)}\n`;
      text += `- Laba Bersih: *${formatRp(weekNetProfit)}*\n\n`;

      text += `⏮️ *MINGGU LALU*\n`;
      text += `_(${tglSeninLaluIndo} - ${tglMingguLaluIndo})_\n`;
      text += `- Total Omset: ${formatRp(lastWeekOmset)}\n`;
      text += `- Laba Bersih: *${formatRp(lastWeekNetProfit)}*\n\n`;

      // Hitung Selisih/Tren Performa
      let selisihOmset = weekOmset - lastWeekOmset;
      let trenText =
        selisihOmset >= 0
          ? `📈 *NAIK* ${formatRp(selisihOmset)}`
          : `📉 *TURUN* ${formatRp(Math.abs(selisihOmset))}`;
      text += `📊 *TREN OMSET:* ${trenText}\n\n`;

      if (lowStock.length > 0) {
        text += `⚠️ *STOK MENIPIS (SEGERA KULAKAN)*\n`;
        lowStock.slice(0, 15).forEach((p: any) => {
          text += `- ${p.name} (Sisa: ${p.stock})\n`;
        });
        text += `\n`;
      }

      if (missedData && missedData.length > 0) {
        text += `📝 *BARANG DICARI PELANGGAN (KOSONG)*\n`;
        missedData.slice(0, 10).forEach((m: any) => {
          text += `- ${m.name} (${m.count}x dicari)\n`;
        });
        text += `\n`;
      }

      text += `_Pesan ini dikirim otomatis oleh Sistem_ 🤖`;

      const noWA = "6285150616368"; // GANTI DENGAN NOMOR WA AYAH BOS
      const waURL = `https://wa.me/${noWA}?text=${encodeURIComponent(text)}`;
      window.open(waURL, "_blank");

      showNotification("Membuka WhatsApp...", "success");
    } catch (err: any) {
      console.error("WA Error:", err);
      showNotification(err.message || "Gagal membuat laporan WA", "error");
    }
  };

  const handleAddMissedItem = async () => {
    if (!newMissedItem.trim()) return;
    try {
      const res = await window.api.addMissedItem(newMissedItem);
      if (res.success) {
        setNewMissedItem("");
        loadData();
        showNotification("Dicatat ke buku permintaan!");
      }
    } catch (e) {
      alert("Gagal catat");
    }
  };

  const requestDeleteMissedItem = (id: number) => {
    setMissedItemToDelete(id);
    setShowDeleteMissedModal(true);
  };
  const confirmDeleteMissedItem = async () => {
    if (missedItemToDelete === null) return;
    await window.api.deleteMissedItem(missedItemToDelete);
    loadData();
    setShowDeleteMissedModal(false);
    setMissedItemToDelete(null);
  };

  const confirmSync = async () => {
    setIsSyncing(true);
    try {
      const res = await window.api.syncToCloud();
      if (res.success) {
        showNotification("Laporan terkirim!", "success");
        setShowSyncModal(false);
      } else {
        showNotification("Gagal Sync: " + res.msg, "error");
        setShowSyncModal(false);
      }
    } catch (err) {
      showNotification("Kesalahan sistem", "error");
      setShowSyncModal(false);
    } finally {
      setIsSyncing(false);
    }
  };

  const submitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.name || !manualForm.gross)
      return alert("Keterangan & Nominal Wajib diisi!");
    try {
      const payload = {
        date: `${selectedDate}T${new Date().toISOString().split("T")[1]}`,
        type: "KELUAR",
        category: "PENGELUARAN",
        description: manualForm.name,
        amount: Number(manualForm.gross),
        payment_method: manualForm.payment,
      };
      const res = await window.api.addFinancialRecord(payload);
      if (res && res.success) {
        showNotification("Pengeluaran Disimpan!");
        setShowManualModal(false);
        setManualForm({ name: "", gross: "", payment: "TUNAI" });
        loadData();
        window.dispatchEvent(new Event("data-changed"));
      } else {
        alert("Gagal: " + (res.error || "Unknown Error"));
      }
    } catch (err) {
      alert("Error Sistem");
    }
  };

  const requestDeleteTransaction = (id: string | number) => {
    setTransactionToDelete(id);
    setShowDeleteModal(true);
  };
  const confirmDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    try {
      const res = await window.api.deleteTransaction(
        transactionToDelete as number,
      );
      if (res.success) {
        showNotification("Data dihapus", "success");
        loadData();
        window.dispatchEvent(new Event("data-changed"));
      } else {
        showNotification("Gagal: " + res.error, "error");
      }
    } catch (error) {
      showNotification("Kesalahan sistem", "error");
    } finally {
      setShowDeleteModal(false);
      setTransactionToDelete(null);
    }
  };

  const handleOpenEditItem = (t: any) => {
    if (
      typeof t.unique_id === "string" &&
      (t.unique_id.startsWith("TX-") || t.unique_id.startsWith("MAN-"))
    ) {
      let cleanName = t.unique_id.startsWith("TX-")
        ? t.items_summary || "Transaksi Kasir"
        : t.description || "Pengeluaran";
      cleanName = cleanName
        .replace(/\s*\(\+ \d+ lainnya\)/g, "")
        .replace(/\s*\(x\d+\)/g, "")
        .replace(/,\s*$/, "")
        .trim();
      setEditItemForm({
        id: t.unique_id,
        name: cleanName,
        gross: (t.gross_amount ?? t.amount ?? 0).toString(),
        discount: (t.discount ?? 0).toString(),
        profit: (t.profit ?? 0).toString(),
        payment: t.payment_method || "TUNAI",
      });
      setShowEditItemModal(true);
    } else {
      alert("Data ini tidak bisa diedit.");
    }
  };

  const saveEditedItem = async () => {
    try {
      const payload = {
        itemName: editItemForm.name,
        gross: Number(editItemForm.gross),
        discount: Number(editItemForm.discount) || 0,
        profit: Number(editItemForm.profit) || 0,
        paymentMethod: editItemForm.payment,
      };
      const res = await window.api.updateTransaction(
        editItemForm.id as number,
        payload,
      );
      if (res.success) {
        showNotification("Data diperbarui!", "success");
        setShowEditItemModal(false);
        loadData();
        window.dispatchEvent(new Event("data-changed"));
      } else {
        showNotification("Gagal update: " + res.error, "error");
      }
    } catch (e) {
      showNotification("Error sistem", "error");
    }
  };

  const handleChartClick = (data: any) => {
    if (data) {
      setChartForm({
        key: data.key,
        label: data.label,
        revenue: data.revenue,
        expense: data.expense,
        isManual: data.isManual || false,
      });
      setShowChartEditModal(true);
    }
  };

  const saveChartAdjustment = async () => {
    try {
      const res = await window.api.saveMonthlyAdjustment({
        period: chartForm.key,
        targetRevenue: Number(chartForm.revenue),
        targetExpense: Number(chartForm.expense),
      });
      if (res.success) {
        showNotification("Grafik diperbarui!", "success");
        setShowChartEditModal(false);
        loadData();
      } else {
        showNotification("Gagal: " + res.error, "error");
      }
    } catch (e) {
      showNotification("Error sistem", "error");
    }
  };

  const rankCategories = [
    "Semua",
    ...new Set(
      topProducts.map((p) => p.category).filter((c) => c && c.trim() !== ""),
    ),
  ].sort();
  let displayedRankProducts = topProducts;
  if (selectedRankCategory !== "Semua") {
    displayedRankProducts = topProducts.filter(
      (p) => p.category === selectedRankCategory,
    );
  }
  const finalRankData = displayedRankProducts.slice(0, 5);

  return (
    <div
      className="main-grid"
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        padding: "30px",
        height: "100%",
        overflow: "hidden",
        background: "#0f172a",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 6px; } .custom-scroll::-webkit-scrollbar-thumb { background: #334155; borderRadius: 4px; }
        .tab-btn { background: transparent; border: none; padding: 10px 20px; color: #94a3b8; font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; font-size: 0.9rem; }
        .tab-btn.active { color: #fbbf24; border-bottom: 2px solid #fbbf24; }
        .action-btn { border: none; border-radius: 8px; padding: 10px 16px; font-weight: 600; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .action-btn.primary { background: #3b82f6; color: white; }
        .action-btn.secondary { background: transparent; border: 1px solid #334155; color: #cbd5e1; }
        .action-btn.danger-ghost { background: transparent; color: #ef4444; opacity: 0.7; padding: 10px; }
        .laporan-row:hover { background-color: rgba(255, 255, 255, 0.05) !important; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(2px); }
        .input-manual { width: 100%; padding: 10px; border-radius: 6px; background: #0f172a; border: 1px solid #475569; color: white; outline: none; margin-bottom: 10px; font-size: 0.9rem; }
        .recharts-wrapper, .recharts-surface, .recharts-wrapper * { outline: none !important; }
        svg:focus, g:focus, path:focus, rect:focus { outline: none !important; }
      `}</style>

      {/* HEADER UTAMA */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          marginBottom: "10px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color: "#f8fafc",
              fontSize: "1.8rem",
              letterSpacing: "-0.5px",
            }}
          >
            Laporan & Analisis
          </h1>
          <p
            style={{
              margin: "5px 0 0 0",
              color: "#64748b",
              fontSize: "0.95rem",
            }}
          >
            Ringkasan performa toko Anda hari ini.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {mode === "transaction" && (
            <>
              <div
                onClick={(e) => {
                  try {
                    e.currentTarget.querySelector("input")?.showPicker();
                  } catch (err) {}
                }}
                onDoubleClick={() => {
                  const d = new Date();
                  const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                  setSelectedDate(todayStr);
                  localStorage.removeItem("active_date");
                  showNotification("Kembali ke Hari Ini");
                }}
                className="action-btn"
                title="Klik 1x Pilih Tanggal | Klik 2x Reset Hari Ini"
                style={{
                  background: "rgba(59, 130, 246, 0.15)",
                  border: "1px solid rgba(59, 130, 246, 0.4)",
                  color: "#60a5fa",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  userSelect: "none",
                }}
              >
                <Icons.Calendar />
                <span>
                  {new Date(selectedDate).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setSelectedDate(newDate);
                    const d = new Date();
                    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                    if (newDate === todayStr) {
                      localStorage.removeItem("active_date");
                    } else {
                      localStorage.setItem("active_date", newDate);
                    }
                  }}
                  style={{
                    position: "absolute",
                    width: "0",
                    height: "0",
                    opacity: 0,
                    colorScheme: "dark",
                  }}
                />
              </div>

              {/* ✨ TOMBOL KIRIM WA ✨ */}
              <button
                className="action-btn"
                onClick={handleKirimWA}
                style={{
                  background: "rgba(34, 197, 94, 0.15)",
                  border: "1px solid rgba(34, 197, 94, 0.4)",
                  color: "#22c55e",
                }}
                title="Kirim Rekap ke WhatsApp"
              >
                <Icons.WhatsApp /> Kirim WA
              </button>

              <button
                className="action-btn"
                onClick={() => setShowManualModal(true)}
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  color: "#f87171",
                }}
              >
                <Icons.Plus /> Catat Pengeluaran
              </button>
            </>
          )}
        </div>
      </div>

      <div
        style={{
          borderBottom: "1px solid #334155",
          marginBottom: "25px",
          display: "flex",
          gap: "10px",
        }}
      >
        <button
          onClick={() => setMode("transaction")}
          className={`tab-btn ${mode === "transaction" ? "active" : ""}`}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Icons.Receipt /> Transaksi
          </span>
        </button>
        <button
          onClick={() => setMode("products")}
          className={`tab-btn ${mode === "products" ? "active" : ""}`}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Icons.Box /> Pergerakan Produk
          </span>
        </button>
        <button
          onClick={() => setMode("chart")}
          className={`tab-btn ${mode === "chart" ? "active" : ""}`}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Icons.Chart /> Grafik Bulanan
          </span>
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {mode === "transaction" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              gap: "25px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr) 1.2fr",
                gap: "15px",
              }}
            >
              <StatCard
                title="Total Transaksi"
                value={stats.count}
                color="#94a3b8"
              />
              <StatCard
                title="Omset Bersih"
                value={formatRp(stats.net)}
                subtext="Total Pemasukan"
                color="#10b981"
              />
              <StatCard
                title="Laba Bersih"
                value={formatRp(stats.profit)}
                subtext="Keuntungan Real"
                color="#fbbf24"
              />
              <StatCard
                title="PENGELUARAN"
                value={`- ${formatRp(stats.expense)}`}
                subtext="Uang Keluar"
                color="#ef4444"
                icon={<Icons.ArrowDown />}
              />

              <div
                style={{
                  background: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid #3b82f6",
                  borderRadius: "8px",
                  padding: "15px",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: "#60a5fa",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    SISA SALDO KAS
                  </div>
                  <div style={{ color: "#60a5fa" }}>
                    <Icons.Wallet />
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: "800",
                    color: "#93c5fd",
                    marginTop: "5px",
                  }}
                >
                  {formatRp(stats.cashBalance)}
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#60a5fa",
                    marginTop: "4px",
                    fontWeight: "500",
                  }}
                >
                  Real Cash di Laci
                </div>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                background: "#1e293b",
                borderRadius: "12px",
                border: "1px solid #334155",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  padding: "15px 20px",
                  background: "rgba(15, 23, 42, 0.5)",
                  borderBottom: "1px solid #334155",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "0.95rem",
                    color: "#f8fafc",
                    fontWeight: "600",
                  }}
                >
                  Rincian Transaksi (Masuk & Keluar)
                </h3>
              </div>
              <div
                className="custom-scroll"
                style={{ overflowY: "auto", flex: 1 }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead
                    style={{
                      position: "sticky",
                      top: 0,
                      background: "#1e293b",
                      zIndex: 10,
                    }}
                  >
                    <tr>
                      {[
                        "Jam",
                        "Tipe",
                        "Keterangan / Item",
                        "Nominal",
                        "Laba",
                        "Aksi",
                      ].map((h, i) => (
                        <th
                          key={i}
                          style={{
                            padding: "12px 20px",
                            textAlign: i > 2 && i < 5 ? "right" : "left",
                            fontSize: "0.75rem",
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            borderBottom: "1px solid #334155",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {combinedRecords.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            padding: "50px",
                            textAlign: "center",
                            color: "#64748b",
                          }}
                        >
                          Belum ada data transaksi hari ini.
                        </td>
                      </tr>
                    ) : (
                      combinedRecords.map((t, i) => (
                        <tr
                          key={i}
                          className="laporan-row"
                          style={{ borderBottom: "1px solid #334155" }}
                        >
                          {/* ✨ PERBAIKAN: FORMAT JAM AGAR TIDAK INVALID DATE ✨ */}
                          <td
                            style={{
                              padding: "12px 20px",
                              color: "#cbd5e1",
                              fontSize: "0.85rem",
                            }}
                          >
                            {(() => {
                              if (!t.date) return "-";
                              const safeStr = t.date.replace(" ", "T");
                              const d = new Date(safeStr);
                              if (isNaN(d.getTime())) {
                                const timePart = t.date.split(" ")[1];
                                return timePart
                                  ? timePart.substring(0, 5).replace(":", ".")
                                  : "-";
                              }
                              return d
                                .toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                                .replace(":", ".");
                            })()}
                          </td>

                          <td style={{ padding: "12px 20px" }}>
                            <span
                              style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontSize: "0.7rem",
                                fontWeight: "bold",
                                background:
                                  t.type === "MASUK"
                                    ? "rgba(16, 185, 129, 0.1)"
                                    : "rgba(239, 68, 68, 0.1)",
                                color:
                                  t.type === "MASUK" ? "#10b981" : "#ef4444",
                              }}
                            >
                              {t.type === "MASUK" ? "PENJUALAN" : "PENGELUARAN"}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "12px 20px",
                              color: "#e2e8f0",
                              fontSize: "0.85rem",
                            }}
                          >
                            <div style={{ fontWeight: "bold" }}>
                              {t.description}
                            </div>
                            {t.items_summary && (
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  color: "#94a3b8",
                                }}
                              >
                                {t.items_summary}
                              </div>
                            )}
                          </td>
                          <td
                            style={{
                              padding: "12px 20px",
                              textAlign: "right",
                              color: t.type === "MASUK" ? "#3b82f6" : "#ef4444",
                              fontWeight: "bold",
                              fontSize: "0.9rem",
                            }}
                          >
                            {t.type === "MASUK" ? "+" : "-"}{" "}
                            {formatRp(t.amount)}
                          </td>
                          <td
                            style={{
                              padding: "12px 20px",
                              textAlign: "right",
                              color: "#fbbf24",
                              fontWeight: "bold",
                              fontSize: "0.85rem",
                            }}
                          >
                            {t.profit ? formatRp(t.profit) : "-"}
                          </td>
                          <td
                            style={{
                              padding: "12px 20px",
                              textAlign: "center",
                              display: "flex",
                              gap: "8px",
                              justifyContent: "center",
                            }}
                          >
                            {t.unique_id &&
                              (t.unique_id.startsWith("TX-") ||
                                t.unique_id.startsWith("MAN-")) && (
                                <button
                                  onClick={() => handleOpenEditItem(t)}
                                  title="Edit"
                                  style={{
                                    background: "rgba(59, 130, 246, 0.1)",
                                    border: "none",
                                    color: "#3b82f6",
                                    padding: "6px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                  }}
                                >
                                  <Icons.Edit />
                                </button>
                              )}
                            {t.unique_id &&
                              (t.unique_id.startsWith("TX-") ||
                                t.unique_id.startsWith("MAN-")) && (
                                <button
                                  onClick={() =>
                                    requestDeleteTransaction(t.unique_id)
                                  }
                                  title="Hapus"
                                  style={{
                                    background: "rgba(239, 68, 68, 0.1)",
                                    border: "none",
                                    color: "#ef4444",
                                    padding: "6px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    opacity: 1,
                                  }}
                                >
                                  <Icons.Trash />
                                </button>
                              )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- FITUR PERGERAKAN PRODUK --- */}
        {mode === "products" && (
          <div
            style={{
              flex: 1,
              display: "flex",
              gap: "20px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                flex: 1,
                background: "#1e293b",
                borderRadius: "12px",
                border: "1px solid #334155",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  padding: "15px 20px",
                  borderBottom: "1px solid #334155",
                  background: "rgba(15, 23, 42, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ color: "#ec4899" }}>
                    <Icons.Note />
                  </div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "0.95rem",
                      color: "#f8fafc",
                      fontWeight: "600",
                    }}
                  >
                    Permintaan Pelanggan / Stok Kosong
                  </h3>
                </div>
              </div>
              <div
                style={{
                  padding: 15,
                  borderBottom: "1px solid #334155",
                  display: "flex",
                  gap: 10,
                }}
              >
                <input
                  placeholder="Ketik nama barang..."
                  value={newMissedItem}
                  onChange={(e) => setNewMissedItem(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddMissedItem()}
                  style={{
                    flex: 1,
                    padding: "10px 15px",
                    borderRadius: 8,
                    border: "1px solid #475569",
                    background: "#0f172a",
                    color: "white",
                  }}
                />
                <button
                  onClick={handleAddMissedItem}
                  style={{
                    padding: "10px 20px",
                    background: "#ec4899",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Catat
                </button>
              </div>
              <div
                className="custom-scroll"
                style={{ overflowY: "auto", flex: 1 }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead
                    style={{
                      position: "sticky",
                      top: 0,
                      background: "#1e293b",
                      zIndex: 5,
                    }}
                  >
                    <tr>
                      {["Nama Barang Dicari", "Tanggal", "Aksi"].map((h, i) => (
                        <th
                          key={i}
                          style={{
                            textAlign: i === 0 ? "left" : "center",
                            padding: "12px 20px",
                            color: "#94a3b8",
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {missedItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          style={{
                            padding: "30px",
                            textAlign: "center",
                            color: "#64748b",
                            fontSize: "0.85rem",
                          }}
                        >
                          Belum ada permintaan barang kosong.
                        </td>
                      </tr>
                    ) : (
                      missedItems.map((item, i) => (
                        <tr
                          key={i}
                          style={{ borderBottom: "1px solid #334155" }}
                        >
                          <td
                            style={{
                              padding: "12px 20px",
                              color: "#fff",
                              fontSize: "0.9rem",
                              fontWeight: "500",
                            }}
                          >
                            {item.name}
                          </td>
                          <td
                            style={{
                              padding: "12px 20px",
                              textAlign: "center",
                              color: "#fbbf24",
                              fontSize: "0.85rem",
                              fontWeight: "bold",
                            }}
                          >
                            {new Date(item.last_requested).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td
                            style={{
                              padding: "12px 20px",
                              textAlign: "center",
                            }}
                          >
                            <button
                              onClick={() => requestDeleteMissedItem(item.id)}
                              title="Sudah Dibelanjakan"
                              style={{
                                background: "rgba(16, 185, 129, 0.1)",
                                border: "none",
                                color: "#10b981",
                                padding: "6px",
                                borderRadius: "6px",
                                cursor: "pointer",
                              }}
                            >
                              <Icons.Check />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                background: "#1e293b",
                borderRadius: "12px",
                border: "1px solid #334155",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  padding: "12px 20px",
                  borderBottom: "1px solid #334155",
                  background: "rgba(15, 23, 42, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <div style={{ color: "#fbbf24" }}>
                    <Icons.Trophy />
                  </div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "0.95rem",
                      color: "#f8fafc",
                      fontWeight: "600",
                    }}
                  >
                    Top 5 Terlaris
                  </h3>
                </div>
                <select
                  value={selectedRankCategory}
                  onChange={(e) => setSelectedRankCategory(e.target.value)}
                  style={{
                    background: "#0f172a",
                    border: "1px solid #475569",
                    color: "#cbd5e1",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="Semua">Semua Kategori</option>
                  {rankCategories
                    .filter((c) => c !== "Semua")
                    .map((cat, i) => (
                      <option key={i} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>
              <div
                className="custom-scroll"
                style={{ overflowY: "auto", flex: 1 }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead
                    style={{
                      position: "sticky",
                      top: 0,
                      background: "#1e293b",
                      zIndex: 5,
                    }}
                  >
                    <tr>
                      <th
                        style={{
                          textAlign: "center",
                          padding: "12px 20px",
                          color: "#94a3b8",
                          fontSize: "0.75rem",
                          width: "40px",
                        }}
                      >
                        #
                      </th>
                      {["Nama Barang", "Terjual", "Omset"].map((h, i) => (
                        <th
                          key={i}
                          style={{
                            textAlign: i === 0 ? "left" : "right",
                            padding: "12px 20px",
                            color: "#94a3b8",
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {finalRankData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          style={{
                            padding: "30px",
                            textAlign: "center",
                            color: "#64748b",
                            fontSize: "0.85rem",
                          }}
                        >
                          Belum ada penjualan kategori ini.
                        </td>
                      </tr>
                    ) : (
                      finalRankData.map((p, i) => (
                        <tr
                          key={i}
                          style={{
                            borderBottom: "1px solid #334155",
                            background:
                              i === 0
                                ? "rgba(251, 191, 36, 0.05)"
                                : "transparent",
                          }}
                        >
                          <td
                            style={{
                              padding: "12px 20px",
                              textAlign: "center",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                width: "22px",
                                height: "22px",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "50%",
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                background:
                                  i === 0
                                    ? "#fbbf24"
                                    : i === 1
                                      ? "#94a3b8"
                                      : i === 2
                                        ? "#b45309"
                                        : "#334155",
                                color: i < 3 ? "#000" : "#cbd5e1",
                              }}
                            >
                              {i + 1}
                            </span>
                          </td>
                          <td style={{ padding: "12px 20px" }}>
                            <div
                              style={{
                                color: "#f8fafc",
                                fontSize: "0.9rem",
                                fontWeight: "500",
                              }}
                            >
                              {p.name}
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "#64748b",
                                marginTop: "2px",
                              }}
                            >
                              {p.brand && (
                                <span style={{ marginRight: "8px" }}>
                                  {p.brand}
                                </span>
                              )}
                              Stok:{" "}
                              <span
                                style={{
                                  color:
                                    p.current_stock < 5 ? "#ef4444" : "#10b981",
                                  fontWeight: "bold",
                                }}
                              >
                                {p.current_stock}
                              </span>
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "12px 20px",
                              textAlign: "right",
                              color: "#3b82f6",
                              fontWeight: "bold",
                              fontSize: "0.9rem",
                            }}
                          >
                            {p.total_sold}
                          </td>
                          <td
                            style={{
                              padding: "12px 20px",
                              textAlign: "right",
                              color: "#fbbf24",
                              fontWeight: "600",
                              fontSize: "0.85rem",
                            }}
                          >
                            {formatRp(p.total_revenue)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {mode === "chart" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ProChart data={chartData} onBarClick={handleChartClick} />
            </div>
            <p
              style={{
                textAlign: "center",
                color: "#64748b",
                fontSize: "0.8rem",
                marginTop: "10px",
              }}
            >
              *Klik pada batang grafik untuk mengedit data bulan tersebut secara
              manual.
            </p>
          </div>
        )}
      </div>

      {toast.show && (
        <div
          style={{
            position: "fixed",
            bottom: 30,
            right: 30,
            background: "#1e293b",
            color: "#fff",
            padding: "15px 25px",
            borderRadius: 10,
            border: "1px solid #334155",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            display: "flex",
            gap: 10,
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          {toast.type === "success" ? (
            <div style={{ color: "#10b981" }}>
              <Icons.Check />
            </div>
          ) : (
            <div style={{ color: "#ef4444" }}>
              <Icons.Alert />
            </div>
          )}
          <div>
            <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
              {toast.type === "success" ? "SUKSES" : "ERROR"}
            </div>
            <div style={{ fontWeight: 600 }}>{toast.msg}</div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {showManualModal && (
        <div className="modal-overlay">
          <div
            style={{
              background: "#1e293b",
              padding: "40px",
              borderRadius: 20,
              width: 450,
              border: "1px solid #334155",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
            }}
          >
            <h2
              style={{
                margin: "0 0 10px 0",
                color: "#ef4444",
                fontSize: "1.4rem",
                textAlign: "center",
                fontWeight: "700",
              }}
            >
              Catat Pengeluaran
            </h2>
            <p
              style={{
                textAlign: "center",
                color: "#94a3b8",
                marginBottom: "30px",
                fontSize: "0.9rem",
              }}
            >
              Masukkan detail biaya operasional toko.
            </p>
            <form
              onSubmit={submitExpense}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                <label
                  style={{
                    color: "#cbd5e1",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                  }}
                >
                  Keterangan Pengeluaran
                </label>
                <input
                  required
                  className="input-manual"
                  placeholder="Contoh: Bayar Listrik, Beli Bensin"
                  value={manualForm.name}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, name: e.target.value })
                  }
                  style={{
                    padding: "15px",
                    borderRadius: "10px",
                    border: "1px solid #475569",
                    background: "#0f172a",
                    color: "white",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                <label
                  style={{
                    color: "#ef4444",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                  }}
                >
                  Nominal Biaya (Rp)
                </label>
                <input
                  required
                  type="number"
                  value={manualForm.gross}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, gross: e.target.value })
                  }
                  className="input-manual"
                  placeholder="0"
                  style={{
                    padding: "15px",
                    borderRadius: "10px",
                    border: "1px solid #475569",
                    background: "#0f172a",
                    color: "white",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginBottom: 30,
                }}
              >
                <label
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                  }}
                >
                  Sumber Dana
                </label>
                <select
                  value={manualForm.payment}
                  onChange={(e) =>
                    setManualForm({
                      ...manualForm,
                      payment: e.target.value as any,
                    })
                  }
                  className="input-manual"
                  style={{
                    padding: "15px",
                    borderRadius: "10px",
                    border: "1px solid #475569",
                    background: "#0f172a",
                    color: "white",
                    fontSize: "1rem",
                    width: "100%",
                    boxSizing: "border-box",
                    cursor: "pointer",
                  }}
                >
                  <option value="TUNAI">TUNAI (Kas Toko)</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 15 }}>
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  style={{
                    flex: 1,
                    padding: "15px",
                    background: "transparent",
                    border: "1px solid #475569",
                    color: "#cbd5e1",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1.5,
                    padding: "15px",
                    background: "#ef4444",
                    border: "none",
                    color: "white",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "1rem",
                    boxShadow: "0 10px 20px rgba(239, 68, 68, 0.3)",
                  }}
                >
                  Simpan Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSyncModal && (
        <div className="modal-overlay">
          <div
            style={{
              background: "#1e293b",
              padding: 30,
              borderRadius: 16,
              width: 350,
              border: "1px solid #334155",
              textAlign: "center",
            }}
          >
            <h2 style={{ color: "white" }}>Sync Data?</h2>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowSyncModal(false)}
                style={{ flex: 1, padding: 10, borderRadius: 8 }}
              >
                Batal
              </button>
              <button
                onClick={confirmSync}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  background: "#10b981",
                  color: "white",
                  border: "none",
                }}
              >
                {isSyncing ? "..." : "Kirim"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div
            style={{
              background: "#1e293b",
              padding: 30,
              borderRadius: 16,
              width: 350,
              border: "1px solid #334155",
              textAlign: "center",
            }}
          >
            <h2 style={{ color: "white" }}>Hapus?</h2>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{ flex: 1, padding: 10, borderRadius: 8 }}
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteTransaction}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditItemModal && (
        <div className="modal-overlay">
          <div
            style={{
              background: "#1e293b",
              padding: "30px",
              borderRadius: "16px",
              width: "450px",
              border: "1px solid #334155",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
            }}
          >
            <h2
              style={{
                margin: "0 0 20px 0",
                color: String(editItemForm.id).startsWith("MAN")
                  ? "#ef4444"
                  : "white",
                fontSize: "1.3rem",
              }}
            >
              {String(editItemForm.id).startsWith("MAN")
                ? "Edit Pengeluaran"
                : "Edit Transaksi"}
            </h2>
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  color: "#94a3b8",
                  fontSize: "0.85rem",
                  marginBottom: "5px",
                }}
              >
                {String(editItemForm.id).startsWith("MAN")
                  ? "Nama Pengeluaran"
                  : "Nama Item / Keterangan"}
              </label>
              <input
                value={editItemForm.name}
                onChange={(e) =>
                  setEditItemForm({ ...editItemForm, name: e.target.value })
                }
                readOnly={String(editItemForm.id).startsWith("TX-")}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: String(editItemForm.id).startsWith("TX-")
                    ? "rgba(15, 23, 42, 0.5)"
                    : "#0f172a",
                  border: "1px solid #475569",
                  color: String(editItemForm.id).startsWith("TX-")
                    ? "#64748b"
                    : "white",
                  borderRadius: "8px",
                  cursor: String(editItemForm.id).startsWith("TX-")
                    ? "not-allowed"
                    : "text",
                }}
              />
            </div>
            {!String(editItemForm.id).startsWith("MAN") ? (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "10px",
                    marginBottom: "15px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        color: "#3b82f6",
                        fontSize: "0.85rem",
                        marginBottom: "5px",
                        fontWeight: "bold",
                      }}
                    >
                      Harga
                    </label>
                    <input
                      type="number"
                      value={editItemForm.gross}
                      onChange={(e) =>
                        setEditItemForm({
                          ...editItemForm,
                          gross: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: "#0f172a",
                        border: "1px solid #334155",
                        color: "white",
                        borderRadius: "8px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        color: "#ec4899",
                        fontSize: "0.85rem",
                        marginBottom: "5px",
                        fontWeight: "bold",
                      }}
                    >
                      Diskon
                    </label>
                    <input
                      type="number"
                      value={editItemForm.discount}
                      onChange={(e) =>
                        setEditItemForm({
                          ...editItemForm,
                          discount: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: "#0f172a",
                        border: "1px solid #334155",
                        color: "white",
                        borderRadius: "8px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        color: "#fbbf24",
                        fontSize: "0.85rem",
                        marginBottom: "5px",
                        fontWeight: "bold",
                      }}
                    >
                      Laba
                    </label>
                    <input
                      type="number"
                      value={editItemForm.profit}
                      onChange={(e) =>
                        setEditItemForm({
                          ...editItemForm,
                          profit: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: "#0f172a",
                        border: "1px solid #fbbf24",
                        color: "#fbbf24",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: "25px" }}>
                  <label
                    style={{
                      display: "block",
                      color: "#94a3b8",
                      fontSize: "0.85rem",
                      marginBottom: "5px",
                    }}
                  >
                    Metode Pembayaran
                  </label>
                  <select
                    value={editItemForm.payment}
                    onChange={(e) =>
                      setEditItemForm({
                        ...editItemForm,
                        payment: e.target.value as any,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: "#0f172a",
                      border: "1px solid #475569",
                      color: "white",
                      borderRadius: "8px",
                    }}
                  >
                    <option value="TUNAI">TUNAI</option>
                    <option value="QRIS">QRIS</option>
                  </select>
                </div>
              </>
            ) : (
              <div style={{ marginBottom: "25px" }}>
                <label
                  style={{
                    display: "block",
                    color: "#ef4444",
                    fontSize: "0.85rem",
                    marginBottom: "5px",
                    fontWeight: "bold",
                  }}
                >
                  Nominal Pengeluaran
                </label>
                <input
                  type="number"
                  value={editItemForm.gross}
                  onChange={(e) =>
                    setEditItemForm({ ...editItemForm, gross: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#0f172a",
                    border: "1px solid #ef4444",
                    color: "#ef4444",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            )}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowEditItemModal(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "transparent",
                  border: "1px solid #475569",
                  color: "#cbd5e1",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button
                onClick={saveEditedItem}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: String(editItemForm.id).startsWith("MAN")
                    ? "#ef4444"
                    : "#3b82f6",
                  border: "none",
                  color: "white",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {showChartEditModal && (
        <div className="modal-overlay">
          <div
            style={{
              background: "#1e293b",
              padding: 30,
              borderRadius: 16,
              width: 350,
              border: "1px solid #334155",
            }}
          >
            <h2 style={{ color: "white", marginTop: 0, marginBottom: "20px" }}>
              Edit Grafik {chartForm.label}
            </h2>
            <div style={{ textAlign: "left" }}>
              <label
                style={{
                  color: "#3b82f6",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  display: "block",
                  marginBottom: "5px",
                }}
              >
                Total Omset (Rp)
              </label>
              <input
                type="number"
                value={chartForm.revenue}
                onChange={(e) =>
                  setChartForm({
                    ...chartForm,
                    revenue: Number(e.target.value),
                  })
                }
                className="input-manual"
              />
            </div>
            <div style={{ textAlign: "left", marginTop: "10px" }}>
              <label
                style={{
                  color: "#ef4444",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  display: "block",
                  marginBottom: "5px",
                }}
              >
                Total Modal / Pengeluaran (Rp)
              </label>
              <input
                type="number"
                value={chartForm.expense}
                onChange={(e) =>
                  setChartForm({
                    ...chartForm,
                    expense: Number(e.target.value),
                  })
                }
                className="input-manual"
              />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button
                onClick={() => setShowChartEditModal(false)}
                style={{ flex: 1, padding: 10, borderRadius: 8 }}
              >
                Batal
              </button>
              <button
                onClick={saveChartAdjustment}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                }}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteMissedModal && (
        <div className="modal-overlay">
          <div
            style={{
              background: "#1e293b",
              padding: "30px",
              borderRadius: "16px",
              width: "400px",
              border: "1px solid #334155",
              textAlign: "center",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
            }}
          >
            <h2
              style={{
                color: "white",
                marginTop: 0,
                marginBottom: "15px",
                fontSize: "1.5rem",
                fontWeight: "700",
              }}
            >
              Hapus dari daftar?
            </h2>
            <p
              style={{
                color: "#cbd5e1",
                marginBottom: "25px",
                fontSize: "1rem",
              }}
            >
              Klik jika barang sudah dibelanjakan.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowDeleteMissedModal(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  background: "transparent",
                  border: "1px solid #475569",
                  color: "#cbd5e1",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteMissedItem}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: "0 4px 6px rgba(239, 68, 68, 0.2)",
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
