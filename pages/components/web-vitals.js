/**
 * `<web-vitals>` — this page's Core Web Vitals, measured live.
 *
 * Every number comes straight from `web-vitals`, the library CrUX, PageSpeed
 * Insights and Lighthouse all agree on, rated against the same thresholds they
 * rate against:
 *
 *   LCP 2.5 s / 4 s    INP 200 / 500 ms    CLS 0.1 / 0.25
 *   FCP 1.8 s / 3 s    TTFB 800 / 1800 ms
 *
 * The headline is the Core Web Vitals assessment — the pass/fail CrUX reports —
 * with one honest difference: this is a single, unthrottled session, not the
 * 75th percentile of real users.
 *
 * Refs:
 *   https://github.com/GoogleChrome/web-vitals
 *   https://web.dev/articles/vitals
 */
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

/**
 * The three Core Web Vitals first, then the two supporting metrics, each with
 * the rating thresholds web-vitals publishes for it.
 */
const METRICS = [
  {
    id: "lcp",
    type: "largest-contentful-paint",
    acronym: "LCP",
    label: "Largest Contentful Paint",
    unit: "seconds",
    good: 2500,
    poor: 4000,
    core: true,
    href: "https://web.dev/articles/lcp",
  },
  {
    id: "inp",
    type: "event",
    acronym: "INP",
    label: "Interaction to Next Paint",
    unit: "milliseconds",
    good: 200,
    poor: 500,
    core: true,
    href: "https://web.dev/articles/inp",
  },
  {
    id: "cls",
    type: "layout-shift",
    acronym: "CLS",
    label: "Cumulative Layout Shift",
    unit: "unitless",
    good: 0.1,
    poor: 0.25,
    core: true,
    href: "https://web.dev/articles/cls",
  },
  {
    id: "fcp",
    type: "paint",
    acronym: "FCP",
    label: "First Contentful Paint",
    unit: "seconds",
    good: 1800,
    poor: 3000,
    href: "https://web.dev/articles/fcp",
  },
  {
    id: "ttfb",
    type: "navigation",
    acronym: "TTFB",
    label: "Time to First Byte",
    unit: "milliseconds",
    good: 800,
    poor: 1800,
    href: "https://web.dev/articles/ttfb",
  },
];

const RUNS = "https://pagespeed.web.dev/analysis?url=https://vitocal.github.io/ce-autoloader/";

const RATING_LABELS = {
  good: "Good",
  average: "Needs improvement",
  poor: "Poor",
  unknown: "Not measured",
  unsupported: "Not supported",
};

/**
 * Entry types this engine can observe. CLS is the one that bites: `layout-shift`
 * is Chromium-only, so Firefox and Safari can never produce a value for it, and
 * the panel should say so rather than wait for one forever.
 */
const SUPPORTED = new Set(globalThis.PerformanceObserver?.supportedEntryTypes ?? []);

function isSupported(metric) {
  return SUPPORTED.has(metric.type);
}

/** web-vitals' rating bands: at or under `good`, at or under `poor`, else poor. */
function ratingFor(metric, value) {
  if (!isSupported(metric)) return "unsupported";
  if (value == null || !Number.isFinite(value)) return "unknown";
  if (value <= metric.good) return "good";
  if (value <= metric.poor) return "average";
  return "poor";
}

/** Seconds with one decimal, milliseconds, or a raw ratio. */
function formatValue(metric, value) {
  if (!isSupported(metric)) return "n/a";
  if (value == null || !Number.isFinite(value)) return "—";
  if (metric.unit === "seconds") return `${(value / 1000).toFixed(1)} s`;
  if (metric.unit === "milliseconds") return `${Math.round(value)} ms`;
  return value.toFixed(3);
}

export default class WebVitals extends HTMLElement {
  /** Metric values in their own units: ms for time, a ratio for CLS. */
  #values = { fcp: null, lcp: null, cls: null, inp: null, ttfb: null };

  #renderFrame = null;
  #panel = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `<style>${STYLES}</style><div class="panel"></div>`;
    this.#panel = this.shadowRoot.querySelector(".panel");

    // `reportAllChanges` matters here: without it web-vitals withholds LCP and
    // CLS until the page is hidden or the user interacts, and a panel nobody has
    // touched yet would sit empty. Buffered entries mean subscribing now still
    // sees paints that happened before this element upgraded.
    const live = { reportAllChanges: true };
    onLCP(({ value }) => this.#set("lcp", value), live);
    onINP(({ value }) => this.#set("inp", value), live);
    onCLS(({ value }) => this.#set("cls", value), live);
    onFCP(({ value }) => this.#set("fcp", value), live);
    onTTFB(({ value }) => this.#set("ttfb", value), live);

    this.#render();
  }

  disconnectedCallback() {
    cancelAnimationFrame(this.#renderFrame);
  }

  #set(id, value) {
    if (this.#values[id] === value) return;
    this.#values[id] = value;
    this.#scheduleRender();
  }

  #scheduleRender() {
    if (this.#renderFrame) return;
    this.#renderFrame = requestAnimationFrame(() => {
      this.#renderFrame = null;
      this.#render();
    });
  }

  /**
   * CrUX's pass/fail, once every Core Web Vital has a value. INP is the one that
   * stays empty on a page nobody has interacted with yet, which is worth saying
   * out loud rather than showing as a failure.
   */
  #verdict() {
    const core = METRICS.filter((metric) => metric.core && isSupported(metric));
    const missing = core.filter((metric) => this.#values[metric.id] == null);

    if (missing.length === 1 && missing[0].id === "inp") {
      return { rating: "unknown", text: "Waiting for a first interaction" };
    }
    if (missing.length) return { rating: "unknown", text: "Measuring…" };

    const good = core.every((metric) => ratingFor(metric, this.#values[metric.id]) === "good");
    return good ? { rating: "good", text: "Passed" } : { rating: "poor", text: "Failed" };
  }

  #render() {
    const verdict = this.#verdict();

    const rows = METRICS.map((metric) => {
      const value = this.#values[metric.id];
      const rating = ratingFor(metric, value);
      const supporting = metric.core ? "" : ' data-supporting="true"';
      return `
        <li data-rating="${rating}"${supporting}>
          <span class="dot" aria-hidden="true"></span>
          <span class="name">
            <a href="${metric.href}" target="_blank" rel="noopener">${metric.label}</a>
            <span class="acronym">${metric.acronym}</span>
          </span>
          <span class="value">${formatValue(metric, value)}</span>
          <span class="rating">${RATING_LABELS[rating]}</span>
        </li>`;
    }).join("");

    this.#panel.innerHTML = `
      <div class="headline" data-rating="${verdict.rating}">
        <p class="title">Core Web Vitals <span class="verdict">${verdict.text}</span></p>
        <p class="note">
          This session, unthrottled, in this browser. CrUX judges the 75th percentile of real users instead —
          <a href="${RUNS}" target="_blank" rel="noopener">run Lighthouse on this page</a>.
        </p>
      </div>
      <ul class="metrics">${rows}</ul>
    `;
  }
}

const STYLES = `
  :host {
    display: block;
    contain: layout;
    font-family: var(--font-body, system-ui, sans-serif);
    color: var(--color-fg, #222);
    --rating-good: var(--color-primary, oklch(70% 0.15 145));
    --rating-average: color-mix(in srgb, var(--color-secondary, oklch(85% 0.15 85)), black 12%);
    --rating-poor: var(--color-accent, oklch(60% 0.25 25));
    --rating-unknown: var(--color-fg-muted, #8a8a8a);
    --hairline: color-mix(in srgb, currentColor, transparent 86%);
  }

  .panel {
    display: grid;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    border: 1px solid var(--hairline);
    border-radius: var(--radius-md, 0.75rem);
    background: var(--color-bg-light, #fff);
  }

  .title {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    font-family: var(--font-display, inherit);
    font-size: 1.35rem;
    font-weight: 700;
    line-height: 1.1;
  }

  .verdict {
    font-family: var(--font-mono, monospace);
    font-size: 0.62rem;
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0.15rem 0.55rem;
    border: 1px solid currentColor;
    border-radius: 1rem;
    color: var(--rating-unknown);
  }
  .headline[data-rating="good"] .verdict { color: var(--rating-good); }
  .headline[data-rating="poor"] .verdict { color: var(--rating-poor); }

  .note { margin: 0.35rem 0 0; font-size: 0.8rem; line-height: 1.45; color: var(--color-fg-muted, #666); }
  .note a { color: inherit; }

  .metrics { margin: 0; padding: 0; list-style: none; }
  .metrics li {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 0.6rem;
    padding: 0.4rem 0;
  }
  .metrics li + li { border-top: 1px solid var(--hairline); }

  .dot { width: 0.6rem; height: 0.6rem; border-radius: 50%; background: var(--rating-unknown); }
  li[data-rating="good"] .dot { background: var(--rating-good); }
  li[data-rating="average"] .dot { background: var(--rating-average); }
  li[data-rating="poor"] .dot { background: var(--rating-poor); }
  li[data-rating="unsupported"] .dot { background: none; border: 1px dashed var(--rating-unknown); }

  .name { display: flex; align-items: baseline; gap: 0.4rem; flex-wrap: wrap; font-size: 0.9rem; }
  .name a { color: inherit; text-underline-offset: 0.2em; text-decoration-color: var(--hairline); }
  .acronym { font-family: var(--font-mono, monospace); font-size: 0.7rem; color: var(--rating-unknown); }
  .value { font-size: 0.95rem; font-weight: 600; font-variant-numeric: tabular-nums; }
  .rating { min-width: 8.5rem; text-align: right; font-size: 0.72rem; color: var(--color-fg-muted, #666); }

  /* FCP and TTFB are context for the three Core Web Vitals, not part of them. */
  li[data-supporting] .name a,
  li[data-supporting] .value { color: var(--color-fg-muted, #666); }
  li[data-supporting] .value { font-weight: 500; }

  @media (max-width: 34rem) {
    .metrics li { grid-template-columns: auto minmax(0, 1fr) auto; }
    .rating { grid-column: 2 / -1; min-width: 0; text-align: left; }
  }
`;

if (!customElements.get("web-vitals")) {
  customElements.define("web-vitals", WebVitals);
}
