export default class AcademicFigure extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const caption = this.getAttribute('caption') || 'Figure';
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin: 2rem 0;
                    border: 1px solid #ddd;
                    padding: 1rem;
                    background: #fcfcfc;
                }
                figure {
                    margin: 0;
                }
                figcaption {
                    margin-top: 0.5rem;
                    font-style: italic;
                    text-align: center;
                    font-size: 0.9rem;
                    color: #444;
                    font-family: "Times New Roman", Times, serif;
                }
            </style>
            <figure>
                <slot></slot>
                <figcaption>${caption}</figcaption>
            </figure>
        `;
    }
}
customElements.define('academic-figure', AcademicFigure);