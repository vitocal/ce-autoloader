import type { Signal } from "@preact/signals-core";

import { effect } from "@preact/signals-core";
import { ref, watchEffect, onUnmounted } from "vue";

export function useSignal(preactSignal: Signal<any>) {
  // 1. Create a Vue ref initialized with the Preact signal's current value
  const vueRef = ref(preactSignal.value);

  // 2. Sync Preact -> Vue
  const dispose = effect(() => {
    vueRef.value = preactSignal.value;
  });

  // 3. Sync Vue -> Preact (so modifying the Vue ref updates the Preact signal)
  watchEffect(() => {
    preactSignal.value = vueRef.value;
  });

  // 4. Prevent memory leaks
  onUnmounted(() => dispose());

  return vueRef;
}
