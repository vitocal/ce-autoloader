export default class ErrorFallback extends HTMLElement {
  error: string = "";
  stack: string = "";

  constructor() {
    super();
  }

  connectedCallback() {
    this.attachShadow({ mode: "open" });
    this.render();
  }

  render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `<style>
        :host {
          display: block;
          background-color: #ff4d4d;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          color: white;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          margin: 1rem 0;
          overflow: hidden;
        }
        details {
          width: 100%;
        }
        summary {
          cursor: pointer;
          font-weight: bold;
          user-select: none;
        }
        pre {
          background: rgba(0,0,0,0.2);
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          overflow-x: auto;
          margin-top: 0.5rem;
          white-space: pre-wrap;
        }
      </style>
      <details>
        <summary>${this.error}</summary>
        ${this.stack ? `<pre>${this.stack}</pre>` : ""}
      </details>`;
  }
}

customElements.define("error-fallback", ErrorFallback);
