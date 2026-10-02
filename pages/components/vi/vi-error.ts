class ViError extends HTMLElement {
  connectedCallback() {
    throw new Error("I've crashed while rendering 😭");
    this.render();
  }

  render() {
    this.innerHTML = `✅ passed`;
  }
}
customElements.define("vi-error", ViError);
export default ViError;

