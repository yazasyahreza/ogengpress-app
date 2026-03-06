import { useState, useEffect, useRef } from "react";

// --- MESIN GETAR (HAPTIC FEEDBACK) ---
const vibrate = (pattern: number | number[]) => {
  if (typeof window !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// --- GET TANGGAL LOKAL (WIB/WITA/WIT) HARI INI ---
const getLocalToday = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// --- INTERFACES ---
interface Transaction {
  unique_id: string;
  date: string;
  type: "MASUK" | "KELUAR";
  description: string;
  items_summary?: string;
  payment_method: string;
  amount: number;
  profit?: number;
  gross_amount?: number;
  discount?: number;
}

// --- ✨ ICONS (Premium SVG Version) ✨ ---
const Icons = {
  Edit: () => (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash: () => (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Plus: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Check: () => (
    <svg
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Dots: () => (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  ),
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
  Clipboard: () => (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  ),
  Trophy: () => (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10" />
      <path d="M5 4h14v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4z" />
    </svg>
  ),
  ArrowUp: () => (
    <svg
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <line x1="12" y1="19" x2="12" y2="5"></line>
      <polyline points="5 12 12 5 19 12"></polyline>
    </svg>
  ),
  ArrowDown: () => (
    <svg
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <polyline points="19 12 12 19 5 12"></polyline>
    </svg>
  ),
};

// --- KOMPONEN SWIPE CANGGIH ---
const SwipeableRow = ({
  children,
  onEdit,
  onDelete,
  showEdit = true,
  showDelete = true,
  deleteColor = "#ef4444",
  deleteIcon = <Icons.Trash />,
}: any) => {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isSwiping = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startX.current;
    const diffY = currentY - startY.current;

    if (!isSwiping.current) {
      if (Math.abs(diffY) > Math.abs(diffX)) {
        setIsDragging(false);
        return;
      }
      isSwiping.current = true;
    }

    if (diffX > 0 && !showEdit) return;
    if (diffX < 0 && !showDelete) return;

    let newOffset = diffX;
    if (newOffset > 80) newOffset = 80 + (newOffset - 80) * 0.2;
    if (newOffset < -80) newOffset = -80 + (newOffset + 80) * 0.2;

    setOffset(newOffset);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (offset > 50 && showEdit) {
      setOffset(80);
      vibrate(30);
    } else if (offset < -50 && showDelete) {
      setOffset(-80);
      vibrate(30);
    } else {
      setOffset(0);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        marginBottom: "12px",
        borderRadius: "16px",
        background: "#334155",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div
          onClick={() => {
            setOffset(0);
            onEdit && onEdit();
          }}
          style={{
            width: "80px",
            background: "#3b82f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            opacity: offset > 0 ? 1 : 0,
            transition: "opacity 0.2s",
            cursor: "pointer",
          }}
        >
          <Icons.Edit />
        </div>
        <div
          onClick={() => {
            setOffset(0);
            onDelete && onDelete();
          }}
          style={{
            width: "80px",
            background: deleteColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            opacity: offset < 0 ? 1 : 0,
            transition: "opacity 0.2s",
            cursor: "pointer",
          }}
        >
          {deleteIcon}
        </div>
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (offset !== 0) setOffset(0);
        }}
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDragging
            ? "none"
            : "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
          background: "#1e293b",
          borderRadius: "16px",
          position: "relative",
          zIndex: 2,
          width: "100%",
          boxSizing: "border-box",
          boxShadow: offset !== 0 ? "0 4px 20px rgba(0,0,0,0.4)" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default function LaporanMobile() {
  const [tab, setTab] = useState<"TRANSAKSI" | "ANALISA">("TRANSAKSI");
  const [selectedDate, setSelectedDate] = useState(
    () => localStorage.getItem("active_date") || getLocalToday(),
  );

  const [stats, setStats] = useState({
    net_sales: 0,
    total_profit: 0,
    total_transaction: 0,
    expense: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [showManualModal, setShowManualModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [targetId, setTargetId] = useState<string | null>(null);
  const [manualForm, setManualForm] = useState({
    name: "",
    gross: "",
    payment: "TUNAI",
  });

  const [editForm, setEditForm] = useState({
    unique_id: "",
    name: "",
    payment_method: "TUNAI",
    gross: "",
    discount: "",
    profit: "",
  });

  const [missedItems, setMissedItems] = useState<any[]>([]);
  const [newRequest, setNewRequest] = useState("");
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [categories, setCategories] = useState<string[]>([]);

  const ip = localStorage.getItem("server_ip");

  useEffect(() => {
    localStorage.setItem("active_date", selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (tab === "TRANSAKSI") loadTransaksi();
    else loadAnalisa();
  }, [tab, categoryFilter, selectedDate]);

  const loadTransaksi = async () => {
    try {
      const res = await fetch(`http://${ip}:3000/api/transactions`);
      const allData: Transaction[] = await res.json();
      const filteredData = Array.isArray(allData)
        ? allData.filter((r) => r.date.startsWith(selectedDate))
        : [];
      setTransactions(filteredData);

      let net = 0,
        prof = 0,
        count = 0,
        exp = 0;
      filteredData.forEach((r) => {
        if (r.type === "MASUK") {
          net += r.amount;
          prof += r.profit || 0;
          count++;
        } else {
          exp += r.amount;
        }
      });
      setStats({
        net_sales: net,
        total_profit: prof,
        total_transaction: count,
        expense: exp,
      });
    } catch (e) {
      console.error("Gagal load transaksi");
    }
  };

  const loadAnalisa = async () => {
    try {
      const resMissed = await fetch(`http://${ip}:3000/api/missed-items`);
      setMissedItems(await resMissed.json());
      const resTop = await fetch(
        `http://${ip}:3000/api/top-products?category=${categoryFilter}`,
      );
      setTopProducts(await resTop.json());
      const resCat = await fetch(`http://${ip}:3000/api/categories`);
      setCategories(["Semua", ...(await resCat.json())]);
    } catch (e) {
      console.error("Gagal load analisa");
    }
  };

  const submitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`http://${ip}:3000/api/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: `${selectedDate}T${new Date().toISOString().split("T")[1]}`,
          type: "KELUAR",
          category: "PENGELUARAN",
          description: manualForm.name,
          amount: Number(manualForm.gross),
          payment_method: manualForm.payment,
        }),
      });
      setShowManualModal(false);
      setManualForm({ name: "", gross: "", payment: "TUNAI" });
      vibrate([50, 100, 50]);
      loadTransaksi();
    } catch (e) {
      alert("Gagal simpan");
      vibrate([50, 200, 50]);
    }
  };

  const handleOpenEdit = (t: Transaction) => {
    vibrate(30);
    let cleanName = t.items_summary || t.description || "Transaksi Kasir";
    cleanName = cleanName
      .replace(/\s*\(x\d+\)/g, "")
      .replace(/,\s*$/, "")
      .trim();

    setEditForm({
      unique_id: t.unique_id,
      name: cleanName,
      payment_method: t.payment_method || "TUNAI",
      gross: (t.gross_amount ?? t.amount ?? 0).toString(),
      discount: (t.discount ?? 0).toString(),
      profit: (t.profit ?? 0).toString(),
    });
    setShowEditModal(true);
  };

  const submitEdit = async () => {
    const isExpense = editForm.unique_id.startsWith("MAN");
    if (editForm.gross === "" || (!isExpense && editForm.profit === ""))
      return alert("Field nominal tidak boleh kosong!");

    try {
      const payload = {
        itemName: editForm.name,
        gross: Number(editForm.gross),
        discount: Number(editForm.discount) || 0,
        profit: Number(editForm.profit) || 0,
        paymentMethod: editForm.payment_method,
      };
      const response = await fetch(
        `http://${ip}:3000/api/transactions/${editForm.unique_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) throw new Error("Gagal update");
      setShowEditModal(false);
      vibrate(50);
      loadTransaksi();
    } catch (e) {
      alert("Gagal update. Pastikan server aktif.");
      vibrate([50, 100, 50]);
    }
  };

  const confirmDelete = async () => {
    try {
      await fetch(`http://${ip}:3000/api/transactions/${targetId}`, {
        method: "DELETE",
      });
      setShowDeleteModal(false);
      vibrate(80);
      loadTransaksi();
    } catch (e) {
      alert("Gagal hapus");
      vibrate([50, 100, 50]);
    }
  };

  const submitRequest = async () => {
    if (!newRequest.trim()) return;
    try {
      await fetch(`http://${ip}:3000/api/missed-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRequest }),
      });
      setNewRequest("");
      loadAnalisa();
      vibrate(30);
    } catch (e) {
      alert("Gagal");
    }
  };

  const deleteRequest = async (id: number) => {
    try {
      await fetch(`http://${ip}:3000/api/missed-items/${id}`, {
        method: "DELETE",
      });
      vibrate(50);
      loadAnalisa();
    } catch (e) {
      alert("Gagal");
    }
  };

  const isExpenseEdit = editForm.unique_id.startsWith("MAN");

  // Format Tanggal Cantik
  const dateObj = new Date(selectedDate);
  const formattedDate = dateObj.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const isToday = selectedDate === getLocalToday();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#0f172a",
        color: "white",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <style>{`
        .modal-overlay-center {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px);
          z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.8) sepia(1) saturate(5) hue-rotate(180deg); cursor: pointer; opacity: 0; position: absolute; right: 0; top: 0; width: 100%; height: 100%;
        }
        /* Sembunyikan scrollbar agar rapi */
        ::-webkit-scrollbar { width: 0px; background: transparent; }
      `}</style>

      {/* HEADER TABS MINIMALIS */}
      <div
        style={{
          padding: "15px 20px",
          background: "#0f172a",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            background: "#1e293b",
            borderRadius: "12px",
            display: "flex",
            padding: "4px",
          }}
        >
          {["TRANSAKSI", "ANALISA"].map((t) => (
            <div
              key={t}
              onClick={() => {
                vibrate(30);
                setTab(t as any);
              }}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "10px 0",
                borderRadius: "10px",
                background: tab === t ? "#3b82f6" : "transparent",
                color: tab === t ? "white" : "#94a3b8",
                fontWeight: "600",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow:
                  tab === t ? "0 2px 10px rgba(59, 130, 246, 0.3)" : "none",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 90px 20px" }}>
        {tab === "TRANSAKSI" && (
          <>
            {/* KALENDER KAPSUL DI TENGAH */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  position: "relative",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#1e293b",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: "1px solid #334155",
                  color: "#fbbf24",
                  overflow: "hidden",
                }}
              >
                <Icons.Calendar />
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#e2e8f0",
                  }}
                >
                  {isToday ? "Hari Ini" : formattedDate}
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    vibrate(40);
                    setSelectedDate(e.target.value);
                  }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0,
                    width: "100%",
                    cursor: "pointer",
                  }}
                />
              </div>
            </div>

            {/* KARTU STATISTIK PREMIUM */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "25px",
              }}
            >
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  padding: "16px",
                  borderRadius: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#10b981",
                    marginBottom: "4px",
                    fontWeight: "600",
                  }}
                >
                  Omset Bersih
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "800",
                    color: "white",
                  }}
                >
                  Rp {stats.net_sales.toLocaleString()}
                </div>
              </div>

              <div
                style={{
                  background: "rgba(251, 191, 36, 0.1)",
                  border: "1px solid rgba(251, 191, 36, 0.2)",
                  padding: "16px",
                  borderRadius: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#fbbf24",
                    marginBottom: "4px",
                    fontWeight: "600",
                  }}
                >
                  Laba (Profit)
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "800",
                    color: "white",
                  }}
                >
                  Rp {(stats.total_profit - stats.expense).toLocaleString()}
                </div>
              </div>

              <div
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  padding: "16px",
                  borderRadius: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#ef4444",
                    marginBottom: "4px",
                    fontWeight: "600",
                  }}
                >
                  Pengeluaran
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "800",
                    color: "white",
                  }}
                >
                  Rp {stats.expense.toLocaleString()}
                </div>
              </div>

              <div
                style={{
                  background: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                  padding: "16px",
                  borderRadius: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#3b82f6",
                    marginBottom: "4px",
                    fontWeight: "600",
                  }}
                >
                  Saldo Kas
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "800",
                    color: "white",
                  }}
                >
                  Rp {(stats.net_sales - stats.expense).toLocaleString()}
                </div>
              </div>
            </div>

            {/* TOMBOL CATAT PENGELUARAN */}
            <button
              onClick={() => {
                vibrate(30);
                setShowManualModal(true);
              }}
              style={{
                width: "100%",
                padding: "16px",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "16px",
                fontWeight: "bold",
                fontSize: "15px",
                marginBottom: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 8px 20px rgba(239, 68, 68, 0.3)",
              }}
            >
              <Icons.Plus /> Catat Pengeluaran Baru
            </button>

            {/* HEADER LIST */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  color: "#f8fafc",
                  margin: 0,
                  fontWeight: "600",
                }}
              >
                Riwayat Transaksi
              </h3>
              <span style={{ fontSize: "11px", color: "#64748b" }}>
                Geser untuk opsi
              </span>
            </div>

            {/* DAFTAR TRANSAKSI MINIMALIS */}
            {transactions.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#64748b",
                  background: "#1e293b",
                  borderRadius: "16px",
                  border: "1px dashed #334155",
                }}
              >
                Belum ada pergerakan hari ini.
              </div>
            ) : (
              transactions.map((t, i) => {
                const isActionable =
                  t.unique_id &&
                  (t.unique_id.startsWith("TX-") ||
                    t.unique_id.startsWith("MAN-"));
                const isMasuk = t.type === "MASUK";

                return (
                  <SwipeableRow
                    key={i}
                    showEdit={isActionable}
                    showDelete={isActionable}
                    onEdit={() => handleOpenEdit(t)}
                    onDelete={() => {
                      vibrate(30);
                      setTargetId(t.unique_id);
                      setShowDeleteModal(true);
                    }}
                  >
                    <div
                      style={{
                        padding: "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      {/* IKON BULAT (PANAH NAIK/TURUN) */}
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: isMasuk
                            ? "rgba(16, 185, 129, 0.15)"
                            : "rgba(239, 68, 68, 0.15)",
                          color: isMasuk ? "#10b981" : "#ef4444",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {isMasuk ? <Icons.ArrowUp /> : <Icons.ArrowDown />}
                      </div>

                      {/* INFO TENGAH */}
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div
                          style={{
                            fontWeight: "600",
                            fontSize: "14px",
                            color: "#f8fafc",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {t.description ||
                            `Kasir (${t.payment_method || "TUNAI"})`}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#94a3b8",
                            marginTop: "4px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {new Date(t.date).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          • {t.items_summary || t.payment_method}
                        </div>
                      </div>

                      {/* NOMINAL KANAN */}
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontWeight: "700",
                            fontSize: "14px",
                            color: isMasuk ? "#10b981" : "#ef4444",
                          }}
                        >
                          {isMasuk ? "+" : "-"} {t.amount.toLocaleString()}
                        </div>
                        {isMasuk && t.profit !== undefined && (
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#fbbf24",
                              fontWeight: "600",
                              marginTop: "4px",
                            }}
                          >
                            Laba: {t.profit.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </SwipeableRow>
                );
              })
            )}
          </>
        )}

        {/* === TAB ANALISA === */}
        {tab === "ANALISA" && (
          <>
            <div
              style={{
                background: "#1e293b",
                padding: "20px",
                borderRadius: "16px",
                marginBottom: "25px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 15px 0",
                  color: "#ec4899",
                  fontSize: "15px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    background: "rgba(236, 72, 153, 0.15)",
                    padding: "8px",
                    borderRadius: "10px",
                    display: "flex",
                  }}
                >
                  <Icons.Clipboard />
                </div>
                Request / Stok Kosong
              </h3>
              <div
                style={{ display: "flex", gap: "10px", marginBottom: "15px" }}
              >
                <input
                  value={newRequest}
                  onChange={(e) => setNewRequest(e.target.value)}
                  placeholder="Tulis nama barang..."
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: "12px",
                    background: "#0f172a",
                    border: "1px solid #334155",
                    color: "white",
                    outline: "none",
                  }}
                />
                <button
                  onClick={submitRequest}
                  style={{
                    background: "#ec4899",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    padding: "0 20px",
                    fontWeight: "bold",
                  }}
                >
                  Catat
                </button>
              </div>
              <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                {missedItems.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: "13px",
                      padding: "20px 0",
                    }}
                  >
                    Belum ada catatan barang kosong.
                  </div>
                ) : (
                  missedItems.map((item) => (
                    <SwipeableRow
                      key={item.id}
                      showEdit={false}
                      showDelete={true}
                      deleteColor="#10b981"
                      deleteIcon={<Icons.Check />}
                      onDelete={() => deleteRequest(item.id)}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "14px 16px",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#f8fafc",
                            }}
                          >
                            {item.name}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#94a3b8",
                              marginTop: "2px",
                            }}
                          >
                            {new Date(item.last_requested).toLocaleDateString()}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <span
                            style={{
                              background: "rgba(251, 191, 36, 0.15)",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              color: "#fbbf24",
                              fontWeight: "bold",
                            }}
                          >
                            {item.count}x
                          </span>
                        </div>
                      </div>
                    </SwipeableRow>
                  ))
                )}
              </div>
            </div>

            <div
              style={{
                background: "#1e293b",
                padding: "20px",
                borderRadius: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    color: "#fbbf24",
                    fontSize: "15px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(251, 191, 36, 0.15)",
                      padding: "8px",
                      borderRadius: "10px",
                      display: "flex",
                    }}
                  >
                    <Icons.Trophy />
                  </div>
                  Top 5 Terlaris
                </h3>
                <select
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  value={categoryFilter}
                  style={{
                    background: "#0f172a",
                    color: "white",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    padding: "6px 10px",
                    fontSize: "12px",
                    outline: "none",
                  }}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              {topProducts.map((p, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "16px",
                    paddingBottom: "16px",
                    borderBottom: "1px solid #0f172a",
                  }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background:
                        i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : "#334155",
                      color: i < 2 ? "black" : "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "13px",
                    }}
                  >
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#f8fafc",
                      }}
                    >
                      {p.name}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#94a3b8",
                        marginTop: "2px",
                      }}
                    >
                      Stok:{" "}
                      <span
                        style={{
                          color: p.current_stock < 5 ? "#ef4444" : "#10b981",
                          fontWeight: "600",
                        }}
                      >
                        {p.current_stock}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: "bold",
                        color: "#3b82f6",
                      }}
                    >
                      {p.total_sold}
                    </div>
                    <div style={{ fontSize: "10px", color: "#64748b" }}>
                      Terjual
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* MODALS SAMA SEPERTI SEBELUMNYA */}
      {showManualModal && (
        <div className="modal-overlay-center">
          <div
            style={{
              background: "#1e293b",
              padding: "24px",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "320px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            }}
          >
            <h3
              style={{
                color: "#ef4444",
                marginTop: 0,
                textAlign: "center",
                fontSize: "18px",
              }}
            >
              Catat Pengeluaran
            </h3>
            <input
              placeholder="Keterangan (ex: Bensin)"
              value={manualForm.name}
              onChange={(e) =>
                setManualForm({ ...manualForm, name: e.target.value })
              }
              style={inputStyle}
            />
            <input
              type="number"
              placeholder="Nominal (Rp)"
              value={manualForm.gross}
              onChange={(e) =>
                setManualForm({ ...manualForm, gross: e.target.value })
              }
              style={{
                ...inputStyle,
                fontSize: "20px",
                fontWeight: "bold",
                textAlign: "center",
              }}
            />
            <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
              <button
                onClick={() => {
                  vibrate(30);
                  setShowManualModal(false);
                }}
                style={btnSecondaryStyle}
              >
                Batal
              </button>
              <button onClick={submitExpense} style={btnPrimaryStyle}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay-center">
          <div
            style={{
              background: "#1e293b",
              padding: "24px",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "340px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            }}
          >
            <h3
              style={{
                color: isExpenseEdit ? "#ef4444" : "#3b82f6",
                marginTop: 0,
                textAlign: "center",
                fontSize: "18px",
              }}
            >
              {isExpenseEdit ? "Edit Pengeluaran" : "Edit Transaksi"}
            </h3>

            <div
              style={{
                background: "#0f172a",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid #334155",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  marginBottom: "4px",
                }}
              >
                {isExpenseEdit ? "Nama Pengeluaran:" : "Nama Barang:"}
              </div>
              <input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  fontSize: "15px",
                  fontWeight: "bold",
                  textAlign: "center",
                  width: "100%",
                  outline: "none",
                }}
              />
            </div>

            {!isExpenseEdit ? (
              <>
                <div
                  style={{ display: "flex", gap: "12px", marginBottom: "12px" }}
                >
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Harga Kotor</label>
                    <input
                      type="number"
                      value={editForm.gross}
                      onChange={(e) =>
                        setEditForm({ ...editForm, gross: e.target.value })
                      }
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Diskon</label>
                    <input
                      type="number"
                      value={editForm.discount}
                      onChange={(e) =>
                        setEditForm({ ...editForm, discount: e.target.value })
                      }
                      style={inputStyle}
                    />
                  </div>
                </div>
                <label style={{ ...labelStyle, color: "#fbbf24" }}>
                  Laba Bersih (Profit)
                </label>
                <input
                  type="number"
                  value={editForm.profit}
                  onChange={(e) =>
                    setEditForm({ ...editForm, profit: e.target.value })
                  }
                  style={{
                    ...inputStyle,
                    borderColor: "#fbbf24",
                    color: "#fbbf24",
                    fontWeight: "bold",
                    fontSize: "18px",
                    marginBottom: "12px",
                  }}
                />
                <label style={labelStyle}>Metode Bayar</label>
                <select
                  value={editForm.payment_method}
                  onChange={(e) =>
                    setEditForm({ ...editForm, payment_method: e.target.value })
                  }
                  style={inputStyle}
                >
                  <option value="TUNAI">TUNAI</option>
                  <option value="QRIS">QRIS</option>
                  <option value="TRANSFER">TRANSFER</option>
                </select>
              </>
            ) : (
              <>
                <label style={labelStyle}>Nominal Pengeluaran</label>
                <input
                  type="number"
                  value={editForm.gross}
                  onChange={(e) =>
                    setEditForm({ ...editForm, gross: e.target.value })
                  }
                  style={{
                    ...inputStyle,
                    fontSize: "20px",
                    fontWeight: "bold",
                    borderColor: "#ef4444",
                    color: "#ef4444",
                    textAlign: "center",
                  }}
                />
              </>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button
                onClick={() => {
                  vibrate(30);
                  setShowEditModal(false);
                }}
                style={btnSecondaryStyle}
              >
                Batal
              </button>
              <button
                onClick={submitEdit}
                style={{
                  ...btnPrimaryStyle,
                  background: isExpenseEdit ? "#ef4444" : "#3b82f6",
                }}
              >
                Update Data
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay-center">
          <div
            style={{
              background: "#1e293b",
              padding: "24px",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "300px",
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            }}
          >
            <h3 style={{ color: "white", margin: "0 0 10px 0" }}>
              Hapus Data?
            </h3>
            <p
              style={{
                color: "#94a3b8",
                fontSize: "14px",
                marginBottom: "24px",
              }}
            >
              Yakin nih Bos? Data yang dihapus tidak bisa dikembalikan lagi lho.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => {
                  vibrate(30);
                  setShowDeleteModal(false);
                }}
                style={btnSecondaryStyle}
              >
                Batal
              </button>
              <button onClick={confirmDelete} style={btnPrimaryStyle}>
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  background: "#0f172a",
  border: "1px solid #334155",
  color: "white",
  boxSizing: "border-box" as "border-box",
  outline: "none",
};
const btnSecondaryStyle = {
  flex: 1,
  padding: "14px",
  borderRadius: "12px",
  background: "transparent",
  border: "1px solid #475569",
  color: "#cbd5e1",
  fontWeight: "bold",
};
const btnPrimaryStyle = {
  flex: 1,
  padding: "14px",
  borderRadius: "12px",
  background: "#ef4444",
  border: "none",
  color: "white",
  fontWeight: "bold",
};
const labelStyle = {
  color: "#94a3b8",
  fontSize: "12px",
  display: "block",
  marginBottom: "6px",
  fontWeight: "600",
};
