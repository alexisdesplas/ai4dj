// Hero en une seule séquence : un champ de particules (shader) qui devient le graphique du set.
//   au chargement : la poussière (dossier de téléchargements) se range en vinyle, un sillon par morceau ;
//   au scroll     : le vinyle se déroule et chaque particule se pose sur la barre de son morceau,
//                   exactement là où le graphique HTML l'attend ; le graphique prend alors le relais.
import {
  WebGLRenderer, Scene, PerspectiveCamera, BufferGeometry, BufferAttribute, ShaderMaterial,
  Points, Color, Vector3, AdditiveBlending, NormalBlending, MathUtils,
} from "three";

const ROLE = { O: "#ff5fa2", M: "#19bccb", B: "#3d6bff", P: "#f2c500", G: "#27b85a", A: "#ff8a1a", K: "#f03232" };
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };

const VERT = /* glsl */ `
  attribute vec3 aChaos;   // position normalisée dans le nuage
  attribute vec3 aDisc;    // (rayon normalisé, angle, épaisseur)
  attribute vec3 aLine;    // position finale sur la barre, en unités monde
  attribute vec3 aColor;
  attribute vec4 aRand;    // (retard, taille, phase, rang du morceau 0..1)
  uniform float uTime, uP1, uP2, uSpin, uTilt, uRo, uSize, uDist, uDust;
  uniform vec3 uCenter, uInk;
  varying vec3 vColor;
  varying float vAlpha;
  const float PI = 3.14159265;

  float ease(float t) { return t * t * (3.0 - 2.0 * t); }

  void main() {
    float t1 = ease(clamp((uP1 - aRand.x * 0.45) / 0.55, 0.0, 1.0));
    // Le déroulé part du premier morceau (sillon extérieur) vers le dernier.
    float t2 = ease(clamp((uP2 - aRand.w * 0.5 - aRand.x * 0.08) / 0.42, 0.0, 1.0));

    float ph = aRand.z * 2.0 * PI;
    vec3 chaos = uCenter + aChaos * uRo * 1.25
      + vec3(sin(uTime * 0.31 + ph), cos(uTime * 0.27 + ph * 1.3), sin(uTime * 0.21 + ph * 0.7)) * uRo * 0.09;

    float ang = aDisc.y + uSpin;
    float r = aDisc.x * uRo * (1.0 + 0.014 * sin(uTime * 2.2 + aRand.w * 42.0));
    vec3 d = vec3(cos(ang) * r, aDisc.z * uRo, sin(ang) * r);
    float c = cos(uTilt), s = sin(uTilt);
    vec3 disc = uCenter + vec3(d.x, d.y * c - d.z * s, d.y * s + d.z * c);

    vec3 pos = mix(chaos, disc, t1);
    pos += vec3(sin(ph * 3.0), cos(ph * 2.0), sin(ph * 5.0)) * sin(t1 * PI) * uRo * 0.25;
    pos = mix(pos, aLine, t2);
    float arc = sin(t2 * PI);
    pos.z += arc * (0.4 + aRand.y * 1.2);
    pos.x += arc * sin(ph) * uRo * 0.16;
    pos.y += arc * cos(ph * 1.7) * uRo * 0.1;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * mix(0.65, 1.5, aRand.y) * mix(1.25, 1.0, t1) * (uDist / -mv.z);

    vColor = mix(uInk, aColor, smoothstep(0.3, 1.0, t1));
    vAlpha = mix(uDust, 1.0, smoothstep(0.1, 0.9, t1));
  }
`;

const FRAG = /* glsl */ `
  uniform float uAlpha, uFade;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.18, d) * vAlpha * uAlpha * uFade;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

export function initStage(stage, arc) {
  const canvas = stage.querySelector("canvas");
  const sticky = stage.querySelector(".hero-sticky");
  const text = stage.querySelector("[data-hero-text]");
  const panel = stage.querySelector("[data-panel]");
  const deck = stage.querySelector("[data-deck]");
  const barsEl = stage.querySelector(".hero-bars");
  if (!canvas || !sticky || !text || !panel || !barsEl) return false;
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
  } catch {
    return false;
  }
  const dpr = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(dpr);

  const mobile = window.matchMedia("(max-width: 767px)").matches;
  const DIST = 10;
  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, DIST);

  // ---- Données : les particules sont réparties entre les morceaux selon leur énergie
  let seed = 11;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const tracks = arc.split(" ").map((t) => ({ color: new Color(ROLE[t[0]]), e: +t[1] }));
  const T = tracks.length;
  const TOTAL = mobile ? 14000 : 36000;
  const sum = tracks.reduce((s, t) => s + t.e, 0);
  const counts = tracks.map((t) => Math.max(60, Math.round((TOTAL * t.e) / sum)));
  const N = counts.reduce((a, b) => a + b, 0);

  const aChaos = new Float32Array(N * 3), aDisc = new Float32Array(N * 3), aLine = new Float32Array(N * 3);
  const aColor = new Float32Array(N * 3), aRand = new Float32Array(N * 4);
  // Place de chaque particule dans sa barre : (morceau, demi-barre, x relatif, y relatif)
  const pTrack = new Uint16Array(N), pSub = new Uint8Array(N), pRx = new Float32Array(N), pRy = new Float32Array(N);
  const R_IN = 0.34, ringW = (1 - R_IN) / T;
  let k = 0;
  tracks.forEach((t, i) => {
    for (let j = 0; j < counts[i]; j++, k++) {
      const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, rr = Math.pow(rnd(), 0.45), q = Math.sqrt(1 - u * u);
      aChaos.set([q * Math.cos(th) * rr * 1.3, u * rr * 0.6, q * Math.sin(th) * rr * 0.9], k * 3);
      aDisc.set([1 - (i + 0.14 + rnd() * 0.72) * ringW, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.012], k * 3);
      aColor.set([t.color.r, t.color.g, t.color.b], k * 3);
      aRand.set([rnd(), rnd(), rnd(), i / (T - 1)], k * 4);
      pTrack[k] = i; pSub[k] = rnd() < 0.5 ? 0 : 1; pRx[k] = rnd(); pRy[k] = rnd();
    }
  });

  const geometry = new BufferGeometry();
  const lineAttr = new BufferAttribute(aLine, 3);
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(N * 3), 3));
  geometry.setAttribute("aChaos", new BufferAttribute(aChaos, 3));
  geometry.setAttribute("aDisc", new BufferAttribute(aDisc, 3));
  geometry.setAttribute("aLine", lineAttr);
  geometry.setAttribute("aColor", new BufferAttribute(aColor, 3));
  geometry.setAttribute("aRand", new BufferAttribute(aRand, 4));

  const uniforms = {
    uTime: { value: 0 }, uP1: { value: 0 }, uP2: { value: 0 }, uSpin: { value: 0 }, uTilt: { value: 0.62 },
    uRo: { value: 1 }, uSize: { value: dpr * (mobile ? 2.0 : 2.3) }, uDist: { value: DIST },
    uAlpha: { value: 0.92 }, uFade: { value: 1 }, uDust: { value: 0.5 },
    uCenter: { value: new Vector3() }, uInk: { value: new Color("#0d0d0d") },
  };
  const material = new ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, depthTest: false, depthWrite: false });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  // ---- Thème : encre et mode de fusion (lumière additive sur fond sombre)
  const applyTheme = () => {
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    uniforms.uInk.value.set(dark ? "#efefef" : "#0a0a0a");
    uniforms.uAlpha.value = dark ? 0.5 : 0.92;
    uniforms.uDust.value = dark ? 0.1 : 0.5; // en fusion additive, la poussière blanche sature vite
    material.blending = dark ? AdditiveBlending : NormalBlending;
    material.needsUpdate = true;
  };
  applyTheme();
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);

  // ---- Mise en page : le vinyle sous le texte ; les barres calées au pixel sur le graphique HTML
  const layout = () => {
    const w = sticky.clientWidth, h = sticky.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const visH = 2 * DIST * Math.tan(MathUtils.degToRad(camera.fov / 2));
    const px = visH / h; // unités monde par pixel, dans le plan z = 0

    const textBottom = text.offsetTop + text.offsetHeight;
    const avail = Math.max(120, h - textBottom);
    const roPx = Math.min(w * (mobile ? 0.46 : 0.33), Math.max(avail * 0.85, w * 0.2));
    uniforms.uRo.value = roPx * px;
    uniforms.uCenter.value.set(0, (h / 2 - (textBottom + 28 + roPx * 0.6)) * px, 0);

    const sr = sticky.getBoundingClientRect(), br = barsEl.getBoundingClientRect();
    const spans = [...barsEl.children].filter((el) => el.offsetWidth > 0).map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left - sr.left, w: r.width, h: (parseFloat(el.style.height) / 100) * br.height };
    });
    if (!spans.length) return;
    const per = Math.max(1, Math.round(spans.length / T));
    const bottom = br.bottom - sr.top;
    for (let n = 0; n < N; n++) {
      const sp = spans[Math.min(spans.length - 1, pTrack[n] * per + (per > 1 ? pSub[n] : 0))];
      aLine[n * 3] = (sp.x + pRx[n] * sp.w - w / 2) * px;
      aLine[n * 3 + 1] = (h / 2 - (bottom - pRy[n] * sp.h)) * px;
      aLine[n * 3 + 2] = 0;
    }
    lineAttr.needsUpdate = true;
  };
  let layoutTimer = 0;
  const relayout = () => { clearTimeout(layoutTimer); layoutTimer = setTimeout(layout, 80); };
  new ResizeObserver(relayout).observe(sticky);
  window.addEventListener("load", layout);
  document.fonts?.ready.then(layout);
  layout();

  // ---- Boucle
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  window.addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  const show = (el, o, y = 0) => {
    el.style.opacity = o.toFixed(3);
    el.style.visibility = o < 0.01 ? "hidden" : "visible";
    if (y) el.style.transform = `translate3d(0, ${(y * (1 - o)).toFixed(1)}px, 0)`;
  };

  let p = 0, last = performance.now(), running = false, raf = 0, born = 0;

  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    if (!born) born = now;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const r = stage.getBoundingClientRect();
    const target = clamp01(-r.top / Math.max(1, r.height - window.innerHeight));
    p += (target - p) * Math.min(1, dt * 5);

    const p2 = smooth(0.14, 0.86, p);
    uniforms.uTime.value = now / 1000;
    uniforms.uP1.value = Math.max(smooth(350, 2600, now - born), p2); // rangement à l'arrivée sur la page
    uniforms.uP2.value = p2;
    uniforms.uSpin.value += dt * 0.32;
    uniforms.uTilt.value = 0.62 + Math.sin(now / 2600) * 0.04;
    uniforms.uFade.value = 1 - smooth(0.93, 1, p);

    // La parallaxe s'éteint à mesure que les particules doivent tomber pile sur le graphique.
    mouse.sx += (mouse.x - mouse.sx) * 0.05;
    mouse.sy += (mouse.y - mouse.sy) * 0.05;
    const loose = 1 - smooth(0.2, 0.7, p);
    camera.position.set(mouse.sx * 0.4 * loose, -mouse.sy * 0.25 * loose, DIST);
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);

    // Le texte reste net : il quitte l'écran par le haut, à la vitesse du scroll, sans fondu.
    // Puis le graphique HTML prend le relais des particules.
    const gone = Math.max(0, -r.top);
    const out = gone > text.offsetTop + text.offsetHeight + 40;
    text.style.transform = `translate3d(0, ${(-gone).toFixed(1)}px, 0)`;
    text.style.visibility = out ? "hidden" : "visible";
    show(panel, smooth(0.42, 0.72, p));
    show(barsEl, smooth(0.9, 0.98, p));
    if (deck) show(deck, smooth(0.84, 0.98, p), 28);
  };

  // Ne calcule que quand la scène est à l'écran et l'onglet visible.
  let inView = false;
  const sync = () => {
    const should = inView && !document.hidden;
    if (should && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
    if (!should && running) { running = false; cancelAnimationFrame(raf); }
  };
  new IntersectionObserver(([en]) => { inView = en.isIntersecting; sync(); }, { rootMargin: "100px" }).observe(stage);
  document.addEventListener("visibilitychange", sync);
  return true;
}
