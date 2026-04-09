import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot/+esm";

export default class PerformanceMetricsPlot extends HTMLElement {
  #observer = null;

  connectedCallback() {
    this.#render();
    this.#observe();
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#observer = null;
  }

  /** Re-render whenever the browser records new measure entries */
  #observe() {
    try {
      this.#observer = new PerformanceObserver(() => this.#render());
      this.#observer.observe({ type: "measure", buffered: false });
    } catch {
      // PerformanceObserver not supported — static render only
    }
  }

  #render() {
    const style = getComputedStyle(document.documentElement);
    const colorPrimary =
      style.getPropertyValue("--color-primary").trim() || "oklch(70% 0.15 145)";
    const colorSecondary =
      style.getPropertyValue("--color-secondary").trim() ||
      "oklch(85% 0.15 85)";
    const colorBg = style.getPropertyValue("--color-bg").trim() || "#f5f5f5";
    const colorFg = style.getPropertyValue("--color-fg").trim() || "#222";
    const radiusSm = style.getPropertyValue("--radius-sm").trim() || "0.4rem";

    const entries = performance
      .getEntriesByType("measure")
      .filter((e) => e.name.startsWith("load:") || e.name === "transition")
      .map((e) => ({
        name: e.name.replace("load:", ""),
        start: e.startTime,
        end: e.startTime + e.duration,
        duration: e.duration,
        type: e.name.startsWith("load:") ? "load" : "transition",
      }))
      .sort((a, b) => a.duration - b.duration);

    // Navigation timing milestones
    const [nav] = performance.getEntriesByType("navigation");
    const milestones = nav
      ? [
          { x: nav.domInteractive, label: "TTI" },
          { x: nav.domComplete, label: "DCL" },
        ]
      : [];

    if (entries.length === 0) {
      this.innerHTML = `<p style="
                padding: 1rem; color: ${colorFg}; opacity: 0.5;
                font-size: 0.875rem; text-align: center;">
                No performance measures recorded yet.<br>Interact with a component first.
            </p>`;
      return;
    }

    const plot = Plot.plot({
      marginLeft: 160,
      marginRight: 80,
      marginTop: 24,
      marginBottom: 32,
      width: this.clientWidth || 640,
      title: "Time to load of each component",
      style: `
                background: ${colorBg};
                color: ${colorFg};
                border-radius: ${radiusSm};
                font-family: system-ui, sans-serif;
                font-size: 12px;
                max-width: none;
            `,
      x: { label: "Time (ms) →", grid: true },
      y: {
        grid: true,
        // load entries in chronological order, transition pinned last
        domain: [
          ...entries.filter((d) => d.type === "load").map((d) => d.name),
        ],
      },
      // color: {
      //   legend: true,
      //   domain: ["load"],
      //   range: [colorPrimary, colorSecondary],
      // },
      marks: [
        Plot.barX(entries, {
          x1: (d) => 0,
          x2: (d) => d.duration,
          y: (d) => d.name,
          fill: (d) => d.type,
          rx: 4,
        }),
        // Navigation milestone rules
        // Plot.ruleX(milestones, {
        //   x: (d) => d.x,
        //   stroke: colorFg,
        //   strokeWidth: 1.5,
        //   strokeDasharray: "4 3",
        //   opacity: 0.5,
        // }),
        // Plot.text(milestones, {
        //   x: (d) => d.x,
        //   text: (d) => d.label,
        //   frameAnchor: "top",
        //   dy: 6,
        //   dx: 4,
        //   textAnchor: "start",
        //   fill: colorFg,
        //   fontSize: 10,
        //   fontWeight: 600,
        // }),

        // Interactive tooltip on hover
        Plot.tip(
          entries,
          Plot.pointerY({
            x1: (d) => 0,
            x2: (d) => d.duration,
            y: (d) => d.name,
            title: (d) =>
              `${d.name}\nStart:    ${d.start.toFixed(2)} ms\nDuration: ${d.duration.toFixed(2)} ms`,
          }),
        ),
      ],
    });

    this.innerHTML = "";
    this.append(plot);
  }
}

customElements.define("performance-metrics-plot", PerformanceMetricsPlot);
