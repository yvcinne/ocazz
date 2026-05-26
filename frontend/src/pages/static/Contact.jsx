import { useState } from "react";

const INFO = [
  {
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    label: "Email",
    value: "support@ocazz.ma",
    href: "mailto:support@ocazz.ma",
  },
  {
    icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
    label: "Téléphone",
    value: "+212 5 22 48 00 00",
    href: "tel:+212522480000",
  },
  {
    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
    label: "Adresse",
    value: "123 Boulevard Mohammed V, Casablanca 20000, Maroc",
    href: null,
  },
  {
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    label: "Horaires",
    value: "Lun – Ven : 9h – 18h  |  Sam : 9h – 13h",
    href: null,
  },
];

export default function Contact() {
  const [form, setForm]   = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent]   = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = e => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div style={{ background: "var(--bg-white)", minHeight: "100vh", paddingBottom: 80 }}>
      {/* Hero */}
      <div style={{ background: "var(--bg-dark)", padding: "60px 0 52px" }}>
        <div className="container">
          <p style={{ color: "var(--accent-blue)", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>Support</p>
          <h1 style={{ color: "#fff", margin: "0 0 12px" }}>Contactez-nous</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, margin: 0, maxWidth: 480 }}>
            Notre équipe est disponible pour répondre à toutes vos questions.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 60 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 48, alignItems: "start" }} className="contact-grid">

          {/* Info cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {INFO.map(({ icon, label, value, href }) => (
              <div key={label} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "20px 24px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--bg-white)", boxShadow: "var(--shadow-xs)" }}>
                <div style={{ width: 44, height: 44, background: "rgba(37,99,235,0.08)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="20" height="20" fill="none" stroke="var(--accent-blue)" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={icon}/>
                  </svg>
                </div>
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-faint)" }}>{label}</p>
                  {href
                    ? <a href={href} style={{ fontSize: 14, fontWeight: 600, color: "var(--accent-blue)", textDecoration: "none" }}>{value}</a>
                    : <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", lineHeight: "21px" }}>{value}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "36px 32px", boxShadow: "var(--shadow-sm)" }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ width: 56, height: 56, background: "rgba(16,185,129,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg width="26" height="26" fill="none" stroke="var(--success)" viewBox="0 0 24 24" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                </div>
                <h3 style={{ margin: "0 0 8px" }}>Message envoyé !</h3>
                <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>Nous vous répondrons dans les 24 heures ouvrables.</p>
              </div>
            ) : (
              <>
                <h3 style={{ margin: "0 0 24px", fontSize: 20 }}>Envoyer un message</h3>
                <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label className="form-label">Nom</label>
                      <input name="name" required value={form.name} onChange={handle} placeholder="Votre nom" className="input-field"/>
                    </div>
                    <div>
                      <label className="form-label">Email</label>
                      <input name="email" type="email" required value={form.email} onChange={handle} placeholder="votre@email.com" className="input-field"/>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Sujet</label>
                    <input name="subject" required value={form.subject} onChange={handle} placeholder="Comment pouvons-nous vous aider ?" className="input-field"/>
                  </div>
                  <div>
                    <label className="form-label">Message</label>
                    <textarea name="message" required value={form.message} onChange={handle} placeholder="Décrivez votre demande…" className="textarea-field" style={{ minHeight: 130 }}/>
                  </div>
                  <button type="submit" className="btn-primary" style={{ alignSelf: "flex-start", padding: "0 32px" }}>Envoyer</button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      <style>{`@media(max-width:767px){.contact-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
}
