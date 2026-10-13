/**
 * A reveal panel for the lifecycle demo on the landing page.
 *
 * Deliberately dumb: it renders a box, a label and (optionally) a body paragraph,
 * nothing else. The reveal is page CSS keyed on `[ce="defined"]` — what is being
 * demonstrated is the *contract* a stylesheet hooks into, not a component's private
 * animation.
 *
 * The body exists for the height example: the box has to be taller than the slot
 * it reserves, or there is nothing to grow into.
 *
 * It is a normal catalog entry (`pages/components/catalog.js`), so the `ce` states
 * are painted by `src/lifecycle.ts` like any other component's.
 */
export default class CeReveal extends HTMLElement {
  connectedCallback() {
    if (this.dataset.mounted) return;
    this.dataset.mounted = "1";

    const label = this.getAttribute("label") ?? "reveal";
    const note = this.getAttribute("note") ?? "";
    const body = this.getAttribute("body") ?? "";

    this.innerHTML = `<span class="ce-reveal__inner"><strong>${label}</strong>${
      note ? `<small>${note}</small>` : ""
    }${body ? `<p>${body}</p>` : ""}</span>`;
  }
}

if (!customElements.get("ce-reveal")) {
  customElements.define("ce-reveal", CeReveal);
}
