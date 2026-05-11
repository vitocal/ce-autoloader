import { LitElement, css } from "lit";
import SlottedElement from "./vi/slotted-element.js";

import { styleMap } from "lit/directives/style-map.js";
import { html, unsafeStatic } from "lit/static-html.js";

import confetti from "canvas-confetti";

export default class MyComponent extends SlottedElement {
    static styles = css`
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
  `;

    static properties = {
        _stars: { type: Array, state: true },
        _confettis: { type: Object, state: true }
    };

    constructor() {
        super();
        this._stars = this._generateStars(3);
        this._confettis = {
            spread: 360,
            ticks: 50,
            gravity: 0,
            decay: 0.94,
            startVelocity: 30,
            colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'],
            particleCount: 40,
            scalar: 1.2,
            shapes: ['star']
        }

        // In light-dom mode, adopt styles to the document
        if (
            this.constructor.styles.styleSheet &&
            !document.adoptedStyleSheets.includes(this.constructor.styles.styleSheet)
        ) {
            document.adoptedStyleSheets = [
                ...document.adoptedStyleSheets,
                this.constructor.styles.styleSheet,
            ];
        }
    }

    _generateStars(count) {
        const emojis = ['⭐', '✨', '🌟', '💫', '✨', '🌟'];
        const seed = Math.random();
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            // Position around the center
            top: `${(Math.random() * 100) - 50}%`,
            left: `${(Math.random() * 100) - 10}%`,
            delay: `${0.5 + i * 0.23}s`,
            scale: 0.6 + Math.random() * 0.7
        }));
    }

    _shootStars() {
        const bb = this.getBoundingClientRect();
        const { x, y } = {
            x: (bb.x + bb.width / 2) / window.innerWidth,
            y: (bb.y + bb.height / 2) / window.innerHeight
        };
        confetti({
            origin: { x, y },
            ...this._confettis
        });
    }

    createRenderRoot() {
        return this;
    }

    render() {
        this._shootStars();
        const [slot, _rest] = this.slottedChildren;
        this.innerHTML = ''


        return html`
            <a href=${import.meta.url} target="_blank">${slot}</a>
            ${this._stars.map(star => html`
                <span class="star" style=${styleMap({
            top: star.top,
            left: star.left,
            animationDelay: star.delay,
            fontSize: `${star.scale}em`
        })}>${star.emoji}</span>
            `)}
        `;
    }
}

if (!customElements.get("my-component")) {
    customElements.define("my-component", MyComponent);
}
