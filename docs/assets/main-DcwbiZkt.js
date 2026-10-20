import{r as e}from"../chunks/utils.js";import{t}from"../chunks/src.js";import{t as n}from"../chunks/catalog.js";e();var r=[` ✓ registry resolves a URL loader (12ms)`,` ✓ visible paints every sibling of a tag (31ms)`,` ✓ the define queue retimes into the view transition (48ms)`,` ✓ the import map is read as the catalog (7ms)`,` 57 passing (2.4s)`],i=[`vite v8.1.3 building for production...`,`✓ 42 modules transformed.`,`error during build:`,`src/index.ts (118:21): Expected ';' but found '}'`,`  ELIFECYCLE  Command failed with exit code 1.`],a=340,o=[],s=e=>{e.timers.forEach(window.clearTimeout),e.timers=[]},c=(e,t)=>{s(e),e.el.setAttribute(`status`,t),e.el.setAttribute(`ended-at`,String(Date.now())),t===`error`&&e.exitCode!==void 0&&e.el.setAttribute(`exit-code`,String(e.exitCode))},l=e=>{s(e),e.lines=[],e.el.setAttribute(`lines`,`[]`),e.el.setAttribute(`status`,`running`),e.el.setAttribute(`started-at`,String(Date.now())),e.el.removeAttribute(`ended-at`),e.el.removeAttribute(`exit-code`),e.script.forEach((t,n)=>{e.timers.push(window.setTimeout(()=>{e.lines.push(t),e.el.setAttribute(`lines`,JSON.stringify(e.lines))},a*(n+1)))}),e.timers.push(window.setTimeout(()=>c(e,e.exitCode===void 0?`success`:`error`),a*(e.script.length+2)))};window.ceCommandStop=function(){let e=o.find(e=>e.el===this);e&&c(e,`cancelled`)};var u=document.getElementById(`hairline-pass`),d=document.getElementById(`hairline-fail`),f=document.getElementById(`hairline-morph`);u&&d&&(o.push({el:u,script:r,lines:[],timers:[]}),o.push({el:d,script:i,lines:[],exitCode:1,timers:[]})),document.getElementById(`hairline-replay`)?.addEventListener(`click`,()=>o.forEach(l));var p=[`Save`,`Saving`,`Saved`,`Save`],m=0,h=0,g=e=>{window.clearInterval(h),h=0,e&&f&&(h=window.setInterval(()=>f.setAttribute(`text`,p[++m%p.length]),1800))},_=document.getElementById(`hairline-ui`),v=!1;_&&`IntersectionObserver`in window?new IntersectionObserver(e=>{let t=e.some(e=>e.isIntersecting);g(t),t&&!v&&(v=!0,o.forEach(l))},{rootMargin:`0px 0px -15% 0px`}).observe(_):(g(!0),o.forEach(l));var y=class extends HTMLElement{constructor(){super(),this.error=``,this.stack=``}connectedCallback(){this.shadowRoot||this.attachShadow({mode:`open`}),this.render()}render(){this.shadowRoot&&(this.shadowRoot.innerHTML=`<style>
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
      </style>
      <details>
        <summary>${this.error.split(` `)[0]}</summary>
        ${this.stack?`<pre>${this.stack}</pre>`:``}
      </details>`)}};customElements.define(`error-fallback`,y),globalThis.CE_DEMO_DELAY=1200,document.addEventListener(`DOMContentLoaded`,()=>{globalThis.registry=new t({catalog:n,fallback:y,deferDefine:!1,transition:!1,hooks:{error:e=>{console.error(e.error.message),performance.mark(`error`)}}})});
//# sourceMappingURL=main-DcwbiZkt.js.map