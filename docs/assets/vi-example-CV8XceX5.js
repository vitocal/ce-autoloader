import{LitElement as r,css as s}from"lit";import{unsafeStatic as n,html as o}from"lit/static-html.js";import"./Button-BgOlomVX.js";import"./SlotController-Z6eG7LSZ-paOtwl-R.js";import"lit/decorators.js";import"lit/directives/if-defined.js";import"lit/directives/ref.js";class a extends r{constructor(){super(),this.slottedChildren=[...this.childNodes],this.namedSlotContent=this.querySelectorAll("[slot]")}updated(){[...this.querySelectorAll("slot:not([filled])")].forEach(t=>{t.getAttribute("name")?this._fillNamedSlot(t):this._fillAnonSlot(t)})}_fillNamedSlot(e){const t=[...this.namedSlotContent].find(l=>l.getAttribute("slot")===e.getAttribute("name"));t&&e.parentElement.replaceChild(t,e),e.setAttribute("filled","")}_fillAnonSlot(e){this.slottedChildren.forEach(t=>{t!==e&&e.parentElement.insertBefore(t,e)}),e.parentElement.removeChild(e),e.setAttribute("filled","")}createRenderRoot(){return this}}class h extends a{static properties={shadow:{type:String,default:"light"}};static styles=s`
    @layer components {
        vi-example {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 1rem;
            align-items: center;

            .left {
                grid-column: 1 / 2;
            }
            .right {
                grid-column: 2 / 3;
            }

            syntax-highlight {
                height: 100%; width: 100%;
                white-space: pre-wrap;
            }
        }

        @media (max-width: 60ch) {
			vi-example {
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
    `;constructor(){super(),this.constructor.styles.styleSheet&&this.shadowRoot===null&&!document.adoptedStyleSheets.includes(this.constructor.styles.styleSheet)&&document.adoptedStyleSheets.push(this.constructor.styles.styleSheet),this.example_slot=this.slottedChildren.filter((e=>e instanceof HTMLElement)).find(e=>e.getAttribute("slot")==="example").innerHTML.trim().replace(/<!--.*?-->/g,"").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/slot="(.*?)"/g,"").replace(/ce-loading="(.*?)"/g,"").replace(/ce-defined="(.*?)"/g,"")}render(){return o`
            <div class="left window flex-y">
                <h4>Example</h4>
                <pre><syntax-highlight language="html">${n(this.example_slot)}</syntax-highlight></pre>
            </div>
            <div class="preview right card flex-y">
                <slot name="example"></slot>
            </div>
        `}}customElements.define("vi-example",h);export{h as ViExample};
