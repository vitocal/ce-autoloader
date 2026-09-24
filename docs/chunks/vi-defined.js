import{t as e}from"./static-html.js";import{LitElement as t}from"lit";var n=class extends t{static properties={counter:{state:!0,default:0}};constructor(){super(),this.counter=0}createRenderRoot(){return this}increment(){this.counter++}decrement(){this.counter--}render(){return e`<div class="counter-card vanilla">
      <h3>I'm defined and interactive!</h3>
      <div class="controls">
        <button type="button" @click=${this.decrement}>-</button>
        <span class="count">${this.counter}</span>
        <button type="button" @click=${this.increment}>+</button>
      </div>
    </div> `}};customElements.define(`vi-defined`,n);export{n as default};
//# sourceMappingURL=vi-defined.js.map