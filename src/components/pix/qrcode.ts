import { LitElement, html } from 'lit';

import { Buffer } from 'buffer'
window.Buffer = window.Buffer ?? Buffer

import { QrCodePix, QrCodePixParams } from "qrcode-pix"

export default class PixQRCode extends LitElement {
    static properties = {
        transaction: { type: Object },
        pix: { type: String },
        qrCodeB64: { type: String },
    };

    transaction!: QrCodePixParams;
    pix!: string;
    qrCodeB64!: string;

    connectedCallback() {
        super.connectedCallback();

        this.transaction = {
            version: '01',
            key: '35783673897',
            name: 'Vitor calejuri',
            city: 'São Paulo',
            transactionId: '***',
            message: 'Teste de QR Code',
            value: 1.00,
            guid: '***',
        }
        this.generateQRCode();
    }

    async generateQRCode() {
        const qrCodePix = QrCodePix(this.transaction);
        this.pix = qrCodePix.payload()
        this.qrCodeB64 = await qrCodePix.base64()
        console.log(this.qrCodeB64);
    }

    render() {
        return html`
            <p>QR Code</p>
            ${this.pix ?
                html`
                    <img src=${this.qrCodeB64} alt='QR Code PIX'/>
                    <code>${this.pix}</code>
                ` : html`
                    <p>Loading QR Code...</p>
                `
            }
        `;
    }
}
customElements.define('pix-qrcode', PixQRCode)
