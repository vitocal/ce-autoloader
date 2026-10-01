# Animating the lifecycle with CSS

Every step of a lazily loaded component's life is exposed as an attribute (or a platform pseudo-class),
so most of the polish — skeletons, spinners, fades, error states — needs no JavaScript at all. This page
documents the CSS side of ce-autoloader; the
[view transition demo](/pages/demos/view-transition.html) covers the advanced morphing animation.

## Default CSS selectors

| Selector         | When it matches                                                 |
| ---------------- | --------------------------------------------------------------- |
| `:not(:defined)` | the tag is on the page but not registered yet                   |
| `[ce="loading"]` | the module is being fetched                                     |
| `[ce="defined"]` | the module resolved and the element upgraded                    |
| `[ce="error"]`   | loading or defining failed (a component that is in the catalog) |

<div class="demo">
  <el-notloaded>:not(:defined)</el-notloaded>
  <div class="ce" ce="loading">Loading...</div>
  <div class="ce" ce="defined">Defined!</div>
  <div class="ce" ce="error">Error!</div>
</div>

```css
/* 1. Unregistered state */
:not(:defined) {
  opacity: 0.2;
  filter: blur(2px);
  transition: opacity var(--duration) ease;
}

/* 2. Loading state (module is fetching) */
[ce="loading"] {
  position: relative;
  overflow: hidden;
  filter: none;
  opacity: 0.75;
}

/* Skeleton Shimmer */
[ce="loading"]::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.2), transparent);
  animation: shimmer 1.5s infinite;
}

[ce="error"] {
  outline: 1px solid red;
  color: red;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
```

## Use CSS transitions to animate state changes

Use CSS transitions to seamlessly animate between component states.

> A <code>transition</code> declared only inside <code>:not(:defined)</code> will not run. The
> browser reads <code>transition</code> from the <em>new</em> computed style, and that rule stops
> applying the moment the element becomes defined.<br>
> A workaround is to use a <code>class</code> in the web component, and declare the transition on the
> that class instead.

```css
.ce {
  transition: all 1s ease-out;
  opacity: 0.25;
}
.ce[ce="loading"] {
  opacity: 0.75;
}
.ce[ce="defined"] {
  opacity: 1;
}
```

<div class="demo">
  <model-viewer camera-controls touch-action="pan-y" auto-rotate class="bg-slate-500 h-[400px]" src="//modelviewer.dev/shared-assets/models/shishkebab.glb" alt="A 3D model of a shishkebab">
  </model-viewer>
</div>

## Use CSS animations for the last `defined` state

The <em>defined</em> state is trickier to animate, because the element is replaced with a new node.
Use `@keyframes` to animate, and `calc-size()` to set the height of the element to a fixed value, so
it can grow nicely beyond the boundary box.

```css
@keyframes pop-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.ce[ce="defined"] {
  animation: pop-in 1.5s ease-out;
  height: calc-size(auto, size);
}
```

<div class="demo">
  <demo-expand ce="loading" class="flex flex-col gap-4">
    <strong>Height Expand &amp; Fade</strong>
  </demo-expand>
</div>

## Other examples

<button onclick="runLifecycleSimulation()" class="ml-auto bg-black text-white px-4 py-2 rounded">Re-run Custom Element Upgrade Sequence</button>

<div class="grid">
  <demo-pop ce="loading">Pop In (Bouncy Overshoot)</demo-pop>
  <demo-flip ce="loading">3D Flip</demo-flip>
  <demo-reveal ce="loading">Reveal Sweep (Clip-Path)</demo-reveal>
  <demo-stagger-container>
    <demo-stagger-item ce="loading">Stagger A</demo-stagger-item>
    <demo-stagger-item ce="loading">Stagger B</demo-stagger-item>
    <demo-stagger-item ce="loading">Stagger C</demo-stagger-item>
  </demo-stagger-container>
</div>
