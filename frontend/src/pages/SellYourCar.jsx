import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { axiosClient } from "../api/axios";

const STEPS = ["Votre véhicule", "Prix & Description"];

const BRANDS  = ["Audi","BMW","Citroën","Dacia","Fiat","Ford","Honda","Hyundai","Kia","Land Rover","Mercedes","Nissan","Opel","Peugeot","Renault","Seat","Skoda","Toyota","Volkswagen","Volvo","Autre"];
const FUELS   = ["Diesel","Essence","Hybride","Electrique","LPG"];
const TRANS   = ["Manuelle","Automatique"];
const CONDS   = ["Neuf","Excellent","Très bon","Bon","Correct"];
const CITIES  = ["Casablanca","Rabat","Marrakech","Fès","Tanger","Agadir","Meknès","Oujda","Kénitra","Tétouan","Salé","Safi","Mohammedia","El Jadida","Béni Mellal","Nador","Settat","Laâyoune","Autre"];

function getUser() {
  try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
}

function GuestLanding() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-off)", padding: "60px 16px" }}>
      <div style={{ textAlign: "center", maxWidth: 440 }}>
        <div style={{ width: 64, height: 64, background: "var(--accent-blue)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>
            <circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/>
          </svg>
        </div>
        <h1 style={{ margin: "0 0 12px", fontSize: 32 }}>Vendez votre voiture</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 16, lineHeight: "24px", margin: "0 0 36px" }}>
          Connectez-vous pour déposer votre annonce gratuitement et toucher des milliers d'acheteurs sur ocazz.ma.
        </p>
        <Link to="/Login?redirect=/sell" className="btn-primary"
          style={{ display: "block", height: 52, lineHeight: "52px", fontSize: 15, marginBottom: 16 }}>
          Se connecter pour publier
        </Link>
        <p style={{ color: "var(--text-faint)", fontSize: 14, margin: 0 }}>
          Pas encore de compte ?{" "}
          <Link to="/Register" style={{ color: "var(--accent-blue)", fontWeight: 600, textDecoration: "none" }}>
            Créer un compte gratuitement
          </Link>
        </p>
      </div>
    </div>
  );
}

const Field = ({ label, children, error }) => (
  <div>
    <label className="form-label">{label}</label>
    {children}
    {error && <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--error)" }}>{error}</p>}
  </div>
);

const Sel = ({ label, value, onChange, opts, error }) => (
  <Field label={label} error={error}>
    <select value={value} onChange={onChange} className="select-field"
      style={{ borderColor: error ? "var(--error)" : undefined }}>
      <option value="">Sélectionner</option>
      {opts.map(o => <option key={o}>{o}</option>)}
    </select>
  </Field>
);

const Inp = ({ label, type = "text", placeholder = "", value, onChange, error, optional }) => (
  <Field label={label} error={error}>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      className="input-field"
      style={{ borderColor: error ? "var(--error)" : undefined }}
    />
    {optional && !error && <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--text-faint)" }}>Optionnel</p>}
  </Field>
);

const DEFAULT_FORM = { brand: "", model: "", model_year: "", mileage: "", fuel_type: "", transmission: "", car_condition: "", fiscal_power: "", city: "", price: "", description: "" };

function readPrefill() {
  try {
    const raw = localStorage.getItem("chatbot_sell_prefill");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export default function SellYourCar() {
  const [form, setForm] = useState(() => {
    const p = readPrefill();
    return p ? { ...DEFAULT_FORM, ...p } : { ...DEFAULT_FORM };
  });

  const [step, setStep] = useState(1);

  useEffect(() => { localStorage.removeItem("chatbot_sell_prefill"); }, []);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState({});
  const [photos, setPhotos]       = useState([]); // [{file, preview}]
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  if (!getUser()) return <GuestLanding />;

  const set = k => e => { setForm(f => ({ ...f, [k]: e.target.value })); setErrors(e => ({ ...e, [k]: undefined })); };

  const onFilePick = e => {
    const files = Array.from(e.target.files);
    const remaining = 8 - photos.length;
    const picked = files.slice(0, remaining).map(file => ({ file, preview: URL.createObjectURL(file) }));
    setPhotos(prev => [...prev, ...picked]);
    e.target.value = "";
  };

  const removePhoto = idx => {
    setPhotos(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.brand)        e.brand        = "Requis";
    if (!form.model.trim()) e.model        = "Requis";
    if (!form.model_year)   e.model_year   = "Requis";
    if (!form.mileage)      e.mileage      = "Requis";
    if (!form.fuel_type)    e.fuel_type    = "Requis";
    if (!form.transmission) e.transmission = "Requis";
    if (!form.car_condition)e.car_condition= "Requis";
    if (!form.city)         e.city         = "Requis";
    return e;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.price || isNaN(form.price) || +form.price <= 0) e.price = "Prix invalide";
    if (!form.description.trim()) e.description = "Requis";
    return e;
  };

  const onNext = () => {
    const e = validateStep1();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(2);
  };

  const onSubmit = async e => {
    e.preventDefault();
    const e2 = validateStep2();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setLoading(true);
    setErrors({});
    try {
      const title = `${form.brand} ${form.model} ${form.model_year}`;
      const fd = new FormData();
      Object.entries({ ...form, title }).forEach(([k, v]) => fd.append(k, v));
      photos.forEach(({ file }) => fd.append("images[]", file));
      await axiosClient.post("/annonces", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setSubmitted(true);
    } catch (err) {
      if (err.response?.data?.errors) {
        const mapped = {};
        Object.entries(err.response.data.errors).forEach(([k, msgs]) => { mapped[k] = msgs[0]; });
        setErrors(mapped);
        if (mapped.brand || mapped.model || mapped.model_year || mapped.mileage ||
            mapped.fuel_type || mapped.transmission || mapped.car_condition || mapped.city) {
          setStep(1);
        }
      } else {
        setErrors({ general: err.response?.data?.message || "Une erreur est survenue." });
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ background: "var(--bg-white)", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 16px" }}>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{ width: 64, height: 64, background: "#E8F5E9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <svg width="32" height="32" fill="none" stroke="var(--success)" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 style={{ margin: "0 0 12px" }}>Annonce soumise !</h2>
          <p style={{ color: "var(--text-muted)", margin: "0 0 32px", lineHeight: "24px" }}>
            Votre annonce est en attente de validation. Elle sera publiée sur le site dès qu'un administrateur l'aura approuvée, généralement sous 24h.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={() => { setSubmitted(false); setStep(1); setPhotos([]); setForm({ ...DEFAULT_FORM }); }}
              className="btn-secondary">
              Nouvelle annonce
            </button>
            <Link to="/Marketplace" className="btn-primary">Voir les annonces</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg-white)", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ background: "var(--accent-blue)", padding: "52px 0" }}>
        <div className="container">
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>Déposer une annonce</p>
          <h1 style={{ color: "#fff", margin: "0 0 8px" }}>Vendez votre voiture gratuitement</h1>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, margin: 0 }}>Renseignez les informations de votre véhicule et touchez des milliers d'acheteurs.</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 48, paddingBottom: 60 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 40, alignItems: "start" }} className="sell-grid">

          <div>
            {/* Step indicators */}
            <div style={{ display: "flex", marginBottom: 32, borderBottom: "1px solid var(--border)" }}>
              {STEPS.map((label, i) => {
                const n = i + 1;
                const active = step === n;
                const done   = step > n;
                return (
                  <div key={label} onClick={() => done && setStep(n)}
                    style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: done ? "pointer" : "default", borderBottom: active ? "3px solid var(--accent-blue)" : "3px solid transparent", marginBottom: -1 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: active ? "var(--accent-blue)" : done ? "var(--success)" : "var(--bg-off)", border: active || done ? "none" : "1px solid var(--border)", color: active || done ? "#fff" : "var(--text-faint)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
                      {done ? "✓" : n}
                    </div>
                    <span style={{ fontSize: 13, color: active ? "var(--accent-blue)" : done ? "var(--success)" : "var(--text-faint)", fontWeight: active ? 600 : 400 }}>{label}</span>
                  </div>
                );
              })}
            </div>

            {errors.general && (
              <div style={{ background: "#FFF5F5", border: "1px solid var(--error)", borderLeft: "4px solid var(--error)", padding: "12px 16px", marginBottom: 20, fontSize: 14, color: "var(--error)" }}>
                {errors.general}
              </div>
            )}

            {/* Step 1 — Vehicle info */}
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="anim-fade">
                <h3 style={{ margin: 0, fontSize: 22 }}>Informations du véhicule</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Sel label="Marque" value={form.brand} onChange={set("brand")} opts={BRANDS} error={errors.brand}/>
                  <Inp label="Modèle" value={form.model} onChange={set("model")} placeholder="Ex: Duster" error={errors.model}/>
                  <Inp label="Année" type="number" value={form.model_year} onChange={set("model_year")} placeholder="Ex: 2019" error={errors.model_year}/>
                  <Inp label="Kilométrage (km)" type="number" value={form.mileage} onChange={set("mileage")} placeholder="Ex: 45000" error={errors.mileage}/>
                  <Sel label="Carburant" value={form.fuel_type} onChange={set("fuel_type")} opts={FUELS} error={errors.fuel_type}/>
                  <Sel label="Boîte de vitesse" value={form.transmission} onChange={set("transmission")} opts={TRANS} error={errors.transmission}/>
                  <Sel label="État du véhicule" value={form.car_condition} onChange={set("car_condition")} opts={CONDS} error={errors.car_condition}/>
                  <Sel label="Ville" value={form.city} onChange={set("city")} opts={CITIES} error={errors.city}/>
                  <Inp label="Puissance fiscale" value={form.fiscal_power} onChange={set("fiscal_power")} placeholder="Ex: 7 CV" optional/>
                </div>
                <button onClick={onNext} className="btn-primary" style={{ alignSelf: "flex-start" }}>Continuer →</button>
              </div>
            )}

            {/* Step 2 — Price & Description */}
            {step === 2 && (
              <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }} className="anim-fade">
                <h3 style={{ margin: 0, fontSize: 22 }}>Prix et description</h3>

                <Field label="Prix demandé (MAD)" error={errors.price}>
                  <div style={{ position: "relative" }}>
                    <input type="number" value={form.price} onChange={set("price")} placeholder="Ex: 150000"
                      className="input-field"
                      style={{ paddingRight: 60, borderColor: errors.price ? "var(--error)" : undefined }}/>
                    <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14, fontWeight: 600 }}>MAD</span>
                  </div>
                </Field>

                <Field label="Description" error={errors.description}>
                  <textarea value={form.description} onChange={set("description")}
                    placeholder="Décrivez l'état général, les options, l'historique d'entretien…"
                    className="textarea-field"
                    style={{ minHeight: 140, borderColor: errors.description ? "var(--error)" : undefined }}/>
                </Field>

                {/* Photo upload */}
                <div>
                  <label className="form-label">Photos ({photos.length}/8)</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onFilePick}
                    style={{ display: "none" }}
                  />

                  {photos.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10, marginBottom: 12 }}>
                      {photos.map(({ preview }, idx) => (
                        <div key={idx} style={{ position: "relative", aspectRatio: "1", borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid var(--border)" }}>
                          <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, lineHeight: 1 }}
                          >×</button>
                          {idx === 0 && (
                            <span style={{ position: "absolute", bottom: 4, left: 4, background: "var(--accent-blue)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: "99px" }}>Principal</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {photos.length < 8 && (
                    <div
                      onClick={() => fileInputRef.current.click()}
                      style={{ border: "2px dashed var(--border)", borderRadius: "var(--radius-md)", padding: "32px 20px", textAlign: "center", cursor: "pointer", transition: "border-color 0.15s, background 0.15s" }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = "var(--accent-blue)"; e.currentTarget.style.background = "rgba(37,99,235,0.03)"; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "transparent"; }}
                    >
                      <svg width="36" height="36" fill="none" stroke="var(--text-faint)" viewBox="0 0 24 24" style={{ marginBottom: 10 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      <p style={{ fontWeight: 600, margin: "0 0 4px", color: "var(--text-secondary)", fontSize: 14 }}>
                        {photos.length === 0 ? "Cliquez pour ajouter des photos" : "Ajouter d'autres photos"}
                      </p>
                      <p style={{ color: "var(--text-faint)", fontSize: 12, margin: 0 }}>PNG, JPG · Max 10 MB · {8 - photos.length} emplacement{8 - photos.length > 1 ? "s" : ""} restant{8 - photos.length > 1 ? "s" : ""}</p>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary">← Retour</button>
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? "Publication…" : "Publier l'annonce"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { title: "Annonce vérifiée sous 24h", desc: "Notre équipe contrôle chaque annonce avant publication.", color: "var(--accent-blue)" },
              { title: "100% Gratuit", desc: "La publication est entièrement gratuite pour les particuliers.", color: "#28A745" },
              { title: "Messagerie intégrée", desc: "Échangez directement avec les acheteurs sérieux.", color: "#6610F2" },
              { title: "Estimation IA disponible", desc: "Utilisez notre outil pour fixer le juste prix avant de publier.", color: "#E83E8C" },
            ].map(item => (
              <div key={item.title} style={{ padding: "20px", background: "var(--bg-off)", borderLeft: `4px solid ${item.color}` }}>
                <p style={{ fontWeight: 700, margin: "0 0 6px", color: "var(--text-primary)" }}>{item.title}</p>
                <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0, lineHeight: "21px" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@media(max-width:767px){.sell-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
}
