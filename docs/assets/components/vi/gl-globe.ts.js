import e from "globe.gl";
//#region pages/components/vi/gl-globe.ts
var t = class extends HTMLElement {
	connectedCallback() {
		this.render(), this.setup();
	}
	setup() {
		let t = this.getBoundingClientRect(), n = this.querySelector("#globeViz");
		n && new e(n).globeImageUrl("//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg").width(t.width).height(t.height);
	}
	render() {
		this.innerHTML = "<div id=\"globeViz\"></div>";
	}
};
customElements.define("gl-globe", t);
//#endregion
