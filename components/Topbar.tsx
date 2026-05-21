"use client";

import type { ChangeEvent } from "react";
import DarkModeToggle from "./DarkModeToggle";

type TopbarProps = {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
};

export default function Topbar({
  title,
  subtitle,
  showSearch = false,
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
        <a
          href="mailto:atmint@assetivo.store"
          className="icon-btn"
          aria-label="Customer Service"
          title="Customer Service"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </a>
        <DarkModeToggle />
      </div>
    </div>
  );
}