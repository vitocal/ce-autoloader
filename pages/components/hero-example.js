import { LitElement, css, adoptStyles } from "lit";
import { html, unsafeStatic } from "lit/static-html.js";

import nordSelect from "@nordhealth/components/lib/Select.js";
import nordButton from "@nordhealth/components/lib/Button.js";

const demos = {
  "model-viewer": html`<model-viewer
    on="eager"
    camera-controls
    touch-action="pan-y"
    auto-rotate
    poster="https://modelviewer.dev/assets/poster-shishkebab.webp"
    tone-mapping="aces"
    src="https://modelviewer.dev/shared-assets/models/shishkebab.glb"
    shadow-intensity="1"
    alt="A 3D model of a shishkebab"
    view-transition-name="model-viewer"
  ></model-viewer>`,
  "confetti-button": html`<confetti-button on="eager"
    ><div class="card" view-transition-name="confetti-button">🎉 Click me to throw confetti 🎉</div></confetti-button
  >`,
  "gl-globe": html`<gl-globe on="eager" view-transition-name="gl-globe"></gl-globe>`,
  "fireworks-js": html`<fireworks-js on="eager"></fireworks-js>`,
};

export default class HeroExample extends LitElement {
  static styles = css`
    @layer components {
      hero-example {
        display: grid;
        grid-template-columns: 2fr 1fr;
        grid-gap: 1rem;
        position: relative;
        align-items: stretch;
        perspective: 1000px;

        .left {
          grid-column: 1 / 2;
        }
        .right {
          grid-column: 2 / 3;
        }

        pre {
          height: 100%;
        }

        .preview {
          opacity: 1;
          animation: 1300ms ease both fade-in;
          animation-delay: var(--spring-duration);
          position: relative;
        }

        nord-select:not(:defined) {
          width: 148px;
          height: 36px;
        }
      }

      syntax-highlight {
        height: 100%;
        width: 100%;
        white-space: pre-wrap;
      }

      model-viewer,
      gl-globe {
        width: 100%;
        height: 100%;
      }

      fireworks-js {
        height: 480px;
      }

      confetti-button {
        text-align: center;
      }

      @media (max-width: 100ch) {
        hero-example {
          grid-template-columns: 1fr !important;

          .left,
          .right {
            max-width: 100%;
            grid-column: 1 / -1 !important;
          }
          .right {
            height: auto;
          }
        }
      }
    }

    ::view-transition-image-pair(hero-example) {
      transform-style: preserve-3d;
      perspective-origin: center;
      perspective: 1000px;
    }

    ::view-transition-old(hero-example) {
      animation: calc(var(--spring-duration) * 0.5) ease-out both fade-out;
    }

    ::view-transition-new(hero-example) {
      animation: var(--spring-duration) var(--spring-easing) both appear-below-in;
    }

    ::view-transition-group(model-viewer) {
      animation: var(--spring-duration) var(--spring-easing) both;
    }
  `;

  static properties = {
    demo: { state: true },
  };

  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    this.demo = "model-viewer";

    // In light-dom mode, we need to adopt the styles
    if (
      this.constructor.styles.styleSheet &&
      !document.adoptedStyleSheets.includes(this.constructor.styles.styleSheet)
    ) {
      document.adoptedStyleSheets.push(this.constructor.styles.styleSheet);
    }
  }

  js_template() {
    return `&lt;script type="module">
	import CERegistry from 'ce-autoloader';

	/* A central registry for all our components 😘 */
  const catalog = {
			"model-viewer": "//unpkg.com/@google/model-viewer",
			"fireworks-js": "//esm.sh/@fireworks-js/web",
			"gl-globe": () => import("./vi/gl-globe.ts")
  };
	const registry = new CERegistry({catalog});
&lt;/script>

&lt;body>
	&lt;!-- Use the component in your HTML, just like any other element -->
	&lt;model-viewer src="//modelviewer.dev/shared-assets/models/shishkebab.glb">
	&lt;/model-viewer>
&lt;/body>`;
  }

  html_template() {
    return `&lt;!-- Use it like any other HTML element--&gt;
& lt; model - viewer camera - controls auto - rotate src = "https://modelviewer.dev/shared-assets/models/shishkebab.glb" >& lt;/model-viewer>
	`;
  }

  onClick() {
    this.mode = this.mode === "code" ? "preview" : "code";
  }

  onDemoSelect(ev) {
    this.demo = ev.target.value;
  }

  render() {
    let preview = demos[this.demo];

    return html`<div class="left window flex-y no-wrap">
        <h4 class="flex-x">
          Demo

          <nord-select
            name="demo"
            value="model-viewer"
            hide-label
            class="ml-auto"
            @change=${this.onDemoSelect}
            view-transition-name="hero-demo-select"
          >
            <option value="model-viewer">model-viewer</option>
            <option value="gl-globe">gl-globe</option>
            <option value="fireworks-js">fireworks-js</option>
            <option value="confetti-button">confetti-button</option>
          </nord-select>
        </h4>
        <pre><syntax-highlight language="js" view-transition-name="hero-demo-code">${unsafeStatic(
          this.js_template(),
        )}</syntax-highlight></pre>
      </div>

      <div class="right preview flex-y" mode=${this.mode}>${preview}</div>`;
  }
}

customElements.define("hero-example", HeroExample);
