import{LitElement as r,css as i}from"lit";import{s as t,u as e}from"./syntax-highlight-element-CxIAthIL.js";import"https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";import"https://esm.sh/@nordhealth/components/lib/Button.js?external=lit";import"https://esm.sh/@nordhealth/components/lib/Icon.js?external=lit";import"./lit-html-Dbe4NQd5.js";class s extends r{static styles=i`
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
				opacity: 0;
				animation: 100ms ease both fade-in;
				animation-delay: var(--spring-duration);
				position: relative;
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
	}`;static properties={mode:{state:!0}};createRenderRoot(){return this}constructor(){super(),this.mode="preview",this.constructor.styles.styleSheet&&!document.adoptedStyleSheets.includes(this.constructor.styles.styleSheet)&&document.adoptedStyleSheets.push(this.constructor.styles.styleSheet)}js_template(){return`import CERegistry from 'ce-autoloader';

/* A central registry for all our components 😘 */
const registry = new CERegistry({
	catalog: {
		"model-viewer": "https://unpkg.com/@google/model-viewer",
		"nord-button": "https://unpkg.com/@nord-ui/button@1.0.0/dist/nord-button.js",
	}
});

// Use the component in your HTML, just like any other element
// &lt;model-viewer camera-controls auto-rotate src="https://modelviewer.dev/shared-assets/models/shishkebab.glb">&lt;/model-viewer>

// And load only the components used in the page
document.addEventListener('load', () => registry.discover());

`}html_template(){return`&lt;!-- Use it like any other HTML element -->
&lt;model-viewer camera-controls auto-rotate src="https://modelviewer.dev/shared-assets/models/shishkebab.glb" >&lt;/model-viewer>
		`}onClick(){this.mode=this.mode==="code"?"preview":"code"}render(){let o=this.mode==="code"?e`<pre><syntax-highlight language="html">${t(this.html_template())}</syntax-highlight></pre>`:e`<model-viewer camera-controls touch-action="pan-y" auto-rotate poster="https://modelviewer.dev/assets/poster-shishkebab.webp" tone-mapping="aces" src="https://modelviewer.dev/shared-assets/models/shishkebab.glb" shadow-intensity="1" alt="A 3D model of a shishkebab" ></model-viewer>`;return e`
			<div class="left window flex-y" >
        		<h4 class="flex-x">
					Demo

					<nord-dropdown size="s">
						<nord-button slot="toggle">Menu</nord-button>
						<nord-dropdown-item href="#">View profile</nord-dropdown-item>
						<nord-dropdown-item>Settings</nord-dropdown-item>
						<nord-dropdown-item>Show keyboard shortcuts</nord-dropdown-item>
						<nord-dropdown-item>Help & Support</nord-dropdown-item>
						<nord-dropdown-item>API</nord-dropdown-item>
						<nord-dropdown-item>Sign out</nord-dropdown-item>
					</nord-dropdown>
				</h4>
        		<pre><syntax-highlight language="js">${t(this.js_template())}</syntax-highlight></pre>
    		</div>

			<div class="right preview flex-y" mode=${this.mode}>
				<!--
				<h4 class="flex-x"> Preview
					<nord-button @click=${this.onClick} class="ml-auto" variant="primary" size="m" square>
						<nord-icon name="interface-play" label="Play" size="m"></nord-icon>
					</nord-button>
				</h4>
				-->
				${o}
			</div>
		`}}customElements.define("hero-example",s);export{s as default};
