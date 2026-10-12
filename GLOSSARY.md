# Glossary

The words this codebase uses for its own domain. Use them as written — the code, the tests and the memory bank all
lean on them.

**catalog** — the map from a tag name to a *loader*. The library's only seam for "where does this component come from".
A key is either an exact tag (`nord-qrcode`) or a wildcard prefix (`nord-*`), and a tag not in the catalog is never the
loader's business.

**loader** — a catalog value: a URL string, or a function `(name, el) => Promise<Constructor>`. A module may also
register its own tag and return nothing.

**tag** — the custom element's name. Always contains a `-`; that dash is how the loader recognises a candidate.

**directive** — the value of the `loading` attribute. The built-ins are `eager`, `visible` (the default), `click` and
`manual`; any other value is a custom directive the host triggers with `upgrade(root, value)`. A directive answers
"when should this load?".

**lifecycle state** — the `ce` attribute, and its three values: `loading`, `defined`, `error`. It is public contract
(stylesheets select on `[ce="…"]`) *and* the flag the failure reporter reads to know whether an element has already
been handled. Owned by `src/lifecycle.ts`. **Failure is terminal**: a failed element is never loaded or reported again.

**failure** — a load or a define that failed for a catalog tag. It paints `ce="error"`, is reported once through
`hooks.error`, and is never retried.

**fallback** — the component appended *inside* a failed element, carrying the message and stack on its `.error` and
`.stack`. Appending rather than replacing keeps server-rendered and slotted light DOM alive.

**measure** — the User Timing entries the loader emits: `load:<tag>` and `define:<tag>`.

**shadow-observer** — the optional peer dependency whose import upgrades discovery to reach into shadow roots. The
library detects it rather than importing it, so a host application opts in.
