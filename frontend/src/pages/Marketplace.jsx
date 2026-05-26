import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { axiosClient } from "../api/axios";

const BRANDS = ["Toutes", "Audi", "BMW", "Citroën", "Dacia", "Fiat", "Ford", "Honda", "Hyundai",
  "Kia", "Land Rover", "Mercedes", "Nissan", "Opel", "Peugeot", "Renault",
  "Seat", "Skoda", "Toyota", "Volkswagen", "Volvo"];
const FUELS  = ["Tous", "Diesel", "Essence", "Hybride", "Electrique", "LPG"];
const TRANS  = ["Toutes", "Manuelle", "Automatique"];
const CONDS  = ["Tous", "Neuf", "Excellent", "Très bon", "Bon", "Correct"];
const CURRENT_YEAR = new Date().getFullYear();

function HeartButton({ isFav, onClick }) {
  return (
    <button
      onClick={onClick}
      title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
      style={{
        position: "absolute", top: 10, left: 10, zIndex: 2,
        width: 34, height: 34, background: "rgba(255,255,255,0.92)",
        border: "none", cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center",
        transition: "transform 0.15s, background 0.15s",
        borderRadius: 0,
      }}
      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.12)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill={isFav ? "#e53e3e" : "none"} stroke={isFav ? "#e53e3e" : "#555"} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
      </svg>
    </button>
  );
}

function CarCard({ car, isFav, onToggleFav }) {
  const img   = car.images?.[0]?.url;
  const km    = Number(car.mileage).toLocaleString("fr-MA");
  const price = Number(car.price).toLocaleString("fr-MA");

  return (
    <div style={{ position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg-white)", boxShadow: "var(--shadow-xs)", transition: "box-shadow 0.25s, transform 0.25s" }}
      onMouseOver={e => { e.currentTarget.style.boxShadow = "var(--shadow-lg)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseOut={e => { e.currentTarget.style.boxShadow = "var(--shadow-xs)"; e.currentTarget.style.transform = "none"; }}>
      <HeartButton isFav={isFav} onClick={e => { e.stopPropagation(); e.preventDefault(); onToggleFav(car.id); }} />
      <Link to={`/cars/${car.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <div style={{ position: "relative", height: 185, overflow: "hidden", background: "var(--bg-off)" }}>
          {img ? (
            <img src={img} alt={car.title} referrerPolicy="no-referrer"
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1)" }}
              onMouseOver={e => e.target.style.transform = "scale(1.06)"}
              onMouseOut={e => e.target.style.transform = "scale(1)"} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth={1.5}>
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>
                <circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/>
              </svg>
            </div>
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.45) 0%,transparent 55%)" }}/>
          {car.city && <span className="badge-dark" style={{ position: "absolute", top: 10, right: 10 }}>{car.city}</span>}
        </div>
        <div style={{ padding: "16px 18px 18px" }}>
          <p style={{ color: "var(--text-faint)", fontSize: 12, margin: "0 0 5px", fontWeight: 500 }}>
            {car.model_year} · {car.fuel_type} · {km} km
          </p>
          <p style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 15, margin: "0 0 12px", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {car.brand} {car.model}
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 19, color: "var(--accent-blue)" }}>
              {price} <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-faint)" }}>MAD</span>
            </span>
            <span style={{ color: "var(--accent-blue)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 2 }}>
              Voir <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg-white)" }}>
      <div className="skeleton" style={{ height: 185, borderRadius: 0 }} />
      <div style={{ padding: "16px 18px 18px" }}>
        <div className="skeleton" style={{ height: 11, width: "55%", marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 15, width: "75%", marginBottom: 14 }} />
        <div className="skeleton" style={{ height: 18, width: "38%" }} />
      </div>
    </div>
  );
}

export default function Marketplace() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [search,   setSearch]   = useState(searchParams.get("q") || "");
  const [brand,    setBrand]    = useState("Toutes");
  const [fuel,     setFuel]     = useState("Tous");
  const [trans,    setTrans]    = useState("Toutes");
  const [cond,     setCond]     = useState("Tous");
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [minYear,  setMinYear]  = useState(2000);
  const [maxYear,  setMaxYear]  = useState(CURRENT_YEAR);
  const [sort,     setSort]     = useState("recent");
  const [page,     setPage]     = useState(1);

  const [cars,        setCars]        = useState([]);
  const [total,       setTotal]       = useState(0);
  const [lastPage,    setLastPage]    = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg,    setShowSugg]    = useState(false);
  const [favIds,      setFavIds]      = useState(new Set());

  const debounceRef  = useRef(null);
  const inputWrapRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (inputWrapRef.current && !inputWrapRef.current.contains(e.target)) {
        setShowSugg(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    axiosClient.get("/favorites")
      .then(r => setFavIds(new Set(r.data.map(f => f.annonce_id))))
      .catch(() => {});
  }, []);

  const handleToggleFav = async (annonceId) => {
    if (!localStorage.getItem("token")) { navigate("/Login?redirect=/Marketplace"); return; }
    setFavIds(prev => {
      const next = new Set(prev);
      next.has(annonceId) ? next.delete(annonceId) : next.add(annonceId);
      return next;
    });
    await axiosClient.post(`/favorites/toggle/${annonceId}`).catch(() => {
      setFavIds(prev => {
        const next = new Set(prev);
        next.has(annonceId) ? next.delete(annonceId) : next.add(annonceId);
        return next;
      });
    });
  };

  const handleSearchInput = (value) => {
    setSearch(value);
    clearTimeout(debounceRef.current);
    if (value.length < 2) { setSuggestions([]); setShowSugg(false); return; }

    const lower = value.toLowerCase();
    const brandMatches = BRANDS
      .filter(b => b !== "Toutes" && b.toLowerCase().includes(lower))
      .slice(0, 4);

    debounceRef.current = setTimeout(() => {
      axiosClient.get("/annonces", { params: { search: value, per_page: 8, status: "approved" } })
        .then(res => {
          const seen = new Set(brandMatches.map(b => b.toLowerCase()));
          const modelSuggs = [];
          res.data.data.forEach(car => {
            const key = `${car.brand} ${car.model}`;
            if (!seen.has(key.toLowerCase())) {
              seen.add(key.toLowerCase());
              modelSuggs.push({ label: key, type: "model" });
            }
          });
          const all = [
            ...brandMatches.map(b => ({ label: b, type: "brand" })),
            ...modelSuggs.slice(0, 5),
          ];
          setSuggestions(all);
          setShowSugg(all.length > 0);
        })
        .catch(() => {
          const all = brandMatches.map(b => ({ label: b, type: "brand" }));
          setSuggestions(all);
          setShowSugg(all.length > 0);
        });
    }, 220);
  };

  const selectSuggestion = (val) => {
    clearTimeout(debounceRef.current);
    setSearch(val);
    setSuggestions([]);
    setShowSugg(false);
    setPage(1);
  };

  const fetch = useCallback(() => {
    setLoading(true);
    const params = { status: "approved", page, per_page: 12 };
    if (search)              params.search        = search;
    if (brand  !== "Toutes") params.brand         = brand;
    if (fuel   !== "Tous")   params.fuel_type     = fuel;
    if (trans  !== "Toutes") params.transmission  = trans;
    if (cond   !== "Tous")   params.car_condition = cond;
    if (maxPrice < 1000000)  params.max_price     = maxPrice;
    if (minYear  > 2000)     params.min_year      = minYear;
    if (maxYear  < CURRENT_YEAR) params.max_year  = maxYear;
    if (sort === "price-asc")  { params.sort = "price";      params.dir = "asc"; }
    if (sort === "price-desc") { params.sort = "price";      params.dir = "desc"; }
    if (sort === "year")       { params.sort = "model_year"; params.dir = "desc"; }

    axiosClient.get("/annonces", { params })
      .then(res => {
        setCars(res.data.data);
        setTotal(res.data.total);
        setLastPage(res.data.last_page);
      })
      .catch(() => setCars([]))
      .finally(() => setLoading(false));
  }, [search, brand, fuel, trans, cond, maxPrice, minYear, maxYear, sort, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const reset = () => {
    setSearch(""); setBrand("Toutes"); setFuel("Tous"); setTrans("Toutes");
    setCond("Tous"); setMaxPrice(1000000); setMinYear(2000);
    setMaxYear(CURRENT_YEAR); setSort("recent"); setPage(1);
  };

  const Sel = ({ label, opts, val, set }) => (
    <div style={{ marginBottom: 16 }}>
      <label className="form-label">{label}</label>
      <select value={val} onChange={e => { set(e.target.value); setPage(1); }} className="select-field">
        {opts.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div style={{ background: "var(--bg-white)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "var(--bg-off)", borderBottom: "1px solid var(--border)", padding: "32px 0" }}>
        <div className="container">
          <h1 style={{ margin: "0 0 16px" }}>Parcourir les annonces</h1>
          <form onSubmit={e => { e.preventDefault(); setShowSugg(false); setPage(1); fetch(); }}
            style={{ display: "flex", gap: 0, maxWidth: 540, position: "relative" }}
            ref={inputWrapRef}>
            <input
              type="text"
              value={search}
              onChange={e => handleSearchInput(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSugg(true)}
              placeholder="Marque, modèle, titre…"
              className="input-field"
              style={{ flex: 1, fontSize: 15, borderRight: "none" }}
              autoComplete="off"
            />
            <button type="submit" className="btn-primary" style={{ width: 48, padding: 0, flexShrink: 0 }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/>
              </svg>
            </button>

            {showSugg && suggestions.length > 0 && (
              <div style={{
                position: "absolute", top: "100%", left: 0,
                width: "calc(100% - 48px)",
                background: "var(--bg-white)",
                border: "1px solid var(--border)",
                borderTop: "none",
                zIndex: 100,
                boxShadow: "var(--shadow-2)",
              }}>
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    onMouseDown={() => selectSuggestion(s.label)}
                    style={{
                      padding: "10px 14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      borderBottom: i < suggestions.length - 1 ? "1px solid var(--border)" : "none",
                      fontSize: 14,
                      color: "var(--text-primary)",
                    }}
                    onMouseOver={e => e.currentTarget.style.background = "var(--bg-off)"}
                    onMouseOut={e => e.currentTarget.style.background = "transparent"}
                  >
                    <svg width="14" height="14" fill="none" stroke="var(--text-faint)" strokeWidth={2} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                      {s.type === "brand"
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        : <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/>
                      }
                    </svg>
                    <span style={{ flex: 1 }}>{s.label}</span>
                    {s.type === "brand" && (
                      <span style={{ fontSize: 11, color: "var(--text-faint)", background: "var(--bg-off)", padding: "2px 6px", border: "1px solid var(--border)" }}>
                        Marque
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 60, display: "grid", gridTemplateColumns: "220px 1fr", gap: 32, alignItems: "start" }}>
        {/* Sidebar */}
        <aside style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "24px 20px", position: "sticky", top: 100, boxShadow: "var(--shadow-xs)" }}>
          <h4 style={{ margin: "0 0 20px", fontSize: 16 }}>Filtres</h4>
          <Sel label="Marque" opts={BRANDS} val={brand} set={setBrand} />
          <Sel label="Carburant" opts={FUELS} val={fuel} set={setFuel} />
          <Sel label="Boîte" opts={TRANS} val={trans} set={setTrans} />
          <Sel label="État" opts={CONDS} val={cond} set={setCond} />

          <div style={{ marginBottom: 16 }}>
            <label className="form-label">
              Prix max : <strong style={{ color: "var(--accent-blue)" }}>
                {maxPrice === 1000000 ? "Tous" : Number(maxPrice).toLocaleString("fr-MA") + " MAD"}
              </strong>
            </label>
            <input type="range" min={0} max={1000000} step={10000} value={maxPrice}
              onChange={e => { setMaxPrice(+e.target.value); setPage(1); }}
              style={{ width: "100%", accentColor: "var(--accent-blue)", cursor: "pointer" }} />
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-faint)", fontSize: 11, marginTop: 4 }}>
              <span>0</span><span>1 000 000</span>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="form-label">Année : {minYear} – {maxYear}</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="number" min={1990} max={maxYear} value={minYear}
                onChange={e => { setMinYear(+e.target.value); setPage(1); }}
                className="input-field" style={{ fontSize: 13, padding: "6px 8px", width: "50%" }} />
              <input type="number" min={minYear} max={CURRENT_YEAR} value={maxYear}
                onChange={e => { setMaxYear(+e.target.value); setPage(1); }}
                className="input-field" style={{ fontSize: 13, padding: "6px 8px", width: "50%" }} />
            </div>
          </div>

          <button onClick={reset}
            style={{ background: "none", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-muted)", fontFamily: "Manrope,sans-serif", fontSize: 13, fontWeight: 600, padding: "9px 16px", cursor: "pointer", width: "100%", transition: "border-color 0.15s, color 0.15s" }}
            onMouseOver={e => { e.currentTarget.style.borderColor = "var(--accent-blue)"; e.currentTarget.style.color = "var(--accent-blue)"; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}>
            Réinitialiser
          </button>
        </aside>

        {/* Results */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14 }}>
              {loading ? "Chargement…" : `${total} véhicule(s) trouvé(s)`}
            </p>
            <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
              className="select-field" style={{ width: "auto", height: 44, padding: "0 40px 0 12px", fontSize: 14 }}>
              <option value="recent">Plus récents</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="year">Année</option>
            </select>
          </div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 20 }}>
              {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : cars.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--bg-off)" }}>
              <p style={{ color: "var(--text-muted)", fontSize: 17, fontWeight: 600, margin: "0 0 8px" }}>Aucun véhicule trouvé</p>
              <p style={{ color: "var(--text-faint)", fontSize: 14, margin: 0 }}>Modifiez vos filtres</p>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 20 }}>
                {cars.map(car => <CarCard key={car.id} car={car} isFav={favIds.has(car.id)} onToggleFav={handleToggleFav} />)}
              </div>

              {lastPage > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 40 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    style={{ padding: "9px 20px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", background: "none", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1, fontFamily: "Manrope,sans-serif", fontSize: 13, fontWeight: 600, transition: "border-color 0.15s, color 0.15s" }}
                    onMouseOver={e => { if (page !== 1) { e.currentTarget.style.borderColor = "var(--accent-blue)"; e.currentTarget.style.color = "var(--accent-blue)"; }}}
                    onMouseOut={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "inherit"; }}>
                    ← Précédent
                  </button>
                  <span style={{ fontSize: 13, color: "var(--text-faint)", padding: "0 12px" }}>
                    {page} / {lastPage}
                  </span>
                  <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage}
                    style={{ padding: "9px 20px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", background: "none", cursor: page === lastPage ? "not-allowed" : "pointer", opacity: page === lastPage ? 0.4 : 1, fontFamily: "Manrope,sans-serif", fontSize: 13, fontWeight: 600, transition: "border-color 0.15s, color 0.15s" }}
                    onMouseOver={e => { if (page !== lastPage) { e.currentTarget.style.borderColor = "var(--accent-blue)"; e.currentTarget.style.color = "var(--accent-blue)"; }}}
                    onMouseOut={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "inherit"; }}>
                    Suivant →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
