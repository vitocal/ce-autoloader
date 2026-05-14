import { LitElement as n } from "lit";
class o extends n {
  constructor() {
    super(), this.slottedChildren = [...this.childNodes], this.namedSlotContent = this.querySelectorAll("[slot]");
  }
  updated() {
    [...this.querySelectorAll("slot:not([filled])")].forEach((t) => {
      t.getAttribute("name") ? this._fillNamedSlot(t) : this._fillAnonSlot(t);
    });
  }
  _fillNamedSlot(e) {
    const t = [...this.namedSlotContent].find(
      (l) => l.getAttribute("slot") === e.getAttribute("name")
    );
    t && e.parentElement?.replaceChild(t, e), e.setAttribute("filled", "");
  }
  _fillAnonSlot(e) {
    this.slottedChildren.forEach((t) => {
      t !== e && e.parentElement?.insertBefore(t, e);
    }), e.parentElement?.removeChild(e), e.setAttribute("filled", "");
  }
  createRenderRoot() {
    return this;
  }
}
export {
  o as default
};
