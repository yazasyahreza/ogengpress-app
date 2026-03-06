import { useState, useRef, useEffect } from "react";

// --- KUMPULAN ICON MODERN (SVG) ANTI-MENYUSUT ---
const Icons = {
  Robot: () => (
    <svg style={{ width: "26px", height: "26px", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  ),
  Camera: () => (
    <svg style={{ width: "22px", height: "22px", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  Send: () => (
    <svg style={{ width: "20px", height: "20px", flexShrink: 0, marginLeft: "-2px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Close: () => (
    <svg style={{ width: "22px", height: "22px", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

interface Message {
  id: number;
  sender: "user" | "ai";
  text?: string;
  imageUrl?: string;
  time: string;
}

export default function AiAssistantMobile() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "ai",
      text: "Halo Bos! Ada yang bisa dibantu cek dari HP? 📱",
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null); // Untuk auto-scroll ke bawah

  // --- STATE & REF UNTUK FITUR DRAG (GESER ROBOT) ---
  const [pos, setPos] = useState({ right: 20, bottom: 85 });
  const dragRef = useRef({
    isDragging: false,
    hasMoved: false,
    startX: 0,
    startY: 0,
    startRight: 0,
    startBottom: 0,
  });

  const API_URL = `http://${window.location.hostname}:3000`;

  // Auto-scroll saat pesan baru masuk
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  // --- LOGIKA DRAG & DROP MULTI-DEVICE (TOUCH & MOUSE) ---
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    dragRef.current = {
      isDragging: true,
      hasMoved: false,
      startX: e.clientX,
      startY: e.clientY,
      startRight: pos.right,
      startBottom: pos.bottom,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current.isDragging) return;

    const deltaX = dragRef.current.startX - e.clientX;
    const deltaY = dragRef.current.startY - e.clientY;

    // Jika digeser lebih dari 5 pixel, tandai sebagai "Drag" bukan "Klik"
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      dragRef.current.hasMoved = true;
    }

    if (dragRef.current.hasMoved) {
      setPos({
        right: dragRef.current.startRight + deltaX,
        bottom: dragRef.current.startBottom + deltaY,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    dragRef.current.isDragging = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleClickRobot = () => {
    // Hanya buka chat jika tidak sedang digeser (murni diklik)
    if (!dragRef.current.hasMoved) {
      setIsOpen(true);
    }
  };
  // ----------------------------------------------------

  const renderFormattedText = (text: string) => {
    return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} style={{ color: "#fbbf24" }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handleSendText = async () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now(),
      sender: "user",
      text: input,
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/api/ask-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg.text }),
      });
      const data = await response.json();
      const aiText = data.success
        ? data.text
        : "Waduh Bos, otak saya lagi putus koneksi.";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: aiText,
          time: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "ai",
          text: "Error jaringan ke Server PC.",
          time: "",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result as string;
      const userMsg: Message = {
        id: Date.now(),
        sender: "user",
        imageUrl: base64Image,
        time: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      try {
        const response = await fetch(`${API_URL}/api/ask-ai-image`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64: base64Image }),
        });
        const data = await response.json();
        const aiText = data.success
          ? data.text
          : "Maaf Bos, mata AI saya buram.";
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "ai",
            text: aiText,
            time: new Date().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: "ai",
            text: "Gagal kirim foto ke Server PC.",
            time: "",
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      {/* 🤖 TOMBOL MELAYANG YANG BISA DIGESER */}
      <button
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleClickRobot}
        style={{
          position: "fixed",
          bottom: pos.bottom,
          right: pos.right,
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #3b82f6, #2563eb)",
          color: "white",
          border: "none",
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.5)",
          cursor: "grab",
          touchAction: "none", // Penting agar layar tidak ikut scroll saat robot digeser
          transition: dragRef.current?.isDragging ? "none" : "box-shadow 0.2s",
        }}
      >
        <Icons.Robot />
      </button>

      {/* JENDELA CHAT */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#0f172a",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            animation: "slideUp 0.3s ease-out",
          }}
        >
          <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "15px 20px",
              background: "#1e293b",
              color: "white",
              borderBottom: "1px solid #334155",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  background: "rgba(59, 130, 246, 0.2)",
                  padding: "8px",
                  borderRadius: "50%",
                  color: "#3b82f6",
                  display: "flex",
                }}
              >
                <Icons.Robot />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
                  Asisten Toko
                </h3>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      background: "#10b981",
                      borderRadius: "50%",
                      display: "inline-block",
                    }}
                  ></span>{" "}
                  Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "rgba(255,255,255,0.1)",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                color: "white",
                cursor: "pointer",
              }}
            >
              <Icons.Close />
            </button>
          </div>

          {/* Area Chat */}
          <div
            style={{
              flex: 1,
              padding: "20px 15px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              background: "#0f172a",
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                }}
              >
                <div
                  style={{
                    background: m.sender === "user" ? "#3b82f6" : "#1e293b",
                    color: "white",
                    padding: "12px 16px",
                    borderRadius: "16px",
                    borderBottomRightRadius:
                      m.sender === "user" ? "4px" : "16px",
                    borderBottomLeftRadius: m.sender === "ai" ? "4px" : "16px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                >
                  {m.imageUrl && (
                    <img
                      src={m.imageUrl}
                      alt="upload"
                      style={{
                        width: "100%",
                        borderRadius: "8px",
                        marginBottom: "8px",
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
                    />
                  )}
                  {m.text && (
                    <div
                      style={{
                        whiteSpace: "pre-wrap",
                        fontSize: "14px",
                        lineHeight: "1.5",
                      }}
                    >
                      {renderFormattedText(m.text)}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#64748b",
                    textAlign: m.sender === "user" ? "right" : "left",
                    marginTop: "6px",
                    padding: "0 4px",
                  }}
                >
                  {m.time}
                </div>
              </div>
            ))}
            {isTyping && (
              <div
                style={{
                  alignSelf: "flex-start",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#1e293b",
                  padding: "10px 16px",
                  borderRadius: "16px",
                  borderBottomLeftRadius: "4px",
                }}
              >
                <div
                  className="dot-pulse"
                  style={{
                    color: "#fbbf24",
                    fontSize: "12px",
                    fontStyle: "italic",
                  }}
                >
                  Memeriksa gudang...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Area Input (Kamera, Teks, Pesawat Kertas) */}
          <div
            style={{
              display: "flex",
              padding: "12px 15px",
              background: "#1e293b",
              alignItems: "center",
              gap: "12px",
              borderTop: "1px solid #334155",
              paddingBottom: "max(12px, env(safe-area-inset-bottom))",
            }}
          >
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            {/* Tombol Kamera Modern */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: "rgba(59, 130, 246, 0.1)",
                color: "#3b82f6",
                border: "none",
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <Icons.Camera />
            </button>

            {/* Kolom Teks */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendText()}
              placeholder="Tanya stok atau ukuran..."
              style={{
                flex: 1,
                padding: "12px 18px",
                borderRadius: "24px",
                border: "1px solid #334155",
                outline: "none",
                background: "#0f172a",
                color: "white",
                fontSize: "14px",
              }}
            />

            {/* Tombol Pesawat Kertas */}
            <button
              onClick={handleSendText}
              disabled={!input.trim()}
              style={{
                background: input.trim() ? "#3b82f6" : "#334155",
                color: input.trim() ? "white" : "#64748b",
                border: "none",
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "0.2s",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <Icons.Send />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
