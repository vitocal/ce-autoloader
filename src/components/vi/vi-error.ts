throw new Error("This component throwed an error purposefully");

class ViError extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `<div id="globeViz"></div>`;
  }
}
customElements.define("vi-error", ViError);
