import { signal, effect } from "@preact/signals-core";

const STORAGE_KEY = "tractor_shopping_cart";

/**
 * Helper to safely read and parse initial state from localStorage
 */
function getInitialCart() {
    if (typeof window === "undefined") return [];

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to load cart from localStorage:", error);
        return [];
    }
}

/**
 * Reactive cart signal initialized with localStorage data
 */
export const cart = signal(getInitialCart());

/**
 * Automatically syncs cart signal updates back to localStorage
 */
if (typeof window !== "undefined") {
    effect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart.value));
        } catch (error) {
            console.error("Failed to save cart to localStorage:", error);
        }
    });
}

export const addToCart = (sku) => {
    const items = [...cart.value];
    const lineItem = items.find((i) => i.sku === sku);

    if (lineItem) {
        lineItem.quantity++;
    } else {
        items.push({ sku, quantity: 1 });
    }

    cart.value = items;
};

export const removeFromCart = (sku) => {
    cart.value = cart.value.filter((i) => i.sku !== sku);
};

export const placeOrder = () => {
    cart.value = [];
}
