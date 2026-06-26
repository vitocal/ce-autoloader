//#region pages/components/vi/vi-error.ts
var e = class extends HTMLElement {
	connectedCallback() {
		this.render();
	}
	render() {
		this.innerHTML = "✅ passed";
	}
};
customElements.define("vi-error", e);
//#endregion
export { e as default };
