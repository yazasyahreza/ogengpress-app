import { useState, useEffect, useRef } from "react";

// --- INTERFACES ---
interface ProductFormProps {
  initialData: any | null;
  onBack: () => void;
  onSave: () => void;
}

// --- ICONS (Minified) ---
const Icons = {
  Back: () => (
    <svg
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M15 19l-7-7 7-7" />
    </svg>
  ),
  Camera: () => (
    <svg
      width="32"
      height="32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
};

// --- COMPONENT INPUT SEDERHANA ---
const InputGroup = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  style,
}: any) => (
  <div style={{ marginBottom: "15px", ...style }}>
    <label
      style={{
        fontSize: "13px",
        color: "#94a3b8",
        marginBottom: "8px",
        display: "block",
        fontWeight: "bold",
      }}
    >
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "14px",
        borderRadius: "8px",
        background: "#1e293b",
        color: "white",
        border: "1px solid #334155",
        fontSize: "16px",
        boxSizing: "border-box",
        outline: "none",
      }}
    />
  </div>
);

export default function ProductForm({
  initialData,
  onBack,
  onSave,
}: ProductFormProps) {
  const [formData, setFormData] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ip = window.location.hostname;

  // Inisialisasi Data
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        price: initialData.price || "",
        stock: initialData.stock || "",
        cost_price: initialData.cost_price || "",
      });
    } else {
      setFormData({
        barcode: "",
        name: "",
        category: "",
        brand: "",
        item_number: "",
        compatibility: "",
        image_url: "",
        price: "",
        stock: "",
        cost_price: "",
      });
    }
  }, [initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormData((prev: any) => ({ ...prev, image_url: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAction = async () => {
    if (!formData.name) return alert("Nama barang wajib diisi!");

    // Pastikan angka benar-benar angka
    const payload = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      cost_price: Number(formData.cost_price),
      item_number: formData.item_number, // Pastikan konsisten dengan DB
    };

    try {
      await fetch(`http://${ip}:3000/api/product/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      alert("Berhasil disimpan!");
      onSave();
      onBack();
    } catch (e) {
      alert("Gagal menyimpan data");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "#0f172a",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: "15px",
          background: "#1e293b",
          borderBottom: "1px solid #334155",
          display: "flex",
          alignItems: "center",
          gap: "15px",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            cursor: "pointer",
            padding: "5px",
          }}
        >
          <Icons.Back />
        </button>
        <div>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "white" }}>
            {initialData?.id ? "Edit Barang" : "Tambah Baru"}
          </div>
          <div style={{ fontSize: "12px", color: "#94a3b8" }}>
            Isi detail barang lengkap
          </div>
        </div>
      </div>

      {/* FORM CONTENT */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        <InputGroup
          label="Barcode"
          value={formData.barcode || ""}
          onChange={(e: any) =>
            setFormData({ ...formData, barcode: e.target.value })
          }
          placeholder="Scan..."
        />
        <InputGroup
          label="Nama Barang"
          value={formData.name || ""}
          onChange={(e: any) =>
            setFormData({ ...formData, name: e.target.value })
          }
          placeholder="Nama Barang..."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px",
          }}
        >
          <InputGroup
            label="Kategori"
            value={formData.category || ""}
            onChange={(e: any) =>
              setFormData({ ...formData, category: e.target.value })
            }
            placeholder="Oli / Busi"
          />
          <InputGroup
            label="Merek"
            value={formData.brand || ""}
            onChange={(e: any) =>
              setFormData({ ...formData, brand: e.target.value })
            }
            placeholder="AHM / Yamalube"
          />
        </div>

        <InputGroup
          label="Lokasi Rak / Kode Part"
          value={formData.item_number || ""}
          onChange={(e: any) =>
            setFormData({ ...formData, item_number: e.target.value })
          }
          placeholder="Contoh: Rak 1..."
        />

        {/* UPLOAD FOTO */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              fontSize: "13px",
              color: "#94a3b8",
              marginBottom: "8px",
              display: "block",
              fontWeight: "bold",
            }}
          >
            Foto
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: "2px dashed #334155",
              borderRadius: "12px",
              padding: "20px",
              textAlign: "center",
              background: "#1e293b",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "120px",
            }}
          >
            {formData.image_url ? (
              <img
                src={formData.image_url}
                style={{ height: 100, objectFit: "contain", borderRadius: 8 }}
              />
            ) : (
              <div style={{ color: "#64748b" }}>
                <Icons.Camera />
              </div>
            )}
            <div
              style={{
                color: "#3b82f6",
                fontWeight: "bold",
                marginTop: 10,
                fontSize: "14px",
              }}
            >
              {formData.image_url ? "Ganti Foto" : "Pilih Foto"}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept="image/*"
            />
          </div>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              fontSize: "13px",
              color: "#94a3b8",
              marginBottom: "8px",
              display: "block",
              fontWeight: "bold",
            }}
          >
            Kompatibilitas
          </label>
          <textarea
            placeholder="Cocok untuk motor..."
            value={formData.compatibility || ""}
            onChange={(e) =>
              setFormData({ ...formData, compatibility: e.target.value })
            }
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "8px",
              background: "#1e293b",
              color: "white",
              border: "1px solid #334155",
              boxSizing: "border-box",
              fontSize: "16px",
              height: "80px",
              resize: "none",
              outline: "none",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "10px",
          }}
        >
          <InputGroup
            label="Modal"
            type="number"
            value={formData.cost_price || ""}
            onChange={(e: any) =>
              setFormData({ ...formData, cost_price: e.target.value })
            }
          />
          <InputGroup
            label="Jual"
            type="number"
            value={formData.price || ""}
            onChange={(e: any) =>
              setFormData({ ...formData, price: e.target.value })
            }
          />
          <InputGroup
            label="Stok"
            type="number"
            value={formData.stock || ""}
            onChange={(e: any) =>
              setFormData({ ...formData, stock: e.target.value })
            }
          />
        </div>

        <div style={{ height: 60 }}></div>
      </div>

      {/* FOOTER ACTION */}
      <div
        style={{
          padding: "15px",
          background: "#1e293b",
          borderTop: "1px solid #334155",
        }}
      >
        <button
          onClick={handleSaveAction}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: "10px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            fontWeight: "bold",
            fontSize: "16px",
            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
          }}
        >
          SIMPAN DATA
        </button>
      </div>
    </div>
  );
}
