
import CERegistry from "../src/index.ts";

// Setup globalThis
globalThis.catalog = { "initial": "loader" };

const registry = new CERegistry();

console.log("Check 1: registry.catalog should be globalThis.catalog");
console.log(registry.catalog === globalThis.catalog ? "PASS" : "FAIL");

console.log("Check 2: Mutation should reflect");
globalThis.catalog["new-comp"] = "new-loader";
console.log(registry.catalog["new-comp"] === "new-loader" ? "PASS" : "FAIL");

console.log("Check 3: registry.options.catalog should also be the same reference");
console.log(registry.options.catalog === globalThis.catalog ? "PASS" : "FAIL");

console.log("Check 4: Explicit catalog in constructor should override and sync back");
const customCatalog = { "custom": "loader" };
const registry2 = new CERegistry({ catalog: customCatalog });
console.log(registry2.catalog === customCatalog ? "PASS" : "FAIL");
console.log(globalThis.catalog === customCatalog ? "PASS" : "FAIL");
