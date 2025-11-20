import "lit";

const ViSwitch = () => import("./vi-switch.ts");
// or use import.meta.glob("./*.{tsx,jsx,svelte}")

const vi_components = {
    "vi-switch": ViSwitch
}

export default vi_components;