/**
 * @param {string} specifier
 * @param {{ parentURL?: string, conditions: string[] }} context
 * @param {(specifier: string, context?: { parentURL?: string, conditions: string[] }) => Promise<{ url: string, format?: string }>} nextResolve
 */
export async function resolve(specifier, context, nextResolve) {
    console.log(`[Custom Loader] Resolving: ${specifier}`); // Verification log

    // Example: Custom logic to handle specific prefixes or conditions
    // if (specifier.startsWith('my-custom-prefix:')) {
    //   return {
    //     url: new URL(specifier.replace('my-custom-prefix:', ''), 'file:///').href,
    //     format: 'module'
    //   };
    // }

    // Fallback to default resolution
    return nextResolve(specifier, context);
}

/**
 * @param {string} url
 * @param {{ format: string }} context
 * @param {(url: string, context: { format: string }) => Promise<{ source: string | SharedArrayBuffer | Uint8Array, format: string }>} nextLoad
 */
export async function load(url, context, nextLoad) {
    // Example: Custom logic to load non-standard files
    // if (url.endsWith('.custom')) {
    //     return {
    //         format: 'module',
    //         source: 'export default "custom content";',
    //     };
    // }

    return nextLoad(url, context);
}
