"use client";

const categories = [
  { label: "Shirts", abbr: "SR" },
  { label: "Pants", abbr: "PN" },
  { label: "Caps", abbr: "CP" },
  { label: "Bags", abbr: "BG" },
  { label: "Shoes", abbr: "SN" },
  { label: "Watches", abbr: "WT" },
  { label: "Jackets", abbr: "JK" },
  { label: "Accessories", abbr: "AC" }
];

export default function CategoryRow() {
  return (
    <div className="category-row">
      {categories.map((category, index) => (
        <button
          key={category.label}
          type="button"
          className={`category-pill${index === 0 ? " active" : ""}`}
          aria-pressed={index === 0}
        >
          <span className="category-icon">
            <span className="category-letter">{category.abbr}</span>
          </span>
          <span className="category-name">{category.label}</span>
        </button>
      ))}
    </div>
  );
}
