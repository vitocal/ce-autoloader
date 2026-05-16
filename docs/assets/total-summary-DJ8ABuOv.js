import{j as i,c as e,t as n,r as s}from"./store-BTMrTFU6.js";class d extends HTMLElement{#t;constructor(){super()}connectedCallback(){this.#t=i(()=>{this.render()})}disconnectedCallback(){this.#t&&this.#t()}render(){this.innerHTML=`
      <div style="position: fixed; bottom: 20px; right: 20px; background: #d43008; color: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); min-width: 250px;">
        <h2 style="margin-top: 0;">Svelte Summary</h2>
        <p>Total Items: ${e.value.length}</p>
        <ul style="max-height: 150px; overflow-y: auto; padding: 0; list-style: none;">
          ${e.value.map(t=>`
            <li style="display: flex; justify-content: space-between; margin-bottom: 5px; background: rgba(255,255,255,0.1); padding: 5px; border-radius: 4px;">
              <span>${t.name} ($${t.price})</span>
              <button class="remove-btn" data-id="${t.id}" style="background: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; color: #ff3e00; font-weight: bold; line-height: 1;">&times;</button>
            </li>
          `).join("")}
        </ul>
        <hr style="border-color: rgba(255,255,255,0.3)" />
        <h3 style="margin-bottom: 0;">Total: $${n.value}</h3>
      </div>
    `,this.querySelectorAll(".remove-btn").forEach(t=>{t.addEventListener("click",()=>{const r=parseInt(t.getAttribute("data-id")),o=e.value.find(a=>a.id===r);o&&s(o)})})}}customElements.define("total-summary",d);export{d as default};
//# sourceMappingURL=total-summary-DJ8ABuOv.js.map
