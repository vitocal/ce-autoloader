import{t as e}from"./src.js";import{t}from"./catalog.js";var n=class extends HTMLElement{error=``;stack=``;static get observedAttributes(){return[`error`,`stack`]}constructor(){super(),this.error=this.getAttribute(`error`)||``,this.stack=this.getAttribute(`stack`)||``}attributeChangedCallback(e,t,n){e===`error`?(this.error=n,this.render()):e===`stack`&&(this.stack=n,this.render())}connectedCallback(){this.attachShadow({mode:`open`}),this.render()}render(){this.shadowRoot&&(this.shadowRoot.innerHTML=`<style>
        :host {
          display: block;
          background-color: #ff4d4d;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          color: white;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          margin: 1rem 0;
          overflow: hidden;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          width: 100%;
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
          ${this.stack?`<pre>${this.stack}</pre>`:``}
        </details>
        <button class="retry-button" id="retry">Retry</button>
      </div>`,this.shadowRoot.getElementById(`retry`)?.addEventListener(`click`,()=>this.handleRetry()))}handleRetry(){let e=this.parentElement;e&&globalThis.registry&&globalThis.registry.retry(e)}};customElements.define(`error-fallback`,n),globalThis.registry=new e({catalog:t,root:document.body,live:!0,fallback:n,defaultDirective:`visible`,transition:!0,intersectionOptions:{rootMargin:`0px 0px 100% 0px`}});
//# sourceMappingURL=pages.js.map