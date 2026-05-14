class e extends HTMLElement {
  connectedCallback() {
    this.render();
  }
  render() {
    this.innerHTML = "✅ passed";
  }
}
customElements.define("vi-error", e);
export {
  e as default
};
