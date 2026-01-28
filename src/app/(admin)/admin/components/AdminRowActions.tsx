"use client";

import React from "react";

/* ==================================================
   TYPES
================================================== */

export type AdminRowAction = {
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
};

type Props = {
  actions: readonly AdminRowAction[];
};

/* ==================================================
   COMPONENT
================================================== */

export default function AdminRowActions({ actions }: Props) {
  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div
      role="group"
      aria-label="Row actions"
      className="admin-row-actions"
    >
      {actions.map((action, index) => {
        const isDisabled = Boolean(action.disabled);
        const isDanger = Boolean(action.danger);

        return (
          <button
            key={index}
            type="button"
            onClick={isDisabled ? undefined : action.onClick}
            disabled={isDisabled}
            aria-disabled={isDisabled}
            className={[
              "admin-action",
              isDanger ? "admin-action-danger" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
