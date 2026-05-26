import { Link } from "react-router-dom";

function PageShell({ category, title, subtitle, children }) {
  return (
    <div style={{ background: "var(--bg-white)", minHeight: "100vh", paddingBottom: 80 }}>
      <div style={{ background: "var(--bg-dark)", padding: "60px 0 52px" }}>
        <div className="container">
          <p style={{ color: "var(--accent-blue)", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>{category}</p>
          <h1 style={{ color: "#fff", margin: "0 0 12px" }}>{title}</h1>
          {subtitle && <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, margin: 0, maxWidth: 520 }}>{subtitle}</p>}
        </div>
      </div>
      <div className="container" style={{ paddingTop: 56, maxWidth: 860 }}>
        {children}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      {title && <h3 style={{ fontSize: 18, margin: "0 0 14px", paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>{title}</h3>}
      <div style={{ color: "var(--text-muted)", fontSize: 14.5, lineHeight: "24px" }}>{children}</div>
    </div>
  );
}

/* ── À propos ─────────────────────────────────────────────── */
export function About() {
  return (
    <PageShell category="Plateforme" title="À propos d'ocazz.ma" subtitle="La plateforme marocaine de référence pour l'achat et la vente de véhicules d'occasion.">
      <Section>
        <p>ocazz.ma est né d'un constat simple : acheter ou vendre une voiture d'occasion au Maroc devait devenir plus simple, plus transparent et plus sûr. Notre mission est de mettre en relation acheteurs et vendeurs sérieux grâce à une plateforme moderne, fiable et gratuite.</p>
      </Section>
      <Section title="Notre mission">
        <p>Nous croyons que chaque Marocain mérite d'accéder à un marché automobile honnête. C'est pourquoi toutes nos annonces sont vérifiées manuellement, nos prix sont analysés par notre moteur IA, et notre messagerie intégrée protège les deux parties.</p>
      </Section>
      <Section title="Nos chiffres">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 16, marginTop: 8 }}>
          {[["12 000+", "Annonces actives"], ["50 000+", "Utilisateurs inscrits"], ["48 h", "Délai moyen de vente"], ["98 %", "Taux de satisfaction"]].map(([v, l]) => (
            <div key={l} style={{ padding: "20px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", textAlign: "center", boxShadow: "var(--shadow-xs)" }}>
              <p style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 26, color: "var(--accent-blue)", margin: "0 0 4px" }}>{v}</p>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>{l}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Contact">
        <p>Pour toute question, écrivez-nous à <a href="mailto:contact@ocazz.ma" style={{ color: "var(--accent-blue)", fontWeight: 600 }}>contact@ocazz.ma</a> ou appelez-nous au <a href="tel:+212522480000" style={{ color: "var(--accent-blue)", fontWeight: 600 }}>+212 5 22 48 00 00</a>.</p>
      </Section>
    </PageShell>
  );
}

/* ── Comment ça marche ────────────────────────────────────── */
export function HowItWorks() {
  const steps = [
    { n: "01", title: "Créez votre compte", desc: "Inscrivez-vous gratuitement en moins d'une minute avec votre email. Votre compte vous donne accès à la messagerie, à la publication d'annonces et à l'historique de vos transactions." },
    { n: "02", title: "Parcourez ou publiez", desc: "Acheteur : filtrez par marque, budget, kilométrage et ville pour trouver le véhicule idéal. Vendeur : remplissez le formulaire de dépôt en 3 minutes avec les caractéristiques de votre voiture." },
    { n: "03", title: "Contactez via la messagerie", desc: "Échangez directement et en toute sécurité avec le vendeur (ou l'acheteur) via notre messagerie intégrée. Pas besoin de divulguer votre numéro de téléphone." },
    { n: "04", title: "Finalisez la transaction", desc: "Convenez d'un rendez-vous pour l'inspection du véhicule et finalisez la vente. Pour la carte grise et l'assurance, consultez nos guides dans le Centre d'aide." },
  ];
  return (
    <PageShell category="Plateforme" title="Comment ça marche" subtitle="Achetez ou vendez votre voiture en 4 étapes simples.">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {steps.map(({ n, title, desc }) => (
          <div key={n} style={{ display: "flex", gap: 24, padding: "28px 28px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-xs)", alignItems: "flex-start" }}>
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 32, color: "rgba(37,99,235,0.15)", lineHeight: 1, flexShrink: 0, minWidth: 48 }}>{n}</div>
            <div>
              <h4 style={{ margin: "0 0 8px", fontSize: 17 }}>{title}</h4>
              <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", lineHeight: "22px" }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

/* ── Espace revendeur ─────────────────────────────────────── */
export function EspaceRevendeur() {
  return (
    <PageShell category="Plateforme" title="Espace revendeur" subtitle="Vous êtes professionnel de l'automobile ? Diffusez votre stock sur ocazz.ma.">
      <Section>
        <p>ocazz.ma propose une offre dédiée aux concessionnaires, marchands de voitures et loueurs souhaitant exposer leur parc automobile à des milliers d'acheteurs qualifiés chaque jour.</p>
      </Section>
      <Section title="Avantages revendeur">
        <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
          {["Publication en masse de votre stock", "Badge « Professionnel » sur vos annonces", "Tableau de bord dédié avec statistiques de vues", "Mise en avant prioritaire dans les résultats", "Support dédié par email et téléphone"].map(a => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </Section>
      <Section title="Contactez notre équipe commerciale">
        <p>Pour en savoir plus sur nos offres professionnelles ou demander une démo :</p>
        <p style={{ marginTop: 8 }}>
          <a href="mailto:pro@ocazz.ma" style={{ color: "var(--accent-blue)", fontWeight: 600, fontSize: 15 }}>pro@ocazz.ma</a>
          {" · "}
          <a href="tel:+212522480001" style={{ color: "var(--accent-blue)", fontWeight: 600, fontSize: 15 }}>+212 5 22 48 00 01</a>
        </p>
      </Section>
    </PageShell>
  );
}

/* ── Conditions d'utilisation ─────────────────────────────── */
export function Conditions() {
  return (
    <PageShell category="Légal" title="Conditions d'utilisation" subtitle="Dernière mise à jour : janvier 2025">
      <Section title="1. Acceptation des conditions">
        <p>En accédant à ocazz.ma, vous acceptez d'être lié par les présentes conditions. Si vous n'acceptez pas ces conditions, n'utilisez pas la plateforme.</p>
      </Section>
      <Section title="2. Description du service">
        <p>ocazz.ma est une plateforme de mise en relation entre acheteurs et vendeurs de véhicules d'occasion au Maroc. ocazz.ma n'est pas partie prenante des transactions entre utilisateurs et ne garantit pas la qualité, la sécurité ou la légalité des véhicules proposés.</p>
      </Section>
      <Section title="3. Compte utilisateur">
        <p>Vous êtes responsable de la confidentialité de vos identifiants. Vous vous engagez à fournir des informations exactes lors de l'inscription et à ne pas créer plusieurs comptes.</p>
      </Section>
      <Section title="4. Publication d'annonces">
        <p>Tout utilisateur peut publier gratuitement une annonce. Les annonces doivent décrire fidèlement le véhicule. Sont interdits : les doublons, les prix abusifs, les photos trompeuses et tout contenu illicite. ocazz.ma se réserve le droit de supprimer toute annonce ne respectant pas ces règles.</p>
      </Section>
      <Section title="5. Responsabilité">
        <p>ocazz.ma ne peut être tenu responsable des dommages directs ou indirects résultant de l'utilisation de la plateforme ou des transactions entre utilisateurs.</p>
      </Section>
      <Section title="6. Contact">
        <p>Pour toute question relative à ces conditions : <a href="mailto:legal@ocazz.ma" style={{ color: "var(--accent-blue)", fontWeight: 600 }}>legal@ocazz.ma</a></p>
      </Section>
    </PageShell>
  );
}

/* ── Politique de confidentialité ────────────────────────── */
export function Confidentialite() {
  return (
    <PageShell category="Légal" title="Politique de confidentialité" subtitle="Dernière mise à jour : janvier 2025">
      <Section title="1. Données collectées">
        <p>Nous collectons les données que vous nous fournissez lors de l'inscription (nom, email, téléphone), lors de la publication d'annonces (informations sur le véhicule), et automatiquement lors de la navigation (adresse IP, pages visitées, durée de visite).</p>
      </Section>
      <Section title="2. Utilisation des données">
        <p>Vos données sont utilisées pour : gérer votre compte, publier et afficher vos annonces, vous contacter en cas de besoin, améliorer nos services et prévenir la fraude. Nous ne vendons jamais vos données à des tiers.</p>
      </Section>
      <Section title="3. Conservation">
        <p>Vos données sont conservées aussi longtemps que votre compte est actif. Après suppression du compte, les données sont effacées sous 30 jours, sauf obligation légale de conservation.</p>
      </Section>
      <Section title="4. Vos droits">
        <p>Conformément à la loi 09-08 relative à la protection des données personnelles au Maroc, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Exercez ces droits à : <a href="mailto:privacy@ocazz.ma" style={{ color: "var(--accent-blue)", fontWeight: 600 }}>privacy@ocazz.ma</a></p>
      </Section>
      <Section title="5. Sécurité">
        <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, altération ou divulgation.</p>
      </Section>
    </PageShell>
  );
}

/* ── Centre d'aide ────────────────────────────────────────── */
export function CentreAide() {
  const topics = [
    { icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", title: "Mon compte", items: ["Créer un compte", "Modifier mes informations", "Changer mon mot de passe", "Supprimer mon compte"] },
    { icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", title: "Annonces", items: ["Publier une annonce", "Modifier une annonce", "Supprimer une annonce", "Délai de validation"] },
    { icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", title: "Messagerie", items: ["Envoyer un message", "Voir mes conversations", "Notifications de messages"] },
    { icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", title: "Estimation IA", items: ["Comment fonctionne l'IA", "Précision de l'estimation", "Facteurs pris en compte"] },
  ];
  return (
    <PageShell category="Support" title="Centre d'aide" subtitle="Trouvez rapidement une réponse à votre question.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 20, marginBottom: 48 }}>
        {topics.map(({ icon, title, items }) => (
          <div key={title} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "24px", boxShadow: "var(--shadow-xs)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, background: "rgba(37,99,235,0.08)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" fill="none" stroke="var(--accent-blue)" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d={icon}/></svg>
              </div>
              <h4 style={{ margin: 0, fontSize: 16 }}>{title}</h4>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map(item => (
                <li key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--text-muted)" }}>
                  <div style={{ width: 4, height: 4, background: "var(--accent-blue)", borderRadius: "50%", flexShrink: 0 }}/>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ padding: "28px 32px", background: "var(--bg-off)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <p style={{ margin: "0 0 4px", fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 15 }}>Vous avez encore besoin d'aide ?</p>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>Notre équipe répond sous 24 h ouvrables.</p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="mailto:support@ocazz.ma" className="btn-primary" style={{ height: 42, lineHeight: "42px", padding: "0 24px", fontSize: 13 }}>support@ocazz.ma</a>
          <a href="tel:+212522480000" className="btn-outline" style={{ height: 42, lineHeight: "42px", padding: "0 24px", fontSize: 13 }}>+212 5 22 48 00 00</a>
        </div>
      </div>
    </PageShell>
  );
}

/* ── Blog ─────────────────────────────────────────────────── */
export function Blog() {
  return (
    <PageShell category="Plateforme" title="Blog" subtitle="Conseils, actualités et guides pour l'achat et la vente de voitures au Maroc.">
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <div style={{ width: 64, height: 64, background: "rgba(37,99,235,0.08)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="28" height="28" fill="none" stroke="var(--accent-blue)" viewBox="0 0 24 24" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
        </div>
        <h3 style={{ margin: "0 0 10px" }}>Bientôt disponible</h3>
        <p style={{ color: "var(--text-muted)", fontSize: 15, maxWidth: 400, margin: "0 auto 28px" }}>Notre blog avec des guides d'achat, des comparatifs et des conseils pour le marché auto marocain arrive très prochainement.</p>
        <Link to="/contact" className="btn-outline" style={{ height: 44, lineHeight: "44px", padding: "0 28px" }}>Me notifier au lancement</Link>
      </div>
    </PageShell>
  );
}
