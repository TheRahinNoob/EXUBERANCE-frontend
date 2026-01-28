import {
  useAdminToastContext,
} from "../app/(admin)/admin/components/AdminToastProvider";

/* ==================================================
   TOAST TYPES — SINGLE SOURCE OF TRUTH
   (extend safely without breaking callers)
================================================== */

export type ToastType =
  | "success"
  | "error"
  | "warning"
  | "info";

/* ==================================================
   TOAST CONTRACT
================================================== */

export type ShowToast = (
  message: string,
  type?: ToastType,
  durationMs?: number
) => void;

/* ==================================================
   HOOK
================================================== */

/**
 * Admin toast hook
 *
 * Guarantees:
 * - Strict toast type safety
 * - Supports info/success/error/warning
 * - Safe default fallbacks
 * - Centralized admin UX feedback
 */
export function useAdminToast(): {
  showToast: ShowToast;
} {
  const context = useAdminToastContext();

  if (!context || typeof context.showToast !== "function") {
    throw new Error(
      "useAdminToast must be used within <AdminToastProvider>"
    );
  }

  return {
    showToast: context.showToast,
  };
}
