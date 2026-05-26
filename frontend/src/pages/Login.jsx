import Formlogin from "../components/Formlogin";
import { Link, useSearchParams } from "react-router-dom";

export default function Login() {
  const [params] = useSearchParams();
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-off)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <div style={{ width: "100%", maxWidth: 480 }} className="anim-up">
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
          <p style={{ color: "var(--text-muted)", fontSize: 15, marginTop: 8, marginBottom: 0 }}>Connectez-vous à votre espace personnel</p>
        </div>

        {/* Card */}
        <div style={{ background: "var(--bg-white)", border: "1px solid var(--border)", padding: "40px 36px" }}>
          {params.get("reset") === "1" && (
            <div style={{ background: "#E8F5E9", border: "1px solid var(--success)", borderLeft: "4px solid var(--success)", padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
              <svg width="16" height="16" fill="none" stroke="var(--success)" viewBox="0 0 24 24" strokeWidth={2} style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              <span style={{ color: "#1B5E20", fontSize: 14 }}>Mot de passe réinitialisé avec succès. Connectez-vous.</span>
            </div>
          )}
          <Formlogin />
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--bg-off)", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
              Pas encore de compte ?{" "}
              <Link to="/Register" style={{ color: "var(--accent-blue)", fontWeight: 600, textDecoration: "none" }}>Créer un compte</Link>
            </p>
          </div>
        </div>

        <p style={{ textAlign: "center", color: "var(--text-faint)", fontSize: 12, marginTop: 20 }}>
          <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Conditions d'utilisation</a> · <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Confidentialité</a>
        </p>
      </div>
    </div>
  );
}