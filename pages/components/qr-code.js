import QRCode from 'https://esm.sh/qrcode@1.5.3';

export default class QrCode extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>
                :host { display: flex; justify-content: center; align-items: center; padding: 1rem; }
                canvas { max-width: 100%; }
            </style>
            <canvas id="qr"></canvas>
        `;

        const canvas = this.shadowRoot.getElementById('qr');
        const url = window.location.href;

        try {
            await QRCode.toCanvas(canvas, url, {
                width: 200,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });
        } catch (err) {
            console.error(err);
            this.shadowRoot.innerHTML = `<p>Error generating QR</p>`;
        }
    }
}
customElements.define('qr-code', QrCode);
