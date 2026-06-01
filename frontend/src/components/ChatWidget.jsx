import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_STREAM = `${import.meta.env.VITE_BACKEND_URL}/api/chat/stream`;
const WELCOME    = { role: "model", text: "Bonjour ! Je suis l'assistant ocazz.ma.\nComment puis-je vous aider aujourd'hui ?" };

function getSessionId() {
  let id = localStorage.getItem("chatbot_session_id");
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("chatbot_session_id", id);
  }
  return id;
}

function BotAvatar({ size = 28 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
      </svg>
    </div>
  );
}

function SellConfirm({ onYes, onNo }) {
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 10, paddingLeft: 33 }}>
      <button
        onClick={onYes}
        style={{
          padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer",
          background: "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)",
          color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "inherit",
        }}
      >
        Publier maintenant
      </button>
      <button
        onClick={onNo}
        style={{
          padding: "8px 16px", borderRadius: 10, cursor: "pointer",
          background: "#fff", border: "1px solid #E2E8F0",
          color: "#64748B", fontSize: 13, fontWeight: 600, fontFamily: "inherit",
        }}
      >
        Plus tard
      </button>
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
      <BotAvatar size={26} />
      <div style={{
        display: "inline-flex", gap: 5, alignItems: "center",
        padding: "11px 15px", background: "#fff", borderRadius: "16px 16px 16px 4px",
        border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 6, height: 6, background: "#94A3B8", borderRadius: "50%",
            display: "inline-block",
            animation: `dot-bounce 1.2s ${i * 0.2}s infinite ease-in-out`,
          }} />
        ))}
      </div>
    </div>
  );
}

function LeadForm({ onSubmit, sending }) {
  const [name, setName]   = useState("");
  const [phone, setPhone] = useState("");

  const handle = (e) => {
    e.preventDefault();
    if (name.trim() && phone.trim()) onSubmit(name.trim(), phone.trim());
  };

  return (
    <form onSubmit={handle} style={{
      marginTop: 8, padding: "12px 14px",
      background: "#EFF6FF", border: "1px solid #BFDBFE",
      borderRadius: 12, display: "flex", flexDirection: "column", gap: 8,
    }}>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#1D4ED8" }}>
        Laissez vos coordonnées
      </p>
      <input
        type="text"
        placeholder="Votre prénom"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        style={{
          padding: "8px 10px", fontSize: 13, borderRadius: 8,
          border: "1px solid #BFDBFE", outline: "none", background: "#fff",
          fontFamily: "inherit",
        }}
      />
      <input
        type="tel"
        placeholder="Numéro de téléphone"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        required
        style={{
          padding: "8px 10px", fontSize: 13, borderRadius: 8,
          border: "1px solid #BFDBFE", outline: "none", background: "#fff",
          fontFamily: "inherit",
        }}
      />
      <button
        type="submit"
        disabled={sending || !name.trim() || !phone.trim()}
        style={{
          padding: "8px 0", borderRadius: 8, border: "none",
          background: sending ? "#93C5FD" : "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)",
          color: "#fff", fontSize: 13, fontWeight: 600, cursor: sending ? "default" : "pointer",
          fontFamily: "inherit",
        }}
      >
        {sending ? "Envoi…" : "Envoyer"}
      </button>
    </form>
  );
}

export default function ChatWidget() {
  const { pathname }      = useLocation();
  const navigate          = useNavigate();
  const [convActive, setConvActive] = useState(false);
  const btnBottom         = convActive ? 108 : 28;

  useEffect(() => {
    const handler = e => setConvActive(e.detail?.active ?? false);
    window.addEventListener("messages:conv-active", handler);
    return () => window.removeEventListener("messages:conv-active", handler);
  }, []);
  const sessionId         = useRef(getSessionId());

  const [open, setOpen]           = useState(false);
  const [msgs, setMsgs]           = useState([WELCOME]);
  const [input, setInput]         = useState("");
  const [streaming, setStreaming] = useState(false);
  const [pendingSell, setPendingSell] = useState(null);

  const msgsRef      = useRef(null);
  const inputRef     = useRef(null);
  const abortRef     = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (open && containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [msgs]);

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;

    setMsgs(ms => [...ms, { role: "user", text }, { role: "model", text: "" }]);
    setInput("");
    setStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_STREAM, {
        method: "POST",
        signal: ctrl.signal,
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: text, session_id: sessionId.current }),
      });

      if (!res.ok) throw new Error("api_error");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer    = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw || raw === "[DONE]") continue;
          try {
            const chunk = JSON.parse(raw);

            // Custom events from backend
            if (chunk.type === "sell_redirect") {
              setPendingSell(chunk.data);
              setMsgs(ms => [...ms, { role: "model", text: "Souhaitez-vous publier cette annonce maintenant ?", confirmSell: true }]);
              continue;
            }
            if (chunk.type === "error") {
              setMsgs(ms => [...ms.slice(0, -1), { role: "error", text: chunk.text }]);
              continue;
            }

            const delta = chunk.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              setMsgs(ms => {
                const last = ms[ms.length - 1];
                return [...ms.slice(0, -1), { ...last, text: last.text + delta }];
              });
            }
          } catch { /* skip malformed chunk */ }
        }
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      setMsgs(ms => {
        const last = ms[ms.length - 1];
        if (last.role === "model" && last.text === "") {
          return [...ms.slice(0, -1), { role: "error", text: "Désolé, une erreur est survenue. Réessayez." }];
        }
        return ms;
      });
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const handleKey = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const handleSellYes = () => {
    if (!pendingSell) return;
    localStorage.setItem("chatbot_sell_prefill", JSON.stringify(pendingSell));
    setPendingSell(null);
    const token = localStorage.getItem("token");
    setOpen(false);
    navigate(token ? "/sell" : "/Login?redirect=/sell");
  };

  const handleSellNo = () => {
    setPendingSell(null);
    setMsgs(ms => [...ms, { role: "model", text: "Pas de problème ! Vous pourrez publier votre annonce quand vous le souhaitez depuis la page « Vendre »." }]);
  };

  const clearChat = () => {
    if (streaming) { abortRef.current?.abort(); setStreaming(false); }
    setMsgs([WELCOME]);
    setInput("");
    setPendingSell(null);
    // New session on clear
    const newId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("chatbot_session_id", newId);
    sessionId.current = newId;
  };

  const lastMsg      = msgs[msgs.length - 1];
  const awaitingFirst = streaming && lastMsg?.role === "model" && lastMsg?.text === "";
  const canSend      = input.trim().length > 0 && !streaming;

  return (
    <div ref={containerRef}>
      <style>{`
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes chat-slide-up {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes btn-pulse {
          0%, 100% { box-shadow: 0 4px 16px rgba(59,130,246,0.4); }
          50%       { box-shadow: 0 4px 28px rgba(59,130,246,0.65); }
        }
        .chat-fab { animation: btn-pulse 2.8s ease-in-out infinite; }
        .chat-fab:hover { transform: scale(1.1) !important; }
        .chat-fab.is-open { animation: none; }
        .chat-window { animation: chat-slide-up 0.24s cubic-bezier(0.22,1,0.36,1); }
        .chat-msgs::-webkit-scrollbar { width: 4px; }
        .chat-msgs::-webkit-scrollbar-track { background: transparent; }
        .chat-msgs::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 2px; }
        .chat-input:focus { border-color: #3B82F6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12) !important; }
      `}</style>

      {/* Floating button */}
      <button
        className={`chat-fab${open ? " is-open" : ""}`}
        onClick={() => setOpen(o => !o)}
        title="Assistant ocazz.ma"
        style={{
          position: "fixed", bottom: btnBottom, right: 28, zIndex: 1000,
          width: 56, height: 56,
          background: open
            ? "linear-gradient(135deg, #475569 0%, #334155 100%)"
            : "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)",
          border: "none", cursor: "pointer", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s, transform 0.18s, bottom 0.22s",
        }}
      >
        <div style={{ transition: "transform 0.22s, opacity 0.18s", transform: open ? "rotate(90deg)" : "rotate(0deg)" }}>
          {open ? (
            <svg width="18" height="18" fill="none" stroke="#fff" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          ) : (
            <svg width="23" height="23" fill="none" stroke="#fff" viewBox="0 0 24 24" strokeWidth={1.7}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          )}
        </div>
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="chat-window"
          style={{
            position: "fixed", bottom: btnBottom + 68, right: 28, zIndex: 999,
            width: 370, height: 540,
            background: "#fff",
            borderRadius: 20,
            boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 4px 20px rgba(0,0,0,0.1)",
            display: "flex", flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{
            padding: "14px 16px",
            background: "linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)",
            display: "flex", alignItems: "center", gap: 11, flexShrink: 0,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid rgba(255,255,255,0.25)",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
              </svg>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 14.5, color: "#fff", letterSpacing: "-0.02em" }}>
                Assistant ocazz.ma
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                <span style={{ width: 7, height: 7, background: "#4ADE80", borderRadius: "50%", flexShrink: 0, boxShadow: "0 0 6px rgba(74,222,128,0.8)" }} />
                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>En ligne</p>
              </div>
            </div>

            {msgs.length > 1 && (
              <button
                onClick={clearChat}
                title="Effacer la conversation"
                style={{
                  background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 8, padding: "5px 8px", cursor: "pointer",
                  color: "rgba(255,255,255,0.75)", fontSize: 11, fontFamily: "Manrope,sans-serif",
                  fontWeight: 600, display: "flex", alignItems: "center", gap: 4,
                  transition: "background 0.15s", flexShrink: 0,
                }}
                onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.22)"}
                onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
              >
                <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4l16 16M4 20L20 4"/>
                </svg>
                Effacer
              </button>
            )}
          </div>

          {/* Messages */}
          <div
            ref={msgsRef}
            className="chat-msgs"
            style={{
              flex: 1, overflowY: "auto", padding: "16px 14px 10px",
              display: "flex", flexDirection: "column", gap: 10,
              background: "#F8FAFC",
            }}
          >
            {msgs.map((m, i) => {
              const isUser  = m.role === "user";
              const isError = m.role === "error";
              const isEmpty = m.role === "model" && m.text === "" && i === msgs.length - 1 && awaitingFirst;
              if (isEmpty) return null;
              const isLast = i === msgs.length - 1;
              const displayText = m.text.replace(/\[SELL_REDIRECT:[\s\S]*/, "").trimEnd();
              return (
                <div key={i}>
                  <div style={{ display: "flex", flexDirection: isUser ? "row-reverse" : "row", alignItems: "flex-end", gap: 7 }}>
                    {!isUser && <BotAvatar size={26} />}
                    <div style={{
                      maxWidth: "76%",
                      padding: "10px 14px",
                      fontSize: 13.5, lineHeight: "21px",
                      whiteSpace: "pre-wrap",
                      borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: isUser
                        ? "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)"
                        : isError ? "#FEF2F2" : "#fff",
                      color: isUser ? "#fff" : isError ? "#DC2626" : "#1E293B",
                      border: isUser ? "none" : `1px solid ${isError ? "#FECACA" : "#E2E8F0"}`,
                      boxShadow: isUser
                        ? "0 2px 10px rgba(99,102,241,0.3)"
                        : "0 1px 3px rgba(0,0,0,0.05)",
                      fontFamily: "inherit",
                    }}>
                      {displayText}
                    </div>
                  </div>
                  {m.confirmSell && isLast && pendingSell && (
                    <SellConfirm onYes={handleSellYes} onNo={handleSellNo} />
                  )}
                </div>
              );
            })}

            {awaitingFirst && <TypingDots />}
          </div>

          {/* Input */}
          <div style={{
            padding: "10px 12px 12px",
            background: "#fff",
            borderTop: "1px solid #F1F5F9",
          }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Posez votre question…"
                className="chat-input"
                style={{
                  flex: 1, minHeight: 42, maxHeight: 100, resize: "none",
                  fontSize: 13.5, padding: "10px 13px", lineHeight: "20px",
                  border: "1.5px solid #E2E8F0", borderRadius: 12,
                  background: "#F8FAFC", fontFamily: "inherit", color: "#1E293B",
                  outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
                }}
              />
              <button
                onClick={send}
                disabled={!canSend}
                style={{
                  width: 42, height: 42, padding: 0, flexShrink: 0,
                  borderRadius: 12, border: "none",
                  cursor: canSend ? "pointer" : "default",
                  background: canSend
                    ? "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)"
                    : "#E2E8F0",
                  color: canSend ? "#fff" : "#94A3B8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.15s, box-shadow 0.15s, transform 0.12s",
                  boxShadow: canSend ? "0 2px 10px rgba(99,102,241,0.35)" : "none",
                  transform: "scale(1)",
                }}
                onMouseOver={e => { if (canSend) e.currentTarget.style.transform = "scale(1.07)"; }}
                onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
              </button>
            </div>
            <p style={{ margin: "7px 0 0", fontSize: 10.5, color: "#CBD5E1", textAlign: "center" }}>
              Entrée pour envoyer · Maj+Entrée pour sauter une ligne
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
