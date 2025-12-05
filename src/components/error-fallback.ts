export default class ErrorFallback extends HTMLElement {
  error: string = "";
  stack: string = "";

  static get observedAttributes() {
    return ["error", "stack"];
  }

  constructor() {
    super();
    this.error = this.getAttribute("error") || "";
    this.stack = this.getAttribute("stack") || "";
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "error") {
      this.error = newValue;
      this.render();
    } else if (name === "stack") {
      this.stack = newValue;
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
          padding: 8px 4px;
        }
      </style>
      <details>
        <summary>${this.error}</summary>
        ${this.stack ? `<pre>${this.stack}</pre>` : ""}
      </details>
    `;
  }
}

// customElements.define('error-fallback', ErrorFallback);