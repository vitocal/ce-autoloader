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
  <strong>A webcomponent lazy loader and registry for the web.</strong><br>
  <em>The missing parts of the <code>customElements</code> API.</em>
</p>

<p align="center">
  <a href="https://vitocal.github.io/ce-autoloader/"><strong>🚀 Live Demo</strong></a> |
  <a href="https://vitocal.github.io/ce-autoloader/"><strong>📖 Documentation</strong></a>
</p>

- Automatically Load any web-component on demand, if and when they're used in the page.
- A centralized registry for your components, skip the tedious and error-prone manual registration.
- **Activation Triggers**: Native support for loading strategies like `on="visible"`, `on="click"`, or eager loading.
- **Dynamic Resolvers**: Effortlessly resolve entire component libraries (e.g., `nord-*`) using pattern-based loaders.
- Supports for CSS animations and even view-transitions!
- Framework-independent: React, Lit, Svelte, Vue, Angular...
- No dependencies, <10kb (3kb gzip), and fast!

### Use Cases

- Hackers tired of frontend fatigue, react madness and hydration issues.
- Markdown blogs: hey, webcomponents are already supported natively!
- Progressive enhancement for static sites and CMS.
- Multi-page applications with interactive islands.
- Smart editors like Obsidian, Notion, LogSeq.

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

// Use the component in your HTML, just like any other element
// &lt;model-viewer camera-controls auto-rotate
// src="https://modelviewer.dev/shared-assets/models/shishkebab.glb">&lt;/model-viewer>

// And load only the components used in the page
registry.discover();
```

Now you can use any component from these libraries, and they will be activated only when used.

```html
<body>
    <sl-alert variant="error">Error</sl-alert>
</body>
```

## Gotchas

#### De-duplicating dependencies with `?external`

We can deduplicate by marking core dependencies as **external**, and loading them once.

 - For CDN's, there's generally and `external` option: `esm.sh?external`.
 - Rollup or other bundlers always has an `external` config

## Browser support

Latest Chrome, Firefox, Safari, Edge for view transition support.

## Documentation

See documentation at [ce-autoloader](https://vitocal.github.io/ce-autoloader/)