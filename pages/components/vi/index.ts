const ViSwitch = () => import("./vi-switch.ts");
const ViHello = () => import("./vi-hello.ts");

// or use import.meta.glob("./*.{tsx,jsx,svelte}")

const vi_components = {
    "vi-switch": ViSwitch,
    "vi-hello": ViHello,
}

export default vi_components;