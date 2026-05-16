import{i as a}from"./reactive-element-Cvb7jJT9.js";import"./lit-html-BQJ4ffLt.js";import"./lit-element-CUW7fmek.js";import{S as n}from"./slotted-element-U8kiabq5.js";import{o as i}from"./style-map-BNgmN73e.js";import{u as r}from"./static-DtgXtClZ.js";import{a as c}from"./confetti.module-xYEAsLwP.js";import"./directive-jorct-Oe.js";class l extends n{static styles=a`
    @layer components {
      my-component {
        position: relative;
        display: inline-block;
        font-family: var(--n-font-family-code, monospace);
        font-weight: 900;
        color: var(--n-color-accent, #ff3e00);

        padding: 0.1em 0.2em;
        margin: 0.2em 0;
        border-radius: 8px;

        white-space: nowrap;


        /* Initial state */
        transform-origin: center bottom;
        opacity: 1;
        transform: scale(1);
      }

      my-component[ce="defined"] {
        animation:
          jump 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }

      @keyframes outline-shift {
        0% { outline: 2px solid var(--n-color-accent, #ff3e00); outline-offset: 2px; }
        100% { outline: 2px solid var(--n-color-accent, #ff3e00); outline-offset: 40px; }
      }

      @keyframes jump {
        0% { transform: translateY(0) scale(1); }
        20% { transform: translateY(8px) scale(1.1, 0.9); }
        50% { transform: translateY(-30px) scale(0.85, 1.2); }
        75% { transform: translateY(4px) scale(1.05, 0.95); }
        100% { transform: translateY(0) scale(1); }
      }

      .star {
        position: absolute;
        font-size: 1.2rem;
        pointer-events: none;
        z-index: 1;
        opacity: 0;
        transform: scale(0);
      }

      my-component[ce="defined"] .star {
        animation: star-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }

      @keyframes star-pop {
        0% { opacity: 0; transform: scale(0) rotate(-45deg); }
        50% { opacity: 1; transform: scale(1.2) rotate(10deg); }
        100% { opacity: 1; transform: scale(1) rotate(0deg); }
      }
    }
  `;static properties={_stars:{type:Array,state:!0},_confettis:{type:Object,state:!0}};constructor(){super(),this._stars=this._generateStars(3),this._confettis={spread:360,ticks:50,gravity:0,decay:.94,startVelocity:30,colors:["FFE400","FFBD00","E89400","FFCA6C","FDFFB8"],particleCount:40,scalar:1.2,shapes:["star"]},this.constructor.styles.styleSheet&&!document.adoptedStyleSheets.includes(this.constructor.styles.styleSheet)&&(document.adoptedStyleSheets=[...document.adoptedStyleSheets,this.constructor.styles.styleSheet])}_generateStars(t){const o=["⭐","✨","🌟","💫","✨","🌟"];return Array.from({length:t},(e,s)=>({id:s,emoji:o[Math.floor(Math.random()*o.length)],top:`${Math.random()*100-50}%`,left:`${Math.random()*100-10}%`,delay:`${.5+s*.23}s`,scale:.6+Math.random()*.7}))}_shootStars(){const t=this.getBoundingClientRect(),{x:o,y:e}={x:(t.x+t.width/2)/window.innerWidth,y:(t.y+t.height/2)/window.innerHeight};c({origin:{x:o,y:e},...this._confettis})}createRenderRoot(){return this}render(){this._shootStars();const[t,o]=this.slottedChildren;return this.innerHTML="",r`
            <a href=${import.meta.url} target="_blank">${t}</a>
            ${this._stars.map(e=>r`
                <span class="star" style=${i({top:e.top,left:e.left,animationDelay:e.delay,fontSize:`${e.scale}em`})}>${e.emoji}</span>
            `)}
        `}}customElements.get("my-component")||customElements.define("my-component",l);export{l as default};
//# sourceMappingURL=my-component-Bt8OndzO.js.map
