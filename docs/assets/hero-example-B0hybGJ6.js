import{css as c,LitElement as m,html as l,isServer as k}from"lit";import{html as v,unsafeStatic as _}from"lit/static-html.js";import{n as $,b as n,t as x,s as u,e as E,l as I}from"./SlotController-Z6eG7LSZ-paOtwl-R.js";import{property as s,state as C,customElement as y}from"lit/decorators.js";import{ifDefined as d}from"lit/directives/if-defined.js";import{ref as S}from"lit/directives/ref.js";import"./Button-BgOlomVX.js";import{unsafeHTML as D}from"lit/directives/unsafe-html.js";const O=t=>fetch(`https://nordcdn.net/ds/icons/3.11.0/assets/${t}.svg`).then((e=>{if(!e.ok)throw new TypeError(`NORD: unknown icon: '${t}'`);return e.text()}));let q=class{constructor(){this.cache=new Map,this.resolver=O}resolve(e,i){let o=this.cache.get(e);typeof o!="string"?(o||(o=this.resolver(e).catch((()=>"")).then((r=>(this.cache.set(e,r),r))),this.cache.set(e,o)),o.then(i)):i(o)}registerIcon(e,i){let o,r;if(typeof e=="string"?(o=e,r=i):(o=e.title,r=e.default),!o)throw new Error("name is required when registering an icon");if(!r)throw new Error("icon must not be empty");this.cache.set(o,r)}clear(){this.cache.clear()}},L=class{constructor(e,i,o,r){this.host=e,this.key=i,this.cb=o,this.lifecycle=r,e.addController(this)}hostUpdate(){this.lifecycle==="update"&&this.handle()}hostUpdated(){this.lifecycle==="updated"&&this.handle()}handle(){const{key:e,_value:i,host:o}=this,r=o[e];i!==r&&(this._value=r,this.cb.call(o,i,r,e))}};function B(t,e="update"){return function(i,o){i.constructor.addInitializer((r=>{const h=r[o];r.addController(new L(r,t,h,e))}))}}const R=c`:host{--_n-icon-size:var(--n-icon-size, var(--n-size-icon-m));display:inline-block;block-size:var(--_n-icon-size);inline-size:var(--_n-icon-size);min-inline-size:var(--_n-icon-size)}:host([size=xxs]){--_n-icon-size:var(--n-size-icon-xxs)}:host([size=xs]){--_n-icon-size:var(--n-size-icon-xs)}:host([size="s"]){--_n-icon-size:var(--n-size-icon-s)}:host([size="l"]){--_n-icon-size:var(--n-size-icon-l)}:host([size=xl]){--_n-icon-size:var(--n-size-icon-xl)}:host([size=xxl]){--_n-icon-size:var(--n-size-icon-xxl)}.n-icon{display:block}svg{display:block}`;var g;let a=g=class extends m{constructor(){super(...arguments),this.name="",this.svg=""}static registerResolver(t){this.manager.resolver=t}static registerIcon(t,e){return this.manager.registerIcon(t,e)}render(){return l`<div role="${x(this.label,"img")}" style="${x(this.color,`color:${this.color}`)}" aria-label="${d(this.label)}"><slot aria-hidden="true"></slot><div aria-hidden="true">${D(this.svg)}</div></div>`}handleNameChange(){this.name?g.manager.resolve(this.name,(t=>{this.svg=t})):this.svg=""}};a.styles=[$,R],a.manager=new q,n([s({reflect:!0})],a.prototype,"name",void 0),n([s({reflect:!0})],a.prototype,"size",void 0),n([s({reflect:!0})],a.prototype,"color",void 0),n([s({reflect:!0})],a.prototype,"label",void 0),n([C()],a.prototype,"svg",void 0),n([B("name")],a.prototype,"handleNameChange",null),a=g=n([y("nord-icon")],a);var H=a;class U{constructor(e,i){this.host=e,this.options=i,this._form=null,this.handleFormData=o=>{const{disabled:r,name:h}=this.host;if(r||!h)return;const w=this.options.value();w!=null&&o.formData.append(h,w)},e.addController(this)}hostConnected(){this.listen(this.host.form)}hostUpdated(){this.listen(this.host.form)}hostDisconnected(){this.cleanup()}listen(e){var i;this._form!==e&&(this.cleanup(),this._form=e,(i=this._form)===null||i===void 0||i.addEventListener("formdata",this.handleFormData))}cleanup(){var e;(e=this._form)===null||e===void 0||e.removeEventListener("formdata",this.handleFormData),this._form=null}}let z=class extends Event{constructor(e,i){super(e,{bubbles:!0,composed:!0,...i})}};const M=c`:host{all:initial;border:0!important;clip:rect(1px,1px,1px,1px)!important;block-size:1px!important;overflow:hidden!important;padding:0!important;position:absolute!important;inset-block-start:0;inline-size:1px!important}`;let b=class extends m{render(){return l`<slot></slot>`}};b.styles=M,b=n([y("nord-visually-hidden")],b);function j(t){class e extends t{constructor(){super(...arguments),this.labelSlot=new u(this,"label"),this.errorSlot=new u(this,"error"),this.hintSlot=new u(this,"hint"),this.formData=new U(this,{value:()=>this.formValue}),this.inputId="input",this.errorId="error",this.hintId="hint",this.label="",this.hideLabel=!1,this.required=!1,this.hideRequired=!1}get formValue(){return this.value}handleInput(o){o.stopPropagation();const r=o.target;this.value=r.value,this.dispatchEvent(new z("input"))}handleChange(o){o.stopPropagation(),this.dispatchEvent(new z("change"))}renderLabel(o){const r=l`<label for="${this.inputId}"><slot name="label">${this.label}</slot><span ?hidden="${!this.required||this.hideRequired}" aria-hidden="true" class="n-required">*</span> ${o}</label><div class="n-caption n-hint" id="${this.hintId}" ?hidden="${!this.hasHint}"><slot name="hint">${this.hint}</slot></div>`;return this.hideLabel?l`<nord-visually-hidden>${r}</nord-visually-hidden>`:l`<div class="n-label-container">${r}</div>`}renderError(){return l`<div class="n-caption n-error" id="${this.errorId}" role="alert" ?hidden="${!this.hasError}"><slot name="error">${this.error}</slot></div>`}getDescribedBy(){const{hasHint:o,hasError:r}=this;return o&&r?`${this.hintId} ${this.errorId}`:o?this.hintId:r?this.errorId:void 0}getInvalid(){return this.hasError?"true":void 0}get hasHint(){return!!this.hint||this.hintSlot.hasContent}get hasError(){return!!this.error||this.errorSlot.hasContent}}return n([s({reflect:!0})],e.prototype,"label",void 0),n([s({reflect:!0})],e.prototype,"hint",void 0),n([s({reflect:!0,type:Boolean,attribute:"hide-label"})],e.prototype,"hideLabel",void 0),n([s({reflect:!0})],e.prototype,"placeholder",void 0),n([s({reflect:!0})],e.prototype,"error",void 0),n([s({reflect:!0,type:Boolean})],e.prototype,"required",void 0),n([s({reflect:!0,type:Boolean,attribute:"hide-required"})],e.prototype,"hideRequired",void 0),e}function T(t){class e extends t{constructor(){super(...arguments),this.autocomplete="off"}}return n([s()],e.prototype,"autocomplete",void 0),e}function A(t){class e extends t{constructor(){super(...arguments),this.size="m"}}return n([s({reflect:!0})],e.prototype,"size",void 0),e}const F=c`:host{--_n-label-color:var(--n-label-color, var(--n-color-text))}.n-caption,::slotted(.n-caption){font-size:var(--n-font-size-s);line-height:var(--n-line-height-caption)}.n-label-container{margin-block-end:var(--n-space-s);display:inline-block}.n-label,::slotted(label),label{display:block!important;color:var(--_n-label-color);font-family:var(--n-font-family);font-size:var(--n-font-size-m);font-weight:var(--n-font-weight-heading)!important;line-height:var(--n-line-height-heading);margin:0!important}.n-hint{padding-block-start:var(--n-space-xs);color:var(--n-color-text-weaker)}:host([size="s"]) ::slotted(label),:host([size="s"]) :is(label,.n-label){font-size:var(--n-font-size-s)}.n-error{margin-block-start:var(--n-space-s);color:var(--n-color-text-error)}.n-required{color:var(--n-color-status-danger);margin-inline-start:var(--n-space-xs)}`;var N=Object.freeze({__proto__:null,default:'<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="m14.0864 12.0402 1.8138 1.8137-4.7724 4.7724c-.2573.2573-.5789.373-.9133.373-.33447 0-.65606-.1286-.91333-.373l-4.77238-4.7724 1.81377-1.8137 3.85904 3.859 3.8591-3.859zm-3.859-7.93687 3.859 3.85907 1.8138-1.81376-4.7724-4.77238c-.5017-.50168-1.31208-.50168-1.81376 0l-4.77238 4.77238 1.81376 1.81376 3.85908-3.85907z" fill="currentColor"/></svg>',tags:"nordicon small interface dropdown select arrow up down caret triangle chevron",title:"interface-dropdown-small"});const V=c`:host{--_n-select-inline-size:var(--n-select-inline-size, fit-content);--_n-select-block-size:var(--n-select-block-size, var(--n-space-xl))}.n-select-container{position:relative;inline-size:fit-content}:host([expand]){inline-size:100%}:host([expand]) .n-select-container{inline-size:100%}select{-webkit-appearance:none;appearance:none;position:absolute;font-size:var(--n-font-size-m);font-family:var(--n-font-family);color:var(--n-color-text);inline-size:100%;opacity:.0001;cursor:pointer;background:0 0;border:0;block-size:var(--_n-select-block-size);inset-block-end:0;inset-inline-start:0;z-index:var(--n-index-default)}option{color:initial}nord-button{--n-button-text-align:start}nord-button:not([expand]){--_n-button-inline-size:var(--_n-select-inline-size)}nord-icon{color:var(--n-color-icon)}.n-label-container:hover+.n-select-container nord-button,select:hover+nord-button{--_n-button-border-color:var(--n-button-border-color, var(--n-color-border-hover));--_n-button-background-color:var(--n-button-background-color, var(--n-color-button-hover))}select:focus+nord-button{--n-button-border-color:var(--n-color-accent);--n-button-box-shadow:0 0 0 1px var(--n-button-border-color)}:host([disabled]){cursor:auto;pointer-events:none}:host([disabled]) nord-button{--n-input-border-color:var(--n-color-active);--_n-button-color:var(--n-color-text-weakest);--_n-button-background-color:var(--n-color-active);--_n-button-opacity:1}:host([disabled]) nord-icon{color:var(--n-color-text-weakest)}::slotted(:not([slot])){display:none}select[aria-invalid=true]+nord-button{--n-button-border-color:var(--n-color-status-danger)}`;H.registerIcon(N);let p=class extends A(j(T(E(I(m))))){constructor(){super(...arguments),this.defaultSlot=new u(this),this.inputId="select",this.expand=!1}get formValue(){return this.value||void 0}firstUpdated(){this.setupOptionObserver()}connectedCallback(){super.connectedCallback(),this.hasUpdated&&!this.optionObserver&&this.setupOptionObserver()}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this.optionObserver)===null||t===void 0||t.disconnect(),this.optionObserver=void 0}setupOptionObserver(){this.optionObserver||(this.optionObserver=new MutationObserver((()=>this.requestUpdate())),this.optionObserver.observe(this,{subtree:!0,childList:!0,characterData:!0}))}render(){const t=this.options,e=this.getButtonText(t);return l`<slot></slot>${this.renderLabel()}<div class="n-select-container"><select ${S(this.focusableRef)} id="${this.inputId}" ?disabled="${this.disabled}" ?required="${this.required}" name="${d(this.name)}" @change="${this.handleChange}" @input="${this.handleInput}" aria-describedby="${d(this.getDescribedBy())}" aria-invalid="${d(this.getInvalid())}" autocomplete="${this.autocomplete}">${this.placeholder&&l`<option value="" disabled="disabled" ?selected="${!this.value}">${this.placeholder}</option>`} ${t.map((i=>this.renderOption(i)))}</select><nord-button size="${this.size}" ?disabled="${this.disabled}" ?expand="${this.expand}" type="button" inert><slot slot="start" name="icon"></slot>${e}<nord-icon slot="end" name="interface-dropdown-small"></nord-icon></nord-button></div>${this.renderError()}`}get options(){return k?[]:Array.from(this.querySelectorAll("option"))}getButtonText(t){const e=t.find((i=>i.value===this.value.toString()));return e?e.text:this.placeholder?this.placeholder:t[0]?t[0].text:""}renderOption(t){return l`<option value="${d(t.value)}" ?disabled="${t.disabled}" .selected="${t.value===this.value.toString()}">${t.text}</option>`}};p.styles=[$,F,V],n([s({reflect:!0,type:Boolean})],p.prototype,"expand",void 0),p=n([y("nord-select")],p);const f={"model-viewer":v`<model-viewer on="eager" camera-controls touch-action="pan-y" auto-rotate poster="https://modelviewer.dev/assets/poster-shishkebab.webp" tone-mapping="aces" src="https://modelviewer.dev/shared-assets/models/shishkebab.glb" shadow-intensity="1" alt="A 3D model of a shishkebab" ></model-viewer>`,"confetti-button":v`<confetti-button on="eager"><div class="card">🎉 Click me to throw confetti 🎉</div></confetti-button>`};class P extends m{static styles=c`
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
				animation: 1000ms ease both fade-in;
				animation-delay: var(--spring-duration);
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

		@media (max-width: 100ch) {
			hero-example {
				grid-template-columns: 1fr !important;

				.left,.right {
					max-width: 100%;
					grid-column: 1 / -1 !important;
				}
				.right {
					height: auto;
					min-height: 50vh;
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
	}`;static properties={demo:{state:!0}};createRenderRoot(){return this}constructor(){super(),this.demo="initial",this.constructor.styles.styleSheet&&!document.adoptedStyleSheets.includes(this.constructor.styles.styleSheet)&&document.adoptedStyleSheets.push(this.constructor.styles.styleSheet)}js_template(){return`import CERegistry from 'ce-autoloader';

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
		`}onClick(){this.mode=this.mode==="code"?"preview":"code"}onDemoSelect(e){this.demo=e.target.value}render(){let e=v`<nord-empty-state>
			<div class="text-center" style="display: flex;flex-direction: column;align-items: center;">
				<h2>3D Model Demo</h2>
				<p>Click to load the interactive 3D model (Heavy!)</p>
				<nord-button variant="primary" @click=${()=>this.demo="model-viewer-loaded"}>Load 3D Model</nord-button>
			</div>
		</nord-empty-state>`;return this.demo==="model-viewer-loaded"?e=f["model-viewer"]:f[this.demo]&&(e=f[this.demo]),v`
			<div class="left window flex-y" >
        		<h4 class="flex-x">
					Demo

					<nord-select name="demo" value="model-viewer" hide-label class="ml-auto" @change=${this.onDemoSelect} view-transition-name="hero-demo-select">
						<option value="model-viewer">model-viewer</option>
						<option value="confetti-button">confetti-button</option>
					</nord-select>
				</h4>
        		<pre><syntax-highlight language="js" view-transition-name="hero-demo-code">${_(this.js_template())}</syntax-highlight></pre>
    		</div>

			<div class="right preview flex-y" mode=${this.mode}>
				${e}
			</div>
		`}}customElements.define("hero-example",P);export{P as default};
