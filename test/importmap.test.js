import { expect } from "chai";
import AutoLoader from "../src/index.ts";

/**
 * `useImportMapsCatalog` makes the registry read the page's
 * `<script type="importmap">` when it is constructed: every entry whose name
 * contains a `-` becomes a component, and an explicit `catalog` is merged on top.
 *
 * Two platform facts shape the fixtures below:
 *
 * - A document honours one import map, and the loader reads the *first* one
 *   (`document.querySelector`).
 * - Firefox ignores an import map added after module evaluation *for resolution*,
 *   so the entries must point at absolute URLs. A fresh `blob:` URL per test keeps
 *   the fixture self-contained and engine-independent.
 */

const createdUrls = [];

/** A `blob:` ES module that defines `tag`, tagged with `source` for assertions. */
function fixtureModule(tag, source) {
  const url = URL.createObjectURL(new Blob([`
class Fixture extends HTMLElement {
  connectedCallback() {
    this.setAttribute("data-upgraded", "true");
    this.setAttribute("data-source", "${source}");
  }
}
customElements.define("${tag}", Fixture);
export default Fixture;
`], { type: "text/javascript" }));

  createdUrls.push(url);
  return url;
}

describe("Import map catalog", () => {
  let registry;
  let installedMaps = [];
  const fixtures = document.getElementById("fixtures");

  /** Install a `<script type="importmap">`, remembered for teardown. */
  const installImportMap = (imports) => {
    const script = document.createElement("script");
    script.type = "importmap";
    script.textContent = JSON.stringify({ imports });
    document.head.appendChild(script);
    installedMaps.push(script);
  };

  beforeEach(() => {
    fixtures.innerHTML = "";

    // Reset observers, but we can't really unregister the custom elements.
    registry?.clean();
    registry = undefined;
  });

  afterEach(() => {
    installedMaps.forEach((script) => script.remove());
    installedMaps = [];
    createdUrls.splice(0).forEach((url) => URL.revokeObjectURL(url));
  });

  // Clean up the last registry too, so its observers don't leak into
  // the next suite and load tags with a stale catalog.
  after(() => {
    registry?.clean();
    registry = undefined;
  });

  it("should load a component from the page's import map", async () => {
    // No `catalog` at all — this is the `?autoload` canary's setup.
    installImportMap({ "imap-widget": fixtureModule("imap-widget", "importmap") });

    const el = document.createElement("imap-widget");
    el.setAttribute("loading", "eager");
    fixtures.appendChild(el);

    registry = new AutoLoader({ useImportMapsCatalog: true, root: fixtures });

    await customElements.whenDefined("imap-widget");

    expect(el.hasAttribute("data-upgraded")).to.be.true;
    expect(el.getAttribute("data-source")).to.equal("importmap");
  });

  it("should ignore the import map unless useImportMapsCatalog is set", () => {
    installImportMap({ "imap-off": fixtureModule("imap-off", "importmap") });

    const el = document.createElement("imap-off");
    el.setAttribute("loading", "eager");
    fixtures.appendChild(el);

    registry = new AutoLoader({ catalog: {}, root: fixtures });

    expect(registry.getLoader("imap-off")).to.not.exist;
    expect(el.matches(":not(:defined)")).to.be.true;
  });

  it("should only treat names containing a dash as components", () => {
    installImportMap({
      "imap-dashed": fixtureModule("imap-dashed", "importmap"),
      lit: "/lit.js",
      uhtml: "/uhtml.js",
    });

    registry = new AutoLoader({ useImportMapsCatalog: true, root: fixtures });

    expect(registry.catalog).to.have.property("imap-dashed");
    expect(registry.catalog).to.not.have.property("lit");
    expect(registry.catalog).to.not.have.property("uhtml");
  });

  it("should merge the import map with an explicit catalog, letting the catalog win", () => {
    installImportMap({ "imap-clash": fixtureModule("imap-clash", "importmap") });
    const fromCatalog = fixtureModule("imap-clash", "catalog");
    const own = fixtureModule("imap-own", "catalog");

    registry = new AutoLoader({
      useImportMapsCatalog: true,
      catalog: { "imap-clash": fromCatalog, "imap-own": own },
      root: fixtures,
    });

    expect(registry.getLoader("imap-clash"), "the explicit catalog wins a collision").to.equal(fromCatalog);
    expect(registry.getLoader("imap-own"), "the explicit catalog is kept").to.equal(own);
  });

  it("should read only the first import map in the document", () => {
    installImportMap({ "imap-first": fixtureModule("imap-first", "importmap") });
    installImportMap({ "imap-second": fixtureModule("imap-second", "importmap") });

    registry = new AutoLoader({ useImportMapsCatalog: true, root: fixtures });

    expect(registry.catalog).to.have.property("imap-first");
    expect(registry.catalog, "only the first <script type=importmap> is read").to.not.have.property("imap-second");
  });

  it("should not read an import map added after the registry starts", () => {
    registry = new AutoLoader({ useImportMapsCatalog: true, root: fixtures });

    installImportMap({ "imap-late": fixtureModule("imap-late", "importmap") });

    expect(registry.getLoader("imap-late")).to.not.exist;
  });

  it("should survive a page with no import map", () => {
    // The `?autoload` canary sets the flag with no catalog: an empty page must
    // yield an empty catalog, not a crash.
    expect(() => {
      registry = new AutoLoader({ useImportMapsCatalog: true, root: fixtures });
    }).to.not.throw();

    expect(registry.catalog).to.deep.equal({});
  });
});

