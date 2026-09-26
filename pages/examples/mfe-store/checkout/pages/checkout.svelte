<svelte:options customElement={{ tag: "checkout-pages-checkout", shadow: "none" }} />

<script>
  import { onMount } from "svelte";
  import "./checkout.css";

  let formElement;
  let storePickerElement;
  let storeId = null;
  let isFormValid = false;

  function validateForm() {
    // Check HTML5 validity of inputs + ensure storeId is present
    isFormValid = Boolean(formElement?.checkValidity()) && storeId?.trim() != "";
    return isFormValid;
  }

  function handlePlaceOrder() {
    if (validateForm()) {
      window.history.pushState({}, "", "#/checkout/thanks");
    }
  }

  onMount(() => {
    // Listen for the custom event from the web component
    const handleStoreSelected = (e) => {
      storeId = e.detail;
      validateForm();
    };

    storePickerElement?.addEventListener("explore:store-selected", handleStoreSelected);
    return () => {
      storePickerElement?.removeEventListener("explore:store-selected", handleStoreSelected);
    };
  });
</script>

<explore-header></explore-header>
<main class="c_Checkout">
  <h2>Checkout</h2>
  <form class="c_Checkout__form" bind:this={formElement} on:input={validateForm} on:submit={handlePlaceOrder}>
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
      <div class="c_Checkout__store" bind:this={storePickerElement}>
        <explore-storepicker></explore-storepicker>
      </div>
      <label class="c_Checkout__label" for="c_storeId">Store ID</label>
      <input
        class="c_Checkout__input"
        id="c_storeId"
        type="text"
        name="storeId"
        required
        minlength="5"
        bind:value={storeId}
      />
    </fieldset>

    <div class="c_Checkout__buttons">
      <ds-button type="submit" variant="primary"> Place order </ds-button>
      <ds-button href="/checkout/cart" variant="secondary" data-navigo>Back to cart</ds-button>
    </div>
  </form>
</main>
<explore-footer></explore-footer>
