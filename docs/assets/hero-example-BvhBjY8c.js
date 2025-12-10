import{LitElement as r,css as o}from"lit";import{s as t,u as e}from"./syntax-highlight-element-CxIAthIL.js";import"https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";import"https://esm.sh/@nordhealth/components/lib/Button.js?external=lit";import"https://esm.sh/@nordhealth/components/lib/Icon.js?external=lit";import"./lit-html-Dbe4NQd5.js";class s extends r{static styles=o`
    @layer components {
		hero-example {
			display: grid;
			grid-template-columns: 2fr 1fr;
			grid-gap: 1rem;
			position: relative;
			align-items: center;
			perspective: 1000px;

			.left {
				grid-column: 1 / 2;
			}
			.right {
				grid-column: 2 / 3;
			}

			.preview {
				opacity: 0;
				animation: 100ms ease both fade-in;
				animation-delay: var(--spring-duration);
			}
			.preview[mode="code"] {
				min-height: 160px;
			}
			.preview[mode="preview"] {
				height: auto;
				width: 100%;
				overflow: hidden;
			}
		}
		syntax-highlight {
			height: 100%; width: 100%;
  			white-space: pre-wrap;
		}

		model-viewer {
			width: 100%;
			height: 160px;
			background-color: tan;
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
	}`;static properties={mode:{state:!0}};createRenderRoot(){return this}constructor(){super(),this.mode="code",this.constructor.styles.styleSheet&&!document.adoptedStyleSheets.includes(this.constructor.styles.styleSheet)&&document.adoptedStyleSheets.push(this.constructor.styles.styleSheet)}js_template(){return`import CERegistry from 'ce-autoloader';

const registry = new CERegistry({
	/* A central registry for all our components 😘 */
	catalog: {
		"model-viewer": "https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js",
		"nord-button": "https://unpkg.com/@nord-ui/button@1.0.0/dist/nord-button.js",
	}
});

await registry.discover();`}html_template(){return`&lt;!-- Anywhere in my HTML page -->
&lt;model-viewer camera-controls touch-action="pan-y" auto-rotate tone-mapping="aces"
shadow-intensity="1" alt="A 3D model of a shishkebab"
src="https://modelviewer.dev/shared-assets/models/shishkebab.glb" >&lt;/model-viewer>
		`}onClick(){this.mode=this.mode==="code"?"preview":"code"}render(){let i=this.mode==="code"?e`<pre><syntax-highlight language="html">${t(this.html_template())}</syntax-highlight></pre>`:e`<model-viewer camera-controls touch-action="pan-y" auto-rotate poster="https://modelviewer.dev/assets/poster-shishkebab.webp" tone-mapping="aces" src="https://modelviewer.dev/shared-assets/models/shishkebab.glb" shadow-intensity="1" alt="A 3D model of a shishkebab" ></model-viewer>`;return e`
			<div class="left flex-y window" >
        		<h4 class="flex-x">
					Javascript
					<nord-button @click=${this.onClick} class="ml-auto" variant="primary" size="m" square>
					  <nord-icon name="interface-play" label="Play" size="m"></nord-icon>
					</nord-button>
				</h4>
        		<pre><syntax-highlight language="js">${t(this.js_template())}</syntax-highlight></pre>
    		</div>

			<div class="preview right window flex-y" mode=${this.mode}>
				<h4 class="flex-x">Preview</h4>
				${i}
			</div>
		`}}customElements.define("hero-example",s);export{s as default};
