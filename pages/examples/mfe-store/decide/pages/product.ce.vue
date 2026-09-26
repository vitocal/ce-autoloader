<template>
  <explore-header />
  <main class="d_ProductPage">
    <div class="d_ProductPage__details">
      <img
        class="d_ProductPage__productImage"
        :src="src(variant.image, 400)"
        :srcset="srcset(variant.image, [400, 800])"
        sizes="400px"
        width="400"
        height="400"
        :alt="`${product.name} - ${variant.name}`"
      />
      <div class="d_ProductPage__productInformation">
        <h2 class="d_ProductPage__title">{{ product.name }}</h2>
        <ul class="d_ProductPage__highlights">
          <li v-for="(highlight, i) in highlights" :key="i">
            {{ highlight }}
          </li>
        </ul>
        <ul class="d_ProductPage__variants">
          <decide-components-variant
            v-for="v in product.variants"
            :key="v.sku"
            v-bind="v"
            :id="props.id"
            :selected="v.sku === variant.sku"
          />
        </ul>
        <checkout-components-addtocart :sku="variant.sku" ></checkout-components-addtocart>
      </div>
    </div>
    <explore-recommendations :skus="JSON.stringify([variant.sku])" />
  </main>
  <explore-footer />
</template>

<script setup>
import { computed, watchEffect } from "vue";
import { src, srcset } from "../utils.js";
import data from "../database/index.js";

import "./product.css";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    default: "",
  },
});

// Find product by id
const product = computed(() => {
  return data.products.find((p) => p.id === props.id) || { name: "", variants: [], highlights: [] };
});

// Extract highlights with fallback to empty array
const highlights = computed(() => product.value.highlights || []);

// Find active variant matching SKU, fallback to first variant
const variant = computed(() => {
  const variants = product.value.variants || [];
  return variants.find((v) => v.sku === props.sku) || variants[0] || {};
});
</script>
