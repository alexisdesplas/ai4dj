# Site Ai4Dj

Site vitrine en **Vite + Tailwind CSS v4**, direction artistique de style suisse (noir et blanc, Inter Tight en grand, filets, aucun arrondi ; la couleur est réservée aux rôles). Pages statiques générées au build ; les paiements et la livraison passent par Polar.

## Commandes

```bash
npm install
npm run dev      # serveur local
npm run build    # site prêt à publier dans dist/
```

## Où modifier quoi

| Fichier | Contenu |
|---|---|
| `src/content.js` | **Le seul fichier à toucher au quotidien** : nom, email, liens Polar, contenu des packs, relevés de consommation, séquence du visuel du hero |
| `index.html` | Page d'accueil (textes des sections) |
| `mentions-legales.html`, `cgv.html`, `confidentialite.html` | Pages légales — champs surlignés à compléter |
| `merci.html` | Page de retour après achat (URL de succès Polar) |
| `src/style.css` | Couleurs (clair/sombre), typo, composants (boutons, libellés…) |
| `vite.config.js` | Génération au build : en-tête, pied de page, cartes de tarifs, visuel du hero, section consommation |

Après une modification de `src/content.js`, relancer `npm run dev`.

## Mise en route

1. **Polar** : crée 3 produits en paiement unique (Gratuit 0 €, Pro 19 €, Complet 39 €) avec les fichiers `.skill` en « File Downloads », URL de succès `https://ton-domaine.fr/merci.html`. Colle les Checkout Links dans `src/content.js` → `site.checkout`. Sans lien, les boutons des cartes affichent « Bientôt disponible ».
2. **Consommation** : la section n'apparaît que lorsque `usage.rows` contient de vrais relevés. Dépose les captures dans `public/preuves/`.
3. **Pages légales** : remplace les champs `À COMPLÉTER` et l'email.
4. **Mise en ligne** : `npm run build`, puis publie `dist/` (Netlify, Vercel, Cloudflare Pages…).
