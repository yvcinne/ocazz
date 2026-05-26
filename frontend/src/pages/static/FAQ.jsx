import { useState } from "react";

const ITEMS = [
  {
    q: "Comment publier une annonce ?",
    a: "Créez un compte gratuit, puis cliquez sur « Vendre une voiture » dans la barre de navigation. Remplissez les informations de votre véhicule (marque, modèle, année, kilométrage, prix…) et soumettez. Votre annonce sera vérifiée et publiée sous 24 h.",
  },
  {
    q: "La publication d'une annonce est-elle gratuite ?",
    a: "Oui, la publication d'une annonce est entièrement gratuite sur ocazz.ma. Aucune commission n'est prélevée sur la vente.",
  },
  {
    q: "Comment contacter un vendeur ?",
    a: "Sur la page de l'annonce, utilisez le formulaire « Envoyer un message » ou cliquez sur « Contacter le vendeur ». Vous accéderez à la messagerie intégrée où vous pouvez échanger directement avec le vendeur.",
  },
  {
    q: "Comment fonctionne l'estimation de prix par IA ?",
    a: "Notre moteur de Machine Learning analyse des milliers de transactions marocaines récentes en tenant compte de la marque, du modèle, de l'année, du kilométrage, du carburant, de la boîte de vitesse et de la ville. Il vous donne une fourchette de prix de marché en quelques secondes.",
  },
  {
    q: "Les annonces sont-elles vérifiées ?",
    a: "Chaque annonce est examinée manuellement par notre équipe avant publication pour s'assurer de l'exactitude des informations et filtrer les contenus frauduleux ou inappropriés.",
  },
  {
    q: "Comment modifier ou supprimer mon annonce ?",
    a: "Connectez-vous, accédez à votre tableau de bord et sélectionnez l'annonce à modifier ou supprimer. Les modifications sont répercutées immédiatement.",
  },
  {
    q: "Comment signaler une annonce suspecte ?",
    a: "Contactez-nous directement via le formulaire de contact ou par email à support@ocazz.ma en indiquant le lien de l'annonce concernée. Notre équipe traitera votre signalement sous 48 h.",
  },
  {
    q: "Comment supprimer mon compte ?",
    a: "Envoyez une demande à support@ocazz.ma depuis l'adresse email associée à votre compte. Votre compte et toutes vos données seront supprimés dans un délai de 7 jours ouvrables.",
  },
];

function Item({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden", transition: "box-shadow 0.2s", boxShadow: open ? "var(--shadow-sm)" : "none" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", padding: "18px 22px", background: open ? "var(--bg-off)" : "var(--bg-white)", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, textAlign: "left", transition: "background 0.15s" }}
      >
        <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{q}</span>
        <svg width="18" height="18" fill="none" stroke="var(--text-faint)" viewBox="0 0 24 24" strokeWidth={2.2} style={{ flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      {open && (
        <div style={{ padding: "0 22px 20px", background: "var(--bg-off)" }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: "22px", color: "var(--text-muted)" }}>{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <div style={{ background: "var(--bg-white)", minHeight: "100vh", paddingBottom: 80 }}>
      <div style={{ background: "var(--bg-dark)", padding: "60px 0 52px" }}>
        <div className="container">
          <p style={{ color: "var(--accent-blue)", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>Support</p>
          <h1 style={{ color: "#fff", margin: "0 0 12px" }}>Questions fréquentes</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, margin: 0 }}>Tout ce que vous devez savoir sur ocazz.ma.</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 60, maxWidth: 780 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ITEMS.map(item => <Item key={item.q} {...item} />)}
        </div>
        <div style={{ marginTop: 48, padding: "28px 32px", background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: "var(--radius-md)", display: "flex", gap: 20, alignItems: "center" }}>
          <div>
            <p style={{ margin: "0 0 4px", fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 15 }}>Vous n'avez pas trouvé votre réponse ?</p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>Notre équipe est disponible par email à <a href="mailto:support@ocazz.ma" style={{ color: "var(--accent-blue)", fontWeight: 600, textDecoration: "none" }}>support@ocazz.ma</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
