const O = globalThis, q = O.ShadowRoot && (O.ShadyCSS === void 0 || O.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, z = Symbol(), Y = /* @__PURE__ */ new WeakMap();
let lt = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== z) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (q && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = Y.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && Y.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const vt = (i) => new lt(typeof i == "string" ? i : i + "", void 0, z), Zt = (i, ...t) => {
  const e = i.length === 1 ? i[0] : t.reduce(((s, r, n) => s + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + i[n + 1]), i[0]);
  return new lt(e, i, z);
}, Et = (i, t) => {
  if (q) i.adoptedStyleSheets = t.map(((e) => e instanceof CSSStyleSheet ? e : e.styleSheet));
  else for (const e of t) {
    const s = document.createElement("style"), r = O.litNonce;
    r !== void 0 && s.setAttribute("nonce", r), s.textContent = e.cssText, i.appendChild(s);
  }
}, tt = q ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return vt(e);
})(i) : i;
const { is: bt, defineProperty: St, getOwnPropertyDescriptor: Ct, getOwnPropertyNames: wt, getOwnPropertySymbols: Pt, getPrototypeOf: Tt } = Object, k = globalThis, et = k.trustedTypes, Ut = et ? et.emptyScript : "", Mt = k.reactiveElementPolyfillSupport, C = (i, t) => i, N = { toAttribute(i, t) {
  switch (t) {
    case Boolean:
      i = i ? Ut : null;
      break;
    case Object:
    case Array:
      i = i == null ? i : JSON.stringify(i);
  }
  return i;
}, fromAttribute(i, t) {
  let e = i;
  switch (t) {
    case Boolean:
      e = i !== null;
      break;
    case Number:
      e = i === null ? null : Number(i);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(i);
      } catch {
        e = null;
      }
  }
  return e;
} }, B = (i, t) => !bt(i, t), st = { attribute: !0, type: String, converter: N, reflect: !1, useDefault: !1, hasChanged: B };
Symbol.metadata ??= Symbol("metadata"), k.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let v = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = st) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = Symbol(), r = this.getPropertyDescriptor(t, s, e);
      r !== void 0 && St(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: r, set: n } = Ct(this.prototype, t) ?? { get() {
      return this[e];
    }, set(o) {
      this[e] = o;
    } };
    return { get: r, set(o) {
      const a = r?.call(this);
      n?.call(this, o), this.requestUpdate(t, a, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? st;
  }
  static _$Ei() {
    if (this.hasOwnProperty(C("elementProperties"))) return;
    const t = Tt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(C("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(C("properties"))) {
      const e = this.properties, s = [...wt(e), ...Pt(e)];
      for (const r of s) this.createProperty(r, e[r]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [s, r] of e) this.elementProperties.set(s, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, s] of this.elementProperties) {
      const r = this._$Eu(e, s);
      r !== void 0 && this._$Eh.set(r, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const r of s) e.unshift(tt(r));
    } else t !== void 0 && e.push(tt(t));
    return e;
  }
  static _$Eu(t, e) {
    const s = e.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof t == "string" ? t.toLowerCase() : void 0;
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
    for (const s of e.keys()) this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Et(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach(((t) => t.hostConnected?.()));
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach(((t) => t.hostDisconnected?.()));
  }
  attributeChangedCallback(t, e, s) {
    this._$AK(t, s);
  }
  _$ET(t, e) {
    const s = this.constructor.elementProperties.get(t), r = this.constructor._$Eu(t, s);
    if (r !== void 0 && s.reflect === !0) {
      const n = (s.converter?.toAttribute !== void 0 ? s.converter : N).toAttribute(e, s.type);
      this._$Em = t, n == null ? this.removeAttribute(r) : this.setAttribute(r, n), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const s = this.constructor, r = s._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const n = s.getPropertyOptions(r), o = typeof n.converter == "function" ? { fromAttribute: n.converter } : n.converter?.fromAttribute !== void 0 ? n.converter : N;
      this._$Em = r;
      const a = o.fromAttribute(e, n.type);
      this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
    }
  }
  requestUpdate(t, e, s) {
    if (t !== void 0) {
      const r = this.constructor, n = this[t];
      if (s ??= r.getPropertyOptions(t), !((s.hasChanged ?? B)(n, e) || s.useDefault && s.reflect && n === this._$Ej?.get(t) && !this.hasAttribute(r._$Eu(t, s)))) return;
      this.C(t, e, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: s, reflect: r, wrapped: n }, o) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, o ?? e ?? this[t]), n !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (e = void 0), this._$AL.set(t, e)), r === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
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
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [r, n] of s) {
        const { wrapped: o } = n, a = this[r];
        o !== !0 || this._$AL.has(r) || a === void 0 || this.C(r, void 0, n, a);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$EO?.forEach(((s) => s.hostUpdate?.())), this.update(e)) : this._$EM();
    } catch (s) {
      throw t = !1, this._$EM(), s;
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
v.elementStyles = [], v.shadowRootOptions = { mode: "open" }, v[C("elementProperties")] = /* @__PURE__ */ new Map(), v[C("finalized")] = /* @__PURE__ */ new Map(), Mt?.({ ReactiveElement: v }), (k.reactiveElementVersions ??= []).push("2.1.1");
const G = globalThis, R = G.trustedTypes, it = R ? R.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, W = "$lit$", p = `lit$${Math.random().toFixed(9).slice(2)}$`, V = "?" + p, xt = `<${V}>`, g = document, P = () => g.createComment(""), T = (i) => i === null || typeof i != "object" && typeof i != "function", K = Array.isArray, ct = (i) => K(i) || typeof i?.[Symbol.iterator] == "function", D = `[ 	
\f\r]`, S = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, rt = /-->/g, nt = />/g, A = RegExp(`>|${D}(?:([^\\s"'>=/]+)(${D}*=${D}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ot = /'/g, ht = /"/g, dt = /^(?:script|style|textarea|title)$/i, Z = (i) => (t, ...e) => ({ _$litType$: i, strings: t, values: e }), Jt = Z(1), Qt = Z(2), Xt = Z(3), _ = Symbol.for("lit-noChange"), c = Symbol.for("lit-nothing"), at = /* @__PURE__ */ new WeakMap(), y = g.createTreeWalker(g, 129);
function ut(i, t) {
  if (!K(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return it !== void 0 ? it.createHTML(t) : t;
}
const $t = (i, t) => {
  const e = i.length - 1, s = [];
  let r, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = S;
  for (let a = 0; a < e; a++) {
    const h = i[a];
    let d, u, l = -1, $ = 0;
    for (; $ < h.length && (o.lastIndex = $, u = o.exec(h), u !== null); ) $ = o.lastIndex, o === S ? u[1] === "!--" ? o = rt : u[1] !== void 0 ? o = nt : u[2] !== void 0 ? (dt.test(u[2]) && (r = RegExp("</" + u[2], "g")), o = A) : u[3] !== void 0 && (o = A) : o === A ? u[0] === ">" ? (o = r ?? S, l = -1) : u[1] === void 0 ? l = -2 : (l = o.lastIndex - u[2].length, d = u[1], o = u[3] === void 0 ? A : u[3] === '"' ? ht : ot) : o === ht || o === ot ? o = A : o === rt || o === nt ? o = S : (o = A, r = void 0);
    const f = o === A && i[a + 1].startsWith("/>") ? " " : "";
    n += o === S ? h + xt : l >= 0 ? (s.push(d), h.slice(0, l) + W + h.slice(l) + p + f) : h + p + (l === -2 ? a : f);
  }
  return [ut(i, n + (i[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class U {
  constructor({ strings: t, _$litType$: e }, s) {
    let r;
    this.parts = [];
    let n = 0, o = 0;
    const a = t.length - 1, h = this.parts, [d, u] = $t(t, e);
    if (this.el = U.createElement(d, s), y.currentNode = this.el.content, e === 2 || e === 3) {
      const l = this.el.content.firstChild;
      l.replaceWith(...l.childNodes);
    }
    for (; (r = y.nextNode()) !== null && h.length < a; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const l of r.getAttributeNames()) if (l.endsWith(W)) {
          const $ = u[o++], f = r.getAttribute(l).split(p), x = /([.?@])?(.*)/.exec($);
          h.push({ type: 1, index: n, name: x[2], strings: f, ctor: x[1] === "." ? ft : x[1] === "?" ? _t : x[1] === "@" ? At : M }), r.removeAttribute(l);
        } else l.startsWith(p) && (h.push({ type: 6, index: n }), r.removeAttribute(l));
        if (dt.test(r.tagName)) {
          const l = r.textContent.split(p), $ = l.length - 1;
          if ($ > 0) {
            r.textContent = R ? R.emptyScript : "";
            for (let f = 0; f < $; f++) r.append(l[f], P()), y.nextNode(), h.push({ type: 2, index: ++n });
            r.append(l[$], P());
          }
        }
      } else if (r.nodeType === 8) if (r.data === V) h.push({ type: 2, index: n });
      else {
        let l = -1;
        for (; (l = r.data.indexOf(p, l + 1)) !== -1; ) h.push({ type: 7, index: n }), l += p.length - 1;
      }
      n++;
    }
  }
  static createElement(t, e) {
    const s = g.createElement("template");
    return s.innerHTML = t, s;
  }
}
function m(i, t, e = i, s) {
  if (t === _) return t;
  let r = s !== void 0 ? e._$Co?.[s] : e._$Cl;
  const n = T(t) ? void 0 : t._$litDirective$;
  return r?.constructor !== n && (r?._$AO?.(!1), n === void 0 ? r = void 0 : (r = new n(i), r._$AT(i, e, s)), s !== void 0 ? (e._$Co ??= [])[s] = r : e._$Cl = r), r !== void 0 && (t = m(i, r._$AS(i, t.values), r, s)), t;
}
class pt {
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
    const { el: { content: e }, parts: s } = this._$AD, r = (t?.creationScope ?? g).importNode(e, !0);
    y.currentNode = r;
    let n = y.nextNode(), o = 0, a = 0, h = s[0];
    for (; h !== void 0; ) {
      if (o === h.index) {
        let d;
        h.type === 2 ? d = new b(n, n.nextSibling, this, t) : h.type === 1 ? d = new h.ctor(n, h.name, h.strings, this, t) : h.type === 6 && (d = new yt(n, this, t)), this._$AV.push(d), h = s[++a];
      }
      o !== h?.index && (n = y.nextNode(), o++);
    }
    return y.currentNode = g, r;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class b {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, s, r) {
    this.type = 2, this._$AH = c, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = s, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
    t = m(this, t, e), T(t) ? t === c || t == null || t === "" ? (this._$AH !== c && this._$AR(), this._$AH = c) : t !== this._$AH && t !== _ && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : ct(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== c && T(this._$AH) ? this._$AA.nextSibling.data = t : this.T(g.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: s } = t, r = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = U.createElement(ut(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === r) this._$AH.p(e);
    else {
      const n = new pt(r, this), o = n.u(this.options);
      n.p(e), this.T(o), this._$AH = n;
    }
  }
  _$AC(t) {
    let e = at.get(t.strings);
    return e === void 0 && at.set(t.strings, e = new U(t)), e;
  }
  k(t) {
    K(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, r = 0;
    for (const n of t) r === e.length ? e.push(s = new b(this.O(P()), this.O(P()), this, this.options)) : s = e[r], s._$AI(n), r++;
    r < e.length && (this._$AR(s && s._$AB.nextSibling, r), e.length = r);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const s = t.nextSibling;
      t.remove(), t = s;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class M {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, s, r, n) {
    this.type = 1, this._$AH = c, this._$AN = void 0, this.element = t, this.name = e, this._$AM = r, this.options = n, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = c;
  }
  _$AI(t, e = this, s, r) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) t = m(this, t, e, 0), o = !T(t) || t !== this._$AH && t !== _, o && (this._$AH = t);
    else {
      const a = t;
      let h, d;
      for (t = n[0], h = 0; h < n.length - 1; h++) d = m(this, a[s + h], e, h), d === _ && (d = this._$AH[h]), o ||= !T(d) || d !== this._$AH[h], d === c ? t = c : t !== c && (t += (d ?? "") + n[h + 1]), this._$AH[h] = d;
    }
    o && !r && this.j(t);
  }
  j(t) {
    t === c ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class ft extends M {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === c ? void 0 : t;
  }
}
class _t extends M {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== c);
  }
}
class At extends M {
  constructor(t, e, s, r, n) {
    super(t, e, s, r, n), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = m(this, t, e, 0) ?? c) === _) return;
    const s = this._$AH, r = t === c && s !== c || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, n = t !== c && (s === c || r);
    r && this.element.removeEventListener(this.name, this, s), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class yt {
  constructor(t, e, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    m(this, t);
  }
}
const Ot = { M: W, P: p, A: V, C: 1, L: $t, R: pt, D: ct, V: m, I: b, H: M, N: _t, U: At, B: ft, F: yt }, Ht = G.litHtmlPolyfillSupport;
Ht?.(U, b), (G.litHtmlVersions ??= []).push("3.3.1");
const Nt = (i, t, e) => {
  const s = e?.renderBefore ?? t;
  let r = s._$litPart$;
  if (r === void 0) {
    const n = e?.renderBefore ?? null;
    s._$litPart$ = r = new b(t.insertBefore(P(), n), n, void 0, e ?? {});
  }
  return r._$AI(i), r;
};
const F = globalThis;
let H = class extends v {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Nt(e, this.renderRoot, this.renderOptions);
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
H._$litElement$ = !0, H.finalized = !0, F.litElementHydrateSupport?.({ LitElement: H });
const Rt = F.litElementPolyfillSupport;
Rt?.({ LitElement: H });
const te = { _$AK: (i, t, e) => {
  i._$AK(t, e);
}, _$AL: (i) => i._$AL };
(F.litElementVersions ??= []).push("4.2.1");
const ee = !1;
const se = (i) => (t, e) => {
  e !== void 0 ? e.addInitializer((() => {
    customElements.define(i, t);
  })) : customElements.define(i, t);
};
const Lt = { attribute: !0, type: String, converter: N, reflect: !1, hasChanged: B }, kt = (i = Lt, t, e) => {
  const { kind: s, metadata: r } = e;
  let n = globalThis.litPropertyMetadata.get(r);
  if (n === void 0 && globalThis.litPropertyMetadata.set(r, n = /* @__PURE__ */ new Map()), s === "setter" && ((i = Object.create(i)).wrapped = !0), n.set(e.name, i), s === "accessor") {
    const { name: o } = e;
    return { set(a) {
      const h = t.get.call(this);
      t.set.call(this, a), this.requestUpdate(o, h, i);
    }, init(a) {
      return a !== void 0 && this.C(o, void 0, i, a), a;
    } };
  }
  if (s === "setter") {
    const { name: o } = e;
    return function(a) {
      const h = this[o];
      t.call(this, a), this.requestUpdate(o, h, i);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function Dt(i) {
  return (t, e) => typeof e == "object" ? kt(i, t, e) : ((s, r, n) => {
    const o = r.hasOwnProperty(n);
    return r.constructor.createProperty(n, s), o ? Object.getOwnPropertyDescriptor(r, n) : void 0;
  })(i, t, e);
}
function ie(i) {
  return Dt({ ...i, state: !0, attribute: !1 });
}
function re(i) {
  return (t, e) => {
    const s = typeof t == "function" ? t : t[e];
    Object.assign(s, i);
  };
}
const E = (i, t, e) => (e.configurable = !0, e.enumerable = !0, Reflect.decorate && typeof t != "object" && Object.defineProperty(i, t, e), e);
function ne(i, t) {
  return (e, s, r) => {
    const n = (o) => o.renderRoot?.querySelector(i) ?? null;
    if (t) {
      const { get: o, set: a } = typeof s == "object" ? e : r ?? (() => {
        const h = Symbol();
        return { get() {
          return this[h];
        }, set(d) {
          this[h] = d;
        } };
      })();
      return E(e, s, { get() {
        let h = o.call(this);
        return h === void 0 && (h = n(this), (h !== null || this.hasUpdated) && a.call(this, h)), h;
      } });
    }
    return E(e, s, { get() {
      return n(this);
    } });
  };
}
let jt;
function oe(i) {
  return (t, e) => E(t, e, { get() {
    return (this.renderRoot ?? (jt ??= document.createDocumentFragment())).querySelectorAll(i);
  } });
}
function he(i) {
  return (t, e) => E(t, e, { async get() {
    return await this.updateComplete, this.renderRoot?.querySelector(i) ?? null;
  } });
}
function ae(i) {
  return (t, e) => {
    const { slot: s, selector: r } = i ?? {}, n = "slot" + (s ? `[name=${s}]` : ":not([name])");
    return E(t, e, { get() {
      const o = this.renderRoot?.querySelector(n), a = o?.assignedElements(i) ?? [];
      return r === void 0 ? a : a.filter(((h) => h.matches(r)));
    } });
  };
}
function le(i) {
  return (t, e) => {
    const { slot: s } = i ?? {}, r = "slot" + (s ? `[name=${s}]` : ":not([name])");
    return E(t, e, { get() {
      return this.renderRoot?.querySelector(r)?.assignedNodes(i) ?? [];
    } });
  };
}
const { I: ce } = Ot, It = (i) => i.strings === void 0;
const J = { ATTRIBUTE: 1, CHILD: 2 }, Q = (i) => (...t) => ({ _$litDirective$: i, values: t });
let X = class {
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, e, s) {
    this._$Ct = t, this._$AM = e, this._$Ci = s;
  }
  _$AS(t, e) {
    return this.update(t, e);
  }
  update(t, e) {
    return this.render(...e);
  }
};
const w = (i, t) => {
  const e = i._$AN;
  if (e === void 0) return !1;
  for (const s of e) s._$AO?.(t, !1), w(s, t);
  return !0;
}, L = (i) => {
  let t, e;
  do {
    if ((t = i._$AM) === void 0) break;
    e = t._$AN, e.delete(i), i = t;
  } while (e?.size === 0);
}, gt = (i) => {
  for (let t; t = i._$AM; i = t) {
    let e = t._$AN;
    if (e === void 0) t._$AN = e = /* @__PURE__ */ new Set();
    else if (e.has(i)) break;
    e.add(i), Bt(t);
  }
};
function qt(i) {
  this._$AN !== void 0 ? (L(this), this._$AM = i, gt(this)) : this._$AM = i;
}
function zt(i, t = !1, e = 0) {
  const s = this._$AH, r = this._$AN;
  if (r !== void 0 && r.size !== 0) if (t) if (Array.isArray(s)) for (let n = e; n < s.length; n++) w(s[n], !1), L(s[n]);
  else s != null && (w(s, !1), L(s));
  else w(this, i);
}
const Bt = (i) => {
  i.type == J.CHILD && (i._$AP ??= zt, i._$AQ ??= qt);
};
class Gt extends X {
  constructor() {
    super(...arguments), this._$AN = void 0;
  }
  _$AT(t, e, s) {
    super._$AT(t, e, s), gt(this), this.isConnected = t._$AU;
  }
  _$AO(t, e = !0) {
    t !== this.isConnected && (this.isConnected = t, t ? this.reconnected?.() : this.disconnected?.()), e && (w(this, t), L(this));
  }
  setValue(t) {
    if (It(this._$Ct)) this._$Ct._$AI(t, this);
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
const ue = () => new Wt();
class Wt {
}
const j = /* @__PURE__ */ new WeakMap(), $e = Q(class extends Gt {
  render(i) {
    return c;
  }
  update(i, [t]) {
    const e = t !== this.G;
    return e && this.G !== void 0 && this.rt(void 0), (e || this.lt !== this.ct) && (this.G = t, this.ht = i.options?.host, this.rt(this.ct = i.element)), c;
  }
  rt(i) {
    if (this.isConnected || (i = void 0), typeof this.G == "function") {
      const t = this.ht ?? globalThis;
      let e = j.get(t);
      e === void 0 && (e = /* @__PURE__ */ new WeakMap(), j.set(t, e)), e.get(this.G) !== void 0 && this.G.call(this.ht, void 0), e.set(this.G, i), i !== void 0 && this.G.call(this.ht, i);
    } else this.G.value = i;
  }
  get lt() {
    return typeof this.G == "function" ? j.get(this.ht ?? globalThis)?.get(this.G) : this.G?.value;
  }
  disconnected() {
    this.lt === this.ct && this.rt(void 0);
  }
  reconnected() {
    this.rt(this.ct);
  }
});
const pe = (i) => i ?? c;
class I extends X {
  constructor(t) {
    if (super(t), this.it = c, t.type !== J.CHILD) throw Error(this.constructor.directiveName + "() can only be used in child bindings");
  }
  render(t) {
    if (t === c || t == null) return this._t = void 0, this.it = t;
    if (t === _) return t;
    if (typeof t != "string") throw Error(this.constructor.directiveName + "() called with a non-string value");
    if (t === this.it) return this._t;
    this.it = t;
    const e = [t];
    return e.raw = e, this._t = { _$litType$: this.constructor.resultType, strings: e, values: [] };
  }
}
I.directiveName = "unsafeHTML", I.resultType = 1;
const fe = Q(I);
const mt = "important", Vt = " !" + mt, _e = Q(class extends X {
  constructor(i) {
    if (super(i), i.type !== J.ATTRIBUTE || i.name !== "style" || i.strings?.length > 2) throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
  }
  render(i) {
    return Object.keys(i).reduce(((t, e) => {
      const s = i[e];
      return s == null ? t : t + `${e = e.includes("-") ? e : e.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${s};`;
    }), "");
  }
  update(i, [t]) {
    const { style: e } = i.element;
    if (this.ft === void 0) return this.ft = new Set(Object.keys(t)), this.render(t);
    for (const s of this.ft) t[s] == null && (this.ft.delete(s), s.includes("-") ? e.removeProperty(s) : e[s] = null);
    for (const s in t) {
      const r = t[s];
      if (r != null) {
        this.ft.add(s);
        const n = typeof r == "string" && r.endsWith(Vt);
        s.includes("-") || n ? e.setProperty(s, n ? r.slice(0, -11) : r, n ? mt : "") : e[s] = r;
      }
    }
    return _;
  }
});
export {
  lt as CSSResult,
  H as LitElement,
  v as ReactiveElement,
  I as UnsafeHTMLDirective,
  te as _$LE,
  Ot as _$LH,
  Et as adoptStyles,
  ue as createRef,
  Zt as css,
  se as customElement,
  N as defaultConverter,
  re as eventOptions,
  tt as getCompatibleStyle,
  Jt as html,
  pe as ifDefined,
  ee as isServer,
  Xt as mathml,
  _ as noChange,
  B as notEqual,
  c as nothing,
  Dt as property,
  ne as query,
  oe as queryAll,
  ae as queryAssignedElements,
  le as queryAssignedNodes,
  he as queryAsync,
  $e as ref,
  Nt as render,
  kt as standardProperty,
  ie as state,
  _e as styleMap,
  q as supportsAdoptingStyleSheets,
  Qt as svg,
  vt as unsafeCSS,
  fe as unsafeHTML
};
