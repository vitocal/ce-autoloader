import{LitElement as y,css as f}from"lit";import{x}from"./lit-html-DgaWPDDD.js";const g=Symbol.for(""),w=i=>{if(i?.r===g)return i?._$litStatic$},m=i=>({_$litStatic$:i,r:g}),p=new Map,b=i=>(e,...s)=>{const o=s.length;let h,l;const r=[],c=[];let n,t=0,d=!1;for(;t<o;){for(n=e[t];t<o&&(l=s[t],(h=w(l))!==void 0);)n+=h+e[++t],d=!0;t!==o&&c.push(l),r.push(n),t++}if(t===o&&r.push(e[o]),d){const u=r.join("$$lit$$");(e=p.get(u))===void 0&&(r.raw=r,p.set(u,e=r)),s=c}return i(e,...s)},a=b(x);class v extends y{static styles=f`
    @layer component {
			hero-example {
				display: grid;
				grid-template-columns: 1fr 1fr;
				grid-gap: 1rem;
				position: relative;
				align-items: center;
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
    }`;static properties={mode:{state:!0}};createRenderRoot(){return this}constructor(){super(),this.mode="code"}connectedCallback(){super.connectedCallback(),this.shadowRoot===null&&this.constructor.styles.styleSheet&&!document.adoptedStyleSheets.includes(this.constructor.styles.styleSheet)&&document.adoptedStyleSheets.push(this.constructor.styles.styleSheet)}js_template(){return`import CERegistry from 'ce-autoloader';

const registry = new CERegistry({
	root: document.body,
	/* A central registry for all your components 😘 */
	catalog: {
		"three-cube": () => import("/src/components/three-cube.js"),
		"nord-button": "https://unpkg.com/@nord-ui/button@1.0.0/dist/nord-button.js",
	}
});

await registry.discover();`}html_template(){return`&lt;body>
		&lt;!-- Anywhere in my HTML page -->
		&lt;three-cube>&lt;/three-cube>
&lt;/body>`}onClick(){this.mode=this.mode==="code"?"preview":"code"}updated(){}render(){let e=this.mode==="code"?a`<pre><syntax-highlight language="html">${m(this.html_template())}</syntax-highlight></pre>`:a`<three-cube ce-outline-highlight></three-cube>`;return a`
			<div class="left card flex-y" >
        <h4 class="flex-x">
					Javascript
					<nord-button @click=${this.onClick} class="ml-auto" variant="primary" size="m" square>
					  <nord-icon name="interface-play" label="Play" size="m"></nord-icon>
					</nord-button>
				</h4>
        <pre><syntax-highlight language="js">${m(this.js_template())}</syntax-highlight></pre>
    	</div>

			<div class="preview right card flex-y" mode=${this.mode}>
				<h4 class="flex-x">Preview</h4>
				${e}
			</div>
		`}}customElements.define("hero-example",v);
