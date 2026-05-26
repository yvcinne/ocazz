import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function GoogleAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      navigate("/Login?error=google_failed", { replace: true });
      return;
    }

    localStorage.setItem("token", token);

    // Fetch user info with the new token so we can store it and handle admin redirect
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((user) => {
        localStorage.setItem("user", JSON.stringify(user));
        navigate(user?.role === "admin" ? "/admin" : "/", { replace: true });
      })
      .catch(() => navigate("/", { replace: true }));
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-off)" }}>
      <div style={{ textAlign: "center", fontFamily: "Manrope,sans-serif" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth={2} style={{ animation: "spin 1s linear infinite" }}>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        <p style={{ color: "var(--text-muted)", marginTop: 12 }}>Connexion en cours…</p>
      </div>
    </div>
  );
}
