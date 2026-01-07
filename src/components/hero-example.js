import { LitElement, css, adoptStyles } from "lit";
import { html, unsafeStatic } from 'lit/static-html.js';

import nordSelect from "@nordhealth/components/lib/Select.js";
import nordButton from "@nordhealth/components/lib/Button.js";

const demos = {
	"model-viewer": html`<model-viewer on="eager" camera-controls touch-action="pan-y" auto-rotate poster="https://modelviewer.dev/assets/poster-shishkebab.webp" tone-mapping="aces" src="https://modelviewer.dev/shared-assets/models/shishkebab.glb" shadow-intensity="1" alt="A 3D model of a shishkebab" ></model-viewer>`,
	"confetti-button": html`<confetti-button on="eager"><div class="card">🎉 Click me to throw confetti 🎉</div></confetti-button>`
}

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
				/* animation: 1000ms ease both fade-in;
				animation-delay: var(--spring-duration); */
				position: relative;
			}

			nord-select:not(:defined) {
				width: 148px;
				height: 36px;
			}
		}

		syntax-highlight {
			height: 100%; width: 100%;
  			white-space: pre-wrap;
		}

		model-viewer {
			width: 100%;
			height: 100%;
		}

		@media (max-width: 60ch) {
			hero-example {
				/* display: flex;
				flex-direction: column;
				width: 100%;
				flex-wrap: wrap;
				align-items: stretch;

				*/
				grid-template-columns: 1fr;

				.left,.right {
					max-width: 100%;
					grid-column: unset;
				}
				.right {
					height: 100%;
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
	}`

	static properties = {
		demo: { state: true }
	};

	createRenderRoot() {
		return this;
	}

	constructor() {
		super();
		this.demo = "initial";

		// In light-dom mode, we need to adopt the styles
		if (this.constructor.styles.styleSheet &&
			!document.adoptedStyleSheets.includes(this.constructor.styles.styleSheet)) {
			document.adoptedStyleSheets.push(this.constructor.styles.styleSheet);
		}
	}

	js_template() {
		return `import CERegistry from 'ce-autoloader';

/* A central registry for all our components 😘 */
const registry = new CERegistry({
	catalog: {
		"model-viewer": "https://unpkg.com/@google/model-viewer",
		"confetti-button": () => import('./confetti-button.ts'),
	}
});

// Use the component in your HTML, just like any other element
// &lt;model-viewer camera-controls auto-rotate src="https://modelviewer.dev/shared-assets/models/shishkebab.glb">&lt;/model-viewer>

// And load only the components used in the page
document.addEventListener('load', () => registry.discover());

`;
	}

	html_template() {
		return `&lt;!-- Use it like any other HTML element -->
&lt;model-viewer camera-controls auto-rotate src="https://modelviewer.dev/shared-assets/models/shishkebab.glb" >&lt;/model-viewer>
		`
	}

	onClick() {
		this.mode = (this.mode === "code") ? "preview" : "code";
	}

	onDemoSelect(ev) {
		this.demo = ev.target.value;
	}

	render() {

		let preview = html`<nord-empty-state>
			<div class="text-center" style="display: flex;flex-direction: column;align-items: center;">
				<h2>3D Model Demo</h2>
				<p>Click to load the interactive 3D model (Heavy!)</p>
				<nord-button variant="primary" @click=${() => this.demo = "model-viewer-loaded"}>Load 3D Model</nord-button>
			</div>
		</nord-empty-state>`;

		if (this.demo === "model-viewer-loaded") {
			preview = demos["model-viewer"];
		} else if (demos[this.demo]) {
			preview = demos[this.demo];
		}

		return html`
			<div class="left window flex-y" >
        		<h4 class="flex-x">
					Demo

					<nord-select on="eager" name="demo" value="model-viewer" hide-label class="ml-auto" @change=${this.onDemoSelect} view-transition-name="hero-demo-select">
						<option value="model-viewer">model-viewer</option>
						<option value="confetti-button">confetti-button</option>
					</nord-select>
				</h4>
        		<pre><syntax-highlight language="js" on="eager" view-transition-name="hero-demo-code">${unsafeStatic(this.js_template())}</syntax-highlight></pre>
    		</div>

			<div class="right preview flex-y" mode=${this.mode}>
				<!--
				<h4 class="flex-x"> Preview
					<nord-button @click=${this.onClick} class="ml-auto" variant="primary" size="m" square>
						<nord-icon name="interface-play" label="Play" size="m"></nord-icon>
					</nord-button>
				</h4>
				-->
				${preview}
			</div>
		`
	}
}

customElements.define('hero-example', HeroExample)