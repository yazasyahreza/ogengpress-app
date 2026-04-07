import { useState, useRef, useEffect } from "react";
import { Product, CartItem, PaymentMethod } from "../types";

// --- ASSETS: ICONS (Minified) ---
const Icons = {
  Alert: () => (
    <svg
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
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
  CartCheck: () => (
    <svg
      width="40"
      height="40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  Search: () => (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  History: () => (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  ),
};

// --- LOGIKA: PENCARIAN PINTAR (Smart Search) ---
const levenshtein = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  if (Math.abs(a.length - b.length) > 1) return 2;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1))
        matrix[i][j] = matrix[i - 1][j - 1];
      else
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1),
        );
    }
  }
  return matrix[b.length][a.length];
};

const smartFilter = (products: Product[], query: string): Product[] => {
  if (!query) return [];
  const queryTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);
  return products.filter((p) => {
    const rawData =
      `${p.name} ${p.barcode} ${p.brand || ""} ${p.item_number || ""} ${p.compatibility || ""} ${p.category || ""}`.toLowerCase();
    const cleanData = rawData.replace(/[^a-z0-9]/g, "");

    return queryTerms.every((term) => {
      if (rawData.includes(term)) return true;
      const cleanTerm = term.replace(/[^a-z0-9]/g, "");
      if (cleanTerm.length > 0 && cleanData.includes(cleanTerm)) return true;

      if (term.length > 3) {
        const wordsInData = rawData.split(" ");
        return wordsInData.some(
          (word) =>
            Math.abs(word.length - term.length) <= 1 &&
            levenshtein(word, term) <= 1,
        );
      }
      return false;
    });
  });
};

// --- COMPONENT: SMART SEARCH ---
const SmartSearch = ({
  products,
  onSelect,
  onManual,
}: {
  products: Product[];
  onSelect: (p: Product) => void;
  onManual: () => void;
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    const matches = smartFilter(products, query);
    setSuggestions(matches.slice(0, 8));
    setSelectedIndex(0);
  }, [query, products]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();

      if (!query.trim()) {
        return;
      }

      const exactMatch = products.find((p) => p.barcode === query);
      if (exactMatch) selectItem(exactMatch);
      else if (suggestions.length > 0) selectItem(suggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setSuggestions([]);
    }
  };

  const selectItem = (p: Product) => {
    onSelect(p);
    setQuery("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div style={{ position: "relative", width: "100%", marginBottom: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <label
          style={{ fontWeight: "bold", color: "#cbd5e1", fontSize: "0.9rem" }}
        >
          Cari Barang
        </label>
        <button
          onClick={onManual}
          style={{
            background: "rgba(59, 130, 246, 0.15)",
            color: "#60a5fa",
            border: "1px solid #3b82f6",
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "0.75rem",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <Icons.Plus /> Manual
        </button>
      </div>
      <div style={{ position: "relative" }}>
        <input
          id="input-cari-barang"
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Scan / Ketik nama barang..."
          style={{
            width: "100%",
            padding: "12px 15px 12px 40px",
            border: "1px solid #3b82f6",
            borderRadius: "8px",
            background: "#334155",
            color: "#f8fafc",
            outline: "none",
            boxSizing: "border-box",
            fontSize: "1rem",
            fontWeight: "500",
          }}
        />
        <div
          style={{ position: "absolute", left: 12, top: 12, color: "#94a3b8" }}
        >
          <Icons.Search />
        </div>
      </div>
      {suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#1e293b",
            border: "1px solid #475569",
            borderRadius: "0 0 8px 8px",
            maxHeight: "350px",
            overflowY: "auto",
            zIndex: 100,
            boxShadow: "0 10px 20px rgba(0,0,0,0.5)",
          }}
        >
          {suggestions.map((p, idx) => (
            <div
              key={p.id}
              onClick={() => selectItem(p)}
              style={{
                padding: "12px 15px",
                cursor: "pointer",
                background: idx === selectedIndex ? "#3b82f6" : "transparent",
                color: idx === selectedIndex ? "white" : "#cbd5e1",
                borderBottom: "1px solid #334155",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: "bold", fontSize: "0.95rem" }}>
                  {p.name}
                </div>
                <div
                  style={{ fontSize: "0.75rem", opacity: 0.8, marginTop: 2 }}
                >
                  {p.brand ? `${p.brand} • ` : ""} Kode: {p.barcode}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontWeight: "bold",
                    color: idx === selectedIndex ? "white" : "#fbbf24",
                  }}
                >
                  Rp {p.price.toLocaleString("id-ID")}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    marginTop: 2,
                    color:
                      p.stock <= 2
                        ? idx === selectedIndex
                          ? "#fca5a5"
                          : "#ef4444"
                        : idx === selectedIndex
                          ? "#86efac"
                          : "#10b981",
                    fontWeight: "bold",
                  }}
                >
                  Stok: {p.stock}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface KasirProps {
  products: Product[];
  onSuccess: () => void;
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  pay: string;
  setPay: (val: string) => void;
}

export default function Kasir({
  products,
  onSuccess,
  cart,
  setCart,
  pay,
  setPay,
}: KasirProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("TUNAI");
  const [discountInput, setDiscountInput] = useState("");
  const [toast, setToast] = useState<{
    show: boolean;
    msg: string;
    type: "success" | "error";
  }>({ show: false, msg: "", type: "success" });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  const [manualForm, setManualForm] = useState({
    name: "",
    price: "",
    cost_price: "",
  });

  // ✨ LOGIKA TANGGAL REAKTIF & CCTV MESIN WAKTU ✨
  const getLocalToday = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Gunakan callback agar tidak mengakses localStorage terus menerus saat re-render
  const [activeDate, setActiveDate] = useState(() => {
    return localStorage.getItem("active_date") || getLocalToday();
  });
  const isTimeMachine = activeDate !== getLocalToday();

  useEffect(() => {
    // CCTV memantau perubahan localStorage dari halaman Laporan setiap 0.5 detik
    const interval = setInterval(() => {
      const storedDate = localStorage.getItem("active_date") || getLocalToday();
      if (storedDate !== activeDate) {
        setActiveDate(storedDate);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [activeDate]);

  const formatRp = (num: number) => "Rp " + num.toLocaleString("id-ID");

  const showNotification = (msg: string, type: "success" | "error") => {
    setToast({ show: true, msg, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleAddItem = (product: Product) => {
    const exist = cart.find((c) => c.id === product.id);
    const currentQty = exist ? Number(exist.qty) : 0;
    if (typeof product.id === "number" && currentQty + 1 > product.stock) {
      showNotification(
        `Stok ${product.name} habis! Sisa: ${product.stock}`,
        "error",
      );
      return;
    }
    if (exist) {
      setCart(
        cart.map((c) =>
          c.id === product.id ? { ...c, qty: Number(c.qty) + 1 } : c,
        ),
      );
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const handleManualSubmit = () => {
    if (!manualForm.name || !manualForm.price)
      return showNotification("Nama & Harga harus diisi!", "error");

    const price = parseInt(manualForm.price.replace(/\D/g, "")) || 0;
    const cost = parseInt(manualForm.cost_price.replace(/\D/g, "")) || 0;

    const manualProduct: any = {
      id: `MANUAL-${Date.now()}`,
      name: manualForm.name,
      price: price,
      cost_price: cost,
      stock: 999999,
      barcode: "MANUAL",
      category: "Manual",
      brand: "-",
      item_number: "-",
      isManual: true,
    };
    handleAddItem(manualProduct);
    setManualForm({ name: "", price: "", cost_price: "" });
    setShowManualModal(false);
    showNotification("Barang manual ditambahkan", "success");
  };

  const handleQtyChange = (id: number, val: string) => {
    if (val === "") {
      setCart(cart.map((c) => (c.id === id ? { ...c, qty: "" } : c)));
      return;
    }
    const num = parseInt(val);
    if (!isNaN(num)) {
      setCart(cart.map((c) => (c.id === id ? { ...c, qty: num } : c)));
    }
  };

  const handleQtyBlur = (id: number) => {
    const item = cart.find((c) => c.id === id);
    if (!item) return;
    let finalQty = Number(item.qty);
    if (item.qty === "" || finalQty < 1) finalQty = 1;
    if (typeof item.id === "number" && finalQty > item.stock) {
      showNotification(`Stok terbatas. Max: ${item.stock}`, "error");
      finalQty = item.stock;
    }
    setCart(cart.map((c) => (c.id === id ? { ...c, qty: finalQty } : c)));
  };

  const subTotal = cart.reduce((a, b) => a + b.price * Number(b.qty), 0);
  let discountValue = 0;
  if (discountInput.includes("%")) {
    const percent = parseFloat(discountInput.replace("%", ""));
    if (!isNaN(percent)) discountValue = (subTotal * percent) / 100;
  } else {
    discountValue = parseFloat(discountInput.replace(/\D/g, "")) || 0;
  }

  if (discountValue > subTotal) discountValue = subTotal;
  const grandTotal = subTotal - discountValue;
  const moneyReceived =
    paymentMethod === "TUNAI" ? Number(pay.replace(/\D/g, "")) : grandTotal;
  const kembalian = moneyReceived - grandTotal;

  const handlePreCheckout = () => {
    if (cart.length === 0) return;
    if (paymentMethod === "TUNAI" && moneyReceived < grandTotal) {
      showNotification("Uang pembayaran kurang!", "error");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleFinalCheckout = async () => {
    setIsProcessing(true);
    const cleanCart = cart.map((c) => ({ ...c, qty: Number(c.qty) || 1 }));

    // ✨ MENGIRIM TANGGAL AKTIF KE BACKEND ✨
    const res = await window.api.createTransaction(
      cleanCart,
      subTotal,
      discountValue,
      paymentMethod,
      activeDate,
    );

    setIsProcessing(false);
    setShowConfirmModal(false);
    if (res.success) {
      showNotification(
        `Transaksi Berhasil! ${isTimeMachine ? `(Masuk ke: ${activeDate})` : ""}`,
        "success",
      );
      setCart([]);
      setPay("");
      setDiscountInput("");
      setPaymentMethod("TUNAI");
      onSuccess();

      setTimeout(() => {
        const inputCari = document.getElementById("input-cari-barang");
        if (inputCari) {
          inputCari.focus();
        }
      }, 100);
    } else {
      showNotification("Gagal: " + res.error, "error");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        const inputUang = document.getElementById("input-uang");
        if (inputUang) {
          inputUang.focus();
        }
        return;
      }

      if (e.altKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        // Cegah membuka modal jika modal lain sedang terbuka
        if (!showConfirmModal) {
          setShowManualModal(true);
        }
        return;
      }

      if (e.altKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        if (cart.length > 0 && !showConfirmModal && !showManualModal) {
          // Menghapus 1 barang urutan paling bawah di keranjang
          setCart(cart.slice(0, -1));
        }
        return;
      }

      if (e.key === "Enter") {
        if (showConfirmModal) {
          e.preventDefault();
          handleFinalCheckout();
          return;
        }

        if (showManualModal) {
          e.preventDefault();
          handleManualSubmit();
          return;
        }

        if (cart.length > 0 && !showConfirmModal && !showManualModal) {
          const activeEl = document.activeElement;
          const isInput = activeEl?.tagName === "INPUT";
          const isUangInput = activeEl?.id === "input-uang";

          if (!isInput || isUangInput) {
            e.preventDefault();
            handlePreCheckout();
          }
        }
      }

      if (e.key === "Escape") {
        if (showConfirmModal) setShowConfirmModal(false);
        if (showManualModal) setShowManualModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    cart,
    pay,
    discountInput,
    paymentMethod,
    showConfirmModal,
    showManualModal,
    manualForm,
  ]);

  return (
    <div
      className="main-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 380px",
        background: "#0f172a",
        height: "100%",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; border: 2px solid #1e293b; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #64748b; }
        .kasir-row:hover { background-color: #334155 !important; transition: background-color 0.2s ease; }
        .empty-row:hover { background-color: transparent !important; cursor: default; }
        .kasir-row:hover input[type="number"] { background-color: #1e293b !important; border-color: #64748b !important; }
        .pay-btn { background: #1e293b; color: #94a3b8; border: 1px solid #334155; }
        .pay-btn:hover { background: #334155; }
        .pay-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(2px); }
        .modal-content { background: #1e293b; border: 1px solid #334155; padding: 30px; borderRadius: 16px; width: 360px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); text-align: center; animation: popIn 0.2s ease-out; }
        @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>

      {/* MODAL KONFIRMASI BAYAR */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div
              style={{
                background: "rgba(59, 130, 246, 0.1)",
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 15px",
                color: "#3b82f6",
              }}
            >
              <Icons.CartCheck />
            </div>
            <h3
              style={{
                margin: "0 0 5px 0",
                color: "#f8fafc",
                fontSize: "1.2rem",
              }}
            >
              Konfirmasi Bayar?
            </h3>
            <p
              style={{
                margin: "0 0 20px 0",
                color: "#94a3b8",
                fontSize: "0.9rem",
              }}
            >
              Pastikan uang diterima sudah sesuai.
            </p>
            <div
              style={{
                background: "#0f172a",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "25px",
                border: "1px solid #334155",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  fontSize: "0.9rem",
                  color: "#cbd5e1",
                }}
              >
                <span>Total Tagihan</span>
                <span style={{ fontWeight: "bold" }}>
                  {formatRp(grandTotal)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  fontSize: "0.9rem",
                  color: "#cbd5e1",
                }}
              >
                <span>Uang Diterima</span>
                <span style={{ fontWeight: "bold", color: "#4ade80" }}>
                  {formatRp(moneyReceived)}
                </span>
              </div>
              <div
                style={{
                  height: "1px",
                  background: "#334155",
                  margin: "8px 0",
                }}
              ></div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "1rem",
                  color: "#f8fafc",
                }}
              >
                <span>Kembalian</span>
                <span style={{ fontWeight: "800", color: "#fbbf24" }}>
                  {formatRp(kembalian < 0 ? 0 : kembalian)}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isProcessing}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "transparent",
                  border: "1px solid #475569",
                  color: "#cbd5e1",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Batal
              </button>
              <button
                onClick={handleFinalCheckout}
                disabled={isProcessing}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#3b82f6",
                  border: "none",
                  color: "white",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                {isProcessing ? "Memproses..." : "Ya, Bayar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✨ MODAL INPUT MANUAL PC ✨ */}
      {showManualModal && (
        <div className="modal-overlay">
          <div
            className="modal-content"
            style={{ width: "420px", padding: "30px" }}
          >
            <h3
              style={{
                margin: "0 0 25px 0",
                color: "#f8fafc",
                fontSize: "1.2rem",
              }}
            >
              Input Barang Manual
            </h3>

            <div style={{ marginBottom: "15px", textAlign: "left" }}>
              <label
                style={{
                  color: "#cbd5e1",
                  fontSize: "0.9rem",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Nama Barang / Jasa
              </label>
              <input
                autoFocus
                placeholder="Contoh: Ongkos Pasang"
                value={manualForm.name}
                onChange={(e) =>
                  setManualForm({ ...manualForm, name: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  background: "#0f172a",
                  border: "1px solid #475569",
                  color: "white",
                  fontSize: "1rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
                marginBottom: "30px",
                textAlign: "left",
              }}
            >
              <div>
                <label
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.9rem",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Harga Modal (Rp)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={manualForm.cost_price}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, cost_price: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    background: "#0f172a",
                    border: "1px solid #475569",
                    color: "#cbd5e1",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    color: "#fbbf24",
                    fontSize: "0.9rem",
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "bold",
                  }}
                >
                  Harga Jual (Rp)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={manualForm.price}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, price: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    background: "#0f172a",
                    border: "1px solid #fbbf24",
                    color: "#fbbf24",
                    fontWeight: "bold",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowManualModal(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "transparent",
                  border: "1px solid #475569",
                  color: "#cbd5e1",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Batal
              </button>
              <button
                onClick={handleManualSubmit}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#3b82f6",
                  border: "none",
                  color: "white",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Tambahkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFIKASI */}
      <div
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          zIndex: 9999,
          background: "#1e293b",
          color: "#f8fafc",
          padding: "16px 24px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
          border: "1px solid #334155",
          borderLeft:
            toast.type === "success"
              ? "5px solid #10b981"
              : "5px solid #ef4444",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          transition: "all 0.4s",
          opacity: toast.show ? 1 : 0,
          transform: toast.show ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <div
          style={{ color: toast.type === "success" ? "#10b981" : "#ef4444" }}
        >
          {toast.type === "success" ? <Icons.Check /> : <Icons.Alert />}
        </div>
        <div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "#94a3b8",
              textTransform: "uppercase",
            }}
          >
            {toast.type === "success" ? "BERHASIL" : "GAGAL"}
          </div>
          <div style={{ fontSize: "0.9rem", fontWeight: "500" }}>
            {toast.msg}
          </div>
        </div>
      </div>

      <div
        className="content-area"
        style={{
          background: "#0f172a",
          padding: "30px",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* ✨ HEADER KERANJANG & BADGE HISTORY ✨ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "#f8fafc",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            🛒 Keranjang Belanja
          </h3>

          {isTimeMachine && (
            <div
              style={{
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                color: "#fbbf24",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "0.75rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                letterSpacing: "0.5px",
              }}
            >
              <div style={{ display: "flex", transform: "scale(0.8)" }}>
                <Icons.History />
              </div>
              HISTORY: {activeDate}
            </div>
          )}
        </div>
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            background: "#1e293b",
            borderRadius: "12px",
            border: "1px solid #334155",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="custom-scroll" style={{ overflowY: "auto", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                <tr>
                  {["Barang", "Harga", "Qty", "Total", ""].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        background: "#0f172a",
                        padding: "16px 20px",
                        textAlign:
                          i === 2 ? "center" : i === 3 ? "right" : "left",
                        color: "#cbd5e1",
                        fontSize: "0.8rem",
                        borderBottom: "1px solid #334155",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cart.length === 0 ? (
                  <tr className="empty-row">
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        padding: "60px",
                        color: "#64748b",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "3rem",
                          opacity: 0.2,
                          marginBottom: "10px",
                        }}
                      >
                        🛒
                      </div>
                      <i>Cari barang untuk memulai transaksi.</i>
                    </td>
                  </tr>
                ) : (
                  cart.map((c) => (
                    <tr
                      key={c.id}
                      className="kasir-row"
                      style={{ borderBottom: "1px solid #334155" }}
                    >
                      <td style={{ padding: "16px 20px", color: "#f8fafc" }}>
                        <div style={{ fontWeight: "600" }}>{c.name}</div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          {c.barcode === "MANUAL" ? (
                            <span
                              style={{ color: "#60a5fa", fontWeight: "bold" }}
                            >
                              INPUT MANUAL
                            </span>
                          ) : (
                            c.barcode
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px", color: "#cbd5e1" }}>
                        {formatRp(c.price)}
                      </td>
                      <td style={{ padding: "16px 20px", textAlign: "center" }}>
                        <input
                          type="number"
                          value={c.qty}
                          onChange={(e) =>
                            handleQtyChange(c.id as any, e.target.value)
                          }
                          onBlur={() => handleQtyBlur(c.id as any)}
                          style={{
                            width: "50px",
                            textAlign: "center",
                            padding: "8px",
                            background: "#1e293b",
                            border: "1px solid #475569",
                            borderRadius: "6px",
                            color: "#f8fafc",
                            outline: "none",
                            fontWeight: "bold",
                          }}
                        />
                      </td>
                      <td
                        style={{
                          padding: "16px 20px",
                          textAlign: "right",
                          color: "#fbbf24",
                          fontWeight: "bold",
                        }}
                      >
                        {formatRp(c.price * Number(c.qty))}
                      </td>
                      <td style={{ padding: "16px 20px", textAlign: "center" }}>
                        <button
                          onClick={() =>
                            setCart(cart.filter((x) => x.id !== c.id))
                          }
                          style={{
                            background: "rgba(239,68,68,0.2)",
                            color: "#ef4444",
                            border: "none",
                            borderRadius: "6px",
                            padding: "8px 10px",
                            cursor: "pointer",
                            transition: "0.2s",
                          }}
                          title="Hapus"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div
        className="sidebar custom-scroll"
        style={{
          display: "flex",
          flexDirection: "column",
          background: "#1e293b",
          borderLeft: "1px solid #334155",
          padding: "25px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            background: "#0f172a",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #334155",
            marginBottom: "20px",
          }}
        >
          <SmartSearch
            products={products}
            onSelect={handleAddItem}
            onManual={() => setShowManualModal(true)}
          />
        </div>
        <div
          style={{
            background: "#0f172a",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #334155",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "#94a3b8",
              marginBottom: "10px",
              fontSize: "0.9rem",
            }}
          >
            <span>Subtotal</span>
            <span>{formatRp(subTotal)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
              Potongan
            </span>
            <input
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              placeholder="Rp / %"
              style={{
                width: "80px",
                padding: "4px 8px",
                textAlign: "right",
                background: "transparent",
                border: "1px solid #475569",
                borderRadius: "4px",
                color: "#ef4444",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
          </div>
          <div
            style={{
              height: "1px",
              background: "#334155",
              marginBottom: "15px",
            }}
          ></div>
          <div
            style={{
              fontSize: "0.9rem",
              color: "#94a3b8",
              marginBottom: "5px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            GRAND TOTAL
          </div>
          <div
            style={{
              fontSize: "2.5rem",
              fontWeight: "800",
              color: "#f8fafc",
              textAlign: "right",
              letterSpacing: "-1px",
            }}
          >
            {formatRp(grandTotal)}
          </div>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              fontSize: "0.85rem",
              color: "#94a3b8",
              marginBottom: "8px",
              fontWeight: "500",
            }}
          >
            Metode Pembayaran
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            {["TUNAI", "QRIS"].map((m) => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m as PaymentMethod)}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border:
                    paymentMethod === m
                      ? "1px solid #3b82f6"
                      : "1px solid #334155",
                  background:
                    paymentMethod === m ? "rgba(59, 130, 246, 0.2)" : "#1e293b",
                  color: paymentMethod === m ? "#60a5fa" : "#94a3b8",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                {m === "TUNAI" ? (
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                ) : (
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
                  </svg>
                )}
                {m}
              </button>
            ))}
          </div>
        </div>
        {paymentMethod === "TUNAI" && (
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                fontWeight: "600",
                color: "#cbd5e1",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Uang Diterima
            </label>
            <input
              id="input-uang"
              value={pay}
              onChange={(e) => setPay(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && cart.length > 0) {
                  e.preventDefault();
                  handlePreCheckout();
                }
              }}
              placeholder="0"
              type="number"
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "1.2rem",
                fontWeight: "bold",
                border: "1px solid #475569",
                borderRadius: "8px",
                color: "#4ade80",
                background: "#334155",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "15px",
            background:
              kembalian < 0 ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
            borderRadius: "8px",
            marginBottom: "20px",
            border:
              kembalian < 0
                ? "1px solid rgba(239,68,68,0.2)"
                : "1px solid rgba(16,185,129,0.2)",
          }}
        >
          <strong style={{ color: "#cbd5e1" }}>Kembali:</strong>
          <strong
            style={{
              color: kembalian < 0 ? "#fca5a5" : "#4ade80",
              fontSize: "1.2rem",
            }}
          >
            {formatRp(kembalian < 0 ? 0 : kembalian)}
          </strong>
        </div>
        <button
          onClick={handlePreCheckout}
          disabled={!cart.length}
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "1.1rem",
            fontWeight: "bold",
            background: cart.length ? "#2563eb" : "#334155",
            color: cart.length ? "white" : "#64748b",
            border: "none",
            borderRadius: "8px",
            cursor: cart.length ? "pointer" : "not-allowed",
            transition: "0.2s",
            boxShadow: cart.length
              ? "0 4px 12px rgba(37, 99, 235, 0.3)"
              : "none",
            marginTop: "auto",
          }}
        >
          PROSES BAYAR
        </button>
      </div>
    </div>
  );
}
