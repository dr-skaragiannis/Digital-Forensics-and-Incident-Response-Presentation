// Compact DSL for building presentation slides
export type Pair = [string, string];

type SlideU =
  | { t: "cover" }
  | { t: "obj"; items: string[] }
  | { t: "agenda"; items: Pair[] }
  | { t: "pts"; h: string; k: string; items: string[]; side?: Pair }
  | { t: "cards"; h: string; k: string; cards: [string, string, string][]; foot?: string }
  | { t: "flow"; h: string; k: string; steps: Pair[]; foot?: string }
  | { t: "cycle"; h: string; k: string; center: string; steps: Pair[] }
  | { t: "vs"; h: string; k: string; a: [string, string[]]; b: [string, string[]]; foot?: string }
  | { t: "code"; h: string; k: string; cmd: string; out: string; notes: string[] }
  | { t: "cs"; h: string; year: string; org: string; facts: Pair[]; story: string; lessons: string[] }
  | { t: "stats"; h: string; k: string; stats: Pair[]; foot?: string }
  | { t: "pyr"; h: string; k: string; levels: Pair[]; foot?: string }
  | { t: "stack"; h: string; k: string; layers: Pair[]; foot?: string }
  | { t: "table"; h: string; k: string; cols: string[]; rows: string[][]; foot?: string }
  | { t: "tl"; h: string; k: string; events: [string, string, string][]; foot?: string }
  | { t: "quiz"; q: string; opts: string[]; ans: number; why: string }
  | { t: "lab"; h: string; scn: string; phases: Pair[]; deliver: string }
  | { t: "quote"; q: string; by: string; ctx: string }
  | { t: "sum"; items: string[] }
  | { t: "brk"; h: string; sub: string; items: string[] }
  | { t: "matrix"; h: string; k: string; cols: [string, string[]][]; hi: string[]; foot?: string }
  | { t: "hub"; h: string; k: string; center: string; nodes: Pair[]; foot?: string }
  | { t: "bars"; h: string; k: string; bars: [string, number, string][]; foot?: string }
  | {
      t: "shot";
      h: string;
      k: string;
      app: string;
      path?: string;
      tabs?: string[];
      cols?: string[];
      rows?: string[][];
      lines?: string[];
      hi: number[];
      detail?: Pair[];
      notes: string[];
      foot?: string;
    }
  | { t: "deep"; h: string; k: string; paras: Pair[]; callout?: string };

/** Every slide may carry an optional teaching note ("Εμβάθυνση") */
export type Slide = SlideU & { note?: string };

export type ShotOpts = {
  path?: string;
  tabs?: string[];
  cols?: string[];
  rows?: string[][];
  lines?: string[];
  hi: number[];
  detail?: Pair[];
  notes: string[];
  foot?: string;
};
export const shot = (h: string, k: string, app: string, o: ShotOpts): Slide => ({ t: "shot", h, k, app, ...o });
export const deep = (h: string, k: string, paras: Pair[], callout?: string): Slide => ({ t: "deep", h, k, paras, callout });

/** Extension of a chapter: notes keyed by heading substring, and slides inserted after a heading substring */
export type Ext = { notes: Record<string, string>; add: [string, Slide][] };

export type Chapter = {
  n: number;
  lvl: number;
  lvlName: string;
  title: string;
  short: string;
  sub: string;
  slides: Slide[];
};

export const cover = (): Slide => ({ t: "cover" });
export const obj = (items: string[]): Slide => ({ t: "obj", items });
export const agenda = (items: Pair[]): Slide => ({ t: "agenda", items });
export const pts = (h: string, k: string, items: string[], side?: Pair): Slide => ({ t: "pts", h, k, items, side });
export const cards = (h: string, k: string, cards: [string, string, string][], foot?: string): Slide => ({ t: "cards", h, k, cards, foot });
export const flow = (h: string, k: string, steps: Pair[], foot?: string): Slide => ({ t: "flow", h, k, steps, foot });
export const cycle = (h: string, k: string, center: string, steps: Pair[]): Slide => ({ t: "cycle", h, k, center, steps });
export const vs = (h: string, k: string, a: [string, string[]], b: [string, string[]], foot?: string): Slide => ({ t: "vs", h, k, a, b, foot });
export const code = (h: string, k: string, cmd: string, out: string, notes: string[]): Slide => ({ t: "code", h, k, cmd, out, notes });
export const cs = (h: string, year: string, org: string, facts: Pair[], story: string, lessons: string[]): Slide => ({ t: "cs", h, year, org, facts, story, lessons });
export const stats = (h: string, k: string, stats: Pair[], foot?: string): Slide => ({ t: "stats", h, k, stats, foot });
export const pyr = (h: string, k: string, levels: Pair[], foot?: string): Slide => ({ t: "pyr", h, k, levels, foot });
export const stack = (h: string, k: string, layers: Pair[], foot?: string): Slide => ({ t: "stack", h, k, layers, foot });
export const table = (h: string, k: string, cols: string[], rows: string[][], foot?: string): Slide => ({ t: "table", h, k, cols, rows, foot });
export const tl = (h: string, k: string, events: [string, string, string][], foot?: string): Slide => ({ t: "tl", h, k, events, foot });
export const quiz = (q: string, opts: string[], ans: number, why: string): Slide => ({ t: "quiz", q, opts, ans, why });
export const lab = (h: string, scn: string, phases: Pair[], deliver: string): Slide => ({ t: "lab", h, scn, phases, deliver });
export const quote = (q: string, by: string, ctx: string): Slide => ({ t: "quote", q, by, ctx });
export const sum = (items: string[]): Slide => ({ t: "sum", items });
export const brk = (h: string, sub: string, items: string[]): Slide => ({ t: "brk", h, sub, items });
export const matrix = (h: string, k: string, cols: [string, string[]][], hi: string[], foot?: string): Slide => ({ t: "matrix", h, k, cols, hi, foot });
export const hub = (h: string, k: string, center: string, nodes: Pair[], foot?: string): Slide => ({ t: "hub", h, k, center, nodes, foot });
export const bars = (h: string, k: string, bars: [string, number, string][], foot?: string): Slide => ({ t: "bars", h, k, bars, foot });

export const LEVELS: Record<number, string> = {
  1: "Θεμέλια, διαχείριση πειστηρίων και βασικά πλαίσια απειλών",
  2: "Εγκληματολογία συστημάτων και τηλεμετρία τερματικών",
  3: "Υπηρεσίες υποδομής, δικτυακή εγκληματολογία και τηλεμετρία καταγραφών",
  4: "Προηγμένη ανίχνευση, εταιρικό SIEM και ενεργή απόκριση",
};

export const mkChapter = (
  n: number,
  title: string,
  short: string,
  sub: string,
  slides: Slide[]
): Chapter => {
  const lvl = n <= 3 ? 1 : n <= 7 ? 2 : n <= 10 ? 3 : 4;
  return { n, lvl, lvlName: LEVELS[lvl], title, short, sub, slides };
};
