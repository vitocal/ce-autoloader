import { effect as e } from "./node_modules/@preact/signals-core/dist/signals-core.module.js";
import { ref as t } from "./node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js";
import { onUnmounted as n, watchEffect as r } from "./node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js";
import "./node_modules/vue/dist/vue.runtime.esm-bundler.js";
//#region pages/components/vi/frameworks/useSignal.ts
function i(i) {
	let a = t(i.value), o = e(() => {
		a.value = i.value;
	});
	return r(() => {
		i.value = a.value;
	}), n(() => o()), a;
}
//#endregion
export { i as useSignal };
