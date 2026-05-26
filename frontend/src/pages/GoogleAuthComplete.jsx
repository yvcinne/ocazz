import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { axiosClient } from "../api/axios";

export default function GoogleAuthComplete() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:      params.get("name")      || "",
    last_name: params.get("last_name") || "",
    phone:     "",
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const regToken = params.get("reg");
  const email    = params.get("email") || "";

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  if (!regToken) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-off)", fontFamily: "Manrope,sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "var(--error)", marginBottom: 16 }}>Lien invalide ou expiré.</p>
          <Link to="/Login" style={{ color: "var(--accent-blue)", fontWeight: 600 }}>Retour à la connexion</Link>
        </div>
      </div>
    );
  }

  const onSubmit = async e => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim())      errs.name      = "Le prénom est requis.";
    if (!form.last_name.trim()) errs.last_name = "Le nom est requis.";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});
    try {
      const res = await axiosClient.post("/auth/google/complete", {
        reg_token: regToken,
        name:      form.name.trim(),
        last_name: form.last_name.trim(),
        phone:     form.phone.trim()     || null,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user",  JSON.stringify(res.data.user));
      navigate(res.data.user?.role === "admin" ? "/admin" : "/", { replace: true });
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

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-off)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <div style={{ width: "100%", maxWidth: 460 }} className="anim-up">

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
          <p style={{ color: "var(--text-muted)", fontSize: 15, marginTop: 8 }}>Finalisez votre inscription</p>
        </div>

        {/* Card */}
        <div style={{ background: "var(--bg-white)", border: "1px solid var(--border)", padding: "40px 36px" }}>

          {/* Google account badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg-off)", border: "1px solid var(--border)", padding: "10px 14px", marginBottom: 24 }}>
            <svg width="16" height="16" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "Manrope,sans-serif" }}>
              Connecté avec <strong style={{ color: "var(--text-primary)" }}>{email}</strong>
            </span>
          </div>

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
              <div>
                <label className="form-label">Prénom</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Mohamed"
                  required
                  className="input-field"
                  style={{ fontSize: 15, borderColor: errors.name ? "var(--error)" : undefined }}
                />
                {errors.name && <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--error)" }}>{errors.name}</p>}
              </div>
              <div>
                <label className="form-label">Nom</label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={set("last_name")}
                  placeholder="Alami"
                  required
                  className="input-field"
                  style={{ fontSize: 15, borderColor: errors.last_name ? "var(--error)" : undefined }}
                />
                {errors.last_name && <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--error)" }}>{errors.last_name}</p>}
              </div>
            </div>

            <div>
              <label className="form-label">
                Téléphone
                <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: 6, color: "var(--text-faint)", fontSize: 11 }}>(optionnel)</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                placeholder="+212 6XX XXX XXX"
                className="input-field"
                style={{ fontSize: 15 }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !form.name.trim() || !form.last_name.trim()}
              className="btn-primary"
              style={{ width: "100%", marginTop: 4, opacity: (!form.name.trim() || !form.last_name.trim()) ? 0.45 : 1, cursor: (!form.name.trim() || !form.last_name.trim()) ? "not-allowed" : "pointer" }}
            >
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
