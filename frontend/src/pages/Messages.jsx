import { useState, useEffect, useRef, useCallback } from "react";
import { axiosClient } from "../api/axios";

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString("fr-MA", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return d.toLocaleDateString("fr-MA", { weekday: "short" });
  return d.toLocaleDateString("fr-MA", { day: "2-digit", month: "short" });
}

function Avatar({ name, size = 36 }) {
  const palette = ["#3B82F6", "#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
  const bg = palette[(name?.charCodeAt(0) ?? 0) % palette.length];
  const initials = name
    ? name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()
    : "?";
  return (
    <div style={{
      width: size, height: size, background: bg, borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontFamily: "Manrope, sans-serif", fontWeight: 700,
      fontSize: Math.round(size * 0.36), flexShrink: 0, letterSpacing: "-0.02em",
    }}>
      {initials}
    </div>
  );
}

function Spinner({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="anim-spin">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem("user")) ?? {}; }
  catch { return {}; }
}

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv]       = useState(null);
  const [messages, setMessages]           = useState([]);
  const [text, setText]                   = useState("");
  const [loadingConvs, setLoadingConvs]   = useState(true);
  const [loadingMsgs, setLoadingMsgs]     = useState(false);
  const [sending, setSending]             = useState(false);
  const [convError, setConvError]         = useState(null);
  const [deleting, setDeleting]           = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const messagesRef = useRef(null);
  const inputRef    = useRef(null);
  const currentUser = getCurrentUser();

  const loadConversations = useCallback(() => {
    axiosClient.get("/conversations")
      .then(r => setConversations(r.data.data ?? r.data))
      .catch(e => setConvError(e.response?.data?.message ?? "Erreur de chargement"))
      .finally(() => setLoadingConvs(false));
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const openConversation = useCallback((conv) => {
    if (activeConv?.id === conv.id) return;
    setActiveConv(conv);
    setMessages([]);
    setConfirmDelete(false);
    setLoadingMsgs(true);
    axiosClient.get(`/conversations/${conv.id}`)
      .then(r => {
        setMessages(r.data.messages?.data ?? r.data.messages ?? []);
        setConversations(cs => cs.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c));
      })
      .catch(console.error)
      .finally(() => setLoadingMsgs(false));
  }, [activeConv?.id]);

  useEffect(() => {
    if (messages.length > 0 && messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Poll active conversation every 4s
  useEffect(() => {
    if (!activeConv) return;
    const id = activeConv.id;
    const interval = setInterval(() => {
      axiosClient.get(`/conversations/${id}`)
        .then(r => {
          const fresh = r.data.messages?.data ?? r.data.messages ?? [];
          setMessages(current => {
            const hasNew = fresh.some(m => !current.find(c => c.id === m.id));
            if (!hasNew) return current;
            const temps = current.filter(m => String(m.id).startsWith("temp-"));
            return [...fresh, ...temps];
          });
        })
        .catch(() => {});
    }, 4000);
    return () => clearInterval(interval);
  }, [activeConv?.id]);

  // Poll inbox every 10s
  useEffect(() => {
    const interval = setInterval(loadConversations, 10000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    const content = text.trim();
    if (!content || !activeConv || sending) return;
    setSending(true);
    const optimistic = {
      id: `temp-${Date.now()}`, content, is_mine: true,
      created_at: new Date().toISOString(), sender: { name: currentUser?.name }, is_read: false,
    };
    setMessages(ms => [...ms, optimistic]);
    setText("");
    try {
      const res = await axiosClient.post(`/conversations/${activeConv.id}/messages`, { content });
      const sent = res.data?.data ?? res.data;
      setMessages(ms => ms.map(m => m.id === optimistic.id ? sent : m));
      loadConversations();
    } catch (err) {
      setMessages(ms => ms.filter(m => m.id !== optimistic.id));
      setText(content);
      console.error(err);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const deleteConversation = async () => {
    if (!activeConv) return;
    setDeleting(true);
    try {
      await axiosClient.delete(`/conversations/${activeConv.id}`);
      setConversations(cs => cs.filter(c => c.id !== activeConv.id));
      setActiveConv(null);
      setMessages([]);
      setConfirmDelete(false);
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const totalUnread = conversations.reduce((s, c) => s + (c.unread_count ?? 0), 0);

  return (
    <>
      <style>{`
        .conv-item { transition: background 0.13s; }
        .conv-item:hover { background: var(--bg-off) !important; }
        .msg-input:focus { border-color: var(--accent-blue) !important; outline: none; }
      `}</style>

      <div style={{
        height: "calc(100vh - 80px)", display: "flex", overflow: "hidden",
        background: "#F1F5F9",
      }}>

        {/* ── Left panel ── */}
        <div style={{
          width: 300, flexShrink: 0, display: "flex", flexDirection: "column",
          background: "#fff", borderRight: "1px solid #E2E8F0",
        }}>
          {/* Panel header */}
          <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 17, fontFamily: "Manrope,sans-serif", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>
                  Messages
                </h4>
                {conversations.length > 0 && (
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94A3B8" }}>
                    {conversations.length} conversation{conversations.length > 1 ? "s" : ""}
                  </p>
                )}
              </div>
              {totalUnread > 0 && (
                <span style={{
                  minWidth: 22, height: 22, lineHeight: "22px", textAlign: "center",
                  fontSize: 11, fontWeight: 700, background: "#3B82F6", color: "#fff",
                  borderRadius: 11, padding: "0 7px", fontFamily: "Manrope,sans-serif",
                }}>
                  {totalUnread}
                </span>
              )}
            </div>
          </div>

          {/* Conversation list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loadingConvs ? (
              <div style={{ padding: "60px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "#94A3B8", fontSize: 13 }}>
                <Spinner /> Chargement…
              </div>
            ) : convError ? (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <p style={{ color: "#EF4444", fontSize: 13, margin: "0 0 12px" }}>{convError}</p>
                <button onClick={loadConversations} className="btn-outline" style={{ height: 36, padding: "0 16px", fontSize: 12 }}>
                  Réessayer
                </button>
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: "60px 20px", textAlign: "center" }}>
                <div style={{
                  width: 56, height: 56, background: "#F1F5F9", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px",
                }}>
                  <svg width="26" height="26" fill="none" stroke="#94A3B8" viewBox="0 0 24 24" strokeWidth={1.4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                </div>
                <p style={{ color: "#475569", fontSize: 13, margin: "0 0 4px", fontWeight: 600, fontFamily: "Manrope,sans-serif" }}>Aucune conversation</p>
                <p style={{ color: "#94A3B8", fontSize: 12, margin: 0 }}>Contactez un vendeur depuis une annonce</p>
              </div>
            ) : (
              conversations.map(conv => {
                const isActive  = activeConv?.id === conv.id;
                const hasUnread = (conv.unread_count ?? 0) > 0;
                return (
                  <button
                    key={conv.id}
                    className="conv-item"
                    onClick={() => openConversation(conv)}
                    style={{
                      width: "100%", padding: "13px 16px",
                      background: isActive ? "#EFF6FF" : "#fff",
                      border: "none", borderBottom: "1px solid #F1F5F9",
                      borderLeft: `3px solid ${isActive ? "#3B82F6" : "transparent"}`,
                      cursor: "pointer", textAlign: "left",
                      display: "flex", gap: 11, alignItems: "center",
                    }}
                  >
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <Avatar name={conv.participant?.name} size={42} />
                      {hasUnread && (
                        <span style={{
                          position: "absolute", top: -2, right: -2,
                          width: 10, height: 10, background: "#3B82F6",
                          borderRadius: "50%", border: "2px solid #fff",
                        }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
                        <span style={{
                          fontSize: 13.5, fontWeight: hasUnread ? 700 : 600,
                          color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis",
                          whiteSpace: "nowrap", maxWidth: 140, fontFamily: "Manrope,sans-serif",
                        }}>
                          {conv.participant?.name ?? "—"}
                        </span>
                        <span style={{ fontSize: 10.5, color: "#94A3B8", flexShrink: 0, marginLeft: 6 }}>
                          {formatTime(conv.last_message_at)}
                        </span>
                      </div>
                      <p style={{
                        margin: 0, fontSize: 12, lineHeight: "16px",
                        color: hasUnread ? "#334155" : "#94A3B8",
                        fontWeight: hasUnread ? 600 : 400,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {conv.last_message?.content
                          ? conv.last_message.content
                          : <em style={{ fontStyle: "italic", color: "#CBD5E1" }}>{conv.annonce?.title ?? "Nouvelle conversation"}</em>
                        }
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {!activeConv ? (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 16, padding: 40,
              background: "#F8FAFC",
            }}>
              <div style={{
                width: 80, height: 80, background: "#fff", border: "1px solid #E2E8F0",
                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}>
                <svg width="36" height="36" fill="none" stroke="#CBD5E1" viewBox="0 0 24 24" strokeWidth={1.3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, fontFamily: "Manrope,sans-serif", color: "#334155" }}>
                  Sélectionnez une conversation
                </p>
                <p style={{ margin: 0, fontSize: 13, color: "#94A3B8" }}>
                  Choisissez une discussion dans la liste à gauche
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{
                padding: "14px 20px", borderBottom: "1px solid #E2E8F0",
                background: "#fff", display: "flex", alignItems: "center", gap: 13, flexShrink: 0,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                <Avatar name={activeConv.participant?.name} size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14.5, fontFamily: "Manrope,sans-serif", color: "#0F172A" }}>
                    {activeConv.participant?.name}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <span style={{ color: "#CBD5E1" }}>Annonce · </span>
                    <span style={{ color: "#3B82F6", fontWeight: 500 }}>{activeConv.annonce?.title ?? "—"}</span>
                  </p>
                </div>

                {/* Delete */}
                {confirmDelete ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>Supprimer ?</span>
                    <button
                      onClick={deleteConversation}
                      disabled={deleting}
                      style={{
                        background: "#EF4444", color: "#fff", border: "none",
                        padding: "6px 12px", fontSize: 12, fontWeight: 700,
                        cursor: deleting ? "not-allowed" : "pointer",
                        borderRadius: 6, fontFamily: "Manrope,sans-serif",
                        opacity: deleting ? 0.6 : 1,
                      }}>
                      {deleting ? "…" : "Confirmer"}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      style={{
                        background: "transparent", color: "#64748B", border: "1px solid #E2E8F0",
                        padding: "6px 12px", fontSize: 12, fontWeight: 600,
                        cursor: "pointer", borderRadius: 6, fontFamily: "Manrope,sans-serif",
                      }}>
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    title="Supprimer la conversation"
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "#CBD5E1", padding: 7, display: "flex", alignItems: "center",
                      flexShrink: 0, borderRadius: 8, transition: "color 0.15s, background 0.15s",
                    }}
                    onMouseOver={e => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "#FEF2F2"; }}
                    onMouseOut={e => { e.currentTarget.style.color = "#CBD5E1"; e.currentTarget.style.background = "none"; }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                )}
              </div>

              {/* Messages area */}
              <div
                ref={messagesRef}
                style={{
                  flex: 1, overflowY: "auto", padding: "20px 24px 8px",
                  display: "flex", flexDirection: "column", gap: 8,
                  background: "#F8FAFC",
                }}
              >
                {loadingMsgs ? (
                  <div style={{ textAlign: "center", paddingTop: 60, color: "#94A3B8", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 13 }}>
                    <Spinner /> Chargement…
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: "center", paddingTop: 60 }}>
                    <p style={{ color: "#94A3B8", fontSize: 13, margin: 0 }}>
                      Aucun message — démarrez la conversation !
                    </p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const mine   = msg.is_mine ?? (msg.sender?.id === currentUser?.id);
                    const isTemp = typeof msg.id === "string" && msg.id.startsWith("temp-");
                    return (
                      <div key={msg.id} style={{ display: "flex", flexDirection: mine ? "row-reverse" : "row", alignItems: "flex-end", gap: 8 }}>
                        {!mine && <Avatar name={msg.sender?.name} size={28} />}
                        <div style={{ maxWidth: "60%" }}>
                          <div style={{
                            padding: "9px 14px",
                            fontSize: 13.5, lineHeight: "21px",
                            whiteSpace: "pre-wrap",
                            borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                            background: mine ? "#3B82F6" : "#fff",
                            color: mine ? "#fff" : "#1E293B",
                            border: mine ? "none" : "1px solid #E2E8F0",
                            boxShadow: mine ? "0 2px 8px rgba(59,130,246,0.25)" : "0 1px 3px rgba(0,0,0,0.05)",
                            opacity: isTemp ? 0.65 : 1,
                            transition: "opacity 0.2s",
                          }}>
                            {msg.content}
                          </div>
                          <p style={{
                            margin: "4px 0 0", fontSize: 10.5, color: "#94A3B8",
                            textAlign: mine ? "right" : "left",
                            display: "flex", alignItems: "center",
                            justifyContent: mine ? "flex-end" : "flex-start", gap: 4,
                          }}>
                            {formatTime(msg.created_at)}
                            {mine && !isTemp && (
                              <svg width="11" height="11" fill="none" stroke={msg.is_read ? "#3B82F6" : "#CBD5E1"} viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                              </svg>
                            )}
                            {isTemp && <Spinner size={9} />}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input bar */}
              <form
                onSubmit={sendMessage}
                style={{
                  padding: "12px 16px", background: "#fff",
                  borderTop: "1px solid #E2E8F0",
                  display: "flex", gap: 10, alignItems: "flex-end", flexShrink: 0,
                }}
              >
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Votre message… (Entrée pour envoyer)"
                  className="msg-input"
                  style={{
                    flex: 1, minHeight: 44, maxHeight: 120, resize: "none",
                    fontSize: 13.5, padding: "11px 14px", lineHeight: "20px",
                    border: "1px solid #E2E8F0", borderRadius: 12,
                    background: "#F8FAFC", fontFamily: "inherit",
                    color: "#1E293B", outline: "none", transition: "border-color 0.15s",
                  }}
                />
                <button
                  type="submit"
                  disabled={!text.trim() || sending}
                  style={{
                    width: 44, height: 44, padding: 0, flexShrink: 0,
                    borderRadius: 12, border: "none", cursor: text.trim() && !sending ? "pointer" : "not-allowed",
                    background: text.trim() && !sending ? "#3B82F6" : "#E2E8F0",
                    color: text.trim() && !sending ? "#fff" : "#94A3B8",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.15s, color 0.15s",
                    boxShadow: text.trim() && !sending ? "0 2px 8px rgba(59,130,246,0.3)" : "none",
                  }}
                >
                  {sending ? <Spinner size={16} /> : (
                    <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
