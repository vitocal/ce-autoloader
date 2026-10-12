<p align="center">
  <img src="public/logo.svg" alt="ce-autoloader logo" width="200" />
</p>

<h1 align="center">ce-autoloader</h1>

<p align="center">
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

- Universal: Anything that exports a Web Component works (React, Vue, Lit, Svelte, etc.).
- Shared Catalog: Define your components in a single place and re-use it across multiple pages.
- Custom Loader Strategy: Use loading attribute to customize when a component should be loaded.
- Polished Animations: Use the lifecycle states and [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) to animate components as they load/render.
- Smart Scheduling: Batches custom element upgrades into single animation frames to prevent layout thrashing.
- Native Telemetry: Built-in performance markers for every stage of the lifecycle, deep visibility into load times.
- Error Handling: Define a custom fallback component to show when a module fails to load.
- Zero Friction: 3kb gzipped without dependencies and no build/bundler required.

### Use Cases

- Hackers tired of frontend fatigue, react madness and hydration issues.
- Universal alternative for next/nuxtjs
- Server rendered sites with interactive islands/progressive enhancements.
- Markdown powered sites: hey, webcomponents are already supported out-of-the-box!

## Installation

ce-autoloader is available as a npm package

```
npm install ce-autoloader
```

## Usage

Import ce-autoloader in your primary bundle and add a components registry:

```js
import CERegistry from "ce-autoloader";

/* A central registry for all our components 😘 */
const registry = new CERegistry({
  catalog: {
    "model-viewer": "https://unpkg.com/@google/model-viewer",
    "confetti-button": () => import("./confetti-button.ts"),
  },
});
```

Now you can use any component from these libraries, and they will be loaded only when used.

```html
<model-viewer src="..."></model-viewer>
```

## Demos

Try the demos online at [ce-autoloader](https://vitocal.github.io/ce-autoloader/)

## Documentation

### `CEAutoLoader` (aliased as `CERegistry`)

The constructor accepts an `Options` object:

```js
const registry = new CERegistry({
  /* The component catalog. Required unless the page has an import map */
  catalog: {
    "my-element": "/path/to/element.js",
    "prefix-*": (name) => import(`/assets/${name}.js`), // Wildcard support!
  },
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
  /* Use the View Transitions API to morph the placeholder into the component.
     Requires `deferDefine: true` and element-scoped view transitions (Chromium).
     (default: false) */
  transition: false,
  /* Queue `customElements.define` calls until later.  its own tag still morphs inside the view transition.
     (default: false; `transition: true` refuses to start without it) */
  deferDefine: false,
  /* Fallback component class rendered when a catalog component fails to load */
  fallback: MyErrorComponent,
  /* Paint a failure on any html custom-element tag that is *not* in the catalog — handy while
     debugging a typo'd tag name. (default: false) */
  devErrors: false,
  /* Lifecycle hooks */
  hooks: {
    viewTransition: {
      ready: (transition) => console.log("Transition ready"),
      finished: (transition) => console.log("Transition finished"),
    },
    error: (error) => console.error(error),
  },
});
```

When `catalog` is omitted, the registry builds its catalog from the page's `<script type="importmap">` instead.

### CSS Styling & Lifecycle States

Elements are decorated with a `ce` attribute reflecting their current state. You can use this for skeleton screens, spinners, or fade-ins.

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

/* Success state */
my-component[ce="defined"] {
  animation: fade-in 0.3s ease-out;
}

/* Error state — a catalog component that failed */
my-component[ce="error"] {
  border: 1px solid red;
}
```

Each state change is a plain style change on the same element, so CSS `transition` / `animation` can animate it — no JavaScript and no View Transitions API needed. The [CSS animation reference](https://vitocal.github.io/ce-autoloader/pages/examples/animations/css.html) documents which technique fits which situation.

`loading` and `defined` are set by the loader. `error` is painted for a catalog component that really failed — a loader that throws, a module that will not import, a `define()` that blows up. A tag that isn't in the catalog was never the loader's business: it keeps matching `:not(:defined)`, because a third party may define it later. Set `devErrors: true` to paint those unknown tags too, which is handy while debugging a typo'd tag name. Either way `hooks.error` is called, and when a `fallback` is configured it is **appended** inside the element with the message and stack on its `.error` / `.stack` — existing light DOM is left in place.

### Directives (The `loading` attribute)

Control exactly _when_ your code is fetched:

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

### View Transitions

With `transition: true` (plus the `deferDefine: true` it requires), `ce-autoloader` wraps the component definition in an element-scoped `Element.startViewTransition()` tagged `types: ["ce"]`, so the placeholder can morph into the interactive component. Element-scoped view transitions are Chromium-only; on other browsers leave `transition` off.

You can customize the transition per-element using attributes:

```html
<my-chart loading="visible" view-transition-name="main-chart" view-transition-class="slide-up"> </my-chart>
```

### Expert Mode: Under the hood

For the hackers and performance nerds:

- **Wildcard Resolvers:** Map an entire library prefix (e.g., `carbon-*`) to a dynamic import function.
- **Deferred Definitions:** Most catalogs are modules that register their own tag (`customElements.define` at import time). With `transition: true` you must also set `deferDefine: true`, which queues those definitions so they land _inside_ the view transition — that is what lets such a component morph instead of popping up. Only tags that resolve to a catalog entry are deferred: each is defined with `customElements.dequeue(tag)` and the rest are flushed. Anything else (a third-party script, a module registering extra tags) is passed straight to the original `define`, so it upgrades normally. The queue is off by default, and `transition: true` throws rather than run without it. Even when the queue is off, the registry still installs an **idempotent** `customElements.define` (`polyfill_safe_ce_define`): a module that registers a tag the loader also defines would otherwise throw `NotSupportedError`.
- **Telemetry:** Every load and definition is timed using the User Timing API. Check your "Performance" tab in DevTools for `load:tag-name` and `define:tag-name` markers.
- **Failure reporting:** A failed load or definition of a catalog component calls `hooks.error` with `{ name, el, error }` and paints the element — `ce="error"` and, when a `fallback` is configured, a fallback instance appended with the message and stack on its `.error` / `.stack`. `devErrors: true` extends the paint to tags that are _not_ in the catalog; they stay `:not(:defined)` otherwise, so a third-party component that registers itself later is never styled as broken.
- **Manual Cleanup:** Use `registry.clean()` to disconnect all observers and stop watching the DOM.

## Browser support

Latest Chrome, Firefox, Safari and Edge for the loader itself. The optional `transition` morph depends on element-scoped view transitions, which are Chromium-only today.

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
To run the dev server, run `npm run serve`

To publish the library, run `npm publish`
To test it, run `npm run test`

To publish the demos/docs, run `NODE_ENV=production npm run build:docs`,
add the "docs/" changes and push to github.

## License

`ce-autoloader` is released under the GNU v3. See the enclosed [`LICENSE`](./LICENSE) for more information.
