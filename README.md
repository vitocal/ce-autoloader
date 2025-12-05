# ce-autoloader

A webcomponent lazy loader and registry for the web.
The missing parts of `customElements` API.

- Automatically Load any web-component on demand, if and when they're used in the page.
- Interactive islands with customizable behaviour `on="visible"` , `on="interaction"`, etc.
- Supports for animations with view-transitions!
- Framework-independent: React, Lit, Svelte, Vue, Angular...
- No dependencies, <10kb gzip, and fast!

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
import CERegistry from "ce-autoloader";

const catalog = {
    // Shoelace (whole library)
    "sl-*": "https://cdn.jsdelivr.net/npm/shoelace@2.20.1/",

    // Material design - only the components used
    "md-*": async (full_name) => {
        const [namespace, name] = full_name.split('-');
        import(`https://esm.run/@material/web/${name}`);
    },
    // My own components
    "x-counter": () => import("./components/x-counter.js"),
}

var registry = new CERegistry({
    catalog,
    observe: document.body
})

// Start loading wherever you're ready
document.addEventListener("load", () => registry.discover())
```

Now you can use any component from the library, anywhere. They're only loaded
if they're used in the page.

```html
<body>
    <sl-alert variant="error">Error</sl-alert>
</body>
```

## Gotchas

### Performance and customization

Since they're loaded at runtime, each module `imported()` by a component causes another network request.
And if every component loads the full library, instead of sharing, it would be a lot of code to load,
repeatedly.

This happens if every component is compiled separatedly, without deduplication, as the default behavior
of most bundlers.

#### De-duplicating dependencies with `?external`

We can deduplicate by marking core dependencies as **external**, and loading them once.

 - For CDN's, there's generally and `external` option: `esm.sh?external`.
 - Rollup or other bundlers always has an `external` config

## Browser support

## Documentation

## TODO

- [X] Implement component loader function: Allow functions to be registered as a component.
- [X] Tests for url loader, function loader, namespaced loader.
- [X] Robust Loading: Support modules that auto-register, or not.
- [X] Animation lifecycle: Support for view transitions and/or html-attribute change([ce-loading] and [ce-defined]) triggers css animations.
- [X] Cleanup: Move lit to devDependencies if not used in core.
- [X] Publish on npm
