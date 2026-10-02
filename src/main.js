import "./style.css";

const root = document.documentElement;

// Menu mobile
const menu = document.querySelector("[data-menu]");
const nav = document.getElementById("nav");
if (menu && nav) {
  const close = () => { nav.classList.remove("is-open"); menu.setAttribute("aria-expanded", "false"); };
  menu.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    menu.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

// Avant / après du navigateur de morceaux
document.querySelectorAll(".deck").forEach((deck) => {
  const tabs = deck.querySelectorAll("[data-show]");
  tabs.forEach((tab) => tab.addEventListener("click", () => {
    deck.dataset.state = tab.dataset.show;
    tabs.forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
  }));
});

// Tarifs : le rail s'ouvre centré sur la formule recommandée
const rail = document.querySelector("[data-plans]");
const featured = rail?.querySelector("[data-featured]");
if (rail && featured) {
  const center = () => { rail.scrollLeft = featured.offsetLeft - rail.offsetLeft - (rail.clientWidth - featured.offsetWidth) / 2; };
  center();
  window.addEventListener("load", center);
}

document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

// Animations et scène 3D : seulement si l'utilisateur n'a pas réduit les animations.
// Sans elles (ou si la WebGL échoue), la page reste complète en version statique.
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduced) {
  import("./motion.js").then(({ initMotion }) => initMotion()).catch(() => root.classList.remove("js"));
  const stage = document.querySelector("[data-stage]");
  const webgl = (() => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; } })();
  if (stage && webgl) {
    Promise.all([import("./stage.js"), import("./content.js")])
      .then(([{ initStage }, { setArc }]) => {
        root.classList.add("webgl"); // la scène doit être affichée pour être mesurée
        if (!initStage(stage, setArc)) root.classList.remove("webgl");
      })
      .catch(() => root.classList.remove("webgl"));
  }
}
