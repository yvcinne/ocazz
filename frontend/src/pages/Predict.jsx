import { useState } from "react";
import { axiosClient } from "../api/axios";

// ── Field definitions aligned with the pipeline template ─────────────────────
//   Frontend key  →  dataset column  →  transformation
//   ──────────────────────────────────────────────────────────────────────────
//   etat          →  etat            →  ordinal (Neuf/Excellent/Très bon/Bon/Correct/Endommagé/Pour Pièces)
//   boite         →  boite-de-vitesses → Manuelle / Automatique
//   carburant     →  type-de-carburant → Essence / Diesel
//   marque        →  marque          →  dropdown list
//   modele        →  modele          →  free text
//   origine       →  origine         →  WW au Maroc / Importée neuve / Dédouanée
//   kilometrage   →  kilometrage     →  integer (pipeline handles scaling)
//   annee         →  age             →  frontend sends year, backend computes age = 2026 - annee
//   fiscal        →  puissance-fiscale → integer

const CURRENT_YEAR = 2026;

const FIELDS = [
  {
    k: "etat", label: "État du véhicule", type: "sel",
    apiKey: "etat",
    opts: ["", "Neuf", "Excellent", "Très bon", "Bon", "Correct", "Endommagé", "Pour Pièces"],
  },
  {
    k: "boite", label: "Boîte de vitesses", type: "sel",
    apiKey: "boite-de-vitesses",
    opts: ["", "Manuelle", "Automatique"],
  },
  {
    k: "carburant", label: "Carburant", type: "sel",
    apiKey: "type-de-carburant",
    opts: ["", "Essence", "Diesel"],
  },
  {
    k: "marque", label: "Marque", type: "sel",
    apiKey: "marque",
    opts: ["", "Dacia", "Renault", "Peugeot", "Volkswagen", "BMW",
      "Mercedes", "Toyota", "Hyundai", "Ford", "Kia", "Fiat", "Citroën",
      "Opel", "Seat", "Skoda", "Audi", "Honda", "Nissan", "Autre"],
  },
  {
    k: "modele", label: "Modèle", type: "inp",
    apiKey: "modele",
    placeholder: "Ex: Clio, Duster, Polo…",
  },
  {
    k: "origine", label: "Origine", type: "sel",
    apiKey: "origine",
    opts: ["", "WW au Maroc", "Importée neuve", "Dédouanée"],
  },
  {
    k: "kilometrage", label: "Kilométrage (km)", type: "inp",
    apiKey: "kilometrage",
    placeholder: "Ex: 75000", inputType: "number",
  },
  {
    k: "annee", label: "Année", type: "sel",
    apiKey: "annee",
    opts: ["", ...Array.from({ length: 26 }, (_, i) => String(CURRENT_YEAR - i))],
  },
  {
    k: "fiscal", label: "Puissance fiscale (CV)", type: "inp",
    apiKey: "puissance-fiscale",
    placeholder: "Ex: 7", inputType: "number",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n).toLocaleString("fr-MA");

export default function Predict() {
  const [form, setForm]       = useState({});
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    // Build the payload using the pipeline column names from the template
    const payload = {
      "etat":              form.etat            || "",
      "boite-de-vitesses": form.boite           || "",
      "type-de-carburant": form.carburant        || "",
      "marque":            form.marque           || "",
      "modele":            form.modele           || "",
      "origine":           form.origine          || "",
      "kilometrage":       parseInt(form.kilometrage || "0", 10),
      "annee":             parseInt(form.annee   || String(CURRENT_YEAR - 5), 10),
      "puissance-fiscale": parseInt(form.fiscal  || "5", 10),
    };

    try {
      const { data } = await axiosClient.post("/predict-price", payload);
      if (data.success) {
        setResult({ min: data.min, mid: data.price, max: data.max });
      } else {
        setError(data.error || "Erreur inattendue.");
      }
    } catch (err) {
      const msg = err?.response?.data?.error
        || err?.response?.data?.message
        || "Le service de prédiction est indisponible. Vérifiez que le serveur Python est lancé.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "var(--bg-white)", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{ background: "var(--bg-dark)", padding: "52px 0" }}>
        <div className="container">
          <h1 style={{ color: "#fff", margin: "0 0 14px" }}>
            Estimez le prix de votre véhicule
          </h1>
          <p style={{ color: "#888", fontSize: 17, margin: 0, maxWidth: 540 }}>
            Notre IA analyse les tendances du marché marocain en temps réel
            pour vous donner une estimation précise et fiable.
          </p>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="container" style={{ paddingTop: 48, paddingBottom: 60 }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 40, alignItems: "start" }}
          className="predict-grid"
        >

          {/* ── Form ── */}
          <div>
            <div style={{ border: "1px solid var(--border)", padding: "32px" }}>
              <h3 style={{ margin: "0 0 24px", fontSize: 22 }}>
                Caractéristiques du véhicule
              </h3>

              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                  {FIELDS.map(({ k, label, type, opts, placeholder, inputType }) => (
                    <div key={k}>
                      <label className="form-label">{label}</label>
                      {type === "sel" ? (
                        <select
                          value={form[k] || ""}
                          onChange={set(k)}
                          className="select-field"
                          required
                        >
                          {opts.map((o) => (
                            <option key={o} value={o}>{o || "Sélectionner"}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={inputType || "text"}
                          value={form[k] || ""}
                          onChange={set(k)}
                          placeholder={placeholder}
                          className="input-field"
                          required
                          min={inputType === "number" ? "0" : undefined}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* ── Error banner ── */}
                {error && (
                  <div style={{
                    background: "#FEF2F2", border: "1px solid #FCA5A5",
                    borderLeft: "4px solid #EF4444", padding: "14px 16px",
                    marginBottom: 16, fontSize: 14, color: "#7F1D1D",
                  }}>
                    ⚠ {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ width: "100%", opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth={2} className="anim-spin">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                      Analyse en cours…
                    </span>
                  ) : "Estimer le prix"}
                </button>
              </form>
            </div>

            {/* ── Result ── */}
            {result && (
              <div style={{
                marginTop: 24,
                border: "1px solid var(--accent-blue)",
                borderTop: "4px solid var(--accent-blue)",
                padding: "32px",
              }} className="anim-up">

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div style={{
                    width: 44, height: 44, background: "#EBF3FF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="22" height="22" fill="none" stroke="var(--accent-blue)"
                      viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 17, margin: 0 }}>Estimation IA — ocazz.ma</p>
                    <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>
                      Basé sur les données du marché marocain
                    </p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
                  {[
                    ["Minimum",    result.min, "var(--text-muted)"],
                    ["Estimation", result.mid, "var(--accent-blue)"],
                    ["Maximum",    result.max, "var(--success)"],
                  ].map(([l, v, c]) => (
                    <div key={l} style={{
                      border: "1px solid var(--border)", padding: "20px 16px",
                      textAlign: "center", background: "var(--bg-off)",
                    }}>
                      <p style={{
                        color: "var(--text-faint)", fontSize: 12, fontWeight: 600,
                        textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px",
                      }}>{l}</p>
                      <p style={{ fontWeight: 800, fontSize: 22, color: c, margin: "0 0 4px" }}>
                        {fmt(v)}
                      </p>
                      <p style={{ color: "var(--text-muted)", fontSize: 12, margin: 0, fontWeight: 600 }}>MAD</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <a href="/sell" className="btn-primary" style={{ flex: 1, textAlign: "center" }}>
                    Déposer mon annonce
                  </a>
                  <button onClick={() => { setResult(null); setError(null); }}
                    className="btn-secondary" style={{ flex: 1 }}>
                    Nouvelle estimation
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ border: "1px solid var(--border)", padding: "24px" }}>
              <h4 style={{ margin: "0 0 20px" }}>Comment ça fonctionne ?</h4>
              {[
                ["1", "Renseignez les caractéristiques de votre véhicule."],
                ["2", "Notre IA analyse des milliers d'annonces similaires."],
                ["3", "Recevez une fourchette de prix précise en secondes."],
              ].map(([n, t]) => (
                <div key={n} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 28, height: 28, background: "var(--accent-blue)", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 13, flexShrink: 0,
                  }}>{n}</div>
                  <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: "21px", margin: "4px 0 0" }}>
                    {t}
                  </p>
                </div>
              ))}
            </div>


          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 767px) { .predict-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}