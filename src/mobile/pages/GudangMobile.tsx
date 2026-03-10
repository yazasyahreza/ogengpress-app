import { useState, useEffect, useMemo, useCallback, memo } from "react";

// --- MESIN GETAR (HAPTIC FEEDBACK) ---
const vibrate = (pattern: number | number[]) => {
  if (typeof window !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// --- ICONS (Minified) ---
const Icons = {
  Edit: () => (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
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
      viewBox="0 0 24 24"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      viewBox="0 0 24 24"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Box: () => (
    <svg
      width="24"
      height="24"
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
  Camera: () => (
    <svg
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
};

// --- HOOK: DEBOUNCE ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// --- ✨ KOMPONEN SKELETON (BAYANGAN LOADING) ✨ ---
const ProductSkeleton = () => (
  <div
    style={{
      background: "#1e293b",
      padding: "12px",
      borderRadius: "10px",
      marginBottom: "10px",
      border: "1px solid #334155",
      display: "flex",
      gap: "12px",
    }}
  >
    <div
      className="skeleton-pulse"
      style={{
        width: "60px",
        height: "60px",
        borderRadius: "8px",
        flexShrink: 0,
      }}
    ></div>
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        justifyContent: "center",
      }}
    >
      <div
        className="skeleton-pulse"
        style={{ width: "70%", height: "14px", borderRadius: "4px" }}
      ></div>
      <div style={{ display: "flex", gap: "6px" }}>
        <div
          className="skeleton-pulse"
          style={{ width: "50px", height: "12px", borderRadius: "4px" }}
        ></div>
        <div
          className="skeleton-pulse"
          style={{ width: "60px", height: "12px", borderRadius: "4px" }}
        ></div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "5px",
        }}
      >
        <div
          className="skeleton-pulse"
          style={{ width: "40px", height: "14px", borderRadius: "4px" }}
        ></div>
        <div
          className="skeleton-pulse"
          style={{ width: "50px", height: "14px", borderRadius: "4px" }}
        ></div>
        <div
          className="skeleton-pulse"
          style={{ width: "20px", height: "18px", borderRadius: "4px" }}
        ></div>
      </div>
    </div>
  </div>
);

// --- COMPONENT: PRODUCT ITEM (Memoized) ---
const ProductItem = memo(({ p, onEdit, ip, setPreviewImage }: any) => {
  const renderImageSource = (imgRaw: string) => {
    if (!imgRaw) return null;
    if (imgRaw.startsWith("data:image")) return imgRaw;
    if (imgRaw.startsWith("http")) return imgRaw;
    return `http://${ip}:3000/uploads/${imgRaw}`;
  };

  return (
    <div
      onClick={() => {
        vibrate(20);
        onEdit(p);
      }}
      style={{
        background: "#1e293b",
        padding: "12px",
        borderRadius: "10px",
        marginBottom: "10px",
        border: "1px solid #334155",
        display: "flex",
        gap: "12px",
        position: "relative",
        cursor: "pointer",
      }}
    >
      <div
        onClick={(e) => {
          if (p.image_url) {
            e.stopPropagation();
            setPreviewImage(renderImageSource(p.image_url));
          }
        }}
        style={{
          width: "60px",
          height: "60px",
          background: "#0f172a",
          borderRadius: "8px",
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
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e: any) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <span style={{ fontSize: "24px" }}>📦</span>
        )}
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontWeight: "bold",
            fontSize: "14px",
            marginBottom: "4px",
            lineHeight: "1.2",
            paddingRight: "25px",
          }}
        >
          {p.name}
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "5px",
            marginBottom: "4px",
          }}
        >
          {p.category && (
            <span
              style={{
                fontSize: "10px",
                background: "#334155",
                padding: "2px 6px",
                borderRadius: "4px",
                color: "#94a3b8",
              }}
            >
              {p.category}
            </span>
          )}
          {p.brand && (
            <span
              style={{
                fontSize: "10px",
                background: "#334155",
                padding: "2px 6px",
                borderRadius: "4px",
                color: "#94a3b8",
              }}
            >
              {p.brand}
            </span>
          )}
        </div>
        {(p.item_number || p.compatibility) && (
          <div style={{ marginBottom: "6px" }}>
            {p.item_number && (
              <span
                style={{
                  fontSize: "10px",
                  background: "#d97706",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  color: "white",
                  fontWeight: "bold",
                  marginRight: "5px",
                }}
              >
                Rak: {p.item_number}
              </span>
            )}
            {p.compatibility && (
              <span
                style={{
                  fontSize: "10px",
                  color: "#10b981",
                  fontStyle: "italic",
                }}
              >
                {p.compatibility}
              </span>
            )}
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            borderTop: "1px dashed #334155",
            paddingTop: "6px",
          }}
        >
          <div>
            <div style={{ fontSize: "10px", color: "#64748b" }}>Modal</div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              Rp {(p.cost_price || 0).toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#64748b" }}>Jual</div>
            <div
              style={{ fontSize: "12px", color: "#fbbf24", fontWeight: "bold" }}
            >
              Rp {p.price.toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "10px", color: "#64748b" }}>Stok</div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                color:
                  p.stock <= 0
                    ? "#ef4444"
                    : p.stock === 1
                      ? "#fbbf24"
                      : "#10b981",
              }}
            >
              {p.stock}
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          color: "#475569",
        }}
      >
        <Icons.Edit />
      </div>
    </div>
  );
});

export default function GudangMobile() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [filter, setFilter] = useState<"SEMUA" | "KRITIS" | "HABIS">("SEMUA");
  const [selectedCategory, setSelectedCategory] = useState(""); // ✨ STATE BARU UNTUK KATEGORI MOBILE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageMsg, setImageMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [form, setForm] = useState({
    id: 0,
    name: "",
    barcode: "",
    stock: "",
    price: "",
    cost_price: "",
    category: "",
    item_number: "",
    brand: "",
    compatibility: "",
    image_url: "",
  });

  const [lastEntries, setLastEntries] = useState(() => {
    const saved = localStorage.getItem("mobile_last_entries");
    return saved ? JSON.parse(saved) : {};
  });

  const ip = window.location.hostname;

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://${ip}:3000/api/products`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal ambil data");
    } finally {
      setTimeout(() => setIsLoading(false), 400);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✨ Reset ke halaman 1 jika ngetik pencarian atau ganti kategori
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filter, selectedCategory]);

  // ✨ AMBIL DAFTAR KATEGORI UNIK OTOMATIS
  const categories = useMemo(() => {
    return [
      ...new Set(
        products.map((p) => p.category).filter((c) => c && c.trim() !== ""),
      ),
    ].sort();
  }, [products]);

  const isDuplicate = useMemo(() => {
    if (!form.barcode) return false;
    return products.some(
      (p) =>
        p.barcode &&
        p.barcode.trim().toLowerCase() === form.barcode.trim().toLowerCase() &&
        (!isEditMode || p.id !== form.id),
    );
  }, [form.barcode, products, isEditMode, form.id]);

  const handleOpenAdd = () => {
    setForm({
      id: 0,
      name: lastEntries.name || "",
      barcode: lastEntries.barcode || "",
      stock: lastEntries.stock || "",
      price: lastEntries.price || "",
      cost_price: lastEntries.cost_price || "",
      category: lastEntries.category || "",
      item_number: lastEntries.item_number || "",
      brand: lastEntries.brand || "",
      compatibility: lastEntries.compatibility || "",
      image_url: "",
    });
    setImageMsg(null);
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleOpenEdit = useCallback((p: any) => {
    setForm({
      id: p.id,
      name: p.name,
      barcode: p.barcode || "",
      stock: p.stock.toString(),
      price: p.price.toString(),
      cost_price: (p.cost_price || 0).toString(),
      category: p.category || "",
      item_number: p.item_number || "",
      brand: p.brand || "",
      compatibility: p.compatibility || "",
      image_url: p.image_url || "",
    });
    setImageMsg(null);
    setIsEditMode(true);
    setShowModal(true);
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageMsg(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > 800) {
              height *= 800 / width;
              width = 800;
            }
          } else {
            if (height > 800) {
              width *= 800 / height;
              height = 800;
            }
          }
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
          setForm((prev) => ({
            ...prev,
            image_url: canvas.toDataURL("image/webp", 0.7),
          }));
          setImageMsg({
            type: "success",
            text: "✅ Foto berhasil dikompres (WebP)",
          });
        } catch (error) {
          setImageMsg({ type: "error", text: "❌ Gagal memproses gambar" });
        }
      };
      img.onerror = () => setImageMsg({ type: "error", text: "❌ File rusak" });
      img.src = event.target?.result as string;
    };
    reader.onerror = () =>
      setImageMsg({ type: "error", text: "❌ Gagal membaca file" });
    reader.readAsDataURL(file);
  };

  const renderFormImagePreview = () => {
    if (!form.image_url) return null;
    if (
      form.image_url.startsWith("data:image") ||
      form.image_url.startsWith("http")
    )
      return form.image_url;
    return `http://${ip}:3000/uploads/${form.image_url}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDuplicate) return;
    vibrate(30);

    const optimisticProduct = {
      ...form,
      stock: Number(form.stock),
      price: Number(form.price),
      cost_price: Number(form.cost_price),
      id: isEditMode ? form.id : `temp-${Date.now()}`,
    };

    setProducts((prev) => {
      if (isEditMode)
        return prev.map((p) => (p.id === form.id ? optimisticProduct : p));
      else return [optimisticProduct, ...prev];
    });

    if (!isEditMode) {
      setLastEntries({ ...form, image_url: "" });
      localStorage.setItem(
        "mobile_last_entries",
        JSON.stringify({ ...form, image_url: "" }),
      );
    }
    setShowModal(false);

    const payloadToServer: any = { ...optimisticProduct };
    if (!isEditMode) delete payloadToServer.id;

    fetch(`http://${ip}:3000/api/product/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadToServer),
    })
      .then(async (res) => {
        const responseData = await res.json();
        if (!responseData.success)
          throw new Error(responseData.error || "Ditolak oleh Server PC");
        fetch(`http://${ip}:3000/api/products`)
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) setProducts(data);
          });
      })
      .catch((err) => {
        vibrate([50, 100, 50]);
        alert(`⚠️ GAGAL MENYIMPAN! ${err.message}`);
        fetchData();
      });
  };

  const handleDelete = () => {
    if (!isEditMode) return;
    if (confirm("Yakin hapus barang ini?")) {
      vibrate(50);
      const idToDelete = form.id;
      setProducts((prev) => prev.filter((p) => p.id !== idToDelete));
      setShowModal(false);
      fetch(`http://${ip}:3000/api/product/${idToDelete}`, {
        method: "DELETE",
      }).catch(() => {
        alert("⚠️ Koneksi ke PC terputus! Gagal menghapus di database.");
      });
    }
  };

  const stats = useMemo(() => {
    const totalItem = products.length;
    const totalAset = products.reduce(
      (acc, p) => acc + (p.stock || 0) * (p.cost_price || 0),
      0,
    );
    const kritis = products.filter((p) => p.stock === 1).length;
    const habis = products.filter((p) => p.stock <= 0).length;
    return { totalItem, totalAset, kritis, habis };
  }, [products]);

  // ✨ SISTEM FILTERING GABUNGAN (SEARCH + KATEGORI + TAB)
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      let passTab = true;
      if (filter === "KRITIS") passTab = p.stock === 1;
      if (filter === "HABIS") passTab = p.stock <= 0;

      const passCategory = selectedCategory
        ? p.category === selectedCategory
        : true;

      const searchTerms = debouncedSearch
        .toLowerCase()
        .split(" ")
        .filter((term) => term.trim() !== "");
      const productDictionary =
        `${p.name} ${p.barcode} ${p.item_number || ""} ${p.brand || ""} ${p.compatibility || ""} ${p.category || ""}`.toLowerCase();
      const passSearch = searchTerms.every((term) =>
        productDictionary.includes(term),
      );

      return passTab && passSearch && passCategory;
    });
  }, [products, debouncedSearch, filter, selectedCategory]);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#0f172a",
        color: "white",
      }}
    >
      <style>{`
        @keyframes pulse-skeleton { 0% { background-color: #334155; } 50% { background-color: #475569; } 100% { background-color: #334155; } }
        .skeleton-pulse { animation: pulse-skeleton 1.5s infinite ease-in-out; }
      `}</style>

      {/* DASHBOARD KECIL */}
      <div
        style={{
          background: "#1e293b",
          padding: "15px",
          borderBottom: "1px solid #334155",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginBottom: "15px",
          }}
        >
          <div
            style={{
              background: "#334155",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            <div style={{ fontSize: "11px", color: "#94a3b8" }}>
              Total Barang
            </div>
            {isLoading ? (
              <div
                className="skeleton-pulse"
                style={{
                  width: "60px",
                  height: "18px",
                  borderRadius: "4px",
                  marginTop: "4px",
                }}
              ></div>
            ) : (
              <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                {stats.totalItem} Item
              </div>
            )}
          </div>
          <div
            style={{
              background: "#334155",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            <div style={{ fontSize: "11px", color: "#94a3b8" }}>
              Total Aset (Modal)
            </div>
            {isLoading ? (
              <div
                className="skeleton-pulse"
                style={{
                  width: "90px",
                  height: "16px",
                  borderRadius: "4px",
                  marginTop: "4px",
                }}
              ></div>
            ) : (
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#10b981",
                }}
              >
                Rp {stats.totalAset.toLocaleString("id-ID")}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
          <button
            onClick={() => setFilter("SEMUA")}
            style={{
              ...btnFilterStyle,
              background: filter === "SEMUA" ? "#3b82f6" : "transparent",
              borderColor: filter === "SEMUA" ? "#3b82f6" : "#475569",
            }}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter("KRITIS")}
            style={{
              ...btnFilterStyle,
              background: filter === "KRITIS" ? "#fbbf24" : "transparent",
              borderColor: filter === "KRITIS" ? "#fbbf24" : "#475569",
              color: filter === "KRITIS" ? "black" : "#cbd5e1",
            }}
          >
            Sisa 1 ({stats.kritis})
          </button>
          <button
            onClick={() => setFilter("HABIS")}
            style={{
              ...btnFilterStyle,
              background: filter === "HABIS" ? "#ef4444" : "transparent",
              borderColor: filter === "HABIS" ? "#ef4444" : "#475569",
            }}
          >
            Habis ({stats.habis})
          </button>
        </div>
      </div>

      {/* ✨ PENCARIAN & FILTER KATEGORI (BERSEBELAHAN) ✨ */}
      <div
        style={{
          padding: "10px 15px",
          background: "#0f172a",
          display: "flex",
          gap: "10px",
        }}
      >
        <div style={{ position: "relative", flex: 1 }}>
          <input
            placeholder="Cari nama, rak..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 12px 12px 36px",
              borderRadius: "8px",
              background: "#1e293b",
              color: "white",
              border: "1px solid #3b82f6",
              fontSize: "13px",
              boxSizing: "border-box",
              outline: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "10px",
              top: "12px",
              color: "#64748b",
            }}
          >
            <Icons.Search />
          </div>
        </div>

        {/* DROPDOWN KATEGORI */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            background: "#1e293b",
            color: selectedCategory ? "#3b82f6" : "white",
            border: selectedCategory
              ? "1px solid #3b82f6"
              : "1px solid #475569",
            borderRadius: "8px",
            padding: "0 8px",
            outline: "none",
            maxWidth: "35%", // Agar tidak memakan tempat pencarian terlalu banyak di layar kecil
            fontSize: "12px",
            fontWeight: selectedCategory ? "bold" : "normal",
          }}
        >
          <option value="">Semua Kategori</option>
          {categories.map((c, i) => (
            <option key={i} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* LIST BARANG */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 15px 80px 15px" }}>
        {isLoading ? (
          <>
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
          </>
        ) : paginatedProducts.length === 0 ? (
          <div
            style={{ textAlign: "center", color: "#64748b", marginTop: "30px" }}
          >
            Data tidak ditemukan.
          </div>
        ) : (
          paginatedProducts.map((p) => (
            <ProductItem
              key={p.id}
              p={p}
              onEdit={handleOpenEdit}
              ip={ip}
              setPreviewImage={setPreviewImage}
            />
          ))
        )}
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && !isLoading && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "#1e293b",
            borderTop: "1px solid #334155",
            padding: "10px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 40,
          }}
        >
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              padding: "8px 15px",
              background: "#334155",
              border: "none",
              borderRadius: "6px",
              color: currentPage === 1 ? "#64748b" : "white",
              fontWeight: "bold",
            }}
          >
            ← Prev
          </button>
          <div style={{ color: "#94a3b8", fontSize: "14px" }}>
            Hal {currentPage} / {totalPages}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: "8px 15px",
              background: "#3b82f6",
              border: "none",
              borderRadius: "6px",
              color: "white",
              fontWeight: "bold",
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            Next →
          </button>
        </div>
      )}

      {/* TOMBOL ADD (FAB) */}
      <button
        onClick={handleOpenAdd}
        style={{
          position: "fixed",
          bottom: totalPages > 1 ? "70px" : "20px",
          right: "20px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "#3b82f6",
          color: "white",
          border: "none",
          boxShadow: "0 4px 15px rgba(59, 130, 246, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50,
        }}
      >
        <Icons.Plus />
      </button>

      {/* MODAL ADD/EDIT */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.9)",
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
              borderRadius: "16px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              border: "1px solid #334155",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                color: isEditMode ? "#fbbf24" : "#3b82f6",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              {isEditMode ? "Edit Barang" : "Tambah Barang Baru"}
            </h3>
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginBottom: "10px",
                  padding: "15px",
                  background: "#0f172a",
                  borderRadius: "12px",
                  border: "1px dashed #475569",
                }}
              >
                {form.image_url ? (
                  <div style={{ position: "relative", marginBottom: "10px" }}>
                    <img
                      src={renderFormImagePreview() || ""}
                      alt="Preview"
                      style={{
                        width: "120px",
                        height: "120px",
                        objectFit: "cover",
                        borderRadius: "12px",
                        border: "2px solid #3b82f6",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setForm({ ...form, image_url: "" });
                        setImageMsg(null);
                      }}
                      style={{
                        position: "absolute",
                        top: "-10px",
                        right: "-10px",
                        background: "#ef4444",
                        color: "white",
                        borderRadius: "50%",
                        width: "28px",
                        height: "28px",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "16px",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "12px",
                      background: "#1e293b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "10px",
                      color: "#64748b",
                    }}
                  >
                    <Icons.Camera />
                  </div>
                )}
                {imageMsg && (
                  <div
                    style={{
                      fontSize: "11px",
                      marginBottom: "15px",
                      fontWeight: "bold",
                      textAlign: "center",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      color:
                        imageMsg.type === "success" ? "#10b981" : "#ef4444",
                      background:
                        imageMsg.type === "success"
                          ? "rgba(16, 185, 129, 0.15)"
                          : "rgba(239, 68, 68, 0.15)",
                    }}
                  >
                    {imageMsg.text}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  id="cameraInputForm"
                  style={{ display: "none" }}
                  onChange={handleImageCapture}
                />
                <label
                  htmlFor="cameraInputForm"
                  style={{
                    background: "rgba(59, 130, 246, 0.2)",
                    color: "#60a5fa",
                    padding: "10px 20px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    border: "1px solid #3b82f6",
                  }}
                >
                  <Icons.Camera />{" "}
                  {form.image_url ? "Ganti Foto" : "Ambil Foto"}
                </label>
              </div>
              <div>
                <label style={labelStyle}>Nama Barang</label>
                <input
                  required
                  className="input-field"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Contoh: Kampas Rem Depan"
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                }}
              >
                <div>
                  <label
                    style={{
                      ...labelStyle,
                      color: isDuplicate ? "#ef4444" : "#94a3b8",
                    }}
                  >
                    Kode / Barcode
                  </label>
                  <input
                    className="input-field"
                    value={form.barcode}
                    onChange={(e) => handleChange("barcode", e.target.value)}
                    placeholder="Scan..."
                    style={{ borderColor: isDuplicate ? "#ef4444" : "#475569" }}
                  />
                  {isDuplicate && (
                    <div
                      style={{
                        color: "#ef4444",
                        fontSize: "10px",
                        marginTop: "2px",
                        fontWeight: "bold",
                      }}
                    >
                      ⚠️ Digunakan
                    </div>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Rak / Etalase</label>
                  <input
                    className="input-field"
                    value={form.item_number}
                    onChange={(e) =>
                      handleChange("item_number", e.target.value)
                    }
                    placeholder="Rak A1"
                  />
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                }}
              >
                <div>
                  <label style={labelStyle}>Merek</label>
                  <input
                    className="input-field"
                    value={form.brand}
                    onChange={(e) => handleChange("brand", e.target.value)}
                    placeholder="Cth: AHM"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Tipe Motor</label>
                  <input
                    className="input-field"
                    value={form.compatibility}
                    onChange={(e) =>
                      handleChange("compatibility", e.target.value)
                    }
                    placeholder="Cth: Vario"
                  />
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                }}
              >
                <div>
                  <label style={labelStyle}>Stok</label>
                  <input
                    type="number"
                    required
                    className="input-field"
                    value={form.stock}
                    onChange={(e) => handleChange("stock", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Kategori</label>
                  <input
                    className="input-field"
                    value={form.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    placeholder="Cth: Oli"
                  />
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                }}
              >
                <div>
                  <label style={labelStyle}>Modal (Rp)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.cost_price}
                    onChange={(e) => handleChange("cost_price", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, color: "#fbbf24" }}>
                    Harga Jual (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    className="input-field"
                    value={form.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    style={{ fontWeight: "bold", color: "#fbbf24" }}
                    placeholder="0"
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    background: "transparent",
                    border: "1px solid #475569",
                    color: "#cbd5e1",
                    fontWeight: "600",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isDuplicate}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    background: isDuplicate
                      ? "#334155"
                      : isEditMode
                        ? "#fbbf24"
                        : "#3b82f6",
                    border: "none",
                    color: isDuplicate ? "#94a3b8" : "black",
                    fontWeight: "bold",
                    cursor: isDuplicate ? "not-allowed" : "pointer",
                    opacity: isDuplicate ? 0.7 : 1,
                  }}
                >
                  {isDuplicate ? "Kode Ganda" : "Simpan"}
                </button>
              </div>
              {isEditMode && (
                <button
                  type="button"
                  onClick={handleDelete}
                  style={{
                    marginTop: "5px",
                    padding: "12px",
                    borderRadius: "8px",
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid #ef4444",
                    color: "#ef4444",
                    fontWeight: "bold",
                  }}
                >
                  Hapus Barang Ini
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {previewImage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.9)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Preview"
            style={{
              maxWidth: "90%",
              maxHeight: "80%",
              borderRadius: "12px",
              border: "2px solid #334155",
            }}
          />
          <button
            onClick={() => setPreviewImage(null)}
            style={{
              marginTop: "20px",
              background: "#ef4444",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "20px",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            Tutup Preview
          </button>
        </div>
      )}
    </div>
  );
}

const btnFilterStyle = {
  flex: 1,
  padding: "8px 12px",
  borderRadius: "20px",
  border: "1px solid",
  fontSize: "11px",
  fontWeight: "bold" as const,
  color: "white",
  whiteSpace: "nowrap" as const,
  cursor: "pointer",
};
const labelStyle = {
  display: "block",
  fontSize: "11px",
  color: "#94a3b8",
  marginBottom: "4px",
};
