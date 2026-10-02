// Contenu du site — c'est le seul fichier à modifier pour changer le nom, l'email,
// les liens de paiement, le contenu des packs ou les relevés de consommation.
// Relancer `npm run dev` après modification (il est lu au démarrage).

export const site = {
  brand: "Ai4Dj",
  email: "contact@exemple.fr", // à remplacer

  // Liens des boutons d'offre.
  // - free : téléchargement direct du pack gratuit (fichier dans public/packs/).
  // - pro, complete : liens de paiement Polar (Products → ton produit → Checkout Link).
  //   Tant qu'un lien est vide, le bouton s'affiche « Bientôt disponible », désactivé.
  checkout: {
    free: "/packs/crate-cleanup.skill",
    pro: "",
    complete: "",
  },
};

// Les skills. `summary` s'affiche dans les cartes de tarifs ; `items` détaille la skill. `tier` = pack minimum qui l'inclut
// (0 = Gratuit, 1 = Pro, 2 = Complet).
export const groups = [
  {
    name: "Nettoyer",
    skill: "crate-cleanup",
    summary: "Renommage, tags et crédits vérifiés",
    tier: 0,
    items: [
      "Fichiers renommés « Artiste - Titre »",
      "Tags réécrits : artiste, titre, genre, année",
      "Label ajouté en commentaire",
      "Crédits vérifiés en ligne",
      "Nom de crate proposé",
    ],
  },
  {
    name: "Préciser",
    skill: "crate-precision",
    summary: "Sous-genre Beatport, tonalité, énergie",
    tier: 1,
    items: [
      "Sous-genre selon la taxonomie Beatport",
      "Sous-genres DnB : Neurofunk, Rollers…",
      "Tonalité Beatport en notation Camelot",
      "Comparatif clé Beatport / Rekordbox",
      "Énergie de 1 à 5 ★ mesurée sur l'audio",
    ],
  },
  {
    name: "Colorer",
    skill: "crate-color",
    summary: "Rôles couleur posés dans Rekordbox",
    tier: 1,
    items: [
      "7 rôles couleur, de l'ouverture au peak",
      "Couleurs posées dans Rekordbox par Claude",
      "Rôles et couleurs personnalisables",
    ],
  },
  {
    name: "Migrer",
    skill: "crate-migration",
    summary: "Playlists recréées sur SoundCloud",
    tier: 2,
    items: [
      "Spotify, YouTube, Deezer, Apple Music → SoundCloud",
      "Tracklist copiée-collée → playlist",
      "Nouvel essai sur les morceaux introuvables",
    ],
  },
  {
    name: "Inclus",
    skill: null,
    items: [
      ["Mises à jour des skills du pack", 0],
      ["Nouvelles skills à leur sortie", 2],
    ],
  },
];

export const plans = [
  { id: "free", tier: 0, name: "Gratuit", price: "0 €", once: false, tagline: "Pour essayer sur ton prochain dossier de téléchargements.", cta: "Télécharger" },
  { id: "pro", tier: 1, name: "Pro", price: "19 €", once: true, featured: true, tagline: "La préparation complète d'un crate, du dossier brut aux couleurs.", cta: "Acheter Pro · 19 €" },
  { id: "complete", tier: 2, name: "Complet", price: "39 €", once: true, tagline: "Tout, plus les skills à venir.", cta: "Acheter Complet · 39 €" },
];

// Relevés réels de consommation. Tant que `rows` est vide, la section n'est PAS publiée :
// on n'affiche jamais de chiffres estimés.
// Pour chaque passage, relève la durée et l'usage dans Claude (Paramètres → Usage),
// et dépose les captures dans public/preuves/.
export const usage = {
  context: "Crate de test : 20 morceaux · abonnement Claude Pro",
  date: "", // ex. "2 octobre 2026"
  rows: [
    // { skill: "crate-cleanup", duration: "4 min", tokens: "…", share: "…" },
  ],
  total: null, // { duration: "…", tokens: "…", share: "…" }
  screenshots: [
    // { src: "/preuves/avant.png", caption: "Avant le passage" },
    // { src: "/preuves/apres.png", caption: "Après le passage" },
  ],
};

// Visuel du hero : l'énergie d'un set de 2 h, un morceau par barre.
// Lettre = rôle (O Openers, M Mainteners, B Booster, P Pivot, G Groove Reset, A Anthems, K Peak Time),
// chiffre = énergie en étoiles.
export const setArc =
  "O1 O1 O2 O2 M2 M2 M3 M2 M3 B3 B3 B4 M3 B4 A4 B4 P3 M3 B4 A4 A5 K5 K5 A5 G2 G2 M3 B3 B4 A4 K5 K5 A5 K5 G3 M3 B4 A5 K5 K5 A4 M3 O2 O1";

// Argument « exhaustivité » : les styles que crate-precision sait reconnaître
// (taxonomie Beatport + extensions drum & bass). Sert au bandeau défilant de la section Styles.
export const styleCount = { genres: 36, subgenres: 80 };
export const styles = [
  ["Liquid", "Jump Up", "Jungle", "Neurofunk", "Rollers", "Dancefloor DnB", "Halftime", "Drumfunk", "UK Garage", "Bassline", "2-Step", "Speed Garage", "Grime", "Dubstep", "Melodic Dubstep", "Breaks", "UK Bass", "Juke / Footwork", "Jersey Club", "UK Funky", "Bass House"],
  ["House", "Deep House", "Tech House", "Acid", "Soulful", "Funky House", "Jackin House", "Progressive House", "Organic House", "Afro House", "Amapiano", "3Step", "Melodic House", "Melodic Techno", "Minimal", "Deep Tech", "Nu Disco", "Italo", "Indie Dance", "Dark Disco", "Electro", "Downtempo", "Ambient"],
  ["Peak Time Techno", "Driving", "Raw", "Hypnotic", "Dub Techno", "EBM", "Hard Techno", "Uplifting Trance", "Tech Trance", "Progressive Trance", "Psy-Trance", "Goa Trance", "Full-On", "Big Room", "Future House", "Future Rave", "Hardstyle", "Frenchcore", "Neo Rave", "Trap", "Moombahton", "Guaracha", "Carioca Funk"],
];
