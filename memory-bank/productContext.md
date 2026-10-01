# Product context

Bundlers decide *what code a page gets* at build time, far away from the HTML that knows the answer. Flip it: **the
DOM is the dependency graph, and the catalog is the contract** — a component becomes a URL you can put in markup.

| Audience | Why it fits | Risk to respect |
| --- | --- | --- |
| Beginners, hobbyists | HTML-first, no build; islands in static, Markdown or CMS pages | Two sources of truth (catalog + markup); theming and a11y stay yours |
| Academia | A small dependency-free example of observers, custom element upgrades, dynamic import, User Timing, View Transitions | Unpinned versions, no reproducible numbers |
| Product teams | Islands in Rails/Django/WordPress; micro-frontends without a shared runtime (`pages/examples/mfe-store/`) | The write path patches a DOM global; GPL-3.0 blocks some companies |

It should feel legible (read the library in one sitting, a page's dependency graph in its HTML), forgiving (a broken
component is a painted failure, never a white screen), boring at the boundary, and shrinking over time.
