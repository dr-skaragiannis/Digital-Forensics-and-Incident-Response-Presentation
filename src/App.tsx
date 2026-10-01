import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { chapters } from "./data/chapters";
import { LEVELS, type Chapter, type Slide } from "./data/dsl";
import { SlideView } from "./components/Slides";

const pad = (n: number) => String(n).padStart(2, "0");

const TYPE_LABEL: Record<Slide["t"], string> = {
  cover: "Εξώφυλλο",
  obj: "Στόχοι",
  agenda: "Πρόγραμμα",
  pts: "Έννοιες",
  cards: "Κάρτες",
  flow: "Διαδικασία",
  cycle: "Κύκλος",
  vs: "Σύγκριση",
  code: "Τερματικό",
  cs: "Πραγματικό περιστατικό",
  stats: "Αριθμοί",
  pyr: "Πυραμίδα",
  stack: "Στρώματα",
  table: "Πίνακας",
  tl: "Χρονογραμμή",
  quiz: "Τεστ",
  lab: "Εργαστήριο",
  quote: "Απόσπασμα",
  sum: "Σύνοψη",
  brk: "Διάλειμμα",
  matrix: "Μήτρα",
  hub: "Διάγραμμα",
  bars: "Γράφημα",
  shot: "Στιγμιότυπο",
  deep: "Εμβάθυνση",
};

const titleOf = (s: Slide, ch: Chapter): string => {
  switch (s.t) {
    case "cover":
      return ch.title;
    case "obj":
      return "Μαθησιακοί στόχοι";
    case "agenda":
      return "Πορεία των 3 ωρών";
    case "quiz":
    case "quote":
      return s.q.replace(/\*\*|`/g, "");
    case "sum":
      return "Τα κλειδιά του κεφαλαίου";
    default:
      return s.h.replace(/\*\*|`/g, "");
  }
};

const fmtTime = (mins: number) => `${Math.floor(mins / 60)}:${pad(Math.round(mins % 60))}`;

function parseHash(): { c: number | null; i: number } {
  const m = window.location.hash.match(/^#\/(\d+)(?:\/(\d+))?/);
  if (!m) return { c: null, i: 0 };
  const c = +m[1];
  if (!chapters.find((x) => x.n === c)) return { c: null, i: 0 };
  return { c, i: Math.max(0, (+(m[2] || 1) || 1) - 1) };
}

/* ------------------------------------------------------------------ */
/* Home                                                                */
/* ------------------------------------------------------------------ */
function Home({ open }: { open: (c: number) => void }) {
  const total = chapters.reduce((a, c) => a + c.slides.length, 0);
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-[1500px] px-6 md:px-12">
        <div className="flex items-center justify-between py-8 text-sm font-bold uppercase tracking-[0.14em]">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-[#f35422]" />
            Cybersecurity 101®
          </div>
          <div className="hidden text-[#9a9a9a] md:block">Ιόνιο Πανεπιστήμιο · Έκδοση 2026</div>
        </div>

        <section className="relative pb-16 pt-10 md:pt-20">
          <div className="pointer-events-none absolute -right-40 -top-20 h-[700px] w-[700px] rounded-full opacity-60" style={{ background: "radial-gradient(circle, rgba(243,84,34,.55), rgba(243,84,34,0) 65%)" }} />
          <div className="relative">
            <div className="mb-8 flex flex-wrap gap-3">
              {["Παρουσιάσεις διδασκαλίας", "Landscape 16:9", "Fullscreen"].map((p) => (
                <span key={p} className="rounded-full border-2 border-[#383838] px-5 py-2 text-xs font-bold uppercase tracking-[0.1em]">
                  {p}
                </span>
              ))}
            </div>
            <h1 className="max-w-[1200px] text-[44px] font-extrabold leading-[1.02] tracking-[-0.04em] md:text-[96px]">
              Παρουσίαση Διδασκαλίας <span className="text-[#f35422]">Κυβερνοασφάλειας 101</span>
            </h1>
            <p className="mt-8 max-w-[860px] text-xl font-medium leading-relaxed text-[#cbcbcb] md:text-2xl">
              Ψηφιακή Εγκληματολογία και Αντιμετώπιση Περιστατικών (DFIR) — 13 κεφάλαια, 4 επίπεδα, μία διδακτική διαδρομή. Κάθε κεφάλαιο είναι μια αυτοτελής παρουσίαση 3 ωρών με διαγράμματα, εργαστήρια και πραγματικά περιστατικά.
            </p>
            <div className="mt-12 grid max-w-[1000px] grid-cols-2 gap-4 md:grid-cols-4">
              {[
                [String(chapters.length), "κεφάλαια"],
                ["4", "επίπεδα"],
                [`${total}`, "διαφάνειες"],
                [`${chapters.length * 3}`, "ώρες διδασκαλίας"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-3xl border-2 border-[#383838] bg-[#111] p-6">
                  <div className="text-5xl font-extrabold tracking-tighter text-[#f35422]">{v}</div>
                  <div className="mt-2 text-sm font-semibold text-[#cbcbcb]">{l}</div>
                </div>
              ))}
            </div>
            <button onClick={() => open(1)} className="mt-12 rounded-full bg-[#f35422] px-10 py-5 text-lg font-extrabold text-black transition hover:bg-white">
              Ξεκίνα από το Κεφάλαιο 1 →
            </button>
          </div>
        </section>

        {[1, 2, 3, 4].map((lvl) => (
          <section key={lvl} className="border-t-2 border-[#383838] py-12">
            <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#f35422]">Επίπεδο {lvl}</div>
                <h2 className="mt-2 max-w-[900px] text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">{LEVELS[lvl]}</h2>
              </div>
              <div className="text-sm font-bold uppercase tracking-[0.1em] text-[#9a9a9a]">Κεφάλαια {chapters.filter((c) => c.lvl === lvl).map((c) => c.n).join(" · ")}</div>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {chapters
                .filter((c) => c.lvl === lvl)
                .map((c) => (
                  <button
                    key={c.n}
                    onClick={() => open(c.n)}
                    className="group relative flex min-h-[300px] flex-col overflow-hidden rounded-[32px] border-2 border-[#383838] bg-[#111] p-8 text-left transition hover:border-[#f35422] hover:bg-[#f35422] hover:text-black"
                  >
                    <div className="absolute -bottom-6 right-2 select-none text-[170px] font-extrabold leading-none tracking-tighter opacity-10">{pad(c.n)}</div>
                    <div className="mb-4 text-sm font-bold uppercase tracking-[0.14em] text-[#f35422] group-hover:text-black">Κεφάλαιο {pad(c.n)}</div>
                    <div className="text-2xl font-extrabold leading-tight tracking-tight">{c.title}</div>
                    <div className="mt-3 text-base leading-snug text-[#cbcbcb] group-hover:text-black/80">{c.sub}</div>
                    <div className="mt-auto flex gap-2 pt-6 text-xs font-bold uppercase tracking-[0.08em]">
                      <span className="rounded-full border-2 border-current px-3 py-1">{c.slides.length} διαφάνειες</span>
                      <span className="rounded-full border-2 border-current px-3 py-1">3 ώρες</span>
                    </div>
                  </button>
                ))}
            </div>
          </section>
        ))}

        <footer className="border-t-2 border-[#383838] py-10 text-sm text-[#9a9a9a]">
          Βασισμένο στο σύγγραμμα «Ψηφιακή Εγκληματολογία και Αντιμετώπιση Περιστατικών», Στυλιανός Καραγιάννης, Ιόνιο Πανεπιστήμιο, Αναθεωρημένη Έκδοση 2026. Οι τεχνικές προορίζονται αποκλειστικά για νόμιμη αμυντική χρήση και εκπαίδευση. Συντομεύσεις στην παρουσίαση: ← → πλοήγηση · F πλήρης οθόνη · G επισκόπηση · A απάντηση τεστ · N σημειώσεις εκπαιδευτή · Esc έξοδος.
        </footer>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Viewer                                                              */
/* ------------------------------------------------------------------ */
function Viewer({ ch, start, exit, goChapter }: { ch: Chapter; start: number; exit: () => void; goChapter: (n: number) => void }) {
  const total = ch.slides.length;
  const [idx, setIdx] = useState(Math.min(start, total - 1));
  const [reveal, setReveal] = useState(false);
  const [over, setOver] = useState(false);
  const [ui, setUi] = useState(true);
  const [fs, setFs] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [portrait, setPortrait] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const hideT = useRef<number | undefined>(undefined);
  const touch = useRef<number | null>(null);

  const go = useCallback(
    (n: number) => {
      setIdx((cur) => {
        const v = Math.max(0, Math.min(total - 1, typeof n === "number" ? n : cur));
        return v;
      });
      setReveal(false);
    },
    [total]
  );

  // hash sync
  useEffect(() => {
    window.history.replaceState(null, "", `#/${ch.n}/${idx + 1}`);
    document.title = `Κεφ. ${ch.n} · ${ch.title} — Cybersecurity 101`;
  }, [idx, ch]);

  // scale
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setScale(Math.min(w / 1920, h / 1080));
      setPortrait(h > w);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // fullscreen
  const toggleFs = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else box.current?.requestFullscreen?.().catch(() => {});
  }, []);
  useEffect(() => {
    const f = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", f);
    return () => document.removeEventListener("fullscreenchange", f);
  }, []);

  // auto-hide ui
  const poke = useCallback(() => {
    setUi(true);
    window.clearTimeout(hideT.current);
    hideT.current = window.setTimeout(() => setUi(false), 2800);
  }, []);
  useEffect(() => {
    poke();
    return () => window.clearTimeout(hideT.current);
  }, [poke]);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      poke();
      const k = e.key;
      if (over) {
        if (k === "Escape" || k.toLowerCase() === "g") setOver(false);
        return;
      }
      if (["ArrowRight", "PageDown", " ", "Enter", "ArrowDown"].includes(k)) {
        e.preventDefault();
        setIdx((c) => Math.min(total - 1, c + 1));
        setReveal(false);
      } else if (["ArrowLeft", "PageUp", "Backspace", "ArrowUp"].includes(k)) {
        e.preventDefault();
        setIdx((c) => Math.max(0, c - 1));
        setReveal(false);
      } else if (k === "Home") go(0);
      else if (k === "End") go(total - 1);
      else if (k.toLowerCase() === "f") toggleFs();
      else if (k.toLowerCase() === "g") setOver(true);
      else if (k.toLowerCase() === "a") setReveal((r) => !r);
      else if (k.toLowerCase() === "n") setNoteOpen((v) => !v);
      else if (k === "Escape" && !document.fullscreenElement) exit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [over, total, go, toggleFs, exit, poke]);

  const s = ch.slides[idx];
  const mins = (idx / total) * 180;
  const titles = useMemo(() => ch.slides.map((x) => titleOf(x, ch)), [ch]);
  const btnHide = ui || over ? "opacity-100" : "opacity-0 pointer-events-none";

  return (
    <div
      ref={box}
      className="fixed inset-0 select-none overflow-hidden bg-black"
      onMouseMove={poke}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        touch.current = null;
        if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1));
      }}
      style={{ cursor: ui ? "default" : "none" }}
    >
      {/* stage */}
      <div
        className="absolute"
        style={{ left: "50%", top: "50%", width: 1920, height: 1080, transform: `translate(-50%,-50%) scale(${scale})`, transformOrigin: "center center" }}
        onClick={() => s.t === "quiz" && setReveal((r) => !r)}
      >
        <div key={idx} className="slide-anim h-full w-full">
          <SlideView s={s} ch={ch} i={idx} total={total} reveal={reveal} />
        </div>
      </div>

      {/* side arrows */}
      <button aria-label="Προηγούμενη" onClick={() => go(idx - 1)} className={`btn absolute left-4 top-1/2 -translate-y-1/2 transition-opacity ${btnHide}`} style={{ width: 52, height: 52, padding: 0 }}>
        ‹
      </button>
      <button aria-label="Επόμενη" onClick={() => go(idx + 1)} className={`btn absolute right-4 top-1/2 -translate-y-1/2 transition-opacity ${btnHide}`} style={{ width: 52, height: 52, padding: 0 }}>
        ›
      </button>

      {/* bottom controls */}
      <div className={`absolute bottom-4 left-1/2 flex max-w-[96vw] -translate-x-1/2 items-center gap-2 transition-opacity ${btnHide}`}>
        <button className="btn" onClick={exit} title="Όλα τα κεφάλαια (Esc)">
          ⌂ <span className="hidden sm:inline">Κεφάλαια</span>
        </button>
        <button className="btn" onClick={() => go(idx - 1)}>
          ←
        </button>
        <div className="btn cursor-default hover:!bg-[rgba(10,10,10,.85)] hover:!text-white" style={{ minWidth: 168 }}>
          <span className="text-[#f35422]">{idx + 1}</span> / {total} · ⏱ {fmtTime(mins)}
        </div>
        <button className="btn" onClick={() => go(idx + 1)}>
          →
        </button>
        <button className="btn" onClick={() => setOver(true)} title="Επισκόπηση (G)">
          ▦ <span className="hidden sm:inline">Επισκόπηση</span>
        </button>
        <button className="btn" onClick={() => setNoteOpen((v) => !v)} title="Σημειώσεις (N)">
          ✎ <span className="hidden sm:inline">Σημειώσεις</span>
        </button>
        <button className="btn" onClick={toggleFs} title="Πλήρης οθόνη (F)">
          {fs ? "⤡" : "⛶"} <span className="hidden sm:inline">{fs ? "Έξοδος" : "Πλήρης οθόνη"}</span>
        </button>
      </div>

      {noteOpen && (
        <div className="absolute inset-x-0 bottom-0 z-40 border-t-2 border-[#f35422] bg-black/95 px-8 py-5">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#f35422]">Σημειώσεις εκπαιδευτή · πλήκτρο N για κλείσιμο</div>
          <div className="mt-2 max-w-[1500px] text-lg leading-relaxed text-white">{s.note ? s.note.replace(/\*\*|`/g, "") : "Δεν υπάρχει πρόσθετη σημείωση για αυτή τη διαφάνεια — δείτε το περιεχόμενό της ή την επόμενη «Εμβάθυνση»."}</div>
        </div>
      )}

      {portrait && ui && <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-[#f35422] px-5 py-2 text-sm font-bold text-black">↻ Περιστρέψτε τη συσκευή σε landscape</div>}

      {/* overview */}
      {over && (
        <div className="absolute inset-0 z-50 overflow-y-auto bg-black/95 p-6 md:p-10">
          <div className="mx-auto max-w-[1500px]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#f35422]">Κεφάλαιο {pad(ch.n)} · {total} διαφάνειες · 3 ώρες</div>
                <div className="text-2xl font-extrabold tracking-tight md:text-4xl">{ch.title}</div>
              </div>
              <button className="btn" onClick={() => setOver(false)}>
                ✕ Κλείσιμο
              </button>
            </div>
            <div className="mb-6 flex flex-wrap gap-2">
              {chapters.map((c) => (
                <button key={c.n} onClick={() => goChapter(c.n)} className={`btn ${c.n === ch.n ? "!bg-[#f35422] !text-black !border-[#f35422]" : ""}`} style={{ height: 36, minWidth: 40, padding: "0 12px" }}>
                  {c.n}
                </button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {ch.slides.map((sl, i) => (
                <button
                  key={i}
                  onClick={() => {
                    go(i);
                    setOver(false);
                  }}
                  className={`rounded-2xl border-2 p-4 text-left transition hover:border-[#f35422] ${i === idx ? "border-[#f35422] bg-[#f35422]/15" : "border-[#383838] bg-[#111]"}`}
                >
                  <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.1em]">
                    <span className="text-[#f35422]">{pad(i + 1)}</span>
                    <span className="text-[#9a9a9a]">
                      {TYPE_LABEL[sl.t]} · {fmtTime((i / total) * 180)}
                    </span>
                  </div>
                  <div className="line-clamp-3 text-sm font-bold leading-snug text-white">{titles[i]}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
export default function App() {
  const [route, setRoute] = useState(parseHash());

  useEffect(() => {
    const f = () => setRoute(parseHash());
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);

  const open = (c: number, i = 0) => {
    window.location.hash = `#/${c}/${i + 1}`;
    setRoute({ c, i });
  };
  const exit = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    window.history.replaceState(null, "", window.location.pathname);
    document.title = "Cybersecurity 101 — Παρουσιάσεις DFIR";
    setRoute({ c: null, i: 0 });
    window.scrollTo(0, 0);
  }, []);

  const ch = chapters.find((x) => x.n === route.c);
  if (!ch) return <Home open={(c) => open(c)} />;
  return <Viewer key={ch.n} ch={ch} start={route.i} exit={exit} goChapter={(n) => open(n)} />;
}
