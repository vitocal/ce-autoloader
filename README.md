<p align="center">
  <img src="public/logo.svg" alt="ce-autoloader logo" width="200" />
</p>

<h1 align="center">ce-autoloader</h1>

<p align="center">
  <a href="https://github.com/vitocal/ce-autoloader/actions/workflows/test.yml"><img src="https://github.com/vitocal/ce-autoloader/actions/workflows/test.yml/badge.svg" alt="tests"></a>
  <a href="https://www.npmjs.com/package/ce-autoloader"><img src="https://img.shields.io/npm/v/ce-autoloader.svg" alt="npm version"></a>
  <a href="https://bundlephobia.com/package/ce-autoloader"><img src="https://img.shields.io/bundlephobia/min/ce-autoloader.svg" alt="bundle size"></a>
  <a href="https://bundlephobia.com/package/ce-autoloader"><img src="https://img.shields.io/bundlephobia/minzip/ce-autoloader.svg" alt="bundle size (gzip)"></a>
  <a href="https://www.npmjs.com/package/ce-autoloader"><img src="https://img.shields.io/npm/l/ce-autoloader.svg" alt="license"></a>
  <a href="https://github.com/vitocal/ce-autoloader/stargazers"><img src="https://img.shields.io/github/stars/vitocal/ce-autoloader.svg" alt="github stars"></a>
  <a href="https://github.com/vitocal/ce-autoloader/network/members"><img src="https://img.shields.io/github/forks/vitocal/ce-autoloader.svg" alt="github forks"></a>
</p>

<p align="center">
  <strong>A webcomponent lazy loader</strong><br>
  Load web components on demand <em>if and when</em> they're needed.
</p>

<p align="center">
  <a href="https://vitocal.github.io/ce-autoloader/"><strong>🚀 Live Demo</strong></a> |
  <a href="https://vitocal.github.io/ce-autoloader/"><strong>📖 Documentation</strong></a>
</p>

The ce-autoloader is a lightweight library to lazy-load Web Components on demand. If a component isn't used on the page, it won't be downloaded.

- Shared Catalog: Define your components in a single place and re-use it across multiple pages.
- Universal: Anything that exports a Web Component works (React, Vue, Lit, Svelte, etc.).
- Custom Loader Strategy: Use `loading` attribute to customize when a component should be loaded.
- Polished Animations: Animate components as they load with the `ce` lifecycle states and plain CSS — no JavaScript required.
- Error Handling: Define a custom fallback component to show when a module fails to load.
- Native Telemetry: Built-in performance markers for every stage of the lifecycle, deep visibility into load times.
- Zero Friction: 3.9kb gzipped without dependencies and no build/bundler required.

### Use Cases

- Server-rendered(PHP,Elixir,Ruby,Python) sites that want to adapt progressive components to a whole app/site.
- Markdown-powered sites: Web Components already works without any plugin, out of the box.
- Micro-frontends and Design Systems: Easy to configure/update with an external catalog.

## Installation

ce-autoloader is available as a [npm package](https://www.npmjs.com/package/ce-autoloader)

```
npm install ce-autoloader
```

## Usage

Create a new `CERegistry` and pass your web-components catalog:

```js
import CERegistry from "ce-autoloader";

const registry = new CERegistry({
  /* A central registry for all our components 😘 */
  catalog: {
    "model-viewer": "https://unpkg.com/@google/model-viewer",
    "confetti-button": () => import("./confetti-button.ts"),
    // my-components
  },
});
```

Now you can use any component declared in your catalog, loaded only when visible.

```html
<model-viewer loading="visible" src="..."></model-viewer>
```

> [!NOTE]
> You can also load it directly from CDN's, and configure the catalog via [importmap](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap)
>
> ```html
> <script type="module" src="https://esm.sh/ce-autoloader?autoload"></script>
> <script type="importmap">
>   {
>     "imports": {
>       "model-viewer": "https://unpkg.com/@google/model-viewer"
>     }
>   }
> </script>
> ```

## Documentation

### CSS Styling & Lifecycle States

Elements are decorated with a `ce` attribute reflecting their current state. You can use this for skeleton screens, spinners, or fade-ins.

The attribute walks one state at a time:

| `ce`      | meaning                                                   |
| --------- | --------------------------------------------------------- |
| `loading` | the module is being fetched                               |
| `loaded`  | the module is in memory, the element has not upgraded yet |
| `defined` | `customElements.define()` ran — the element is upgraded   |
| `error`   | loading or defining failed                                |

```css
/* Placeholder state */
my-component:not(:defined) {
  min-height: 200px;
  background: #eee;
}

/* Loading state */
my-component[ce="loading"] {
  cursor: wait;
  opacity: 0.7;
}

/* Loaded — the module is in memory; this is the window `deferDefine` opens */
my-component[ce="loaded"] {
  cursor: progress;
}

/* Upgrade. `defined` is written in this frame and is the last state of the
   success walk, so this rule keeps matching and the animation plays out. */
my-component[ce="defined"] {
  animation: fade-in 0.3s ease-out;
}

/* Error state — a catalog component that failed */
my-component[ce="error"] {
  border: 1px solid red;
}
```

Each state change is a plain style change on the same element, so CSS `transition` / `animation` can animate it. The [CSS animation reference](https://vitocal.github.io/ce-autoloader/pages/examples/animations/css.html) documents which technique fits which situation.

> [!NOTE]
> **Why `defined` is the only success state.** The element is not replaced when it upgrades — `customElements.define()` swaps its prototype in
> place — so a stylesheet keeps matching it throughout, and `defined` is written _synchronously_ in the frame the element upgraded. Nothing
> supersedes it, so a rule matching `[ce="defined"]` keeps matching and an entry animation declared on it plays out in full.

The one thing to avoid is anchoring on `:not(:defined)`, which stops matching the instant the element is defined — so a `transition` declared there has no "to" state to reach. Anchor on `[ce="defined"]` instead:

```css
my-component:not(:defined) {
  opacity: 0.5;
}

my-component[ce="defined"] {
  opacity: 1;
  animation: fade-in 0.3s ease-out;
}
```

### Directives (The `loading` attribute)

Control exactly _when_ your component is fetched:

- `loading="eager"`: Fetch and define immediately.
- `loading="visible"`: (Default) Fetches when the element enters the viewport via `IntersectionObserver`.
- `loading="click"`: Fetches when the user first interacts with the element.
- `loading="manual"`: Won't load automatically. Trigger it with `registry.upgrade(root, "manual")`.

Any other `loading` value is treated as a custom directive and upgraded the same way — `loading="custom"` → `registry.upgrade(root, "custom")`.

```js
// Upgrade every `loading="manual"` element inside `root`
registry.upgrade(root, "manual");

// `root` is optional: pass `undefined` to use the configured `root`
registry.upgrade(undefined, "manual");
```

### Import-maps support

With `useImportMapsCatalog: true` the registry also reads the page's `importmap`: any entry whose name contains a `-` (e.g. `"nord-qrcode": "https://…"`) is treated as a component. It is merged _under_ `catalog`, so an explicit entry wins a collision. **Every** import map in the document is read and merged.

That's useful for loading ce-autoloader from a CDN, and configuring it's catalog from the page import-map.

### Hooks

You can hook `load`,`loaded`, `define` and `error`.
Each hook runs once per component, in walk order:

```js
const registry = new CERegistry({
  catalog: { "heavy-chart": "/assets/heavy-chart.js" },
  hooks: {
    load: (name, el) => (navigator.onLine ? true : false),
    loaded: ({ name, el }) => track("component-loaded", name),
    define: ({ name, el, module }) => !isHidden(el),
  },
});
```

- **`load(name, el)`** runs before the fetch, and its answer decides the walk. `false` skips the component: nothing is fetched, nothing is defined, and the element is left with no `ce` state — a skip is a decision, not a failure, so it is not reported and a later `registry.upgrade(root)` asks again. `true` — or a handler that returns nothing — loads it as usual. An ES module is used **in place of** the catalog loader's module, so a handler can fetch the component itself:

  ```js
  hooks: {
    load: (name) => import(`/variants/${name}.js`);
  }
  ```

- **`loaded({ name, el, module, loader })`** is a notification, sent the moment the module is in memory and the element has not upgraded yet — the `loaded` step of the walk, and the window `deferDefine` holds open. Its return value is ignored.

- **`define({ name, el, module })`** runs before the registration, with `module` unwrapped to the constructor. `false` disables the definition — the walk stops at `loaded`, nothing is reported and nothing is painted. `registry.preload()` runs the same three hooks, with `el` `undefined`.

### Expert Mode: Under the hood

- **Wildcard Resolvers:** Map an entire library prefix (e.g., `carbon-*`) to a dynamic import function.
- **Telemetry:** Every load and definition is timed using the User Timing API. Check your "Performance" tab in DevTools for `load:tag-name` and `define:tag-name` markers.
- **Failure reporting:** A failed load or definition of a catalog component calls `hooks.error` with `{ name, el, error }` and paints the element — `ce="error"` and, when a `fallback` is configured, a fallback instance appended with the message and stack on its `.error` / `.stack`. `devErrors: true` extends the paint to tags that are _not_ in the catalog; they stay `:not(:defined)` otherwise, so a third-party component that registers itself later is never styled as broken.

### `CEAutoLoader` options

The constructor accepts an `Options` object:

```js
const registry = new CERegistry({
  /* The component catalog. */
  catalog: {
    "my-element": "/path/to/element.js",
    "prefix-*": (name) => import(`/assets/${name}.js`), // Wildcard support!
  },
  /* Read the page's <script type="importmap"> as an extra catalog source (default: false) */
  useImportMapsCatalog: false,
  /* Root element to search/observe (default: document.body) */
  root: document.getElementById("app"),
  /* Watch the DOM for new custom elements (default: true) */
  live: true,
  /* List of directives handled by the loader (default: ["eager", "visible", "click"]) */
  directives: ["eager", "visible", "click"],
  /* Directive used when a tag has no `loading` attribute (default: "visible") */
  defaultDirective: "visible",
  /* Options for the IntersectionObserver backing the `visible` directive */
  intersectionOptions: { rootMargin: "20%" },
  /* EXPERIMENTAL (alpha) — wrap the definition in an element-scoped view transition so
     the placeholder morphs into the component. Requires `deferDefine: true` and
     element-scoped view transitions (Chromium 147+ only). May change without notice.
     (default: false) */
  transition: false,
  /* Queue `customElements.define` for catalog tags during a load, so a component
     that registers its own tag still morphs inside the view transition.
     (default: false; `transition: true` refuses to start without it) */
  deferDefine: false,
  /* Fallback component class rendered when a catalog component fails to load */
  fallback: MyErrorComponent,
  /* Paint a failure on any html custom-element tag that is *not* in the catalog — handy while
     debugging a typo'd tag name. (default: false) */
  devErrors: false,
  /* Shadow-root discovery. "auto" uses `shadow-observer` if the host app imported it;
     true forces it (and warns when the module is missing); false disables it. (default: "auto") */
  shadowObserver: "auto",
  /* Lifecycle hooks, one call each per component */
  hooks: {
    viewTransition: {
      ready: (transition) => console.log("Transition ready"),
      finished: (transition) => console.log("Transition finished"),
    },
    /* Before the fetch: `false` skips the component, `true` loads it as usual,
       an ES module is used in place of the catalog loader's */
    load: (name, el) => true,
    /* Once the module is in memory and the element has not upgraded yet */
    loaded: ({ name, el, module }) => {},
    /* Before the definition: `false` disables it */
    define: ({ name, el, module }) => true,
    error: (error) => console.error(error),
  },
});
```

## Browser support

The loader needs a minimum of [baseline widely available(30 months)](https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Compatibility#baseline_badges): `<script type="module">`, dynamic `import()`, custom elements v1, `IntersectionObserver` and — **import maps**.

| Browser       | Minimum  | Why         |
| ------------- | -------- | ----------- |
| Chrome / Edge | **89**   | import maps |
| Firefox       | **108**  | import maps |
| Safari        | **16.4** | import maps |

Two features are opt-in (`deferDefine` and `transition`) and feature-detected, so a browser without them still works.

### View Transitions (experimental)

> **Alpha — not recommended for production.** The opt-in `transition` option wraps the component definition in an
> element-scoped `Element.startViewTransition()` tagged `types: ["ce"]`, so a placeholder can morph into the interactive
> component. Element-scoped view transitions are **Chromium 147+ only**; Firefox and Safari fall back to a plain define, so
> the component still loads — it just doesn't animate. The option and the attribute contract may change without a major
> version bump. Prefer the [lifecycle states](#css-styling--lifecycle-states) above: they work in every browser and need no
> JavaScript.

## Shadow DOM

By default, `ce-autoloader` uses the native `MutationObserver`, which does not reach into shadow roots. To discover and upgrade components inside shadow roots (both open and closed), import the optional peer dependency `shadow-observer` in your application:

```js
import "shadow-observer";
import CERegistry from "ce-autoloader";

const registry = new CERegistry({ catalog: { ... } });
```

The `shadow-observer` module patches `Element.prototype.attachShadow` so that new shadow roots created after the registry starts are automatically observed. Components inside those shadow roots are discovered and upgraded just like light-DOM components.

To explicitly disable shadow root observation (even if `shadow-observer` is loaded), pass `shadowObserver: false`:

```js
const registry = new CERegistry({ catalog: { ... }, shadowObserver: false });
```

**Limitation:** Only shadow roots created _after_ the registry starts are observed. Pre-existing shadow roots are not scanned.

## Development

To build the library, run `npm run build`
To run the dev server, run `npm run dev`

To publish the library, run `npm publish`

Tests run the suites in `test/integration.html` in real browsers through Playwright:

```bash
npm test              # Chromium + WebKit (Safari engine) + Firefox
npm run test:chrome   # Google Chrome (branded channel)
npm run test:safari   # WebKit — the Safari engine
npm run test:edge     # Microsoft Edge (branded channel)
npm run test:all      # every browser above
```

`npx playwright install chromium webkit firefox` fetches the bundled engines. A browser that is not installed is reported as _skipped_, not failed; add `--strict` (or `TEST_STRICT=1`) to make a skip fail the run. Playwright only ships the _current_ build of each engine, so it cannot target a pinned older version — testing an older browser means pinning an older Playwright release.

The demos/docs site is deployed to GitHub Pages by `.github/workflows/pages.yml`: every push to `main` runs
`NODE_ENV=production npm run build:docs` and publishes `docs/` as a Pages artifact. `docs/` is build output — it is
gitignored, so there is nothing to commit. Enable it once under **Settings → Pages → Source: GitHub Actions**.

## License

`ce-autoloader` is released under the GNU v3. See the enclosed [`LICENSE`](./LICENSE) for more information.
