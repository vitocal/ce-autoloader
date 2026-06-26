import { LitElement as e } from "lit";
//#region pages/components/vi/slotted-element.ts
var t = class extends e {
	slottedChildren;
	namedSlotContent;
	constructor() {
		super(), this.slottedChildren = [...this.childNodes], this.namedSlotContent = this.querySelectorAll("[slot]");
	}
	updated() {
		[...this.querySelectorAll("slot:not([filled])")].forEach((e) => {
			e.getAttribute("name") ? this._fillNamedSlot(e) : this._fillAnonSlot(e);
		});
	}
	_fillNamedSlot(e) {
		let t = [...this.namedSlotContent].find((t) => t.getAttribute("slot") === e.getAttribute("name"));
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
};
//#endregion
export { t as default };
