# Product context

## Why it exists

Bundlers decide *what code a page gets* at build time, far away from the HTML that knows the answer. Lazy loading
exists, but it is usually bolted on per case and tied to a toolchain. Flip it: **the DOM is the dependency graph,
and the catalog is the contract** — a component becomes a URL you can put in markup.

## Who it is for — and the honest risk

| Audience | Why it fits | Risk to respect |
| --- | --- | --- |
| Beginners, hobbyists | HTML-first, no build; islands in static, Markdown or CMS pages | Two sources of truth (catalog + markup); theming and a11y remain yours |
| Academia | A small dependency-free example of `MutationObserver`, `IntersectionObserver`, custom element upgrades, dynamic import, User Timing, View Transitions | Version pinning and reproducible numbers are still missing (Tier 1) |
| Product teams | Islands in Rails/Django/Phoenix/WordPress; micro-frontends without a shared runtime (`pages/examples/mfe-store/`) | The write path patches a DOM global; GPL-3.0 blocks some companies |

## How it should feel

Legible (read the library in one sitting, read a page's dependency graph in its HTML) · forgiving (a broken
component shows `ce="error"` or a fallback instead of a white screen) · boring at the boundary (a catalog entry is
one line) · shrinking over time rather than growing.
