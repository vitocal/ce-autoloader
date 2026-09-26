/** Shared design-system web-components  */
export const catalog = {
    "ds-*": async (ce_name) => {
        const [_prefix, name] = ce_name.split('-');
        const module = await import(/* @vite-ignore */`./${name}.jsx`);

        return module;
    }
}
export default catalog;