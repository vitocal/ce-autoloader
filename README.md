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
import CERegistry from 'ce-autoloader';

/* A central registry for all our components 😘 */
const registry = new CERegistry({
	catalog: {
		"model-viewer": "https://unpkg.com/@google/model-viewer",
		"confetti-button": () => import('./confetti-button.ts'),
	}
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
  /* The component catalog (required) */
  catalog: {
    "my-element": "/path/to/element.js",
    "prefix-*": (name) => import(`/assets/${name}.js`), // Wildcard support!
  },
  /* Root element to observe (default: document.body) */
  root: document.getElementById('app'),
  /* Watch for DOM mutations (default: true) */
  live: true,
  /* Automatically run initial discovery (default: true) */
  autoDiscover: true,
  /* Fallback component class for failed loads */
  fallback: MyErrorComponent,
  /* List of available directives (default: ["eager", "visible", "click"]) */
  directives: ["eager", "visible", "click", "hover"],
  /* Default directive when loading attribute is missing (default: "visible") */
  defaultDirective: "visible",
  /* Use View Transitions API (default: true if supported) */
  transition: true,
  /* Lifecycle hooks for transitions */
  hooks: {
    viewTransition: {
      ready: () => console.log("Transition ready"),
      finished: () => console.log("Transition finished"),
    }
  }
});
```

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

/* Error state */
my-component[ce="error"] {
  border: 1px solid red;
}
```

### Directives (The `loading` attribute)

Control exactly *when* your code is fetched:

- `loading="eager"`: Fetch and define immediately.
- `loading="visible"`: (Default) Fetches when the element enters the viewport via `IntersectionObserver`.
- `loading="click"`: Fetches when the user first interacts with the element.
- `loading="manual"`: Won't load automatically. Use `registry.upgrade("manual")` to trigger.

### View Transitions

If `transition: true` is set, `ce-autoloader` will wrap the component definition in a `document.startViewTransition()`. This allows for seamless morphing between the placeholder and the interactive component.

You can customize the transition per-element using attributes:

```html
<my-chart 
  loading="visible"
  view-transition-name="main-chart"
  view-transition-class="slide-up">
</my-chart>
```

### Expert Mode: Under the hood

For the hackers and performance nerds:

- **Wildcard Resolvers:** Map an entire library prefix (e.g., `carbon-*`) to a dynamic import function.
- **Batched Upgrades:** To prevent layout thrashing and jank during animations, `ce-autoloader` monkey-patches `customElements.define`. It queues definitions and flushes them in a single animation frame.
- **Telemetry:** Every load and definition is timed using the User Timing API. Check your "Performance" tab in DevTools for `load:tag-name` and `define:tag-name` markers.
- **Retry Logic:** If a component fails to load (e.g., flaky CDN), use `registry.retry(el)` to attempt a reload.
- **Manual Cleanup:** Use `registry.clean()` to disconnect all observers and stop watching the DOM.

## Browser support

Latest Chrome, Firefox, Safari, Edge for view transition support.

## Development

To build the library, run `npm run build`
To run the dev server, run `npm run serve`

To publish the library, run `npm publish`
To test it, run `npm run test`

To publish the demos/docs, run `NODE_ENV=production npm run build:docs`, 
add the "docs/" changes and push to github. 

## License

`ce-autoloader` is released under the GNU v3. See the enclosed [`LICENSE`](./LICENSE) for more information.
