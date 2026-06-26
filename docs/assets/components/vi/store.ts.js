import { signal as e } from "./node_modules/@preact/signals-core/dist/signals-core.module.js";
//#region pages/components/vi/frameworks/store.ts
var t = e(0), n = () => {
	t.value++;
}, r = () => {
	t.value--;
};
//#endregion
export { t as counter, r as decrement, n as increment };
