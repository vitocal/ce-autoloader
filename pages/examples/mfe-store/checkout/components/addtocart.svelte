<svelte:options customElement={{ tag: "checkout-components-addtocart", shadow: "none" }} />

<script>
  import data from "../database/index.js";
  import { addToCart } from "../state.js";

  import "./addtocart.css";

  // Public property/attribute
  export let sku = "";

  // Local state
  let isConfirmed = false;

  // Reactive calculations based on SKU
  $: variant = data.variants.find((p) => p.sku === sku);
  $: outOfStock = !variant || variant.inventory === 0;

  function handleSubmit(event) {
    event.preventDefault();

    if (outOfStock) return;

    // Call state action
    addToCart(sku);

    // Show confirmation message
    isConfirmed = true;
  }
</script>

<form on:submit={handleSubmit} class="c_AddToCart" data-boundary="checkout">
  <input type="hidden" name="sku" value={sku} />

  <div class="c_AddToCart__information">
    {#if variant}
      <p>{variant.price} Ø</p>

      {#if variant.inventory > 0}
        <p class="c_AddToCart__stock c_AddToCart__stock--ok">
          {variant.inventory} in stock, free shipping
        </p>
      {:else}
        <p class="c_AddToCart__stock c_AddToCart__stock--empty">out of stock</p>
      {/if}
    {/if}
  </div>

  <ds-button
    disabled={outOfStock ? "true" : undefined}
    class-name="c_AddToCart__button"
    variant="primary"
    type="submit"
  >
    add to basket
  </ds-button>

  <div class="c_AddToCart__confirmed" class:c_AddToCart__confirmed--hidden={!isConfirmed}>
    <p>Tractor was added.</p>
    <a href="/checkout/cart" class="c_AddToCart__link" data-navigo>View in basket.</a>
  </div>
</form>
