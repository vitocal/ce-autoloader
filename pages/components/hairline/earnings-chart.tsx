// Hairline UI · earnings-chart · MIT License
// Copyright (c) 2026 Hairline UI · https://hairlineui.com/license#components

import * as React from "react";
import r2wc from "@r2wc/react-to-web-component";
import "./hairline.css";
import { NumberRoll } from "./number-roll";
import { TextMorph } from "./text-morph";

/* ─────────────────────────────────────────────────────────
 * EARNINGS CHART: a bar chart that changes instead of redrawing
 *
 *   arrive    the first time it's on screen the bars grow up out
 *             of the baseline one after another and the total
 *             rolls up from zero
 *   period    6M, 1Y, All: the pill is thrown to the choice. Bars
 *             the two periods share glide to their new place and
 *             height, bars that leave fold away on their side,
 *             new ones grow in, the scale's labels roll and so
 *             does the total
 *   hover     a hairline column follows the pointer from bar to
 *             bar and the readout at its top slides along, its
 *             month morphing and its amount rolling
 *   change    the difference from the period before sits in a
 *             chip that turns emerald or red, its arrow turning
 *             with it
 *
 * The plot is one tab stop: arrow keys move between bars and
 * the readout is announced. Every figure is also in a table for
 * screen readers.
 * ───────────────────────────────────────────────────────── */

export interface EarningsBar {
  /** Stays the same across periods for the same month, so shared bars glide instead of popping. */
  key: string;
  /** Under the bar, e.g. "Aug". */
  label: string;
  value: number;
  /** In the readout, e.g. "August 2026". Defaults to label. */
  title?: string;
}

export interface EarningsPeriod {
  id: string;
  /** In the switch, e.g. "6M". */
  label: string;
  bars: EarningsBar[];
  /** The total of the period before, for the change chip. */
  previous?: number;
  /** After the chip, e.g. "vs the 6 months before". */
  comparison?: string;
}

export interface EarningsChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  title?: string;
  periods: EarningsPeriod[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  /** Intl.NumberFormat options for amounts. */
  format?: Intl.NumberFormatOptions;
  locales?: string | string[];
  /** The bar drawn in your primary colour, by key. Defaults to the last bar. */
  highlight?: string;
}

type Column = EarningsBar & { left: number; width: number; height: number; index: number; leaving?: "start" | "end" };

const EASE = "cubic-bezier(0.16,1,0.3,1)";
const THROW = "cubic-bezier(0.34,1.36,0.64,1)";
const GLIDE = "cubic-bezier(0.77,0,0.175,1)";
const MORPH = 560;
const PLOT = 176; // the bars' area
const HEADROOM = 30; // above the tallest bar, for the readout
const LABELS = 26;
const GUTTER = 44; // the scale's labels, left of the bars
const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";
const CURRENCY: Intl.NumberFormatOptions = { style: "currency", currency: "USD", maximumFractionDigits: 0 };

const reducedQuery = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (onChange: () => void) => {
  const query = window.matchMedia(reducedQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
// preact/compat's `useSyncExternalStore` takes no server snapshot; there is no SSR here.
const useReducedMotion = () =>
  React.useSyncExternalStore(subscribeReduced, () => window.matchMedia(reducedQuery).matches);

/** A round top for the scale: 4,820 → 5,000. */
function niceMax(value: number) {
  if (value <= 0) return 1;
  const step = 10 ** Math.floor(Math.log10(value));
  for (const m of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * step >= value) return m * step;
  return 10 * step;
}

/** One bar and its label. It grows out of the baseline when it first appears, and folds away when it leaves. */
function ColumnView({
  col,
  grown,
  delay,
  tone,
  reduced,
  label,
}: {
  col: Column;
  grown: boolean;
  delay: number;
  tone: string;
  reduced: boolean;
  label: boolean;
}) {
  const [born, setBorn] = React.useState(false);
  React.useEffect(() => {
    let inner = 0;
    const outer = requestAnimationFrame(() => (inner = requestAnimationFrame(() => setBorn(true))));
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, []);
  const up = grown && born && !col.leaving;
  return (
    <div
      aria-hidden="true"
      className="absolute top-0 h-full"
      style={{
        left: `${col.left}%`,
        width: `${col.width}%`,
        opacity: col.leaving ? 0 : 1,
        transition: reduced ? "none" : `left ${MORPH}ms ${GLIDE}, width ${MORPH}ms ${GLIDE}, opacity ${col.leaving ? 240 : 360}ms ${EASE}`,
      }}
    >
      <div
        className={`absolute bottom-[26px] left-1/2 w-[min(24px,62%)] -translate-x-1/2 rounded-t-[4px] ${tone}`}
        style={{
          height: up ? Math.max(2, col.height) : 0,
          transition: reduced ? "none" : `height 640ms ${EASE} ${delay}ms, background-color 300ms ${EASE}`,
        }}
      />
      <span
        className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] leading-[18px] text-muted-foreground"
        style={{ opacity: label ? 1 : 0, transition: reduced ? "none" : `opacity 300ms ${EASE}` }}
      >
        {col.label}
      </span>
    </div>
  );
}

export function EarningsChart({
  title = "Earnings",
  periods,
  value,
  defaultValue,
  onValueChange,
  format = CURRENCY,
  locales,
  highlight,
  className = "",
  ...props
}: EarningsChartProps) {
  const reduced = useReducedMotion();
  const id = React.useId();
  const [own, setOwn] = React.useState(defaultValue ?? periods[periods.length - 1]?.id);
  const periodId = value ?? own;
  const period = periods.find((p) => p.id === periodId) ?? periods[0];
  const bars = period?.bars ?? [];
  // Set by the card's width in CSS and measured below.
  const [plotH, setPlotH] = React.useState(PLOT);
  const total = bars.reduce((sum, b) => sum + b.value, 0);
  const max = niceMax(Math.max(0, ...bars.map((b) => b.value)));
  const slot = bars.length ? 100 / bars.length : 100;
  const layout: Column[] = bars.map((b, index) => ({ ...b, index, left: index * slot, width: slot, height: (b.value / max) * (plotH - HEADROOM) }));
  const hi = highlight ?? bars[bars.length - 1]?.key;

  const [visible, setVisible] = React.useState(false);
  const [active, setActive] = React.useState<number | null>(null);
  const [keyboard, setKeyboard] = React.useState(false);
  const [leaving, setLeaving] = React.useState<Column[]>([]);
  const [prev, setPrev] = React.useState(() => ({ id: periodId, bars, layout }));
  const [pill, setPill] = React.useState({ left: 0, width: 0, ready: false });
  const rootRef = React.useRef<HTMLDivElement>(null);
  const plotRef = React.useRef<HTMLDivElement>(null);
  const barsRef = React.useRef<HTMLDivElement>(null);
  const chipRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const [width, setWidth] = React.useState(0);

  // A new period: bars it doesn't have fold away on the side they were on, past the bars both periods share.
  if (prev.id !== periodId) {
    const keys = new Set(bars.map((b) => b.key));
    const shared = prev.layout.filter((c) => keys.has(c.key)).map((c) => c.index);
    const firstShared = shared.length ? Math.min(...shared) : prev.layout.length;
    setLeaving(
      prev.layout
        .filter((c) => !keys.has(c.key))
        .map((c) => {
          const side = c.index < firstShared ? "start" : "end";
          // Same key as before, so the bar that was there is the one that folds away.
          return { ...c, leaving: side, left: side === "start" ? 0 : 100, width: 0, height: 0 };
        }),
    );
    setPrev({ id: periodId, bars, layout });
    setActive(null);
  } else if (prev.bars !== bars) {
    setPrev({ id: periodId, bars, layout });
  }

  React.useEffect(() => {
    if (!leaving.length) return;
    const timer = window.setTimeout(() => setLeaving([]), MORPH);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  // The plot's height is set by the card's width in CSS; read it so the drawing fits.
  React.useLayoutEffect(() => {
    const el = plotRef.current;
    if (!el) return;
    const measure = () =>
      setPlotH((h) => {
        const next = el.offsetHeight - LABELS;
        return next > 0 && next !== h ? next : h;
      });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Narrow bars show every other label (or fewer), always keeping the latest.
  React.useLayoutEffect(() => {
    const el = barsRef.current;
    if (!el) return;
    const measure = () => setWidth((w) => (w === el.offsetWidth ? w : el.offsetWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const every = width && bars.length ? Math.max(1, Math.ceil(30 / (width / bars.length))) : 1;

  React.useLayoutEffect(() => {
    const el = chipRefs.current[periods.findIndex((p) => p.id === periodId)];
    if (!el) return;
    setPill((p) => (p.left === el.offsetLeft && p.width === el.offsetWidth ? p : { left: el.offsetLeft, width: el.offsetWidth, ready: p.width > 0 }));
  }, [periodId, periods]);

  const choose = (next: string) => {
    if (next === periodId) return;
    if (value === undefined) setOwn(next);
    onValueChange?.(next);
  };

  const pointAt = (clientX: number) => {
    const r = barsRef.current?.getBoundingClientRect();
    if (!r || !bars.length) return null;
    return Math.min(bars.length - 1, Math.max(0, Math.floor(((clientX - r.left) / r.width) * bars.length)));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!bars.length) return;
    const from =
      active ??
      Math.max(
        0,
        bars.findIndex((b) => b.key === hi),
      );
    const moves: Record<string, number> = { ArrowLeft: from - 1, ArrowRight: from + 1, Home: 0, End: bars.length - 1 };
    if (e.key === "Escape") return setActive(null);
    if (!(e.key in moves)) return;
    e.preventDefault();
    setKeyboard(true);
    setActive(Math.min(bars.length - 1, Math.max(0, active === null ? from : moves[e.key])));
  };

  const fmt = (n: number) => new Intl.NumberFormat(locales, format).format(n);
  const change = period?.previous ? (total - period.previous) / period.previous : null;
  // The chip folds away for a period with nothing to compare against, holding its last figure while it goes.
  const [lastChange, setLastChange] = React.useState(change ?? 0);
  if (change !== null && change !== lastChange) setLastChange(change);
  const shownChange = change ?? lastChange;
  const up = shownChange >= 0;
  const comparable = periods.some((p) => p.previous);
  const shown = active !== null ? bars[active] : null;
  const col = active !== null ? layout[active] : null;
  const compact = { ...format, notation: "compact" as const, minimumFractionDigits: 0, maximumFractionDigits: 1 };

  return (
    <div ref={rootRef} className={`@container w-full rounded-[22px] bg-background shadow-[0_0_0_1px_var(--border)] ${className}`} {...props}>
      <div className="p-4 @md:p-5 [--gutter:30px] @md:[--gutter:40px] [--plot:148px] @md:[--plot:176px]">
        {/* The title and its control share a row; the figures sit under both. */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <p className="text-[12px] text-muted-foreground @md:text-[13px]">{title}</p>
          <div role="radiogroup" aria-label="Period" className="relative -my-1 inline-flex shrink-0 rounded-full bg-muted p-0.5">
            <span
              aria-hidden="true"
              className="absolute inset-y-0.5 left-0 rounded-full bg-background shadow-[0_0_0_1px_var(--border)]"
              style={{
                width: pill.width,
                transform: `translateX(${pill.left}px)`,
                transition: pill.ready && !reduced ? `transform 460ms ${THROW}, width 380ms ${EASE}` : "none",
              }}
            />
            {periods.map((p, i) => {
              const selected = p.id === periodId;
              return (
                <button
                  key={p.id}
                  ref={(el) => {
                    chipRefs.current[i] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => choose(p.id)}
                  onKeyDown={(e) => {
                    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                    e.preventDefault();
                    const next = (i + (e.key === "ArrowRight" ? 1 : -1) + periods.length) % periods.length;
                    choose(periods[next].id);
                    chipRefs.current[next]?.focus();
                  }}
                  className={`cursor-pointer relative h-6 rounded-full px-2.5 text-[11.5px] font-medium @md:h-7 @md:px-3 @md:text-[12.5px] tabular-nums transition-colors duration-300 ${FOCUS} ${
                    selected ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
        <p className="mt-0.5 text-[22px] font-medium leading-tight tracking-[-0.03em] @md:text-[26px] text-foreground">
          <NumberRoll value={visible ? total : 0} format={format} locales={locales} duration={1000} />
        </p>
        {(comparable || period?.comparison) && (
          <p className="mt-1 flex items-center text-[11.5px] text-muted-foreground @md:text-[12.5px]">
            <span
              className="grid"
              style={{
                gridTemplateColumns: change !== null ? "1fr" : "0fr",
                opacity: change !== null ? 1 : 0,
                transition: reduced ? "none" : `grid-template-columns 420ms ${EASE}, opacity 240ms ${EASE}`,
              }}
            >
              <span className="min-w-0 pr-2 [clip-path:inset(-4px_-2px)]">
                <span
                  className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-1.5 py-px font-medium tabular-nums transition-colors duration-300 ${
                    up ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600 dark:text-red-400"
                  }`}
                >
                  <svg
                    viewBox="0 0 12 12"
                    aria-hidden="true"
                    className="size-3"
                    style={{ transform: up ? "none" : "rotate(180deg)", transition: reduced ? "none" : `transform 420ms ${THROW}` }}
                  >
                    <path
                      d="M6 9.5V2.5M2.8 5.6 6 2.5l3.2 3.1"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <NumberRoll value={visible ? Math.abs(shownChange) : 0} format={{ style: "percent", maximumFractionDigits: 1 }} duration={800} />
                </span>
              </span>
            </span>
            <span className="whitespace-nowrap">
              <TextMorph>{period?.comparison ?? " "}</TextMorph>
            </span>
          </p>
        )}

        <div
          ref={plotRef}
          role="group"
          tabIndex={0}
          aria-label={`${title}, ${period?.label ?? ""}. Use the arrow keys to read each bar.`}
          onKeyDown={onKeyDown}
          onBlur={() => keyboard && (setActive(null), setKeyboard(false))}
          onPointerMove={(e) => {
            setKeyboard(false);
            setActive(pointAt(e.clientX));
          }}
          onPointerDown={(e) => setActive(pointAt(e.clientX))}
          onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
          className={`relative mt-4 touch-pan-y @md:mt-5 select-none rounded-lg ${FOCUS}`}
          style={{ height: `calc(var(--plot) + ${LABELS}px)` }}
        >
          {/* The scale: rolling labels in the gutter, the top and the middle as hairlines, and the baseline. */}
          {[1, 0.5, 0].map((f) => (
            <div key={f} aria-hidden="true" className="absolute right-0" style={{ left: 0, top: HEADROOM + (1 - f) * (plotH - HEADROOM) }}>
              <span
                className="absolute left-0 top-0 -translate-y-1/2 text-[10.5px] tabular-nums leading-none text-muted-foreground/80"
                style={{ width: "calc(var(--gutter) - 8px)", textAlign: "right" }}
              >
                <NumberRoll value={visible ? max * f : 0} format={compact} locales={locales} duration={700} />
              </span>
              <div className="border-t border-border" style={{ marginLeft: "var(--gutter)" }} />
            </div>
          ))}

          <div ref={barsRef} className="absolute inset-y-0 right-0" style={{ left: "var(--gutter)" }}>
            {/* The hovered column: a hairline lane from the readout down to the baseline. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute rounded-[10px] bg-foreground/[0.02] shadow-[inset_0_0_0_1px_var(--border)]"
              style={{
                top: 2,
                height: plotH - 2,
                left: col ? `calc(${col.left}% + 2px)` : 0,
                width: col ? `calc(${col.width}% - 4px)` : 0,
                opacity: col ? 1 : 0,
                transition: reduced ? "none" : `left 380ms ${THROW}, width 380ms ${EASE}, opacity 200ms ${EASE}`,
              }}
            />

            {[...layout, ...leaving.filter((l) => !bars.some((b) => b.key === l.key))].map((c) => (
              <ColumnView
                key={c.key}
                col={c}
                grown={visible}
                delay={c.leaving ? 0 : Math.min(c.index, 12) * 28}
                label={!c.leaving && (bars.length - 1 - c.index) % every === 0}
                reduced={reduced}
                tone={
                  c.key === hi
                    ? "bg-primary"
                    : active !== null && bars[active]?.key === c.key
                      ? "bg-foreground/25"
                      : active !== null
                        ? "bg-foreground/[0.07]"
                        : "bg-foreground/[0.11]"
                }
              />
            ))}

            {/* The readout rides the top of the lane: month morphs, amount rolls. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-[5px] flex h-[22px] -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-background px-2.5 text-[11.5px] shadow-[0_0_0_1px_var(--border)]"
              style={{
                left: col ? `clamp(56px, ${col.left + col.width / 2}%, calc(100% - 56px))` : "50%",
                opacity: shown ? 1 : 0,
                scale: shown ? "1" : "0.94",
                transition: reduced ? "none" : `left 380ms ${THROW}, opacity 200ms ${EASE}, scale 260ms ${EASE}`,
              }}
            >
              <span className="text-muted-foreground">
                <TextMorph>{shown ? (shown.title ?? shown.label) : " "}</TextMorph>
              </span>
              <span className="font-medium tabular-nums text-foreground">
                <NumberRoll value={shown?.value ?? 0} format={format} locales={locales} duration={600} />
              </span>
            </div>
          </div>
        </div>

        <p aria-live="polite" className="sr-only">
          {keyboard && shown ? `${shown.title ?? shown.label}: ${fmt(shown.value)}` : ""}
        </p>
        <table className="sr-only">
          <caption>
            {title}, {period?.label}: {fmt(total)}
          </caption>
          <tbody>
            {bars.map((b) => (
              <tr key={b.key} id={`${id}-${b.key}`}>
                <th scope="row">{b.title ?? b.label}</th>
                <td>{fmt(b.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * THE CUSTOM ELEMENT: <earnings-chart periods='[…]'>
 *
 * `periods` and `format` arrive as JSON — a server rendering this tag
 * writes the same string. `value` makes the period controlled, and
 * `on-value-change` names a function on `window`, like `on-stop`.
 * ───────────────────────────────────────────────────────── */

type EarningsChartElementProps = {
  title?: string;
  periods?: EarningsPeriod[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  format?: Intl.NumberFormatOptions;
  locales?: string;
  highlight?: string;
};

const EarningsChartElement = r2wc(
  ({ title, periods = [], value, defaultValue, onValueChange, format, locales, highlight }: EarningsChartElementProps) => (
    <EarningsChart
      title={title}
      periods={periods}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      format={format}
      locales={locales}
      highlight={highlight}
    />
  ),
  {
    props: {
      title: "string",
      periods: "json",
      value: "string",
      defaultValue: "string",
      onValueChange: "function",
      format: "json",
      locales: "string",
      highlight: "string",
    },
  },
);

export default EarningsChartElement;
