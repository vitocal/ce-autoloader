import{t as e}from"../chunks/src.js";var t=`
      .inner { display: grid; gap: .3rem; height: 100%; box-sizing: border-box;
               padding: 1.1rem 1.25rem; background: #fff; border: 1px solid #e2e8f0;
               border-radius: inherit; }
      h3 { margin: 0; font-size: .95rem; }
      p  { margin: 0; font-size: .82rem; color: #64748b; }

      /* The component animates its own guts, keyed on the same attribute the page
         uses for the host box. */
      :host([ce="defined"]) .inner > * {
        animation: ce-rise var(--ce-dur, 380ms) cubic-bezier(.16, 1, .3, 1) both;
      }
      :host([ce="defined"]) .inner > *:nth-child(2) { animation-delay: 70ms; }

      @keyframes ce-rise { from { opacity: 0; translate: 0 6px; } }
    `,n=`
      .inner { display: grid; gap: .3rem; height: 100%; box-sizing: border-box;
               padding: 1.1rem 1.25rem; background: #fff; border: 1px solid #e2e8f0;
               border-radius: inherit; }
      h3 { margin: 0; font-size: .95rem; }
      p  { margin: 0; font-size: .82rem; color: #64748b; }
    `,r=`
      .inner { display: flex; align-items: center; gap: .6rem; height: 100%;
               box-sizing: border-box; padding: .85rem 1rem; background: #fff;
               border: 1px solid #e2e8f0; border-radius: inherit; font-size: .85rem; }
      .dot { width: .6rem; height: .6rem; border-radius: 50%; background: #6366f1; flex: none; }
    `,i=(e,t)=>class extends HTMLElement{connectedCallback(){this.shadowRoot||(this.attachShadow({mode:`open`}).innerHTML=`<style>${e}</style>${t}`)}},a={"demo-card":i(t,`<div class="inner">
           <h3>Loaded component</h3>
           <p>Upgraded in place — the host faded, then the contents rose in.</p>
         </div>`),"demo-enter":i(n,`<div class="inner">
           <h3>Revealed by @starting-style</h3>
           <p>Never had a loading look; it went from nothing to rendered.</p>
         </div>`),"demo-item":i(r,`<div class="inner"><span class="dot"></span>Item upgraded with the batch</div>`),"demo-grow":i(`
      .inner { display: grid; gap: .3rem; box-sizing: border-box; height: 100%;
               padding: 1.1rem 1.25rem; background: #fff; border: 1px solid #e2e8f0;
               border-radius: inherit; }
      h3 { margin: 0; font-size: .95rem; }
      p  { margin: 0; font-size: .82rem; color: #64748b; }
    `,`<div class="inner">
           <h3>Grown to its real height</h3>
           <p>The slot reserved 2.5rem. The component needs more than that, so the box
              animates to <code>height: auto</code> — and everything below it stays put.</p>
         </div>`)},o=e=>async()=>(await new Promise(e=>setTimeout(e,900)),e);globalThis.registry=new e({catalog:Object.fromEntries(Object.entries(a).map(([e,t])=>[e,o(t)]))}),document.getElementById(`replay`).addEventListener(`click`,()=>location.reload());
//# sourceMappingURL=01-defaults.html-CNWeBwo4.js.map