import { LitElement } from "lit";

import { html } from "lit/static-html.js";

export default class ViDefined extends LitElement {
  static properties = {
    counter: { state: true, default: 0 },
  };

  constructor() {
    super();
    this.counter = 0;
  }

  createRenderRoot() {
    return this;
  }

  increment() {
    this.counter++;
  }

  decrement() {
    this.counter--;
  }

  render() {
    return html`<div class="counter-card vanilla">
      <h3>I'm defined and interactive!</h3>
      <div class="controls">
        <button type="button" @click=${this.decrement}>-</button>
        <span class="count">${this.counter}</span>
        <button type="button" @click=${this.increment}>+</button>
      </div>
    </div> `;
  }
}

customElements.define("vi-defined", ViDefined);
