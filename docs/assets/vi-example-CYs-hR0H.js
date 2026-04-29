import{css as t}from"lit";import{S as l}from"./slotted-element-e_Tah3RU.js";import{unsafeStatic as i,html as s}from"lit/static-html.js";class r extends l{static properties={shadow:{type:String,default:"light"}};static styles=t`
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
        <pre><syntax-highlight language="html">${i(this.example_slot)}</syntax-highlight></pre>
      </div>
      <div class="preview right card flex-y">
        <slot name="example"></slot>
      </div>
    `}}customElements.define("vi-example",r);export{r as ViExample};
