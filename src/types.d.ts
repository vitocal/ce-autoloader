declare global {
    interface Window {
        Buffer: any;
    }
}

declare module 'qrcode-pix' {
    interface QrCodePixParams {
        version: string;
        key: string;
        name: string;
        city: string;
        transactionId: string;
        message?: string;
        value: number;
        [key: string]: any;
    }

    interface QrCodePixResult {
        payload: () => string;
        base64: () => Promise<string>;
    }

    export function QrCodePix(params: QrCodePixParams): QrCodePixResult;
}
