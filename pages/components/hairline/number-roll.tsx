// Hairline UI · number-roll · MIT License
// Copyright (c) 2026 Hairline UI · https://hairlineui.com/license#components

import * as React from "react";
import r2wc from "@r2wc/react-to-web-component";
import "./hairline.css";

/* ─────────────────────────────────────────────────────────
 * NUMBER ROLL: numbers that change like an odometer
 *
 *   rolling   each digit is a column that rolls to its new
 *             value, in the direction the number moved: going
 *             up, a 9 rolls on to 0 instead of spinning back
 *   places    new places slide open from nothing; lost ones
 *             fold away
 *   format    anything Intl.NumberFormat does: currency,
 *             percent, compact ("1.2K"), decimals
 *
 * The real number is always there as text for screen readers
 * and copy and paste; the columns are only what you see.
 * ───────────────────────────────────────────────────────── */

export interface NumberRollProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  value: number;
  /** Intl.NumberFormat options, e.g. { style: "currency", currency: "USD" }. */
  format?: Intl.NumberFormatOptions;
  locales?: string | string[];
  prefix?: string;
  suffix?: string;
  /** Start from this value and roll to `value` once mounted, e.g. 0 for stats. */
  from?: number;
  /** Roll duration in ms. */
  duration?: number;
  /** Always roll this way, e.g. "down" for a countdown's seconds, which wrap from 00 to 59. Defaults to the way the number moved. */
  direction?: "up" | "down";
}

type Column = { key: string; char: string; digit: number | null };

const EASE = "cubic-bezier(0.16,1,0.3,1)";
const SETS = 5; // the strip repeats 0–9 five times so a roll never runs out of digits
const MIDDLE = 20;
/** The strip as one text node, a digit a line: fifty lines, but one element to lay out instead of fifty. */
const STRIP = Array.from({ length: SETS * 10 }, (_, i) => i % 10).join("\n");

const reducedQuery = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (onChange: () => void) => {
  const query = window.matchMedia(reducedQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
// preact/compat's `useSyncExternalStore` takes no server snapshot; there is no SSR here.
const useReducedMotion = () =>
  React.useSyncExternalStore(subscribeReduced, () => window.matchMedia(reducedQuery).matches);

/** Digits are keyed by their place counted from the right, so the units column stays the units column. */
function columns(text: string): Column[] {
  const chars = [...text];
  const seen = new Map<string, number>();
  let place = 0;
  const out: Column[] = [];
  for (let i = chars.length - 1; i >= 0; i--) {
    const char = chars[i];
    if (/\d/.test(char)) out.push({ key: `d${place++}`, char, digit: Number(char) });
    else {
      // Symbols are keyed by how many of the same symbol sit to their right, so a comma that shifts is the same comma.
      const n = seen.get(char) ?? 0;
      seen.set(char, n + 1);
      out.push({ key: `s${char}${n}`, char, digit: null });
    }
  }
  return out.reverse();
}

// Memoised: a parent that re-renders with the same number doesn't rebuild the strips.
const Digit = React.memo(function Digit({ digit, trend, duration, reduced, rollIn }: { digit: number; trend: number; duration: number; reduced: boolean; rollIn: boolean }) {
  const [pos, setPos] = React.useState(MIDDLE + (rollIn ? 0 : digit));
  const [moving, setMoving] = React.useState(false);
  const posRef = React.useRef(pos);
  const stripRef = React.useRef<HTMLSpanElement>(null);

  React.useLayoutEffect(() => {
    const current = posRef.current;
    const showing = ((current % 10) + 10) % 10;
    if (showing === digit) return;
    if (reduced) {
      posRef.current = MIDDLE + digit;
      setMoving(false);
      setPos(MIDDLE + digit);
      return;
    }
    const up = trend > 0 || (trend === 0 && digit > showing);
    let target = up ? current + ((digit - showing + 10) % 10) : current - ((showing - digit + 10) % 10);
    // Values arriving faster than a roll (a progress percent) never let it re-centre, so before it runs off the strip,
    // jump the strip back by whole sets mid-roll (it looks identical) and roll on from there.
    if (target < 10 || target > SETS * 10 - 11) {
      const shift = Math.round((target - MIDDLE) / 10) * 10;
      const strip = stripRef.current;
      if (strip?.offsetHeight) {
        let visual = current;
        try {
          visual = -new DOMMatrixReadOnly(getComputedStyle(strip).transform).m42 / (strip.offsetHeight / (SETS * 10));
        } catch {}
        const transition = strip.style.transition;
        strip.style.transition = "none";
        strip.style.transform = `translateY(${(-(visual - shift) * 100) / (SETS * 10)}%)`;
        void strip.offsetHeight;
        strip.style.transition = transition;
      }
      target -= shift;
    }
    posRef.current = target;
    setMoving(true);
    setPos(target);
  }, [digit, trend, reduced]);

  // After a roll, quietly re-centre on the middle set so the next roll always has room.
  const settle = () => {
    const centred = MIDDLE + (((posRef.current % 10) + 10) % 10);
    posRef.current = centred;
    setMoving(false);
    setPos(centred);
  };

  return (
    <span className="relative inline-block [clip-path:inset(0)]">
      <span className="invisible">{digit}</span>
      <span
        ref={stripRef}
        aria-hidden="true"
        onTransitionEnd={settle}
        className="absolute inset-x-0 top-0 block whitespace-pre text-center"
        style={{
          transform: `translateY(${(-pos * 100) / (SETS * 10)}%)`,
          transition: moving ? `transform ${duration}ms ${EASE}` : "none",
        }}
      >
        {STRIP}
      </span>
    </span>
  );
});

/** A place that appeared after the first paint slides open; places that were there from the start just sit. */
function Place({ enter, children }: { enter: boolean; children: React.ReactNode }) {
  const [entering] = React.useState(enter);
  return (
    <span className={`inline-block ${entering ? "[clip-path:inset(0)] animate-[ui-col-in_500ms_cubic-bezier(0.16,1,0.3,1)_both]" : ""}`}>
      {children}
    </span>
  );
}

export function NumberRoll({ value, format, locales, prefix = "", suffix = "", from, duration = 900, direction, className = "", ...props }: NumberRollProps) {
  const reduced = useReducedMotion();
  const [shown, setShown] = React.useState(from ?? value);
  const previous = React.useRef(shown);
  const mounted = React.useRef(false);

  // Roll from `from` to the real value once on screen (a frame later, so the start is painted).
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(value));
    return () => cancelAnimationFrame(frame);
  }, [value]);

  React.useEffect(() => {
    mounted.current = true;
  }, []);

  const formatter = React.useMemo(() => new Intl.NumberFormat(locales, format), [locales, format && JSON.stringify(format)]); // eslint-disable-line react-hooks/exhaustive-deps
  const text = `${prefix}${formatter.format(shown)}${suffix}`;
  const cols = React.useMemo(() => columns(text), [text]);
  const trend = direction === "up" ? 1 : direction === "down" ? -1 : Math.sign(shown - previous.current);

  // Places that disappear fold away instead of vanishing.
  const [leaving, setLeaving] = React.useState<Column[]>([]);
  const lastCols = React.useRef(cols);
  React.useLayoutEffect(() => {
    const gone = lastCols.current.filter((c) => !cols.some((n) => n.key === c.key));
    lastCols.current = cols;
    previous.current = shown;
    if (!gone.length || reduced) return;
    setLeaving(gone);
    const timer = window.setTimeout(() => setLeaving([]), 420);
    return () => window.clearTimeout(timer);
  }, [cols, shown, reduced]);

  return (
    <span className={`inline-flex tabular-nums ${className}`} {...props}>
      <span className="sr-only">{`${prefix}${formatter.format(value)}${suffix}`}</span>
      <span aria-hidden="true" className="inline-flex items-baseline whitespace-pre">
        {leaving.map((c) => (
          <span key={`out-${c.key}`} className="inline-block [clip-path:inset(0)] animate-[ui-col-out_400ms_cubic-bezier(0.16,1,0.3,1)_forwards]">
            {c.char}
          </span>
        ))}
        {cols.map((c) => (
          <Place key={c.key} enter={mounted.current && !reduced}>
            {c.digit === null ? c.char : <Digit digit={c.digit} trend={trend} duration={duration} reduced={reduced} rollIn={mounted.current} />}
          </Place>
        ))}
      </span>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
 * THE CUSTOM ELEMENT: <number-roll value="1234.5">
 *
 * `format` and `locales` arrive as JSON, so
 * <number-roll value="1299" format='{"style":"currency","currency":"USD"}'>.
 * ───────────────────────────────────────────────────────── */

type NumberRollElementProps = {
  value?: number;
  format?: Intl.NumberFormatOptions;
  locales?: string;
  prefix?: string;
  suffix?: string;
  from?: number;
  duration?: number;
  direction?: "up" | "down";
};

const NumberRollElement = r2wc(
  ({ value = 0, format, locales, prefix, suffix, from, duration, direction }: NumberRollElementProps) => (
    <NumberRoll
      value={value}
      format={format}
      locales={locales}
      prefix={prefix}
      suffix={suffix}
      from={from}
      duration={duration}
      direction={direction}
    />
  ),
  {
    props: {
      value: "number",
      format: "json",
      locales: "string",
      prefix: "string",
      suffix: "string",
      from: "number",
      duration: "number",
      direction: "string",
    },
  },
);

export default NumberRollElement;
