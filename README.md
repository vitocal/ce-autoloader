# ce-autoloader

A webcomponent lazy loader and component registry for the web.
The missing piece

- Automatically Load any web-component on demand, if and when they're used.
- Framework-independent: React, Lit, Svelte, Vue, Angular...
- No dependencies, <10kb gzip, performant!
- Interactive islands with client directives, `on="visible"` , `on="load"`, `on="interaction"`
- Painless extension and customization.
- Simple and ergonomic.
- Perfect for CMS, Blogs, static sites and any other web application.


## Installation

ce-autoloader is available as a npm package

```
npm install ce-autoloader
```
```
<script type="module" src="/assets/ce-autoloader.js"></script>
```

## Usage

Import ce-autoloader in your primary bundle and add a components registry:

```js
```js
import CERegistry from "ce-autoloader";

const catalog = {
    // Shoelace
    "sl-*": "https://cdn.jsdelivr.net/npm/shoelace@2.20.1/",

    // Material design custom loader
    "md-*": async (full_name) => {
        const [namespace, name] = full_name.split('-');
        import(`https://esm.run/@material/web/${name}`);
    },
    // My own components
    "x-counter": "./components/x-counter.js",
}

// Start the watcher
globalThis.registry = new CERegistry({
    catalog,
    observe: document.body
})
```

Now you can use in your HTML any component from the library, anywhere.

```html
<body>
    <sl-alert variant="error">Error</sl-alert>
</body>
```

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

## TODO

- [X] Implement component loader function: Allow functions to be registered as a component.
- [X] Tests for url loader, function loader, namespaced loader.
- [X] Robust Loading: Support modules that auto-register. Check customElements.get(name) after import to see if it was registered by the module before trying to define it manually.

- [ ] Flexible Directives: Split the on attribute by whitespace to allow multiple directives.
- [ ] Accessibility: Expand interaction to include focus or keydown.
- [X] Cleanup: Move lit to devDependencies if not used in core.
- [ ] Publish on npm