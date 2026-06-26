//#region pages/components/vi/vi-hello.ts
var e = class extends HTMLElement {
	connectedCallback() {
		this.render();
	}
	render() {
		this.innerHTML = "<span>Hello World</span>";
	}
};
customElements.define("vi-hello", e);
//#endregion
export { e as default };
