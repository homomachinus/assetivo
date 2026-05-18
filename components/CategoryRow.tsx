"use client";

type CategoryRowProps = {
  items: string[];
};

function getAbbr(label: string) {
  const parts = label.split(" ").filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function CategoryRow({ items }: CategoryRowProps) {
  return (
    <div className="category-row">
      {items.map((label, index) => (
        <button
          key={label}
          type="button"
          className={`category-pill${index === 0 ? " active" : ""}`}
          aria-pressed={index === 0}
        >
          <span className="category-icon">
            <span className="category-letter">{getAbbr(label)}</span>
          </span>
          <span className="category-name">{label}</span>
        </button>
      ))}
    </div>
  );
}
