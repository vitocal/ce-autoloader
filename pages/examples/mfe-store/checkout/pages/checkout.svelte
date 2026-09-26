<svelte:options customElement={{ tag: "checkout-pages-checkout", shadow: "none" }} />

<script>
  import "./checkout.css";
</script>

<explore-header></explore-header>
<main class="c_Checkout">
  <h2>Checkout</h2>
  <form action="/checkout/place-order" method="post" class="c_Checkout__form">
    <h3>Personal Data</h3>
    <fieldset class="c_Checkout__name">
      <div>
        <label class="c_Checkout__label" for="c_firstname"> First name </label>
        <input class="c_Checkout__input" type="text" id="c_firstname" name="firstname" required />
      </div>
      <div>
        <label class="c_Checkout__label" for="c_lastname">Last name</label>
        <input class="c_Checkout__input" type="text" id="c_lastname" name="lastname" required />
      </div>
    </fieldset>

    <h3>Store Pickup</h3>
    <fieldset>
      <div class="c_Checkout__store"><explore-storepicker></explore-storepicker></div>
      <label class="c_Checkout__label" for="c_storeId">Store ID</label>
      <input class="c_Checkout__input" type="text" id="c_storeId" name="storeId" readonly required />
    </fieldset>

    <div class="c_Checkout__buttons">
      <ds-button type="submit" variant="primary" disabled="true">Place order</ds-button>
      <ds-button href="/checkout/cart" variant="secondary" data-navigo>Back to cart</ds-button>
    </div>
  </form>
</main>
<explore-footer></explore-footer>
