import { adoptStylesheet } from "./utils"

export const catalog = {
    "decide-*": async (ce_name: string) => {
        const { defineCustomElement } = await import("vue");

        const [_prefix, type, name] = ce_name.split('-');
        const module = await import(`./${type}/${name}.ce.vue`);

        return defineCustomElement(module.default, { shadowRoot: false })
    }
    // "decide-page-product": async (name: string) => {
    //     const { defineCustomElement } = await import("vue");
    //     const module = await import('./pages/ProductPage.ce.vue')

    //     const ce = defineCustomElement(module.default, { shadowRoot: false })

    //     /** Workaround vue + shadowroots + styles */
    //     // const styles = module.default.styles;
    //     // const csssheet = new CSSStyleSheet();
    //     // csssheet.replaceSync(styles.join('\n'))

    //     // adoptStylesheet(document, csssheet);

    //     return ce;
    // },
    // "variant-option": async () => {
    //     const { defineCustomElement } = await import("vue");
    //     const module = await import('./components/variant-option.ce.vue')

    //     return defineCustomElement(module.default, { shadowRoot: false })
    // }
};
export default catalog;