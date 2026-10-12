import { chromium, firefox, webkit } from "playwright";
import { spawn } from "node:child_process";

/**
 * Cross-browser integration runner.
 *
 * The suites live in `test/integration.html`, which boots Mocha in the browser
 * and reports through the DOM (`window.__MOCHA_DONE__` / `window.__MOCHA_STATS__`).
 * That harness is browser-agnostic, so this script only has to drive it once per
 * browser and collect the result.
 *
 * Usage:
 *   node scripts/run-integration-tests.js                 # default matrix
 *   node scripts/run-integration-tests.js --browser=all   # every entry below
 *   node scripts/run-integration-tests.js --browser=safari --browser=chrome
 *   node scripts/run-integration-tests.js --strict        # a skipped browser fails the run
 *
 * Environment:
 *   TEST_PORT=5173        port the Vite dev server listens on
 *   TEST_SERVER=skip      reuse an already-running dev server
 *   TEST_STRICT=1         same as --strict
 */

const PORT = Number(process.env.TEST_PORT || 5173);
const TEST_URL = `http://localhost:${PORT}/test/integration.html`;

/**
 * The browser matrix.
 *
 * `engine` is the Playwright browser type. `launch` is merged into
 * `browserType.launch()`. Channels (`chrome`, `msedge`) drive the *branded*
 * browser installed on the host, not a bundled download.
 *
 * Note: Playwright ships Chromium, WebKit and Firefox only. It has no Internet
 * Explorer support and never will — the loader needs ES modules, dynamic
 * `import()`, custom elements v1 and import maps, none of which IE has.
 */
const BROWSERS = {
  chromium: { engine: chromium, label: "Chromium (bundled)" },
  chrome: {
    engine: chromium,
    label: "Google Chrome",
    launch: { channel: "chrome" },
    install: "npx playwright install chrome",
  },
  msedge: {
    engine: chromium,
    label: "Microsoft Edge",
    launch: { channel: "msedge" },
    install: "npx playwright install msedge",
  },
  webkit: { engine: webkit, label: "WebKit (Safari engine)" },
  firefox: { engine: firefox, label: "Firefox" },
};

/** Friendly aliases, so `--browser=safari` and `--browser=edge` just work. */
const ALIASES = { safari: "webkit", edge: "msedge", googlechrome: "chrome" };

/**
 * The default matrix: the three bundled engines. Channels are opt-in because
 * they need a host-installed browser.
 */
const DEFAULT_BROWSERS = ["chromium", "webkit", "firefox"];

/**
 * The documented minimum supported browser, expressed as the platform APIs the
 * loader depends on. Every browser is probed at runtime and the result is
 * printed in the summary, so the floor is enforced rather than merely claimed.
 *
 * `required: false` means the feature is opt-in: the loader feature-detects it
 * and degrades gracefully, so a browser without it still passes.
 */
const CAPABILITIES = {
  customElements: {
    min: "Chrome 54 · Edge 79 · Safari 10.1 · Firefox 63",
    required: true,
  },
  esModules: {
    min: "Chrome 61 · Edge 16 · Safari 11 · Firefox 60",
    required: true,
  },
  importMaps: {
    min: "Chrome 89 · Edge 89 · Safari 16.4 · Firefox 108  ← the binding constraint",
    required: true,
  },
  intersectionObserver: {
    min: "Chrome 51 · Edge 15 · Safari 12.1 · Firefox 55",
    required: true,
  },
  requestIdleCallback: {
    min: "Chrome 47 · Edge 79 · Firefox 55 — NOT available in Safari (any version)",
    required: false,
    note: "needed by deferDefine: true — the test harness shims it for WebKit",
  },
  scopedViewTransition: {
    min: "Chrome/Edge 147+ only — no Firefox, no Safari",
    required: false,
    note: "needed by transition: true",
  },
};

/** Probe the platform APIs the loader depends on. */
function readCapabilities(page) {
  return page.evaluate(() => {
    const supportsImportMap =
      typeof HTMLScriptElement !== "undefined" && typeof HTMLScriptElement.supports === "function"
        ? HTMLScriptElement.supports("importmap")
        : !!document.querySelector('script[type="importmap"]');

    return {
      customElements: typeof customElements !== "undefined",
      esModules: "noModule" in document.createElement("script"),
      importMaps: supportsImportMap,
      intersectionObserver: "IntersectionObserver" in window,
      requestIdleCallback: "requestIdleCallback" in window,
      scopedViewTransition: "startViewTransition" in Element.prototype,
    };
  });
}

/** Parse repeatable `--browser=<name>` plus the boolean flags. */
function parseArgs(argv) {
  const requested = [];
  let strict = process.env.TEST_STRICT === "1";

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--strict") strict = true;
    else if (arg.startsWith("--browser=")) requested.push(arg.slice("--browser=".length));
    else if (arg === "--browser") requested.push(argv[++i]);
  }

  const names = requested.length
    ? requested.flatMap((name) => (name === "all" ? Object.keys(BROWSERS) : [name]))
    : DEFAULT_BROWSERS;

  return { strict, names: [...new Set(names.map((n) => ALIASES[n.toLowerCase()] || n.toLowerCase()))] };
}

/** Boot the Vite dev server (its own process group, so we can kill it whole). */
function startServer() {
  const server = spawn("npm", ["run", "dev"], { stdio: "pipe", detached: true });
  const relay = (stream) => stream.on("data", (d) => process.env.TEST_VERBOSE && process.stdout.write(`[vite] ${d}`));
  relay(server.stdout);
  relay(server.stderr);
  return server;
}

function stopServer(server) {
  if (!server || server.killed) return;
  try {
    // Negative pid → the whole process group (npm *and* the vite it spawned).
    process.kill(-server.pid, "SIGTERM");
  } catch {
    try {
      server.kill("SIGTERM");
    } catch {
      /* already gone */
    }
  }
}

/** Wait until the test page answers, instead of guessing a sleep duration. */
async function waitForServer(url, timeout = 30000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status < 500) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

/** Drive `test/integration.html` in one browser and collect the Mocha report. */
async function runBrowser(name) {
  const { engine, label, launch = {}, install } = BROWSERS[name];

  let browser;
  try {
    browser = await engine.launch({ headless: true, ...launch });
  } catch (error) {
    return { name, label, skipped: true, reason: error.message.split("\n")[0], install };
  }

  try {
    const page = await browser.newPage();

    // Branded Chrome requests `/favicon.ico` (404 here) and logs the failure; it
    // is unrelated to the suites, so drop it rather than drown the report. Real
    // errors keep their source URL.
    page.on("console", (msg) => {
      if (msg.type() !== "error") return;

      const source = msg.location()?.url ?? "";
      if (source.includes("favicon")) return;

      console.log(`  [${name}] console.error: ${msg.text()}${source ? ` (${source})` : ""}`);
    });
    page.on("pageerror", (err) => console.error(`  [${name}] PAGE ERROR: ${err.message}`));

    // Probe native capabilities *before* the suites run. `transitions.test.js`
    // installs a `startViewTransition` stand-in on engines that lack it, and the
    // harness shims `requestIdleCallback` for WebKit — either would make a
    // post-run probe lie about the engine.
    await page.goto("about:blank");
    const capabilities = await readCapabilities(page);

    await page.goto(TEST_URL, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.__MOCHA_DONE__ === true, null, { timeout: 60000 });

    const results = await page.evaluate(() => {
      const stats = window.__MOCHA_STATS__ || {};
      const fails = [...document.querySelectorAll(".test.fail")].map((fail) => ({
        name: fail.querySelector("h2")?.textContent ?? "(unnamed)",
        stack: fail.querySelector("pre")?.textContent ?? "",
      }));

      return {
        passes: stats.passes ?? 0,
        failures: stats.failures ?? 0,
        duration: Math.round(stats.duration ?? 0),
        fails,
      };
    });

    return { name, label, version: browser.version(), capabilities, ...results };
  } finally {
    await browser.close();
  }
}

/** Print one browser's report. */
function reportBrowser(run) {
  const rule = "─".repeat(Math.max(0, 46 - run.label.length - run.name.length));
  console.log(`\n── ${run.label} (${run.name}) ${rule}`);

  if (run.skipped) {
    console.log(`  SKIPPED: ${run.reason}`);
    if (run.install) console.log(`  Install it with: ${run.install}`);
    return;
  }

  console.log(`  version: ${run.version}`);
  for (const [key, capability] of Object.entries(CAPABILITIES)) {
    const present = run.capabilities[key];
    const mark = present ? "✓" : capability.required ? "✗" : "–";
    const suffix = present || capability.required ? "" : `  (${capability.note})`;
    console.log(`  ${mark} ${key}${suffix}`);
    if (!present && capability.required) console.log(`      needs ${capability.min}`);
  }

  console.log(`  passes: ${run.passes}   failures: ${run.failures}   duration: ${run.duration}ms`);
  for (const fail of run.fails) console.log(`\n  Fail: ${fail.name}\n${fail.stack}`);
}

/** Print the aggregate and return the process exit code. */
function summarize(runs, strict) {
  console.log("\n\n===\n");
  console.log("Summary");
  for (const run of runs) {
    const state = run.skipped ? "skipped" : run.failures === 0 ? "PASS" : `FAIL (${run.failures})`;
    console.log(`  ${run.name.padEnd(10)} ${state}`);
  }

  const failed = runs.filter((run) => !run.skipped && run.failures > 0);
  const skipped = runs.filter((run) => run.skipped);

  if (skipped.length && strict) {
    console.log(`\n${skipped.length} browser(s) skipped and --strict was set.`);
    return 1;
  }

  return failed.length ? 1 : 0;
}

(async () => {
  const { names, strict } = parseArgs(process.argv.slice(2));
  const unknown = names.filter((name) => !BROWSERS[name]);
  if (unknown.length) {
    console.error(`Unknown browser(s): ${unknown.join(", ")}`);
    console.error(`Known: ${Object.keys(BROWSERS).join(", ")} (aliases: ${Object.keys(ALIASES).join(", ")})`);
    process.exit(2);
  }

  const reuse = process.env.TEST_SERVER === "skip";
  const server = reuse ? null : startServer();
  let exitCode = 0;

  try {
    if (!reuse && !(await waitForServer(TEST_URL))) {
      console.error(`The dev server never answered on ${TEST_URL}`);
      exitCode = 1;
    } else {
      const runs = [];
      for (const name of names) {
        runs.push(await runBrowser(name));
      }

      for (const run of runs) reportBrowser(run);
      exitCode = summarize(runs, strict);
    }
  } catch (error) {
    console.error("Error running tests:", error);
    exitCode = 1;
  } finally {
    // `process.exit()` skips `finally`, so the exit code is recorded here and
    // the process ends *after* cleanup — otherwise `npm run dev` is orphaned.
    stopServer(server);
  }

  process.exit(exitCode);
})();

