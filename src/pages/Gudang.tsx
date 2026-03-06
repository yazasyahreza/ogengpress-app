import { useState, useRef, useEffect, useMemo, memo, useCallback } from "react";
import { Product } from "../types";
import { compressImage } from "../utils/imageCompressor";
import AiAssistant from "../components/AiAssistant";

// --- UTILS: DEBOUNCE HOOK ---
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

// --- ASSETS: ICONS (Minified) ---
const Icons = {
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
  Trash: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Save: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  Plus: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Cancel: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Search: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Alert: () => (
    <svg
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
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
  Image: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="#cbd5e1"
      style={{ display: "block" }}
    >
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
  ),
  ChevronRight: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="#cbd5e1"
      style={{ display: "block" }}
    >
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </svg>
  ),
};

// --- COMPONENTS: SMART INPUT ---
interface SmartInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  lastValue: string;
  value: string;
  setValue: (val: string) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}
const SmartInput = ({
  lastValue,
  value,
  setValue,
  style,
  inputRef,
  placeholder,
  ...props
}: SmartInputProps) => {
  let suggestion = "";
  if (lastValue) {
    if (value === "") {
      suggestion = lastValue;
    } else if (
      lastValue.toLowerCase().startsWith(value.toLowerCase()) &&
      lastValue !== value
    ) {
      suggestion = lastValue;
    }
  }
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab" && suggestion) {
      e.preventDefault();
      setValue(suggestion);
    }
  };
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div
        style={{
          ...style,
          position: "absolute",
          top: 0,
          left: 0,
          color: "#94a3b8",
          opacity: 0.6,
          pointerEvents: "none",
          zIndex: 0,
          whiteSpace: "pre",
          overflow: "hidden",
          backgroundColor: "transparent",
          borderColor: "transparent",
          fontFamily: "inherit",
          fontSize: "0.9rem",
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          height: "100%",
        }}
      >
        <span style={{ visibility: "hidden" }}>{value}</span>
        {suggestion.slice(value.length)}
      </div>
      <input
        {...props}
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={suggestion ? "" : placeholder}
        style={{
          ...style,
          position: "relative",
          zIndex: 1,
          backgroundColor: "transparent",
        }}
      />
    </div>
  );
};

// --- COMPONENTS: PRODUCT ROW (MEMOIZED) ---
const ProductRow = memo(
  ({
    p,
    isSelected,
    isEditing,
    toggleSelect,
    handleEdit,
    initiateDelete,
    setPreviewImage,
  }: any) => {
    return (
      <tr
        className="gudang-row"
        style={{
          borderBottom: "1px solid #334155",
          background: isSelected
            ? "rgba(59, 130, 246, 0.1)"
            : isEditing
              ? "rgba(251, 191, 36, 0.1)"
              : "transparent",
        }}
      >
        <td style={{ textAlign: "center", verticalAlign: "middle" }}>
          <input
            type="checkbox"
            className="bulk-checkbox"
            checked={isSelected}
            onChange={() => toggleSelect(p.id)}
          />
        </td>
        <td style={{ padding: "14px 20px" }}>
          {(p as any).image_url ? (
            <div
              onClick={() => setPreviewImage((p as any).image_url)}
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid #334155",
                cursor: "zoom-in",
              }}
            >
              <img
                src={(p as any).image_url}
                alt="img"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e: any) => (e.target.style.display = "none")}
              />
            </div>
          ) : (
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "8px",
                background: "#334155",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#475569",
              }}
            >
              <Icons.Image />
            </div>
          )}
        </td>
        <td style={{ padding: "14px 20px" }}>
          <div
            style={{ fontWeight: "600", color: "#f8fafc", fontSize: "0.95rem" }}
          >
            {p.name}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.8rem",
              color: "#64748b",
              marginTop: "4px",
            }}
          >
            <span
              style={{
                background: "#334155",
                color: "#cbd5e1",
                padding: "2px 6px",
                borderRadius: "4px",
              }}
            >
              {p.barcode}
            </span>
            {p.item_number && (
              <span style={{ color: "#d97706", fontWeight: "bold" }}>
                • {p.item_number}
              </span>
            )}
          </div>
          {p.compatibility && (
            <div
              style={{
                fontSize: "0.75rem",
                color: "#10b981",
                marginTop: "4px",
                fontStyle: "italic",
              }}
            >
              Cocok utk: {p.compatibility}
            </div>
          )}
        </td>
        <td style={{ padding: "14px 20px" }}>
          <span
            style={{
              background: "#334155",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "0.75rem",
              color: "#cbd5e1",
            }}
          >
            {p.category || "-"}
          </span>
        </td>
        <td
          style={{ padding: "14px 20px", color: "#cbd5e1", fontSize: "0.9rem" }}
        >
          {p.brand || "-"}
        </td>
        <td style={{ padding: "14px 20px", color: "#94a3b8" }}>
          Rp {p.cost_price.toLocaleString("id-ID")}
        </td>
        <td
          style={{ padding: "14px 20px", fontWeight: "bold", color: "#fbbf24" }}
        >
          Rp {p.price.toLocaleString("id-ID")}
        </td>
        <td style={{ padding: "14px 20px", textAlign: "center" }}>
          {p.stock === 0 ? (
            <span
              style={{
                background: "rgba(239, 68, 68, 0.2)",
                color: "#ef4444",
                padding: "4px 10px",
                borderRadius: "4px",
                fontWeight: "bold",
                fontSize: "0.75rem",
                border: "1px solid #ef4444",
              }}
            >
              HABIS
            </span>
          ) : (
            <span
              style={{
                background:
                  p.stock === 1
                    ? "rgba(234, 179, 8, 0.2)"
                    : "rgba(16, 185, 129, 0.2)",
                color: p.stock === 1 ? "#eab308" : "#6ee7b7",
                padding: "4px 10px",
                borderRadius: "20px",
                fontWeight: "bold",
                fontSize: "0.85rem",
              }}
            >
              {p.stock}
            </span>
          )}
        </td>
        <td style={{ padding: "14px 20px" }}>
          <div
            style={{ display: "flex", gap: "8px", justifyContent: "center" }}
          >
            <button
              onClick={() => handleEdit(p)}
              style={{
                cursor: "pointer",
                border: "none",
                background: "#334155",
                color: "#94a3b8",
                padding: "6px",
                borderRadius: "6px",
                display: "flex",
              }}
              title="Edit"
            >
              <Icons.Edit />
            </button>
            <button
              onClick={() => initiateDelete(p)}
              style={{
                cursor: "pointer",
                border: "none",
                background: "rgba(239, 68, 68, 0.2)",
                color: "#ef4444",
                padding: "6px",
                borderRadius: "6px",
                display: "flex",
              }}
              title="Hapus"
            >
              <Icons.Trash />
            </button>
          </div>
        </td>
      </tr>
    );
  },
);

// --- MAIN PAGE ---
interface GudangProps {
  onUpdate: () => void;
}

export default function Gudang({ onUpdate }: GudangProps) {
  // 1. Data & State
  const [products, setProducts] = useState<Product[]>([]);
  const [lastEntries, setLastEntries] = useState(() => {
    const saved = localStorage.getItem("gudang_last_entries");
    return saved
      ? JSON.parse(saved)
      : {
          barcode: "",
          name: "",
          category: "",
          brand: "",
          compatibility: "",
          item_number: "",
          cost_price: "",
          price: "",
        };
  });

  // 2. UI State
  const [toast, setToast] = useState<{
    show: boolean;
    msg: string;
    type: "success" | "error";
  }>({ show: false, msg: "", type: "success" });
  const [editId, setEditId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300); // Anti-Lag
  const [showLowStock, setShowLowStock] = useState(false);
  const [showEmptyStock, setShowEmptyStock] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // 3. Modals State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkCategory, setBulkCategory] = useState("");

  // 4. Form State
  const [form, setForm] = useState({
    barcode: "",
    name: "",
    cost_price: "",
    price: "",
    stock: "",
    category: "",
    item_number: "",
    brand: "",
    compatibility: "",
    image_url: "",
  });
  const barcodeRef = useRef<HTMLInputElement>(null);

  // --- METHODS ---
  const loadProducts = async () => {
    const data = await window.api.fetchProducts();
    setProducts(data);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, showLowStock, showEmptyStock, selectedCategory]);

  const showNotification = (
    msg: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ show: true, msg, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showNotification("File terlalu besar! Maksimal 10MB.", "error");
        return;
      }
      try {
        const compressedString = await compressImage(file);
        setForm({ ...form, image_url: compressedString });
      } catch (error) {
        showNotification("Gagal memproses gambar", "error");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    const data = {
      ...form,
      cost_price: Number(String(form.cost_price).replace(/\D/g, "")) || 0,
      price: Number(String(form.price).replace(/\D/g, "")) || 0,
      stock: Number(String(form.stock).replace(/\D/g, "")) || 0,
    };

    const res = editId
      ? await window.api.editProduct(editId, data)
      : await window.api.addProduct(data);
    if (res.success) {
      if (!editId) {
        const newMemory = {
          barcode: form.barcode,
          name: form.name,
          category: form.category,
          brand: form.brand,
          compatibility: form.compatibility,
          item_number: form.item_number,
          cost_price: form.cost_price,
          price: form.price,
        };
        setLastEntries(newMemory);
        localStorage.setItem("gudang_last_entries", JSON.stringify(newMemory));
      }
      setEditId(null);
      setForm({
        barcode: "",
        name: "",
        cost_price: "",
        price: "",
        stock: "",
        category: "",
        item_number: "",
        brand: "",
        compatibility: "",
        image_url: "",
      });
      loadProducts();
      onUpdate();
      showNotification(editId ? "Data diperbarui" : "Barang ditambahkan");
      setTimeout(() => barcodeRef.current?.focus(), 100);
    } else {
      showNotification("Gagal menyimpan", "error");
    }
  };

  const initiateDelete = useCallback((p: Product) => {
    setDeleteTargetId(p.id);
    setDeleteTargetName(p.name);
    setShowDeleteModal(true);
  }, []);
  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    const res = await window.api.deleteProduct(deleteTargetId);
    setShowDeleteModal(false);
    setDeleteTargetId(null);
    if (res.success) {
      loadProducts();
      onUpdate();
      showNotification("Barang dihapus");
    } else {
      if (res.reason === "LOCKED")
        showNotification("Gagal: Barang ada di transaksi hari ini", "error");
      else
        showNotification(
          "Gagal: " + (res.msg || res.error || "Error sistem"),
          "error",
        );
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkCategory) return alert("Mohon isi nama kategori baru!");
    setIsBulkUpdating(true);
    let successCount = 0;
    for (const id of selectedIds) {
      const product = products.find((p) => p.id === id);
      if (product) {
        const newData = { ...product, category: bulkCategory };
        try {
          const res = await window.api.editProduct(id, newData);
          if (res.success) successCount++;
        } catch (e) {
          console.error(e);
        }
      }
    }
    setIsBulkUpdating(false);
    setSelectedIds([]);
    setBulkCategory("");
    loadProducts();
    onUpdate();
    showNotification(`Berhasil mengubah ${successCount} barang!`, "success");
  };

  const toggleSelectAll = (filteredIds: number[]) => {
    if (selectedIds.length === filteredIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredIds);
    }
  };
  const toggleSelectOne = useCallback((id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  }, []);
  const handleEdit = useCallback((p: Product) => {
    setEditId(p.id);
    setForm({
      barcode: p.barcode,
      name: p.name,
      cost_price: p.cost_price.toString(),
      price: p.price.toString(),
      stock: p.stock.toString(),
      category: p.category || "",
      item_number: p.item_number || "",
      brand: p.brand || "",
      compatibility: p.compatibility || "",
      image_url: (p as any).image_url || "",
    });
  }, []);

  // --- COMPUTED DATA ---
  const categories = useMemo(
    () =>
      [
        ...new Set(
          products.map((p) => p.category).filter((c) => c && c.trim() !== ""),
        ),
      ].sort(),
    [products],
  );
  const activeProducts = useMemo(
    () => products.filter((p) => !p.name.toUpperCase().includes("NONAKTIF")),
    [products],
  );
  const totalItems = activeProducts.length;
  const totalAsset = useMemo(
    () => activeProducts.reduce((sum, p) => sum + p.cost_price * p.stock, 0),
    [activeProducts],
  );
  const lowStockCount = useMemo(
    () => activeProducts.filter((p) => p.stock === 1).length,
    [activeProducts],
  );
  const emptyStockCount = useMemo(
    () => activeProducts.filter((p) => p.stock === 0).length,
    [activeProducts],
  );

  // --- SMART FILTERING ---
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const rawSearch = debouncedSearch.toLowerCase();
      const searchTerms = rawSearch
        .split(" ")
        .filter((term) => term.trim() !== "");
      const productDictionary =
        `${p.name} ${p.barcode} ${p.item_number || ""} ${p.brand || ""} ${p.compatibility || ""} ${p.category || ""}`.toLowerCase();
      const matchesSearch = searchTerms.every((term) =>
        productDictionary.includes(term),
      );

      let matchesStock = true;
      if (showLowStock) {
        matchesStock = p.stock === 1;
      } else if (showEmptyStock) {
        matchesStock = p.stock === 0;
      }

      const matchesCategory = selectedCategory
        ? p.category === selectedCategory
        : true;
      return matchesSearch && matchesStock && matchesCategory;
    });
  }, [
    products,
    debouncedSearch,
    showLowStock,
    showEmptyStock,
    selectedCategory,
  ]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const filteredIds = filtered.map((p) => p.id);

  // --- STYLES ---
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "6px",
    background: "#334155",
    border: "1px solid #475569",
    color: "#f8fafc",
    outline: "none",
    fontSize: "0.9rem",
    boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "6px",
    color: "#cbd5e1",
    fontSize: "0.85rem",
    fontWeight: "500",
  };

  return (
    <div
      className="main-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        gap: "0",
        height: "100%",
      }}
    >
      <style>{`
          .custom-scroll::-webkit-scrollbar { width: 8px; height: 8px; } .custom-scroll::-webkit-scrollbar-track { background: transparent; } .custom-scroll::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; border: 2px solid #1e293b; } .custom-scroll::-webkit-scrollbar-thumb:hover { background: #64748b; }
          .gudang-row:hover { background-color: rgba(255, 255, 255, 0.05) !important; transition: background-color 0.2s ease; }
          .filter-select { background: #1e293b; color: #f8fafc; border: 1px solid #334155; padding: 8px 12px; borderRadius: 8px; outline: none; cursor: pointer; font-size: 0.85rem; font-weight: 500; height: 35px; } .filter-select:hover { border-color: #475569; }
          .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(2px); }
          .modal-content { background: #1e293b; border: 1px solid #334155; padding: 25px; borderRadius: 16px; width: 340px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); text-align: center; animation: popIn 0.2s ease-out; } @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          .bulk-checkbox { width: 18px; height: 18px; cursor: pointer; accent-color: #3b82f6; }
          .stat-card { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; border: 1px solid #334155; } .stat-card:hover { transform: translateY(-2px); } .stat-card:active { transform: scale(0.98); }
          .stat-card.active-yellow { background: rgba(234, 179, 8, 0.15); border-color: #eab308; } .stat-card.active-red { background: rgba(239, 68, 68, 0.15); border-color: #ef4444; }
          .page-btn { background: #1e293b; border: 1px solid #475569; color: #cbd5e1; width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; cursor: pointer; transition: all 0.2s; padding: 0; margin: 0; line-height: 1; box-sizing: border-box; } .page-btn:hover:not(:disabled) { background: #334155; color: white; border-color: #cbd5e1; } .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      {/* MODAL HAPUS & TOAST */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 15px",
                color: "#ef4444",
              }}
            >
              <Icons.Trash />
            </div>
            <h3 style={{ margin: "0 0 8px 0", color: "#f8fafc" }}>
              Hapus Barang?
            </h3>
            <p
              style={{
                margin: "0 0 20px 0",
                color: "#94a3b8",
                fontSize: "0.9rem",
              }}
            >
              Anda akan menghapus <strong>"{deleteTargetName}"</strong>.
              Tindakan ini tidak bisa dibatalkan.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  flex: 1,
                  padding: "10px",
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
                onClick={confirmDelete}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#ef4444",
                  border: "none",
                  color: "white",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
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

      {/* SIDEBAR FORM */}
      <div
        className="sidebar custom-scroll"
        style={{
          background: "#1e293b",
          borderRight: "1px solid #334155",
          padding: "25px 20px",
          overflowY: "auto",
        }}
      >
        <h3
          style={{
            color: editId ? "#fbbf24" : "#f8fafc",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginTop: 0,
            marginBottom: "25px",
            fontSize: "1.2rem",
          }}
        >
          {editId ? (
            <>
              <Icons.Edit /> Edit Barang
            </>
          ) : (
            <>
              <Icons.Plus /> Tambah Barang
            </>
          )}
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={labelStyle}>Barcode / Scan</label>
            <SmartInput
              inputRef={barcodeRef}
              lastValue={lastEntries.barcode}
              value={form.barcode}
              setValue={(val) => setForm({ ...form, barcode: val })}
              placeholder="Scan kode..."
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={labelStyle}>Nama Barang</label>
            <SmartInput
              lastValue={lastEntries.name}
              value={form.name}
              setValue={(val) => setForm({ ...form, name: val })}
              placeholder="Contoh: Kampas Rem Depan"
              style={inputStyle}
              required
            />
          </div>
          <div style={{ display: "flex", gap: "12px", marginBottom: "15px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Kategori</label>
              <SmartInput
                list="category-list"
                lastValue={lastEntries.category}
                value={form.category}
                setValue={(val) => setForm({ ...form, category: val })}
                placeholder="Oli / Rem"
                style={inputStyle}
              />
              <datalist id="category-list">
                {categories.map((c, i) => (
                  <option key={i} value={c} />
                ))}
              </datalist>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Merek</label>
              <SmartInput
                lastValue={lastEntries.brand}
                value={form.brand}
                setValue={(val) => setForm({ ...form, brand: val })}
                placeholder="AHM"
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={labelStyle}>Foto Barang</label>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                type="file"
                id="file-upload"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <label
                htmlFor="file-upload"
                style={{
                  ...inputStyle,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  background: "#334155",
                  color: "#cbd5e1",
                  border: "1px dashed #475569",
                }}
              >
                <Icons.Image /> {form.image_url ? "Ganti Foto" : "Pilih Foto"}
              </label>
              {form.image_url && (
                <div
                  style={{
                    position: "relative",
                    width: "50px",
                    height: "auto",
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "50px",
                      height: "50px",
                    }}
                  >
                    <img
                      src={form.image_url}
                      alt="preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "6px",
                        border: "1px solid #475569",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, image_url: "" })}
                      style={{
                        position: "absolute",
                        top: -5,
                        right: -5,
                        background: "#ef4444",
                        borderRadius: "50%",
                        width: "18px",
                        height: "18px",
                        border: "none",
                        color: "white",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      X
                    </button>
                  </div>
                  <div
                    style={{
                      fontSize: "9px",
                      marginTop: "4px",
                      fontWeight: "bold",
                    }}
                  >
                    {form.image_url.startsWith("data:image/webp") ? (
                      <span style={{ color: "#4ade80" }}>✅ WebP</span>
                    ) : (
                      <span style={{ color: "#f87171" }}>⚠️ JPG</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={labelStyle}>Kompatibilitas (Tipe Motor)</label>
            <SmartInput
              lastValue={lastEntries.compatibility}
              value={form.compatibility}
              setValue={(val) => setForm({ ...form, compatibility: val })}
              placeholder="Cth: Supra, Grand, Prima"
              style={inputStyle}
            />
          </div>
          <div style={{ display: "flex", gap: "12px", marginBottom: "15px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Kode Part</label>
              <SmartInput
                lastValue={lastEntries.item_number}
                value={form.item_number}
                setValue={(val) => setForm({ ...form, item_number: val })}
                placeholder="A1 / rak oli"
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Stok Awal</label>
              <input
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="0"
                type="number"
                style={inputStyle}
                required
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", marginBottom: "25px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Modal</label>
              <SmartInput
                type="number"
                lastValue={lastEntries.cost_price}
                value={form.cost_price}
                setValue={(val) => setForm({ ...form, cost_price: val })}
                placeholder="0"
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Jual</label>
              <SmartInput
                type="number"
                lastValue={lastEntries.price}
                value={form.price}
                setValue={(val) => setForm({ ...form, price: val })}
                placeholder="0"
                style={inputStyle}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              background: editId ? "#fbbf24" : "#3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontSize: "0.95rem",
              transition: "0.2s",
            }}
          >
            <Icons.Save /> {editId ? "SIMPAN PERUBAHAN" : "SIMPAN DATA"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setForm({
                  barcode: "",
                  name: "",
                  cost_price: "",
                  price: "",
                  stock: "",
                  category: "",
                  item_number: "",
                  brand: "",
                  compatibility: "",
                  image_url: "",
                });
              }}
              style={{
                marginTop: "10px",
                width: "100%",
                background: "transparent",
                color: "#ef4444",
                border: "1px solid #ef4444",
                padding: "10px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <Icons.Cancel /> Batal Edit
            </button>
          )}
        </form>
      </div>

      {/* KONTEN KANAN */}
      <div
        className="content-area"
        style={{
          background: "#0f172a",
          padding: "30px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: "15px",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              background: "#1e293b",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #334155",
            }}
          >
            <div
              style={{
                fontSize: "0.85rem",
                color: "#94a3b8",
                marginBottom: "8px",
              }}
            >
              Total Barang
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#f8fafc",
              }}
            >
              {totalItems}
            </div>
          </div>
          <div
            style={{
              background: "#1e293b",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #334155",
            }}
          >
            <div
              style={{
                fontSize: "0.85rem",
                color: "#fbbf24",
                marginBottom: "8px",
              }}
            >
              Total Aset (Modal)
            </div>
            <div
              style={{
                fontSize: "1.2rem",
                fontWeight: "bold",
                color: "#fbbf24",
              }}
            >
              Rp {totalAsset.toLocaleString("id-ID")}
            </div>
          </div>
          <div
            onClick={() => {
              setShowLowStock(!showLowStock);
              setShowEmptyStock(false);
            }}
            className={`stat-card ${showLowStock ? "active-yellow" : ""}`}
            style={{
              background: showLowStock ? "rgba(234, 179, 8, 0.15)" : "#1e293b",
              padding: "20px",
              borderRadius: "12px",
            }}
          >
            <div
              style={{
                fontSize: "0.85rem",
                color: lowStockCount > 0 ? "#eab308" : "#94a3b8",
                marginBottom: "4px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Stok Kritis (Sisa 1)</span>{" "}
              {showLowStock && (
                <span style={{ fontSize: "0.7rem", color: "#eab308" }}>
                  AKTIF
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: lowStockCount > 0 ? "#eab308" : "#94a3b8",
              }}
            >
              {lowStockCount}
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                marginTop: "8px",
                fontStyle: "italic",
                opacity: 0.7,
                color: "#94a3b8",
              }}
            >
              Segera order ulang!
            </div>
          </div>
          <div
            onClick={() => {
              setShowEmptyStock(!showEmptyStock);
              setShowLowStock(false);
            }}
            className={`stat-card ${showEmptyStock ? "active-red" : ""}`}
            style={{
              background: showEmptyStock
                ? "rgba(239, 68, 68, 0.15)"
                : "#1e293b",
              padding: "20px",
              borderRadius: "12px",
            }}
          >
            <div
              style={{
                fontSize: "0.85rem",
                color: emptyStockCount > 0 ? "#ef4444" : "#94a3b8",
                marginBottom: "4px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Stok Habis</span>{" "}
              {showEmptyStock && (
                <span style={{ fontSize: "0.7rem", color: "#ef4444" }}>
                  AKTIF
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: emptyStockCount > 0 ? "#ef4444" : "#94a3b8",
              }}
            >
              {emptyStockCount}
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                marginTop: "8px",
                fontStyle: "italic",
                opacity: 0.7,
                color: "#94a3b8",
              }}
            >
              Klik untuk lihat
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h3 style={{ margin: 0, color: "#f8fafc" }}>
            {showLowStock
              ? "Daftar Barang Stok Kritis (Sisa 1)"
              : showEmptyStock
                ? "Daftar Barang Stok Habis"
                : "Stok Sparepart"}
          </h3>
          <div style={{ display: "flex", gap: "10px" }}>
            <select
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: "150px" }}
            >
              <option value="">Semua Kategori</option>
              {categories.map((c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                padding: "0 12px",
                width: "220px",
                height: "35px",
              }}
            >
              <span
                style={{
                  marginRight: "10px",
                  color: "#64748b",
                  display: "flex",
                }}
              >
                <Icons.Search />
              </span>
              <input
                placeholder="Cari nama / kode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  width: "100%",
                  fontSize: "0.9rem",
                  color: "#f8fafc",
                }}
              />
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
            position: "relative",
            display: "flex",
            flexDirection: "column",
            paddingBottom: selectedIds.length > 0 ? "80px" : "0",
          }}
        >
          <div className="custom-scroll" style={{ overflowY: "auto", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                <tr>
                  <th
                    style={{
                      background: "#0f172a",
                      padding: "16px 12px",
                      textAlign: "center",
                      borderBottom: "2px solid #334155",
                      width: "40px",
                    }}
                  >
                    <input
                      type="checkbox"
                      className="bulk-checkbox"
                      checked={
                        filteredIds.length > 0 &&
                        selectedIds.length === filteredIds.length
                      }
                      onChange={() => toggleSelectAll(filteredIds)}
                    />
                  </th>
                  {[
                    "FOTO",
                    "NAMA / KODE / TIPE",
                    "KATEGORI",
                    "MEREK",
                    "MODAL",
                    "JUAL",
                    "STOK",
                    "AKSI",
                  ].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        background: "#0f172a",
                        padding: "16px 20px",
                        textAlign: i > 5 ? "center" : "left",
                        fontSize: "0.75rem",
                        color: "#cbd5e1",
                        fontWeight: "700",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        borderBottom: "2px solid #334155",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        padding: "40px",
                        textAlign: "center",
                        color: "#64748b",
                      }}
                    >
                      <i>Tidak ada barang yang cocok dengan filter.</i>
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((p) => (
                    <ProductRow
                      key={p.id}
                      p={p}
                      isSelected={selectedIds.includes(p.id)}
                      isEditing={editId === p.id}
                      toggleSelect={toggleSelectOne}
                      handleEdit={handleEdit}
                      initiateDelete={initiateDelete}
                      setPreviewImage={setPreviewImage}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div
              style={{
                padding: "15px",
                borderTop: "1px solid #334155",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#1e293b",
              }}
            >
              <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, filtered.length)} dari{" "}
                {filtered.length} barang
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="page-btn"
                >
                  <Icons.ChevronLeft />
                </button>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 14px",
                    height: "36px",
                    background: "#0f172a",
                    borderRadius: "6px",
                    color: "#f8fafc",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    border: "1px solid #334155",
                    boxSizing: "border-box",
                  }}
                >
                  Halaman {currentPage}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="page-btn"
                >
                  <Icons.ChevronRight />
                </button>
              </div>
            </div>
          )}
          {selectedIds.length > 0 && (
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#3b82f6",
                color: "white",
                padding: "10px 20px",
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(59, 130, 246, 0.5)",
                display: "flex",
                alignItems: "center",
                gap: "15px",
                zIndex: 50,
                animation: "slideUp 0.3s ease-out",
              }}
            >
              <style>{`@keyframes slideUp { from { transform: translate(-50%, 100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }`}</style>
              <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>
                {selectedIds.length} Barang Dipilih
              </div>
              <div
                style={{
                  width: "1px",
                  height: "20px",
                  background: "rgba(255,255,255,0.3)",
                }}
              ></div>
              <input
                placeholder="Set Kategori (Cth: Kampas)"
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  color: "white",
                  outline: "none",
                  fontSize: "0.9rem",
                  width: "200px",
                }}
              />
              <button
                onClick={handleBulkUpdate}
                disabled={isBulkUpdating}
                style={{
                  background: "white",
                  color: "#3b82f6",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {isBulkUpdating ? "Menyimpan..." : "Update Massal"}
              </button>
              <button
                onClick={() => setSelectedIds([])}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                }}
                title="Batal"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
      {previewImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
          }}
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Preview"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: "12px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)",
              border: "2px solid white",
            }}
          />
          <button
            onClick={() => setPreviewImage(null)}
            style={{
              position: "absolute",
              top: "30px",
              right: "30px",
              background: "white",
              color: "#ef4444",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              fontSize: "24px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
            }}
          >
            ✕
          </button>
        </div>
      )}

      <AiAssistant />
    </div>
  );
}
