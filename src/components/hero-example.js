import { LitElement, css, adoptStyles } from "lit";
import { html, unsafeStatic } from 'lit/static-html.js';

class HeroExample extends LitElement {
	static styles = css`
    @layer component {
		hero-example {
			display: grid;
			grid-template-columns: 1fr 1fr;
			grid-gap: 1rem;
			position: relative;
			align-items: center;
		}
		syntax-highlight { height: 100%; width: 100%; }
		three-cube {
			width: 100%;
			height: 160px;


			&:not(:defined) {
				width: 100%;
				height: 160px;

				background-color: var(--color-bg-dark);
			}
		}


		.left {
			grid-column: 1 / 2;
		}
		.right {
			grid-column: 2 / 3;
		}

		.preview {
			transition: height 0.3s ease-in-out;
		}
		.preview[mode="code"] {
			height: 150px;
		}
		.preview[mode="preview"] {
			height: calc-size(auto, size);
			height: auto;
		}

		@media (max-width: 420px) {
			hero-example {
				display: flex;
				flex-direction: column;
				width: 100%;
				flex-wrap: wrap;
				align-items: stretch;
			}

			.left,.right {
				max-width: 100%;
			}
		}
    }`

	static properties = {
		mode: { state: true },
	};

	createRenderRoot() {
		return this;
	}

	constructor() {
		super();
		this.mode = "code";
	}

	connectedCallback() {
		super.connectedCallback();

		// In light-dom mode, we need to adopt the styles
		if (this.shadowRoot === null && this.constructor.styles.styleSheet &&
			!document.adoptedStyleSheets.includes(this.constructor.styles.styleSheet)
		) {
			document.adoptedStyleSheets.push(this.constructor.styles.styleSheet);
		}
	}



	js_template() {
		return `import CERegistry from 'ce-autoloader';

const registry = new CERegistry({
	root: document.body,
	/* A central registry for all your components 😘 */
	catalog: {
		"three-cube": () => import("/src/components/three-cube.js"),
		"nord-button": "https://unpkg.com/@nord-ui/button@1.0.0/dist/nord-button.js",
	}
});

await registry.discover();`;
	}

	html_template() {
		return `&lt;body>
		&lt;!-- Anywhere in my HTML page -->
		&lt;three-cube>&lt;/three-cube>
&lt;/body>`
	}

	onClick() {
		this.mode = (this.mode === "code") ? "preview" : "code";
	}


	updated() {
		// Need to call discover for three-cube
		// if (globalThis.registry) {
		//     globalThis.registry.discover();
		// }
	}

	render() {
		let preview = this.mode === "code"
			? html`<pre><syntax-highlight language="html">${unsafeStatic(this.html_template())}</syntax-highlight></pre>`
			: html`<three-cube ce-outline-highlight></three-cube>`;

		return html`
			<div class="left card flex-y" >
        		<h4 class="flex-x">
					Javascript
					<nord-button @click=${this.onClick} class="ml-auto" variant="primary" size="m" square>
					  <nord-icon name="interface-play" label="Play" size="m"></nord-icon>
					</nord-button>
				</h4>
        		<pre><syntax-highlight language="js">${unsafeStatic(this.js_template())}</syntax-highlight></pre>
    		</div>

			<div class="preview right card flex-y" mode=${this.mode}>
				<h4 class="flex-x">Preview</h4>
				${preview}
			</div>
		`
	}
}

customElements.define('hero-example', HeroExample)