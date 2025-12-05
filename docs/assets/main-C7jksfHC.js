import{_ as l,C as v}from"./index-sJ7gVsGJ.js";import{x as w,i as x,a as k}from"./lit-Dijj46i9.js";class y extends HTMLElement{constructor(){super(),this.error="",this.stack="",this.error=this.getAttribute("error")||"",this.stack=this.getAttribute("stack")||""}static get observedAttributes(){return["error","stack"]}attributeChangedCallback(t,r,s){t==="error"?(this.error=s,this.render()):t==="stack"&&(this.stack=s,this.render())}connectedCallback(){this.render()}render(){this.innerHTML=`
      <style>
        :host {
          display: block;
          background-color: red;
          font-family: monospace;
          color: white;
          padding: 8px 4px;
        }
      </style>
      <details>
        <summary>${this.error}</summary>
        ${this.stack?`<pre>${this.stack}</pre>`:""}
      </details>
    `}}customElements.define("error-fallback",y);const f=Symbol.for(""),$=e=>{if(e?.r===f)return e?._$litStatic$},p=e=>({_$litStatic$:e,r:f}),g=new Map,E=e=>(t,...r)=>{const s=r.length;let i,o;const a=[],h=[];let c,n=0,u=!1;for(;n<s;){for(c=t[n];n<s&&(o=r[n],(i=$(o))!==void 0);)c+=i+t[++n],u=!0;n!==s&&h.push(o),a.push(c),n++}if(n===s&&a.push(t[s]),u){const m=a.join("$$lit$$");(t=g.get(m))===void 0&&(a.raw=a,g.set(m,t=a)),r=h}return e(t,...r)},d=E(w);class _ extends x{static styles=k`
    @layer component {
		hero-example {
			display: grid;
			grid-template-columns: 2fr 1fr;
			grid-gap: 1rem;
			position: relative;
			align-items: center;

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
		}
		syntax-highlight {
			height: 100%; width: 100%;
  			white-space: pre-wrap;
		}
		three-cube {
			width: 100%;
			height: 160px;


			&:not(:defined) {
				width: 100%;
				height: 160px;

				background-color: var(--color-bg-dark);
			}
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
    }`;static properties={mode:{state:!0}};createRenderRoot(){return this}constructor(){super(),this.mode="code",this.constructor.styles.styleSheet&&!document.adoptedStyleSheets.includes(this.constructor.styles.styleSheet)&&document.adoptedStyleSheets.push(this.constructor.styles.styleSheet)}js_template(){return`import CERegistry from 'ce-autoloader';

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
&lt;/body>`}onClick(){this.mode=this.mode==="code"?"preview":"code"}updated(){}render(){let t=this.mode==="code"?d`<pre><syntax-highlight language="html">${p(this.html_template())}</syntax-highlight></pre>`:d`<three-cube ce-outline-highlight></three-cube>`;return d`
			<div class="left card flex-y" >
        		<h4 class="flex-x">
					Javascript
					<nord-button @click=${this.onClick} class="ml-auto" variant="primary" size="m" square>
					  <nord-icon name="interface-play" label="Play" size="m"></nord-icon>
					</nord-button>
				</h4>
        		<pre><syntax-highlight language="js">${p(this.js_template())}</syntax-highlight></pre>
    		</div>

			<div class="preview right card flex-y" mode=${this.mode}>
				<h4 class="flex-x">Preview</h4>
				${t}
			</div>
		`}}customElements.define("hero-example",_);async function b(e,t,{parent:r=document.head,position:s="beforeend"}={}){const i=await fetch(e).then(a=>a.text()),o=document.createElement("style");return o.setAttribute("data-layer",t),o.textContent=`@layer ${t} {${i}}`,r.insertAdjacentElement(s,o),o}const A=e=>e.split("-").map(t=>t.charAt(0).toUpperCase()+t.slice(1)).join(""),C={"syntax-highlight":"https://cdn.jsdelivr.net/npm/syntax-highlight-element@1/+esm","playground-ide":"https://cdn.jsdelivr.net/npm/playground-elements@0.18.1/+esm","json-viewer":"https://esm.sh/@alenaksu/json-viewer","wc-markdown":"https://cdn.skypack.dev/@vanillawc/wc-markdown","confetti-button":()=>l(()=>import("./confetti-button-Bw2NmyCW.js"),[]),"three-cube":()=>l(()=>import("./three-cube-8HBqYzGh.js"),[]),"nord-*":async e=>{const[,t,r]=e.match(/^([a-z]+)-(.*)/),s=await l(()=>import(`https://esm.sh/@nordhealth/components/lib/${A(r)}.js`),[]);return customElements.get(e)||customElements.define(e,s.default),s}};class j extends v{async beforeLoad({name:t,el:r,asset:s},i){performance.mark(`load:${t}:start`),r.setAttribute("ce-loading","true"),await i({name:t,el:r,asset:s})}async afterLoad({name:t,el:r,asset:s},i){performance.mark(`load:${t}:end`),performance.measure(`load:${t}`,`load:${t}:start`,`load:${t}:end`),performance.mark(`define:${t}:start`),r.removeAttribute("ce-loading"),r.setAttribute("ce-defined",""),r.getAttribute("view-transition")&&(r.style.viewTransitionName="match-element",r.style.viewTransitionClass=r.tagName.toLowerCase()),this.batches.push(async()=>await i({name:t,asset:s}))}}globalThis.registry=new j({catalog:C,root:document.body,live:!0,fallback:y,defaultDirective:"visible"});console.log("Discovered on first run:",await registry.discover());b("shared.css","ds");b("https://nordcdn.net/ds/css/4.2.0/nord.min.css","ds");document.getElementById("confetti").addEventListener("click",async()=>{if(!customElements.get("confetti-button")){let e=await registry.upgrade("manual");console.log("result",e)}});
