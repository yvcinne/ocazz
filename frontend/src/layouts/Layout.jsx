import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [pathname]);
  return null;
}
import { axiosClient } from "../api/axios";
import ChatWidget from "../components/ChatWidget";

const FOOTER_PATHS = {
  "À propos":                    "/about",
  "Comment ça marche":           "/how-it-works",
  "Espace revendeur":            "/espace-revendeur",
  "Blog":                        "/blog",
  "Conditions d'utilisation":    "/conditions",
  "Politique de confidentialité": "/confidentialite",
  "Centre d'aide":               "/aide",
  "Contact":                     "/contact",
  "FAQ":                         "/faq",
};

const NAV = [
  { label: "Accueil",              path: "/" },
  { label: "Acheter une voiture",  path: "/Marketplace" },
  { label: "Vendre une voiture",   path: "/sell" },
  { label: "Estimation de prix",   path: "/Predict" },
];

function getUser() {
  try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
}

function Logo() {
  return (
    <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 36, height: 36, background: "var(--accent-blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>
          <circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/>
        </svg>
      </div>
      <span style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 20, color: "#fff", letterSpacing: "-0.3px" }}>
        ocazz<span style={{ color: "var(--accent-blue)" }}>.ma</span>
      </span>
    </Link>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(getUser);
  const [unread, setUnread] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  useEffect(() => { setUser(getUser()); }, [location.pathname]);

  useEffect(() => {
    if (!user) return;
    axiosClient.get("/unread-count")
      .then(r => setUnread(r.data.unread_count ?? 0))
      .catch(() => {});
  }, [user, location.pathname]);

  const handleLogout = async () => {
    try { await axiosClient.post("/logout"); } catch { /* ignore */ }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setUnread(0);
    navigate("/Login");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-white)" }}>
      {/* ── Header ── */}
      <header style={{ 
        position: "sticky", 
        top: 0, 
        zIndex: 100, 
        background: isScrolled || !isHome ? "rgba(0, 0, 0, 0.9)" : "transparent",
        backdropFilter: isScrolled || !isHome ? "blur(10px)" : "none",
        transition: "background 0.3s ease, backdrop-filter 0.3s ease",
        borderBottom: "none", 
        height: 80 
      }}>
        <div className="container" style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo />

          {/* Desktop Nav */}
          <nav style={{ display: "flex", alignItems: "center" }} className="hide-mobile">
            {NAV.filter(({ auth }) => !auth || user).map(({ label, path }) => (
              <Link key={label} to={path} className={`nav-link ${location.pathname === path ? "active" : ""}`} style={{ color: location.pathname === path ? "var(--brand-blue)" : "#fff" }}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Auth / user actions */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }} className="hide-mobile">
            {user ? (
              <>
                {/* Messages icon with badge */}
                <Link to="/messages" style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, color: location.pathname === "/messages" ? "var(--accent-blue)" : "#fff", textDecoration: "none", transition: "color 0.15s" }}
                  title="Messages">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  {unread > 0 && (
                    <span style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, background: "var(--error)", borderRadius: "50%", border: "2px solid transparent" }} />
                  )}
                </Link>

                {/* Admin link (admin only) */}
                {user.role === "admin" && (
                  <Link to="/admin" style={{ display: "flex", alignItems: "center", gap: 5, color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 500, opacity: 0.85, transition: "opacity 0.15s", padding: "0 8px", height: 40 }}
                    title="Administration"
                    onMouseOver={e => e.currentTarget.style.opacity = "1"}
                    onMouseOut={e => e.currentTarget.style.opacity = "0.85"}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    Admin
                  </Link>
                )}

                {/* User name + logout */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 4px" }}>
                  <div style={{ width: 32, height: 32, background: "var(--accent-blue)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 13 }}>
                    {user.name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 500, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</span>
                </div>
                <button onClick={handleLogout} className="btn-ghost" style={{ height: 40, lineHeight: "40px", padding: "0 12px", fontSize: 13, color: "#aaa" }}>
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/Login" className="btn-ghost" style={{ height: 44, lineHeight: "44px", padding: "0 16px", fontSize: 15, color: "#fff" }}>
                  Connexion
                </Link>
                <Link to="/Register" className="btn-primary" style={{ height: 44, lineHeight: "44px", padding: "0 24px", fontSize: 15 }}>
                  Créer un compte
                </Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button onClick={() => setOpen(!open)} style={{ display: "none", width: 44, height: 44, background: "none", border: "none", cursor: "pointer", alignItems: "center", justifyContent: "center", color: "#fff" }} className="show-mobile-flex">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div style={{ background: "#000", borderTop: "1px solid #333", padding: "16px 16px 24px" }} className="anim-fade">
            {NAV.filter(({ auth }) => !auth || user).map(({ label, path }) => (
              <Link key={label} to={path} onClick={() => setOpen(false)}
                style={{ display: "block", padding: "14px 0", color: location.pathname === path ? "var(--brand-blue)" : "#fff", fontWeight: location.pathname === path ? 600 : 400, fontSize: 17, textDecoration: "none", borderBottom: "1px solid #333" }}>
                {label}
              </Link>
            ))}
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              {user ? (
                <>
                  <Link to="/messages" onClick={() => setOpen(false)} className="btn-secondary" style={{ flex: 1, height: 48, lineHeight: "48px", fontSize: 14, textAlign: "center", position: "relative" }}>
                    Messages {unread > 0 && `(${unread})`}
                  </Link>
                  <button onClick={() => { setOpen(false); handleLogout(); }} className="btn-primary" style={{ flex: 1, height: 48, lineHeight: "48px", fontSize: 14, textAlign: "center", background: "var(--secondary)" }}>
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link to="/Login" onClick={() => setOpen(false)} className="btn-secondary" style={{ flex: 1, height: 48, lineHeight: "48px", fontSize: 14, textAlign: "center" }}>Connexion</Link>
                  <Link to="/Register" onClick={() => setOpen(false)} className="btn-primary" style={{ flex: 1, height: 48, lineHeight: "48px", fontSize: 14, textAlign: "center" }}>Inscription</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <ScrollToTop />
      {/* ── Page Content ── */}
      <main style={{ flex: 1 }}><Outlet /></main>

      <ChatWidget />

      {/* ── Footer ── */}
      <footer style={{ background: "var(--bg-dark)", color: "#fff", paddingTop: 60, paddingBottom: 40 }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, background: "var(--accent-blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/><circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/></svg>
                </div>
                <span style={{ fontWeight: 800, fontSize: 18 }}>ocazz<span style={{ color: "var(--accent-blue)" }}>.ma</span></span>
              </div>
              <p style={{ color: "#888", fontSize: 14, lineHeight: "21px", maxWidth: 260 }}>La plateforme marocaine de référence pour l'achat et la vente de véhicules d'occasion.</p>
            </div>
            {[
              { title: "Plateforme", links: ["À propos", "Comment ça marche", "Espace revendeur", "Blog"] },
              { title: "Légal", links: ["Conditions d'utilisation", "Politique de confidentialité"] },
              { title: "Support", links: ["Centre d'aide", "Contact", "FAQ"] },
          ].map(({ title, links }) => (
              <div key={title}>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {links.map(l => <li key={l} style={{ marginBottom: 10 }}><Link to={FOOTER_PATHS[l] ?? "/"} style={{ color: "#888", fontSize: 14, textDecoration: "none", transition: "color 0.15s" }} onMouseOver={e => e.currentTarget.style.color="#fff"} onMouseOut={e => e.currentTarget.style.color="#888"}>{l}</Link></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #333", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ color: "#555", fontSize: 13 }}>© {new Date().getFullYear()} ocazz.ma — Tous droits réservés.</p>
            <div style={{ display: "flex", gap: 20 }}>
              {["Facebook", "Instagram", "Twitter"].map(s => <a key={s} href="#" style={{ color: "#555", fontSize: 13, textDecoration: "none" }}>{s}</a>)}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .hide-mobile { display: flex !important; }
        .show-mobile-flex { display: none !important; }
        @media (max-width: 767px) {
          .hide-mobile { display: none !important; }
          .show-mobile-flex { display: flex !important; }
        }
      `}</style>
    </div>
  );
}