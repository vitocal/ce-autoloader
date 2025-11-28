import { expect } from "chai";
import AutoLoader from '../src/index.ts';

describe("Observability", () => {
    let registry;
    const fixtures = document.getElementById('fixtures');

    beforeEach(() => {
        fixtures.innerHTML = '';

        // Reset observers, but we can't really unregister the custom elements.
        registry?.clean();
        registry = undefined;
    });


    it("should create performance measurement load:${component-name}", async () => {
        const el = document.createElement("perf-test");
        fixtures.appendChild(el);

        const catalog = {
            "perf-test": async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
                class PerfTest extends HTMLElement { }
                customElements.define("perf-test", PerfTest);
            }
        };

        registry = new AutoLoader({
            catalog,
            root: fixtures,
        });
        await registry.upgrade();

        await customElements.whenDefined("perf-test");

        const entries = performance.getEntriesByName("load:perf-test");
        expect(entries).to.have.lengthOf.at.least(1);
        expect(entries[0].entryType).to.equal("measure");
        expect(entries[0].duration).to.be.at.least(100);
    });

})