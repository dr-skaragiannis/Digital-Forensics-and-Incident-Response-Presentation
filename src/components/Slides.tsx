import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { Chapter, Slide } from "../data/dsl";

const pad = (n: number) => String(n).padStart(2, "0");

/** rich text: **bold accent**, `code` */
export function R({ s }: { s: string }) {
  return (
    <>
      {s.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) =>
        p.startsWith("**") ? (
          <b key={i} className="acc font-extrabold">
            {p.slice(2, -2)}
          </b>
        ) : p.startsWith("`") ? (
          <code key={i} className="mono rounded-lg px-2 py-[1px] text-[0.86em]" style={{ background: "rgba(243,84,34,.16)", color: "inherit" }}>
            {p.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

const bigSize = (s: string) => (s.length <= 4 ? 150 : s.length <= 6 ? 116 : s.length <= 9 ? 84 : 60);

export const toneOf = (s: Slide): string => {
  switch (s.t) {
    case "cs":
    case "sum":
      return "tone-light";
    case "brk":
    case "quote":
      return "tone-orange";
    default:
      return "tone-dark";
  }
};

/* ---------- Body with optional "Εμβάθυνση" note that auto-hides if it does not fit ---------- */
function Body({ children, foot, note }: { children: ReactNode; foot?: string; note?: string }) {
  const inner = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(!!note);
  useLayoutEffect(() => {
    if (!note) return;
    const el = inner.current;
    if (!el) return;
    const check = () => {
      if (el.scrollHeight > el.clientHeight + 22) setShow(false);
    };
    check();
    document.fonts?.ready.then(check);
  }, [note]);
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-[20px]" data-content data-note={note ? (show ? "shown" : "hidden") : "none"}>
      <div ref={inner} className="min-h-0 flex-1">
        {children}
      </div>
      {note && show && (
        <div className="note shrink-0">
          <span className="nl">Εμβάθυνση</span>
          <span>
            <R s={note} />
          </span>
        </div>
      )}
      {foot && (
        <div className="foot shrink-0">
          <R s={foot} />
        </div>
      )}
    </div>
  );
}

/* ---------- Frame ---------- */
function Frame({
  s,
  ch,
  i,
  total,
  h,
  k,
  children,
  foot,
  note,
}: {
  s: Slide;
  ch: Chapter;
  i: number;
  total: number;
  h?: string;
  k?: string;
  children: ReactNode;
  foot?: string;
  note?: string;
}) {
  const tone = toneOf(s);
  return (
    <div className={`slide ${tone}`} data-slide>
      <div className="absolute inset-0 bgdots opacity-100" />
      <div
        className="absolute right-[-30px] bottom-[-20px] ghost text-[560px] select-none pointer-events-none"
        style={{ zIndex: 0 }}
      >
        {pad(ch.n)}
      </div>
      {/* header */}
      <div className="absolute left-[96px] right-[96px] top-[38px] flex items-center justify-between text-[20px] font-bold uppercase tracking-[0.14em]" style={{ zIndex: 2 }}>
        <div className="flex items-center gap-3">
          <span className="dot" />
          <span>Cybersecurity 101®</span>
        </div>
        <div className="mut">
          Κεφ. {pad(ch.n)} — {ch.short}
        </div>
      </div>
      {/* main */}
      <div className="absolute left-[96px] right-[96px] top-[104px] bottom-[84px] flex flex-col" style={{ zIndex: 2 }}>
        {h && (
          <div className="mb-[26px] shrink-0">
            {k && <div className="acc mb-[10px] text-[22px] font-bold uppercase tracking-[0.16em]">{k}</div>}
            <h1 className="ttl text-[62px] max-w-[1600px]">
              <R s={h} />
            </h1>
          </div>
        )}
        <Body foot={foot} note={note}>
          {children}
        </Body>
      </div>
      {/* footer */}
      <div className="absolute left-[96px] right-[96px] bottom-[26px] flex items-center justify-between text-[18px] font-semibold dim" style={{ zIndex: 2 }}>
        <span>Ψηφιακή Εγκληματολογία & Αντιμετώπιση Περιστατικών · Ιόνιο Πανεπιστήμιο</span>
        <span className="mono">
          {i + 1} / {total}
        </span>
      </div>
      <div className="absolute bottom-0 left-0 h-[6px]" style={{ width: `${((i + 1) / total) * 100}%`, background: s.t === "brk" || s.t === "quote" ? "#000" : "#f35422", zIndex: 3 }} />
    </div>
  );
}

/* ---------- Body renderers ---------- */
function Pts({ s }: { s: Extract<Slide, { t: "pts" }> }) {
  return (
    <div className="flex h-full gap-12">
      <ol className="flex min-w-0 flex-1 flex-col">
        {s.items.map((it, i) => (
          <li key={i} className="hair flex items-baseline gap-6 py-[17px] rise" style={{ animationDelay: `${i * 60}ms` }}>
            <span className="mono acc w-[44px] shrink-0 text-[24px] font-bold">{pad(i + 1)}</span>
            <span className="text-[33px] font-medium leading-[1.28]">
              <R s={it} />
            </span>
          </li>
        ))}
      </ol>
      {s.side && (
        <div className="card flex w-[500px] shrink-0 flex-col items-center justify-center self-start text-center" style={{ minHeight: 420 }}>
          <div className="acc font-extrabold leading-none tracking-tighter" style={{ fontSize: bigSize(s.side[0]) }}>
            {s.side[0]}
          </div>
          <div className="mut mt-5 text-[28px] font-semibold leading-tight">{s.side[1]}</div>
        </div>
      )}
    </div>
  );
}

function Cards({ s }: { s: Extract<Slide, { t: "cards" }> }) {
  const n = s.cards.length;
  const cols = n <= 4 ? n : 3;
  return (
    <div className="grid h-full gap-6" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, gridAutoRows: "minmax(0,1fr)" }}>
      {s.cards.map(([ic, t, d], i) => (
        <div key={i} className="card flex flex-col rise" style={{ animationDelay: `${i * 70}ms` }}>
          <div className="mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full text-[36px]" style={{ background: "rgba(243,84,34,.16)", border: "2px solid #f35422" }}>
            {ic}
          </div>
          <div className="mb-3 text-[33px] font-extrabold leading-[1.12] tracking-tight">
            <R s={t} />
          </div>
          <div className="mut text-[25px] leading-[1.35]">
            <R s={d} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Flow({ s }: { s: Extract<Slide, { t: "flow" }> }) {
  const n = s.steps.length;
  return (
    <div className="flex h-full flex-col">
      <div className="relative mb-6 flex shrink-0 items-center" style={{ height: 64 }}>
        <div className="absolute left-[32px] right-[32px] top-1/2 h-[3px] -translate-y-1/2" style={{ background: "var(--line)" }} />
        <div className="relative flex w-full justify-between" style={{ gap: 0 }}>
          {s.steps.map((_, i) => (
            <div key={i} className="flex flex-1 items-center">
              <div className="numc">{i + 1}</div>
              {i < n - 1 && <div className="acc flex-1 text-right text-[34px] leading-none" style={{ paddingRight: 8 }}>›››</div>}
            </div>
          ))}
        </div>
      </div>
      <div className="grid min-h-0 flex-1 gap-5" style={{ gridTemplateColumns: `repeat(${n}, minmax(0,1fr))` }}>
        {s.steps.map(([t, d], i) => (
          <div key={i} className="card rise" style={{ animationDelay: `${i * 80}ms`, padding: "24px 24px" }}>
            <div className="mb-3 font-extrabold leading-[1.12] tracking-tight" style={{ fontSize: n >= 7 ? 22 : n === 6 ? 25 : 30 }}>
              <R s={t} />
            </div>
            <div className="mut leading-[1.35]" style={{ fontSize: n >= 7 ? 19 : n === 6 ? 21 : 24 }}>
              <R s={d} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Cycle({ s }: { s: Extract<Slide, { t: "cycle" }> }) {
  const n = s.steps.length;
  const R0 = 240;
  const C = 310;
  const pos = (a: number) => [C + R0 * Math.cos((a * Math.PI) / 180), C + R0 * Math.sin((a * Math.PI) / 180)];
  return (
    <div className="flex h-full items-center gap-14">
      <div className="relative shrink-0" style={{ width: 620, height: 620 }}>
        <svg width="620" height="620" viewBox="0 0 620 620" className="absolute inset-0">
          <circle cx={C} cy={C} r={R0} fill="none" stroke="#f35422" strokeWidth="4" strokeDasharray="4 14" strokeLinecap="round" opacity="0.8" />
          {s.steps.map((_, i) => {
            const a = -90 + (i + 0.5) * (360 / n);
            const [x, y] = pos(a);
            return <polygon key={"ar" + i} points="-14,-14 16,0 -14,14" fill="#f35422" transform={`translate(${x},${y}) rotate(${a + 90})`} />;
          })}
          {s.steps.map((_, i) => {
            const a = -90 + i * (360 / n);
            const [x, y] = pos(a);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="46" fill="#f35422" />
                <text x={x} y={y + 13} textAnchor="middle" fontSize="38" fontWeight="800" fill="#000" fontFamily="inherit">
                  {i + 1}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="absolute flex items-center justify-center text-center" style={{ left: C - 130, top: C - 130, width: 260, height: 260 }}>
          <div className="text-[36px] font-extrabold leading-[1.1] tracking-tight">
            <R s={s.center} />
          </div>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        {s.steps.map(([t, d], i) => (
          <div key={i} className="hair flex items-start gap-5 py-[13px]">
            <span className="mono acc w-[40px] shrink-0 text-[26px] font-bold">{pad(i + 1)}</span>
            <div>
              <div className="text-[31px] font-extrabold leading-tight">
                <R s={t} />
              </div>
              <div className="mut mt-1 text-[24px] leading-[1.3]">
                <R s={d} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Vs({ s }: { s: Extract<Slide, { t: "vs" }> }) {
  const col = (d: [string, string[]], acc: boolean) => (
    <div className="card flex min-w-0 flex-1 flex-col" style={{ padding: 0, overflow: "hidden" }}>
      <div className="px-8 py-5 text-[34px] font-extrabold tracking-tight" style={{ background: acc ? "#f35422" : "#fff", color: "#000" }}>
        <R s={d[0]} />
      </div>
      <ul className="flex flex-1 flex-col gap-4 px-8 py-6">
        {d[1].map((it, i) => (
          <li key={i} className="flex gap-4 text-[28px] leading-[1.3]">
            <span className="acc mt-[2px] font-extrabold">▸</span>
            <span>
              <R s={it} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <div className="flex h-full items-stretch gap-4">
      {col(s.a, true)}
      <div className="flex items-center">
        <div className="numc" style={{ width: 76, height: 76, fontSize: 26, background: "#fff", color: "#000" }}>
          VS
        </div>
      </div>
      {col(s.b, false)}
    </div>
  );
}

function Code({ s }: { s: Extract<Slide, { t: "code" }> }) {
  return (
    <div className="flex h-full gap-8">
      <div className="term flex min-w-0 flex-[1.55] flex-col">
        <div className="flex shrink-0 items-center gap-3 px-6 py-4" style={{ background: "#1a1a1a", borderBottom: "2px solid #383838" }}>
          <span className="h-4 w-4 rounded-full" style={{ background: "#f35422" }} />
          <span className="h-4 w-4 rounded-full bg-[#cbcbcb]" />
          <span className="h-4 w-4 rounded-full bg-[#575757]" />
          <span className="mono ml-4 text-[18px] text-[#9a9a9a]">analyst@dfir-lab: ~/cases/INC-2026-0117</span>
        </div>
        <pre className="mono m-0 min-h-0 flex-1 overflow-hidden px-7 py-5 text-[20px] leading-[1.5]" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
          {s.cmd.split("\n").map((l, i) => (
            <div key={"c" + i}>
              {l.startsWith("#") ? (
                <span style={{ color: "#9a9a9a" }}>{l}</span>
              ) : (
                <>
                  <span style={{ color: "#f35422" }}>$ </span>
                  <span>{l}</span>
                </>
              )}
            </div>
          ))}
          <div style={{ height: 10 }} />
          {s.out.split("\n").map((l, i) =>
            l.startsWith("!") ? (
              <div key={"o" + i} style={{ color: "#f35422", fontWeight: 700 }}>
                {l.slice(1)}
              </div>
            ) : (
              <div key={"o" + i} style={{ color: "#cbcbcb" }}>
                {l || " "}
              </div>
            )
          )}
        </pre>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {s.notes.map((n, i) => (
          <div key={i} className="card flex items-start gap-4" style={{ padding: "18px 24px" }}>
            <span className="numc" style={{ width: 44, height: 44, fontSize: 22 }}>
              {i + 1}
            </span>
            <span className="text-[25px] leading-[1.3]">
              <R s={n} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Case({ s }: { s: Extract<Slide, { t: "cs" }> }) {
  return (
    <div className="grid h-full gap-12" style={{ gridTemplateColumns: "560px 1fr" }}>
      <div className="flex min-h-0 flex-col">
        <div className="mb-3">
          <span className="pill pill-acc">● Πραγματικό περιστατικό</span>
        </div>
        <div className="acc font-extrabold leading-[0.95] tracking-tighter" style={{ fontSize: 170 }}>
          {s.year}
        </div>
        <div className="mb-5 mt-2 text-[40px] font-extrabold leading-[1.08] tracking-tight">{s.org}</div>
        <div className="flex flex-col gap-3">
          {s.facts.map(([l, v], i) => (
            <div key={i} className="card flex items-baseline justify-between gap-4" style={{ padding: "12px 22px", borderRadius: 18 }}>
              <span className="dim text-[19px] font-bold uppercase tracking-[0.1em]">{l}</span>
              <span className="text-right text-[26px] font-extrabold">{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex min-h-0 min-w-0 flex-col gap-6">
        <p className="m-0 text-[33px] font-medium leading-[1.4]">
          <R s={s.story} />
        </p>
        <div className="flex flex-1 flex-col justify-center rounded-[28px] px-10 py-7" style={{ background: "#000", color: "#fff" }}>
          <div className="mb-4 text-[22px] font-bold uppercase tracking-[0.16em]" style={{ color: "#f35422" }}>
            Διδάγματα για το DFIR
          </div>
          {s.lessons.map((l, i) => (
            <div key={i} className="flex gap-4 py-[12px] text-[32px] leading-[1.28]">
              <span style={{ color: "#f35422" }} className="font-extrabold">
                →
              </span>
              <span>
                <R s={l} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stats({ s }: { s: Extract<Slide, { t: "stats" }> }) {
  const n = s.stats.length;
  return (
    <div className="grid h-full gap-6" style={{ gridTemplateColumns: `repeat(${n}, minmax(0,1fr))` }}>
      {s.stats.map(([v, l], i) => (
        <div key={i} className="card flex flex-col justify-center rise" style={{ animationDelay: `${i * 90}ms` }}>
          <div className="acc font-extrabold leading-none tracking-tighter" style={{ fontSize: v.length <= 4 ? 130 : v.length <= 6 ? 104 : 76 }}>
            {v}
          </div>
          <div className="mt-6 text-[28px] font-semibold leading-[1.3]">
            <R s={l} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Pyr({ s }: { s: Extract<Slide, { t: "pyr" }> }) {
  const n = s.levels.length;
  return (
    <div className="grid h-full" style={{ gridTemplateColumns: "700px 1fr", gridAutoRows: "minmax(0,1fr)", columnGap: 40 }}>
      {s.levels.map(([t, d], i) => {
        const a = (i / n) * 50;
        const b = ((i + 1) / n) * 50;
        const op = n === 1 ? 1 : 1 - (i / (n - 1)) * 0.72;
        return [
          <div key={"p" + i} style={{ padding: "3px 0" }}>
            <div
              className="flex h-full w-full items-center justify-center text-[24px] font-extrabold"
              style={{
                clipPath: `polygon(${50 - a}% 0, ${50 + a}% 0, ${50 + b}% 100%, ${50 - b}% 100%)`,
                background: `rgba(243,84,34,${op})`,
                color: "#000",
              }}
            >
              {i > 1 ? pad(n - i) : ""}
            </div>
          </div>,
          <div key={"t" + i} className="flex flex-col justify-center">
            <div className="text-[29px] font-extrabold leading-tight">
              <R s={t} />
            </div>
            <div className="mut text-[23px] leading-[1.3]">
              <R s={d} />
            </div>
          </div>,
        ];
      })}
    </div>
  );
}

function Stack({ s }: { s: Extract<Slide, { t: "stack" }> }) {
  const n = s.layers.length;
  return (
    <div className="flex h-full flex-col gap-3">
      {s.layers.map(([t, d], i) => (
        <div key={i} className="flex min-h-0 flex-1 items-stretch overflow-hidden rounded-[22px]" style={{ background: "var(--card)", border: "2px solid var(--line)" }}>
          <div
            className="flex shrink-0 items-center px-7 text-[29px] font-extrabold leading-tight"
            style={{ width: 430, background: `rgba(243,84,34,${1 - (i / Math.max(n - 1, 1)) * 0.55})`, color: "#000" }}
          >
            <R s={t} />
          </div>
          <div className="flex items-center px-8 text-[25px] leading-[1.28]">
            <R s={d} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Table({ s }: { s: Extract<Slide, { t: "table" }> }) {
  return (
    <div className="card h-full" style={{ padding: 0, overflow: "hidden" }}>
      <table className="h-full w-full border-collapse text-left">
        <thead>
          <tr>
            {s.cols.map((c, i) => (
              <th key={i} className="px-7 py-4 text-[20px] font-extrabold uppercase tracking-[0.1em]" style={{ background: "#f35422", color: "#000" }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {s.rows.map((r, ri) => (
            <tr key={ri} style={{ background: ri % 2 ? "var(--card2)" : "transparent" }}>
              {r.map((c, ci) => (
                <td key={ci} className={`px-7 py-2 align-middle text-[25px] leading-[1.25] ${ci === 0 ? "font-extrabold" : ""}`} style={{ borderTop: "2px solid var(--line)" }}>
                  <R s={c} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Tl({ s }: { s: Extract<Slide, { t: "tl" }> }) {
  const n = s.events.length;
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="relative mb-8" style={{ height: 30 }}>
        <div className="absolute left-0 right-0 top-1/2 h-[4px] -translate-y-1/2" style={{ background: "var(--line)" }} />
        <div className="absolute left-0 top-1/2 h-[4px] -translate-y-1/2" style={{ background: "#f35422", width: "100%" }} />
        <div className="relative grid h-full" style={{ gridTemplateColumns: `repeat(${n}, minmax(0,1fr))` }}>
          {s.events.map((_, i) => (
            <div key={i} className="flex items-center">
              <span className="h-[30px] w-[30px] rounded-full" style={{ background: "#f35422", border: "6px solid var(--bg)", boxShadow: "0 0 0 3px #f35422" }} />
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(${n}, minmax(0,1fr))` }}>
        {s.events.map(([tm, t, d], i) => (
          <div key={i} className="min-w-0 rise" style={{ animationDelay: `${i * 90}ms` }}>
            <div className="mono acc mb-2 text-[24px] font-extrabold">{tm}</div>
            <div className="mb-2 text-[28px] font-extrabold leading-[1.15]">
              <R s={t} />
            </div>
            <div className="mut text-[22px] leading-[1.32]">
              <R s={d} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Quiz({ s, reveal }: { s: Extract<Slide, { t: "quiz" }>; reveal: boolean }) {
  return (
    <div className="flex h-full gap-14">
      <div className="flex w-[640px] shrink-0 flex-col">
        <div className="mb-5">
          <span className="pill pill-acc">Τεστ αυτοαξιολόγησης</span>
        </div>
        <h2 className="ttl m-0 text-[46px] leading-[1.14]">
          <R s={s.q} />
        </h2>
        <div className="mt-auto">
          {reveal ? (
            <div className="card" style={{ borderColor: "#f35422" }}>
              <div className="acc mb-2 text-[20px] font-bold uppercase tracking-[0.14em]">Αιτιολόγηση</div>
              <div className="text-[25px] leading-[1.35]">
                <R s={s.why} />
              </div>
            </div>
          ) : (
            <div className="pill dim">Πάτα το πλήκτρο A ή κλικ για απάντηση</div>
          )}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-4">
        {s.opts.map((o, i) => {
          const ok = reveal && i === s.ans;
          return (
            <div
              key={i}
              className="flex items-center gap-5 rounded-[24px] px-7 py-5 transition-all"
              style={{
                background: ok ? "#f35422" : "var(--card)",
                color: ok ? "#000" : "var(--fg)",
                border: `2px solid ${ok ? "#f35422" : "var(--line)"}`,
                opacity: reveal && !ok ? 0.45 : 1,
              }}
            >
              <span className="numc" style={{ width: 54, height: 54, fontSize: 25, background: ok ? "#000" : "#383838", color: "#fff" }}>
                {"ABCDEF"[i]}
              </span>
              <span className="text-[27px] font-semibold leading-[1.25]">
                <R s={o} />
              </span>
              {ok && <span className="ml-auto text-[36px] font-extrabold">✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Lab({ s }: { s: Extract<Slide, { t: "lab" }> }) {
  return (
    <div className="flex h-full gap-10">
      <div className="flex w-[600px] shrink-0 flex-col gap-6">
        <div className="card flex-1" style={{ borderColor: "#f35422" }}>
          <div className="mb-4">
            <span className="pill pill-acc">Σενάριο εργαστηρίου</span>
          </div>
          <div className="text-[28px] leading-[1.4]">
            <R s={s.scn} />
          </div>
        </div>
        <div className="foot" style={{ fontSize: 25 }}>
          <div className="mb-1 text-[18px] font-bold uppercase tracking-[0.14em]" style={{ opacity: 0.7 }}>
            Παραδοτέο
          </div>
          <R s={s.deliver} />
        </div>
      </div>
      <div className="relative flex min-w-0 flex-1 flex-col justify-between">
        <div className="absolute bottom-[30px] top-[30px] w-[3px]" style={{ left: 31, background: "var(--line)" }} />
        {s.phases.map(([t, d], i) => (
          <div key={i} className="relative flex items-start gap-6">
            <span className="numc" style={{ position: "relative", zIndex: 1, boxShadow: "0 0 0 8px var(--bg)" }}>
              {i + 1}
            </span>
            <div className="pt-[2px]">
              <div className="text-[29px] font-extrabold leading-tight">
                <R s={t} />
              </div>
              <div className="mut text-[24px] leading-[1.3]">
                <R s={d} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Matrix({ s }: { s: Extract<Slide, { t: "matrix" }> }) {
  const n = s.cols.length;
  return (
    <div className="grid h-full gap-3" style={{ gridTemplateColumns: `repeat(${n}, minmax(0,1fr))` }}>
      {s.cols.map(([t, items], i) => (
        <div key={i} className="flex min-w-0 flex-col gap-3">
          <div className="rounded-[16px] px-3 py-4 text-center text-[21px] font-extrabold uppercase leading-tight tracking-[0.04em]" style={{ background: "#fff", color: "#000" }}>
            {t}
          </div>
          {items.map((it, j) => {
            const on = s.hi.includes(it);
            return (
              <div
                key={j}
                className="rounded-[14px] px-3 py-3 text-center text-[21px] font-bold leading-[1.15]"
                style={{ background: on ? "#f35422" : "var(--card)", color: on ? "#000" : "var(--mut)", border: `2px solid ${on ? "#f35422" : "var(--line)"}` }}
              >
                {it}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Hub({ s }: { s: Extract<Slide, { t: "hub" }> }) {
  const n = s.nodes.length;
  const pts = s.nodes.map((_, i) => {
    const a = ((-90 + i * (360 / n)) * Math.PI) / 180;
    return [50 + 34 * Math.cos(a), 50 + 35 * Math.sin(a)];
  });
  return (
    <div className="relative h-full w-full">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {pts.map(([x, y], i) => (
          <line key={i} x1="50" y1="50" x2={x} y2={y} stroke="#f35422" strokeWidth="3" strokeDasharray="6 8" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="absolute flex items-center justify-center rounded-full text-center" style={{ left: "50%", top: "50%", width: 200, height: 200, transform: "translate(-50%,-50%)", background: "#f35422", color: "#000", boxShadow: "0 0 0 14px var(--bg)" }}>
        <div className="px-4 text-[28px] font-extrabold leading-[1.1]">
          <R s={s.center} />
        </div>
      </div>
      {s.nodes.map(([t, d], i) => (
        <div key={i} className="card absolute" style={{ left: `${pts[i][0]}%`, top: `${pts[i][1]}%`, width: 420, transform: "translate(-50%,-50%)", padding: "16px 24px", boxShadow: "0 0 0 10px var(--bg)" }}>
          <div className="text-[28px] font-extrabold leading-tight">
            <span className="acc">{pad(i + 1)} </span>
            <R s={t} />
          </div>
          <div className="mut mt-1 text-[22px] leading-[1.28]">
            <R s={d} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Bars({ s }: { s: Extract<Slide, { t: "bars" }> }) {
  return (
    <div className="flex h-full flex-col justify-center gap-5">
      {s.bars.map(([l, v, c], i) => (
        <div key={i} className="flex items-center gap-6">
          <div className="w-[400px] shrink-0 text-[27px] font-extrabold leading-tight">
            <R s={l} />
          </div>
          <div className="h-[46px] flex-1 overflow-hidden rounded-full" style={{ background: "var(--card2)", border: "2px solid var(--line)" }}>
            <div className="h-full rounded-full" style={{ width: `${Math.max(v, 3)}%`, background: "linear-gradient(90deg,#f35422,#ff8a5c)" }} />
          </div>
          <div className="mut w-[380px] shrink-0 text-[23px] leading-[1.25]">
            <R s={c} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Sum({ s }: { s: Extract<Slide, { t: "sum" }> }) {
  return (
    <div className="grid h-full grid-cols-2 gap-5" style={{ gridAutoRows: "minmax(0,1fr)" }}>
      {s.items.map((it, i) => (
        <div key={i} className="card flex items-center gap-5" style={{ padding: "18px 28px" }}>
          <span className="numc" style={{ background: "#000", color: "#f35422" }}>
            ✓
          </span>
          <span className="text-[28px] font-semibold leading-[1.28]">
            <R s={it} />
          </span>
        </div>
      ))}
    </div>
  );
}

function Shot({ s }: { s: Extract<Slide, { t: "shot" }> }) {
  const nr = s.rows ? s.rows.length : 0;
  const tfs = nr && nr <= 5 ? 20 : nr <= 7 ? 18 : 17;
  const tpad = nr && nr <= 5 ? 15 : nr <= 7 ? 11 : 9;
  const nl = (s.lines || []).length;
  const lfs = nl && nl <= 9 ? 20 : 18;
  const nfs = s.notes.length <= 3 ? 24 : 22;
  const badge = (idx: number) => {
    const k = s.hi.indexOf(idx);
    return k >= 0 ? k + 1 : 0;
  };
  return (
    <div className="flex h-full gap-8">
      <div className="term flex min-w-0 flex-[1.6] flex-col">
        <div className="flex shrink-0 items-center gap-3 px-6 py-3" style={{ background: "#1a1a1a", borderBottom: "2px solid #383838" }}>
          <span className="h-4 w-4 rounded-full" style={{ background: "#f35422" }} />
          <span className="h-4 w-4 rounded-full bg-[#cbcbcb]" />
          <span className="h-4 w-4 rounded-full bg-[#575757]" />
          <span className="ml-3 text-[19px] font-bold text-white">{s.app}</span>
          {s.path && <span className="mono ml-auto truncate pl-6 text-[15px] text-[#9a9a9a]">{s.path}</span>}
        </div>
        {s.tabs && (
          <div className="flex shrink-0 gap-2 px-4 pt-3" style={{ background: "#111", borderBottom: "2px solid #383838" }}>
            {s.tabs.map((t, i) => (
              <span key={i} className="px-4 py-2 text-[16px] font-bold" style={{ background: i === 0 ? "#050505" : "transparent", color: i === 0 ? "#f35422" : "#9a9a9a", borderBottom: i === 0 ? "3px solid #f35422" : "3px solid transparent" }}>
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-hidden">
          {s.rows && s.cols ? (
            <table className="mono w-full border-collapse text-left" style={{ fontSize: tfs }}>
              <thead>
                <tr>
                  {s.cols.map((c, i) => (
                    <th key={i} className="px-4 py-3 text-[14px] font-bold uppercase tracking-[0.08em]" style={{ background: "#111", borderBottom: "2px solid #383838", color: "#9a9a9a" }}>
                      {c}
                    </th>
                  ))}
                  <th style={{ width: 54, background: "#111", borderBottom: "2px solid #383838" }} />
                </tr>
              </thead>
              <tbody>
                {s.rows.map((r, ri) => {
                  const b = badge(ri);
                  return (
                    <tr key={ri} style={{ background: b ? "rgba(243,84,34,.2)" : ri % 2 ? "#0c0c0c" : "transparent" }}>
                      {r.map((c, ci) => (
                        <td key={ci} className="px-4 align-top" style={{ paddingTop: tpad, paddingBottom: tpad, borderBottom: "1px solid #262626", color: b ? "#fff" : "#cbcbcb", fontWeight: b ? 700 : 400, overflowWrap: "anywhere" }}>
                          {c}
                        </td>
                      ))}
                      <td className="pr-3 align-middle">{b ? <span className="numc" style={{ width: 34, height: 34, fontSize: 17 }}>{b}</span> : null}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="mono py-3 leading-[1.45]" style={{ fontSize: lfs }}>
              {(s.lines || []).map((l, i) => {
                const b = badge(i);
                return (
                  <div key={i} className="flex items-start gap-4 px-4" style={{ background: b ? "rgba(243,84,34,.2)" : "transparent", borderLeft: b ? "4px solid #f35422" : "4px solid transparent" }}>
                    <span className="w-[34px] shrink-0 pt-[3px] text-right text-[14px]" style={{ color: "#575757" }}>
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", color: b ? "#fff" : l.trim().startsWith("#") ? "#9a9a9a" : "#cbcbcb", fontWeight: b ? 700 : 400 }}>
                      {l || " "}
                    </span>
                    {b ? <span className="numc mt-[2px]" style={{ width: 32, height: 32, fontSize: 16 }}>{b}</span> : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {s.detail && (
          <div className="grid shrink-0 grid-cols-2 gap-x-8 gap-y-2 px-6 py-4" style={{ background: "#111", borderTop: "2px solid #383838" }}>
            {s.detail.map(([k, v], i) => (
              <div key={i} className="flex items-baseline justify-between gap-4 text-[17px]">
                <span className="mono" style={{ color: "#9a9a9a" }}>{k}</span>
                <span className="mono text-right font-bold text-white">{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {s.notes.map((n, i) => (
          <div key={i} className="card flex flex-1 items-start gap-4" style={{ padding: "18px 24px" }}>
            <span className="numc" style={{ width: 44, height: 44, fontSize: 22 }}>{i + 1}</span>
            <span className="leading-[1.34]" style={{ fontSize: nfs }}>
              <R s={n} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Deep({ s }: { s: Extract<Slide, { t: "deep" }> }) {
  const n = s.paras.length;
  const cols = n === 4 ? 2 : Math.min(n, 3);
  return (
    <div className="grid h-full gap-6" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, gridAutoRows: "minmax(0,1fr)" }}>
      {s.paras.map(([t, d], i) => (
        <div key={i} className="card rise" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="mb-4 flex items-center gap-4">
            <span className="numc" style={{ width: 52, height: 52, fontSize: 24 }}>{i + 1}</span>
            <div className="text-[29px] font-extrabold leading-[1.1] tracking-tight">
              <R s={t} />
            </div>
          </div>
          <div className="mut leading-[1.42]" style={{ fontSize: n === 4 ? 23 : 25 }}>
            <R s={d} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Main ---------- */
export function SlideView({ s, ch, i, total, reveal }: { s: Slide; ch: Chapter; i: number; total: number; reveal: boolean }) {
  const F = (h: string | undefined, k: string | undefined, body: ReactNode, foot?: string) => (
    <Frame s={s} ch={ch} i={i} total={total} h={h} k={k} foot={foot} note={s.note}>
      {body}
    </Frame>
  );
  switch (s.t) {
    case "cover":
      return (
        <div className="slide tone-dark" data-slide>
          <div className="absolute inset-0 bgdots" />
          <div className="absolute" style={{ right: -60, top: -40, width: 1100, height: 1100, borderRadius: 999, background: "radial-gradient(circle, rgba(243,84,34,.55), rgba(243,84,34,0) 62%)" }} />
          <div className="ghost absolute select-none" style={{ right: 40, bottom: 20, fontSize: 900, WebkitTextStroke: "4px rgba(243,84,34,.55)" }}>
            {pad(ch.n)}
          </div>
          <div className="absolute left-[96px] right-[96px] top-[52px] flex items-center justify-between text-[22px] font-bold uppercase tracking-[0.14em]">
            <div className="flex items-center gap-3">
              <span className="dot" />
              Cybersecurity 101®
            </div>
            <div className="mut">Ιόνιο Πανεπιστήμιο · Έκδοση 2026</div>
          </div>
          <div className="absolute left-[96px] top-[210px] w-[1250px]">
            <div className="mb-8 flex gap-4">
              <span className="pill pill-acc">Κεφάλαιο {pad(ch.n)}</span>
              <span className="pill">Επίπεδο {ch.lvl}</span>
              <span className="pill">⏱ 3 ώρες</span>
            </div>
            <h1 className="ttl m-0" style={{ fontSize: ch.title.length > 48 ? 88 : 108 }}>
              {ch.title}
            </h1>
            <p className="mut mt-8 max-w-[1000px] text-[38px] font-medium leading-[1.3]">{ch.sub}</p>
          </div>
          <div className="absolute bottom-[70px] left-[96px] right-[96px] flex items-end justify-between">
            <div>
              <div className="dim mb-2 text-[20px] font-bold uppercase tracking-[0.14em]">Επίπεδο {ch.lvl} — {ch.lvlName}</div>
              <div className="text-[28px] font-bold">Ψηφιακή Εγκληματολογία & Αντιμετώπιση Περιστατικών · Στυλιανός Καραγιάννης</div>
            </div>
            <div className="pill" style={{ fontSize: 20 }}>DETECT. RESPOND.</div>
          </div>
          <div className="absolute bottom-0 left-0 h-[6px] bg-[#f35422]" style={{ width: `${(1 / total) * 100}%` }} />
        </div>
      );
    case "obj":
      return F(
        undefined,
        undefined,
        <div className="flex h-full gap-14">
          <div className="flex w-[560px] shrink-0 flex-col justify-center">
            <span className="pill pill-acc mb-6 self-start">Μαθησιακοί στόχοι</span>
            <h1 className="ttl m-0 text-[76px]">
              Στο τέλος του κεφαλαίου θα μπορείτε να…
            </h1>
            <div className="mut mt-8 text-[28px] leading-snug">Επιστρέψτε σε αυτούς τους στόχους μετά τη μελέτη και ελέγξτε τον εαυτό σας.</div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-4">
            {s.items.map((it, i) => (
              <div key={i} className="card flex items-center gap-6 rise" style={{ padding: "20px 28px", animationDelay: `${i * 80}ms` }}>
                <span className="numc">{i + 1}</span>
                <span className="text-[29px] font-semibold leading-[1.28]">
                  <R s={it} />
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    case "agenda":
      return F(
        undefined,
        undefined,
        <div className="flex h-full gap-14">
          <div className="flex w-[560px] shrink-0 flex-col justify-center">
            <span className="pill pill-acc mb-4 self-start">Πορεία διδασκαλίας</span>
            <div className="acc font-extrabold leading-[0.9] tracking-tighter" style={{ fontSize: 250 }}>
              3:00
            </div>
            <div className="mt-4 text-[34px] font-bold leading-tight">ώρες · ≈ {ch.slides.length} διαφάνειες</div>
            <div className="mut mt-4 text-[24px] leading-snug">Περίπου 4 λεπτά ανά διαφάνεια, με διάλειμμα 10΄ στη μέση.</div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            {s.items.map(([t, tm], i) => (
              <div key={i} className="hair flex items-center gap-6 py-[13px]">
                <span className="mono acc w-[190px] shrink-0 text-[23px] font-bold">{tm}</span>
                <span className="text-[29px] font-semibold leading-tight">
                  <R s={t} />
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    case "pts":
      return F(s.h, s.k, <Pts s={s} />);
    case "cards":
      return F(s.h, s.k, <Cards s={s} />, s.foot);
    case "flow":
      return F(s.h, s.k, <Flow s={s} />, s.foot);
    case "cycle":
      return F(s.h, s.k, <Cycle s={s} />);
    case "vs":
      return F(s.h, s.k, <Vs s={s} />, s.foot);
    case "code":
      return F(s.h, s.k, <Code s={s} />);
    case "cs":
      return F(s.h, undefined, <Case s={s} />);
    case "stats":
      return F(s.h, s.k, <Stats s={s} />, s.foot);
    case "pyr":
      return F(s.h, s.k, <Pyr s={s} />, s.foot);
    case "stack":
      return F(s.h, s.k, <Stack s={s} />, s.foot);
    case "table":
      return F(s.h, s.k, <Table s={s} />, s.foot);
    case "tl":
      return F(s.h, s.k, <Tl s={s} />, s.foot);
    case "quiz":
      return F(undefined, undefined, <Quiz s={s} reveal={reveal} />);
    case "lab":
      return F(s.h, "Τεχνικό εργαστήριο", <Lab s={s} />);
    case "matrix":
      return F(s.h, s.k, <Matrix s={s} />, s.foot);
    case "hub":
      return F(s.h, s.k, <Hub s={s} />, s.foot);
    case "bars":
      return F(s.h, s.k, <Bars s={s} />, s.foot);
    case "shot":
      return F(s.h, s.k, <Shot s={s} />, s.foot);
    case "deep":
      return F(s.h, s.k, <Deep s={s} />, s.callout);
    case "sum":
      return F("Τα κλειδιά του κεφαλαίου", "Σύνοψη", <Sum s={s} />);
    case "quote":
      return F(
        undefined,
        undefined,
        <div className="relative flex h-full flex-col justify-center">
          <div className="absolute font-extrabold leading-none" style={{ left: -20, top: -70, fontSize: 420, color: "rgba(0,0,0,.2)" }}>
            “
          </div>
          <div className="relative max-w-[1500px] text-[64px] font-extrabold leading-[1.12] tracking-tight" style={{ color: "#000" }}>
            <R s={s.q} />
          </div>
          <div className="relative mt-10 flex items-center gap-5">
            <span className="pill" style={{ background: "#000", color: "#fff", borderColor: "#000" }}>
              {s.by}
            </span>
            <span className="text-[27px] font-semibold">{s.ctx}</span>
          </div>
        </div>
      );
    case "brk":
      return F(
        undefined,
        undefined,
        <div className="flex h-full gap-14">
          <div className="flex w-[820px] shrink-0 flex-col justify-center">
            <span className="pill mb-6 self-start" style={{ background: "#000", color: "#fff", borderColor: "#000" }}>
              ☕ Διάλειμμα · 10 λεπτά
            </span>
            <h1 className="ttl m-0 text-[92px]">{s.h}</h1>
            <p className="mt-8 text-[32px] font-semibold leading-[1.3]">{s.sub}</p>
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-4">
            <div className="text-[20px] font-extrabold uppercase tracking-[0.16em]">Ανασκόπηση πρώτου μισού</div>
            {s.items.map((it, i) => (
              <div key={i} className="card flex items-center gap-5" style={{ padding: "18px 26px", borderRadius: 22 }}>
                <span className="mono text-[24px] font-extrabold" style={{ color: "#f35422" }}>
                  {pad(i + 1)}
                </span>
                <span className="text-[26px] font-semibold leading-[1.25]">
                  <R s={it} />
                </span>
              </div>
            ))}
          </div>
        </div>
      );
  }
}
