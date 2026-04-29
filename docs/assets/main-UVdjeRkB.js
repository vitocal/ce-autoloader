const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/hero-example-Dl4fJjHX.js","assets/SlotController-Z6eG7LSZ-paOtwl-R.js","assets/vi-example-CYs-hR0H.js","assets/slotted-element-e_Tah3RU.js","assets/my-component-VYS7UlqI.js","assets/confetti.module-oQXWb4Lk.js","assets/confetti-button-Dv63vFTJ.js","assets/qrcode-zEs-PjNP.js","assets/_commonjsHelpers-CE1G-McA.js","assets/react-example-CipS6kKK.js","assets/react-to-web-component-KwXRUZS_.js","assets/react-counter-DZ050zm6.js"])))=>i.map(i=>d[i]);
import{_ as t,C as c}from"./preload-helper-BfVdv7YT.js";class n extends HTMLElement{constructor(){super(),this.error="",this.stack="",this.error=this.getAttribute("error")||"",this.stack=this.getAttribute("stack")||""}static get observedAttributes(){return["error","stack"]}attributeChangedCallback(e,i,o){e==="error"?(this.error=o,this.render()):e==="stack"&&(this.stack=o,this.render())}connectedCallback(){this.attachShadow({mode:"open"}),this.render()}render(){this.shadowRoot&&(this.shadowRoot.innerHTML=`<style>
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
          align-items: center;
          gap: 1rem;
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
        <details style="flex-grow: 1;">
          <summary>${this.error}</summary>
          ${this.stack?`<pre>${this.stack}</pre>`:""}
        </details>
        <button class="retry-button" id="retry">Retry</button>
      </div>`,this.shadowRoot.getElementById("retry")?.addEventListener("click",()=>this.handleRetry()))}handleRetry(){const e=this.parentElement;e&&globalThis.registry&&globalThis.registry.retry(e)}}customElements.define("error-fallback",n);const _=r=>r.split("-").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join("");let m={"hero-example":()=>t(()=>import("./hero-example-Dl4fJjHX.js"),__vite__mapDeps([0,1])),"vi-example":()=>t(()=>import("./vi-example-CYs-hR0H.js"),__vite__mapDeps([2,3])),"my-component":async()=>(await new Promise(r=>setTimeout(r,1e3)),t(()=>import("./my-component-VYS7UlqI.js"),__vite__mapDeps([4,3,5]))),"confetti-button":()=>t(()=>import("./confetti-button-Dv63vFTJ.js"),__vite__mapDeps([6,5])),"three-cube":()=>t(()=>import("./three-cube-BZnZ1Ca_.js"),[]),"gl-globe":()=>t(()=>import("./gl-globe-BHBINrHR.js"),[]),"observable-plot-wrapper":()=>t(()=>import("./observable-plot-wrapper-BGmSK2ei.js"),[]),"performance-metrics-plot":()=>t(()=>import("./performance-metrics-plot-BdEpM-uY.js"),[]),"pix-qrcode":()=>t(()=>import("./qrcode-zEs-PjNP.js"),__vite__mapDeps([7,8])),"react-example":()=>t(()=>import("./react-example-CipS6kKK.js"),__vite__mapDeps([9,10,8])),"react-counter":()=>t(()=>import("./react-counter-DZ050zm6.js"),__vite__mapDeps([11,10,8])),"vue-counter":()=>t(()=>import("./vue-counter-C65rWPV8.js"),[]),"svelte-counter":()=>t(()=>import("./svelte-counter-CB71A_4P.js"),[]),"vi-error":(r,e)=>{throw new Error("This component failed to load")},"vi-notloaded":async(r,e)=>{let i=Number(e.timeout||9e5);await new Promise(o=>setTimeout(o,i))},"vi-defined":()=>t(()=>import("./vi-defined-Bvd24Ixg.js"),[]),"playground-ide":"https://cdn.jsdelivr.net/npm/playground-elements@0.18.1/+esm","json-viewer":"https://esm.sh/@alenaksu/json-viewer","wc-markdown":"https://cdn.skypack.dev/@vanillawc/wc-markdown","fireworks-js":()=>t(()=>import("https://esm.sh/@fireworks-js/web"),[]),"model-viewer":async()=>{await t(()=>import("https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"),[])},"syntax-highlight":async()=>t(()=>import("https://cdn.jsdelivr.net/npm/syntax-highlight-element@1/+esm"),[]),"nord-*":async r=>{const[,e,i]=r.match(/^([a-z]+)-(.*)/),o=["lit"].join(","),a=await t(()=>import(`https://esm.sh/@nordhealth/components/lib/${_(i)}.js?external=${o}`),[]);return customElements.get(r)||customElements.define(r,a.default),a}};globalThis.registry=new c({catalog:m,root:document.body,live:!0,fallback:n,defaultDirective:"visible",transition:!0});async function d(r,e,{parent:i=document.head,position:o="beforeend"}={}){if(document.querySelector(`style[data-src="${r}"]`))return;const a=await fetch(r).then(l=>l.text()),s=document.createElement("style");return s.setAttribute("data-layer",e),s.setAttribute("data-src",r),s.textContent=`@layer ${e} {${a}}`,i.insertAdjacentElement(o,s),s}d("https://nordcdn.net/ds/css/4.2.0/nord.min.css","ds");d("https://cdn.jsdelivr.net/npm/syntax-highlight-element@1/dist/themes/prettylights.min.css","scoped");
