<script setup>
import { useSignal } from "./useSignal";

import { counter, increment, decrement } from "./store";

const count = useSignal(counter);
</script>

<template>
  <div class="counter-card vue">
    <h3>
      <svg class="logo" viewBox="0 0 128 128" width="24" height="24" data-v-0f418ad7="">
        <path
          fill="#42b883"
          d="M78.8,10L64,35.4L49.2,10H0l64,110l64-110C128,10,78.8,10,78.8,10z"
          data-v-0f418ad7=""
        ></path>
        <path fill="#35495e" d="M78.8,10L64,35.4L49.2,10H25.6L64,76l38.4-66H78.8z" data-v-0f418ad7=""></path>
      </svg>
      Vue Counter
    </h3>
    <div class="controls">
      <button type="button" @click="decrement">-</button>
      <span class="count">{{ count }}</span>
      <button type="button" @click="increment">+</button>
    </div>
  </div>
</template>
