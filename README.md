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
