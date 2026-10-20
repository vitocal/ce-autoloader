import{t as e}from"../chunks/src.js";var t=`
      .inner {
        height: 100%; box-sizing: border-box; display: grid; align-content: end;
        gap: .2rem; padding: 1.25rem; border-radius: inherit; color: #fff;
        background: linear-gradient(135deg, #6366f1, #ec4899 55%, #f59e0b);
      }
      h3 { margin: 0; font-size: 1rem; }
      p  { margin: 0; font-size: .8rem; opacity: .85; }
    `;globalThis.registry=new e({catalog:{"demo-panel":(e=>async()=>(await new Promise(e=>setTimeout(e,900)),e))(class extends HTMLElement{connectedCallback(){this.shadowRoot||(this.attachShadow({mode:`open`}).innerHTML=`
          <style>${t}</style>
          <div class="inner">
            <h3>${this.getAttribute(`label`)??`component`}</h3>
            <p>${this.getAttribute(`desc`)??`revealed on [ce=defined]`}</p>
          </div>`)}})}}),document.getElementById(`replay`).addEventListener(`click`,()=>location.reload());
//# sourceMappingURL=02-clip-masks.html-CHaStW6L.js.map