import*as o from"https://cdn.jsdelivr.net/npm/@observablehq/plot/+esm";class p extends HTMLElement{#e=null;connectedCallback(){this.#t(),this.#r()}disconnectedCallback(){this.#e?.disconnect(),this.#e=null}#r(){try{this.#e=new PerformanceObserver(()=>this.#t()),this.#e.observe({type:"measure",buffered:!1})}catch{}}#t(){const t=getComputedStyle(document.documentElement),i=t.getPropertyValue("--color-primary").trim()||"oklch(70% 0.15 145)";t.getPropertyValue("--color-secondary").trim();const l=t.getPropertyValue("--color-accent").trim()||"oklch(85% 0.15 15)",s=t.getPropertyValue("--color-bg").trim()||"#f5f5f5",a=t.getPropertyValue("--color-fg").trim()||"#222",m=t.getPropertyValue("--radius-sm").trim()||"0.4rem",r=performance.getEntriesByType("measure").filter(e=>e.name.startsWith("load:")||e.name==="transition").map(e=>({name:e.name.replace("load:",""),start:e.startTime,end:e.startTime+e.duration,duration:e.duration,type:e.detail?.error!=null?"error":e.name.startsWith("load:")?"load":"unknown"})).sort((e,d)=>e.duration-d.duration),[n]=performance.getEntriesByType("navigation");if(n&&(n.domInteractive,n.domComplete),r.length===0){this.innerHTML=`<p style="
                padding: 1rem; color: ${a}; opacity: 0.5;
                font-size: 0.875rem; text-align: center;">
                No performance measures recorded yet.<br>Interact with a component first.
            </p>`;return}const c=o.plot({marginLeft:160,marginRight:80,marginTop:24,marginBottom:32,width:this.clientWidth||640,title:"Time to load of each component",style:`
                background: ${s};
                color: ${a};
                border-radius: ${m};
                font-family: system-ui, sans-serif;
                font-size: 12px;
                max-width: none;
            `,x:{label:"Time (ms) →",grid:!0},y:{grid:!0,domain:[...r.filter(e=>e.type==="load"||e.type==="error").map(e=>e.name)]},color:{legend:!0,domain:["load","error"],range:[i,l]},marks:[o.barX(r,{x1:e=>0,x2:e=>e.duration,y:e=>e.name,fill:e=>e.type,rx:4}),o.tip(r,o.pointerY({x1:e=>0,x2:e=>e.duration,y:e=>e.name,title:e=>`${e.name}
Start:    ${e.start.toFixed(2)} ms
Duration: ${e.duration.toFixed(2)} ms`}))]});this.innerHTML="",this.append(c)}}customElements.define("performance-metrics-plot",p);export{p as default};
//# sourceMappingURL=performance-metrics-plot-BdEpM-uY.js.map
