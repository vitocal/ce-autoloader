import{a as e,c as t,l as n,n as r}from"./store2.js";var i=class extends HTMLElement{#e;constructor(){super()}connectedCallback(){this.#e=n(()=>{this.render()})}disconnectedCallback(){this.#e&&this.#e()}render(){this.innerHTML=`
      <div style="position: fixed; bottom: 20px; right: 20px; background: #d43008; color: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); min-width: 250px;">
        <h2 style="margin-top: 0;">Svelte Summary</h2>
        <p>Total Items: ${r.value.length}</p>
        <ul style="max-height: 150px; overflow-y: auto; padding: 0; list-style: none;">
          ${r.value.map(e=>`
            <li style="display: flex; justify-content: space-between; margin-bottom: 5px; background: rgba(255,255,255,0.1); padding: 5px; border-radius: 4px;">
              <span>${e.name} ($${e.price})</span>
              <button class="remove-btn" data-id="${e.id}" style="background: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; color: #ff3e00; font-weight: bold; line-height: 1;">&times;</button>
            </li>
          `).join(``)}
        </ul>
        <hr style="border-color: rgba(255,255,255,0.3)" />
        <h3 style="margin-bottom: 0;">Total: $${t.value}</h3>
      </div>
    `,this.querySelectorAll(`.remove-btn`).forEach(t=>{t.addEventListener(`click`,()=>{let n=parseInt(t.getAttribute(`data-id`)),i=r.value.find(e=>e.id===n);i&&e(i)})})}};customElements.define(`total-summary`,i);export{i as default};
//# sourceMappingURL=total-summary.js.map