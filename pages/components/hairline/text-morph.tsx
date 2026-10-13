// Hairline UI · text-morph · MIT License
// Copyright (c) 2026 Hairline UI · https://hairlineui.com/license#components

import * as React from "react";
import r2wc from "@r2wc/react-to-web-component";
import "./hairline.css";

/* ─────────────────────────────────────────────────────────
 * TEXT MORPH: text that changes the way it should
 *
 *   shared   letters both texts share stay alive and slide to
 *            their new place ("Save" → "Saving" keeps "Sav")
 *   new      letters that weren't there rise in out of a blur,
 *            one after another
 *   gone     letters that leave lift away and blur out where
 *            they stood
 *   width    the box eases to its new width, so a button or
 *            pill holding it resizes with it
 *
 * Texts with little in common crossfade as a whole instead of
 * flinging single letters across. The real text is always
 * there for screen readers.
 * ───────────────────────────────────────────────────────── */

export interface TextMorphProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  children: string;
  /** Morph time in ms. */
  duration?: number;
  /** Where new letters come from: below ("up") or above ("down"). */
  direction?: "up" | "down";
  /** Ease the box's width too; turn off for text that wraps. */
  animateWidth?: boolean;
}

type Glyph = { key: number; char: string };
type Leaving = Glyph & { x: number; y: number };

const EASE = "cubic-bezier(0.16,1,0.3,1)";

const reducedQuery = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (onChange: () => void) => {
  const query = window.matchMedia(reducedQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
// preact/compat's `useSyncExternalStore` takes no server snapshot; there is no SSR here.
const useReducedMotion = () =>
  React.useSyncExternalStore(subscribeReduced, () => window.matchMedia(reducedQuery).matches);

/** Keep the letters two texts share (longest common subsequence); everything else is new. */
function morph(previous: Glyph[], text: string, nextKey: () => number): Glyph[] {
  const a = previous.map((g) => g.char);
  const b = Array.from(text);
  const fresh = () => b.map((char) => ({ key: nextKey(), char }));
  if (!a.length || !b.length) return fresh();

  const dp = Array.from({ length: a.length + 1 }, () => new Uint16Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);

  // Too little in common reads as two different words: crossfade them instead.
  if (dp[0][0] < Math.min(a.length, b.length) * 0.5) return fresh();

  const out: Glyph[] = [];
  let i = 0;
  let j = 0;
  while (j < b.length) {
    if (i < a.length && a[i] === b[j]) {
      out.push(previous[i++]);
      j++;
    } else if (i < a.length && dp[i + 1][j] >= dp[i][j + 1]) i++;
    else out.push({ key: nextKey(), char: b[j++] });
  }
  return out;
}

function LeavingGlyph({ glyph, lift, duration, onDone }: { glyph: Leaving; lift: number; duration: number; onDone: (key: number) => void }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const animation = el.animate(
      [
        { opacity: 1, filter: "blur(0px)", transform: "none" },
        { opacity: 0, filter: "blur(4px)", transform: `translateY(${lift}em)` },
      ],
      { duration: duration * 0.6, easing: EASE, fill: "forwards" },
    );
    animation.onfinish = () => onDone(glyph.key);
    return () => animation.cancel();
  }, [glyph.key, lift, duration, onDone]);
  return (
    <span ref={ref} aria-hidden="true" className="pointer-events-none absolute whitespace-pre" style={{ left: glyph.x, top: glyph.y }}>
      {glyph.char}
    </span>
  );
}

export function TextMorph({ children: text, duration = 460, direction = "up", animateWidth = true, className = "", ...props }: TextMorphProps) {
  const reduced = useReducedMotion();
  const counter = React.useRef(text.length);
  const nextKey = React.useCallback(() => ++counter.current, []);
  const [glyphs, setGlyphs] = React.useState<Glyph[]>(() => Array.from(text).map((char, i) => ({ key: i + 1, char })));
  const [leaving, setLeaving] = React.useState<Leaving[]>([]);
  const rootRef = React.useRef<HTMLSpanElement>(null);
  const els = React.useRef(new Map<number, HTMLSpanElement>());
  const before = React.useRef<{ at: Map<number, { x: number; y: number }>; width: number } | null>(null);
  const rise = direction === "up" ? 0.35 : -0.35;

  // 1. The text changed: note where every letter stands, then work out which letters stay.
  React.useLayoutEffect(() => {
    if (text === glyphs.map((g) => g.char).join("")) return;
    const root = rootRef.current;
    if (!root || reduced) {
      setLeaving([]);
      setGlyphs(Array.from(text).map((char) => ({ key: nextKey(), char })));
      return;
    }
    const box = root.getBoundingClientRect();
    const at = new Map<number, { x: number; y: number }>();
    els.current.forEach((el, key) => {
      const r = el.getBoundingClientRect();
      at.set(key, { x: r.left - box.left, y: r.top - box.top });
    });
    before.current = { at, width: box.width };
    const next = morph(glyphs, text, nextKey);
    const kept = new Set(next.map((g) => g.key));
    setLeaving((l) => [...l, ...glyphs.filter((g) => !kept.has(g.key)).map((g) => ({ ...g, ...(at.get(g.key) ?? { x: 0, y: 0 }) }))]);
    setGlyphs(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, reduced]);

  // 2. The new letters are in place: glide the ones that stayed, raise the new ones, ease the width.
  React.useLayoutEffect(() => {
    const prev = before.current;
    const root = rootRef.current;
    if (!prev || !root) return;
    before.current = null;
    const box = root.getBoundingClientRect();
    let order = 0;
    for (const g of glyphs) {
      const el = els.current.get(g.key);
      if (!el) continue;
      const from = prev.at.get(g.key);
      if (from) {
        const r = el.getBoundingClientRect();
        const dx = from.x - (r.left - box.left);
        const dy = from.y - (r.top - box.top);
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5)
          el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration, easing: EASE });
      } else {
        el.animate(
          [
            { opacity: 0, filter: "blur(4px)", transform: `translateY(${rise}em)` },
            { opacity: 1, filter: "blur(0px)", transform: "none" },
          ],
          { duration, easing: EASE, delay: Math.min(order++ * 16, 160), fill: "backwards" },
        );
      }
    }
    if (animateWidth && Math.abs(prev.width - box.width) > 0.5) {
      // Hold the words on one line while the box is narrower than them, or "No credits left" would wrap mid-morph.
      root.style.whiteSpace = "nowrap";
      const resize = root.animate([{ width: `${prev.width}px` }, { width: `${box.width}px` }], { duration, easing: EASE });
      resize.onfinish = resize.oncancel = () => {
        root.style.whiteSpace = "";
      };
    }
  }, [glyphs, duration, rise, animateWidth]);

  const done = React.useCallback((key: number) => setLeaving((l) => l.filter((g) => g.key !== key)), []);

  // Words stay unbroken; lines may only wrap at spaces.
  const words: Glyph[][] = [];
  for (const g of glyphs) {
    if (g.char === " " || !words.length || words[words.length - 1][0]?.char === " ") words.push([g]);
    else words[words.length - 1].push(g);
  }

  return (
    <span ref={rootRef} className={`relative inline-block ${className}`} {...props}>
      <span className="sr-only">{text}</span>
      {words.map((word, w) => (
        <span key={w} aria-hidden="true" className="inline-block whitespace-pre">
          {word.map((g) => (
            <span
              key={g.key}
              ref={(el) => {
                if (el) els.current.set(g.key, el);
                else els.current.delete(g.key);
              }}
              className="inline-block"
            >
              {g.char}
            </span>
          ))}
        </span>
      ))}
      {leaving.map((g) => (
        <LeavingGlyph key={`out-${g.key}`} glyph={g} lift={-rise} duration={duration} onDone={done} />
      ))}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
 * THE CUSTOM ELEMENT: <text-morph text="Saving">
 *
 * r2wc reads the attributes below and re-renders on every change. `text` is
 * the component's `children`; `animate-width` is false for text that wraps.
 * ───────────────────────────────────────────────────────── */

type TextMorphElementProps = Omit<TextMorphProps, "children"> & { text?: string };

const TextMorphElement = r2wc(
  ({ text = "", duration, direction, animateWidth }: TextMorphElementProps) => (
    <TextMorph duration={duration} direction={direction} animateWidth={animateWidth}>
      {text}
    </TextMorph>
  ),
  {
    props: {
      text: "string",
      duration: "number",
      direction: "string",
      animateWidth: "boolean",
    },
  },
);

export default TextMorphElement;
