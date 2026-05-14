import { totalPrice, cart, removeFromCart } from "../store.js";
import { effect } from "@preact/signals-core";

export default class TotalSummary extends HTMLElement {
  #stopEffect;

  constructor() {
    super();
  }

  connectedCallback() {
    this.#stopEffect = effect(() => {
      this.render();
    });
  }

  disconnectedCallback() {
    if (this.#stopEffect) this.#stopEffect();
  }

  render() {
    this.innerHTML = `
      <div style="position: fixed; bottom: 20px; right: 20px; background: #d43008; color: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); min-width: 250px;">
        <h2 style="margin-top: 0;">Svelte Summary</h2>
        <p>Total Items: ${cart.value.length}</p>
        <ul style="max-height: 150px; overflow-y: auto; padding: 0; list-style: none;">
          ${cart.value
            .map(
              (item) => `
            <li style="display: flex; justify-content: space-between; margin-bottom: 5px; background: rgba(255,255,255,0.1); padding: 5px; border-radius: 4px;">
              <span>${item.name} ($${item.price})</span>
              <button class="remove-btn" data-id="${item.id}" style="background: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; color: #ff3e00; font-weight: bold; line-height: 1;">&times;</button>
            </li>
          `,
            )
            .join("")}
        </ul>
        <hr style="border-color: rgba(255,255,255,0.3)" />
        <h3 style="margin-bottom: 0;">Total: $${totalPrice.value}</h3>
      </div>
    `;

    this.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-id"));
        const product = cart.value.find((p) => p.id === id);
        if (product) removeFromCart(product);
      });
    });
  }
}

customElements.define("total-summary", TotalSummary);
