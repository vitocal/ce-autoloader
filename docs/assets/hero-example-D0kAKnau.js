import{css as p,LitElement as v,html as a,isServer as w}from"lit";import{f as x,u as h,s as $}from"./Icon-CpkMzTJW.js";import{b as r,s as c,e as k,l as z,n as _}from"./SlotController-Z6eG7LSZ-paOtwl-R.js";import{customElement as y,property as i}from"lit/decorators.js";import{ifDefined as l}from"lit/directives/if-defined.js";import{ref as S}from"lit/directives/ref.js";import"lit/directives/unsafe-html.js";class D{constructor(e,o){this.host=e,this.options=o,this._form=null,this.handleFormData=n=>{const{disabled:s,name:b}=this.host;if(s||!b)return;const f=this.options.value();f!=null&&n.formData.append(b,f)},e.addController(this)}hostConnected(){this.listen(this.host.form)}hostUpdated(){this.listen(this.host.form)}hostDisconnected(){this.cleanup()}listen(e){var o;this._form!==e&&(this.cleanup(),this._form=e,(o=this._form)===null||o===void 0||o.addEventListener("formdata",this.handleFormData))}cleanup(){var e;(e=this._form)===null||e===void 0||e.removeEventListener("formdata",this.handleFormData),this._form=null}}let g=class extends Event{constructor(e,o){super(e,{bubbles:!0,composed:!0,...o})}};const E=p`:host{all:initial;border:0!important;clip:rect(1px,1px,1px,1px)!important;block-size:1px!important;overflow:hidden!important;padding:0!important;position:absolute!important;inset-block-start:0;inline-size:1px!important}`;let u=class extends v{render(){return a`<slot></slot>`}};u.styles=E,u=r([y("nord-visually-hidden")],u);function C(t){class e extends t{constructor(){super(...arguments),this.labelSlot=new c(this,"label"),this.errorSlot=new c(this,"error"),this.hintSlot=new c(this,"hint"),this.formData=new D(this,{value:()=>this.formValue}),this.inputId="input",this.errorId="error",this.hintId="hint",this.label="",this.hideLabel=!1,this.required=!1,this.hideRequired=!1}get formValue(){return this.value}handleInput(n){n.stopPropagation();const s=n.target;this.value=s.value,this.dispatchEvent(new g("input"))}handleChange(n){n.stopPropagation(),this.dispatchEvent(new g("change"))}renderLabel(n){const s=a`<label for="${this.inputId}"><slot name="label">${this.label}</slot><span ?hidden="${!this.required||this.hideRequired}" aria-hidden="true" class="n-required">*</span> ${n}</label><div class="n-caption n-hint" id="${this.hintId}" ?hidden="${!this.hasHint}"><slot name="hint">${this.hint}</slot></div>`;return this.hideLabel?a`<nord-visually-hidden>${s}</nord-visually-hidden>`:a`<div class="n-label-container">${s}</div>`}renderError(){return a`<div class="n-caption n-error" id="${this.errorId}" role="alert" ?hidden="${!this.hasError}"><slot name="error">${this.error}</slot></div>`}getDescribedBy(){const{hasHint:n,hasError:s}=this;return n&&s?`${this.hintId} ${this.errorId}`:n?this.hintId:s?this.errorId:void 0}getInvalid(){return this.hasError?"true":void 0}get hasHint(){return!!this.hint||this.hintSlot.hasContent}get hasError(){return!!this.error||this.errorSlot.hasContent}}return r([i({reflect:!0})],e.prototype,"label",void 0),r([i({reflect:!0})],e.prototype,"hint",void 0),r([i({reflect:!0,type:Boolean,attribute:"hide-label"})],e.prototype,"hideLabel",void 0),r([i({reflect:!0})],e.prototype,"placeholder",void 0),r([i({reflect:!0})],e.prototype,"error",void 0),r([i({reflect:!0,type:Boolean})],e.prototype,"required",void 0),r([i({reflect:!0,type:Boolean,attribute:"hide-required"})],e.prototype,"hideRequired",void 0),e}function I(t){class e extends t{constructor(){super(...arguments),this.autocomplete="off"}}return r([i()],e.prototype,"autocomplete",void 0),e}function O(t){class e extends t{constructor(){super(...arguments),this.size="m"}}return r([i({reflect:!0})],e.prototype,"size",void 0),e}const q=p`:host{--_n-label-color:var(--n-label-color, var(--n-color-text))}.n-caption,::slotted(.n-caption){font-size:var(--n-font-size-s);line-height:var(--n-line-height-caption)}.n-label-container{margin-block-end:var(--n-space-s);display:inline-block}.n-label,::slotted(label),label{display:block!important;color:var(--_n-label-color);font-family:var(--n-font-family);font-size:var(--n-font-size-m);font-weight:var(--n-font-weight-heading)!important;line-height:var(--n-line-height-heading);margin:0!important}.n-hint{padding-block-start:var(--n-space-xs);color:var(--n-color-text-weaker)}:host([size="s"]) ::slotted(label),:host([size="s"]) :is(label,.n-label){font-size:var(--n-font-size-s)}.n-error{margin-block-start:var(--n-space-s);color:var(--n-color-text-error)}.n-required{color:var(--n-color-status-danger);margin-inline-start:var(--n-space-xs)}`;var L=Object.freeze({__proto__:null,default:'<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="m14.0864 12.0402 1.8138 1.8137-4.7724 4.7724c-.2573.2573-.5789.373-.9133.373-.33447 0-.65606-.1286-.91333-.373l-4.77238-4.7724 1.81377-1.8137 3.85904 3.859 3.8591-3.859zm-3.859-7.93687 3.859 3.85907 1.8138-1.81376-4.7724-4.77238c-.5017-.50168-1.31208-.50168-1.81376 0l-4.77238 4.77238 1.81376 1.81376 3.85908-3.85907z" fill="currentColor"/></svg>',tags:"nordicon small interface dropdown select arrow up down caret triangle chevron",title:"interface-dropdown-small"});const B=p`:host{--_n-select-inline-size:var(--n-select-inline-size, fit-content);--_n-select-block-size:var(--n-select-block-size, var(--n-space-xl))}.n-select-container{position:relative;inline-size:fit-content}:host([expand]){inline-size:100%}:host([expand]) .n-select-container{inline-size:100%}select{-webkit-appearance:none;appearance:none;position:absolute;font-size:var(--n-font-size-m);font-family:var(--n-font-family);color:var(--n-color-text);inline-size:100%;opacity:.0001;cursor:pointer;background:0 0;border:0;block-size:var(--_n-select-block-size);inset-block-end:0;inset-inline-start:0;z-index:var(--n-index-default)}option{color:initial}nord-button{--n-button-text-align:start}nord-button:not([expand]){--_n-button-inline-size:var(--_n-select-inline-size)}nord-icon{color:var(--n-color-icon)}.n-label-container:hover+.n-select-container nord-button,select:hover+nord-button{--_n-button-border-color:var(--n-button-border-color, var(--n-color-border-hover));--_n-button-background-color:var(--n-button-background-color, var(--n-color-button-hover))}select:focus+nord-button{--n-button-border-color:var(--n-color-accent);--n-button-box-shadow:0 0 0 1px var(--n-button-border-color)}:host([disabled]){cursor:auto;pointer-events:none}:host([disabled]) nord-button{--n-input-border-color:var(--n-color-active);--_n-button-color:var(--n-color-text-weakest);--_n-button-background-color:var(--n-color-active);--_n-button-opacity:1}:host([disabled]) nord-icon{color:var(--n-color-text-weakest)}::slotted(:not([slot])){display:none}select[aria-invalid=true]+nord-button{--n-button-border-color:var(--n-color-status-danger)}`;x.registerIcon(L);let d=class extends O(C(I(k(z(v))))){constructor(){super(...arguments),this.defaultSlot=new c(this),this.inputId="select",this.expand=!1}get formValue(){return this.value||void 0}firstUpdated(){this.setupOptionObserver()}connectedCallback(){super.connectedCallback(),this.hasUpdated&&!this.optionObserver&&this.setupOptionObserver()}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this.optionObserver)===null||t===void 0||t.disconnect(),this.optionObserver=void 0}setupOptionObserver(){this.optionObserver||(this.optionObserver=new MutationObserver((()=>this.requestUpdate())),this.optionObserver.observe(this,{subtree:!0,childList:!0,characterData:!0}))}render(){const t=this.options,e=this.getButtonText(t);return a`<slot></slot>${this.renderLabel()}<div class="n-select-container"><select ${S(this.focusableRef)} id="${this.inputId}" ?disabled="${this.disabled}" ?required="${this.required}" name="${l(this.name)}" @change="${this.handleChange}" @input="${this.handleInput}" aria-describedby="${l(this.getDescribedBy())}" aria-invalid="${l(this.getInvalid())}" autocomplete="${this.autocomplete}">${this.placeholder&&a`<option value="" disabled="disabled" ?selected="${!this.value}">${this.placeholder}</option>`} ${t.map((o=>this.renderOption(o)))}</select><nord-button size="${this.size}" ?disabled="${this.disabled}" ?expand="${this.expand}" type="button" inert><slot slot="start" name="icon"></slot>${e}<nord-icon slot="end" name="interface-dropdown-small"></nord-icon></nord-button></div>${this.renderError()}`}get options(){return w?[]:Array.from(this.querySelectorAll("option"))}getButtonText(t){const e=t.find((o=>o.value===this.value.toString()));return e?e.text:this.placeholder?this.placeholder:t[0]?t[0].text:""}renderOption(t){return a`<option value="${l(t.value)}" ?disabled="${t.disabled}" .selected="${t.value===this.value.toString()}">${t.text}</option>`}};d.styles=[_,q,B],r([i({reflect:!0,type:Boolean})],d.prototype,"expand",void 0),d=r([y("nord-select")],d);const m={"model-viewer":h`<model-viewer on="eager" camera-controls touch-action="pan-y" auto-rotate poster="https://modelviewer.dev/assets/poster-shishkebab.webp" tone-mapping="aces" src="https://modelviewer.dev/shared-assets/models/shishkebab.glb" shadow-intensity="1" alt="A 3D model of a shishkebab" ></model-viewer>`,"confetti-button":h`<confetti-button on="eager"><div class="card">🎉 Click me to throw confetti 🎉</div></confetti-button>`};class R extends v{static styles=p`
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
		`}onClick(){this.mode=this.mode==="code"?"preview":"code"}onDemoSelect(e){this.demo=e.target.value}render(){let e=h`<nord-empty-state>
			<div class="text-center" style="display: flex;flex-direction: column;align-items: center;">
				<h2>3D Model Demo</h2>
				<p>Click to load the interactive 3D model (Heavy!)</p>
				<nord-button variant="primary" @click=${()=>this.demo="model-viewer-loaded"}>Load 3D Model</nord-button>
			</div>
		</nord-empty-state>`;return this.demo==="model-viewer-loaded"?e=m["model-viewer"]:m[this.demo]&&(e=m[this.demo]),h`
			<div class="left window flex-y" >
        		<h4 class="flex-x">
					Demo

					<nord-select on="eager" name="demo" value="model-viewer" hide-label class="ml-auto" @change=${this.onDemoSelect} view-transition-name="hero-demo-select">
						<option value="model-viewer">model-viewer</option>
						<option value="confetti-button">confetti-button</option>
					</nord-select>
				</h4>
        		<pre><syntax-highlight language="js" on="eager" view-transition-name="hero-demo-code">${$(this.js_template())}</syntax-highlight></pre>
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
		`}}customElements.define("hero-example",R);export{R as default};
