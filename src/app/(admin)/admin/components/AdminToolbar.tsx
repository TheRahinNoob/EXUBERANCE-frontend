"use client";

import React, { ChangeEvent, memo } from "react";

/* ==================================================
   TYPES
================================================== */

export type StatusOption = {
  value: string;
  label: string;
};

type Props = {
  left?: React.ReactNode;
  right?: React.ReactNode;

  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;

  statusValue?: string;
  statusOptions?: StatusOption[];
  onStatusChange?: (value: string) => void;

  disabled?: boolean;
};

/* ==================================================
   COMPONENT
================================================== */

function AdminToolbar({
  left,
  right,

  searchValue = "",
  searchPlaceholder = "Search…",
  onSearchChange,

  statusValue = "",
  statusOptions,
  onStatusChange,

  disabled = false,
}: Props) {
  return (
    <div
      role="region"
      aria-label="Admin toolbar"
      aria-disabled={disabled}
      className={[
        "admin-toolbar",
        disabled ? "admin-toolbar-disabled" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* ---------- LEFT: FILTERS ---------- */}
      <div className="admin-toolbar-left">
        {onSearchChange && (
          <input
            type="search"
            value={searchValue}
            placeholder={searchPlaceholder}
            aria-label="Search"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onSearchChange(e.target.value)
            }
            className="admin-input"
          />
        )}

        {statusOptions && onStatusChange && (
          <select
            value={statusValue}
            aria-label="Filter by status"
            onChange={(e) => onStatusChange(e.target.value)}
            className="admin-select"
          >
            <option value="">All statuses</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {left}
      </div>

      {/* ---------- RIGHT: ACTIONS ---------- */}
      <div className="admin-toolbar-right">
        {right}
      </div>
    </div>
  );
}

/* ==================================================
   EXPORT
================================================== */

export default memo(AdminToolbar);
