"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

/* ==================================================
   TYPES — SINGLE SOURCE OF TRUTH
================================================== */

/**
 * Allowed toast variants
 * DO NOT redefine this type anywhere else.
 */
export type ToastType =
  | "success"
  | "error"
  | "warning"
  | "info";

/**
 * Toast invocation signature
 */
export type ShowToast = (
  message: string,
  type?: ToastType,
  durationMs?: number
) => void;

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

/* ==================================================
   CONTEXT
================================================== */

export const AdminToastContext = createContext<{
  showToast: ShowToast;
} | null>(null);

/* ==================================================
   PROVIDER
================================================== */

export function AdminToastProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  /* ==================================================
     SHOW TOAST (PUBLIC API)
  ================================================== */

  const showToast: ShowToast = useCallback(
    (
      message: string,
      type: ToastType = "success",
      durationMs: number = 3000
    ) => {
      const id = Date.now() + Math.random();

      setToasts((prev) => [
        ...prev,
        { id, message, type },
      ]);

      setTimeout(() => {
        setToasts((prev) =>
          prev.filter((t) => t.id !== id)
        );
      }, durationMs);
    },
    []
  );

  /* ==================================================
     RENDER
  ================================================== */

  return (
    <AdminToastContext.Provider value={{ showToast }}>
      {children}

      {/* ================= TOAST STACK ================= */}
      <div
        aria-live="assertive"
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          zIndex: 2000,
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            style={{
              minWidth: 220,
              padding: "10px 14px",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              color: "#ffffff",
              backgroundColor: toastColorMap[toast.type],
              boxShadow:
                "0 6px 14px rgba(0,0,0,0.18)",
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </AdminToastContext.Provider>
  );
}

/* ==================================================
   HOOK (INTERNAL USE ONLY)
================================================== */

export function useAdminToastContext() {
  const ctx = useContext(AdminToastContext);

  if (!ctx) {
    throw new Error(
      "useAdminToast must be used inside <AdminToastProvider>"
    );
  }

  return ctx;
}

/* ==================================================
   STYLES
================================================== */

const toastColorMap: Record<ToastType, string> = {
  success: "#16a34a", // green
  error: "#dc2626",   // red
  warning: "#f59e0b", // amber
  info: "#2563eb",    // blue
};
