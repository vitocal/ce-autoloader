class ViHello extends HTMLElement {
    connectedCallback() {
        this.render()
    }

    render() {
        this.innerHTML = `<span>Hello World</span>`;
    }
}
customElements.define('vi-hello', ViHello)
export default ViHello;

declare global {
    interface HTMLElementTagNameMap {
        'vi-hello': ViHello;
    }
}
