import{t as e}from"./utils.js";import{n as t,t as n}from"./static-html.js";import{LitElement as r,css as i}from"lit";var a={"model-viewer":t`<model-viewer
    on="eager"
    camera-controls
    touch-action="pan-y"
    auto-rotate
    src="//modelviewer.dev/shared-assets/models/shishkebab.glb"
    alt="A 3D model of a shishkebab"
  ></model-viewer>`,"confetti-button":t`<confetti-button on="eager"
    ><div class="card" view-transition-name="confetti-button">🎉 Click me to throw confetti 🎉</div></confetti-button
  >`,"gl-globe":t`<gl-globe on="eager" view-transition-name="gl-globe"></gl-globe>`,"fireworks-js":t`<fireworks-js on="eager"></fireworks-js>`},o=class extends r{static styles=i`
    @layer components {
      hero-example {
        display: grid;
        grid-template-columns: 2fr 1fr;
        grid-gap: 1rem;
        position: relative;
        align-items: stretch;

        .left {
          grid-column: 1 / 2;
        }
        .right {
          grid-column: 2 / 3;
        }

        .window {
          overflow-clip-margin: 1em;
        }

        pre {
          height: 100%;
        }

        .preview {
          opacity: 1;
          // animation: 1300ms ease both fade-in;
          // animation-delay: var(--spring-duration);
          position: relative;
          max-width: 300px;
          overflow: hidden;
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
          grid-template-columns: none;
          grid-template-rows: 1fr 1fr;

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

    // ::view-transition-group(model-viewer),
    // ::view-transition-group(gl-globe),
    // ::view-transition-group(fireworks-js),
    // ::view-transition-group(confetti-button) {
    //   animation: var(--spring-duration) var(--spring-easing) both;
    // }
  `;static properties={demo:{state:!0}};createRenderRoot(){return this}constructor(){super(),this.demo=`model-viewer`,e(this.getRootNode(),this.constructor.styles.styleSheet)}js_template(){return`&lt;script type="module">
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
&lt;/body>`}html_template(){return`&lt;!-- Use it like any other HTML element--&gt;
& lt; model - viewer camera - controls auto - rotate src = "https://modelviewer.dev/shared-assets/models/shishkebab.glb" >& lt;/model-viewer>
	`}onClick(){this.mode=this.mode===`code`?`preview`:`code`}onDemoSelect(e){this.demo=e.target.value}render(){let e=a[this.demo];return t`<div class="left window flex-y no-wrap">
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
        <pre><syntax-highlight language="js" view-transition-name="hero-demo-code">${n(this.js_template())}</syntax-highlight></pre>
      </div>

      <div class="right preview flex-y" mode=${this.mode}>${e}</div>`}};customElements.define(`hero-example`,o);export{o as default};
//# sourceMappingURL=hero-example.js.map