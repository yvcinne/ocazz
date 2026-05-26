import { useState } from "react";
import { Link } from "react-router-dom";
import { axiosClient } from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axiosClient.post("/forgot-password", { email });
      setDone(true);
    } catch (err) {
      const msg = err.response?.data?.errors?.email?.[0]
        || err.response?.data?.message
        || "Une erreur est survenue. Réessayez.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

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
            {done ? "Email envoyé" : "Réinitialiser le mot de passe"}
          </p>
        </div>

        <div style={{ background: "var(--bg-white)", border: "1px solid var(--border)", padding: "40px 36px" }}>
          {done ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 64, height: 64, background: "#E8F5E9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <svg width="32" height="32" fill="none" stroke="var(--success)" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <h4 style={{ margin: "0 0 12px", fontSize: 20 }}>Vérifiez votre email</h4>
              <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: "22px", margin: "0 0 6px" }}>
                Un lien de réinitialisation a été envoyé à
              </p>
              <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 24px", color: "var(--text-primary)" }}>{email}</p>
              <Link to="/Login" className="btn-primary" style={{ display: "block", height: 48, lineHeight: "48px", fontSize: 15, textAlign: "center" }}>
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "0 0 24px", lineHeight: "22px" }}>
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>

              {error && (
                <div style={{ background: "#FFF5F5", border: "1px solid var(--error)", borderLeft: "4px solid var(--error)", padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
                  <svg width="16" height="16" fill="none" stroke="var(--error)" viewBox="0 0 24 24" strokeWidth={2} style={{ flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span style={{ color: "var(--error)", fontSize: 14 }}>{error}</span>
                </div>
              )}

              <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="form-label">Adresse email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="votre@email.ma"
                    required
                    className="input-field"
                    style={{ fontSize: 15 }}
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", marginTop: 4 }}>
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="anim-spin">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                      Envoi…
                    </span>
                  ) : "Envoyer le lien"}
                </button>
              </form>

              <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--bg-off)", textAlign: "center" }}>
                <Link to="/Login" style={{ color: "var(--accent-blue)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                  ← Retour à la connexion
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
