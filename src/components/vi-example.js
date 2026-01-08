import { css, adoptStyles } from "lit";
import SlottedElement from "./vi/slotted-element.js";

import { html, unsafeStatic } from 'lit/static-html.js';

import NordButton from "@nordhealth/components/lib/Button.js"

/**
 * A component to showcase examples
 */
export class ViExample extends SlottedElement {
    static properties = {
        shadow: { type: String, default: 'light' },
    };

    static styles = css`
    @layer components {
        vi-example {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 1rem;
            align-items: center;

            .left {
                grid-column: 1 / 2;
            }
            .right {
                grid-column: 2 / 3;
            }

            syntax-highlight {
                height: 100%; width: 100%;
                white-space: pre-wrap;
            }
        }

        @media (max-width: 60ch) {
			vi-example {
				display: flex;
				flex-direction: column;
				width: 100%;
				flex-wrap: wrap;
				align-items: stretch;

				.left,.right {
					max-width: 100%;
				}
			}
		}
    }
    `;

    constructor() {
        super();

        // In light-dom mode, we need to adopt the styles
        if (this.constructor.styles.styleSheet && this.shadowRoot === null &&
            !document.adoptedStyleSheets.includes(this.constructor.styles.styleSheet)) {
            document.adoptedStyleSheets.push(this.constructor.styles.styleSheet);
        }

        this.example_slot = this.slottedChildren
            .filter((children => children instanceof HTMLElement))
            .find((children) => children.getAttribute("slot") === "example")
            .outerHTML.trim()
            .replace(/<!--.*?-->/g, "")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/slot="(.*?)"/g, "")
            .replace(/ce-loading="(.*?)"/g, "")
            .replace(/ce-defined="(.*?)"/g, "")
    }

    render() {
        return html`
            <div class="left window flex-y">
                <h4>Example</h4>
                <pre><syntax-highlight language="html">${unsafeStatic(this.example_slot)}</syntax-highlight></pre>
            </div>
            <div class="preview right card flex-y">
                <slot name="example"></slot>
            </div>
        `;
    }

}

customElements.define('vi-example', ViExample);
