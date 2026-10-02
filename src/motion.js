// Animations d'interface : défilement fluide, entrées du hero, révélations au scroll,
// boutons magnétiques, curseur. Chargé seulement si l'utilisateur accepte les animations.
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
const root = document.documentElement;
const finePointer = window.matchMedia("(pointer: fine)").matches;

export function initMotion() {
  // ---- Défilement fluide, synchronisé avec ScrollTrigger
  const lenis = new Lenis({ duration: 1.15, anchors: { offset: -72 } });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // En-tête : se range au scroll vers le bas, revient au scroll vers le haut
  const header = document.querySelector("header");
  lenis.on("scroll", ({ scroll, direction }) => {
    header?.classList.toggle("is-hidden", direction === 1 && scroll > 240 && !document.getElementById("nav")?.classList.contains("is-open"));
  });

  // ---- Hero : lignes du titre qui montent, puis le reste en cascade
  const intro = gsap.timeline({ defaults: { ease: "expo.out", duration: 1.3 }, delay: 0.1 });
  intro
    .fromTo(".hero-line > span", { yPercent: 108, autoAlpha: 1 }, { yPercent: 0, stagger: 0.12 })
    .fromTo("[data-hero-fade]", { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 1.1 }, "-=0.9")
    .to(".hero-bars > span", { scaleY: 1, duration: 1.1, stagger: 0.012 }, "-=0.8");

  // ---- Titres de section : mot à mot, au rythme du scroll
  document.querySelectorAll("h2.t-title, [data-words]").forEach((el) => {
    if (el.closest("[data-cap]")) return;
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = words.map((w) => `<span class="word" aria-hidden="true">${w}</span>`).join(" ");
    gsap.fromTo(el.querySelectorAll(".word"), { opacity: 0.12 }, {
      opacity: 1, stagger: 0.06, ease: "none",
      scrollTrigger: { trigger: el, start: "top 88%", end: "top 48%", scrub: 0.6 },
    });
  });

  // ---- Blocs : montée douce en cascade à l'entrée
  gsap.set("[data-reveal]", { y: 36, autoAlpha: 0 });
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 90%",
    once: true,
    onEnter: (batch) => gsap.to(batch, { y: 0, autoAlpha: 1, duration: 1.1, ease: "expo.out", stagger: 0.08 }),
  });

  // Traits des rôles qui se dessinent
  gsap.fromTo(".role-swatch", { scaleX: 0 }, {
    scaleX: 1, transformOrigin: "left center", duration: 1.2, ease: "expo.out", stagger: 0.07,
    scrollTrigger: { trigger: "#roles ul", start: "top 85%" },
  });

  if (!finePointer) return;

  // ---- Boutons magnétiques
  document.querySelectorAll(".btn:not(.is-disabled), .icon-btn").forEach((btn) => {
    const xTo = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3.out" });
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.22);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
    });
    btn.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
  });

  // ---- Curseur : point qui suit, anneau sur les éléments cliquables
  const cursor = document.createElement("div");
  cursor.className = "cursor";
  cursor.setAttribute("aria-hidden", "true");
  document.body.appendChild(cursor);
  root.classList.add("has-cursor");
  const cx = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3.out" });
  const cy = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3.out" });
  window.addEventListener("pointermove", (e) => { cx(e.clientX); cy(e.clientY); cursor.classList.add("is-on"); }, { passive: true });
  document.addEventListener("pointerleave", () => cursor.classList.remove("is-on"));
  document.addEventListener("pointerover", (e) => {
    cursor.classList.toggle("is-link", !!e.target.closest("a, button, summary, [role=tab]"));
  });
}
