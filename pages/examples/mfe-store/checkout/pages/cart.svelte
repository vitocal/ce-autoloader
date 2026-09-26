<svelte:options customElement={{ tag: "checkout-pages-cart", shadow: "none" }} />

<script>
  import data from "../database/index.js";
  import { cart, removeFromCart } from "../state.js";

  import "./cart.css";
  import LineItem from "../components/lineitem.svelte";

  /**
   * Converts state line items to cart line items.
   * @param {CookieLineItem[]} items - List of cookie line items.
   * @returns {LineItem[]} - Cart line items.
   */
  function convertToLineItems(items) {
    return items.reduce((res, { sku, quantity }) => {
      const variant = data.variants.find((p) => p.sku === sku);
      if (variant) {
        res.push({ ...variant, quantity, total: variant.price * quantity });
      }
      return res;
    }, []);
  }

  /** Remove a item from cart */
  function handleCartRemove(event, sku) {
    event.preventDefault();

    removeFromCart(sku);
  }

  // State variable to trigger Svelte re-renders when the signal changes
  let currentCart = cart.value;

  // Subscribe to Preact signal updates
  cart.subscribe((value) => {
    currentCart = value;
  });

  // Reactive declarations: these re-evaluate automatically whenever `currentCart` changes
  $: lineItems = convertToLineItems(currentCart);
  $: total = lineItems.reduce((res, { total }) => res + total, 0);
  $: skus = lineItems.map(({ sku }) => sku);
</script>

<explore-header></explore-header>
<main class="c_CartPage">
  <h2>Basket</h2>
  <ul class="c_CartPage__lineItems">
    {#each lineItems as item (item.sku)}
      <LineItem {...item} onItemRemove={handleCartRemove} />
    {/each}
  </ul>
  <hr />
  <p class="c_CartPage__total">Total: ${total} Ø</p>

  <div class="c_CartPage__buttons">
    <ds-button href="#/checkout/checkout" variant="primary" data-navigo>Checkout</ds-button>
    <ds-button href="#/" variant="secondary">Continue Shopping</ds-button>
  </div>

  <explore-recommendations skus={JSON.stringify(skus)}></explore-recommendations>
</main>
<explore-footer></explore-footer>
