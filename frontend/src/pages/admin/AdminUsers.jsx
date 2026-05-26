import { useState, useEffect, useCallback } from "react";
import { axiosClient } from "../../api/axios";

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="anim-spin">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}

function InitialAvatar({ name }) {
  const colors = ["#007BFF", "#5881BC", "#28A745", "#6C757D", "#FFC107"];
  const idx = (name?.charCodeAt(0) ?? 0) % colors.length;
  return (
    <div style={{ width: 34, height: 34, background: colors[idx], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
      {name?.charAt(0).toUpperCase() ?? "?"}
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers]       = useState([]);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [deleting, setDeleting] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [confirmName, setConfirmName] = useState("");
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState("");

  const load = useCallback((p = 1) => {
    setLoading(true);
    setError(null);
    axiosClient.get(`/admin/users?page=${p}`)
      .then(r => {
        setUsers(r.data.data ?? []);
        setLastPage(r.data.meta?.last_page ?? r.data.last_page ?? 1);
      })
      .catch(e => setError(e.response?.data?.message ?? "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(page); }, [page, load]);

  const openConfirm = (user) => { setConfirmId(user.id); setConfirmName(user.name); };
  const closeConfirm = () => { setConfirmId(null); setConfirmName(""); };

  const deleteUser = async () => {
    setDeleting(confirmId);
    try {
      await axiosClient.delete(`/admin/users/${confirmId}`);
      closeConfirm();
      load(page);
    } catch (e) {
      setError(e.response?.data?.message ?? "Erreur lors de la suppression");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = search.trim()
    ? users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  return (
    <div style={{ padding: "40px 48px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ margin: "0 0 6px", fontSize: 30 }}>Utilisateurs</h2>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>Gérez les comptes de la plateforme</p>
        </div>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Rechercher un utilisateur…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field"
            style={{ width: 280, height: 44, paddingLeft: 40, fontSize: 14 }}
          />
          <svg width="16" height="16" fill="none" stroke="var(--text-faint)" viewBox="0 0 24 24" strokeWidth={2} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
      </div>

      {error && (
        <div style={{ background: "#FFF5F5", border: "1px solid var(--error)", borderLeft: "4px solid var(--error)", padding: "14px 18px", marginBottom: 20, color: "var(--error)", fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmId && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={closeConfirm}
        >
          <div
            style={{ background: "#fff", padding: "40px", width: "100%", maxWidth: 440, border: "1px solid var(--border)" }}
            onClick={e => e.stopPropagation()}
            className="anim-up"
          >

            <h4 style={{ margin: "0 0 10px", fontSize: 20 }}>Supprimer cet utilisateur ?</h4>
            <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: "22px", margin: "0 0 10px" }}>
              Vous êtes sur le point de supprimer <strong>{confirmName}</strong>.
            </p>
            <p style={{ color: "var(--text-faint)", fontSize: 13, margin: "0 0 28px" }}>
              Cette action est <strong>irréversible</strong>. Toutes les données de l'utilisateur (annonces, messages, favoris) seront supprimées.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={deleteUser}
                disabled={!!deleting}
                className="btn-secondary"
                style={{ flex: 1, height: 46, fontSize: 14, background: "var(--error)", borderColor: "var(--error)", cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.7 : 1 }}>
                {deleting ? <><Spinner /> Suppression…</> : "Oui, supprimer"}
              </button>
              <button
                onClick={closeConfirm}
                className="btn-secondary"
                style={{ flex: 1, height: 46, lineHeight: "46px", fontSize: 14 }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}>
        {loading ? (
          <div style={{ padding: "80px 0", textAlign: "center", color: "var(--text-faint)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <Spinner /> Chargement…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "80px 0", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, background: "var(--bg-off)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="26" height="26" fill="none" stroke="var(--text-faint)" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <p style={{ color: "var(--text-faint)", fontSize: 15, margin: 0 }}>
              {search ? "Aucun utilisateur trouvé" : "Aucun utilisateur"}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", background: "var(--bg-off)" }}>
                  {["#", "Utilisateur", "Email", "Téléphone", "Rôle", "Inscrit le", ""].map(h => (
                    <th key={h} style={{ padding: "13px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--bg-off)", transition: "background 0.1s" }}
                    onMouseOver={e => e.currentTarget.style.background = "var(--bg-off)"}
                    onMouseOut={e => e.currentTarget.style.background = ""}>
                    <td style={{ padding: "14px 16px", color: "var(--text-faint)", fontSize: 12, fontFamily: "monospace" }}>{u.id}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <InitialAvatar name={u.name} />
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</span>
                          {u.google_id && (
                            <svg width="14" height="14" viewBox="0 0 48 48" title="Connecté via Google">
                              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--text-secondary)" }}>{u.email}</td>
                    <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--text-secondary)" }}>{u.phone ?? <span style={{ color: "var(--text-faint)" }}>—</span>}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span className={u.role === "admin" ? "badge-primary" : "badge-dark"} style={{ fontSize: 11 }}>
                        {u.role ?? "user"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--text-faint)", whiteSpace: "nowrap" }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString("fr-MA", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <button
                        onClick={() => openConfirm(u)}
                        style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "1px solid #f5c6cb", color: "var(--error)", padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Manrope, sans-serif", textTransform: "uppercase", letterSpacing: "0.03em", transition: "all 0.15s" }}
                        onMouseOver={e => { e.currentTarget.style.background = "var(--error)"; e.currentTarget.style.color = "#fff"; }}
                        onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--error)"; }}
                      >
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {lastPage > 1 && (
          <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="btn-secondary" style={{ height: 36, lineHeight: "36px", padding: "0 16px", fontSize: 13, opacity: page === 1 ? 0.4 : 1 }}>
              ← Préc.
            </button>
            <span style={{ fontSize: 13, color: "var(--text-muted)", padding: "0 8px" }}>
              Page {page} / {lastPage}
            </span>
            <button disabled={page === lastPage} onClick={() => setPage(p => p + 1)}
              className="btn-secondary" style={{ height: 36, lineHeight: "36px", padding: "0 16px", fontSize: 13, opacity: page === lastPage ? 0.4 : 1 }}>
              Suiv. →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
