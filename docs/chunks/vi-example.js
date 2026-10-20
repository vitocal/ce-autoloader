import{t as e}from"./utils.js";import{n as t,t as n}from"./static-html.js";import{t as r}from"./slotted-element.js";import{css as i}from"lit";function a(e,t=`    `){let n=0;return e.split(`
`).map(e=>e.trim()).filter(Boolean).map(e=>{e.startsWith(`</`)&&n--;let r=t.repeat(Math.max(0,n))+e,i=e.startsWith(`<`)&&!e.startsWith(`</`),a=e.includes(`</`)||e.endsWith(`/>`);return i&&!a&&n++,r}).join(`
`)}var o=class extends r{static properties={shadow:{type:String,default:`light`}};static styles=i`
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
  `;constructor(){super(),e(this.getRootNode(),this.constructor.styles.styleSheet),this.example_slot=this.slottedChildren.filter(e=>e instanceof HTMLElement).find(e=>e.getAttribute(`slot`)===`example`).innerHTML.trim().replace(/<!--.*?-->/g,``).replace(/slot="(.*?)"/g,``).replace(/ce="(.*?)"/g,``)}render(){let e=a(this.example_slot).replace(/</g,`&lt;`).replace(/>/g,`&gt;`);return t`
      <div class="left window flex-y">
        <pre><syntax-highlight language="html">${n(e)}</syntax-highlight></pre>
      </div>
      <div class="preview right card flex-y">
        <slot name="example"></slot>
      </div>
    `}};customElements.define(`vi-example`,o);export{o as ViExample,o as default};
//# sourceMappingURL=vi-example.js.map