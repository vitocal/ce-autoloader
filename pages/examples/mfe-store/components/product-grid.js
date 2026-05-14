import { defineCustomElement, h, ref, onMounted, onUnmounted } from "vue";
import { filteredProducts, addToCart, cart } from "../store.js";
import { effect } from "@preact/signals-core";

const ProductGrid = defineCustomElement(
  {
    props: {},
    setup() {
      const productsList = ref(filteredProducts.value);
      const cartList = ref(cart.value);
      let stopEffect;

      onMounted(() => {
        stopEffect = effect(() => {
          productsList.value = filteredProducts.value;
          cartList.value = cart.value;
        });
      });

      onUnmounted(() => {
        if (stopEffect) stopEffect();
      });

      const isInCart = (id) => cartList.value.some((p) => p.id === id);

      return () =>
        h("div", { style: "padding: 20px;", class: `vue-product-grid` }, [
          h("h2", { style: "color: #42b983" }, "Vue Product Grid"),
          h(
            "div",
            { style: "display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px;" },
            productsList.value.map((product) =>
              h(
                "div",
                {
                  key: product.id,
                  style: "border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: white;",
                },
                [
                  h("h4", { style: "margin-block-start: 0;" }, product.name),
                  h("p", product.category),
                  h("p", { style: "font-weight: bold" }, `$${product.price}`),
                  h(
                    "button",
                    {
                      onClick: () => addToCart(product),
                      disabled: isInCart(product.id),
                      style: `width: 100%; padding: 8px; border-radius: 4px; border: none; cursor: pointer; ${isInCart(product.id) ? "background: #ccc; cursor: not-allowed;" : "background: #42b983; color: white;"}`,
                    },
                    isInCart(product.id) ? "In Cart" : "Add to Cart",
                  ),
                ],
              ),
            ),
          ),
        ]);
    },
    styles: [],
  },
  { shadowRoot: false },
);

customElements.define("product-grid", ProductGrid);
export default ProductGrid;
