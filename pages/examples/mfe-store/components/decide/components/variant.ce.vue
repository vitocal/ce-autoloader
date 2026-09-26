<script setup>
import { computed } from "vue";
import "./variant.css";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: "",
  },
});

// Sometimes selected is stringly "true"
const isSelected = computed(() => {
  return typeof props.selected === "string" ? props.selected == "true" : props.selected;
});

const vi_router = document.querySelector("vi-router");
const pages_product_url = computed(() => {
  return vi_router.router.generate("decides-pages-product", { id: props.id });
});
</script>

<template>
  <li class="d_VariantOption" :style="{ '--variant-color': color }">
    <i class="d_VariantOption__color"></i>
    <a :href="`${pages_product_url}?sku=${sku}`" data-navigo>
      <strong v-if="isSelected">{{ name }}</strong>
      <span v-else>{{ name }}</span>
    </a>
  </li>
</template>
