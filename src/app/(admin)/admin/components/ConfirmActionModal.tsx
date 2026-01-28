"use client";

import React, { useEffect } from "react";

/* ==================================================
   TYPES
================================================== */

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

/* ==================================================
   COMPONENT
================================================== */

export default function ConfirmActionModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}: Props) {
  /* ---------- ESC KEY ---------- */
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);
    return () =>
      document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  /* ---------- SCROLL LOCK ---------- */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="admin-modal-backdrop"
      onClick={onClose}
    >
      <div
        className={[
          "admin-modal",
          danger ? "admin-modal-danger" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ---------- TITLE ---------- */}
        <h3
          id="confirm-modal-title"
          className="admin-modal-title"
        >
          {title}
        </h3>

        {/* ---------- DESCRIPTION ---------- */}
        {description && (
          <p className="admin-modal-description">
            {description}
          </p>
        )}

        {/* ---------- ACTIONS ---------- */}
        <div className="admin-modal-actions">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="admin-modal-button"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={[
              "admin-modal-button",
              danger
                ? "admin-modal-button-danger"
                : "admin-modal-button-primary",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {loading ? "Processing…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
