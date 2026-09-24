import{t as e}from"./static-html.js";import{t}from"./slotted-element.js";import n from"canvas-confetti";import{css as r}from"lit";var i=class extends t{static styles=r`
    @layer components {
      my-component {
        position: relative;
        display: inline-block;
        vertical-align: middle;
        font-family: var(--n-font-family-code, monospace);
        font-weight: 900;
        color: var(--n-color-accent, #ff3e00);
        overflow-clip-margin: 4em;
        overflow: hidden;

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
        animation: jump 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }

      @keyframes outline-shift {
        0% {
          outline: 2px solid var(--n-color-accent, #ff3e00);
          outline-offset: 2px;
        }
        100% {
          outline: 2px solid var(--n-color-accent, #ff3e00);
          outline-offset: 40px;
        }
      }

      @keyframes jump {
        0% {
          transform: translateY(0) scale(1);
        }
        20% {
          transform: translateY(4px) scale(1.1, 0.9);
        }
        50% {
          transform: translateY(-8px) scale(0.95, 1.05);
        }
        75% {
          transform: translateY(2px) scale(1.05, 0.95);
        }
        100% {
          transform: translateY(0) scale(1);
        }
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
        0% {
          opacity: 0;
          transform: scale(0) rotate(-45deg);
        }
        50% {
          opacity: 1;
          transform: scale(1.2) rotate(10deg);
        }
        100% {
          opacity: 1;
          transform: scale(1) rotate(0deg);
        }
      }
    }
  `;static properties={_stars:{type:Array,state:!0},_confettis:{type:Object,state:!0}};constructor(){super(),this._confettis={spread:360,ticks:50,gravity:0,decay:.94,startVelocity:30,colors:[`FFE400`,`FFBD00`,`E89400`,`FFCA6C`,`FDFFB8`],particleCount:40,scalar:1.2,shapes:[`star`]},this.constructor.styles.styleSheet&&!document.adoptedStyleSheets.includes(this.constructor.styles.styleSheet)&&(document.adoptedStyleSheets=[...document.adoptedStyleSheets,this.constructor.styles.styleSheet])}_generateStars(e){let t=[`⭐`,`✨`,`🌟`,`💫`,`✨`,`🌟`];return Array.from({length:e},(e,n)=>({id:n,emoji:t[Math.floor(Math.random()*t.length)],top:`${Math.random()*100-50}%`,left:`${Math.random()*100-10}%`,delay:`${.5+n*.23}s`,scale:.6+Math.random()*.7}))}_shootStars(){let e=this.getBoundingClientRect(),{x:t,y:r}={x:(e.x+e.width/2)/window.innerWidth,y:(e.y+e.height/2)/window.innerHeight};n({origin:{x:t,y:r},...this._confettis})}createRenderRoot(){return this}render(){let[t,n]=this.slottedChildren;return this.innerHTML=``,e` <a href=${import.meta.url} target="_blank">${t}</a> `}};customElements.get(`my-component`)||customElements.define(`my-component`,i);export{i as default};
//# sourceMappingURL=my-component.js.map