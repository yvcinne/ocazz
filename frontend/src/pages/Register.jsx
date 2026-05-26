import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { axiosClient } from "../api/axios";

const Field = ({ label, type = "text", placeholder, optional, value, onChange, error }) => (
  <div>
    <label className="form-label">
      {label}
      {optional && <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: 6, color: "var(--text-faint)", fontSize: 11 }}>(optionnel)</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={!optional}
      className="input-field"
      style={{ fontSize: 15, borderColor: error ? "var(--error)" : undefined }}
    />
    {error && (
      <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--error)" }}>{error}</p>
    )}
  </div>
);

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ name: "", last_name: "", email: "", phone: "", password: "", password_confirmation: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Le prénom est requis.";
    if (!form.email.trim()) e.email = "L'email est requis.";
    if (form.password.length < 8) e.password = "Minimum 8 caractères.";
    if (!/[A-Z]/.test(form.password)) e.password = "Au moins une majuscule requise.";
    if (!/[0-9]/.test(form.password)) e.password = "Au moins un chiffre requis.";
    if (form.password !== form.password_confirmation) e.password_confirmation = "Les mots de passe ne correspondent pas.";
    return e;
  };

  const onSubmit = async e => {
    e.preventDefault();
    const clientErrors = validate();
    if (Object.keys(clientErrors).length) { setErrors(clientErrors); return; }
    setLoading(true);
    setErrors({});
    try {
      const res = await axiosClient.post("/register", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      const isAdmin = res.data.user?.role === "admin";
      navigate(isAdmin ? "/admin" : "/", { replace: true });
    } catch (err) {
      if (!err.response) {
        setErrors({
          general: `Impossible de joindre le serveur (${import.meta.env.VITE_BACKEND_URL || "API"}). Vérifiez que le backend Laravel tourne, et ouvrez le site via http://localhost:3000 (pas 127.0.0.1).`,
        });
        return;
      }
      const data = err.response.data;
      if (data?.errors) {
        const mapped = {};
        Object.entries(data.errors).forEach(([k, msgs]) => { mapped[k] = msgs[0]; });
        setErrors(mapped);
      } else {
        setErrors({ general: data?.message || "Inscription échouée. Réessayez." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-off)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <div style={{ width: "100%", maxWidth: 520 }} className="anim-up">

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: "none", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{ width: 52, height: 52, background: "var(--accent-blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>
                <circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/>
              </svg>
            </div>
            <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
              ocazz<span style={{ color: "var(--accent-blue)" }}>.ma</span>
            </span>
          </Link>
          <p style={{ color: "var(--text-muted)", fontSize: 15, marginTop: 8, marginBottom: 0 }}>
            Créez votre compte gratuitement
          </p>
        </div>

        {/* Card */}
        <div style={{ background: "var(--bg-white)", border: "1px solid var(--border)", padding: "40px 36px" }}>
          {searchParams.get("error") === "account_exists" && (
            <div style={{ background: "#FFF5F5", border: "1px solid var(--error)", borderLeft: "4px solid var(--error)", padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <svg width="16" height="16" fill="none" stroke="var(--error)" viewBox="0 0 24 24" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span style={{ color: "var(--error)", fontSize: 14 }}>
                Un compte existe déjà avec cette adresse Gmail.{" "}
                <Link to="/Login" style={{ color: "var(--error)", fontWeight: 700, textDecoration: "underline" }}>Se connecter</Link>
              </span>
            </div>
          )}
          {errors.general && (
            <div style={{ background: "#FFF5F5", border: "1px solid var(--error)", borderLeft: "4px solid var(--error)", padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
              <svg width="16" height="16" fill="none" stroke="var(--error)" viewBox="0 0 24 24" strokeWidth={2} style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span style={{ color: "var(--error)", fontSize: 14 }}>{errors.general}</span>
            </div>
          )}

          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Prénom" value={form.name} onChange={set("name")} error={errors.name} placeholder="Mohamed" />
              <Field label="Nom" value={form.last_name} onChange={set("last_name")} error={errors.last_name} placeholder="Alami" />
            </div>
            <div>
              <label className="form-label">Adresse email</label>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="votre@email.ma"
                required
                className="input-field"
                style={{ fontSize: 15, borderColor: errors.email ? "var(--error)" : undefined }}
              />
              {errors.email && (
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--error)" }}>
                  {errors.email}
                  {errors.email.includes("déjà associée") && (
                    <> — <Link to="/Login" style={{ color: "var(--error)", fontWeight: 700, textDecoration: "underline" }}>Se connecter</Link></>
                  )}
                </p>
              )}
            </div>
            <Field label="Téléphone" type="tel" value={form.phone} onChange={set("phone")} placeholder="+212 6XX XXX XXX" optional />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="form-label">Mot de passe</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={set("password")}
                    placeholder="Minimum 8 caractères"
                    required
                    className="input-field"
                    style={{ fontSize: 15, paddingRight: 40, borderColor: errors.password ? "var(--error)" : undefined }}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, color: "#999", display: "flex", alignItems: "center" }}
                    aria-label={showPassword ? "Masquer" : "Afficher"}>
                    {showPassword
                      ? <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                      : <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    }
                  </button>
                </div>
                {errors.password && <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--error)" }}>{errors.password}</p>}
              </div>
              <div>
                <label className="form-label">Confirmer</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password_confirmation}
                    onChange={set("password_confirmation")}
                    placeholder="Répéter"
                    required
                    className="input-field"
                    style={{ fontSize: 15, paddingRight: 40, borderColor: errors.password_confirmation ? "var(--error)" : undefined }}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, color: "#999", display: "flex", alignItems: "center" }}
                    aria-label={showPassword ? "Masquer" : "Afficher"}>
                    {showPassword
                      ? <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                      : <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    }
                  </button>
                </div>
                {errors.password_confirmation && <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--error)" }}>{errors.password_confirmation}</p>}
              </div>
            </div>

            <p style={{ color: "var(--text-faint)", fontSize: 12, margin: 0, background: "var(--bg-off)", padding: "10px 14px" }}>
              Minimum 8 caractères, une majuscule et un chiffre.
            </p>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", marginTop: 4 }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="anim-spin">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Création…
                </span>
              ) : "Créer mon compte"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0 4px" }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ color: "var(--text-faint)", fontSize: 12, fontFamily: "Manrope,sans-serif", whiteSpace: "nowrap" }}>ou</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <a
            href={`${import.meta.env.VITE_BACKEND_URL}/api/auth/google?intent=register`}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              width: "100%", padding: "10px 16px", border: "1px solid var(--border)",
              background: "#fff", color: "#3c4043", fontFamily: "Manrope,sans-serif",
              fontWeight: 600, fontSize: 14, textDecoration: "none", cursor: "pointer",
              transition: "box-shadow .15s",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.15)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            S'inscrire avec Google
          </a>

          <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--bg-off)", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
              Déjà inscrit ?{" "}
              <Link to="/Login" style={{ color: "var(--accent-blue)", fontWeight: 600, textDecoration: "none" }}>Se connecter</Link>
            </p>
          </div>
        </div>

        <p style={{ textAlign: "center", color: "var(--text-faint)", fontSize: 12, marginTop: 20 }}>
          En vous inscrivant, vous acceptez nos{" "}
          <a href="#" style={{ color: "inherit" }}>Conditions d'utilisation</a> et notre{" "}
          <a href="#" style={{ color: "inherit" }}>Politique de confidentialité</a>.
        </p>
      </div>
    </div>
  );
}
