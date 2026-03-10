import { useState, useEffect } from "react";

// --- MESIN GETAR (HAPTIC FEEDBACK) ---
const vibrate = (pattern: number | number[]) => {
  if (typeof window !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

const getLocalToday = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// ✨ ICON SVG PREMIUM & MINIMALIS ✨
const Icons = {
  User: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  Calendar: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  Logout: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  ),
  Save: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <polyline points="17 21 17 13 7 13 7 21"></polyline>
      <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
  ),
};

export default function InputLabaAyah({ onLogout }: { onLogout: () => void }) {
  const [targetDate, setTargetDate] = useState(getLocalToday());
  const [transactions, setTransactions] = useState<any[]>([]);
  const [profits, setProfits] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [omset, setOmset] = useState(0);

  const ip = window.location.hostname;

  const loadData = () => {
    fetch(`http://${ip}:3000/api/transactions`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const filtered = data.filter(
            (t: any) => t.date.startsWith(targetDate) && t.type === "MASUK",
          );
          setTransactions(filtered);

          let totalOmset = 0;
          const initialProfits: Record<string, string> = {};

          filtered.forEach((t: any) => {
            totalOmset += t.amount;
            initialProfits[t.unique_id] =
              t.profit && t.profit > 0 ? t.profit.toString() : "";
          });

          setOmset(totalOmset);
          setProfits(initialProfits);
        }
      })
      .catch(() =>
        alert("Gagal mengambil data. Pastikan terhubung ke Wi-Fi Bengkel!"),
      );
  };

  useEffect(() => {
    loadData();
  }, [targetDate, ip]);

  const handleProfitChange = (id: string, value: string) => {
    setProfits((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveAll = async () => {
    vibrate(30);
    if (!confirm("Simpan laporan laba hari ini?")) return;
    setIsSaving(true);

    try {
      for (const t of transactions) {
        const newProfit = profits[t.unique_id];
        const oldProfitStr =
          t.profit && t.profit > 0 ? t.profit.toString() : "";

        if (newProfit !== undefined && newProfit !== oldProfitStr) {
          const payload = {
            itemName: t.items_summary || t.description,
            gross: t.gross_amount ?? t.amount ?? 0,
            discount: t.discount ?? 0,
            profit: Number(newProfit) || 0,
            paymentMethod: t.payment_method || "TUNAI",
          };

          const response = await fetch(
            `http://${ip}:3000/api/transactions/${t.unique_id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            },
          );

          if (!response.ok)
            throw new Error(`Gagal menyimpan: ${payload.itemName}`);
        }
      }

      vibrate([50, 100, 50]);
      alert("✅ Mantap Yah! Laba berhasil disimpan.");
      loadData();
    } catch (error: any) {
      vibrate([50, 200, 50]);
      alert("❌ Oops! " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ✨ KALKULATOR TOTAL LABA REAL-TIME ✨
  const currentTotalProfit = Object.values(profits).reduce(
    (acc, val) => acc + (Number(val) || 0),
    0,
  );

  // Format tanggal cantik
  const dateFormatted = new Date(targetDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        paddingBottom: "110px",
      }}
    >
      {/* HEADER SUPER CLEAN */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#e2e8f0",
          }}
        >
          <div
            style={{
              background: "rgba(59, 130, 246, 0.15)",
              color: "#3b82f6",
              padding: "8px",
              borderRadius: "50%",
              display: "flex",
            }}
          >
            <Icons.User />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>
              Dashboard
            </h2>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>Akses Owner</div>
          </div>
        </div>

        <button
          onClick={() => {
            vibrate(30);
            if (confirm("Keluar dari Dashboard?")) onLogout();
          }}
          style={{
            background: "transparent",
            border: "1px solid #ef4444",
            color: "#ef4444",
            padding: "8px 14px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <Icons.Logout /> Keluar
        </button>
      </div>

      {/* SUMMARY SECTION (OMSET & LABA) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "35px",
        }}
      >
        {/* TRIK KALENDER GAIB */}
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
            color: "#94a3b8",
            marginBottom: "25px",
            overflow: "hidden",
          }}
        >
          <Icons.Calendar />
          <span
            style={{ fontSize: "13px", fontWeight: "600", color: "#f8fafc" }}
          >
            {dateFormatted}
          </span>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => {
              vibrate(30);
              setTargetDate(e.target.value);
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

        {/* ✨ TAMPILAN SPLIT: OMSET DAN LABA ✨ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            gap: "10px",
          }}
        >
          <div style={{ flex: 1, textAlign: "right", paddingRight: "15px" }}>
            <div
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                marginBottom: "6px",
                fontWeight: "500",
              }}
            >
              Total Omset
            </div>
            <div
              style={{
                fontSize: "26px",
                fontWeight: "800",
                color: "#10b981",
                letterSpacing: "-0.5px",
                lineHeight: "1",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  verticalAlign: "top",
                  marginRight: "3px",
                  color: "#64748b",
                }}
              >
                Rp
              </span>
              {omset.toLocaleString("id-ID")}
            </div>
          </div>

          {/* Garis Pemisah Pembatas */}
          <div
            style={{
              width: "2px",
              height: "45px",
              background: "#334155",
              borderRadius: "2px",
            }}
          ></div>

          <div style={{ flex: 1, textAlign: "left", paddingLeft: "15px" }}>
            <div
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                marginBottom: "6px",
                fontWeight: "500",
              }}
            >
              Total Keuntungan
            </div>
            <div
              style={{
                fontSize: "26px",
                fontWeight: "800",
                color: "#fbbf24",
                letterSpacing: "-0.5px",
                lineHeight: "1",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  verticalAlign: "top",
                  marginRight: "3px",
                  color: "#64748b",
                }}
              >
                Rp
              </span>
              {currentTotalProfit.toLocaleString("id-ID")}
            </div>
          </div>
        </div>
      </div>

      {/* DAFTAR BARANG */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          borderBottom: "1px solid #1e293b",
          paddingBottom: "10px",
        }}
      >
        <h3
          style={{
            fontSize: "15px",
            color: "#e2e8f0",
            margin: 0,
            fontWeight: "600",
          }}
        >
          Rincian Laba Hari Ini
        </h3>
        <span
          style={{
            fontSize: "12px",
            color: "#64748b",
            background: "#1e293b",
            padding: "2px 8px",
            borderRadius: "10px",
          }}
        >
          {transactions.length} Barang
        </span>
      </div>

      {transactions.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            color: "#64748b",
            padding: "40px 20px",
            background: "#1e293b",
            borderRadius: "16px",
            border: "1px dashed #334155",
          }}
        >
          Belum ada penjualan di tanggal ini.
        </div>
      ) : (
        transactions.map((t, i) => (
          <div
            key={t.unique_id}
            style={{
              background: "#1e293b",
              padding: "16px",
              borderRadius: "16px",
              marginBottom: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: "600",
                    fontSize: "15px",
                    color: "#f8fafc",
                    lineHeight: "1.4",
                  }}
                >
                  <span style={{ color: "#64748b", marginRight: "6px" }}>
                    {i + 1}.
                  </span>
                  {t.items_summary || t.description}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#94a3b8",
                    marginTop: "4px",
                  }}
                >
                  Harga Jual:{" "}
                  <span style={{ color: "#cbd5e1" }}>
                    Rp {t.amount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            {/* INPUT LABA MINIMALIS (Rata Kanan) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#0f172a",
                borderRadius: "10px",
                padding: "4px 16px",
                border: "1px solid #334155",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#64748b",
                }}
              >
                Laba
              </span>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#fbbf24",
                  marginLeft: "10px",
                  marginRight: "4px",
                }}
              >
                Rp
              </span>
              <input
                type="number"
                placeholder="0"
                value={profits[t.unique_id] || ""}
                onChange={(e) =>
                  handleProfitChange(t.unique_id, e.target.value)
                }
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  color: "#fbbf24",
                  fontSize: "20px",
                  fontWeight: "800",
                  outline: "none",
                  width: "100%",
                  textAlign: "right",
                  padding: "8px 0",
                }}
              />
            </div>
          </div>
        ))
      )}

      {/* FLOATING ACTION BUTTON */}
      {transactions.length > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "20px",
            background: "linear-gradient(to top, #0f172a 70%, transparent)",
            pointerEvents: "none",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            style={{
              width: "100%",
              maxWidth: "400px",
              padding: "16px",
              background: isSaving ? "#475569" : "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "16px",
              fontWeight: "bold",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 10px 25px rgba(59, 130, 246, 0.4)",
              pointerEvents: "auto",
              transition: "all 0.2s",
            }}
          >
            <Icons.Save />
            {isSaving ? "Menyimpan..." : "Simpan Semua Laba"}
          </button>
        </div>
      )}
    </div>
  );
}
