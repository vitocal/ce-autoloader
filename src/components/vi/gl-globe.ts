import Globe from "globe.gl";

const N = 300;
const gData = [...Array(N).keys()].map(() => ({
  lat: (Math.random() - 0.5) * 180,
  lng: (Math.random() - 0.5) * 360,
  size: Math.random() / 3,
  color: ["red", "white", "blue", "green"][Math.round(Math.random() * 3)],
}));

class GlGlobe extends HTMLElement {
  connectedCallback() {
    this.render();
    const size = this.getBoundingClientRect();
    new Globe(this.querySelector("#globeViz"))
      .globeImageUrl(
        "//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg",
      )
      .width(size.width)
      .height(size.height);
  }

  render() {
    this.innerHTML = `<div id="globeViz"></div>`;
  }
}
customElements.define("gl-globe", GlGlobe);
