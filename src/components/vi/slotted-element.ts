import { LitElement } from 'lit';

/*
 This mimics the behavior of <slot>s in a light DOM LitElement. It supports both
 named slots (`<slot name="foo">`) and anonymous slots (`<slot>`). This has not
 been heavily tested yet, but seems to work for most simple use cases using
 Lit 3.1.4.

 There are a few minor differences between Shadow DOM and this, particularly if:
 - you attempt to add content to a named slot but that slot isn't defined in the
   component's render()
 - you add child content outside the named slots.

 In both cases, this content is displayed inside the component, while a Shadow
 DOM implementation suppresses them.  This could probably be cleaned up with a
 little more code, but they're edge cases I can live with.
*/
class SlottedElement extends LitElement {
    constructor() {
        super();
        this.slottedChildren = [...this.childNodes];
        this.namedSlotContent = this.querySelectorAll('[slot]');
    }

    updated() {
        const slots = [...this.querySelectorAll('slot:not([filled])')];
        slots.forEach((slot) => {
            const name = slot.getAttribute('name');

            if (name) {
                this._fillNamedSlot(slot);
            } else {
                this._fillAnonSlot(slot);
            }
        });
    }

    _fillNamedSlot(slot) {
        const content = [...this.namedSlotContent].find(
            (el) => el.getAttribute('slot') === slot.getAttribute('name')
        );
        if (content) {
            slot.parentElement.replaceChild(content, slot);
        }
        slot.setAttribute('filled', '');
    }

    _fillAnonSlot(slot) {
        this.slottedChildren.forEach((child) => {
            if (child === slot) {
                return;
            }
            slot.parentElement.insertBefore(child, slot);
        });
        slot.parentElement.removeChild(slot);
        slot.setAttribute('filled', '');
    }

    createRenderRoot() {
        return this;
    }
}
export default SlottedElement;