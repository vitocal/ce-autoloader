export class ErrorFallback extends HTMLElement {
  error: string = "";

  static get observedAttributes() {
    return ["error"];
  }

  constructor() {
    super();
    this.error = this.getAttribute("error") || "";
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "error") {
      this.error = newValue;
      this.render();
    }
  }

  connectedCallback() {
    this.attachShadow({ mode: "open" });
    this.render();
  }

  render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background-color: red;
          font-family: monospace;
          color: white;
          padding: 8px;
        }
      </style>
      <p>${this.error}</p>
    `;

  }
}


customElements.define('error-fallback', ErrorFallback);