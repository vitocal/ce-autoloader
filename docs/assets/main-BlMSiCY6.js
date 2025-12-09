const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/hero-example-SyCdIdsw.js","assets/lit-html-Dbe4NQd5.js"])))=>i.map(i=>d[i]);
import{_ as o,C as l}from"./preload-helper-G58Zr4m6.js";class i extends HTMLElement{constructor(){super(),this.error="",this.stack="",this.error=this.getAttribute("error")||"",this.stack=this.getAttribute("stack")||""}static get observedAttributes(){return["error","stack"]}attributeChangedCallback(e,a,s){e==="error"?(this.error=s,this.render()):e==="stack"&&(this.stack=s,this.render())}connectedCallback(){this.attachShadow({mode:"open"}),this.render()}render(){this.shadowRoot&&(this.shadowRoot.innerHTML=`<style>
        :host {
          display: block;
          background-color: red;
          font-family: monospace;
          color: white;
          padding: 8px 4px;
        }
      </style>
      <details>
      <summary>${this.error} </summary>
        ${this.stack?`<pre>${this.stack}</pre>`:""}
      </details>`)}}customElements.define("error-fallback",i);let d={"hero-example":()=>o(()=>import("./hero-example-SyCdIdsw.js"),__vite__mapDeps([0,1])),"confetti-button":()=>o(()=>import("./confetti-button-Bw2NmyCW.js"),[]),"three-cube":()=>o(()=>import("./three-cube-8HBqYzGh.js"),[]),"playground-ide":"https://cdn.jsdelivr.net/npm/playground-elements@0.18.1/+esm","json-viewer":"https://esm.sh/@alenaksu/json-viewer","wc-markdown":"https://cdn.skypack.dev/@vanillawc/wc-markdown"};globalThis.registry=new l({catalog:d,root:document.body,live:!1,fallback:i,defaultDirective:"visible",transition:!0});console.log("Discovered on first run:",await registry.discover());async function u(t,e,{parent:a=document.head,position:s="beforeend"}={}){if(document.querySelector(`style[data-src="${t}"]`))return;const n=await fetch(t).then(c=>c.text()),r=document.createElement("style");return r.setAttribute("data-layer",e),r.setAttribute("data-src",t),r.textContent=`@layer ${e} {${n}}`,a.insertAdjacentElement(s,r),r}u("shared.css","ds");document.getElementById("confetti").addEventListener("click",async()=>{if(!customElements.get("confetti-button")){let t=await registry.upgrade("manual");console.log("result",t)}});
