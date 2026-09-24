import{n as e,t}from"./static-html.js";import{t as n}from"./slotted-element.js";import{css as r}from"lit";function i(e,t=`    `){let n=0;return e.split(`
`).map(e=>e.trim()).filter(Boolean).map(e=>{e.startsWith(`</`)&&n--;let r=t.repeat(Math.max(0,n))+e,i=e.startsWith(`<`)&&!e.startsWith(`</`),a=e.includes(`</`)||e.endsWith(`/>`);return i&&!a&&n++,r}).join(`
`)}var a=class extends n{static properties={shadow:{type:String,default:`light`}};static styles=r`
    @layer components {
      vi-example {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 1rem;
        align-items: stretch;

        .left {
          grid-column: 1 / 2;
        }
        .right {
          grid-column: 2 / 3;
        }

        syntax-highlight {
          height: 100%;
          width: 100%;
          white-space: pre-wrap;
        }

        &.equal-size {
          grid-template-columns: 1fr minmax(50%, 1fr);
          syntax-highlight {
            white-space: normal !important;
          }
        }
      }

      @media (max-width: 100ch) {
        vi-example {
          display: flex;
          flex-direction: column;
          width: 100%;
          flex-wrap: wrap;
          align-items: stretch;

          .left,
          .right {
            max-width: 100%;
          }
        }
      }
    }
  `;constructor(){super(),this.constructor.styles.styleSheet&&this.shadowRoot===null&&!document.adoptedStyleSheets.includes(this.constructor.styles.styleSheet)&&document.adoptedStyleSheets.push(this.constructor.styles.styleSheet),this.example_slot=this.slottedChildren.filter(e=>e instanceof HTMLElement).find(e=>e.getAttribute(`slot`)===`example`).innerHTML.trim().replace(/<!--.*?-->/g,``).replace(/slot="(.*?)"/g,``).replace(/ce="(.*?)"/g,``),console.log(this.example_slot)}render(){let n=i(this.example_slot).replace(/</g,`&lt;`).replace(/>/g,`&gt;`);return console.log(`vi-example rerender`),t`
      <div class="left window flex-y">
        <pre><syntax-highlight language="html">${e(n)}</syntax-highlight></pre>
      </div>
      <div class="preview right card flex-y">
        <slot name="example"></slot>
      </div>
    `}};customElements.define(`vi-example`,a);export{a as ViExample};
//# sourceMappingURL=vi-example.js.map