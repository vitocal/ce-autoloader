import { css, adoptStyles } from "lit";
import SlottedElement from "./vi/slotted-element.js";

import { html, unsafeStatic, literal } from "lit/static-html.js";

function reindent(code, indent = "    ") {
  let depth = 0;
  return code
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      // Decrement depth before rendering if line starts with a closing tag
      if (line.startsWith("</")) depth--;

      const formatted = indent.repeat(Math.max(0, depth)) + line;

      // Increment depth ONLY for opening tags that do not close on the same line
      const isOpening = line.startsWith("<") && !line.startsWith("</");
      const hasClosing = line.includes("</") || line.endsWith("/>");

      if (isOpening && !hasClosing) depth++;

      return formatted;
    })
    .join("\n");
}

/**
 * A component to showcase examples
 */
export class ViExample extends SlottedElement {
  static properties = {
    shadow: { type: String, default: "light" },
  };

  static styles = css`
    @layer components {
      vi-example {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 1rem;
        align-items: stretch;

        .left {
          grid-column: 1 / 2;
        }
        .right {
          grid-column: 2 / 3;
        }

        syntax-highlight {
          height: 100%;
          width: 100%;
          white-space: pre-wrap;
        }

        &.equal-size {
          grid-template-columns: 1fr minmax(50%, 1fr);
          syntax-highlight {
            white-space: normal !important;
          }
        }
      }

      @media (max-width: 100ch) {
        vi-example {
          display: flex;
          flex-direction: column;
          width: 100%;
          flex-wrap: wrap;
          align-items: stretch;

          .left,
          .right {
            max-width: 100%;
          }
        }
      }
    }
  `;

  constructor() {
    super();

    // In light-dom mode, we need to adopt the styles
    if (
      this.constructor.styles.styleSheet &&
      this.shadowRoot === null &&
      !document.adoptedStyleSheets.includes(this.constructor.styles.styleSheet)
    ) {
      document.adoptedStyleSheets.push(this.constructor.styles.styleSheet);
    }

    this.example_slot = this.slottedChildren
      .filter((children) => children instanceof HTMLElement)
      .find((children) => children.getAttribute("slot") === "example")
      .innerHTML.trim()
      .replace(/<!--.*?-->/g, "")
      .replace(/slot="(.*?)"/g, "")
      .replace(/ce="(.*?)"/g, "");

    console.log(this.example_slot);
  }

  render() {
    let example_code = reindent(this.example_slot).replace(/</g, "&lt;").replace(/>/g, "&gt;");
    console.log("vi-example rerender");
    return html`
      <div class="left window flex-y">
        <pre><syntax-highlight language="html">${unsafeStatic(example_code)}</syntax-highlight></pre>
      </div>
      <div class="preview right card flex-y">
        <slot name="example"></slot>
      </div>
    `;
  }
}

customElements.define("vi-example", ViExample);
