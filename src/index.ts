export interface AtlasOptions {
    library: Record<string, string>;
    observe?: HTMLElement;
    target?: HTMLElement;
}

export default class Atlas {
    start(options: AtlasOptions) {
        console.log("Atlas started with options:", options);
    }
}

