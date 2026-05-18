"use client";

import type { ChangeEvent, ReactNode } from "react";

type TopbarProps = {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  actions?: ReactNode;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
};

export default function Topbar({
  title,
  subtitle,
  showSearch = false,
  actions,
  searchValue,
  searchPlaceholder,
  onSearchChange
}: TopbarProps) {
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(event.target.value);
  };

  const inputProps = onSearchChange
    ? { value: searchValue ?? "", onChange: handleSearchChange }
    : { defaultValue: searchValue ?? "" };

  const hasTitle = title.trim().length > 0;

  return (
    <div className="topbar">
      {hasTitle && (
        <div className="topbar-text">
          {subtitle ? <p className="topbar-subtitle">{subtitle}</p> : null}
          <p className="topbar-title">{title}</p>
        </div>
      )}
      <div className={`topbar-actions${!hasTitle ? " topbar-actions--full" : ""}`}>
        {showSearch ? (
          <label className="search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle
                cx="11"
                cy="11"
                r="7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M20 20l-3.6-3.6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="search"
              placeholder={searchPlaceholder ?? "Search products"}
              aria-label="Search"
              {...inputProps}
            />
          </label>
        ) : null}
        {actions}
      </div>
    </div>
  );
}