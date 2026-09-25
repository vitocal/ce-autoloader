# ce-autoloader - Loading from cdn

ce-autoloader is designed to be plug-and-play with good defaults.
For most use-cases, simply import the script directly from CDN and configure the catalog with an import map.

```html
<head>
  <script type="importmap">
    {
      "imports": {
        "zero-md": "//esm.sh/zero-md@3?register"
      }
    }
  </script>
  <script type="module" src="//esm.sh/ce-autoloader?autoload"></script>
</head>

<body>
  <!-- Profit! -->
  <zero-md src="example.md"></zero-md>
</body>
```
