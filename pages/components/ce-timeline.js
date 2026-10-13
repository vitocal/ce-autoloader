/**
 * A Gantt chart of the `ce` lifecycle.
 *
 * Every state the registry writes lands as an attribute change, so the whole walk
 * is observable from the outside: one MutationObserver, one timestamp per
 * transition. That matters because the interesting part is not the endpoint but the
 * shape of the walk — how long the module spent fetching against how long the
 * upgrade itself took.
 *
 * Nothing here fakes a state. The chart only draws what the registry wrote.
 */

/** The state before the registry has touched an element. */
const RESTING = "undefined";

const LEGEND = [
  [RESTING, ":not(:defined) — space reserved"],
  ["loading", "module fetching"],
  ["loaded", "in memory, not upgraded"],
  ["defined", "define() ran — upgraded"],
  ["error", "failed (terminal)"],
];

const fmt = (ms) => (ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`);

const stateOf = (el) => el.getAttribute("ce") ?? RESTING;
const isSettled = (el) => ["defined", "error"].includes(stateOf(el));

/**
 * Watch every `selector` element and draw its walk into `container`.
 *
 * @returns {{ stop: () => void }} `stop()` disconnects the observer and the ticker.
 */
export function mountLifecycleTimeline({ container, selector = "[data-ce-watch]" }) {
  const host = typeof container === "string" ? document.querySelector(container) : container;
  if (!host) return { stop() {} };

  const elements = [...document.querySelectorAll(selector)];
  if (elements.length === 0) return { stop() {} };

  // One entry per element: the ordered list of states it has been written into.
  const marks = new Map(elements.map((el) => [el, [{ state: stateOf(el), at: performance.now() }]]));

  const observer = new MutationObserver((records) => {
    let dirty = false;

    for (const record of records) {
      if (record.type !== "attributes" || record.attributeName !== "ce") continue;

      const row = marks.get(record.target);
      if (!row) continue;

      const state = stateOf(record.target);
      if (row[row.length - 1].state === state) continue;

      row.push({ state, at: performance.now() });
      dirty = true;
    }

    if (dirty) {
      render();
      startTicker();
    }
  });

  for (const el of elements) {
    observer.observe(el, { attributes: true, attributeFilter: ["ce"] });
  }

  /**
   * The last segment has no successor, so it is still growing — re-render on a
   * ticker until every element has settled, then stop. Started lazily: before
   * the first load there is nothing worth redrawing.
   */
  let ticker = null;

  function startTicker() {
    if (ticker) return;

    ticker = setInterval(() => {
      render();

      if (elements.every(isSettled)) {
        clearInterval(ticker);
        ticker = null;
      }
    }, 250);
  }

  function render() {
    const now = performance.now();

    const rows = elements.map((el) => {
      const row = marks.get(el);
      const total = row[row.length - 1].at - row[0].at;

      const segments = row
        .map((mark, i) => {
          const next = row[i + 1];
          const span = (next ? next.at : now) - mark.at;

          return `<span class="ce-timeline__seg" data-state="${mark.state}"
                        style="flex-grow:${Math.max(span, 1)}"
                        title="${mark.state} · ${fmt(span)}">${mark.state}</span>`;
        })
        .join("");

      const label = el.getAttribute("label") ?? el.tagName.toLowerCase();
      const note = [el.getAttribute("variant"), el.hasAttribute("naive") ? "defined only" : ""]
        .filter(Boolean)
        .join(" · ");

      return `<li class="ce-timeline__row">
          <span class="ce-timeline__name">${label}${note ? `<small>${note}</small>` : ""}</span>
          <span class="ce-timeline__track">${segments}</span>
          <span class="ce-timeline__total">${fmt(total)}</span>
        </li>`;
    });

    host.innerHTML = `
      <ol class="ce-timeline__rows">${rows.join("")}</ol>
      <ul class="ce-timeline__legend">
        ${LEGEND.map(([state, meaning]) => `<li data-state="${state}"><i></i>${meaning}</li>`).join("")}
      </ul>`;
  }

  render();

  return {
    stop() {
      clearInterval(ticker);
      observer.disconnect();
    },
  };
}
