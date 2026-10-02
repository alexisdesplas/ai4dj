import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { site, groups, plans, usage, setArc, styles, styleCount } from "./src/content.js";

const root = fileURLToPath(new URL(".", import.meta.url));
// Sur GitHub Pages, le site vit sous /nom-du-depot/ : BASE_PATH le précise au build.
const base = process.env.BASE_PATH || "/";
const pages = ["index", "merci", "mentions-legales", "cgv", "confidentialite"];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const header = (home) => {
  const href = (id) => (home ? `#${id}` : `/#${id}`);
  const links = [
    ["fonctionnement", "Fonctionnement"],
    ["styles", "Styles"],
    ["roles", "Rôles"],
    ...(usage.rows.length ? [["consommation", "Consommation"]] : []),
    ["tarifs", "Tarifs"],
    ["faq", "FAQ"],
  ];
  return `<header class="sticky top-0 z-50 border-b border-fg bg-bg">
  <div class="wrap flex h-14 items-center justify-between gap-4">
    <a href="/" class="brand" aria-label="${esc(site.brand)} — accueil">${esc(site.brand)}<span>Skills Claude pour DJ</span></a>
    <div class="flex items-center gap-3">
      <nav id="nav" aria-label="Navigation principale" class="nav-panel">
        ${links.map(([id, l]) => `<a class="nav-link" href="${href(id)}">${l}</a>`).join("")}
        <a class="btn btn-primary btn-sm" href="${href("tarifs")}">Télécharger</a>
      </nav>
      <button type="button" class="icon-btn md:hidden" data-menu aria-expanded="false" aria-controls="nav" aria-label="Ouvrir le menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 9h14M5 15h14" stroke-linecap="square"/></svg>
      </button>
    </div>
  </div>
</header>`;
};

const footer = () => `<footer class="footer">
  <div class="wrap">
    <div class="grid gap-y-8 lg:grid-cols-12 lg:gap-x-6">
      <p class="lg:col-span-5">${esc(site.brand)}<br><span class="text-faint">Skills Claude pour préparer tes crates.</span></p>
      <nav class="flex flex-col gap-1.5 lg:col-span-3" aria-label="Plan du site">
        <a class="link-quiet" href="/#fonctionnement">Fonctionnement</a>
        <a class="link-quiet" href="/#styles">Styles</a>
        <a class="link-quiet" href="/#roles">Rôles</a>
        <a class="link-quiet" href="/#tarifs">Tarifs</a>
        <a class="link-quiet" href="/#faq">FAQ</a>
      </nav>
      <nav class="flex flex-col gap-1.5 lg:col-span-2" aria-label="Liens légaux">
        <a class="link-quiet" href="/mentions-legales.html">Mentions légales</a>
        <a class="link-quiet" href="/cgv.html">CGV</a>
        <a class="link-quiet" href="/confidentialite.html">Confidentialité</a>
      </nav>
      <p class="lg:col-span-2"><a class="link" href="mailto:${esc(site.email)}">${esc(site.email)}</a></p>
    </div>
    <p class="mt-14 max-w-[720px] border-t border-hairline pt-4 text-faint">© <span data-year>2026</span> ${esc(site.brand)}. Projet indépendant, non affilié à Anthropic, AlphaTheta (Rekordbox), Beatport ou SoundCloud. Claude est une marque d'Anthropic ; Rekordbox est une marque d'AlphaTheta Corporation.</p>
  </div>
</footer>`;

const buyButton = (id, label, variant) => {
  const url = site.checkout[id];
  if (!url) return `<span class="btn ${variant} w-full is-disabled" aria-disabled="true">Bientôt disponible</span>`;
  const local = url.startsWith("/"); // fichier servi par le site : téléchargement direct
  return `<a class="btn ${variant} w-full" href="${esc(url)}"${local ? " download" : ' rel="noopener"'}>${esc(label)}</a>`;
};

// Tarifs : trois colonnes séparées par des filets, la formule recommandée en bloc inversé.
const renderPlans = () =>
  plans
    .map((p) => {
      const rows = [
        ...groups.filter((g) => g.skill).map((g) => ({ on: p.tier >= g.tier, title: g.name, sub: g.summary })),
        { on: p.tier >= 2, title: "Futures skills", sub: "Ajoutées au pack à leur sortie" },
      ];
      const list = rows
        .map((r) => `<li class="${r.on ? "" : "off"}"><span aria-hidden="true">${r.on ? "✓" : "—"}</span><span>${r.title}<small>${esc(r.sub)}</small><span class="sr-only">${r.on ? " — inclus" : " — non inclus"}</span></span></li>`)
        .join("");
      return `<article data-reveal ${p.featured ? "data-featured " : ""}class="plan${p.featured ? " accent-theme lg:!px-8" : ""}">
        <div class="plan-head"><h3>${p.name}</h3>${p.featured ? `<span>Recommandé</span>` : ""}</div>
        <p class="plan-price"><span>${p.price}</span>${p.once ? `<span>une fois</span>` : ""}</p>
        <p class="plan-tagline">${esc(p.tagline)}</p>
        <ul class="plan-list">${list}</ul>
        <div class="plan-cta">${buyButton(p.id, p.cta, p.featured ? "btn-primary" : "btn-secondary")}</div>
      </article>`;
    })
    .join("");

const renderUsage = () => {
  if (!usage.rows.length) return "";
  const row = (cells, cls = "") =>
    `<tr class="${cls}">${cells
      .map((c, i) => `<td class="border-b border-fg py-4 ${i ? "text-right tabular-nums" : ""}">${esc(c)}</td>`)
      .join("")}</tr>`;
  return `<section id="consommation" class="section">
  <div class="wrap">
    <div class="section-grid">
      <p class="label">Consommation</p>
      <div>
        <h2 class="t-title">Ce que ça consomme sur ton forfait Claude.</h2>
        <p class="lead">Les skills s'exécutent dans ton propre Claude : chaque passage utilise ton quota d'usage. Voici les relevés réels sur un crate de test, captures à l'appui.</p>
      </div>
    </div>
    <div class="section-body overflow-x-auto">
      <table class="t-body w-full min-w-[520px]">
        <thead><tr>${["Passage", "Durée", "Tokens", "Part d'une session"]
          .map((h, i) => `<th scope="col" class="t-control border-t border-b border-fg py-3 ${i ? "text-right" : "text-left"}">${h}</th>`)
          .join("")}</tr></thead>
        <tbody>${usage.rows.map((r) => row([r.skill, r.duration, r.tokens, r.share])).join("")}
        ${usage.total ? row(["Crate complet", usage.total.duration, usage.total.tokens, usage.total.share], "t-label") : ""}</tbody>
      </table>
    </div>
    <p class="note">${esc(usage.context)}${usage.date ? ` · relevé le ${esc(usage.date)}` : ""}</p>
    ${usage.screenshots.length ? `<div class="section-body grid gap-4 sm:grid-cols-2">${usage.screenshots
      .map((s) => `<figure><img class="w-full border border-fg" src="${esc(s.src)}" alt="${esc(s.caption)} — relevé d'usage Claude" loading="lazy"><figcaption class="t-small mt-2">${esc(s.caption)}</figcaption></figure>`)
      .join("")}</div>` : ""}
  </div>
</section>`;
};


const ROLE_CLASS = {
  O: "bg-role-openers", M: "bg-role-mainteners", B: "bg-role-booster", P: "bg-role-pivot",
  G: "bg-role-reset", A: "bg-role-anthems", K: "bg-role-peak",
};
// Deux barres par morceau (une seule sous 640 px), légère variation pour l'effet forme d'onde.
const renderArc = () => {
  let seed = 7;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  return setArc.split(" ").flatMap((t) => {
    const e = +t[1];
    return [0, 1].map((k) => {
      const h = Math.min(100, ((26 + e * 44 + (rnd() - 0.5) * 22) / 256) * 100).toFixed(1);
      return `<span class="min-w-0 flex-1 ${ROLE_CLASS[t[0]]}${k ? " max-sm:hidden" : ""}" style="height:${h}%"></span>`;
    });
  }).join("");
};

// Bandeau défilant des styles : chaque rangée est doublée pour boucler sans couture.
const renderStyles = () =>
  styles
    .map((row, i) => {
      const items = row.map((n) => `<li>${esc(n)}</li>`).join("");
      return `<div class="marquee${i % 2 ? " marquee-reverse" : ""}"><ul class="marquee-track">${items}</ul><ul class="marquee-track" aria-hidden="true">${items}</ul></div>`;
    })
    .join("");

const content = () => ({
  name: "ai4dj-content",
  transformIndexHtml(html, ctx) {
    const home = ctx.path === "/" || ctx.path.endsWith("/index.html");
    let n = 0;
    return html
      .replace("<!--@header-->", header(home))
      .replace("<!--@footer-->", footer())
      .replace("<!--@plans-->", renderPlans())
      .replace("<!--@usage-->", renderUsage())
      .replace("<!--@styles-->", renderStyles())
      .replaceAll("{{genres}}", String(styleCount.genres))
      .replaceAll("{{subgenres}}", String(styleCount.subgenres))
      .replace("<!--@arc-->", renderArc())
      .replace("<!--@arc-count-->", String(setArc.split(" ").length))
      // Raccourci vers un paiement hors des cartes (hero, CTA) : sans lien Polar, renvoie aux tarifs.
      .replace(/<!--@checkout:(\w+):([^>]*?)-->/g, (_, id, label) =>
        `<a class="btn btn-primary" href="${esc(site.checkout[id] || (home ? "#tarifs" : "/#tarifs"))}"${(site.checkout[id] || "").startsWith("/") ? " download" : ""}>${esc(label)}</a>`)
      .replaceAll("{{brand}}", esc(site.brand))
      .replaceAll("{{email}}", esc(site.email))
      // Numérote les sections dans l'ordre réel (la section Consommation peut être absente).
      .replace(/<span class="num">\d+<\/span>/g, () => `<span class="num">${String(++n).padStart(2, "0")}</span>`)
      // Liens internes : préfixés par la base du site.
      .replace(/(<a\b[^>]*?\shref=")\/(?!\/)/g, `$1${base}`);
  },
});

export default defineConfig({
  base,
  plugins: [tailwindcss(), content()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((p) => [p, `${root}${p}.html`])),
    },
  },
});
