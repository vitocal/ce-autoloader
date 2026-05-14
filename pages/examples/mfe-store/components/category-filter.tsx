import React, { useState, useEffect } from "react";
import r2wc from "@r2wc/react-to-web-component";
import { categories, selectedCategory, toggleCategory } from "../store.js";
import { effect } from "@preact/signals-core";

const CategoryFilter = () => {
  const [currentCategory, setCurrentCategory] = useState(selectedCategory.value);

  useEffect(() => {
    return effect(() => {
      setCurrentCategory(selectedCategory.value);
    });
  }, []);

  return (
    <div style={{ padding: "20px", background: "#f0f0f0", borderRadius: "8px" }}>
      <h2 style={{ color: "#61dafb" }}>React Categories</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {categories.map((cat) => (
          <li key={cat} style={{ marginBottom: "10px" }}>
            <button
              onClick={() => toggleCategory(cat)}
              style={{
                width: "100%",
                padding: "10px",
                background: currentCategory === cat ? "#61dafb" : "white",
                color: currentCategory === cat ? "white" : "black",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {cat}
            </button>
          </li>
        ))}
      </ul>
      {currentCategory && (
        <button
          onClick={() => toggleCategory(null)}
          style={{ marginTop: "10px", background: "#ccc", border: "none", padding: "5px 10px", borderRadius: "4px" }}
        >
          Clear Filter
        </button>
      )}
    </div>
  );
};

const WebCategoryFilter = r2wc(CategoryFilter, {});
customElements.define("category-filter", WebCategoryFilter);
export default WebCategoryFilter;
