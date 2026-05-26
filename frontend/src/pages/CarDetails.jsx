import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { axiosClient } from "../api/axios";

function Spec({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ background:"var(--bg-off)", padding:"16px 12px", borderLeft:"3px solid var(--accent-blue)" }}>
      <p style={{ color:"var(--text-faint)", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px", margin:"0 0 4px" }}>{label}</p>
      <p style={{ fontWeight:700, fontSize:15, margin:0, color:"var(--text-primary)" }}>{value}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ background:"var(--bg-white)", minHeight:"100vh", paddingBottom:60 }}>
      <div style={{ background:"var(--bg-off)", borderBottom:"1px solid var(--border)", padding:"14px 0" }}>
        <div className="container" style={{ height:20, width:300, background:"var(--border)" }}/>
      </div>
      <div className="container" style={{ paddingTop:40 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:32 }} className="details-grid">
          <div>
            <div style={{ height:420, background:"var(--bg-off)", marginBottom:24 }}/>
            <div style={{ height:200, background:"var(--bg-off)", marginBottom:24 }}/>
          </div>
          <div style={{ height:300, background:"var(--bg-off)" }}/>
        </div>
      </div>
    </div>
  );
}

function Lightbox({ imgs, index, onClose, onPrev, onNext }) {
  useEffect(() => {
    const onKey = e => {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowLeft")  onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div
      onClick={onClose}
      style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.93)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}
    >
      {/* Close */}
      <button
        onClick={e => { e.stopPropagation(); onClose(); }}
        style={{ position:"absolute", top:18, right:22, background:"none", border:"none", color:"#fff", cursor:"pointer", padding:8, lineHeight:1, zIndex:1 }}
      >
        <svg width="28" height="28" fill="none" stroke="#fff" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      {/* Counter */}
      <p style={{ position:"absolute", top:24, left:28, color:"rgba(255,255,255,0.7)", fontSize:14, margin:0, fontFamily:"Manrope,sans-serif" }}>
        {index + 1} / {imgs.length}
      </p>

      {/* Main image */}
      <div
        onClick={e => e.stopPropagation()}
        style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", width:"100%", padding:"60px 80px 16px", boxSizing:"border-box", position:"relative" }}
      >
        <img
          src={imgs[index]}
          referrerPolicy="no-referrer"
          alt=""
          style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain", userSelect:"none" }}
        />

        {/* Prev */}
        {imgs.length > 1 && (
          <button
            onClick={e => { e.stopPropagation(); onPrev(); }}
            style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)", width:48, height:48, background:"rgba(255,255,255,0.15)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", transition:"background 0.15s" }}
            onMouseOver={e => e.currentTarget.style.background="rgba(255,255,255,0.28)"}
            onMouseOut={e => e.currentTarget.style.background="rgba(255,255,255,0.15)"}
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
        )}

        {/* Next */}
        {imgs.length > 1 && (
          <button
            onClick={e => { e.stopPropagation(); onNext(); }}
            style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", width:48, height:48, background:"rgba(255,255,255,0.15)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", transition:"background 0.15s" }}
            onMouseOver={e => e.currentTarget.style.background="rgba(255,255,255,0.28)"}
            onMouseOut={e => e.currentTarget.style.background="rgba(255,255,255,0.15)"}
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      {imgs.length > 1 && (
        <div
          onClick={e => e.stopPropagation()}
          style={{ display:"flex", gap:6, padding:"0 20px 20px", overflowX:"auto", maxWidth:"100%", flexShrink:0 }}
        >
          {imgs.map((src, i) => (
            <button
              key={i}
              onClick={() => onNext(i)}
              style={{
                width:72, height:52, padding:0, flexShrink:0, border: i === index ? "2px solid #fff" : "2px solid rgba(255,255,255,0.2)",
                cursor:"pointer", overflow:"hidden", opacity: i === index ? 1 : 0.5, transition:"opacity 0.15s, border-color 0.15s",
              }}
            >
              <img src={src} referrerPolicy="no-referrer" alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar]           = useState(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg]   = useState(0);
  const [lightbox, setLightbox]     = useState(false);
  const [msg, setMsg]           = useState("");
  const [sent, setSent]         = useState(false);
  const [sending, setSending]   = useState(false);
  const [isFav, setIsFav]       = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const lbPrev  = useCallback(() => setActiveImg(i => (i - 1 + (car?.images?.length ?? 1)) % (car?.images?.length ?? 1)), [car]);
  const lbNext  = useCallback((i) => setActiveImg(typeof i === "number" ? i : prev => (prev + 1) % (car?.images?.length ?? 1)), [car]);
  const lbClose = useCallback(() => setLightbox(false), []);

  useEffect(() => {
    setLoading(true);
    axiosClient.get(`/annonces/${id}`)
      .then(res => { setCar(res.data); setLoading(false); })
      .catch(err => {
        setLoading(false);
        if (err.response?.status === 404) setNotFound(true);
      });
  }, [id]);

  useEffect(() => {
    if (!localStorage.getItem("token") || !id) return;
    axiosClient.get("/favorites")
      .then(r => setIsFav(r.data.some(f => f.annonce_id == id)))
      .catch(() => {});
  }, [id]);

  const handleToggleFav = async () => {
    if (!localStorage.getItem("token")) { navigate(`/Login?redirect=/cars/${id}`); return; }
    setFavLoading(true);
    setIsFav(v => !v);
    await axiosClient.post(`/favorites/toggle/${id}`).catch(() => setIsFav(v => !v));
    setFavLoading(false);
  };

  if (loading) return <Skeleton />;

  if (notFound || !car) {
    return (
      <div style={{ minHeight:"60vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
        <h2>Annonce introuvable</h2>
        <Link to="/Marketplace" className="btn-primary">Voir les annonces</Link>
      </div>
    );
  }

  const imgs  = car.images?.map(i => i.url) ?? [];
  const price = Number(car.price).toLocaleString("fr-MA");
  const km    = Number(car.mileage).toLocaleString("fr-MA");

  const opts = car.options ?? {};
  const LABELS = {
    abs:"ABS", airbags:"Airbags", bluetooth:"Bluetooth", camera_recul:"Caméra de recul",
    climatisation:"Climatisation", esp:"ESP", jantes_alu:"Jantes aluminium",
    limiteur_vitesse:"Limiteur de vitesse", ordinateur_bord:"Ordinateur de bord",
    radar_recul:"Radar de recul", regulateur:"Régulateur de vitesse",
    sieges_cuir:"Sièges cuir", gps:"GPS", toit_ouvrant:"Toit ouvrant",
    verrouillage:"Verrouillage centralisé", vitres_electriques:"Vitres électriques",
  };
  const features = Object.entries(opts).filter(([,v]) => v).map(([k]) => LABELS[k] ?? k);

  const user = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } })();

  const handleSendMessage = async e => {
    e.preventDefault();
    if (!user) { navigate(`/Login?redirect=/cars/${id}`); return; }
    setSending(true);
    try {
      // Step 1: create or retrieve the conversation
      const convRes = await axiosClient.post("/conversations", { annonce_id: car.id });
      const convId = convRes.data?.data?.id ?? convRes.data?.id;
      // Step 2: send the actual message in that conversation
      await axiosClient.post(`/conversations/${convId}/messages`, { content: msg });
      setSent(true);
    } catch {
      navigate("/messages");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ background:"var(--bg-white)", minHeight:"100vh", paddingBottom:60 }}>
      {/* Breadcrumb */}
      <div style={{ background:"var(--bg-off)", borderBottom:"1px solid var(--border)", padding:"14px 0" }}>
        <div className="container" style={{ display:"flex", gap:8, alignItems:"center", fontSize:14, color:"var(--text-muted)" }}>
          <Link to="/" style={{ color:"var(--text-muted)", textDecoration:"none" }}>Accueil</Link>
          <span>/</span>
          <Link to="/Marketplace" style={{ color:"var(--text-muted)", textDecoration:"none" }}>Annonces</Link>
          <span>/</span>
          <span style={{ color:"var(--text-primary)", fontWeight:600 }}>{car.model_year} {car.brand} {car.model}</span>
        </div>
      </div>

      <div className="container" style={{ paddingTop:40 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:32, alignItems:"start" }} className="details-grid">

          {/* Left */}
          <div>
            {/* Gallery */}
            <div style={{ border:"1px solid var(--border)", borderRadius:"var(--radius-md)", boxShadow:"var(--shadow-xs)", marginBottom:24 }}>
              {imgs.length > 0 ? (
                <>
                  <div style={{ position:"relative", height:420, overflow:"hidden", background:"var(--bg-off)", cursor:"zoom-in" }}
                    onClick={() => setLightbox(true)}>
                    <img src={imgs[activeImg]} alt={`${car.brand} ${car.model}`}
                      referrerPolicy="no-referrer"
                      style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                    <div style={{ position:"absolute", bottom:12, right:12, background:"rgba(0,0,0,0.6)", color:"#fff", fontSize:12, padding:"4px 10px", fontFamily:"Manrope,sans-serif", display:"flex", alignItems:"center", gap:6 }}>
                      <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4"/>
                      </svg>
                      {activeImg+1} / {imgs.length}
                    </div>
                    {imgs.length > 1 && <>
                      <button onClick={e => { e.stopPropagation(); setActiveImg(i => (i-1+imgs.length)%imgs.length); }}
                        style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", width:40, height:40, background:"rgba(255,255,255,0.9)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                      </button>
                      <button onClick={e => { e.stopPropagation(); setActiveImg(i => (i+1)%imgs.length); }}
                        style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", width:40, height:40, background:"rgba(255,255,255,0.9)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                      </button>
                    </>}
                  </div>
                  {imgs.length > 1 && (
                    <div style={{ display:"flex", gap:4, padding:8, background:"var(--bg-off)" }}>
                      {imgs.map((src, i) => (
                        <button key={i} onClick={() => setActiveImg(i)}
                          style={{ flex:1, height:64, padding:0, border:activeImg===i?"2px solid var(--accent-blue)":"2px solid transparent", cursor:"pointer", overflow:"hidden", opacity:activeImg===i?1:0.55, transition:"opacity 0.15s, border-color 0.15s" }}>
                          <img src={src} alt="" referrerPolicy="no-referrer" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ height:420, background:"var(--bg-off)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="64" height="64" fill="none" stroke="var(--border)" strokeWidth={1.2} viewBox="0 0 24 24">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>
                    <circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Specs */}
            <div style={{ border:"1px solid var(--border)", borderRadius:"var(--radius-md)", boxShadow:"var(--shadow-xs)", padding:"24px 24px 28px", marginBottom:24 }}>
              <h3 style={{ fontSize:22, margin:"0 0 20px" }}>Caractéristiques</h3>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px,1fr))", gap:12 }}>
                <Spec label="Année"       value={car.model_year} />
                <Spec label="Kilométrage" value={`${km} km`} />
                <Spec label="Carburant"   value={car.fuel_type} />
                <Spec label="Boîte"       value={car.transmission} />
                <Spec label="État"        value={car.car_condition} />
                <Spec label="Puissance"   value={car.fiscal_power} />
                <Spec label="Origine"     value={car.origin} />
                <Spec label="Ville"       value={car.city} />
                {car.doors && <Spec label="Portes" value={car.doors} />}
                {car.first_hand && <Spec label="Première main" value="Oui" />}
              </div>
            </div>

            {/* Description */}
            <div style={{ border:"1px solid var(--border)", borderRadius:"var(--radius-md)", boxShadow:"var(--shadow-xs)", padding:"24px", marginBottom:24 }}>
              <h3 style={{ fontSize:22, margin:"0 0 16px" }}>Description</h3>
              <p style={{ color:"var(--text-secondary)", lineHeight:"24px", margin:0, whiteSpace:"pre-line" }}>{car.description}</p>
            </div>

            {/* Equipment options */}
            {features.length > 0 && (
              <div style={{ border:"1px solid var(--border)", borderRadius:"var(--radius-md)", boxShadow:"var(--shadow-xs)", padding:"24px" }}>
                <h3 style={{ fontSize:22, margin:"0 0 20px" }}>Équipements</h3>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {features.map(f => (
                    <div key={f} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:"1px solid var(--bg-off)" }}>
                      <div style={{ width:8, height:8, background:"var(--accent-blue)", flexShrink:0 }}/>
                      <span style={{ fontSize:14, color:"var(--text-secondary)" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div style={{ position:"sticky", top:100 }}>
            {/* Price card */}
            <div style={{ border:"1px solid var(--border)", borderRadius:"var(--radius-md)", boxShadow:"var(--shadow-xs)", padding:"24px", marginBottom:20 }}>
              {car.city && <p style={{ color:"var(--text-muted)", fontSize:13, margin:"0 0 8px" }}>{car.city}</p>}
              <h2 style={{ margin:"0 0 4px", fontSize:20 }}>{car.model_year} {car.brand} {car.model}</h2>
              <p style={{ fontSize:36, fontWeight:800, color:"var(--accent-blue)", margin:"12px 0 4px" }}>
                {price}<span style={{ fontSize:16, color:"var(--text-muted)", fontWeight:400, marginLeft:6 }}>MAD</span>
              </p>
              <p style={{ color:"var(--text-muted)", fontSize:13, margin:"0 0 20px" }}>{km} km · {car.fuel_type}</p>
              <button
                onClick={handleToggleFav}
                disabled={favLoading}
                style={{
                  width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  padding:"10px 0", border:`1px solid ${isFav ? "#e53e3e" : "var(--border)"}`,
                  background: isFav ? "#fff5f5" : "var(--bg-white)",
                  color: isFav ? "#e53e3e" : "var(--text-primary)",
                  cursor:"pointer", fontFamily:"Manrope,sans-serif", fontWeight:600, fontSize:14,
                  transition:"all 0.15s",
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill={isFav ? "#e53e3e" : "none"} stroke={isFav ? "#e53e3e" : "currentColor"} strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                {isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
              </button>
            </div>

            {/* Message form */}
            <div style={{ border:"1px solid var(--border)", borderRadius:"var(--radius-md)", boxShadow:"var(--shadow-xs)", padding:"24px" }}>
              <h4 style={{ margin:"0 0 4px", fontSize:18 }}>Envoyer un message</h4>
              <p style={{ color:"var(--text-muted)", fontSize:13, margin:"0 0 20px" }}>Posez une question directement au vendeur.</p>
              {sent ? (
                <div style={{ textAlign:"center", padding:"24px 0" }}>
                  <div style={{ width:48, height:48, background:"#E8F5E9", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
                    <svg width="24" height="24" fill="none" stroke="var(--success)" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <p style={{ fontWeight:700, margin:"0 0 4px" }}>Message envoyé !</p>
                  <Link to="/messages" style={{ color:"var(--accent-blue)", fontSize:13, fontWeight:600, textDecoration:"none" }}>Voir mes messages →</Link>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <textarea required value={msg} onChange={e => setMsg(e.target.value)}
                    placeholder={`Intéressé par ce ${car.brand} ${car.model}…`}
                    className="textarea-field" style={{ fontSize:14, minHeight:100 }}/>
                  <button type="submit" disabled={sending} className="btn-primary" style={{ width:"100%" }}>
                    {user ? (sending ? "Envoi…" : "Envoyer") : "Se connecter pour écrire"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:767px){.details-grid{grid-template-columns:1fr !important;}}`}</style>

      {lightbox && imgs.length > 0 && (
        <Lightbox imgs={imgs} index={activeImg} onClose={lbClose} onPrev={lbPrev} onNext={lbNext} />
      )}
    </div>
  );
}
