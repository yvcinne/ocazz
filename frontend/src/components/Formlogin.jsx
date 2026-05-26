import { useState } from 'react';
import { axiosClient } from '../api/axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Formlogin() {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    const navigate = useNavigate();
    const { search } = useLocation();
    const redirectTo = new URLSearchParams(search).get('redirect');

    const onSubmit = async (values) => {
        setLoading(true);
        setError('');
        try {
            const response = await axiosClient.post('/login', values);

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                const isAdmin = response.data.user?.role === 'admin';
                navigate(redirectTo ?? (isAdmin ? '/admin' : '/'));
            } else {
                setError('Login failed: no token received');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Email ou mot de passe incorrect.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {error && (
                <div style={{ background: "#FFF5F5", border: "1px solid var(--error)", borderLeft: "4px solid var(--error)", padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
                    <svg width="16" height="16" fill="none" stroke="var(--error)" viewBox="0 0 24 24" strokeWidth={2} style={{ flexShrink: 0 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span style={{ color: "var(--error)", fontSize: 14, fontFamily: "Manrope,sans-serif" }}>{error}</span>
                </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); onSubmit({ email, password }); }}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                <div>
                    <label htmlFor="email" style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#333", marginBottom: 8, fontFamily: "Manrope,sans-serif" }}>
                        Adresse email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.ma"
                        required
                        className="input-field"
                        style={{ fontSize: 15 }}
                    />
                </div>

                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <label htmlFor="password" style={{ fontSize: 14, fontWeight: 600, color: "#333", fontFamily: "Manrope,sans-serif" }}>
                            Mot de passe
                        </label>
                        <Link to="/forgot-password" style={{ fontSize: 13, color: "#007BFF", textDecoration: "none", fontFamily: "Manrope,sans-serif" }}>
                            Mot de passe oublié ?
                        </Link>
                    </div>
                    <div style={{ position: "relative" }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="input-field"
                            style={{ fontSize: 15, paddingRight: 44 }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, color: "#999", display: "flex", alignItems: "center" }}
                            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        >
                            {showPassword ? (
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
                    </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", marginTop: 8 }}>
                    {loading ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="anim-spin">
                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                            </svg>
                            Connexion…
                        </span>
                    ) : "Se connecter"}
                </button>
            </form>

            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                <span style={{ color: "var(--text-faint)", fontSize: 12, fontFamily: "Manrope,sans-serif", whiteSpace: "nowrap" }}>ou</span>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            <a
                href={`${import.meta.env.VITE_BACKEND_URL}/api/auth/google`}
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
                Continuer avec Google
            </a>
        </div>
    );
}
