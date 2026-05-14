import { signal, computed } from "@preact/signals-core";

export const categories = ["Electronics", "Books", "Clothing", "Home"];
export const products = [
  { id: 1, name: "Laptop", category: "Electronics", price: 999 },
  { id: 2, name: "Smartphone", category: "Electronics", price: 699 },
  { id: 3, name: "Headphones", category: "Electronics", price: 199 },
  { id: 4, name: "React for Beginners", category: "Books", price: 39 },
  { id: 5, name: "Vue Mastery", category: "Books", price: 49 },
  { id: 6, name: "T-Shirt", category: "Clothing", price: 19 },
  { id: 7, name: "Jeans", category: "Clothing", price: 49 },
  { id: 8, name: "Lamp", category: "Home", price: 29 },
  { id: 9, name: "Coffee Maker", category: "Home", price: 89 },
];

export const selectedCategory = signal(null);
export const cart = signal([]);

export const filteredProducts = computed(() => {
  if (!selectedCategory.value) return products;
  return products.filter((p) => p.category === selectedCategory.value);
});

export const totalPrice = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.price, 0);
});

export const addToCart = (product) => {
  cart.value = [...cart.value, product];
};

export const removeFromCart = (product) => {
  cart.value = cart.value.filter((p) => p.id !== product.id);
};

export const toggleCategory = (category) => {
  if (selectedCategory.value === category) {
    selectedCategory.value = null;
  } else {
    selectedCategory.value = category;
  }
};
