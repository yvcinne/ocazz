import { Outlet, Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { axiosClient } from "../api/axios";

const NAV = [
  {
    label: "Tableau de bord",
    path: "/admin",
    exact: true,
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    label: "Annonces",
    path: "/admin/annonces",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
  {
    label: "Utilisateurs",
    path: "/admin/users",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  },
];

function NavIcon({ d }) {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

function getUser() {
  try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user  = getUser();

  // Not logged in → redirect to login, then come back
  if (!token || !user) {
    return <Navigate to={`/Login?redirect=${location.pathname}`} replace />;
  }

  // Logged in but not admin → show 403 screen
  if (user.role !== "admin") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-off)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }} className="anim-up">
          <div style={{ width: 64, height: 64, background: "#FFF5F5", border: "1px solid #f5c6cb", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <svg width="32" height="32" fill="none" stroke="var(--error)" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h3 style={{ margin: "0 0 10px", fontFamily: "Manrope, sans-serif" }}>Accès refusé</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "0 0 28px", lineHeight: "22px" }}>
            Vous n'avez pas les droits nécessaires pour accéder à cette section.
          </p>
          <Link to="/" className="btn-primary" style={{ height: 46, lineHeight: "46px", padding: "0 32px", fontSize: 14 }}>
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try { await axiosClient.post("/logout"); } catch { /* ignore */ }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/Login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 248, flexShrink: 0, position: "fixed", top: 0, left: 0, bottom: 0,
        background: "var(--bg-dark)", display: "flex", flexDirection: "column", zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ padding: "26px 24px 22px", borderBottom: "1px solid #2a2a2a" }}>
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: "var(--accent-blue)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>
                <circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 17, color: "#fff", lineHeight: 1.2 }}>
                ocazz<span style={{ color: "var(--accent-blue)" }}>.ma</span>
              </div>
              <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.7px", fontWeight: 600, marginTop: 2 }}>
                Administration
              </div>
            </div>
          </Link>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
          {NAV.map(({ label, path, icon, exact }) => {
            const active = exact ? location.pathname === path : location.pathname.startsWith(path);
            return (
              <Link key={path} to={path} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "11px 24px",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                color: active ? "#fff" : "#888",
                background: active ? "rgba(0,123,255,0.12)" : "transparent",
                borderLeft: `3px solid ${active ? "var(--accent-blue)" : "transparent"}`,
                transition: "all 0.15s",
              }}
                onMouseOver={e => { if (!active) { e.currentTarget.style.color = "#ccc"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}}
                onMouseOut={e => { if (!active) { e.currentTarget.style.color = "#888"; e.currentTarget.style.background = "transparent"; }}}
              >
                <NavIcon d={icon} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Back to site + Logout */}
        <div style={{ padding: "16px 0", borderTop: "1px solid #2a2a2a" }}>
          <Link to="/" style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 24px",
            textDecoration: "none", fontSize: 14, color: "#666",
            transition: "color 0.15s",
          }}
            onMouseOver={e => e.currentTarget.style.color = "#ccc"}
            onMouseOut={e => e.currentTarget.style.color = "#666"}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Retour au site
          </Link>
          <button onClick={handleLogout} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 24px",
            background: "none", border: "none", color: "#666", fontSize: 14,
            cursor: "pointer", width: "100%", fontFamily: "Inter, sans-serif",
            transition: "color 0.15s",
          }}
            onMouseOver={e => e.currentTarget.style.color = "#ccc"}
            onMouseOut={e => e.currentTarget.style.color = "#666"}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, marginLeft: 248, background: "var(--bg-off)", minHeight: "100vh" }}>
        <Outlet />
      </main>
    </div>
  );
}
