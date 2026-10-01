// Ambient types for the demo pages. The demos are not part of the published
// library, so this file just gives the editor enough truth to stay quiet about
// things that are resolved at build time (CSS side-effect imports, Vite virtual
// modules, browser/node guards) or that are runtime-only custom elements.

declare module "*.css";

declare module "virtual:importmap" {
  const importMap: Record<string, string>;
  export default importMap;
}

/** The demos guard on `process` for bundler-agnostic builds; no @types/node here. */
declare const process: { env: Record<string, string | undefined> };
