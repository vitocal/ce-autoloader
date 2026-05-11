export default class SvelteCounter extends HTMLElement {
  #count = 0;

  constructor() {
    super();
  }

  connectedCallback() {
    this.#render();
  }

  #increment() {
    this.#count++;
    this.#update();
  }

  #decrement() {
    this.#count--;
    this.#update();
  }

  #update() {
    const countEl = this.querySelector(".count");
    if (countEl) countEl.textContent = this.#count.toString();
  }

  #render() {
    this.innerHTML = `
            <div class="counter-card svelte">
                <h3>VanillaJS Counter</h3>
                <div class="controls">
                    <button type="button" class="dec">-</button>
                    <span class="count">${this.#count}</span>
                    <button type="button" class="inc">+</button>
                </div>
            </div>
        `;

    this.querySelector(".inc")?.addEventListener("click", () =>
      this.#increment(),
    );
    this.querySelector(".dec")?.addEventListener("click", () =>
      this.#decrement(),
    );
  }
}
customElements.define("svelte-counter", SvelteCounter);
