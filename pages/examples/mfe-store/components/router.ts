import Navigo, { Match } from 'navigo';
import { match } from 'node:assert';

const BASE_URL = '/pages/examples/mfe-store'

class ViRouter extends HTMLElement {
    public router: Navigo | null = null;
    static get observedAttributes(): string[] {
        return ['root'];
    }
    connectedCallback() {
        const root = this.getAttribute('root') || BASE_URL;

        this.router = new Navigo("/", { hash: true });
        this.setupRoutes();
        this.setupLinkInterception();

        this.router.resolve();
    }

    disconnectedCallback(): void {
        if (this.router) {
            debugger;
            this.router.destroy();
            this.router = null;
        }
    }

    private setupRoutes(): void {
        if (!this.router) return;

        this.router
            .on({
                /**
                 * Team Explore
                 */
                '/': {
                    as: 'home',
                    uses: () => {
                        this.render('<explore-page-home data-boundary-page="explore"></explore-page-home>');
                    }
                },
                '/products': {
                    as: 'explore-pages-products',
                    uses: () => {
                        this.render(`<explore-page-category data-boundary-page="explore"></explore-page-category>`);
                    },
                },
                '/products/:id': {
                    as: 'explore-pages-products-bycategory',
                    uses: (match: Match) => {
                        const id = match.data?.id || ''
                        this.render(`<explore-page-category data-boundary-page="explore" category="${id}"></explore-page-category>`);
                    },
                },

                /**
                 * Team Decide
                 */
                '/product/:id': {
                    as: 'decides-pages-product',
                    uses: (match: Match) => {
                        const id = match.data?.id
                        const sku = match.params?.sku || ''

                        this.render(`<decide-pages-product data-boundary-page="decide" id="${id}" sku="${sku}"></decide-page-product>`);
                    }
                }
            })
            .notFound(() => {
                this.render('<h1>404 - Page Not Found</h1>');
            });
    }

    private setupLinkInterception(): void {
        this.addEventListener('click', (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            const link = target?.closest<HTMLAnchorElement>('a[data-navigo]');

            if (link && this.router) {
                event.preventDefault();
                const href = link.getAttribute('href');
                if (href) {
                    debugger;
                    this.router.navigate(href);
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                }
            }
        });
    }

    public navigate(path: string): void {
        if (this.router) {
            this.router.navigate(path);
        }
    }

    private render(htmlContent: string): void {
        this.innerHTML = htmlContent;
    }
}
customElements.define('vi-router', ViRouter);
