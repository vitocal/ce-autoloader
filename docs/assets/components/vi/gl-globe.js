import i from "globe.gl";
class l extends HTMLElement {
  connectedCallback() {
    this.render(), this.setup();
  }
  setup() {
    const e = this.getBoundingClientRect(), t = this.querySelector("#globeViz");
    t && new i(t).globeImageUrl(
      "//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
    ).width(e.width).height(e.height);
  }
  render() {
    this.innerHTML = '<div id="globeViz"></div>';
  }
}
customElements.define("gl-globe", l);
