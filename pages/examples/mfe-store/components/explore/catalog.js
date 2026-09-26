export const catalog = {
  "explore-header": () => import("./components/Header"),
  "explore-recommendations": () => import("./components/Recommendations"),
  "explore-footer": () => import("./components/Footer"),

  "explore-page-home": () => import("./pages/HomePage"),
  "explore-page-category": () => import("./pages/CategoryPage"),
};

export default catalog;
