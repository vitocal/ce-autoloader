import*as o from"https://cdn.jsdelivr.net/npm/@observablehq/plot/+esm";class c extends HTMLElement{#t=null;connectedCallback(){this.#e(),this.#r()}disconnectedCallback(){this.#t?.disconnect(),this.#t=null}#r(){try{this.#t=new PerformanceObserver(()=>this.#e()),this.#t.observe({type:"measure",buffered:!1})}catch{}}#e(){const e=getComputedStyle(document.documentElement);e.getPropertyValue("--color-primary").trim(),e.getPropertyValue("--color-secondary").trim();const i=e.getPropertyValue("--color-bg").trim()||"#f5f5f5",a=e.getPropertyValue("--color-fg").trim()||"#222",s=e.getPropertyValue("--radius-sm").trim()||"0.4rem",r=performance.getEntriesByType("measure").filter(t=>t.name.startsWith("load:")||t.name==="transition").map(t=>({name:t.name.replace("load:",""),start:t.startTime,end:t.startTime+t.duration,duration:t.duration,type:t.name.startsWith("load:")?"load":"transition"})).sort((t,l)=>t.duration-l.duration),[n]=performance.getEntriesByType("navigation");if(n&&(n.domInteractive,n.domComplete),r.length===0){this.innerHTML=`<p style="
                padding: 1rem; color: ${a}; opacity: 0.5;
                font-size: 0.875rem; text-align: center;">
                No performance measures recorded yet.<br>Interact with a component first.
            </p>`;return}const m=o.plot({marginLeft:160,marginRight:80,marginTop:24,marginBottom:32,width:this.clientWidth||640,title:"Time to load of each component",style:`
                background: ${i};
                color: ${a};
                border-radius: ${s};
                font-family: system-ui, sans-serif;
                font-size: 12px;
                max-width: none;
            `,x:{label:"Time (ms) →",grid:!0},y:{grid:!0,domain:[...r.filter(t=>t.type==="load").map(t=>t.name)]},marks:[o.barX(r,{x1:t=>0,x2:t=>t.duration,y:t=>t.name,fill:t=>t.type,rx:4}),o.tip(r,o.pointerY({x1:t=>0,x2:t=>t.duration,y:t=>t.name,title:t=>`${t.name}
Start:    ${t.start.toFixed(2)} ms
Duration: ${t.duration.toFixed(2)} ms`}))]});this.innerHTML="",this.append(m)}}customElements.define("performance-metrics-plot",c);export{c as default};
