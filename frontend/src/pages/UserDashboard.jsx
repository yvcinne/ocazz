import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { axiosClient } from "../api/axios";

// ── helpers ───────────────────────────────────────────────────────────────────

function fmt(n) { return Number(n).toLocaleString("fr-MA"); }

function getUser() {
  try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
}

// ── sub-components ────────────────────────────────────────────────────────────

function EmptyState({ icon, text, action }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--text-faint)" }}>
      <div style={{ width: 64, height: 64, background: "var(--bg-off)", border: "1px solid var(--border)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        {icon}
      </div>
      <p style={{ margin: "0 0 20px", fontSize: 15 }}>{text}</p>
      {action}
    </div>
  );
}

function FavCard({ fav, onRemove }) {
  const car = fav.annonce;
  if (!car) return null;
  const img = car.images?.[0]?.url;
  return (
    <div style={{ border: "1px solid var(--border)", background: "var(--bg-white)", display: "flex", gap: 0, overflow: "hidden" }}>
      <Link to={`/cars/${car.id}`} style={{ display: "block", width: 130, flexShrink: 0, background: "var(--bg-off)", textDecoration: "none" }}>
        {img
          ? <img src={img} alt={car.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", minHeight: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth={1.5}>
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>
                <circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/>
              </svg>
            </div>
        }
      </Link>
      <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <p style={{ color: "var(--text-faint)", fontSize: 11, fontWeight: 600, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
            {car.model_year} · {car.fuel_type} · {fmt(car.mileage)} km
          </p>
          <Link to={`/cars/${car.id}`} style={{ textDecoration: "none" }}>
            <p style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 15, margin: "0 0 6px", color: "var(--text-primary)" }}>
              {car.brand} {car.model}
            </p>
          </Link>
          <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 18, color: "var(--accent-blue)" }}>
            {fmt(car.price)} <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-faint)" }}>MAD</span>
          </span>
        </div>
        <button
          onClick={() => onRemove(fav.annonce_id)}
          style={{ alignSelf: "flex-start", marginTop: 10, background: "none", border: "none", cursor: "pointer", color: "var(--error)", fontSize: 12, fontWeight: 600, padding: 0, display: "flex", alignItems: "center", gap: 4 }}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          Retirer
        </button>
      </div>
    </div>
  );
}

function AnnonceCard({ car, onMarkSold }) {
  const img = car.images?.[0]?.url;
  const statusLabel = { active: "Active", sold: "Vendue", pending: "En attente", rejected: "Rejetée" };
  const statusColor = { active: "var(--success)", sold: "var(--text-faint)", pending: "#f59e0b", rejected: "var(--error)" };
  return (
    <div style={{ border: "1px solid var(--border)", background: "var(--bg-white)", display: "flex", gap: 0, overflow: "hidden" }}>
      <Link to={`/cars/${car.id}`} style={{ display: "block", width: 130, flexShrink: 0, background: "var(--bg-off)", textDecoration: "none" }}>
        {img
          ? <img src={img} alt={car.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", minHeight: 100, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth={1.5}>
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>
                <circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/>
              </svg>
            </div>
        }
      </Link>
      <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: statusColor[car.status] ?? "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.4px" }}>
              ● {statusLabel[car.status] ?? car.status}
            </span>
          </div>
          <Link to={`/cars/${car.id}`} style={{ textDecoration: "none" }}>
            <p style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 15, margin: "0 0 6px", color: "var(--text-primary)" }}>
              {car.brand} {car.model} — {car.model_year}
            </p>
          </Link>
          <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 18, color: "var(--accent-blue)" }}>
            {fmt(car.price)} <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-faint)" }}>MAD</span>
          </span>
        </div>
        {car.status === "active" && (
          <button
            onClick={() => onMarkSold(car.id)}
            style={{ alignSelf: "flex-start", marginTop: 10, background: "none", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text-muted)", fontSize: 12, fontWeight: 600, padding: "4px 10px", display: "flex", alignItems: "center", gap: 4 }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            Marquer vendu
          </button>
        )}
      </div>
    </div>
  );
}

// ── tabs ──────────────────────────────────────────────────────────────────────

function FavorisTab() {
  const [favs, setFavs]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient.get("/favorites")
      .then(r => setFavs(r.data))
      .finally(() => setLoading(false));
  }, []);

  const onRemove = async (annonceId) => {
    await axiosClient.delete(`/favorites/${annonceId}`);
    setFavs(f => f.filter(x => x.annonce_id !== annonceId));
  };

  if (loading) return <div style={{ padding: 32 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 110, marginBottom: 12 }} />)}</div>;
  if (!favs.length) return <EmptyState
    icon={<svg width="28" height="28" fill="none" stroke="var(--text-faint)" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>}
    text="Vous n'avez pas encore de favoris."
    action={<Link to="/Marketplace" className="btn-primary" style={{ display: "inline-flex", padding: "10px 24px", textDecoration: "none" }}>Parcourir les annonces</Link>}
  />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {favs.map(f => <FavCard key={f.id} fav={f} onRemove={onRemove} />)}
    </div>
  );
}

function MesAnnoncesTab() {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    axiosClient.get("/my-annonces")
      .then(r => setAnnonces(r.data.data ?? r.data))
      .finally(() => setLoading(false));
  }, []);

  const onMarkSold = async (id) => {
    await axiosClient.post(`/annonces/${id}/mark-sold`);
    setAnnonces(a => a.map(x => x.id === id ? { ...x, status: "sold" } : x));
  };

  if (loading) return <div style={{ padding: 32 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 110, marginBottom: 12 }} />)}</div>;
  if (!annonces.length) return <EmptyState
    icon={<svg width="28" height="28" fill="none" stroke="var(--text-faint)" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>}
    text="Vous n'avez pas encore publié d'annonce."
    action={<Link to="/sell" className="btn-primary" style={{ display: "inline-flex", padding: "10px 24px", textDecoration: "none" }}>Publier une annonce</Link>}
  />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {annonces.map(car => <AnnonceCard key={car.id} car={car} onMarkSold={onMarkSold} />)}
    </div>
  );
}

function ProfilTab({ user, onUserUpdate }) {
  const hasPassword = !user?.google_id;

  const [form, setForm]         = useState({ name: user?.name ?? "", last_name: user?.last_name ?? "", phone: user?.phone ?? "" });
  const [pwForm, setPwForm]     = useState({ current_password: "", password: "", password_confirmation: "" });
  const [saving, setSaving]     = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [success, setSuccess]   = useState("");
  const [error, setError]       = useState("");
  const [pwError, setPwError]   = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set    = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setPw  = k => e => setPwForm(f => ({ ...f, [k]: e.target.value }));

  const saveProfile = async e => {
    e.preventDefault();
    setSaving(true); setSuccess(""); setError("");
    try {
      const res = await axiosClient.put("/user", form);
      const updated = res.data.data ?? res.data;
      localStorage.setItem("user", JSON.stringify(updated));
      onUserUpdate(updated);
      setSuccess("Profil mis à jour.");
    } catch (err) {
      setError(err.response?.data?.message ?? "Erreur lors de la mise à jour.");
    } finally { setSaving(false); }
  };

  const savePassword = async e => {
    e.preventDefault();
    if (pwForm.password !== pwForm.password_confirmation) { setPwError("Les mots de passe ne correspondent pas."); return; }
    setSavingPw(true); setPwError(""); setPwSuccess("");
    try {
      await axiosClient.put("/user", pwForm);
      setPwForm({ current_password: "", password: "", password_confirmation: "" });
      setPwSuccess("Mot de passe modifié.");
    } catch (err) {
      setPwError(err.response?.data?.message ?? "Mot de passe actuel incorrect.");
    } finally { setSavingPw(false); }
  };

  const inputStyle = { fontSize: 15, width: "100%", boxSizing: "border-box" };

  const EyeBtn = ({ show, onToggle }) => (
    <button type="button" onClick={onToggle}
      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, color: "#999", display: "flex", alignItems: "center" }}
      aria-label={show ? "Masquer" : "Afficher"}>
      {show ? (
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
        </svg>
      ) : (
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        </svg>
      )}
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Profile info */}
      <div style={{ border: "1px solid var(--border)", background: "var(--bg-white)", padding: "28px 28px" }}>
        <h3 style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 16, margin: "0 0 20px", color: "var(--text-primary)" }}>Informations personnelles</h3>

        {success && <div style={{ background: "#E8F5E9", border: "1px solid var(--success)", borderLeft: "4px solid var(--success)", padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#1B5E20" }}>{success}</div>}
        {error   && <div style={{ background: "#FFF5F5", border: "1px solid var(--error)", borderLeft: "4px solid var(--error)", padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "var(--error)" }}>{error}</div>}

        <form onSubmit={saveProfile} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="form-label">Prénom</label>
              <input type="text" value={form.name} onChange={set("name")} required className="input-field" style={inputStyle} />
            </div>
            <div>
              <label className="form-label">Nom</label>
              <input type="text" value={form.last_name} onChange={set("last_name")} className="input-field" style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="form-label">
              Téléphone
              <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: 6, color: "var(--text-faint)", fontSize: 11 }}>(optionnel)</span>
            </label>
            <input type="tel" value={form.phone} onChange={set("phone")} placeholder="+212 6XX XXX XXX" className="input-field" style={inputStyle} />
          </div>
          <div>
            <label className="form-label">Adresse email</label>
            <input type="email" value={user?.email ?? ""} disabled className="input-field" style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary" style={{ alignSelf: "flex-start", padding: "10px 28px" }}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </form>
      </div>

      {/* Password change — hidden for Google-only accounts */}
      {hasPassword && (
        <div style={{ border: "1px solid var(--border)", background: "var(--bg-white)", padding: "28px 28px" }}>
          <h3 style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 16, margin: "0 0 20px", color: "var(--text-primary)" }}>Changer de mot de passe</h3>

          {pwSuccess && <div style={{ background: "#E8F5E9", border: "1px solid var(--success)", borderLeft: "4px solid var(--success)", padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#1B5E20" }}>{pwSuccess}</div>}
          {pwError   && <div style={{ background: "#FFF5F5", border: "1px solid var(--error)", borderLeft: "4px solid var(--error)", padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "var(--error)" }}>{pwError}</div>}

          <form onSubmit={savePassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="form-label">Mot de passe actuel</label>
              <div style={{ position: "relative" }}>
                <input type={showCurrent ? "text" : "password"} value={pwForm.current_password} onChange={setPw("current_password")} required className="input-field" style={{ ...inputStyle, paddingRight: 44 }} />
                <EyeBtn show={showCurrent} onToggle={() => setShowCurrent(v => !v)} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="form-label">Nouveau mot de passe</label>
                <div style={{ position: "relative" }}>
                  <input type={showNew ? "text" : "password"} value={pwForm.password} onChange={setPw("password")} required className="input-field" style={{ ...inputStyle, paddingRight: 44 }} />
                  <EyeBtn show={showNew} onToggle={() => setShowNew(v => !v)} />
                </div>
              </div>
              <div>
                <label className="form-label">Confirmer</label>
                <div style={{ position: "relative" }}>
                  <input type={showConfirm ? "text" : "password"} value={pwForm.password_confirmation} onChange={setPw("password_confirmation")} required className="input-field" style={{ ...inputStyle, paddingRight: 44 }} />
                  <EyeBtn show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
                </div>
              </div>
            </div>
            <button type="submit" disabled={savingPw} className="btn-primary" style={{ alignSelf: "flex-start", padding: "10px 28px" }}>
              {savingPw ? "Enregistrement…" : "Changer le mot de passe"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

const TABS = [
  {
    id: "favoris", label: "Favoris",
    icon: <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>,
  },
  {
    id: "annonces", label: "Mes annonces",
    icon: <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
  },
  {
    id: "profil", label: "Mon profil",
    icon: <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>,
  },
];

export default function UserDashboard() {
  const navigate        = useNavigate();
  const [tab, setTab]   = useState("favoris");
  const [user, setUser] = useState(getUser);

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/Login?redirect=/User/Dashboard", { replace: true }); return; }
    axiosClient.get("/user")
      .then(r => { localStorage.setItem("user", JSON.stringify(r.data)); setUser(r.data); })
      .catch(() => { navigate("/Login", { replace: true }); });
  }, []);

  const initials = [user?.name, user?.last_name].filter(Boolean).map(s => s.charAt(0).toUpperCase()).join("") || "?";

  return (
    <div style={{ background: "var(--bg-off)", minHeight: "100vh", paddingBottom: 60 }}>

      {/* Header bar */}
      <div style={{ background: "var(--bg-white)", borderBottom: "1px solid var(--border)", padding: "20px 0" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 52, height: 52, background: "var(--accent-blue)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <p style={{ margin: 0, fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>
              {user?.name} {user?.last_name}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32 }}>
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 28, alignItems: "start" }} className="dashboard-grid">

          {/* Sidebar */}
          <div style={{ border: "1px solid var(--border)", background: "var(--bg-white)", overflow: "hidden" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%",
                  padding: "14px 18px", background: tab === t.id ? "var(--bg-off)" : "transparent",
                  border: "none", borderLeft: tab === t.id ? "3px solid var(--accent-blue)" : "3px solid transparent",
                  cursor: "pointer", fontFamily: "Manrope,sans-serif", fontWeight: tab === t.id ? 700 : 500,
                  fontSize: 14, color: tab === t.id ? "var(--accent-blue)" : "var(--text-primary)",
                  textAlign: "left", transition: "background 0.15s",
                }}>
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div>
            <h2 style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 20, color: "var(--text-primary)", margin: "0 0 20px" }}>
              {TABS.find(t => t.id === tab)?.label}
            </h2>
            {tab === "favoris"   && <FavorisTab />}
            {tab === "annonces"  && <MesAnnoncesTab />}
            {tab === "profil"    && <ProfilTab user={user} onUserUpdate={u => { setUser(u); localStorage.setItem("user", JSON.stringify(u)); }} />}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
