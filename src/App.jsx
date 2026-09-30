import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import logo from "./assets/logo.jpg";
import introVideo from "./assets/videos/intro.mp4";
import introPoster from "./assets/videos/intro-poster.jpg";
import packVideo from "./assets/videos/pack.mp4";
import packPoster from "./assets/videos/pack-poster.jpg";

/* ==========================================================================
   PHOTOS — chargées automatiquement depuis les dossiers.
   Il suffit de déposer vos images dans :
     src/assets/realisations/   -> galerie « Nos Réalisations »
     src/assets/buffets/        -> galerie « Buffets » (nom : 10-sale.jpg, 11-sucre.jpg, 12-grillades.jpg)
   Aucune modification de code n'est nécessaire.
   ========================================================================== */
const collect = (mods) =>
  Object.entries(mods)
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([path, url]) => ({ url, name: path.split("/").pop().replace(/\.[^.]+$/, "") }));

const REALISATIONS = collect(
  import.meta.glob("./assets/realisations/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}", { eager: true, query: "?url", import: "default" })
);

const BUFFETS = collect(
  import.meta.glob("./assets/buffets/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}", { eager: true, query: "?url", import: "default" })
).map((img) => ({ ...img, cat: (img.name.match(/^\d+-(.+)$/) || [])[1]?.toLowerCase() || "autres" }));

const PACK_IMAGES = collect(
  import.meta.glob("./assets/pack/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}", { eager: true, query: "?url", import: "default" })
).reduce((acc, img) => {
  const key = img.name.toLowerCase();
  acc[key] = img.url;
  return acc;
}, {});

const BUFFET_TABS = [
  { id: "all", label: "Tout" },
  { id: "entree", label: "Entrée" },
  { id: "plat", label: "Plat Principal" },
  { id: "dessert", label: "Dessert" },
].filter((t) => t.id === "all" || BUFFETS.some((b) => b.cat === t.id));

/* ==========================================================================
   CONTENU
   ========================================================================== */
const PHONE = "212602618924"; // numéro utilisé pour le lien WhatsApp et l'appel
const PHONE_LABEL = "+212 7 12 65 59 12"; // numéro affiché à l'écran (à vérifier : différent de PHONE ci-dessus)
const ADDRESS = "Bab elkhamis, à côté école Campus / Taroudant, Maroc";
const LAT_LNG = "30.47628,-8.87742";
const WA_TEXT = encodeURIComponent("Bonjour UniEvent, je souhaite un devis pour mon événement.");

const MARQUEE_WORDS = ["Mariage", "Fiançailles", "Aqiqa", "Anniversaire", "Henné"];

const DOT_SECTIONS = [
  { id: "intro", title: "Notre savoir-faire" },
  { id: "choix", title: "Nos Réalisations" },
  { id: "pack", title: "Pack Alahlam" },
  { id: "buffets", title: "Buffets" },
  { id: "reviews", title: "Avis Clients" },
  { id: "comment", title: "Comment ça marche" },
  { id: "contact", title: "Contact" },
];

const NAV_LINKS = [
  { href: "#choix", label: "Galerie" },
  { href: "#pack", label: "Pack Alahlam" },
  { href: "#buffets", label: "Buffets" },
  { href: "#reviews", label: "Avis" },
  { href: "#contact", label: "Contact" },
];

const VALUES = [
  { icon: "spark", title: "Sur mesure", text: "Chaque prestation est composée selon votre événement." },
  { icon: "table", title: "Mise en table & buffets", text: "Dressage soigné, cuisine marocaine préparée le jour même." },
  { icon: "check", title: "Du dressage au service", text: "Nous nous occupons de tout, le jour J." },
];

const PACK_ITEMS = [
  { image: "logo", title: "Décoration" },
  { image: "tangaft", title: "Tangaft" },
  { image: "orchestration", title: "Orchestration" },
  { image: "cakedesign", title: "Cake Design" },
  { image: "photographe", title: "Photographe" },
  { image: "makeupartist", title: "Makeup Artist" },
  { image: "dakka", title: "Dakka" },
    { image: "interdit", title: "فرقة منع التصوير" },
];

const STEPS = [
  { n: "01", title: "Choisissez", text: "Parcourez nos univers et trouvez celui qui correspond à votre événement." },
  { n: "02", title: "Contactez-nous", text: "Appelez-nous ou écrivez sur WhatsApp avec votre date et le nombre d'invités." },
  { n: "03", title: "Profitez", text: "Nous nous occupons de tout, du dressage au service, le jour J." },
];

const FOOD_CHIPS = [
  "Salades", "Jus", "Gâteaux marocains", "Thé", "Bastilla", "Tajines", "Poulet",
  "Grillades", "Viandes", "Couscous", "Poisson", "Fruits", "Glaces",
];

const REVIEWS = [
  { name: "فاطمة وأحمد", event: "عرس", text: "خدمة ماعليها! الفريق حولو عرسنا لذكرى ما ننساها. التزيين كان رائع والخدمة ممتازة.", rating: 5 },
  { name: "سارة م.", event: "خطوبة", text: "احترافية واهتمام بالتفاصيل. الضيوف كانوا مبسوطين بجودة البوفيه وجمال الديكور.", rating: 5 },
  { name: "كريم ب.", event: "عيد ميلاد", text: "كاترينغ ممتاز للمناسبة العائلية. الأكل كان لذيذ والناس كانوا محترمين.", rating: 4 },
  { name: "نور الدين", event: "عرس", text: "تجربة رائعة من البداية للنهاية. كلشي كان منظم ومضبوط.", rating: 5 },
  { name: "مريم وعمر", event: "عقيقة", text: "شكراً جزيلاً على العقيقة. كلشي كان على أحسن ما يرام.", rating: 5 },
  { name: "ياسين", event: "حفلة", text: "خدمة ممتازة وأكل لذيذ. ننصح بهم بشدة.", rating: 5 },
  { name: "زينب", event: "خطوبة", text: "الديكور كان جميل جداً والأكل كان لذيذ. شكراً لكم.", rating: 4 },
  { name: "عبد الله", event: "عرس", text: "أفضل كاترينغ تعاملت معهم. كلشي كان مثالي.", rating: 5 },
  { name: "خديجة", event: "عيد ميلاد", text: "تجربة رائعة. الأطفال كانوا مبسوطين والكل كان سعيد.", rating: 5 },
  { name: "محمد", event: "حفلة تخرج", text: "خدمة محترفة واهتمام بالتفاصيل. شكراً لكم.", rating: 4 },
  { name: "أمينة", event: "عرس", text: "كلشي كان على أحسن ما يرام. ننصح بهم.", rating: 5 },
  { name: "حميد", event: "خطوبة", text: "تجربة ممتازة. سنعاود التعامل معهم.", rating: 5 },
];

/* ==========================================================================
   PETITS OUTILS
   ========================================================================== */
const ICONS = {
  play: { d: "M8 5v14l11-7z" },
  pause: { d: "M6 5h4v14H6zM14 5h4v14h-4z" },
  volume: { d: "M3 9v6h4l5 5V4L7 9H3zm11-1.2v8.4a4.5 4.5 0 0 0 0-8.4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z" },
  mute: { d: "M3 9v6h4l5 5V4L7 9H3zm13.6 3-2.4-2.4 1.4-1.4 2.4 2.4 2.4-2.4 1.4 1.4-2.4 2.4 2.4 2.4-1.4 1.4-2.4-2.4-2.4 2.4-1.4-1.4z" },
  expand: { d: "M4 4h6v2H6v4H4V4zm10 0h6v6h-2V6h-4V4zM4 14h2v4h4v2H4v-6zm14 0h2v4h-4v2h6v-6z" },
  left: { d: "M15 5l-7 7 7 7", stroke: true },
  spark: { d: "M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z" },
  table: { d: "M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3c-2 2-3 5-3 8h3v10", stroke: true },
  check: { d: "M4 12l5 5L20 6", stroke: true },
  phone: { d: "M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11 11 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.6 3.6a1 1 0 0 1-.25 1z" },
  pin: { d: "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z", stroke: true },
  right: { d: "M9 5l7 7-7 7", stroke: true },
  close: { d: "M5 5l14 14M19 5L5 19", stroke: true },
  wa: { d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" },
};

function Icon({ name, size = 22 }) {
  const i = ICONS[name];
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      fill={i.stroke ? "none" : "currentColor"}
      stroke={i.stroke ? "currentColor" : "none"}
      strokeWidth={i.stroke ? 2.2 : 0}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={i.d} />
    </svg>
  );
}

/** Apparition au scroll. Fonctionne aussi pour les éléments ajoutés plus tard. */
function Reveal({ as: Tag = "div", className = "", delay = 0, variant = "", children, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return setShown(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref}
      className={`reveal ${variant} ${shown ? "in" : ""} ${className}`}
      style={{ "--d": `${delay}s` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function SectionHead({ ar, title, text, light }) {
  return (
    <Reveal className={`section-head${light ? " light" : ""}`}>
      <div className="eyebrow ar">{ar}</div>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </Reveal>
  );
}

function CustomCursor() {
  const ref = useRef(null);
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = ref.current;
    document.documentElement.classList.add("has-cursor");
    el.style.display = "block";
    const move = (e) => {
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      el.classList.toggle("hover", !!e.target.closest?.("a, button, .photo, input"));
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);
  return (
    <div className="custom-cursor" ref={ref} style={{ display: "none" }}>
      <span />
    </div>
  );
}

function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      ref.current.style.transform = `scaleX(${h > 0 ? Math.min(window.scrollY / h, 1) : 0})`;
    };
    const onScroll = () => !raf && (raf = requestAnimationFrame(update));
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="progress-bar" ref={ref} />;
}

/* ==========================================================================
   VIDÉO D'INTRO — boucle muette, compatible mobile (iOS / Android)
   ========================================================================== */
function LoopVideo({ src, poster }) {
  const ref = useRef(null);
  const [blocked, setBlocked] = useState(false);

  const tryPlay = useCallback(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true; // React ne pose pas toujours l'attribut « muted » : on le force
    v.defaultMuted = true;
    v.setAttribute("playsinline", "");
    const p = v.play();
    if (p && p.then) p.then(() => setBlocked(false)).catch(() => setBlocked(true));
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    tryPlay();
    if (!("IntersectionObserver" in window)) return;
    // on ne lit la vidéo que lorsqu'elle est visible (économie de batterie/data sur mobile)
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? tryPlay() : v.pause()),
      { threshold: 0.25 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [tryPlay]);

  return (
    <div className="intro-video">
      <video
        ref={ref}
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        controlsList="nodownload noremoteplayback"
      />
      {blocked && (
        <button className="pv-big" onClick={tryPlay} aria-label="Lancer la vidéo">
          <span><Icon name="play" size={30} /></span>
        </button>
      )}
    </div>
  );
}

/* ==========================================================================
   LECTEUR VIDÉO DU PACK — avec son, lecture / pause, barre de progression
   ========================================================================== */
const fmt = (s) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");

function PackPlayer({ src, poster }) {
  const wrap = useRef(null);
  const vid = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [started, setStarted] = useState(false);

  const toggle = () => {
    const v = vid.current;
    if (!v) return;
    if (!v.paused && !v.ended) return v.pause();
    if (v.ended) v.currentTime = 0;
    v.muted = muted;
    const p = v.play();
    if (p && p.catch) {
      p.catch(() => {
        // certains navigateurs refusent le son : on relance en muet, l'utilisateur peut réactiver le son
        v.muted = true;
        setMuted(true);
        v.play().catch(() => {});
      });
    }
  };

  const toggleMute = () => {
    const v = vid.current;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const seek = (e) => {
    const v = vid.current;
    if (v && duration) v.currentTime = (Number(e.target.value) / 100) * duration;
  };

  const fullscreen = () => {
    const v = vid.current;
    const w = wrap.current;
    if (document.fullscreenElement) return document.exitFullscreen();
    if (w.requestFullscreen) w.requestFullscreen().catch(() => {});
    else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen(); // iPhone
  };

  // met en pause quand la vidéo sort de l'écran
  useEffect(() => {
    const v = vid.current;
    if (!v || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => !e.isIntersecting && v.pause(), { threshold: 0.15 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const pct = duration ? (time / duration) * 100 : 0;

  return (
    <div className="pack-video" ref={wrap}>
      <video
        ref={vid}
        src={src}
        poster={poster}
        playsInline
        preload="metadata"
        onClick={toggle}
        onPlay={() => { setPlaying(true); setStarted(true); }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />

      {!playing && (
        <button className="pv-big" onClick={toggle} aria-label="Lire la vidéo">
          <span><Icon name="play" size={32} /></span>
          {!started && <em>Regarder avec le son</em>}
        </button>
      )}

      <div className="pv-controls">
        <button className="pv-btn" onClick={toggle} aria-label={playing ? "Pause" : "Lecture"}>
          <Icon name={playing ? "pause" : "play"} size={18} />
        </button>
        <span className="pv-time">{fmt(time)}</span>
        <input
          className="pv-range"
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={pct}
          onChange={seek}
          aria-label="Progression de la vidéo"
          style={{ "--p": `${pct}%` }}
        />
        <span className="pv-time">{fmt(duration)}</span>
        <button className="pv-btn" onClick={toggleMute} aria-label={muted ? "Activer le son" : "Couper le son"}>
          <Icon name={muted ? "mute" : "volume"} size={18} />
        </button>
        <button className="pv-btn" onClick={fullscreen} aria-label="Plein écran">
          <Icon name="expand" size={16} />
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   LIGHTBOX — visionneuse plein écran (flèches, clavier, glissement tactile)
   ========================================================================== */
function Lightbox({ images, index, onIndex, onClose }) {
  const touchX = useRef(null);
  const n = images.length;
  const prev = () => onIndex((index - 1 + n) % n);
  const next = () => onIndex((index + 1) % n);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // précharge les images voisines
  useEffect(() => {
    [1, -1].forEach((d) => { new Image().src = images[(index + d + n) % n].url; });
  }, [index, images, n]);

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
      }}
    >
      <button className="lb-btn lb-close" onClick={onClose} aria-label="Fermer"><Icon name="close" /></button>
      {n > 1 && (
        <button className="lb-btn lb-prev" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Précédent">
          <Icon name="left" />
        </button>
      )}
      <img key={images[index].url} src={images[index].url} alt={`Photo ${index + 1} sur ${n}`} onClick={(e) => e.stopPropagation()} />
      {n > 1 && (
        <button className="lb-btn lb-next" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Suivant">
          <Icon name="right" />
        </button>
      )}
      <div className="lb-count">{index + 1} / {n}</div>
    </div>
  );
}

function QuoteForm() {
  const [f, setF] = useState({ name: "", type: "Mariage", date: "", guests: "" });
  const set = (k) => (e) => setF((o) => ({ ...o, [k]: e.target.value }));
  const send = (e) => {
    e.preventDefault();
    const msg = `Bonjour UniEvent, je souhaite un devis.\nNom : ${f.name}\nÉvénement : ${f.type}\nDate : ${f.date || "à définir"}\nInvités : ${f.guests || "à définir"}`;
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  };
  return (
    <Reveal as="form" className="quote" onSubmit={send}>
      <h3>Demande de devis</h3>
      <label>Nom<input required value={f.name} onChange={set("name")} autoComplete="name" /></label>
      <label>Type d'événement
        <select value={f.type} onChange={set("type")}>
          {["Mariage", "Fiançailles", "Aqiqa", "Anniversaire", "Henné"].map((t) => <option key={t}>{t}</option>)}
        </select>
      </label>
      <label>Date prévue<input type="date" value={f.date} onChange={set("date")} /></label>
      <label>Nombre d'invités<input type="number" min="1" inputMode="numeric" value={f.guests} onChange={set("guests")} /></label>
      <button className="btn" type="submit">Envoyer sur WhatsApp</button>
    </Reveal>
  );
}

/* ==========================================================================
   APP
   ========================================================================== */
export default function App() {
  const [opened, setOpened] = useState(false);
  const [closing, setClosing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState("intro");
  const [showAllReal, setShowAllReal] = useState(false);
  const [showAllBuffet, setShowAllBuffet] = useState(false);
  const [buffetTab, setBuffetTab] = useState("all");
  const [lightbox, setLightbox] = useState(null); // { images, index }
  const trackRef = useRef(null);

  // section active (points de navigation)
  useEffect(() => {
    const secs = DOT_SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActiveId(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    secs.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // bloque le scroll tant que l'écran d'accueil ou la visionneuse est ouvert
  useEffect(() => {
    document.body.style.overflow = !opened || lightbox ? "hidden" : "";
  }, [opened, lightbox]);

  function openSite(e) {
    e.preventDefault();
    setClosing(true);
    setTimeout(() => setOpened(true), 900);
  }

  const scrollReviews = (dir) => {
    const t = trackRef.current;
    if (t) t.scrollBy({ left: dir * t.clientWidth * 0.85, behavior: "smooth" });
  };

  const realVisible = showAllReal ? REALISATIONS : REALISATIONS.slice(0, 6);
  const buffetVisible = (buffetTab === "all" ? BUFFETS : BUFFETS.filter((b) => b.cat === buffetTab)).slice(0, showAllBuffet ? undefined : 6);
  const heroPhoto = REALISATIONS[1]?.url || REALISATIONS[0]?.url;

  return (
    <>
      <ScrollProgress />

      {/* ---------- ÉCRAN D'ACCUEIL ---------- */}
      {!opened && (
        <div className={`hero${closing ? " opening" : ""}`}>
          {heroPhoto && <div className="hero-photo" style={{ backgroundImage: `url(${heroPhoto})` }} />}
          <div className="hero-bg">
            <span style={{ width: 220, height: 220, top: "10%", left: "8%", animationDelay: "0s" }} />
            <span style={{ width: 160, height: 160, top: "60%", left: "75%", animationDelay: "3s" }} />
            <span style={{ width: 280, height: 280, top: "75%", left: "20%", animationDelay: "6s" }} />
            <span style={{ width: 140, height: 140, top: "20%", left: "70%", animationDelay: "9s" }} />
          </div>
          <div className="hero-inner">
            <img className="logo" src={logo} alt="UniEvent" />
            <div className="kicker ar">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
            <h1>UniEvent</h1>
            <div className="sub ar">لكل مناسبة توقيعها</div>
            <p className="tag">
              Traiteur événementiel — mariages, fiançailles et célébrations. Mise en table, buffets et gastronomie
              marocaine, pensés dans les moindres détails.
            </p>
            <a className="btn hero-cta" href="#intro" onClick={openSite}>Découvrir nos prestations</a>
          </div>
        </div>
      )}

      {/* ---------- NAVIGATION ---------- */}
      <nav className={`nav${opened ? " show" : ""}${menuOpen ? " open" : ""}`}>
        <a className="nav-brand" href="#intro" onClick={() => setMenuOpen(false)}>
          <img src={logo} alt="" />
          <span>UniEvent</span>
        </a>
        <button className="burger" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu" aria-expanded={menuOpen}>
          <i /><i /><i />
        </button>
        <div className="nav-links">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
          ))}
        </div>
      </nav>

      <div className="dot-nav">
        {DOT_SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} title={s.title} aria-label={s.title} className={activeId === s.id ? "active" : ""} />
        ))}
      </div>

      <div className="zellige" />

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE_WORDS, ...MARQUEE_WORDS, ...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
            <span key={i}>{w}<span className="sep"> ✦ </span></span>
          ))}
        </div>
      </div>

      {/* ---------- INTRO ---------- */}
      <section id="intro">
        <div className="wrap intro">
          <Reveal className="intro-media" variant="zoom">
            <LoopVideo src={introVideo} poster={introPoster} />
          </Reveal>

          <div className="intro-text">
            <Reveal><span className="kicker-small">Notre savoir-faire</span></Reveal>
            <Reveal delay={0.1}><h2>Des événements qui portent votre signature</h2></Reveal>
            <Reveal delay={0.2}>
              <p>
                Chaque prestation est composée sur mesure, du dressage des tables au service en salle. Nous
                accompagnons les familles de la région pour que chaque événement porte une signature qui lui est
                propre.
              </p>
            </Reveal>
            <div className="values">
              {VALUES.map((v, i) => (
                <Reveal key={v.title} className="value" delay={0.3 + i * 0.12}>
                  <div className="value-ic"><Icon name={v.icon} size={20} /></div>
                  <div>
                    <h4>{v.title}</h4>
                    <p>{v.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.7} className="intro-cta">
              <a className="btn" href="#choix">Voir nos réalisations</a>
              <a className="btn ghost" href="#contact">Demander un devis</a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- RÉALISATIONS ---------- */}
      <section id="choix" className="alt">
        <div className="wrap">
          <SectionHead ar="إنجازاتنا" title="Nos Réalisations" text="Un aperçu de nos mariages, fiançailles et mises en table. Touchez une photo pour l'agrandir." />
          <div className="masonry">
            {realVisible.map((img, i) => (
              <Reveal key={img.url} className="masonry-item" delay={(i % 3) * 0.1}>
                <img
                  className="photo"
                  src={img.url}
                  alt={`Réalisation UniEvent ${i + 1}`}
                  loading={i < 3 ? "eager" : "lazy"}
                  decoding="async"
                  role="button"
                  tabIndex={0}
                  onClick={() => setLightbox({ images: REALISATIONS, index: REALISATIONS.indexOf(img) })}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setLightbox({ images: REALISATIONS, index: REALISATIONS.indexOf(img) }))}
                />
              </Reveal>
            ))}
          </div>
          {REALISATIONS.length > 6 && (
            <div className="center">
              <button className="btn ghost" onClick={() => setShowAllReal((s) => !s)}>
                {showAllReal ? "Voir moins" : `Voir toutes les photos (${REALISATIONS.length})`}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ---------- PACK ---------- */}
      <section id="pack" className="dark">
        <div className="wrap">
          <SectionHead light ar="باك الأحلام" title="Pack Alahlam" text="Une formule complète pour votre mariage, coordonnée de A à Z." />
          <div className="pack-content">
            <Reveal variant="left">
              <PackPlayer src={packVideo} poster={packPoster} />
            </Reveal>

            <div className="pack-details">
              <Reveal>
                <span className="kicker-small">Notre formule</span>
                <h3>Un mariage pensé dans les moindres détails</h3>
                <p>
                  Nous vous accompagnons de la préparation jusqu'au jour J afin de créer une réception élégante,
                  harmonieuse et parfaitement coordonnée.
                </p>
              </Reveal>
              <div className="pack-items">
                {PACK_ITEMS.map((p, i) => (
                  <Reveal key={p.title} className="pack-item" delay={0.1 + i * 0.08}>
                    {PACK_IMAGES[p.image] ? (
                      <img className="pack-icon" src={PACK_IMAGES[p.image]} alt={p.title} />
                    ) : (
                      <div className="icon">{p.title.charAt(0)}</div>
                    )}
                    <h4>{p.title}</h4>
                  </Reveal>
                ))}
              </div>
              <Reveal delay={0.7}>
                <a className="btn" href={`https://wa.me/${PHONE}?text=${WA_TEXT}`} target="_blank" rel="noreferrer">
                  Demander le Pack Alahlam
                </a>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- BUFFETS ---------- */}
      <section id="buffets">
        <div className="wrap">
          <SectionHead ar="البوفيهات" title="Buffets & gastronomie" text="Composez votre buffet parmi nos familles de mets, préparés le jour même." />
          <div className="chip-row">
            {FOOD_CHIPS.map((c, i) => (
              <Reveal as="span" key={c} className="chip" delay={i * 0.05}>{c}</Reveal>
            ))}
          </div>

          {BUFFET_TABS.length > 1 && (
            <div className="tabs" role="tablist">
              {BUFFET_TABS.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={buffetTab === t.id}
                  className={`tab${buffetTab === t.id ? " active" : ""}`}
                  onClick={() => setBuffetTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          <div className="buffet-grid" key={buffetTab}>
            {buffetVisible.map((img, i) => (
              <button
                key={img.url}
                className="buffet-item"
                style={{ "--d": `${(i % 6) * 0.06}s` }}
                onClick={() => setLightbox({ images: buffetVisible, index: i })}
                aria-label={`Agrandir la photo ${i + 1}`}
              >
                <img className="photo" src={img.url} alt={`Buffet UniEvent ${i + 1}`} loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
          {(buffetTab === "all" ? BUFFETS : BUFFETS.filter((b) => b.cat === buffetTab)).length > 6 && (
            <div className="center">
              <button className="btn ghost" onClick={() => setShowAllBuffet((s) => !s)}>
                {showAllBuffet ? "Voir moins" : `Voir toutes les photos (${(buffetTab === "all" ? BUFFETS : BUFFETS.filter((b) => b.cat === buffetTab)).length})`}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ---------- AVIS ---------- */}
      <section id="reviews" className="alt">
        <div className="wrap">
          <SectionHead ar="آراء العملاء" title="Ils nous ont fait confiance" text="Quelques retours de familles accompagnées par UniEvent." />
          <Reveal className="reviews-slider">
            <button className="slider-btn" onClick={() => scrollReviews(-1)} aria-label="Précédent"><Icon name="left" size={20} /></button>
            <div className="reviews-track" ref={trackRef}>
              {REVIEWS.map((r, i) => (
                <article key={i} className="review-card">
                  <div className="review-header">
                    <div className="review-name ar">{r.name}</div>
                    <div className="review-event ar">{r.event}</div>
                  </div>
                  <div className="review-rating" aria-label={`${r.rating} étoiles sur 5`}>
                    {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                  </div>
                  <p className="review-text ar">{r.text}</p>
                </article>
              ))}
            </div>
            <button className="slider-btn" onClick={() => scrollReviews(1)} aria-label="Suivant"><Icon name="right" size={20} /></button>
          </Reveal>
        </div>
      </section>

      {/* ---------- COMMENT ÇA MARCHE ---------- */}
      <section id="comment">
        <div className="wrap">
          <SectionHead ar="كيف يتم الأمر" title="Comment ça marche" />
          <div className="steps">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} className="step" delay={i * 0.15}>
                <div className="n">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CONTACT ---------- */}
      <section className="contact dark" id="contact">
        <div className="wrap">
          <SectionHead light ar="اتصلوا بنا" title="Contactez-nous" text="Pour toute demande de devis ou de disponibilité, appelez-nous ou passez nous voir." />
          <QuoteForm />
          <div className="contact-grid">
            <Reveal className="contact-block" variant="left">
              <a href={`tel:+${PHONE}`}><span className="ic"><Icon name="phone" size={22} /></span> {PHONE_LABEL}</a>
              <a href={`https://wa.me/${PHONE}?text=${WA_TEXT}`} target="_blank" rel="noreferrer"><span className="ic"><Icon name="wa" size={22} /></span> WhatsApp</a>
              <div className="addr">{ADDRESS}</div>
              <a className="btn ghost light" href={`https://www.google.com/maps/search/?api=1&query=${LAT_LNG}`} target="_blank" rel="noreferrer">
                <Icon name="pin" size={18} /> Ouvrir dans Google Maps
              </a>
            </Reveal>
            <Reveal className="map-embed" variant="zoom">
              <iframe
                title="Localisation UniEvent"
                src={`https://maps.google.com/maps?q=${LAT_LNG}&z=15&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Reveal>
          </div>
        </div>
      </section>

      <footer>
        <img src={logo} alt="" />
        UniEvent
        <span className="ar">في خدمتكم لكل مناسبة</span>
        <small>© {new Date().getFullYear()} UniEvent — Taroudant, Maroc</small>
      </footer>

      <a className="wa-float" href={`https://wa.me/${PHONE}?text=${WA_TEXT}`} target="_blank" rel="noreferrer" aria-label="Écrire sur WhatsApp">
        <Icon name="wa" size={28} />
      </a>

      {lightbox && (
        <Lightbox
          images={lightbox.images}
          index={lightbox.index}
          onIndex={(i) => setLightbox((l) => ({ ...l, index: i }))}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}