import{C as o}from"./index-CJeFPdEl.js";import{c as a}from"./utils-3a75qNKC.js";class e extends HTMLElement{constructor(){super(),this.error="",this.stack="",this.error=this.getAttribute("error")||"",this.stack=this.getAttribute("stack")||""}static get observedAttributes(){return["error","stack"]}attributeChangedCallback(r,i,t){r==="error"?(this.error=t,this.render()):r==="stack"&&(this.stack=t,this.render())}connectedCallback(){this.attachShadow({mode:"open"}),this.render()}render(){this.shadowRoot&&(this.shadowRoot.innerHTML=`<style>
        :host {
          display: block;
          background-color: #ff4d4d;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          color: white;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          margin: 1rem 0;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          width: 100%;
          overflow: hidden;
        }
        details {
          width: 100%;
        }
        summary {
          cursor: pointer;
          font-weight: bold;
          user-select: none;
        }
        pre {
          background: rgba(0,0,0,0.2);
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          overflow-x: auto;
          margin-top: 0.5rem;
          white-space: pre-wrap;
        }
        .retry-button {
          background: white;
          color: #ff4d4d;
          border: none;
          padding: 0.4rem 1rem;
          border-radius: 20px;
          font-weight: bold;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s ease;
          flex-shrink: 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          font-family: inherit;
        }
        .retry-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          background: #fff5f5;
        }
        .retry-button:active {
          transform: translateY(0);
        }
      </style>
      <div class="header">
        <details>
          <summary>${this.error}</summary>
          ${this.stack?`<pre>${this.stack}</pre>`:""}
        </details>
        <button class="retry-button" id="retry">Retry</button>
      </div>`,this.shadowRoot.getElementById("retry")?.addEventListener("click",()=>this.handleRetry()))}handleRetry(){const r=this.parentElement;r&&globalThis.registry&&globalThis.registry.retry(r)}}customElements.define("error-fallback",e);globalThis.registry=new o({catalog:a,root:document.body,live:!0,fallback:e,defaultDirective:"visible",transition:!0});
