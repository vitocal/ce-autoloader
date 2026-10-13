/**
 * The Hairline UI demo on the landing page (index.html → `#hairline-ui`).
 *
 * Everything is driven through attributes, because attributes are what r2wc
 * converts: `status`, `lines` (JSON), `started-at`, `exit-code`, `ended-at`. A
 * page that streamed the log from a server would write exactly these, so the
 * demo never touches a React tree — and never needs the component's module,
 * which is fetched when the tags scroll into view.
 *
 * `on-stop` is the one function prop. r2wc resolves a function prop from an
 * attribute by looking the attribute's *value* up on `window`, so the Stop
 * button is wired by name. `window.ceCommandStop` has to exist before the
 * elements upgrade, which is why this module is loaded before `pages/index.ts`.
 */

type Run = {
  el: HTMLElement;
  script: string[];
  lines: string[];
  /** Set when the command fails; the code rolls into the status line. */
  exitCode?: number;
  timers: number[];
};

const PASSING = [
  " ✓ registry resolves a URL loader (12ms)",
  " ✓ visible paints every sibling of a tag (31ms)",
  " ✓ the define queue retimes into the view transition (48ms)",
  " ✓ the import map is read as the catalog (7ms)",
  " 57 passing (2.4s)",
];

const FAILING = [
  "vite v8.1.3 building for production...",
  "✓ 42 modules transformed.",
  "error during build:",
  "src/index.ts (118:21): Expected ';' but found '}'",
  "  ELIFECYCLE  Command failed with exit code 1.",
];

const LINE_MS = 340;

const runs: Run[] = [];

const clear = (run: Run) => {
  run.timers.forEach(window.clearTimeout);
  run.timers = [];
};

const settle = (run: Run, status: "success" | "error" | "cancelled") => {
  clear(run);
  run.el.setAttribute("status", status);
  run.el.setAttribute("ended-at", String(Date.now()));
  if (status === "error" && run.exitCode !== undefined) {
    run.el.setAttribute("exit-code", String(run.exitCode));
  }
};

const start = (run: Run) => {
  clear(run);
  run.lines = [];
  run.el.setAttribute("lines", "[]");
  run.el.setAttribute("status", "running");
  run.el.setAttribute("started-at", String(Date.now()));
  run.el.removeAttribute("ended-at");
  run.el.removeAttribute("exit-code");

  run.script.forEach((line, index) => {
    run.timers.push(
      window.setTimeout(() => {
        run.lines.push(line);
        run.el.setAttribute("lines", JSON.stringify(run.lines));
      }, LINE_MS * (index + 1)),
    );
  });

  run.timers.push(
    window.setTimeout(
      () => settle(run, run.exitCode === undefined ? "success" : "error"),
      LINE_MS * (run.script.length + 2),
    ),
  );
};

/** r2wc binds this to the element it came from, so one handler serves both runs. */
window.ceCommandStop = function ceCommandStop(this: HTMLElement) {
  const run = runs.find((candidate) => candidate.el === this);
  if (run) settle(run, "cancelled");
};

const pass = document.getElementById("hairline-pass");
const fail = document.getElementById("hairline-fail");
const morph = document.getElementById("hairline-morph");

if (pass && fail) {
  runs.push({ el: pass, script: PASSING, lines: [], timers: [] });
  runs.push({ el: fail, script: FAILING, lines: [], exitCode: 1, timers: [] });
}

document.getElementById("hairline-replay")?.addEventListener("click", () => runs.forEach(start));

/**
 * The morph cycles its own `text` while the section is on screen — a defined tag
 * cannot un-define itself, but an attribute can change as often as it likes.
 */
const WORDS = ["Save", "Saving", "Saved", "Save"];
let word = 0;
let cycle = 0;

const setCycling = (on: boolean) => {
  window.clearInterval(cycle);
  cycle = 0;
  if (!on || !morph) return;
  cycle = window.setInterval(() => morph.setAttribute("text", WORDS[++word % WORDS.length]), 1800);
};

const section = document.getElementById("hairline-ui");
let streamed = false;

if (section && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const seen = entries.some((entry) => entry.isIntersecting);
      setCycling(seen);
      // The log streams once, where it can be watched; the replay button is for after that.
      if (!seen || streamed) return;
      streamed = true;
      runs.forEach(start);
    },
    { rootMargin: "0px 0px -15% 0px" },
  );
  observer.observe(section);
} else {
  setCycling(true);
  runs.forEach(start);
}
