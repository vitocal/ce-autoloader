
const PixQRCode = () => import("./qrcode.ts");

// or use import.meta.glob("./*.{tsx,jsx,svelte}")

const pix_components = {
    "pix-qrcode": PixQRCode,
}

export default pix_components;