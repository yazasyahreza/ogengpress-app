import { useState, useEffect, useMemo, memo } from "react";

// --- MESIN GETAR (HAPTIC FEEDBACK) ---
const vibrate = (pattern: number | number[]) => {
  if (typeof window !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// --- GET TANGGAL LOKAL ---
const getLocalToday = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// --- INTERFACES ---
interface Product {
  id: number | string;
  name: string;
  price: number;
  stock?: number;
  image_url?: string;
  part_code?: string;
  item_number?: string;
  compatibility?: string;
  barcode?: string;
  category?: string;
  brand?: string;
  cost_price?: number;
  [key: string]: any;
}

interface CartItem extends Product {
  qty: number;
  isManual?: boolean;
}

// --- ICONS (Minified) ---
const Icons = {
  Search: () => (
    <svg
      style={{ width: "20px", height: "20px", flexShrink: 0 }}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Box: () => (
    <svg
      style={{ width: "24px", height: "24px", flexShrink: 0 }}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  Trash: () => (
    <svg
      style={{ width: "20px", height: "20px", flexShrink: 0 }}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Plus: () => (
    <svg
      style={{ width: "14px", height: "14px", flexShrink: 0 }}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      viewBox="0 0 24 24"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Minus: () => (
    <svg
      style={{ width: "14px", height: "14px", flexShrink: 0 }}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      viewBox="0 0 24 24"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  History: () => (
    <svg
      style={{ width: "14px", height: "14px", flexShrink: 0 }}
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

// --- COMPONENT: CART ITEM ROW ---
const CartItemRow = memo(
  ({
    item,
    onUpdateQty,
    onRemove,
  }: {
    item: CartItem;
    onUpdateQty: (id: number | string, delta: number) => void;
    onRemove: (id: number | string) => void;
  }) => (
    <div
      style={{
        background: "#1e293b",
        padding: "12px",
        borderRadius: "10px",
        marginBottom: "10px",
        border: "1px solid #334155",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontWeight: "bold",
            color: "white",
            fontSize: "14px",
            marginBottom: "4px",
          }}
        >
          {item.name}
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div
            style={{ color: "#fbbf24", fontSize: "13px", fontWeight: "600" }}
          >
            Rp {item.price.toLocaleString("id-ID")}
          </div>
          {/* Tampilkan indikator M (Manual) agar kasir tahu ini barang luar */}
          {item.isManual && (
            <div
              style={{
                fontSize: "10px",
                background: "#475569",
                color: "white",
                padding: "2px 6px",
                borderRadius: "4px",
                fontWeight: "bold",
              }}
            >
              Manual
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "#0f172a",
          padding: "4px",
          borderRadius: "8px",
          border: "1px solid #334155",
        }}
      >
        <button onClick={() => onUpdateQty(item.id, -1)} style={qtyBtnStyle}>
          <Icons.Minus />
        </button>
        <span
          style={{
            color: "white",
            fontWeight: "bold",
            minWidth: "24px",
            textAlign: "center",
            fontSize: "14px",
          }}
        >
          {item.qty}
        </span>
        <button onClick={() => onUpdateQty(item.id, 1)} style={qtyBtnStyle}>
          <Icons.Plus />
        </button>
      </div>
      <button
        onClick={() => onRemove(item.id)}
        style={{
          marginLeft: "12px",
          background: "rgba(239, 68, 68, 0.1)",
          border: "none",
          color: "#ef4444",
          borderRadius: "6px",
          width: "32px",
          height: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icons.Trash />
      </button>
    </div>
  ),
);

export default function KasirMobile() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // ✨ STATE UNTUK MODAL TAMBAH MANUAL ✨
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    name: "",
    price: "",
    cost_price: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<
    "TUNAI" | "QRIS"
  >("TUNAI");
  const [cashReceived, setCashReceived] = useState<string>("");
  const [discount, setDiscount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const ip = localStorage.getItem("server_ip");

  const activeDate = localStorage.getItem("active_date") || getLocalToday();
  const isTimeMachine = activeDate !== getLocalToday();

  const fetchData = async () => {
    try {
      const res = await fetch(`http://${ip}:3000/api/products`);
      const data = await res.json();
      const safeData = Array.isArray(data)
        ? data.map((p: any) => ({
            ...p,
            price: Number(p.price) || Number(p.harga_jual) || 0,
            stock: Number(p.stock) || 0,
            cost_price: Number(p.cost_price) || 0,
          }))
        : [];
      setProducts(safeData);
    } catch (err) {
      console.error("Gagal ambil data barang");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderImageSource = (imgRaw: string) => {
    if (!imgRaw) return null;
    if (imgRaw.startsWith("data:image") || imgRaw.startsWith("http"))
      return imgRaw;
    return `http://${ip}:3000/uploads/${imgRaw}`;
  };

  const searchResults = useMemo(() => {
    if (!search) return [];
    const searchTerms = search
      .toLowerCase()
      .split(" ")
      .filter((k) => k.trim() !== "");
    return products
      .filter((p) => {
        const productDictionary =
          `${p.name || ""} ${p.barcode || ""} ${p.item_number || ""} ${p.part_code || ""} ${p.brand || ""} ${p.compatibility || ""} ${p.category || ""}`.toLowerCase();
        return searchTerms.every((term) => productDictionary.includes(term));
      })
      .slice(0, 15);
  }, [search, products]);

  const addToCart = (product: Product, isManual = false) => {
    if (!isManual && (product.stock || 0) <= 0) {
      vibrate([50, 100, 50, 100]);
      return alert("Stok habis!");
    }
    vibrate([30, 50, 30]);
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        if (!isManual && exists.qty + 1 > (product.stock || 0)) {
          vibrate([50, 100, 50]);
          alert("Stok mentok!");
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [...prev, { ...product, qty: 1, isManual }];
    });
    setSearch("");
    setShowDropdown(false);
  };

  // ✨ FUNGSI BARU: BUKA MODAL MANUAL ✨
  const openManualModal = () => {
    vibrate(30);
    setManualForm({ name: search, price: "", cost_price: "" });
    setShowDropdown(false);
    setShowManualModal(true);
  };

  // ✨ FUNGSI BARU: SIMPAN BARANG MANUAL ✨
  const submitManualItem = () => {
    const price = parseInt(manualForm.price) || 0;
    const cost = parseInt(manualForm.cost_price) || 0;

    if (!manualForm.name) return alert("Nama barang harus diisi!");
    if (price <= 0) return alert("Harga Jual harus lebih dari 0!");
    if (cost > price)
      return alert("Harga Modal tidak boleh lebih besar dari Harga Jual!");

    vibrate(50);
    addToCart(
      {
        id: `manual-${Date.now()}`,
        name: manualForm.name,
        price: price,
        stock: 9999,
        cost_price: cost,
      },
      true,
    );

    setShowManualModal(false);
  };

  const updateQty = (id: number | string, delta: number) => {
    vibrate(40);
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (delta > 0 && !item.isManual) {
            const product = products.find((p) => p.id === id);
            if (product && item.qty + 1 > (product.stock || 0)) {
              vibrate([50, 100, 50]);
              alert("Batas stok!");
              return item;
            }
          }
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : item;
        }
        return item;
      }),
    );
  };

  const removeItem = (id: number | string) => {
    vibrate(80);
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discountVal = parseInt(discount) || 0;
  const grandTotal = Math.max(0, subtotal - discountVal);
  const kembalian = (parseInt(cashReceived) || 0) - grandTotal;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      vibrate([50, 100, 50]);
      return alert("Keranjang kosong!");
    }
    if (
      paymentMethod === "TUNAI" &&
      (parseInt(cashReceived) || 0) < grandTotal
    ) {
      vibrate([50, 100, 50]);
      return alert("Uang kurang!");
    }

    vibrate(50);
    const confirmMsg = `Total: Rp ${grandTotal.toLocaleString()}\nDiskon: Rp ${discountVal.toLocaleString()}\n\nProses Transaksi?`;
    if (!confirm(confirmMsg)) return;

    setIsProcessing(true);
    try {
      const checkoutItems = cart.map((item) => ({
        id: item.isManual ? null : item.id,
        name: item.name,
        qty: item.qty,
        price: item.price,
        cost_price: item.cost_price || 0,
      }));
      const response = await fetch(`http://${ip}:3000/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: checkoutItems,
          total: subtotal,
          discount: discountVal,
          paymentMethod: paymentMethod,
          date: `${activeDate}T${new Date().toISOString().split("T")[1]}`,
        }),
      });
      const result = await response.json();
      if (result.success) {
        vibrate([50, 100, 50, 100, 200]);
        alert(
          `Transaksi Sukses!${isTimeMachine ? `\nMasuk ke pembukuan tanggal: ${activeDate}` : ""}\nKembalian: Rp ${kembalian.toLocaleString()}`,
        );
        setCart([]);
        setCashReceived("");
        setSearch("");
        setDiscount("");
        fetchData();
      } else {
        throw new Error(result.error || "Gagal memproses di server");
      }
    } catch (error: any) {
      vibrate([50, 200, 50, 200]);
      alert("Gagal: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#0f172a",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* HEADER KASIR */}
      <div
        style={{
          padding: "15px",
          paddingBottom: isTimeMachine ? "10px" : "15px",
          background: "#1e293b",
          borderBottom: "1px solid #334155",
          flexShrink: 0,
          zIndex: 50,
        }}
      >
        <div style={{ position: "relative" }}>
          <input
            placeholder="Cari barang / scan..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowDropdown(true);
            }}
            style={inputSearchStyle}
          />
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              color: "#64748b",
            }}
          >
            <Icons.Search />
          </div>

          {showDropdown && search && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                marginTop: "5px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                zIndex: 100,
                maxHeight: "400px",
                overflowY: "auto",
              }}
            >
              {searchResults.length === 0 ? (
                <div
                  onClick={openManualModal}
                  style={{
                    padding: "15px",
                    textAlign: "center",
                    color: "#60a5fa",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px",
                    background: "rgba(59, 130, 246, 0.1)",
                    borderRadius: "8px",
                  }}
                >
                  + Tambah Manual "{search}"
                </div>
              ) : (
                searchResults.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => addToCart(p)}
                    style={{
                      padding: "12px",
                      borderBottom: "1px solid #334155",
                      color: "white",
                      cursor: "pointer",
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "45px",
                        height: "45px",
                        borderRadius: "6px",
                        background: "#0f172a",
                        overflow: "hidden",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #334155",
                      }}
                    >
                      {p.image_url ? (
                        <img
                          src={renderImageSource(p.image_url) || ""}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span style={{ color: "#64748b" }}>
                          <Icons.Box />
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "14px",
                          marginBottom: "2px",
                        }}
                      >
                        {p.name}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
                          fontSize: "11px",
                          color: "#94a3b8",
                        }}
                      >
                        {p.brand && <span>{p.brand}</span>}
                        {p.item_number && (
                          <span style={{ color: "#fbbf24" }}>
                            • {p.item_number}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: "70px" }}>
                      <div
                        style={{
                          color: "#fbbf24",
                          fontWeight: "bold",
                          fontSize: "13px",
                        }}
                      >
                        Rp {p.price.toLocaleString("id-ID")}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: (p.stock || 0) <= 0 ? "#ef4444" : "#10b981",
                          marginTop: "2px",
                          fontWeight: "600",
                        }}
                      >
                        Stok: {p.stock || 0}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {isTimeMachine && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              marginTop: "12px",
              color: "#fbbf24",
              fontSize: "11px",
              fontWeight: "600",
              background: "rgba(245, 158, 11, 0.1)",
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px dashed rgba(245, 158, 11, 0.3)",
            }}
          >
            <Icons.History />
            Mode History: Transaksi masuk ke {activeDate}
          </div>
        )}
      </div>

      {/* LIST KERANJANG */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "15px",
          paddingBottom: "320px",
        }}
      >
        {cart.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#475569",
              marginTop: "60px",
              fontSize: "14px",
            }}
          >
            <div
              style={{ fontSize: "40px", marginBottom: "10px", opacity: 0.3 }}
            >
              🛒
            </div>
            Keranjang Kosong
          </div>
        ) : (
          cart.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onUpdateQty={updateQty}
              onRemove={removeItem}
            />
          ))
        )}
      </div>

      {/* PANEL PEMBAYARAN */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#1e293b",
          borderTop: "1px solid #334155",
          padding: "15px",
          zIndex: 40,
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
          boxShadow: "0 -5px 20px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", gap: "8px", marginBottom: "15px" }}>
          {["TUNAI", "QRIS"].map((m) => (
            <button
              key={m}
              onClick={() => {
                vibrate(30);
                setPaymentMethod(m as any);
              }}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border:
                  paymentMethod === m
                    ? "1px solid #3b82f6"
                    : "1px solid #334155",
                background:
                  paymentMethod === m
                    ? "rgba(59, 130, 246, 0.2)"
                    : "transparent",
                color: paymentMethod === m ? "#60a5fa" : "#64748b",
                fontSize: "11px",
                fontWeight: "bold",
                transition: "all 0.2s",
              }}
            >
              {m}
            </button>
          ))}
        </div>
        <div
          style={{
            marginBottom: "15px",
            borderBottom: "1px dashed #334155",
            paddingBottom: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
              color: "#94a3b8",
              fontSize: "13px",
            }}
          >
            <span>Subtotal</span>
            <span>Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
            }}
          >
            <span style={{ color: "#ef4444", fontSize: "13px" }}>
              Potongan (-)
            </span>
            <input
              type="number"
              placeholder="Rp 0"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              style={{
                background: "#0f172a",
                border: "1px solid #ef4444",
                color: "#ef4444",
                padding: "4px 8px",
                borderRadius: "6px",
                width: "90px",
                textAlign: "right",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "10px",
              color: "white",
            }}
          >
            <span style={{ fontWeight: "bold", fontSize: "14px" }}>
              Total Akhir
            </span>
            <span
              style={{ fontWeight: "800", fontSize: "18px", color: "#fbbf24" }}
            >
              Rp {grandTotal.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
        {paymentMethod === "TUNAI" && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <span
              style={{ color: "#94a3b8", fontSize: "13px", fontWeight: "600" }}
            >
              Uang Diterima
            </span>
            <div style={{ textAlign: "right" }}>
              <input
                type="number"
                placeholder="0"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                style={{
                  background: "#0f172a",
                  border: "1px solid #475569",
                  color: "white",
                  padding: "8px",
                  borderRadius: "6px",
                  width: "120px",
                  textAlign: "right",
                  fontSize: "16px",
                  fontWeight: "bold",
                  outline: "none",
                }}
              />
              <div
                style={{
                  fontSize: "11px",
                  color: kembalian < 0 ? "#ef4444" : "#10b981",
                  marginTop: "4px",
                  fontWeight: "600",
                }}
              >
                {kembalian < 0 ? "Kurang" : "Kembali"}: Rp{" "}
                {Math.abs(kembalian).toLocaleString("id-ID")}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleCheckout}
          disabled={isProcessing}
          style={{
            width: "100%",
            padding: "14px",
            background: isProcessing ? "#475569" : "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontWeight: "bold",
            fontSize: "16px",
            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
            transition: "all 0.2s",
          }}
        >
          {isProcessing ? "MEMPROSES..." : "BAYAR SEKARANG"}
        </button>
      </div>

      {/* ✨ MODAL TAMBAH MANUAL (MUNCUL DI TENGAH LAYAR) ✨ */}
      {showManualModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#1e293b",
              padding: "20px",
              borderRadius: "15px",
              width: "100%",
              maxWidth: "350px",
              border: "1px solid #334155",
            }}
          >
            <h3
              style={{
                color: "#3b82f6",
                marginTop: 0,
                textAlign: "center",
                fontSize: "16px",
              }}
            >
              📝 Tambah Barang Bebas
            </h3>

            <div style={{ marginBottom: "15px" }}>
              <label style={labelStyle}>Nama Barang / Jasa</label>
              <input
                value={manualForm.name}
                onChange={(e) =>
                  setManualForm({ ...manualForm, name: e.target.value })
                }
                style={modalInputStyle}
                placeholder="Contoh: Tambal Ban"
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              <div>
                <label style={{ ...labelStyle, color: "#94a3b8" }}>
                  Harga Modal
                </label>
                <input
                  type="number"
                  placeholder="Rp 0"
                  value={manualForm.cost_price}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, cost_price: e.target.value })
                  }
                  style={{
                    ...modalInputStyle,
                    borderColor: "#475569",
                    color: "#cbd5e1",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    ...labelStyle,
                    color: "#fbbf24",
                    fontWeight: "bold",
                  }}
                >
                  Harga Jual
                </label>
                <input
                  type="number"
                  placeholder="Rp 0"
                  value={manualForm.price}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, price: e.target.value })
                  }
                  style={{
                    ...modalInputStyle,
                    borderColor: "#fbbf24",
                    color: "#fbbf24",
                    fontWeight: "bold",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => {
                  vibrate(30);
                  setShowManualModal(false);
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  background: "transparent",
                  border: "1px solid #475569",
                  color: "#cbd5e1",
                  fontWeight: "bold",
                }}
              >
                Batal
              </button>
              <button
                onClick={submitManualItem}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  background: "#3b82f6",
                  border: "none",
                  color: "white",
                  fontWeight: "bold",
                  boxShadow: "0 4px 10px rgba(59, 130, 246, 0.3)",
                }}
              >
                Tambahkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- STYLES BAWAHAN ---
const qtyBtnStyle = {
  width: "30px",
  height: "30px",
  background: "#334155",
  color: "white",
  border: "none",
  borderRadius: "6px",
  fontWeight: "bold" as const,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const inputSearchStyle = {
  width: "100%",
  padding: "12px 12px 12px 40px",
  borderRadius: "8px",
  background: "#1e293b",
  color: "white",
  border: "1px solid #3b82f6",
  fontSize: "15px",
  boxSizing: "border-box" as const,
  outline: "none",
};
const modalInputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  background: "#0f172a",
  border: "1px solid #475569",
  color: "white",
  boxSizing: "border-box" as const,
  outline: "none",
};
const labelStyle = {
  color: "#cbd5e1",
  fontSize: "12px",
  display: "block",
  marginBottom: "4px",
};
