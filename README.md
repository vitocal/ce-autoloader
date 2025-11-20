# wc-atlas

- Automatically Load any web-component on demand, if and when they're used.
- Group components in a atlas (also called a `CustomElementRegistry`)
- No dependencies, framework-independent, <10kb gzip, performant!
- Interactive islands with client directives, `on:visible` , `on:load`, `on:click`
- Simple and ergonomic

```js
import atlas from "wc-atlas";

const components = {
    // Shoelace
    "sl-": "https://cdn.jsdelivr.net/npm/shoelace@2.20.1/",
    // Material design
    "md-": "https://esm.run/@material/web/",
    // My own components
    "x-counter": "./components/x-counter.js",
}

// Start the watcher
globalThis.atlas = atlas.start({
    library: components,
    observe: document.body
})
```

Now any shoelace tag `<sl-alert>` in your page will be rendered by shoelace component, lazyly loaded!

## Installation

wc-atlas is available as a npm package

```
npm install wc-atlas
```
```
<script type="module" src="/assets/wc-atlas.js"></script>
```

## Usage

Import wc-atlas in your primarly bundle and add your components manifest, a simple JSON

```js
import {Atlas} from "wc-atlas"

const components = {
    // A single component
    "sl-alert": "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/sl-alert.js",
    // You can even import everything under a prefix
    "sl-*": "https://cdn.jsdelivr.net/npm/@shoelace-style/"
}

new Atlas({
    library: components,
    target: document.body
})
```

Now use your `shoelace` components freely in your html, anywhere.

```
<body>
    <sl-alert variant="error">Error</sl-alert>
</body>

## Use cases

## Performance and customization

Since they're loaded at runtime, each module imported() by a component causes another network request.
And if every component loads the full library, instead of sharing, it would be a lot of code to load,
repeatedly.

This happens if every component is compiled separatedly, without deduplication, as the default behavior
of most bundlers.

### De-duplicating dependencies with `?external`

We can deduplicate by marking core dependencies as **external**, and loading them once.

 - For URL's, theres `esm.sh?external` option
 - Rollup or other bundlers always has an `external` config

## Browser support

## Documentation