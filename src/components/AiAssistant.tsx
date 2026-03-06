import { useState, useRef, useEffect } from "react";

// --- ICONS (SVG) ---
const Icons = {
  Robot: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
      <path d="M4 11v2a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-2" />
      <path d="M9 22v-3" />
      <path d="M15 22v-3" />
      <rect x="4" y="8" width="16" height="9" rx="2" />
    </svg>
  ),
  Send: () => (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      style={{ marginLeft: "3px", flexShrink: 0 }}
    >
      <path fill="#ffffff" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  ),
  Close: () => (
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
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Sparkles: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fbbf24"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  Camera: () => (
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
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
      <circle cx="12" cy="13" r="4"></circle>
    </svg>
  ),
};

interface Message {
  id: number;
  sender: "user" | "ai";
  text?: string;
  imageUrl?: string; // [BARU] Mendukung gambar di chat
  time: string;
}

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "ai",
      text: "Halo Bos! Mau cek omset atau deteksi barang pakai foto? 🤖📸",
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Handle Kirim Teks Biasa
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
      // @ts-ignore
      const res = await window.api.askAI(userMsg.text);
      const aiResponseText =
        res.success && res.text
          ? res.text
          : "Waduh Bos, otak saya lagi macet nih.";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: aiResponseText,
          time: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: "ai", text: "Error sistem.", time: "" },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // [FITUR BARU] Handle Kirim Foto
  const handleSendImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result as string;

      // Munculkan foto di chat (User)
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
        // @ts-ignore
        const res = await window.api.askAIImage(base64Image);
        const aiResponseText =
          res.success && res.text ? res.text : "Maaf Bos, mata AI saya buram.";
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "ai",
            text: aiResponseText,
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
            text: "Error sistem saat membaca foto.",
            time: "",
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // Reset input
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "30px",
        right: "30px",
        zIndex: 99999,
        fontFamily: "sans-serif",
      }}
    >
      {/* TOMBOL FLOATING */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            border: "none",
            color: "white",
            cursor: "pointer",
            boxShadow: "0 10px 25px rgba(59, 130, 246, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <Icons.Robot />
        </button>
      )}

      {/* JENDELA CHAT */}
      {isOpen && (
        <div
          style={{
            width: "350px",
            height: "500px",
            background: "#1e293b",
            borderRadius: "20px",
            border: "1px solid #334155",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              padding: "15px 20px",
              background: "linear-gradient(90deg, #1e293b, #0f172a)",
              borderBottom: "1px solid #334155",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "35px",
                  height: "35px",
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <Icons.Robot />
              </div>
              <div>
                <div
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  Asisten Toko
                </div>
                <div
                  style={{
                    color: "#10b981",
                    fontSize: "10px",
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
                    }}
                  ></span>{" "}
                  Online
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
              }}
            >
              <Icons.Close />
            </button>
          </div>

          {/* BODY CHAT */}
          <div
            style={{
              flex: 1,
              padding: "15px",
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
                    padding: m.imageUrl ? "5px" : "10px 14px",
                    borderRadius:
                      m.sender === "user"
                        ? "12px 12px 0 12px"
                        : "12px 12px 12px 0",
                    background: m.sender === "user" ? "#3b82f6" : "#334155",
                    color: "white",
                    fontSize: "13px",
                    lineHeight: "1.4",
                  }}
                >
                  {m.text && (
                    <div
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {m.text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <strong
                            key={i}
                            style={{
                              color: m.sender === "user" ? "#fff" : "#fbbf24",
                            }}
                          >
                            {part.slice(2, -2)}
                          </strong>
                        ) : (
                          part
                        ),
                      )}
                    </div>
                  )}
                  {m.imageUrl && (
                    <img
                      src={m.imageUrl}
                      alt="Upload"
                      style={{
                        width: "100%",
                        borderRadius: "8px",
                        display: "block",
                      }}
                    />
                  )}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#64748b",
                    marginTop: "4px",
                    textAlign: m.sender === "user" ? "right" : "left",
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
                  background: "#334155",
                  padding: "10px 15px",
                  borderRadius: "12px",
                  color: "#94a3b8",
                  fontSize: "12px",
                  fontStyle: "italic",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Icons.Sparkles /> Sedang mengamati... 🧐
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT & KAMERA */}
          <div
            style={{
              padding: "15px",
              background: "#1e293b",
              borderTop: "1px solid #334155",
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            {/* Tombol Upload Foto */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                padding: "5px",
                display: "flex",
              }}
            >
              <Icons.Camera />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleSendImage}
              style={{ display: "none" }}
            />

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendText()}
              placeholder="Tanya sesuatu..."
              style={{
                flex: 1,
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "20px",
                padding: "10px 15px",
                color: "white",
                outline: "none",
                fontSize: "13px",
              }}
            />

            <button
              onClick={handleSendText}
              style={{
                width: "40px",
                height: "40px",
                minWidth: "40px",
                minHeight: "40px",
                borderRadius: "50%",
                background: "#3b82f6",
                border: "none",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icons.Send />
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );
}
