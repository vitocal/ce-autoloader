# Loading from a CDN

ce-autoloader is designed to be plug-and-play with good defaults.

For most use-cases, simply add the script directly from CDN passing
the `autoload` parameter.

```html
<script type="module" src="//esm.sh/ce-autoloader?autoload"></script>
```

To configure the component catalog, use a [importmap](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap).

```html
<script type="importmap">
  {
    "imports": {
      "zero-md": "//esm.sh/zero-md@3?register",
      "my-component": "/pages/components/my-component.js",
      "svelte-counter": "/pages/components/vi/frameworks/svelte-counter.svelte"
    }
  }
</script>
```

Now you're ready to use the web components in your page, even nested components.

```html
<body>
  <zero-md src="example.md">
    <script type="text/markdown">
      # This is my [markdown](https://example.com)

      It has nested web components, inlined like <my-component>this</my-component> or
      block-level:

      <svelte-counter></svelte-counter>

      That's neat, right?
    </script>
  </zero-md>
</body>
```

# This is my [markdown](https://example.com)

It has nested web components, inlined like <my-component>this</my-component> or
block-level:

<svelte-counter></svelte-counter>

That's neat, right?
