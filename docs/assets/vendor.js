const W = globalThis, se = W.ShadowRoot && (W.ShadyCSS === void 0 || W.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ne = Symbol(), ye = /* @__PURE__ */ new WeakMap();
class Me {
  constructor(e, t, s) {
    if (this._$cssResult$ = !0, s !== ne)
      throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this._strings = t;
  }
  // This is a getter so that it's lazy. In practice, this means stylesheets
  // are not created until the first element instance is made.
  get styleSheet() {
    let e = this._styleSheet;
    const t = this._strings;
    if (se && e === void 0) {
      const s = t !== void 0 && t.length === 1;
      s && (e = ye.get(t)), e === void 0 && ((this._styleSheet = e = new CSSStyleSheet()).replaceSync(this.cssText), s && ye.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
}
const Ze = (i) => {
  if (i._$cssResult$ === !0)
    return i.cssText;
  if (typeof i == "number")
    return i;
  throw new Error(`Value passed to 'css' function must be a 'css' function result: ${i}. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`);
}, Ke = (i) => new Me(typeof i == "string" ? i : String(i), void 0, ne), Bt = (i, ...e) => {
  const t = i.length === 1 ? i[0] : e.reduce((s, n, r) => s + Ze(n) + i[r + 1], i[0]);
  return new Me(t, i, ne);
}, Xe = (i, e) => {
  if (se)
    i.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else
    for (const t of e) {
      const s = document.createElement("style"), n = W.litNonce;
      n !== void 0 && s.setAttribute("nonce", n), s.textContent = t.cssText, i.appendChild(s);
    }
}, et = (i) => {
  let e = "";
  for (const t of i.cssRules)
    e += t.cssText;
  return Ke(e);
}, $e = se ? (i) => i : (i) => i instanceof CSSStyleSheet ? et(i) : i;
const { is: tt, defineProperty: it, getOwnPropertyDescriptor: be, getOwnPropertyNames: st, getOwnPropertySymbols: nt, getPrototypeOf: Se } = Object, g = globalThis;
let $;
const Pe = g.trustedTypes, rt = Pe ? Pe.emptyScript : "", ke = g.reactiveElementPolyfillSupportDevMode;
g.litIssuedWarnings ??= /* @__PURE__ */ new Set(), $ = (i, e) => {
  e += ` See https://lit.dev/msg/${i} for more information.`, !g.litIssuedWarnings.has(e) && !g.litIssuedWarnings.has(i) && (console.warn(e), g.litIssuedWarnings.add(e));
}, queueMicrotask(() => {
  $("dev-mode", "Lit is in dev mode. Not recommended for production!"), g.ShadyDOM?.inUse && ke === void 0 && $("polyfill-support-missing", "Shadow DOM is being polyfilled via `ShadyDOM` but the `polyfill-support` module has not been loaded.");
});
const ot = (i) => {
  g.emitLitDebugLogEvents && g.dispatchEvent(new CustomEvent("lit-debug", {
    detail: i
  }));
}, R = (i, e) => i, q = {
  toAttribute(i, e) {
    switch (e) {
      case Boolean:
        i = i ? rt : null;
        break;
      case Object:
      case Array:
        i = i == null ? i : JSON.stringify(i);
        break;
    }
    return i;
  },
  fromAttribute(i, e) {
    let t = i;
    switch (e) {
      case Boolean:
        t = i !== null;
        break;
      case Number:
        t = i === null ? null : Number(i);
        break;
      case Object:
      case Array:
        try {
          t = JSON.parse(i);
        } catch {
          t = null;
        }
        break;
    }
    return t;
  }
}, re = (i, e) => !tt(i, e), we = {
  attribute: !0,
  type: String,
  converter: q,
  reflect: !1,
  useDefault: !1,
  hasChanged: re
};
Symbol.metadata ??= Symbol("metadata");
g.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
class S extends HTMLElement {
  /**
   * Adds an initializer function to the class that is called during instance
   * construction.
   *
   * This is useful for code that runs against a `ReactiveElement`
   * subclass, such as a decorator, that needs to do work for each
   * instance, such as setting up a `ReactiveController`.
   *
   * ```ts
   * const myDecorator = (target: typeof ReactiveElement, key: string) => {
   *   target.addInitializer((instance: ReactiveElement) => {
   *     // This is run during construction of the element
   *     new MyController(instance);
   *   });
   * }
   * ```
   *
   * Decorating a field will then cause each instance to run an initializer
   * that adds a controller:
   *
   * ```ts
   * class MyElement extends LitElement {
   *   @myDecorator foo;
   * }
   * ```
   *
   * Initializers are stored per-constructor. Adding an initializer to a
   * subclass does not add it to a superclass. Since initializers are run in
   * constructors, initializers will run in order of the class hierarchy,
   * starting with superclasses and progressing to the instance's class.
   *
   * @nocollapse
   */
  static addInitializer(e) {
    this.__prepare(), (this._initializers ??= []).push(e);
  }
  /**
   * Returns a list of attributes corresponding to the registered properties.
   * @nocollapse
   * @category attributes
   */
  static get observedAttributes() {
    return this.finalize(), this.__attributeToPropertyMap && [...this.__attributeToPropertyMap.keys()];
  }
  /**
   * Creates a property accessor on the element prototype if one does not exist
   * and stores a {@linkcode PropertyDeclaration} for the property with the
   * given options. The property setter calls the property's `hasChanged`
   * property option or uses a strict identity check to determine whether or not
   * to request an update.
   *
   * This method may be overridden to customize properties; however,
   * when doing so, it's important to call `super.createProperty` to ensure
   * the property is setup correctly. This method calls
   * `getPropertyDescriptor` internally to get a descriptor to install.
   * To customize what properties do when they are get or set, override
   * `getPropertyDescriptor`. To customize the options for a property,
   * implement `createProperty` like this:
   *
   * ```ts
   * static createProperty(name, options) {
   *   options = Object.assign(options, {myOption: true});
   *   super.createProperty(name, options);
   * }
   * ```
   *
   * @nocollapse
   * @category properties
   */
  static createProperty(e, t = we) {
    if (t.state && (t.attribute = !1), this.__prepare(), this.prototype.hasOwnProperty(e) && (t = Object.create(t), t.wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const s = (
        // Use Symbol.for in dev mode to make it easier to maintain state
        // when doing HMR.
        Symbol.for(`${String(e)} (@property() cache)`)
      ), n = this.getPropertyDescriptor(e, s, t);
      n !== void 0 && it(this.prototype, e, n);
    }
  }
  /**
   * Returns a property descriptor to be defined on the given named property.
   * If no descriptor is returned, the property will not become an accessor.
   * For example,
   *
   * ```ts
   * class MyElement extends LitElement {
   *   static getPropertyDescriptor(name, key, options) {
   *     const defaultDescriptor =
   *         super.getPropertyDescriptor(name, key, options);
   *     const setter = defaultDescriptor.set;
   *     return {
   *       get: defaultDescriptor.get,
   *       set(value) {
   *         setter.call(this, value);
   *         // custom action.
   *       },
   *       configurable: true,
   *       enumerable: true
   *     }
   *   }
   * }
   * ```
   *
   * @nocollapse
   * @category properties
   */
  static getPropertyDescriptor(e, t, s) {
    const { get: n, set: r } = be(this.prototype, e) ?? {
      get() {
        return this[t];
      },
      set(o) {
        this[t] = o;
      }
    };
    if (n == null) {
      if ("value" in (be(this.prototype, e) ?? {}))
        throw new Error(`Field ${JSON.stringify(String(e))} on ${this.name} was declared as a reactive property but it's actually declared as a value on the prototype. Usually this is due to using @property or @state on a method.`);
      $("reactive-property-without-getter", `Field ${JSON.stringify(String(e))} on ${this.name} was declared as a reactive property but it does not have a getter. This will be an error in a future version of Lit.`);
    }
    return {
      get: n,
      set(o) {
        const l = n?.call(this);
        r?.call(this, o), this.requestUpdate(e, l, s);
      },
      configurable: !0,
      enumerable: !0
    };
  }
  /**
   * Returns the property options associated with the given property.
   * These options are defined with a `PropertyDeclaration` via the `properties`
   * object or the `@property` decorator and are registered in
   * `createProperty(...)`.
   *
   * Note, this method should be considered "final" and not overridden. To
   * customize the options for a given property, override
   * {@linkcode createProperty}.
   *
   * @nocollapse
   * @final
   * @category properties
   */
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? we;
  }
  /**
   * Initializes static own properties of the class used in bookkeeping
   * for element properties, initializers, etc.
   *
   * Can be called multiple times by code that needs to ensure these
   * properties exist before using them.
   *
   * This method ensures the superclass is finalized so that inherited
   * property metadata can be copied down.
   * @nocollapse
   */
  static __prepare() {
    if (this.hasOwnProperty(R("elementProperties")))
      return;
    const e = Se(this);
    e.finalize(), e._initializers !== void 0 && (this._initializers = [...e._initializers]), this.elementProperties = new Map(e.elementProperties);
  }
  /**
   * Finishes setting up the class so that it's ready to be registered
   * as a custom element and instantiated.
   *
   * This method is called by the ReactiveElement.observedAttributes getter.
   * If you override the observedAttributes getter, you must either call
   * super.observedAttributes to trigger finalization, or call finalize()
   * yourself.
   *
   * @nocollapse
   */
  static finalize() {
    if (this.hasOwnProperty(R("finalized")))
      return;
    if (this.finalized = !0, this.__prepare(), this.hasOwnProperty(R("properties"))) {
      const t = this.properties, s = [
        ...st(t),
        ...nt(t)
      ];
      for (const n of s)
        this.createProperty(n, t[n]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0)
        for (const [s, n] of t)
          this.elementProperties.set(s, n);
    }
    this.__attributeToPropertyMap = /* @__PURE__ */ new Map();
    for (const [t, s] of this.elementProperties) {
      const n = this.__attributeNameForProperty(t, s);
      n !== void 0 && this.__attributeToPropertyMap.set(n, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles), this.hasOwnProperty("createProperty") && $("no-override-create-property", "Overriding ReactiveElement.createProperty() is deprecated. The override will not be called with standard decorators"), this.hasOwnProperty("getPropertyDescriptor") && $("no-override-get-property-descriptor", "Overriding ReactiveElement.getPropertyDescriptor() is deprecated. The override will not be called with standard decorators");
  }
  /**
   * Takes the styles the user supplied via the `static styles` property and
   * returns the array of styles to apply to the element.
   * Override this method to integrate into a style management system.
   *
   * Styles are deduplicated preserving the _last_ instance in the list. This
   * is a performance optimization to avoid duplicated styles that can occur
   * especially when composing via subclassing. The last item is kept to try
   * to preserve the cascade order with the assumption that it's most important
   * that last added styles override previous styles.
   *
   * @nocollapse
   * @category styles
   */
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const s = new Set(e.flat(1 / 0).reverse());
      for (const n of s)
        t.unshift($e(n));
    } else e !== void 0 && t.push($e(e));
    return t;
  }
  /**
   * Returns the property name for the given attribute `name`.
   * @nocollapse
   */
  static __attributeNameForProperty(e, t) {
    const s = t.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this.__instanceProperties = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this.__reflectingProperty = null, this.__initialize();
  }
  /**
   * Internal only override point for customizing work done when elements
   * are constructed.
   */
  __initialize() {
    this.__updatePromise = new Promise((e) => this.enableUpdating = e), this._$changedProperties = /* @__PURE__ */ new Map(), this.__saveInstanceProperties(), this.requestUpdate(), this.constructor._initializers?.forEach((e) => e(this));
  }
  /**
   * Registers a `ReactiveController` to participate in the element's reactive
   * update cycle. The element automatically calls into any registered
   * controllers during its lifecycle callbacks.
   *
   * If the element is connected when `addController()` is called, the
   * controller's `hostConnected()` callback will be immediately called.
   * @category controllers
   */
  addController(e) {
    (this.__controllers ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
  }
  /**
   * Removes a `ReactiveController` from the element.
   * @category controllers
   */
  removeController(e) {
    this.__controllers?.delete(e);
  }
  /**
   * Fixes any properties set on the instance before upgrade time.
   * Otherwise these would shadow the accessor and break these properties.
   * The properties are stored in a Map which is played back after the
   * constructor runs.
   */
  __saveInstanceProperties() {
    const e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
    for (const s of t.keys())
      this.hasOwnProperty(s) && (e.set(s, this[s]), delete this[s]);
    e.size > 0 && (this.__instanceProperties = e);
  }
  /**
   * Returns the node into which the element should render and by default
   * creates and returns an open shadowRoot. Implement to customize where the
   * element's DOM is rendered. For example, to render into the element's
   * childNodes, return `this`.
   *
   * @return Returns a node into which to render.
   * @category rendering
   */
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Xe(e, this.constructor.elementStyles), e;
  }
  /**
   * On first connection, creates the element's renderRoot, sets up
   * element styling, and enables updating.
   * @category lifecycle
   */
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this.__controllers?.forEach((e) => e.hostConnected?.());
  }
  /**
   * Note, this method should be considered final and not overridden. It is
   * overridden on the element instance with a function that triggers the first
   * update.
   * @category updates
   */
  enableUpdating(e) {
  }
  /**
   * Allows for `super.disconnectedCallback()` in extensions while
   * reserving the possibility of making non-breaking feature additions
   * when disconnecting at some point in the future.
   * @category lifecycle
   */
  disconnectedCallback() {
    this.__controllers?.forEach((e) => e.hostDisconnected?.());
  }
  /**
   * Synchronizes property values when attributes change.
   *
   * Specifically, when an attribute is set, the corresponding property is set.
   * You should rarely need to implement this callback. If this method is
   * overridden, `super.attributeChangedCallback(name, _old, value)` must be
   * called.
   *
   * See [responding to attribute changes](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
   * on MDN for more information about the `attributeChangedCallback`.
   * @category attributes
   */
  attributeChangedCallback(e, t, s) {
    this._$attributeToProperty(e, s);
  }
  __propertyToAttribute(e, t) {
    const n = this.constructor.elementProperties.get(e), r = this.constructor.__attributeNameForProperty(e, n);
    if (r !== void 0 && n.reflect === !0) {
      const l = (n.converter?.toAttribute !== void 0 ? n.converter : q).toAttribute(t, n.type);
      this.constructor.enabledWarnings.includes("migration") && l === void 0 && $("undefined-attribute-value", `The attribute value for the ${e} property is undefined on element ${this.localName}. The attribute will be removed, but in the previous version of \`ReactiveElement\`, the attribute would not have changed.`), this.__reflectingProperty = e, l == null ? this.removeAttribute(r) : this.setAttribute(r, l), this.__reflectingProperty = null;
    }
  }
  /** @internal */
  _$attributeToProperty(e, t) {
    const s = this.constructor, n = s.__attributeToPropertyMap.get(e);
    if (n !== void 0 && this.__reflectingProperty !== n) {
      const r = s.getPropertyOptions(n), o = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : q;
      this.__reflectingProperty = n;
      const l = o.fromAttribute(t, r.type);
      this[n] = l ?? this.__defaultValues?.get(n) ?? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      l, this.__reflectingProperty = null;
    }
  }
  /**
   * Requests an update which is processed asynchronously. This should be called
   * when an element should update based on some state not triggered by setting
   * a reactive property. In this case, pass no arguments. It should also be
   * called when manually implementing a property setter. In this case, pass the
   * property `name` and `oldValue` to ensure that any configured property
   * options are honored.
   *
   * @param name name of requesting property
   * @param oldValue old value of requesting property
   * @param options property options to use instead of the previously
   *     configured options
   * @category updates
   */
  requestUpdate(e, t, s) {
    if (e !== void 0) {
      e instanceof Event && $("", "The requestUpdate() method was called with an Event as the property name. This is probably a mistake caused by binding this.requestUpdate as an event listener. Instead bind a function that will call it with no arguments: () => this.requestUpdate()");
      const n = this.constructor, r = this[e];
      if (s ??= n.getPropertyOptions(e), (s.hasChanged ?? re)(r, t) || // When there is no change, check a corner case that can occur when
      // 1. there's a initial value which was not reflected
      // 2. the property is subsequently set to this value.
      // For example, `prop: {useDefault: true, reflect: true}`
      // and el.prop = 'foo'. This should be considered a change if the
      // attribute is not set because we will now reflect the property to the attribute.
      s.useDefault && s.reflect && r === this.__defaultValues?.get(e) && !this.hasAttribute(n.__attributeNameForProperty(e, s)))
        this._$changeProperty(e, t, s);
      else
        return;
    }
    this.isUpdatePending === !1 && (this.__updatePromise = this.__enqueueUpdate());
  }
  /**
   * @internal
   */
  _$changeProperty(e, t, { useDefault: s, reflect: n, wrapped: r }, o) {
    s && !(this.__defaultValues ??= /* @__PURE__ */ new Map()).has(e) && (this.__defaultValues.set(e, o ?? t ?? this[e]), r !== !0 || o !== void 0) || (this._$changedProperties.has(e) || (!this.hasUpdated && !s && (t = void 0), this._$changedProperties.set(e, t)), n === !0 && this.__reflectingProperty !== e && (this.__reflectingProperties ??= /* @__PURE__ */ new Set()).add(e));
  }
  /**
   * Sets up the element to asynchronously update.
   */
  async __enqueueUpdate() {
    this.isUpdatePending = !0;
    try {
      await this.__updatePromise;
    } catch (t) {
      Promise.reject(t);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  /**
   * Schedules an element update. You can override this method to change the
   * timing of updates by returning a Promise. The update will await the
   * returned Promise, and you should resolve the Promise to allow the update
   * to proceed. If this method is overridden, `super.scheduleUpdate()`
   * must be called.
   *
   * For instance, to schedule updates to occur just before the next frame:
   *
   * ```ts
   * override protected async scheduleUpdate(): Promise<unknown> {
   *   await new Promise((resolve) => requestAnimationFrame(() => resolve()));
   *   super.scheduleUpdate();
   * }
   * ```
   * @category updates
   */
  scheduleUpdate() {
    const e = this.performUpdate();
    return this.constructor.enabledWarnings.includes("async-perform-update") && typeof e?.then == "function" && $("async-perform-update", `Element ${this.localName} returned a Promise from performUpdate(). This behavior is deprecated and will be removed in a future version of ReactiveElement.`), e;
  }
  /**
   * Performs an element update. Note, if an exception is thrown during the
   * update, `firstUpdated` and `updated` will not be called.
   *
   * Call `performUpdate()` to immediately process a pending update. This should
   * generally not be needed, but it can be done in rare cases when you need to
   * update synchronously.
   *
   * @category updates
   */
  performUpdate() {
    if (!this.isUpdatePending)
      return;
    if (ot?.({ kind: "update" }), !this.hasUpdated) {
      this.renderRoot ??= this.createRenderRoot();
      {
        const r = [...this.constructor.elementProperties.keys()].filter((o) => this.hasOwnProperty(o) && o in Se(this));
        if (r.length)
          throw new Error(`The following properties on element ${this.localName} will not trigger updates as expected because they are set using class fields: ${r.join(", ")}. Native class fields and some compiled output will overwrite accessors used for detecting changes. See https://lit.dev/msg/class-field-shadowing for more information.`);
      }
      if (this.__instanceProperties) {
        for (const [n, r] of this.__instanceProperties)
          this[n] = r;
        this.__instanceProperties = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0)
        for (const [n, r] of s) {
          const { wrapped: o } = r, l = this[n];
          o === !0 && !this._$changedProperties.has(n) && l !== void 0 && this._$changeProperty(n, void 0, r, l);
        }
    }
    let e = !1;
    const t = this._$changedProperties;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), this.__controllers?.forEach((s) => s.hostUpdate?.()), this.update(t)) : this.__markUpdated();
    } catch (s) {
      throw e = !1, this.__markUpdated(), s;
    }
    e && this._$didUpdate(t);
  }
  /**
   * Invoked before `update()` to compute values needed during the update.
   *
   * Implement `willUpdate` to compute property values that depend on other
   * properties and are used in the rest of the update process.
   *
   * ```ts
   * willUpdate(changedProperties) {
   *   // only need to check changed properties for an expensive computation.
   *   if (changedProperties.has('firstName') || changedProperties.has('lastName')) {
   *     this.sha = computeSHA(`${this.firstName} ${this.lastName}`);
   *   }
   * }
   *
   * render() {
   *   return html`SHA: ${this.sha}`;
   * }
   * ```
   *
   * @category updates
   */
  willUpdate(e) {
  }
  // Note, this is an override point for polyfill-support.
  // @internal
  _$didUpdate(e) {
    this.__controllers?.forEach((t) => t.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e), this.isUpdatePending && this.constructor.enabledWarnings.includes("change-in-update") && $("change-in-update", `Element ${this.localName} scheduled an update (generally because a property was set) after an update completed, causing a new update to be scheduled. This is inefficient and should be avoided unless the next update can only be scheduled as a side effect of the previous update.`);
  }
  __markUpdated() {
    this._$changedProperties = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  /**
   * Returns a Promise that resolves when the element has completed updating.
   * The Promise value is a boolean that is `true` if the element completed the
   * update without triggering another update. The Promise result is `false` if
   * a property was set inside `updated()`. If the Promise is rejected, an
   * exception was thrown during the update.
   *
   * To await additional asynchronous work, override the `getUpdateComplete`
   * method. For example, it is sometimes useful to await a rendered element
   * before fulfilling this Promise. To do this, first await
   * `super.getUpdateComplete()`, then any subsequent state.
   *
   * @return A promise of a boolean that resolves to true if the update completed
   *     without triggering another update.
   * @category updates
   */
  get updateComplete() {
    return this.getUpdateComplete();
  }
  /**
   * Override point for the `updateComplete` promise.
   *
   * It is not safe to override the `updateComplete` getter directly due to a
   * limitation in TypeScript which means it is not possible to call a
   * superclass getter (e.g. `super.updateComplete.then(...)`) when the target
   * language is ES5 (https://github.com/microsoft/TypeScript/issues/338).
   * This method should be overridden instead. For example:
   *
   * ```ts
   * class MyElement extends LitElement {
   *   override async getUpdateComplete() {
   *     const result = await super.getUpdateComplete();
   *     await this._myChild.updateComplete;
   *     return result;
   *   }
   * }
   * ```
   *
   * @return A promise of a boolean that resolves to true if the update completed
   *     without triggering another update.
   * @category updates
   */
  getUpdateComplete() {
    return this.__updatePromise;
  }
  /**
   * Controls whether or not `update()` should be called when the element requests
   * an update. By default, this method always returns `true`, but this can be
   * customized to control when to update.
   *
   * @param _changedProperties Map of changed properties with old values
   * @category updates
   */
  shouldUpdate(e) {
    return !0;
  }
  /**
   * Updates the element. This method reflects property values to attributes.
   * It can be overridden to render and keep updated element DOM.
   * Setting properties inside this method will *not* trigger
   * another update.
   *
   * @param _changedProperties Map of changed properties with old values
   * @category updates
   */
  update(e) {
    this.__reflectingProperties &&= this.__reflectingProperties.forEach((t) => this.__propertyToAttribute(t, this[t])), this.__markUpdated();
  }
  /**
   * Invoked whenever the element is updated. Implement to perform
   * post-updating tasks via DOM APIs, for example, focusing an element.
   *
   * Setting properties inside this method will trigger the element to update
   * again after this update cycle completes.
   *
   * @param _changedProperties Map of changed properties with old values
   * @category updates
   */
  updated(e) {
  }
  /**
   * Invoked when the element is first updated. Implement to perform one time
   * work on the element after update.
   *
   * ```ts
   * firstUpdated() {
   *   this.renderRoot.getElementById('my-text-area').focus();
   * }
   * ```
   *
   * Setting properties inside this method will trigger the element to update
   * again after this update cycle completes.
   *
   * @param _changedProperties Map of changed properties with old values
   * @category updates
   */
  firstUpdated(e) {
  }
}
S.elementStyles = [];
S.shadowRootOptions = { mode: "open" };
S[R("elementProperties")] = /* @__PURE__ */ new Map();
S[R("finalized")] = /* @__PURE__ */ new Map();
ke?.({ ReactiveElement: S });
{
  S.enabledWarnings = [
    "change-in-update",
    "async-perform-update"
  ];
  const i = function(e) {
    e.hasOwnProperty(R("enabledWarnings")) || (e.enabledWarnings = e.enabledWarnings.slice());
  };
  S.enableWarning = function(e) {
    i(this), this.enabledWarnings.includes(e) || this.enabledWarnings.push(e);
  }, S.disableWarning = function(e) {
    i(this);
    const t = this.enabledWarnings.indexOf(e);
    t >= 0 && this.enabledWarnings.splice(t, 1);
  };
}
(g.reactiveElementVersions ??= []).push("2.1.1");
g.reactiveElementVersions.length > 1 && queueMicrotask(() => {
  $("multiple-versions", "Multiple versions of Lit loaded. Loading multiple versions is not recommended.");
});
const _ = globalThis, d = (i) => {
  _.emitLitDebugLogEvents && _.dispatchEvent(new CustomEvent("lit-debug", {
    detail: i
  }));
};
let at = 0, k;
_.litIssuedWarnings ??= /* @__PURE__ */ new Set(), k = (i, e) => {
  e += i ? ` See https://lit.dev/msg/${i} for more information.` : "", !_.litIssuedWarnings.has(e) && !_.litIssuedWarnings.has(i) && (console.warn(e), _.litIssuedWarnings.add(e));
}, queueMicrotask(() => {
  k("dev-mode", "Lit is in dev mode. Not recommended for production!");
});
const y = _.ShadyDOM?.inUse && _.ShadyDOM?.noPatch === !0 ? _.ShadyDOM.wrap : (i) => i, H = _.trustedTypes, Te = H ? H.createPolicy("lit-html", {
  createHTML: (i) => i
}) : void 0, lt = (i) => i, Q = (i, e, t) => lt, dt = (i) => {
  if (x !== Q)
    throw new Error("Attempted to overwrite existing lit-html security policy. setSanitizeDOMValueFactory should be called at most once.");
  x = i;
}, ct = () => {
  x = Q;
}, ie = (i, e, t) => x(i, e, t), oe = "$lit$", b = `lit$${Math.random().toFixed(9).slice(2)}$`, ae = "?" + b, ht = `<${ae}>`, C = document, U = () => C.createComment(""), V = (i) => i === null || typeof i != "object" && typeof i != "function", le = Array.isArray, Ue = (i) => le(i) || // eslint-disable-next-line @typescript-eslint/no-explicit-any
typeof i?.[Symbol.iterator] == "function", Z = `[ 	
\f\r]`, ut = `[^ 	
\f\r"'\`<>=]`, pt = `[^\\s"'>=/]`, A = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ee = 1, K = 2, ft = 3, Ce = /-->/g, xe = />/g, T = new RegExp(`>|${Z}(?:(${pt}+)(${Z}*=${Z}*(?:${ut}|("|')|))|$)`, "g"), mt = 0, Ne = 1, _t = 2, Re = 3, X = /'/g, ee = /"/g, Ve = /^(?:script|style|textarea|title)$/i, De = 1, F = 2, j = 3, de = 1, B = 2, gt = 3, yt = 4, $t = 5, ce = 6, bt = 7, he = (i) => (e, ...t) => (e.some((s) => s === void 0) && console.warn(`Some template strings are undefined.
This is probably caused by illegal octal escape sequences.`), t.some((s) => s?._$litStatic$) && k("", `Static values 'literal' or 'unsafeStatic' cannot be used as values to non-static templates.
Please use the static 'html' tag function. See https://lit.dev/docs/templates/expressions/#static-expressions`), {
  // This property needs to remain unminified.
  _$litType$: i,
  strings: e,
  values: t
}), St = he(De), Pt = he(F), wt = he(j), w = Symbol.for("lit-noChange"), u = Symbol.for("lit-nothing"), ve = /* @__PURE__ */ new WeakMap(), E = C.createTreeWalker(
  C,
  129
  /* NodeFilter.SHOW_{ELEMENT|COMMENT} */
);
let x = Q;
function Oe(i, e) {
  if (!le(i) || !i.hasOwnProperty("raw")) {
    let t = "invalid template strings array";
    throw t = `
          Internal Error: expected template strings to be an array
          with a 'raw' field. Faking a template strings array by
          calling html or svg like an ordinary function is effectively
          the same as calling unsafeHtml and can lead to major security
          issues, e.g. opening your code up to XSS attacks.
          If you're using the html or svg tagged template functions normally
          and still seeing this error, please file a bug at
          https://github.com/lit/lit/issues/new?template=bug_report.md
          and include information about your build tooling, if any.
        `.trim().replace(/\n */g, `
`), new Error(t);
  }
  return Te !== void 0 ? Te.createHTML(e) : e;
}
const Ie = (i, e) => {
  const t = i.length - 1, s = [];
  let n = e === F ? "<svg>" : e === j ? "<math>" : "", r, o = A;
  for (let a = 0; a < t; a++) {
    const c = i[a];
    let m = -1, h, f = 0, p;
    for (; f < c.length && (o.lastIndex = f, p = o.exec(c), p !== null); )
      if (f = o.lastIndex, o === A) {
        if (p[Ee] === "!--")
          o = Ce;
        else if (p[Ee] !== void 0)
          o = xe;
        else if (p[K] !== void 0)
          Ve.test(p[K]) && (r = new RegExp(`</${p[K]}`, "g")), o = T;
        else if (p[ft] !== void 0)
          throw new Error("Bindings in tag names are not supported. Please use static templates instead. See https://lit.dev/docs/templates/expressions/#static-expressions");
      } else o === T ? p[mt] === ">" ? (o = r ?? A, m = -1) : p[Ne] === void 0 ? m = -2 : (m = o.lastIndex - p[_t].length, h = p[Ne], o = p[Re] === void 0 ? T : p[Re] === '"' ? ee : X) : o === ee || o === X ? o = T : o === Ce || o === xe ? o = A : (o = T, r = void 0);
    console.assert(m === -1 || o === T || o === X || o === ee, "unexpected parse state B");
    const I = o === T && i[a + 1].startsWith("/>") ? " " : "";
    n += o === A ? c + ht : m >= 0 ? (s.push(h), c.slice(0, m) + oe + c.slice(m) + b + I) : c + b + (m === -2 ? a : I);
  }
  const l = n + (i[t] || "<?>") + (e === F ? "</svg>" : e === j ? "</math>" : "");
  return [Oe(i, l), s];
};
class D {
  constructor({ strings: e, ["_$litType$"]: t }, s) {
    this.parts = [];
    let n, r = 0, o = 0;
    const l = e.length - 1, a = this.parts, [c, m] = Ie(e, t);
    if (this.el = D.createElement(c, s), E.currentNode = this.el.content, t === F || t === j) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (n = E.nextNode()) !== null && a.length < l; ) {
      if (n.nodeType === 1) {
        {
          const h = n.localName;
          if (/^(?:textarea|template)$/i.test(h) && n.innerHTML.includes(b)) {
            const f = `Expressions are not supported inside \`${h}\` elements. See https://lit.dev/msg/expression-in-${h} for more information.`;
            if (h === "template")
              throw new Error(f);
            k("", f);
          }
        }
        if (n.hasAttributes())
          for (const h of n.getAttributeNames())
            if (h.endsWith(oe)) {
              const f = m[o++], I = n.getAttribute(h).split(b), z = /([.?@])?(.*)/.exec(f);
              a.push({
                type: de,
                index: r,
                name: z[2],
                strings: I,
                ctor: z[1] === "." ? Le : z[1] === "?" ? qe : z[1] === "@" ? He : O
              }), n.removeAttribute(h);
            } else h.startsWith(b) && (a.push({
              type: ce,
              index: r
            }), n.removeAttribute(h));
        if (Ve.test(n.tagName)) {
          const h = n.textContent.split(b), f = h.length - 1;
          if (f > 0) {
            n.textContent = H ? H.emptyScript : "";
            for (let p = 0; p < f; p++)
              n.append(h[p], U()), E.nextNode(), a.push({ type: B, index: ++r });
            n.append(h[f], U());
          }
        }
      } else if (n.nodeType === 8)
        if (n.data === ae)
          a.push({ type: B, index: r });
        else {
          let f = -1;
          for (; (f = n.data.indexOf(b, f + 1)) !== -1; )
            a.push({ type: bt, index: r }), f += b.length - 1;
        }
      r++;
    }
    if (m.length !== o)
      throw new Error('Detected duplicate attribute bindings. This occurs if your template has duplicate attributes on an element tag. For example "<input ?disabled=${true} ?disabled=${false}>" contains a duplicate "disabled" attribute. The error was detected in the following template: \n`' + e.join("${...}") + "`");
    d && d({
      kind: "template prep",
      template: this,
      clonableTemplate: this.el,
      parts: this.parts,
      strings: e
    });
  }
  // Overridden via `litHtmlPolyfillSupport` to provide platform support.
  /** @nocollapse */
  static createElement(e, t) {
    const s = C.createElement("template");
    return s.innerHTML = e, s;
  }
}
function N(i, e, t = i, s) {
  if (e === w)
    return e;
  let n = s !== void 0 ? t.__directives?.[s] : t.__directive;
  const r = V(e) ? void 0 : (
    // This property needs to remain unminified.
    e._$litDirective$
  );
  return n?.constructor !== r && (n?._$notifyDirectiveConnectionChanged?.(!1), r === void 0 ? n = void 0 : (n = new r(i), n._$initialize(i, t, s)), s !== void 0 ? (t.__directives ??= [])[s] = n : t.__directive = n), n !== void 0 && (e = N(i, n._$resolve(i, e.values), n, s)), e;
}
class ze {
  constructor(e, t) {
    this._$parts = [], this._$disconnectableChildren = void 0, this._$template = e, this._$parent = t;
  }
  // Called by ChildPart parentNode getter
  get parentNode() {
    return this._$parent.parentNode;
  }
  // See comment in Disconnectable interface for why this is a getter
  get _$isConnected() {
    return this._$parent._$isConnected;
  }
  // This method is separate from the constructor because we need to return a
  // DocumentFragment and we don't want to hold onto it with an instance field.
  _clone(e) {
    const { el: { content: t }, parts: s } = this._$template, n = (e?.creationScope ?? C).importNode(t, !0);
    E.currentNode = n;
    let r = E.nextNode(), o = 0, l = 0, a = s[0];
    for (; a !== void 0; ) {
      if (o === a.index) {
        let c;
        a.type === B ? c = new Y(r, r.nextSibling, this, e) : a.type === de ? c = new a.ctor(r, a.name, a.strings, this, e) : a.type === ce && (c = new Fe(r, this, e)), this._$parts.push(c), a = s[++l];
      }
      o !== a?.index && (r = E.nextNode(), o++);
    }
    return E.currentNode = C, n;
  }
  _update(e) {
    let t = 0;
    for (const s of this._$parts)
      s !== void 0 && (d && d({
        kind: "set part",
        part: s,
        value: e[t],
        valueIndex: t,
        values: e,
        templateInstance: this
      }), s.strings !== void 0 ? (s._$setValue(e, s, t), t += s.strings.length - 2) : s._$setValue(e[t])), t++;
  }
}
let Y = class We {
  // See comment in Disconnectable interface for why this is a getter
  get _$isConnected() {
    return this._$parent?._$isConnected ?? this.__isConnected;
  }
  constructor(e, t, s, n) {
    this.type = B, this._$committedValue = u, this._$disconnectableChildren = void 0, this._$startNode = e, this._$endNode = t, this._$parent = s, this.options = n, this.__isConnected = n?.isConnected ?? !0, this._textSanitizer = void 0;
  }
  /**
   * The parent node into which the part renders its content.
   *
   * A ChildPart's content consists of a range of adjacent child nodes of
   * `.parentNode`, possibly bordered by 'marker nodes' (`.startNode` and
   * `.endNode`).
   *
   * - If both `.startNode` and `.endNode` are non-null, then the part's content
   * consists of all siblings between `.startNode` and `.endNode`, exclusively.
   *
   * - If `.startNode` is non-null but `.endNode` is null, then the part's
   * content consists of all siblings following `.startNode`, up to and
   * including the last child of `.parentNode`. If `.endNode` is non-null, then
   * `.startNode` will always be non-null.
   *
   * - If both `.endNode` and `.startNode` are null, then the part's content
   * consists of all child nodes of `.parentNode`.
   */
  get parentNode() {
    let e = y(this._$startNode).parentNode;
    const t = this._$parent;
    return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
  }
  /**
   * The part's leading marker node, if any. See `.parentNode` for more
   * information.
   */
  get startNode() {
    return this._$startNode;
  }
  /**
   * The part's trailing marker node, if any. See `.parentNode` for more
   * information.
   */
  get endNode() {
    return this._$endNode;
  }
  _$setValue(e, t = this) {
    if (this.parentNode === null)
      throw new Error("This `ChildPart` has no `parentNode` and therefore cannot accept a value. This likely means the element containing the part was manipulated in an unsupported way outside of Lit's control such that the part's marker nodes were ejected from DOM. For example, setting the element's `innerHTML` or `textContent` can do this.");
    if (e = N(this, e, t), V(e))
      e === u || e == null || e === "" ? (this._$committedValue !== u && (d && d({
        kind: "commit nothing to child",
        start: this._$startNode,
        end: this._$endNode,
        parent: this._$parent,
        options: this.options
      }), this._$clear()), this._$committedValue = u) : e !== this._$committedValue && e !== w && this._commitText(e);
    else if (e._$litType$ !== void 0)
      this._commitTemplateResult(e);
    else if (e.nodeType !== void 0) {
      if (this.options?.host === e) {
        this._commitText("[probable mistake: rendered a template's host in itself (commonly caused by writing ${this} in a template]"), console.warn("Attempted to render the template host", e, "inside itself. This is almost always a mistake, and in dev mode ", "we render some warning text. In production however, we'll ", "render it, which will usually result in an error, and sometimes ", "in the element disappearing from the DOM.");
        return;
      }
      this._commitNode(e);
    } else Ue(e) ? this._commitIterable(e) : this._commitText(e);
  }
  _insert(e) {
    return y(y(this._$startNode).parentNode).insertBefore(e, this._$endNode);
  }
  _commitNode(e) {
    if (this._$committedValue !== e) {
      if (this._$clear(), x !== Q) {
        const t = this._$startNode.parentNode?.nodeName;
        if (t === "STYLE" || t === "SCRIPT") {
          let s = "Forbidden";
          throw t === "STYLE" ? s = "Lit does not support binding inside style nodes. This is a security risk, as style injection attacks can exfiltrate data and spoof UIs. Consider instead using css`...` literals to compose styles, and do dynamic styling with css custom properties, ::parts, <slot>s, and by mutating the DOM rather than stylesheets." : s = "Lit does not support binding inside script nodes. This is a security risk, as it could allow arbitrary code execution.", new Error(s);
        }
      }
      d && d({
        kind: "commit node",
        start: this._$startNode,
        parent: this._$parent,
        value: e,
        options: this.options
      }), this._$committedValue = this._insert(e);
    }
  }
  _commitText(e) {
    if (this._$committedValue !== u && V(this._$committedValue)) {
      const t = y(this._$startNode).nextSibling;
      this._textSanitizer === void 0 && (this._textSanitizer = ie(t, "data", "property")), e = this._textSanitizer(e), d && d({
        kind: "commit text",
        node: t,
        value: e,
        options: this.options
      }), t.data = e;
    } else {
      const t = C.createTextNode("");
      this._commitNode(t), this._textSanitizer === void 0 && (this._textSanitizer = ie(t, "data", "property")), e = this._textSanitizer(e), d && d({
        kind: "commit text",
        node: t,
        value: e,
        options: this.options
      }), t.data = e;
    }
    this._$committedValue = e;
  }
  _commitTemplateResult(e) {
    const { values: t, ["_$litType$"]: s } = e, n = typeof s == "number" ? this._$getTemplate(e) : (s.el === void 0 && (s.el = D.createElement(Oe(s.h, s.h[0]), this.options)), s);
    if (this._$committedValue?._$template === n)
      d && d({
        kind: "template updating",
        template: n,
        instance: this._$committedValue,
        parts: this._$committedValue._$parts,
        options: this.options,
        values: t
      }), this._$committedValue._update(t);
    else {
      const r = new ze(n, this), o = r._clone(this.options);
      d && d({
        kind: "template instantiated",
        template: n,
        instance: r,
        parts: r._$parts,
        options: this.options,
        fragment: o,
        values: t
      }), r._update(t), d && d({
        kind: "template instantiated and updated",
        template: n,
        instance: r,
        parts: r._$parts,
        options: this.options,
        fragment: o,
        values: t
      }), this._commitNode(o), this._$committedValue = r;
    }
  }
  // Overridden via `litHtmlPolyfillSupport` to provide platform support.
  /** @internal */
  _$getTemplate(e) {
    let t = ve.get(e.strings);
    return t === void 0 && ve.set(e.strings, t = new D(e)), t;
  }
  _commitIterable(e) {
    le(this._$committedValue) || (this._$committedValue = [], this._$clear());
    const t = this._$committedValue;
    let s = 0, n;
    for (const r of e)
      s === t.length ? t.push(n = new We(this._insert(U()), this._insert(U()), this, this.options)) : n = t[s], n._$setValue(r), s++;
    s < t.length && (this._$clear(n && y(n._$endNode).nextSibling, s), t.length = s);
  }
  /**
   * Removes the nodes contained within this Part from the DOM.
   *
   * @param start Start node to clear from, for clearing a subset of the part's
   *     DOM (used when truncating iterables)
   * @param from  When `start` is specified, the index within the iterable from
   *     which ChildParts are being removed, used for disconnecting directives
   *     in those Parts.
   *
   * @internal
   */
  _$clear(e = y(this._$startNode).nextSibling, t) {
    for (this._$notifyConnectionChanged?.(!1, !0, t); e !== this._$endNode; ) {
      const s = y(e).nextSibling;
      y(e).remove(), e = s;
    }
  }
  /**
   * Implementation of RootPart's `isConnected`. Note that this method
   * should only be called on `RootPart`s (the `ChildPart` returned from a
   * top-level `render()` call). It has no effect on non-root ChildParts.
   * @param isConnected Whether to set
   * @internal
   */
  setConnected(e) {
    if (this._$parent === void 0)
      this.__isConnected = e, this._$notifyConnectionChanged?.(e);
    else
      throw new Error("part.setConnected() may only be called on a RootPart returned from render().");
  }
};
class O {
  get tagName() {
    return this.element.tagName;
  }
  // See comment in Disconnectable interface for why this is a getter
  get _$isConnected() {
    return this._$parent._$isConnected;
  }
  constructor(e, t, s, n, r) {
    this.type = de, this._$committedValue = u, this._$disconnectableChildren = void 0, this.element = e, this.name = t, this._$parent = n, this.options = r, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$committedValue = new Array(s.length - 1).fill(new String()), this.strings = s) : this._$committedValue = u, this._sanitizer = void 0;
  }
  /**
   * Sets the value of this part by resolving the value from possibly multiple
   * values and static strings and committing it to the DOM.
   * If this part is single-valued, `this._strings` will be undefined, and the
   * method will be called with a single value argument. If this part is
   * multi-value, `this._strings` will be defined, and the method is called
   * with the value array of the part's owning TemplateInstance, and an offset
   * into the value array from which the values should be read.
   * This method is overloaded this way to eliminate short-lived array slices
   * of the template instance values, and allow a fast-path for single-valued
   * parts.
   *
   * @param value The part value, or an array of values for multi-valued parts
   * @param valueIndex the index to start reading values from. `undefined` for
   *   single-valued parts
   * @param noCommit causes the part to not commit its value to the DOM. Used
   *   in hydration to prime attribute parts with their first-rendered value,
   *   but not set the attribute, and in SSR to no-op the DOM operation and
   *   capture the value for serialization.
   *
   * @internal
   */
  _$setValue(e, t = this, s, n) {
    const r = this.strings;
    let o = !1;
    if (r === void 0)
      e = N(this, e, t, 0), o = !V(e) || e !== this._$committedValue && e !== w, o && (this._$committedValue = e);
    else {
      const l = e;
      e = r[0];
      let a, c;
      for (a = 0; a < r.length - 1; a++)
        c = N(this, l[s + a], t, a), c === w && (c = this._$committedValue[a]), o ||= !V(c) || c !== this._$committedValue[a], c === u ? e = u : e !== u && (e += (c ?? "") + r[a + 1]), this._$committedValue[a] = c;
    }
    o && !n && this._commitValue(e);
  }
  /** @internal */
  _commitValue(e) {
    e === u ? y(this.element).removeAttribute(this.name) : (this._sanitizer === void 0 && (this._sanitizer = x(this.element, this.name, "attribute")), e = this._sanitizer(e ?? ""), d && d({
      kind: "commit attribute",
      element: this.element,
      name: this.name,
      value: e,
      options: this.options
    }), y(this.element).setAttribute(this.name, e ?? ""));
  }
}
class Le extends O {
  constructor() {
    super(...arguments), this.type = gt;
  }
  /** @internal */
  _commitValue(e) {
    this._sanitizer === void 0 && (this._sanitizer = x(this.element, this.name, "property")), e = this._sanitizer(e), d && d({
      kind: "commit property",
      element: this.element,
      name: this.name,
      value: e,
      options: this.options
    }), this.element[this.name] = e === u ? void 0 : e;
  }
}
class qe extends O {
  constructor() {
    super(...arguments), this.type = yt;
  }
  /** @internal */
  _commitValue(e) {
    d && d({
      kind: "commit boolean attribute",
      element: this.element,
      name: this.name,
      value: !!(e && e !== u),
      options: this.options
    }), y(this.element).toggleAttribute(this.name, !!e && e !== u);
  }
}
class He extends O {
  constructor(e, t, s, n, r) {
    if (super(e, t, s, n, r), this.type = $t, this.strings !== void 0)
      throw new Error(`A \`<${e.localName}>\` has a \`@${t}=...\` listener with invalid content. Event listeners in templates must have exactly one expression and no surrounding text.`);
  }
  // EventPart does not use the base _$setValue/_resolveValue implementation
  // since the dirty checking is more complex
  /** @internal */
  _$setValue(e, t = this) {
    if (e = N(this, e, t, 0) ?? u, e === w)
      return;
    const s = this._$committedValue, n = e === u && s !== u || e.capture !== s.capture || e.once !== s.once || e.passive !== s.passive, r = e !== u && (s === u || n);
    d && d({
      kind: "commit event listener",
      element: this.element,
      name: this.name,
      value: e,
      options: this.options,
      removeListener: n,
      addListener: r,
      oldListener: s
    }), n && this.element.removeEventListener(this.name, this, s), r && this.element.addEventListener(this.name, this, e), this._$committedValue = e;
  }
  handleEvent(e) {
    typeof this._$committedValue == "function" ? this._$committedValue.call(this.options?.host ?? this.element, e) : this._$committedValue.handleEvent(e);
  }
}
class Fe {
  constructor(e, t, s) {
    this.element = e, this.type = ce, this._$disconnectableChildren = void 0, this._$parent = t, this.options = s;
  }
  // See comment in Disconnectable interface for why this is a getter
  get _$isConnected() {
    return this._$parent._$isConnected;
  }
  _$setValue(e) {
    d && d({
      kind: "commit to element binding",
      element: this.element,
      value: e,
      options: this.options
    }), N(this, e);
  }
}
const Tt = {
  // Used in lit-ssr
  _boundAttributeSuffix: oe,
  _marker: b,
  _markerMatch: ae,
  _HTML_RESULT: De,
  _getTemplateHtml: Ie,
  // Used in tests and private-ssr-support
  _TemplateInstance: ze,
  _isIterable: Ue,
  _resolveDirective: N,
  _ChildPart: Y,
  _AttributePart: O,
  _BooleanAttributePart: qe,
  _EventPart: He,
  _PropertyPart: Le,
  _ElementPart: Fe
}, Et = _.litHtmlPolyfillSupportDevMode;
Et?.(D, Y);
(_.litHtmlVersions ??= []).push("3.3.1");
_.litHtmlVersions.length > 1 && queueMicrotask(() => {
  k("multiple-versions", "Multiple versions of Lit loaded. Loading multiple versions is not recommended.");
});
const L = (i, e, t) => {
  if (e == null)
    throw new TypeError(`The container to render into may not be ${e}`);
  const s = at++, n = t?.renderBefore ?? e;
  let r = n._$litPart$;
  if (d && d({
    kind: "begin render",
    id: s,
    value: i,
    container: e,
    options: t,
    part: r
  }), r === void 0) {
    const o = t?.renderBefore ?? null;
    n._$litPart$ = r = new Y(e.insertBefore(U(), o), o, void 0, t ?? {});
  }
  return r._$setValue(i), d && d({
    kind: "end render",
    id: s,
    value: i,
    container: e,
    options: t,
    part: r
  }), r;
};
L.setSanitizer = dt, L.createSanitizer = ie, L._testOnlyClearSanitizerFactoryDoNotCallOrElse = ct;
const Ct = (i, e) => i, P = globalThis;
let je;
P.litIssuedWarnings ??= /* @__PURE__ */ new Set(), je = (i, e) => {
  e += ` See https://lit.dev/msg/${i} for more information.`, !P.litIssuedWarnings.has(e) && !P.litIssuedWarnings.has(i) && (console.warn(e), P.litIssuedWarnings.add(e));
};
class G extends S {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this.__childPart = void 0;
  }
  /**
   * @category rendering
   */
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  /**
   * Updates the element. This method reflects property values to attributes
   * and calls `render` to render DOM via lit-html. Setting properties inside
   * this method will *not* trigger another update.
   * @param changedProperties Map of changed properties with old values
   * @category updates
   */
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this.__childPart = L(t, this.renderRoot, this.renderOptions);
  }
  /**
   * Invoked when the component is added to the document's DOM.
   *
   * In `connectedCallback()` you should setup tasks that should only occur when
   * the element is connected to the document. The most common of these is
   * adding event listeners to nodes external to the element, like a keydown
   * event handler added to the window.
   *
   * ```ts
   * connectedCallback() {
   *   super.connectedCallback();
   *   addEventListener('keydown', this._handleKeydown);
   * }
   * ```
   *
   * Typically, anything done in `connectedCallback()` should be undone when the
   * element is disconnected, in `disconnectedCallback()`.
   *
   * @category lifecycle
   */
  connectedCallback() {
    super.connectedCallback(), this.__childPart?.setConnected(!0);
  }
  /**
   * Invoked when the component is removed from the document's DOM.
   *
   * This callback is the main signal to the element that it may no longer be
   * used. `disconnectedCallback()` should ensure that nothing is holding a
   * reference to the element (such as event listeners added to nodes external
   * to the element), so that it is free to be garbage collected.
   *
   * ```ts
   * disconnectedCallback() {
   *   super.disconnectedCallback();
   *   window.removeEventListener('keydown', this._handleKeydown);
   * }
   * ```
   *
   * An element may be re-connected after being disconnected.
   *
   * @category lifecycle
   */
  disconnectedCallback() {
    super.disconnectedCallback(), this.__childPart?.setConnected(!1);
  }
  /**
   * Invoked on each update to perform rendering tasks. This method may return
   * any value renderable by lit-html's `ChildPart` - typically a
   * `TemplateResult`. Setting properties inside this method will *not* trigger
   * the element to update.
   * @category rendering
   */
  render() {
    return w;
  }
}
G._$litElement$ = !0;
G[Ct("finalized")] = !0;
P.litElementHydrateSupport?.({ LitElement: G });
const xt = P.litElementPolyfillSupportDevMode;
xt?.({ LitElement: G });
const Jt = {
  _$attributeToProperty: (i, e, t) => {
    i._$attributeToProperty(e, t);
  },
  // eslint-disable-next-line
  _$changedProperties: (i) => i._$changedProperties
};
(P.litElementVersions ??= []).push("4.2.1");
P.litElementVersions.length > 1 && queueMicrotask(() => {
  je("multiple-versions", "Multiple versions of Lit loaded. Loading multiple versions is not recommended.");
});
const Nt = !1, Qt = Nt;
const ue = Symbol.for(""), Rt = (i) => {
  if (i?.r === ue)
    return i?._$litStatic$;
}, Yt = (i) => ({
  _$litStatic$: i,
  r: ue
}), vt = (i) => {
  if (i._$litStatic$ !== void 0)
    return i._$litStatic$;
  throw new Error(`Value passed to 'literal' function must be a 'literal' result: ${i}. Use 'unsafeStatic' to pass non-literal values, but
            take care to ensure page security.`);
}, Gt = (i, ...e) => ({
  _$litStatic$: e.reduce((t, s, n) => t + vt(s) + i[n + 1], i[0]),
  r: ue
}), Ae = /* @__PURE__ */ new Map(), pe = (i) => (e, ...t) => {
  const s = t.length;
  let n, r;
  const o = [], l = [];
  let a = 0, c = !1, m;
  for (; a < s; ) {
    for (m = e[a]; a < s && (r = t[a], (n = Rt(r)) !== void 0); )
      m += n + e[++a], c = !0;
    a !== s && l.push(r), o.push(m), a++;
  }
  if (a === s && o.push(e[s]), c) {
    const h = o.join("$$lit$$");
    e = Ae.get(h), e === void 0 && (o.raw = o, Ae.set(h, e = o)), t = l;
  }
  return i(e, ...t);
}, Zt = pe(St), Kt = pe(Pt), Xt = pe(wt);
const ei = (i) => (e, t) => {
  t !== void 0 ? t.addInitializer(() => {
    customElements.define(i, e);
  }) : customElements.define(i, e);
};
let Be;
globalThis.litIssuedWarnings ??= /* @__PURE__ */ new Set(), Be = (i, e) => {
  e += ` See https://lit.dev/msg/${i} for more information.`, !globalThis.litIssuedWarnings.has(e) && !globalThis.litIssuedWarnings.has(i) && (console.warn(e), globalThis.litIssuedWarnings.add(e));
};
const At = (i, e, t) => {
  const s = e.hasOwnProperty(t);
  return e.constructor.createProperty(t, i), s ? Object.getOwnPropertyDescriptor(e, t) : void 0;
}, Mt = {
  attribute: !0,
  type: String,
  converter: q,
  reflect: !1,
  hasChanged: re
}, kt = (i = Mt, e, t) => {
  const { kind: s, metadata: n } = t;
  n == null && Be("missing-class-metadata", `The class ${e} is missing decorator metadata. This could mean that you're using a compiler that supports decorators but doesn't support decorator metadata, such as TypeScript 5.1. Please update your compiler.`);
  let r = globalThis.litPropertyMetadata.get(n);
  if (r === void 0 && globalThis.litPropertyMetadata.set(n, r = /* @__PURE__ */ new Map()), s === "setter" && (i = Object.create(i), i.wrapped = !0), r.set(t.name, i), s === "accessor") {
    const { name: o } = t;
    return {
      set(l) {
        const a = e.get.call(this);
        e.set.call(this, l), this.requestUpdate(o, a, i);
      },
      init(l) {
        return l !== void 0 && this._$changeProperty(o, void 0, i, l), l;
      }
    };
  } else if (s === "setter") {
    const { name: o } = t;
    return function(l) {
      const a = this[o];
      e.call(this, l), this.requestUpdate(o, a, i);
    };
  }
  throw new Error(`Unsupported decorator location: ${s}`);
};
function Ut(i) {
  return (e, t) => typeof t == "object" ? kt(i, e, t) : At(i, e, t);
}
function ti(i) {
  return Ut({
    ...i,
    // Add both `state` and `attribute` because we found a third party
    // controller that is keying off of PropertyOptions.state to determine
    // whether a field is a private internal property or not.
    state: !0,
    attribute: !1
  });
}
function ii(i) {
  return ((e, t) => {
    const s = typeof e == "function" ? e : e[t];
    Object.assign(s, i);
  });
}
const v = (i, e, t) => (t.configurable = !0, t.enumerable = !0, // We check for Reflect.decorate each time, in case the zombiefill
// is applied via lazy loading some Angular code.
Reflect.decorate && typeof e != "object" && Object.defineProperty(i, e, t), t);
let Je;
globalThis.litIssuedWarnings ??= /* @__PURE__ */ new Set(), Je = (i, e) => {
  e += i ? ` See https://lit.dev/msg/${i} for more information.` : "", !globalThis.litIssuedWarnings.has(e) && !globalThis.litIssuedWarnings.has(i) && (console.warn(e), globalThis.litIssuedWarnings.add(e));
};
function si(i, e) {
  return ((t, s, n) => {
    const r = (o) => {
      const l = o.renderRoot?.querySelector(i) ?? null;
      if (l === null && e && !o.hasUpdated) {
        const a = typeof s == "object" ? s.name : s;
        Je("", `@query'd field ${JSON.stringify(String(a))} with the 'cache' flag set for selector '${i}' has been accessed before the first update and returned null. This is expected if the renderRoot tree has not been provided beforehand (e.g. via Declarative Shadow DOM). Therefore the value hasn't been cached.`);
      }
      return l;
    };
    if (e) {
      const { get: o, set: l } = typeof s == "object" ? t : n ?? (() => {
        const a = Symbol(`${String(s)} (@query() cache)`);
        return {
          get() {
            return this[a];
          },
          set(c) {
            this[a] = c;
          }
        };
      })();
      return v(t, s, {
        get() {
          let a = o.call(this);
          return a === void 0 && (a = r(this), (a !== null || this.hasUpdated) && l.call(this, a)), a;
        }
      });
    } else
      return v(t, s, {
        get() {
          return r(this);
        }
      });
  });
}
let Vt;
function ni(i) {
  return ((e, t) => v(e, t, {
    get() {
      return (this.renderRoot ?? (Vt ??= document.createDocumentFragment())).querySelectorAll(i);
    }
  }));
}
function ri(i) {
  return ((e, t) => v(e, t, {
    async get() {
      return await this.updateComplete, this.renderRoot?.querySelector(i) ?? null;
    }
  }));
}
function oi(i) {
  return ((e, t) => {
    const { slot: s, selector: n } = i ?? {}, r = `slot${s ? `[name=${s}]` : ":not([name])"}`;
    return v(e, t, {
      get() {
        const l = this.renderRoot?.querySelector(r)?.assignedElements(i) ?? [];
        return n === void 0 ? l : l.filter((a) => a.matches(n));
      }
    });
  });
}
function ai(i) {
  return ((e, t) => {
    const { slot: s } = i ?? {}, n = `slot${s ? `[name=${s}]` : ":not([name])"}`;
    return v(e, t, {
      get() {
        return this.renderRoot?.querySelector(n)?.assignedNodes(i) ?? [];
      }
    });
  });
}
const { _ChildPart: li } = Tt;
window.ShadyDOM?.inUse && window.ShadyDOM?.noPatch === !0 && window.ShadyDOM.wrap;
const Dt = (i) => i.strings === void 0;
const fe = {
  ATTRIBUTE: 1,
  CHILD: 2
}, me = (i) => (...e) => ({
  // This property needs to remain unminified.
  _$litDirective$: i,
  values: e
});
class _e {
  constructor(e) {
  }
  // See comment in Disconnectable interface for why this is a getter
  get _$isConnected() {
    return this._$parent._$isConnected;
  }
  /** @internal */
  _$initialize(e, t, s) {
    this.__part = e, this._$parent = t, this.__attributeIndex = s;
  }
  /** @internal */
  _$resolve(e, t) {
    return this.update(e, t);
  }
  update(e, t) {
    return this.render(...t);
  }
}
const M = (i, e) => {
  const t = i._$disconnectableChildren;
  if (t === void 0)
    return !1;
  for (const s of t)
    s._$notifyDirectiveConnectionChanged?.(e, !1), M(s, e);
  return !0;
}, J = (i) => {
  let e, t;
  do {
    if ((e = i._$parent) === void 0)
      break;
    t = e._$disconnectableChildren, t.delete(i), i = e;
  } while (t?.size === 0);
}, Qe = (i) => {
  for (let e; e = i._$parent; i = e) {
    let t = e._$disconnectableChildren;
    if (t === void 0)
      e._$disconnectableChildren = t = /* @__PURE__ */ new Set();
    else if (t.has(i))
      break;
    t.add(i), zt(e);
  }
};
function Ot(i) {
  this._$disconnectableChildren !== void 0 ? (J(this), this._$parent = i, Qe(this)) : this._$parent = i;
}
function It(i, e = !1, t = 0) {
  const s = this._$committedValue, n = this._$disconnectableChildren;
  if (!(n === void 0 || n.size === 0))
    if (e)
      if (Array.isArray(s))
        for (let r = t; r < s.length; r++)
          M(s[r], !1), J(s[r]);
      else s != null && (M(s, !1), J(s));
    else
      M(this, i);
}
const zt = (i) => {
  i.type == fe.CHILD && (i._$notifyConnectionChanged ??= It, i._$reparentDisconnectables ??= Ot);
};
class Wt extends _e {
  constructor() {
    super(...arguments), this._$disconnectableChildren = void 0;
  }
  /**
   * Initialize the part with internal fields
   * @param part
   * @param parent
   * @param attributeIndex
   */
  _$initialize(e, t, s) {
    super._$initialize(e, t, s), Qe(this), this.isConnected = e._$isConnected;
  }
  // This property needs to remain unminified.
  /**
   * Called from the core code when a directive is going away from a part (in
   * which case `shouldRemoveFromParent` should be true), and from the
   * `setChildrenConnected` helper function when recursively changing the
   * connection state of a tree (in which case `shouldRemoveFromParent` should
   * be false).
   *
   * @param isConnected
   * @param isClearingDirective - True when the directive itself is being
   *     removed; false when the tree is being disconnected
   * @internal
   */
  _$notifyDirectiveConnectionChanged(e, t = !0) {
    e !== this.isConnected && (this.isConnected = e, e ? this.reconnected?.() : this.disconnected?.()), t && (M(this, e), J(this));
  }
  /**
   * Sets the value of the directive's Part outside the normal `update`/`render`
   * lifecycle of a directive.
   *
   * This method should not be called synchronously from a directive's `update`
   * or `render`.
   *
   * @param directive The directive to update
   * @param value The value to set
   */
  setValue(e) {
    if (Dt(this.__part))
      this.__part._$setValue(e, this);
    else {
      if (this.__attributeIndex === void 0)
        throw new Error("Expected this.__attributeIndex to be a number");
      const t = [...this.__part._$committedValue];
      t[this.__attributeIndex] = e, this.__part._$setValue(t, this, 0);
    }
  }
  /**
   * User callbacks for implementing logic to release any resources/subscriptions
   * that may have been retained by this directive. Since directives may also be
   * re-connected, `reconnected` should also be implemented to restore the
   * working state of the directive prior to the next render.
   */
  disconnected() {
  }
  reconnected() {
  }
}
const di = () => new Lt();
class Lt {
}
const te = /* @__PURE__ */ new WeakMap();
class qt extends Wt {
  render(e) {
    return u;
  }
  update(e, [t]) {
    const s = t !== this._ref;
    return s && this._ref !== void 0 && this._updateRefValue(void 0), (s || this._lastElementForRef !== this._element) && (this._ref = t, this._context = e.options?.host, this._updateRefValue(this._element = e.element)), u;
  }
  _updateRefValue(e) {
    if (this.isConnected || (e = void 0), typeof this._ref == "function") {
      const t = this._context ?? globalThis;
      let s = te.get(t);
      s === void 0 && (s = /* @__PURE__ */ new WeakMap(), te.set(t, s)), s.get(this._ref) !== void 0 && this._ref.call(this._context, void 0), s.set(this._ref, e), e !== void 0 && this._ref.call(this._context, e);
    } else
      this._ref.value = e;
  }
  get _lastElementForRef() {
    return typeof this._ref == "function" ? te.get(this._context ?? globalThis)?.get(this._ref) : this._ref?.value;
  }
  disconnected() {
    this._lastElementForRef === this._element && this._updateRefValue(void 0);
  }
  reconnected() {
    this._updateRefValue(this._element);
  }
}
const ci = me(qt);
const hi = (i) => i ?? u;
const Ht = 1;
class ge extends _e {
  constructor(e) {
    if (super(e), this._value = u, e.type !== fe.CHILD)
      throw new Error(`${this.constructor.directiveName}() can only be used in child bindings`);
  }
  render(e) {
    if (e === u || e == null)
      return this._templateResult = void 0, this._value = e;
    if (e === w)
      return e;
    if (typeof e != "string")
      throw new Error(`${this.constructor.directiveName}() called with a non-string value`);
    if (e === this._value)
      return this._templateResult;
    this._value = e;
    const t = [e];
    return t.raw = t, this._templateResult = {
      // Cast to a known set of integers that satisfy ResultType so that we
      // don't have to export ResultType and possibly encourage this pattern.
      // This property needs to remain unminified.
      _$litType$: this.constructor.resultType,
      strings: t,
      values: []
    };
  }
}
ge.directiveName = "unsafeHTML";
ge.resultType = Ht;
const ui = me(ge);
const Ye = "important", Ge = " !" + Ye, Ft = 0 - Ge.length;
class jt extends _e {
  constructor(e) {
    if (super(e), e.type !== fe.ATTRIBUTE || e.name !== "style" || e.strings?.length > 2)
      throw new Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
  }
  render(e) {
    return Object.keys(e).reduce((t, s) => {
      const n = e[s];
      return n == null ? t : (s = s.includes("-") ? s : s.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase(), t + `${s}:${n};`);
    }, "");
  }
  update(e, [t]) {
    const { style: s } = e.element;
    if (this._previousStyleProperties === void 0)
      return this._previousStyleProperties = new Set(Object.keys(t)), this.render(t);
    for (const n of this._previousStyleProperties)
      t[n] == null && (this._previousStyleProperties.delete(n), n.includes("-") ? s.removeProperty(n) : s[n] = null);
    for (const n in t) {
      const r = t[n];
      if (r != null) {
        this._previousStyleProperties.add(n);
        const o = typeof r == "string" && r.endsWith(Ge);
        n.includes("-") || o ? s.setProperty(n, o ? r.slice(0, Ft) : r, o ? Ye : "") : s[n] = r;
      }
    }
    return w;
  }
}
const pi = me(jt);
export {
  Me as CSSResult,
  G as LitElement,
  S as ReactiveElement,
  ge as UnsafeHTMLDirective,
  Jt as _$LE,
  Tt as _$LH,
  Xe as adoptStyles,
  di as createRef,
  Bt as css,
  ei as customElement,
  q as defaultConverter,
  ii as eventOptions,
  $e as getCompatibleStyle,
  Zt as html,
  hi as ifDefined,
  Qt as isServer,
  Gt as literal,
  Xt as mathml,
  w as noChange,
  re as notEqual,
  u as nothing,
  Ut as property,
  si as query,
  ni as queryAll,
  oi as queryAssignedElements,
  ai as queryAssignedNodes,
  ri as queryAsync,
  ci as ref,
  L as render,
  kt as standardProperty,
  ti as state,
  pi as styleMap,
  se as supportsAdoptingStyleSheets,
  Kt as svg,
  Ke as unsafeCSS,
  ui as unsafeHTML,
  Yt as unsafeStatic,
  pe as withStatic
};
