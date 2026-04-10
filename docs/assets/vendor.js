const j = globalThis, F = j.ShadowRoot && (j.ShadyCSS === void 0 || j.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, J = Symbol(), ht = /* @__PURE__ */ new WeakMap();
let mt = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== J) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (F && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = ht.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && ht.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Ht = (s) => new mt(typeof s == "string" ? s : s + "", void 0, J), $e = (s, ...t) => {
  const e = s.length === 1 ? s[0] : t.reduce(((i, r, n) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + s[n + 1]), s[0]);
  return new mt(e, s, J);
}, Ot = (s, t) => {
  if (F) s.adoptedStyleSheets = t.map(((e) => e instanceof CSSStyleSheet ? e : e.styleSheet));
  else for (const e of t) {
    const i = document.createElement("style"), r = j.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = e.cssText, s.appendChild(i);
  }
}, at = F ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return Ht(e);
})(s) : s;
const { is: Nt, defineProperty: Rt, getOwnPropertyDescriptor: kt, getOwnPropertyNames: Lt, getOwnPropertySymbols: jt, getPrototypeOf: Dt } = Object, z = globalThis, lt = z.trustedTypes, It = lt ? lt.emptyScript : "", Bt = z.reactiveElementPolyfillSupport, T = (s, t) => s, I = { toAttribute(s, t) {
  switch (t) {
    case Boolean:
      s = s ? It : null;
      break;
    case Object:
    case Array:
      s = s == null ? s : JSON.stringify(s);
  }
  return s;
}, fromAttribute(s, t) {
  let e = s;
  switch (t) {
    case Boolean:
      e = s !== null;
      break;
    case Number:
      e = s === null ? null : Number(s);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(s);
      } catch {
        e = null;
      }
  }
  return e;
} }, Q = (s, t) => !Nt(s, t), ct = { attribute: !0, type: String, converter: I, reflect: !1, useDefault: !1, hasChanged: Q };
Symbol.metadata ??= Symbol("metadata"), z.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let E = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = ct) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(t, i, e);
      r !== void 0 && Rt(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    const { get: r, set: n } = kt(this.prototype, t) ?? { get() {
      return this[e];
    }, set(o) {
      this[e] = o;
    } };
    return { get: r, set(o) {
      const a = r?.call(this);
      n?.call(this, o), this.requestUpdate(t, a, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? ct;
  }
  static _$Ei() {
    if (this.hasOwnProperty(T("elementProperties"))) return;
    const t = Dt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(T("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(T("properties"))) {
      const e = this.properties, i = [...Lt(e), ...jt(e)];
      for (const r of i) this.createProperty(r, e[r]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [i, r] of e) this.elementProperties.set(i, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, i] of this.elementProperties) {
      const r = this._$Eu(e, i);
      r !== void 0 && this._$Eh.set(r, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const r of i) e.unshift(at(r));
    } else t !== void 0 && e.push(at(t));
    return e;
  }
  static _$Eu(t, e) {
    const i = e.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise(((t) => this.enableUpdating = t)), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach(((t) => t(this)));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const i of e.keys()) this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Ot(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach(((t) => t.hostConnected?.()));
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach(((t) => t.hostDisconnected?.()));
  }
  attributeChangedCallback(t, e, i) {
    this._$AK(t, i);
  }
  _$ET(t, e) {
    const i = this.constructor.elementProperties.get(t), r = this.constructor._$Eu(t, i);
    if (r !== void 0 && i.reflect === !0) {
      const n = (i.converter?.toAttribute !== void 0 ? i.converter : I).toAttribute(e, i.type);
      this._$Em = t, n == null ? this.removeAttribute(r) : this.setAttribute(r, n), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const i = this.constructor, r = i._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const n = i.getPropertyOptions(r), o = typeof n.converter == "function" ? { fromAttribute: n.converter } : n.converter?.fromAttribute !== void 0 ? n.converter : I;
      this._$Em = r;
      const a = o.fromAttribute(e, n.type);
      this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
    }
  }
  requestUpdate(t, e, i) {
    if (t !== void 0) {
      const r = this.constructor, n = this[t];
      if (i ??= r.getPropertyOptions(t), !((i.hasChanged ?? Q)(n, e) || i.useDefault && i.reflect && n === this._$Ej?.get(t) && !this.hasAttribute(r._$Eu(t, i)))) return;
      this.C(t, e, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: i, reflect: r, wrapped: n }, o) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, o ?? e ?? this[t]), n !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (e = void 0), this._$AL.set(t, e)), r === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [r, n] of this._$Ep) this[r] = n;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [r, n] of i) {
        const { wrapped: o } = n, a = this[r];
        o !== !0 || this._$AL.has(r) || a === void 0 || this.C(r, void 0, n, a);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$EO?.forEach(((i) => i.hostUpdate?.())), this.update(e)) : this._$EM();
    } catch (i) {
      throw t = !1, this._$EM(), i;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach(((e) => e.hostUpdated?.())), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach(((e) => this._$ET(e, this[e]))), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
E.elementStyles = [], E.shadowRootOptions = { mode: "open" }, E[T("elementProperties")] = /* @__PURE__ */ new Map(), E[T("finalized")] = /* @__PURE__ */ new Map(), Bt?.({ ReactiveElement: E }), (z.reactiveElementVersions ??= []).push("2.1.1");
const X = globalThis, B = X.trustedTypes, ut = B ? B.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, Y = "$lit$", y = `lit$${Math.random().toFixed(9).slice(2)}$`, tt = "?" + y, qt = `<${tt}>`, b = document, x = () => b.createComment(""), H = (s) => s === null || typeof s != "object" && typeof s != "function", et = Array.isArray, vt = (s) => et(s) || typeof s?.[Symbol.iterator] == "function", V = `[ 	
\f\r]`, P = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, dt = /-->/g, $t = />/g, g = RegExp(`>|${V}(?:([^\\s"'>=/]+)(${V}*=${V}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), pt = /'/g, ft = /"/g, bt = /^(?:script|style|textarea|title)$/i, st = (s) => (t, ...e) => ({ _$litType$: s, strings: t, values: e }), zt = st(1), Gt = st(2), Vt = st(3), _ = Symbol.for("lit-noChange"), $ = Symbol.for("lit-nothing"), _t = /* @__PURE__ */ new WeakMap(), v = b.createTreeWalker(b, 129);
function St(s, t) {
  if (!et(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ut !== void 0 ? ut.createHTML(t) : t;
}
const Et = (s, t) => {
  const e = s.length - 1, i = [];
  let r, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = P;
  for (let a = 0; a < e; a++) {
    const h = s[a];
    let c, p, l = -1, d = 0;
    for (; d < h.length && (o.lastIndex = d, p = o.exec(h), p !== null); ) d = o.lastIndex, o === P ? p[1] === "!--" ? o = dt : p[1] !== void 0 ? o = $t : p[2] !== void 0 ? (bt.test(p[2]) && (r = RegExp("</" + p[2], "g")), o = g) : p[3] !== void 0 && (o = g) : o === g ? p[0] === ">" ? (o = r ?? P, l = -1) : p[1] === void 0 ? l = -2 : (l = o.lastIndex - p[2].length, c = p[1], o = p[3] === void 0 ? g : p[3] === '"' ? ft : pt) : o === ft || o === pt ? o = g : o === dt || o === $t ? o = P : (o = g, r = void 0);
    const u = o === g && s[a + 1].startsWith("/>") ? " " : "";
    n += o === P ? h + qt : l >= 0 ? (i.push(c), h.slice(0, l) + Y + h.slice(l) + y + u) : h + y + (l === -2 ? a : u);
  }
  return [St(s, n + (s[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class O {
  constructor({ strings: t, _$litType$: e }, i) {
    let r;
    this.parts = [];
    let n = 0, o = 0;
    const a = t.length - 1, h = this.parts, [c, p] = Et(t, e);
    if (this.el = O.createElement(c, i), v.currentNode = this.el.content, e === 2 || e === 3) {
      const l = this.el.content.firstChild;
      l.replaceWith(...l.childNodes);
    }
    for (; (r = v.nextNode()) !== null && h.length < a; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const l of r.getAttributeNames()) if (l.endsWith(Y)) {
          const d = p[o++], u = r.getAttribute(l).split(y), f = /([.?@])?(.*)/.exec(d);
          h.push({ type: 1, index: n, name: f[2], strings: u, ctor: f[1] === "." ? Ct : f[1] === "?" ? Pt : f[1] === "@" ? Mt : N }), r.removeAttribute(l);
        } else l.startsWith(y) && (h.push({ type: 6, index: n }), r.removeAttribute(l));
        if (bt.test(r.tagName)) {
          const l = r.textContent.split(y), d = l.length - 1;
          if (d > 0) {
            r.textContent = B ? B.emptyScript : "";
            for (let u = 0; u < d; u++) r.append(l[u], x()), v.nextNode(), h.push({ type: 2, index: ++n });
            r.append(l[d], x());
          }
        }
      } else if (r.nodeType === 8) if (r.data === tt) h.push({ type: 2, index: n });
      else {
        let l = -1;
        for (; (l = r.data.indexOf(y, l + 1)) !== -1; ) h.push({ type: 7, index: n }), l += y.length - 1;
      }
      n++;
    }
  }
  static createElement(t, e) {
    const i = b.createElement("template");
    return i.innerHTML = t, i;
  }
}
function S(s, t, e = s, i) {
  if (t === _) return t;
  let r = i !== void 0 ? e._$Co?.[i] : e._$Cl;
  const n = H(t) ? void 0 : t._$litDirective$;
  return r?.constructor !== n && (r?._$AO?.(!1), n === void 0 ? r = void 0 : (r = new n(s), r._$AT(s, e, i)), i !== void 0 ? (e._$Co ??= [])[i] = r : e._$Cl = r), r !== void 0 && (t = S(s, r._$AS(s, t.values), r, i)), t;
}
let wt = class {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: i } = this._$AD, r = (t?.creationScope ?? b).importNode(e, !0);
    v.currentNode = r;
    let n = v.nextNode(), o = 0, a = 0, h = i[0];
    for (; h !== void 0; ) {
      if (o === h.index) {
        let c;
        h.type === 2 ? c = new C(n, n.nextSibling, this, t) : h.type === 1 ? c = new h.ctor(n, h.name, h.strings, this, t) : h.type === 6 && (c = new Tt(n, this, t)), this._$AV.push(c), h = i[++a];
      }
      o !== h?.index && (n = v.nextNode(), o++);
    }
    return v.currentNode = b, r;
  }
  p(t) {
    let e = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
};
class C {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, i, r) {
    this.type = 2, this._$AH = $, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = r, this._$Cv = r?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && t?.nodeType === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = S(this, t, e), H(t) ? t === $ || t == null || t === "" ? (this._$AH !== $ && this._$AR(), this._$AH = $) : t !== this._$AH && t !== _ && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : vt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== $ && H(this._$AH) ? this._$AA.nextSibling.data = t : this.T(b.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: i } = t, r = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = O.createElement(St(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === r) this._$AH.p(e);
    else {
      const n = new wt(r, this), o = n.u(this.options);
      n.p(e), this.T(o), this._$AH = n;
    }
  }
  _$AC(t) {
    let e = _t.get(t.strings);
    return e === void 0 && _t.set(t.strings, e = new O(t)), e;
  }
  k(t) {
    et(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, r = 0;
    for (const n of t) r === e.length ? e.push(i = new C(this.O(x()), this.O(x()), this, this.options)) : i = e[r], i._$AI(n), r++;
    r < e.length && (this._$AR(i && i._$AB.nextSibling, r), e.length = r);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const i = t.nextSibling;
      t.remove(), t = i;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class N {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, i, r, n) {
    this.type = 1, this._$AH = $, this._$AN = void 0, this.element = t, this.name = e, this._$AM = r, this.options = n, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = $;
  }
  _$AI(t, e = this, i, r) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) t = S(this, t, e, 0), o = !H(t) || t !== this._$AH && t !== _, o && (this._$AH = t);
    else {
      const a = t;
      let h, c;
      for (t = n[0], h = 0; h < n.length - 1; h++) c = S(this, a[i + h], e, h), c === _ && (c = this._$AH[h]), o ||= !H(c) || c !== this._$AH[h], c === $ ? t = $ : t !== $ && (t += (c ?? "") + n[h + 1]), this._$AH[h] = c;
    }
    o && !r && this.j(t);
  }
  j(t) {
    t === $ ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Ct extends N {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === $ ? void 0 : t;
  }
}
class Pt extends N {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== $);
  }
}
class Mt extends N {
  constructor(t, e, i, r, n) {
    super(t, e, i, r, n), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = S(this, t, e, 0) ?? $) === _) return;
    const i = this._$AH, r = t === $ && i !== $ || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, n = t !== $ && (i === $ || r);
    r && this.element.removeEventListener(this.name, this, i), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Tt {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    S(this, t);
  }
}
const Wt = { M: Y, P: y, A: tt, C: 1, L: Et, R: wt, D: vt, V: S, I: C, H: N, N: Pt, U: Mt, B: Ct, F: Tt }, Kt = X.litHtmlPolyfillSupport;
Kt?.(O, C), (X.litHtmlVersions ??= []).push("3.3.1");
const Zt = (s, t, e) => {
  const i = e?.renderBefore ?? t;
  let r = i._$litPart$;
  if (r === void 0) {
    const n = e?.renderBefore ?? null;
    i._$litPart$ = r = new C(t.insertBefore(x(), n), n, void 0, e ?? {});
  }
  return r._$AI(s), r;
};
const it = globalThis;
let D = class extends E {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Zt(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return _;
  }
};
D._$litElement$ = !0, D.finalized = !0, it.litElementHydrateSupport?.({ LitElement: D });
const Ft = it.litElementPolyfillSupport;
Ft?.({ LitElement: D });
const Ae = { _$AK: (s, t, e) => {
  s._$AK(t, e);
}, _$AL: (s) => s._$AL };
(it.litElementVersions ??= []).push("4.2.1");
const ye = !1;
const rt = Symbol.for(""), Jt = (s) => {
  if (s?.r === rt) return s?._$litStatic$;
}, ge = (s) => ({ _$litStatic$: s, r: rt }), me = (s, ...t) => ({ _$litStatic$: t.reduce(((e, i, r) => e + ((n) => {
  if (n._$litStatic$ !== void 0) return n._$litStatic$;
  throw Error(`Value passed to 'literal' function must be a 'literal' result: ${n}. Use 'unsafeStatic' to pass non-literal values, but
            take care to ensure page security.`);
})(i) + s[r + 1]), s[0]), r: rt }), At = /* @__PURE__ */ new Map(), nt = (s) => (t, ...e) => {
  const i = e.length;
  let r, n;
  const o = [], a = [];
  let h, c = 0, p = !1;
  for (; c < i; ) {
    for (h = t[c]; c < i && (n = e[c], (r = Jt(n)) !== void 0); ) h += r + t[++c], p = !0;
    c !== i && a.push(n), o.push(h), c++;
  }
  if (c === i && o.push(t[i]), p) {
    const l = o.join("$$lit$$");
    (t = At.get(l)) === void 0 && (o.raw = o, At.set(l, t = o)), e = a;
  }
  return s(t, ...e);
}, ve = nt(zt), be = nt(Gt), Se = nt(Vt);
const Ee = (s) => (t, e) => {
  e !== void 0 ? e.addInitializer((() => {
    customElements.define(s, t);
  })) : customElements.define(s, t);
};
const Qt = { attribute: !0, type: String, converter: I, reflect: !1, hasChanged: Q }, Xt = (s = Qt, t, e) => {
  const { kind: i, metadata: r } = e;
  let n = globalThis.litPropertyMetadata.get(r);
  if (n === void 0 && globalThis.litPropertyMetadata.set(r, n = /* @__PURE__ */ new Map()), i === "setter" && ((s = Object.create(s)).wrapped = !0), n.set(e.name, s), i === "accessor") {
    const { name: o } = e;
    return { set(a) {
      const h = t.get.call(this);
      t.set.call(this, a), this.requestUpdate(o, h, s);
    }, init(a) {
      return a !== void 0 && this.C(o, void 0, s, a), a;
    } };
  }
  if (i === "setter") {
    const { name: o } = e;
    return function(a) {
      const h = this[o];
      t.call(this, a), this.requestUpdate(o, h, s);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function Yt(s) {
  return (t, e) => typeof e == "object" ? Xt(s, t, e) : ((i, r, n) => {
    const o = r.hasOwnProperty(n);
    return r.constructor.createProperty(n, i), o ? Object.getOwnPropertyDescriptor(r, n) : void 0;
  })(s, t, e);
}
function we(s) {
  return Yt({ ...s, state: !0, attribute: !1 });
}
function Ce(s) {
  return (t, e) => {
    const i = typeof t == "function" ? t : t[e];
    Object.assign(i, s);
  };
}
const w = (s, t, e) => (e.configurable = !0, e.enumerable = !0, Reflect.decorate && typeof t != "object" && Object.defineProperty(s, t, e), e);
function Pe(s, t) {
  return (e, i, r) => {
    const n = (o) => o.renderRoot?.querySelector(s) ?? null;
    if (t) {
      const { get: o, set: a } = typeof i == "object" ? e : r ?? (() => {
        const h = Symbol();
        return { get() {
          return this[h];
        }, set(c) {
          this[h] = c;
        } };
      })();
      return w(e, i, { get() {
        let h = o.call(this);
        return h === void 0 && (h = n(this), (h !== null || this.hasUpdated) && a.call(this, h)), h;
      } });
    }
    return w(e, i, { get() {
      return n(this);
    } });
  };
}
let te;
function Me(s) {
  return (t, e) => w(t, e, { get() {
    return (this.renderRoot ?? (te ??= document.createDocumentFragment())).querySelectorAll(s);
  } });
}
function Te(s) {
  return (t, e) => w(t, e, { async get() {
    return await this.updateComplete, this.renderRoot?.querySelector(s) ?? null;
  } });
}
function Ue(s) {
  return (t, e) => {
    const { slot: i, selector: r } = s ?? {}, n = "slot" + (i ? `[name=${i}]` : ":not([name])");
    return w(t, e, { get() {
      const o = this.renderRoot?.querySelector(n), a = o?.assignedElements(s) ?? [];
      return r === void 0 ? a : a.filter(((h) => h.matches(r)));
    } });
  };
}
function xe(s) {
  return (t, e) => {
    const { slot: i } = s ?? {}, r = "slot" + (i ? `[name=${i}]` : ":not([name])");
    return w(t, e, { get() {
      return this.renderRoot?.querySelector(r)?.assignedNodes(s) ?? [];
    } });
  };
}
const { I: ee } = Wt, se = (s) => s.strings === void 0, yt = () => document.createComment(""), M = (s, t, e) => {
  const i = s._$AA.parentNode, r = t === void 0 ? s._$AB : t._$AA;
  if (e === void 0) {
    const n = i.insertBefore(yt(), r), o = i.insertBefore(yt(), r);
    e = new ee(n, o, s, s.options);
  } else {
    const n = e._$AB.nextSibling, o = e._$AM, a = o !== s;
    if (a) {
      let h;
      e._$AQ?.(s), e._$AM = s, e._$AP !== void 0 && (h = s._$AU) !== o._$AU && e._$AP(h);
    }
    if (n !== r || a) {
      let h = e._$AA;
      for (; h !== n; ) {
        const c = h.nextSibling;
        i.insertBefore(h, r), h = c;
      }
    }
  }
  return e;
}, m = (s, t, e = s) => (s._$AI(t, e), s), ie = {}, re = (s, t = ie) => s._$AH = t, ne = (s) => s._$AH, W = (s) => {
  s._$AR(), s._$AA.remove();
};
const R = { ATTRIBUTE: 1, CHILD: 2 }, k = (s) => (...t) => ({ _$litDirective$: s, values: t });
let L = class {
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, e, i) {
    this._$Ct = t, this._$AM = e, this._$Ci = i;
  }
  _$AS(t, e) {
    return this.update(t, e);
  }
  update(t, e) {
    return this.render(...e);
  }
};
const U = (s, t) => {
  const e = s._$AN;
  if (e === void 0) return !1;
  for (const i of e) i._$AO?.(t, !1), U(i, t);
  return !0;
}, q = (s) => {
  let t, e;
  do {
    if ((t = s._$AM) === void 0) break;
    e = t._$AN, e.delete(s), s = t;
  } while (e?.size === 0);
}, Ut = (s) => {
  for (let t; t = s._$AM; s = t) {
    let e = t._$AN;
    if (e === void 0) t._$AN = e = /* @__PURE__ */ new Set();
    else if (e.has(s)) break;
    e.add(s), ae(t);
  }
};
function oe(s) {
  this._$AN !== void 0 ? (q(this), this._$AM = s, Ut(this)) : this._$AM = s;
}
function he(s, t = !1, e = 0) {
  const i = this._$AH, r = this._$AN;
  if (r !== void 0 && r.size !== 0) if (t) if (Array.isArray(i)) for (let n = e; n < i.length; n++) U(i[n], !1), q(i[n]);
  else i != null && (U(i, !1), q(i));
  else U(this, s);
}
const ae = (s) => {
  s.type == R.CHILD && (s._$AP ??= he, s._$AQ ??= oe);
};
class le extends L {
  constructor() {
    super(...arguments), this._$AN = void 0;
  }
  _$AT(t, e, i) {
    super._$AT(t, e, i), Ut(this), this.isConnected = t._$AU;
  }
  _$AO(t, e = !0) {
    t !== this.isConnected && (this.isConnected = t, t ? this.reconnected?.() : this.disconnected?.()), e && (U(this, t), q(this));
  }
  setValue(t) {
    if (se(this._$Ct)) this._$Ct._$AI(t, this);
    else {
      const e = [...this._$Ct._$AH];
      e[this._$Ci] = t, this._$Ct._$AI(e, this, 0);
    }
  }
  disconnected() {
  }
  reconnected() {
  }
}
const Oe = () => new ce();
class ce {
}
const K = /* @__PURE__ */ new WeakMap(), Ne = k(class extends le {
  render(s) {
    return $;
  }
  update(s, [t]) {
    const e = t !== this.G;
    return e && this.G !== void 0 && this.rt(void 0), (e || this.lt !== this.ct) && (this.G = t, this.ht = s.options?.host, this.rt(this.ct = s.element)), $;
  }
  rt(s) {
    if (this.isConnected || (s = void 0), typeof this.G == "function") {
      const t = this.ht ?? globalThis;
      let e = K.get(t);
      e === void 0 && (e = /* @__PURE__ */ new WeakMap(), K.set(t, e)), e.get(this.G) !== void 0 && this.G.call(this.ht, void 0), e.set(this.G, s), s !== void 0 && this.G.call(this.ht, s);
    } else this.G.value = s;
  }
  get lt() {
    return typeof this.G == "function" ? K.get(this.ht ?? globalThis)?.get(this.G) : this.G?.value;
  }
  disconnected() {
    this.lt === this.ct && this.rt(void 0);
  }
  reconnected() {
    this.rt(this.ct);
  }
});
const Re = (s) => s ?? $;
let Z = class extends L {
  constructor(t) {
    if (super(t), this.it = $, t.type !== R.CHILD) throw Error(this.constructor.directiveName + "() can only be used in child bindings");
  }
  render(t) {
    if (t === $ || t == null) return this._t = void 0, this.it = t;
    if (t === _) return t;
    if (typeof t != "string") throw Error(this.constructor.directiveName + "() called with a non-string value");
    if (t === this.it) return this._t;
    this.it = t;
    const e = [t];
    return e.raw = e, this._t = { _$litType$: this.constructor.resultType, strings: e, values: [] };
  }
};
Z.directiveName = "unsafeHTML", Z.resultType = 1;
const Le = k(Z);
const xt = "important", ue = " !" + xt, je = k(class extends L {
  constructor(s) {
    if (super(s), s.type !== R.ATTRIBUTE || s.name !== "style" || s.strings?.length > 2) throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
  }
  render(s) {
    return Object.keys(s).reduce(((t, e) => {
      const i = s[e];
      return i == null ? t : t + `${e = e.includes("-") ? e : e.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${i};`;
    }), "");
  }
  update(s, [t]) {
    const { style: e } = s.element;
    if (this.ft === void 0) return this.ft = new Set(Object.keys(t)), this.render(t);
    for (const i of this.ft) t[i] == null && (this.ft.delete(i), i.includes("-") ? e.removeProperty(i) : e[i] = null);
    for (const i in t) {
      const r = t[i];
      if (r != null) {
        this.ft.add(i);
        const n = typeof r == "string" && r.endsWith(ue);
        i.includes("-") || n ? e.setProperty(i, n ? r.slice(0, -11) : r, n ? xt : "") : e[i] = r;
      }
    }
    return _;
  }
});
const De = k(class extends L {
  constructor(s) {
    if (super(s), s.type !== R.ATTRIBUTE || s.name !== "class" || s.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
  }
  render(s) {
    return " " + Object.keys(s).filter(((t) => s[t])).join(" ") + " ";
  }
  update(s, [t]) {
    if (this.st === void 0) {
      this.st = /* @__PURE__ */ new Set(), s.strings !== void 0 && (this.nt = new Set(s.strings.join(" ").split(/\s/).filter(((i) => i !== ""))));
      for (const i in t) t[i] && !this.nt?.has(i) && this.st.add(i);
      return this.render(t);
    }
    const e = s.element.classList;
    for (const i of this.st) i in t || (e.remove(i), this.st.delete(i));
    for (const i in t) {
      const r = !!t[i];
      r === this.st.has(i) || this.nt?.has(i) || (r ? (e.add(i), this.st.add(i)) : (e.remove(i), this.st.delete(i)));
    }
    return _;
  }
});
const gt = (s, t, e) => {
  const i = /* @__PURE__ */ new Map();
  for (let r = t; r <= e; r++) i.set(s[r], r);
  return i;
}, Ie = k(class extends L {
  constructor(s) {
    if (super(s), s.type !== R.CHILD) throw Error("repeat() can only be used in text expressions");
  }
  dt(s, t, e) {
    let i;
    e === void 0 ? e = t : t !== void 0 && (i = t);
    const r = [], n = [];
    let o = 0;
    for (const a of s) r[o] = i ? i(a, o) : o, n[o] = e(a, o), o++;
    return { values: n, keys: r };
  }
  render(s, t, e) {
    return this.dt(s, t, e).values;
  }
  update(s, [t, e, i]) {
    const r = ne(s), { values: n, keys: o } = this.dt(t, e, i);
    if (!Array.isArray(r)) return this.ut = o, n;
    const a = this.ut ??= [], h = [];
    let c, p, l = 0, d = r.length - 1, u = 0, f = n.length - 1;
    for (; l <= d && u <= f; ) if (r[l] === null) l++;
    else if (r[d] === null) d--;
    else if (a[l] === o[u]) h[u] = m(r[l], n[u]), l++, u++;
    else if (a[d] === o[f]) h[f] = m(r[d], n[f]), d--, f--;
    else if (a[l] === o[f]) h[f] = m(r[l], n[f]), M(s, h[f + 1], r[l]), l++, f--;
    else if (a[d] === o[u]) h[u] = m(r[d], n[u]), M(s, r[l], r[d]), d--, u++;
    else if (c === void 0 && (c = gt(o, u, f), p = gt(a, l, d)), c.has(a[l])) if (c.has(a[d])) {
      const A = p.get(o[u]), G = A !== void 0 ? r[A] : null;
      if (G === null) {
        const ot = M(s, r[l]);
        m(ot, n[u]), h[u] = ot;
      } else h[u] = m(G, n[u]), M(s, r[l], G), r[A] = null;
      u++;
    } else W(r[d]), d--;
    else W(r[l]), l++;
    for (; u <= f; ) {
      const A = M(s, h[f + 1]);
      m(A, n[u]), h[u++] = A;
    }
    for (; l <= d; ) {
      const A = r[l++];
      A !== null && W(A);
    }
    return this.ut = o, re(s, h), _;
  }
});
export {
  mt as CSSResult,
  D as LitElement,
  E as ReactiveElement,
  Z as UnsafeHTMLDirective,
  Ae as _$LE,
  Wt as _$LH,
  Ot as adoptStyles,
  De as classMap,
  Oe as createRef,
  $e as css,
  Ee as customElement,
  I as defaultConverter,
  Ce as eventOptions,
  at as getCompatibleStyle,
  ve as html,
  Re as ifDefined,
  ye as isServer,
  me as literal,
  Se as mathml,
  _ as noChange,
  Q as notEqual,
  $ as nothing,
  Yt as property,
  Pe as query,
  Me as queryAll,
  Ue as queryAssignedElements,
  xe as queryAssignedNodes,
  Te as queryAsync,
  Ne as ref,
  Zt as render,
  Ie as repeat,
  Xt as standardProperty,
  we as state,
  je as styleMap,
  F as supportsAdoptingStyleSheets,
  be as svg,
  Ht as unsafeCSS,
  Le as unsafeHTML,
  ge as unsafeStatic,
  nt as withStatic
};
