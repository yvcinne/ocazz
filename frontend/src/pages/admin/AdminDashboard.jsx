import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { axiosClient } from "../../api/axios";

function StatCard({ label, value, sub, color, iconPath }) {
  return (
    <div style={{
      background: "var(--bg-white)", border: "1px solid var(--border)",
      borderTop: `4px solid ${color}`, padding: "28px 24px",
    }} className="anim-up">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--text-muted)" }}>
            {label}
          </p>
          <p style={{ margin: 0, fontFamily: "Manrope, sans-serif", fontSize: 42, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>
            {value ?? <span style={{ opacity: 0.3 }}>—</span>}
          </p>
          {sub && <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--text-faint)" }}>{sub}</p>}
        </div>
        <div style={{ width: 48, height: 48, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="22" height="22" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    axiosClient.get("/admin/dashboard")
      .then(r => setStats(r.data))
      .catch(e => setError(e.response?.data?.message ?? "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "40px 48px", maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 30 }}>Tableau de bord</h2>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>
          Vue d'ensemble de la plateforme ocazz.ma
        </p>
      </div>

      {error && (
        <div style={{ background: "#FFF5F5", border: "1px solid var(--error)", borderLeft: "4px solid var(--error)", padding: "14px 18px", marginBottom: 24, color: "var(--error)", fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Stats grid */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-faint)", fontSize: 14, padding: "40px 0" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="anim-spin">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          Chargement des statistiques…
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 48 }}>
          <StatCard
            label="Utilisateurs"
            value={stats?.users}
            sub="Comptes inscrits"
            color="var(--accent-blue)"
            iconPath="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <StatCard
            label="Annonces totales"
            value={stats?.annonces}
            sub="Toutes annonces"
            color="var(--brand-blue)"
            iconPath="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
          <StatCard
            label="En attente"
            value={stats?.pending_annonces}
            sub="À modérer"
            color="var(--warning)"
            iconPath="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <StatCard
            label="Approuvées"
            value={stats?.approved_annonces}
            sub="Publiées"
            color="var(--success)"
            iconPath="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h4 style={{ margin: "0 0 16px", fontSize: 16 }}>Actions rapides</h4>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link to="/admin/annonces" className="btn-primary" style={{ height: 46, lineHeight: "46px", padding: "0 28px", fontSize: 14 }}>
            Modérer les annonces
            {stats?.pending_annonces > 0 && (
              <span style={{ background: "rgba(255,255,255,0.25)", fontSize: 12, padding: "1px 7px", marginLeft: 8, fontWeight: 700 }}>
                {stats.pending_annonces}
              </span>
            )}
          </Link>
          <Link to="/admin/users" className="btn-secondary" style={{ height: 46, lineHeight: "46px", padding: "0 28px", fontSize: 14 }}>
            Gérer les utilisateurs
          </Link>
        </div>
      </div>

      {/* Pending reminder */}
      {!loading && stats?.pending_annonces > 0 && (
        <div style={{ marginTop: 36, border: "1px solid var(--warning)", borderLeft: "4px solid var(--warning)", padding: "16px 20px", background: "#FFFBF0", display: "flex", gap: 12, alignItems: "center" }} className="anim-up">
          <svg width="22" height="22" fill="none" stroke="var(--warning)" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <div>
            <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14, color: "#856404" }}>
              {stats.pending_annonces} annonce{stats.pending_annonces > 1 ? "s" : ""} en attente de modération
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "#856404" }}>
              <Link to="/admin/annonces" style={{ color: "inherit", fontWeight: 600 }}>Voir les annonces →</Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
