# Micro-Frontends Store Example

This example demonstrates how to use `ce-autoloader` to orchestrate a Micro-Frontends (MFE) architecture.

## Architecture

- **Shared State**: Managed via `@preact/signals-core`. All components subscribe to the same signals to stay in sync.
- **Components**:
  - **Category Filter (React)**: Allows filtering products by category.
  - **Product Grid (Vue)**: Displays products and allows adding them to the cart.
  - **Total Summary (Svelte/Custom Element)**: Displays the cart contents and total price.
- **Orchestration**: `ce-autoloader` is used to discovery and lazy-load these components as they appear in the DOM.

## How it works

1. Each component is defined as a Custom Element (Web Component).
2. The `catalog` in `index.html` maps tag names to their respective entry points.
3. `ce-autoloader` monitors the DOM and loads the components only when needed (e.g., `loading="visible"`).
4. Since all components share the same `store.js` (via ESM imports), they can communicate reactively.

## Running the example

```bash
cd pages/examples/mfe-store
npm install
npm run dev
```

Or just open the `index.html` if you have a dev server running at the root of the project.
