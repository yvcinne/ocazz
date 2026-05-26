import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { axiosClient } from "../api/axios";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const emailFromUrl = params.get("email") || "";

  const [form, setForm] = useState({ password: "", password_confirmation: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (form.password.length < 8) e.password = "Minimum 8 caractères.";
    else if (!/[A-Z]/.test(form.password)) e.password = "Au moins une majuscule requise.";
    else if (!/[0-9]/.test(form.password)) e.password = "Au moins un chiffre requis.";
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
      await axiosClient.post("/reset-password", {
        token,
        email: emailFromUrl,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      navigate("/Login?reset=1", { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const mapped = {};
        Object.entries(data.errors).forEach(([k, msgs]) => { mapped[k] = msgs[0]; });
        setErrors(mapped);
      } else {
        setErrors({ general: data?.message || "Une erreur est survenue. Réessayez." });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-off)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "var(--error)", fontSize: 15, marginBottom: 16 }}>Lien invalide ou expiré.</p>
          <Link to="/forgot-password" className="btn-primary" style={{ display: "inline-block", padding: "0 24px", height: 44, lineHeight: "44px" }}>
            Demander un nouveau lien
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-off)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <div style={{ width: "100%", maxWidth: 460 }} className="anim-up">

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
            Nouveau mot de passe
          </p>
        </div>

        <div style={{ background: "var(--bg-white)", border: "1px solid var(--border)", padding: "40px 36px" }}>
          {errors.general && (
            <div style={{ background: "#FFF5F5", border: "1px solid var(--error)", borderLeft: "4px solid var(--error)", padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
              <svg width="16" height="16" fill="none" stroke="var(--error)" viewBox="0 0 24 24" strokeWidth={2} style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span style={{ color: "var(--error)", fontSize: 14 }}>{errors.general}</span>
            </div>
          )}

          {errors.token && (
            <div style={{ background: "#FFF5F5", border: "1px solid var(--error)", borderLeft: "4px solid var(--error)", padding: "12px 16px", marginBottom: 20 }}>
              <p style={{ color: "var(--error)", fontSize: 14, margin: "0 0 8px" }}>{errors.token}</p>
              <Link to="/forgot-password" style={{ color: "var(--accent-blue)", fontSize: 13, fontWeight: 600 }}>
                Demander un nouveau lien →
              </Link>
            </div>
          )}

          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="form-label">Nouveau mot de passe</label>
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
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, color: "#999", display: "flex" }}
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
              <label className="form-label">Confirmer le mot de passe</label>
              <input
                type={showPassword ? "text" : "password"}
                value={form.password_confirmation}
                onChange={set("password_confirmation")}
                placeholder="Répéter"
                required
                className="input-field"
                style={{ fontSize: 15, borderColor: errors.password_confirmation ? "var(--error)" : undefined }}
              />
              {errors.password_confirmation && <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--error)" }}>{errors.password_confirmation}</p>}
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
                  Réinitialisation…
                </span>
              ) : "Réinitialiser le mot de passe"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
