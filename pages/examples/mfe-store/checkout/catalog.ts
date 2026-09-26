export const catalog = {
    "checkout-*": async (ce_name: string) => {

        const [_prefix, type, name] = ce_name.split('-');
        const module = await import(`./${type}/${name}.svelte`);

        return module;
    }
};
export default catalog;