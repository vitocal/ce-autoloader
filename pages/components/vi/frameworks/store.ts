import { signal } from "@preact/signals-core";

export const counter = signal(0);
export const increment = () => {
  counter.value++;
};
export const decrement = () => {
  counter.value--;
};
