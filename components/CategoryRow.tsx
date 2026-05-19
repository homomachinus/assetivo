"use client";

export type CategoryRowItem = {
  id: string;
  label: string;
};

type CategoryRowProps = {
  items: CategoryRowItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
};

function getAbbr(label: string) {
  if (!label) {
    return "--";
  }
  const parts = label.split(" ").filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function CategoryRow({ items, activeId, onSelect }: CategoryRowProps) {
  return (
    <div className="category-row-wrap">
      <div className="category-row">
        {items.map((item) => {
          const isActive = activeId ? activeId === item.id : false;
          return (
            <button
              key={item.id}
              type="button"
              className={`category-pill${isActive ? " active" : ""}`}
              aria-pressed={isActive}
              onClick={() => onSelect?.(item.id)}
            >
              <span className="category-icon">
                <span className="category-letter">{getAbbr(item.label)}</span>
              </span>
              <span className="category-name">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
