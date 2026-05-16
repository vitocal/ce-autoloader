import{i as t}from"./reactive-element-Cvb7jJT9.js";import"./lit-html-BQJ4ffLt.js";import"./lit-element-CUW7fmek.js";import{S as i}from"./slotted-element-U8kiabq5.js";import{s as l,u as s}from"./static-DtgXtClZ.js";class r extends i{static properties={shadow:{type:String,default:"light"}};static styles=t`
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
  `;constructor(){super(),this.constructor.styles.styleSheet&&this.shadowRoot===null&&!document.adoptedStyleSheets.includes(this.constructor.styles.styleSheet)&&document.adoptedStyleSheets.push(this.constructor.styles.styleSheet),this.example_slot=this.slottedChildren.filter(e=>e instanceof HTMLElement).find(e=>e.getAttribute("slot")==="example").innerHTML.trim().replace(/<!--.*?-->/g,"").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/slot="(.*?)"/g,"").replace(/ce-loading="(.*?)"/g,"").replace(/ce-defined="(.*?)"/g,"")}render(){return s`
      <div class="left window flex-y">
        <pre><syntax-highlight language="html">${l(this.example_slot)}</syntax-highlight></pre>
      </div>
      <div class="preview right card flex-y">
        <slot name="example"></slot>
      </div>
    `}}customElements.define("vi-example",r);export{r as ViExample};
//# sourceMappingURL=vi-example-Dacz9xER.js.map
