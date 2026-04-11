class ViError extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `✅ passed`;
  }
}
customElements.define("vi-error", ViError);
export default ViError;

