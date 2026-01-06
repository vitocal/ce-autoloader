import{LitElement as o,css as i}from"lit";import{s as r,u as t}from"./static-D4Ns-GM0.js";import"./lit-html-Dbe4NQd5.js";const s={"model-viewer":t`<model-viewer on="eager" camera-controls touch-action="pan-y" auto-rotate poster="https://modelviewer.dev/assets/poster-shishkebab.webp" tone-mapping="aces" src="https://modelviewer.dev/shared-assets/models/shishkebab.glb" shadow-intensity="1" alt="A 3D model of a shishkebab" ></model-viewer>`,"confetti-button":t`<confetti-button on="eager"><div class="card">🎉 Click me to throw confetti 🎉</div></confetti-button>`};class a extends o{static styles=i`
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

			.left nord-select {
				max-width: auto;
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
				display: flex;
				flex-direction: column;
				width: 100%;
				flex-wrap: wrap;
				align-items: stretch;

				.left,.right {
					max-width: 100%;
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
		animation: var(--spring-duration) ease-out both fade-out;
	}

	::view-transition-new(hero-example) {
		animation: var(--spring-duration) var(--spring-easing) both appear-below-in;
	}`;static properties={demo:{state:!0}};createRenderRoot(){return this}constructor(){super(),this.demo="model-viewer",this.constructor.styles.styleSheet&&!document.adoptedStyleSheets.includes(this.constructor.styles.styleSheet)&&document.adoptedStyleSheets.push(this.constructor.styles.styleSheet)}js_template(){return`import CERegistry from 'ce-autoloader';

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

`}html_template(){return`&lt;!-- Use it like any other HTML element -->
&lt;model-viewer camera-controls auto-rotate src="https://modelviewer.dev/shared-assets/models/shishkebab.glb" >&lt;/model-viewer>
		`}onClick(){this.mode=this.mode==="code"?"preview":"code"}onDemoSelect(e){this.demo=e.target.value}render(){let e=s[this.demo];return t`
			<div class="left window flex-y" >
        		<h4 class="flex-x">
					Demo

					<nord-select on="eager" name="demo" value="model-viewer" hide-label class="ml-auto" @change=${this.onDemoSelect}>
						<option value="model-viewer">model-viewer</option>
						<option value="confetti-button">confetti-button</option>
					</nord-select>
				</h4>
        		<pre><syntax-highlight language="js" on="eager">${r(this.js_template())}</syntax-highlight></pre>
    		</div>

			<div class="right preview flex-y" mode=${this.mode}>
				<!--
				<h4 class="flex-x"> Preview
					<nord-button @click=${this.onClick} class="ml-auto" variant="primary" size="m" square>
						<nord-icon name="interface-play" label="Play" size="m"></nord-icon>
					</nord-button>
				</h4>
				-->
				${e}
			</div>
		`}}customElements.define("hero-example",a);export{a as default};
