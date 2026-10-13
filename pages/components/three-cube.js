import * as THREE from "three";

const ROTATION_SPEED = 0.6; // rad/s — the old 0.01 per frame, now frame-rate independent
const MAX_DELTA = 0.1; // seconds; a pause must not become a jump on the next frame

/**
 * The "click to load" example on the landing page: a spinning cube.
 *
 * A WebGL context is a finite resource (~16 live per page), so everything built
 * here is released again in `disconnectedCallback` — including the context,
 * which `renderer.dispose()` alone does not free. `connectedCallback` is safe to
 * run again, and the teardown is deferred by a microtask because moving an
 * element within the document fires disconnect + connect in the same task.
 *
 * The box is the inner container, not the host: a document rule that matches the
 * element (the demo's `[ce]` styles) outranks `:host`, so a `min-height` there
 * gets overridden and the box collapses. The container holds the height open and
 * the canvas is stretched over it by CSS, so the aspect ratio follows the box.
 */
export default class ThreeCube extends HTMLElement {
  #teardown = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    if (this.#teardown) return; // a move keeps the context it already has

    this.shadowRoot.innerHTML = `
            <style>
                :host { display: block; width: 100%; min-height: 160px; }
                #container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    width: 100%;
                    height: 100%;
                    min-height: 160px;
                }
                canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
            </style>
            <div id="container">
                <slot></slot>
            </div>
        `;

    const container = this.shadowRoot.getElementById("container");

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      // A throw in connectedCallback is reported to `window` by the platform and
      // never reaches the loader's error path, so say it on the element itself.
      this.textContent = "WebGL is unavailable";
      return;
    }

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x00f0f0);

    // Camera
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
    camera.position.z = 3;

    // Renderer. `setSize(…, false)` leaves the display size to the CSS above, so the
    // canvas is stretched to the box instead of being pinned to the measured pixels.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Cube
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshNormalMaterial();
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Animation
    const timer = new THREE.Timer();
    timer.connect(document); // a hidden tab then reports a zero delta

    const render = (time) => {
      timer.update(time);
      const delta = Math.min(timer.getDelta(), MAX_DELTA);
      cube.rotation.x += delta * ROTATION_SPEED;
      cube.rotation.y += delta * ROTATION_SPEED;
      renderer.render(scene, camera);
    };

    const resize = (width, height) => {
      if (!width || !height) return; // 0 is a NaN aspect ratio and an empty drawing buffer
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.render(scene, camera); // the loop may be stopped (reduced motion, off screen)
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncLoop = () => {
      if (reducedMotion.matches) {
        renderer.setAnimationLoop(null); // one still frame instead of a spin
        renderer.render(scene, camera);
      } else {
        renderer.setAnimationLoop(render);
      }
    };

    // Draw only what someone can see. A background tab needs no handling: browsers
    // stop requestAnimationFrame for those, and Timer zeroes the delta.
    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) syncLoop();
      else renderer.setAnimationLoop(null);
    });
    visibility.observe(this);

    const resizes = new ResizeObserver(([entry]) => {
      resize(entry.contentRect.width, entry.contentRect.height);
    });
    resizes.observe(container);

    reducedMotion.addEventListener("change", syncLoop);

    resize(container.clientWidth, container.clientHeight);

    // Cleanup
    this.#teardown = () => {
      renderer.setAnimationLoop(null); // three owns the rAF handle; this cancels it
      visibility.disconnect();
      resizes.disconnect();
      reducedMotion.removeEventListener("change", syncLoop);
      timer.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss(); // dispose() frees GPU objects, not the context itself
      renderer.domElement.remove();
    };
  }

  disconnectedCallback() {
    // Deferred: a move within the document fires disconnect + connect in one task,
    // and rebuilding the context for that is pure waste.
    queueMicrotask(() => {
      if (this.isConnected) return;
      this.#teardown?.();
      this.#teardown = null;
    });
  }
}

if (!customElements.get("three-cube")) {
  customElements.define("three-cube", ThreeCube);
}
