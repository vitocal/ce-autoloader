<svelte:options customElement={{ tag: "checkout-components-lineitem", shadow: "none" }} />

<script>
  import { removeFromCart } from "../state";
  import { src, srcset } from "../utils";

  import "./lineitem.css";

  // Component Props
  export let sku = "";
  export let id = "";
  export let name = "";
  export let quantity = 0;
  export let total = 0;
  export let image = "";

  export let onItemRemove = (_ev, _sku) => {};

  // Reactive URL declaration
  $: url = `/product/${id}?sku=${sku}`;
</script>

<li class="c_LineItem">
  <a href={url} class="c_LineItem__image">
    <img src={src(image, 200)} srcset={srcset(image, [200, 400])} sizes="200px" alt={name} width="200" height="200" />
  </a>

  <div class="c_LineItem__details">
    <a href={url} class="c_LineItem__name">
      <strong>{name}</strong><br />{sku}
    </a>

    <div class="c_LineItem__quantity">
      <span>{quantity}</span>

      <form on:submit={(ev) => onItemRemove(ev, sku)}>
        <input type="hidden" name="sku" value={sku} />

        <ds-button
          variant="secondary"
          rounded="true"
          type="submit"
          value="remove"
          size="small"
          title={`Remove ${name} from cart`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" height="20" width="20" viewBox="0 0 48 48">
            <path
              fill="#000"
              d="m40 5.172-16 16-16-16L5.171 8l16.001 16L5.171 40 8 42.828l16-16 16 16L42.828 40l-16-16 16-16L40 5.172Z"
            />
          </svg>
        </ds-button>
      </form>
    </div>

    <div class="c_LineItem__price">{total} Ø</div>
  </div>
</li>
