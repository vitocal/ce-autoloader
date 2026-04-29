class e extends HTMLElement{#t=0;constructor(){super()}connectedCallback(){this.#c()}#n(){this.#t++,this.#e()}#s(){this.#t--,this.#e()}#e(){const t=this.querySelector(".count");t&&(t.textContent=this.#t.toString())}#c(){this.innerHTML=`
            <div class="counter-card svelte">
                <h3>VanillaJS Counter</h3>
                <div class="controls">
                    <button type="button" class="dec">-</button>
                    <span class="count">${this.#t}</span>
                    <button type="button" class="inc">+</button>
                </div>
            </div>
        `,this.querySelector(".inc")?.addEventListener("click",()=>this.#n()),this.querySelector(".dec")?.addEventListener("click",()=>this.#s())}}customElements.define("svelte-counter",e);export{e as default};
