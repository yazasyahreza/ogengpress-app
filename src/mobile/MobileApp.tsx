import { useState, useEffect, useRef } from "react";
import KasirMobile from "./pages/KasirMobile";
import LaporanMobile from "./pages/LaporanMobile";
import GudangMobile from "./pages/GudangMobile";
import AiAssistantMobile from "../components/AiAssistantMobile";
import InputLabaAyah from "./pages/InputLabaAyah";

const vibrate = (pattern: number | number[]) => {
  if (typeof window !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

const Icons = {
  Warehouse: () => (
    <svg
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9" />
      <path d="M9 22V12h6v10M2 10.6L12 2l10 8.6" />
    </svg>
  ),
  Cashier: () => (
    <svg
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  ),
  Report: () => (
    <svg
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M3 3v18h18" />
      <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
    </svg>
  ),
  // ✨ IKON KELUAR BARU ✨
  Logout: () => (
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

export default function App() {
  const [role, setRole] = useState(localStorage.getItem("user_role") || "");
  const [page, setPage] = useState<"KASIR" | "LAPORAN" | "GUDANG">("KASIR");
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    if (role !== "KASIR") return;

    const handleTouchStart = (e: TouchEvent) => {
      lastY.current = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const diff = currentY - lastY.current;
      if (diff < -15) setIsNavVisible(false);
      else if (diff > 15) setIsNavVisible(true);
      lastY.current = currentY;
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, [role]);

  if (!role) {
    return (
      <div
        style={{
          height: "100vh",
          background: "#0f172a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          color: "white",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            background: "#1e293b",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
            border: "2px solid #3b82f6",
            boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
          }}
        >
          <Icons.Warehouse />
        </div>
        <h1
          style={{
            color: "white",
            marginBottom: "5px",
            textAlign: "center",
            fontSize: "24px",
          }}
        >
          Ogeng Press
        </h1>
        <p style={{ marginBottom: "40px", color: "#94a3b8", fontSize: "14px" }}>
          Siapa yang sedang mengakses?
        </p>

        <button
          onClick={() => {
            vibrate(30);
            localStorage.setItem("user_role", "KASIR");
            setRole("KASIR");
          }}
          style={{
            width: "100%",
            padding: "16px",
            background: "#3b82f6",
            color: "white",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "bold",
            marginBottom: "15px",
            border: "none",
            boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
          }}
        >
          Masuk sebagai Kasir
        </button>
        <button
          onClick={() => {
            vibrate(30);
            localStorage.setItem("user_role", "AYAH");
            setRole("AYAH");
          }}
          style={{
            width: "100%",
            padding: "16px",
            background: "#10b981",
            color: "white",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "bold",
            border: "none",
            boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
          }}
        >
          Masuk sebagai Owner
        </button>
      </div>
    );
  }

  if (role === "AYAH") {
    return (
      <InputLabaAyah
        onLogout={() => {
          vibrate(50);
          localStorage.removeItem("user_role");
          setRole("");
        }}
      />
    );
  }

  const handlePageChange = (newPage: "KASIR" | "LAPORAN" | "GUDANG") => {
    if (page !== newPage) {
      vibrate(50);
      setPage(newPage);
      setIsNavVisible(true);
    }
  };

  // ✨ FUNGSI LOGOUT KASIR ✨
  const handleLogout = () => {
    vibrate(50);
    if (confirm("Yakin ingin keluar ke halaman pilih pengguna?")) {
      localStorage.removeItem("user_role");
      setRole("");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#0f172a",
        color: "white",
        position: "relative",
      }}
    >
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          position: "relative",
          paddingBottom: "10px",
        }}
      >
        {page === "GUDANG" && <GudangMobile />}
        {page === "KASIR" && <KasirMobile />}
        {page === "LAPORAN" && <LaporanMobile />}
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "65px",
          background: "rgba(30, 41, 59, 0.95)",
          backdropFilter: "blur(10px)",
          borderTop: "1px solid #334155",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          zIndex: 999,
          paddingBottom: "env(safe-area-inset-bottom, 5px)",
          transform: isNavVisible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: isNavVisible ? "0 -4px 20px rgba(0,0,0,0.3)" : "none",
        }}
      >
        <NavButton
          active={page === "GUDANG"}
          onClick={() => handlePageChange("GUDANG")}
          icon={<Icons.Warehouse />}
          label="Gudang"
        />
        <NavButton
          active={page === "KASIR"}
          onClick={() => handlePageChange("KASIR")}
          icon={<Icons.Cashier />}
          label="Kasir"
        />
        <NavButton
          active={page === "LAPORAN"}
          onClick={() => handlePageChange("LAPORAN")}
          icon={<Icons.Report />}
          label="Laporan"
        />

        {/* ✨ TOMBOL KELUAR PENGGANTI RELOAD ✨ */}
        <button
          onClick={handleLogout}
          style={{
            background: "none",
            border: "none",
            color: "#ef4444",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
            opacity: 0.8,
            cursor: "pointer",
            width: "60px",
            padding: "8px",
          }}
        >
          <Icons.Logout />
          <span
            style={{ fontSize: "10px", fontWeight: "600", marginTop: "2px" }}
          >
            Keluar
          </span>
        </button>
      </div>

      <AiAssistantMobile />
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    style={{
      background: "none",
      border: "none",
      color: active ? "#3b82f6" : "#64748b",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "4px",
      padding: "8px",
      width: "60px",
      transition: "all 0.2s",
      cursor: "pointer",
    }}
  >
    <div
      style={{
        transform: active ? "scale(1.15) translateY(-2px)" : "scale(1)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: active ? 1 : 0.7,
      }}
    >
      {icon}
    </div>
    <span
      style={{
        fontSize: "10px",
        fontWeight: active ? "bold" : "normal",
        transition: "all 0.3s",
      }}
    >
      {label}
    </span>
  </button>
);
