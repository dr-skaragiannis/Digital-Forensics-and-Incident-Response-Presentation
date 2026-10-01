import type { Chapter, Ext, Slide } from "./dsl";
import ch01 from "./ch01";
import ch02 from "./ch02";
import ch03 from "./ch03";
import ch04 from "./ch04";
import ch05 from "./ch05";
import ch06 from "./ch06";
import ch07 from "./ch07";
import ch08 from "./ch08";
import ch09 from "./ch09";
import ch10 from "./ch10";
import ch11 from "./ch11";
import ch12 from "./ch12";
import ch13 from "./ch13";
import e01 from "./ext/e01";
import e02 from "./ext/e02";
import e03 from "./ext/e03";
import e04 from "./ext/e04";
import e05 from "./ext/e05";
import e06 from "./ext/e06";
import e07 from "./ext/e07";
import e08 from "./ext/e08";
import e09 from "./ext/e09";
import e10 from "./ext/e10";
import e11 from "./ext/e11";
import e12 from "./ext/e12";
import e13 from "./ext/e13";

const hOf = (s: Slide): string => ((s as unknown as { h?: string }).h ?? "");

/** Adds "Εμβάθυνση" notes and inserts extra slides (screenshots / deep-dives) into a chapter */
function extend(ch: Chapter, ex: Ext): Chapter {
  const slides: Slide[] = ch.slides.map((s) => ({ ...s }));
  for (const [key, note] of Object.entries(ex.notes)) {
    const target = slides.find((s) => hOf(s).includes(key) && !s.note);
    if (target) target.note = note;
    else console.warn(`[ext] note key not found in ch${ch.n}: ${key}`);
  }
  const inserted = new Set<Slide>();
  for (const [key, sl] of ex.add) {
    let idx = slides.findIndex((s) => hOf(s).includes(key));
    if (idx < 0) {
      console.warn(`[ext] anchor not found in ch${ch.n}: ${key}`);
      idx = Math.max(0, slides.length - 3);
    }
    while (idx + 1 < slides.length && inserted.has(slides[idx + 1])) idx++;
    slides.splice(idx + 1, 0, sl);
    inserted.add(sl);
  }
  return { ...ch, slides };
}

export const chapters: Chapter[] = [
  extend(ch01, e01),
  extend(ch02, e02),
  extend(ch03, e03),
  extend(ch04, e04),
  extend(ch05, e05),
  extend(ch06, e06),
  extend(ch07, e07),
  extend(ch08, e08),
  extend(ch09, e09),
  extend(ch10, e10),
  extend(ch11, e11),
  extend(ch12, e12),
  extend(ch13, e13),
];
