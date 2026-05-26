import { useState, useEffect, useCallback } from "react";
import { axiosClient } from "../../api/axios";

const STATUS = {
  pending:  { cls: "badge-warning", label: "En attente" },
  approved: { cls: "badge-success", label: "Approuvée" },
  rejected: { cls: "badge-danger",  label: "Rejetée" },
  sold:     { cls: "badge-info",    label: "Vendue" },
};

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="anim-spin">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: 8, fontSize: 14, padding: "6px 0", borderBottom: "1px solid var(--bg-off)" }}>
      <span style={{ color: "var(--text-faint)", minWidth: 140, flexShrink: 0 }}>{label}</span>
      <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function DetailModal({ id, onClose, onApprove, onReject, onDelete }) {
  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx]   = useState(0);
  const [busy, setBusy]       = useState(null);

  useEffect(() => {
    axiosClient.get(`/admin/annonces/${id}`)
      .then(r => setAnnonce(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const act = async (action) => {
    setBusy(action);
    try {
      if (action === "delete") {
        await axiosClient.delete(`/admin/annonces/${id}`);
        onDelete(id);
      } else if (action === "approve") {
        await axiosClient.post(`/admin/annonces/${id}/approve`);
        onApprove(id);
      } else if (action === "reject") {
        await axiosClient.post(`/admin/annonces/${id}/reject`);
        onReject(id);
      }
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(null);
    }
  };

  const imgs = annonce?.images ?? [];
  const s    = annonce ? (STATUS[annonce.status] ?? STATUS.pending) : null;

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
    >
      <div style={{ background: "var(--bg-white)", width: "100%", maxWidth: 820, maxHeight: "90vh", overflowY: "auto", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column" }}>
        {/* Modal header */}
        <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--bg-white)", zIndex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>Détail de l'annonce #{id}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", padding: 4, display: "flex", alignItems: "center" }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "80px 0", textAlign: "center", color: "var(--text-faint)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <Spinner /> Chargement…
          </div>
        ) : !annonce ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--error)" }}>Impossible de charger l'annonce.</div>
        ) : (
          <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Photos */}
            {imgs.length > 0 && (
              <div>
                <div style={{ aspectRatio: "16/9", background: "#000", borderRadius: "var(--radius-md)", overflow: "hidden", position: "relative" }}>
                  <img
                    src={imgs[imgIdx]?.url}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                  {imgs.length > 1 && (
                    <>
                      <button onClick={() => setImgIdx(i => (i - 1 + imgs.length) % imgs.length)}
                        style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                      </button>
                      <button onClick={() => setImgIdx(i => (i + 1) % imgs.length)}
                        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                      </button>
                      <span style={{ position: "absolute", bottom: 10, right: 14, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 12, padding: "3px 10px", borderRadius: "99px" }}>
                        {imgIdx + 1} / {imgs.length}
                      </span>
                    </>
                  )}
                </div>
                {imgs.length > 1 && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    {imgs.map((img, i) => (
                      <div key={i} onClick={() => setImgIdx(i)}
                        style={{ width: 60, height: 60, borderRadius: "var(--radius-sm)", overflow: "hidden", cursor: "pointer", border: i === imgIdx ? "2px solid var(--accent-blue)" : "2px solid transparent", flexShrink: 0 }}>
                        <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
              <div>
                <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-faint)" }}>Véhicule</p>
                <Row label="Titre"        value={annonce.title} />
                <Row label="Marque"       value={annonce.brand} />
                <Row label="Modèle"       value={annonce.model} />
                <Row label="Année"        value={annonce.model_year} />
                <Row label="Kilométrage"  value={annonce.mileage ? `${Number(annonce.mileage).toLocaleString()} km` : null} />
                <Row label="Carburant"    value={annonce.fuel_type} />
                <Row label="Transmission" value={annonce.transmission} />
                <Row label="État"         value={annonce.car_condition} />
                <Row label="Puissance"    value={annonce.fiscal_power} />
              </div>
              <div>
                <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-faint)" }}>Annonce</p>
                <Row label="Prix"      value={annonce.price ? `${Number(annonce.price).toLocaleString()} MAD` : null} />
                <Row label="Vendeur"   value={annonce.user?.name} />
                <Row label="Email"     value={annonce.user?.email} />
                <Row label="Statut"    value={s?.label} />
                <Row label="Soumis le" value={annonce.created_at ? new Date(annonce.created_at).toLocaleDateString("fr-MA", { day: "2-digit", month: "long", year: "numeric" }) : null} />
              </div>
            </div>

            {annonce.description && (
              <div>
                <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-faint)" }}>Description</p>
                <p style={{ margin: 0, fontSize: 14, lineHeight: "22px", color: "var(--text-secondary)", background: "var(--bg-off)", padding: "14px 16px", borderRadius: "var(--radius-sm)" }}>
                  {annonce.description}
                </p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, paddingTop: 8, borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>
              {annonce.status === "pending" && (
                <>
                  <button disabled={!!busy} onClick={() => act("approve")}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--success)", color: "#fff", border: "none", padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1, fontFamily: "Manrope,sans-serif", borderRadius: "var(--radius-sm)" }}>
                    {busy === "approve" ? <Spinner /> : <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                    Approuver
                  </button>
                  <button disabled={!!busy} onClick={() => act("reject")}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", color: "var(--error)", border: "1px solid var(--error)", padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1, fontFamily: "Manrope,sans-serif", borderRadius: "var(--radius-sm)" }}>
                    {busy === "reject" ? <Spinner /> : <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>}
                    Rejeter
                  </button>
                </>
              )}
              {annonce.status === "rejected" && (
                <button disabled={!!busy} onClick={() => act("approve")}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--success)", color: "#fff", border: "none", padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1, fontFamily: "Manrope,sans-serif", borderRadius: "var(--radius-sm)" }}>
                  {busy === "approve" ? <Spinner /> : <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                  Approuver quand même
                </button>
              )}
              {(annonce.status === "approved" || annonce.status === "sold") && (
                <button disabled={!!busy} onClick={() => act("delete")}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--error)", color: "#fff", border: "none", padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1, fontFamily: "Manrope,sans-serif", borderRadius: "var(--radius-sm)" }}>
                  {busy === "delete" ? <Spinner /> : <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>}
                  Supprimer l'annonce
                </button>
              )}
              <button onClick={onClose} className="btn-secondary" style={{ marginLeft: "auto", padding: "9px 18px", fontSize: 13 }}>
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminAnnonces() {
  const [annonces, setAnnonces] = useState([]);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [busy, setBusy]         = useState({});
  const [filter, setFilter]     = useState("all");
  const [error, setError]       = useState(null);
  const [detailId, setDetailId] = useState(null);

  const load = useCallback((p = 1) => {
    setLoading(true);
    setError(null);
    axiosClient.get(`/admin/annonces?page=${p}`)
      .then(r => {
        setAnnonces(r.data.data ?? []);
        setLastPage(r.data.meta?.last_page ?? r.data.last_page ?? 1);
      })
      .catch(e => setError(e.response?.data?.message ?? "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(page); }, [page, load]);

  const doAction = async (id, endpoint) => {
    setBusy(b => ({ ...b, [id]: endpoint }));
    try {
      if (endpoint === "delete") {
        await axiosClient.delete(`/admin/annonces/${id}`);
        setAnnonces(prev => prev.filter(a => a.id !== id));
      } else {
        await axiosClient.post(`/admin/annonces/${id}/${endpoint}`);
        setAnnonces(prev => prev.map(a => a.id === id
          ? { ...a, status: endpoint === "approve" ? "approved" : "rejected" }
          : a
        ));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(b => { const n = { ...b }; delete n[id]; return n; });
    }
  };

  const handleApprove = id => setAnnonces(prev => prev.map(a => a.id === id ? { ...a, status: "approved" } : a));
  const handleReject  = id => setAnnonces(prev => prev.map(a => a.id === id ? { ...a, status: "rejected" } : a));
  const handleDelete  = id => setAnnonces(prev => prev.filter(a => a.id !== id));

  const displayed = filter === "all" ? annonces : annonces.filter(a => a.status === filter);

  return (
    <div style={{ padding: "40px 48px" }}>
      {detailId && (
        <DetailModal
          id={detailId}
          onClose={() => setDetailId(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ margin: "0 0 6px", fontSize: 30 }}>Annonces</h2>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>Modérez les annonces soumises par les vendeurs</p>
        </div>
        <div style={{ display: "flex", gap: 0, border: "1px solid var(--border)", background: "var(--bg-white)" }}>
          {[["all","Toutes"],["pending","En attente"],["approved","Approuvées"],["rejected","Rejetées"]].map(([val,lbl]) => (
            <button key={val} onClick={() => setFilter(val)} style={{
              padding: "8px 18px", background: filter === val ? "var(--accent-blue)" : "transparent",
              color: filter === val ? "#fff" : "var(--text-muted)", border: "none",
              borderRight: val !== "rejected" ? "1px solid var(--border)" : "none",
              fontSize: 13, fontWeight: filter === val ? 600 : 400, cursor: "pointer",
              fontFamily: "Manrope, sans-serif", transition: "all 0.15s",
            }}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ background: "#FFF5F5", border: "1px solid var(--error)", borderLeft: "4px solid var(--error)", padding: "14px 18px", marginBottom: 20, color: "var(--error)", fontSize: 14 }}>
          {error}
        </div>
      )}

      <div style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}>
        {loading ? (
          <div style={{ padding: "80px 0", textAlign: "center", color: "var(--text-faint)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <Spinner /> Chargement…
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ padding: "80px 0", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, background: "var(--bg-off)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="26" height="26" fill="none" stroke="var(--text-faint)" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <p style={{ color: "var(--text-faint)", fontSize: 15, margin: 0 }}>Aucune annonce dans cette catégorie</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", background: "var(--bg-off)" }}>
                  {["ID", "Titre", "Vendeur", "Prix", "Statut", "Date", "Actions"].map(h => (
                    <th key={h} style={{ padding: "13px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map(a => {
                  const s      = STATUS[a.status] ?? STATUS.pending;
                  const isBusy = busy[a.id];
                  return (
                    <tr key={a.id} style={{ borderBottom: "1px solid var(--bg-off)", transition: "background 0.1s" }}
                      onMouseOver={e => e.currentTarget.style.background = "var(--bg-off)"}
                      onMouseOut={e => e.currentTarget.style.background = ""}>
                      <td style={{ padding: "14px 16px", color: "var(--text-faint)", fontSize: 12, fontFamily: "monospace" }}>{a.id}</td>
                      <td style={{ padding: "14px 16px", maxWidth: 220 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</p>
                        {a.city && <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-faint)" }}>{a.city}</p>}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--text-secondary)" }}>{a.user?.name ?? "—"}</td>
                      <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 700, color: "var(--accent-blue)", whiteSpace: "nowrap" }}>
                        {a.price ? `${Number(a.price).toLocaleString()} MAD` : "—"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span className={s.cls}>{s.label}</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--text-faint)", whiteSpace: "nowrap" }}>
                        {a.created_at ? new Date(a.created_at).toLocaleDateString("fr-MA", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          {/* View details */}
                          <button
                            onClick={() => setDetailId(a.id)}
                            title="Voir les détails"
                            style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", color: "var(--accent-blue)", border: "1px solid var(--accent-blue)", padding: "6px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Manrope, sans-serif", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                            Voir
                          </button>

                          {/* Approve (pending/rejected only) */}
                          {a.status !== "approved" && a.status !== "sold" && (
                            <button
                              disabled={!!isBusy}
                              onClick={() => doAction(a.id, "approve")}
                              style={{ display: "flex", alignItems: "center", gap: 5, background: "var(--success)", color: "#fff", border: "none", padding: "6px 10px", fontSize: 12, fontWeight: 700, cursor: isBusy ? "not-allowed" : "pointer", opacity: isBusy ? 0.6 : 1, fontFamily: "Manrope, sans-serif", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                              {isBusy === "approve" ? <Spinner /> : <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                              Approuver
                            </button>
                          )}

                          {/* Reject (pending only) or Delete (approved/sold) */}
                          {a.status === "pending" && (
                            <button
                              disabled={!!isBusy}
                              onClick={() => doAction(a.id, "reject")}
                              style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", color: "var(--error)", border: "1px solid var(--error)", padding: "6px 10px", fontSize: 12, fontWeight: 700, cursor: isBusy ? "not-allowed" : "pointer", opacity: isBusy ? 0.6 : 1, fontFamily: "Manrope, sans-serif", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                              {isBusy === "reject" ? <Spinner /> : <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>}
                              Rejeter
                            </button>
                          )}
                          {(a.status === "approved" || a.status === "sold") && (
                            <button
                              disabled={!!isBusy}
                              onClick={() => doAction(a.id, "delete")}
                              style={{ display: "flex", alignItems: "center", gap: 5, background: "var(--error)", color: "#fff", border: "none", padding: "6px 10px", fontSize: 12, fontWeight: 700, cursor: isBusy ? "not-allowed" : "pointer", opacity: isBusy ? 0.6 : 1, fontFamily: "Manrope, sans-serif", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                              {isBusy === "delete" ? <Spinner /> : <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>}
                              Supprimer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

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
