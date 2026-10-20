/**
 * A module a `hooks.load` handler can hand back in place of the catalog loader's.
 *
 * It has to be a *real* ES module — the loader unwraps `.default` only when
 * `Symbol.toStringTag === "Module"`, which is how a catalog loader's `import()`
 * result is recognised. A plain `{ default: … }` object is a constructor-less
 * module and would be rejected as such.
 *
 * It exports the class instead of registering it, so a test can prove the loader
 * defined the tag from this module.
 */
export default class HookProvidedComponent extends HTMLElement {
  connectedCallback() {
    this.setAttribute("data-upgraded", "true");
  }
}
