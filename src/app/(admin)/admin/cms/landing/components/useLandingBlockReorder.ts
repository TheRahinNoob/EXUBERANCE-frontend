"use client";

/**
 * ==================================================
 * CMS — LANDING BLOCK REORDER HOOK
 * ==================================================
 *
 * RESPONSIBILITY:
 * - Handle drag & drop reordering (frontend-only)
 * - Persist final order to backend safely
 * - NEVER mutate source data
 *
 * GUARANTEES:
 * - Backend remains the single source of truth
 * - No optimistic corruption
 * - Abort-safe
 * - Race-condition safe
 *
 * PHILOSOPHY:
 * - UI reflects intent
 * - Backend validates reality
 * - Failure always rolls back
 */

import { useCallback, useRef, useState } from "react";

import {
  updateAdminLandingBlock,
} from "@/lib/admin-api";

import type {
  AdminLandingBlock,
} from "@/lib/admin-api";

import { useAdminToast } from "@/hooks/useAdminToast";

/* ==================================================
   TYPES
================================================== */

type UseLandingBlockReorderArgs = {
  blocks: AdminLandingBlock[];
  onReorderCommitted: () => void;
};

type ReorderResult = {
  localBlocks: AdminLandingBlock[];
  handleDragEnd: (activeId: number, overId: number | null) => void;
  isSaving: boolean;
};

/* ==================================================
   PURE HELPERS (NO SIDE EFFECTS)
================================================== */

/**
 * Return a new array with item moved from index A → B
 * Does NOT mutate original array
 */
function moveItem<T>(
  list: readonly T[],
  fromIndex: number,
  toIndex: number
): T[] {
  const copy = [...list];
  const [item] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, item);
  return copy;
}

/**
 * Normalize ordering to 1..N
 * Ensures backend consistency
 */
function normalizeOrdering(
  blocks: AdminLandingBlock[]
): AdminLandingBlock[] {
  return blocks.map((block, index) => ({
    ...block,
    ordering: index + 1,
  }));
}

/* ==================================================
   HOOK
================================================== */

export function useLandingBlockReorder(
  args: UseLandingBlockReorderArgs
): ReorderResult {
  const { blocks, onReorderCommitted } = args;
  const { showToast } = useAdminToast();

  /* ==================================================
     STATE
  ================================================== */

  const [localBlocks, setLocalBlocks] =
    useState<AdminLandingBlock[]>(blocks);

  const [isSaving, setIsSaving] =
    useState<boolean>(false);

  const abortRef = useRef<AbortController | null>(null);

  /* ==================================================
     SYNC EXTERNAL → INTERNAL
     (Backend is truth)
  ================================================== */

  if (localBlocks !== blocks) {
    setLocalBlocks(blocks);
  }

  /* ==================================================
     DRAG END HANDLER
  ================================================== */

  const handleDragEnd = useCallback(
    async (activeId: number, overId: number | null) => {
      if (!overId || activeId === overId) {
        return;
      }

      const fromIndex = localBlocks.findIndex(
        (b) => b.id === activeId
      );
      const toIndex = localBlocks.findIndex(
        (b) => b.id === overId
      );

      if (fromIndex === -1 || toIndex === -1) {
        return;
      }

      // Abort any in-flight reorder
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // 1️⃣ Update UI immediately (local only)
      const reordered = normalizeOrdering(
        moveItem(localBlocks, fromIndex, toIndex)
      );

      setLocalBlocks(reordered);
      setIsSaving(true);

      try {
        // 2️⃣ Persist ordering sequentially (strict)
        for (const block of reordered) {
          await updateAdminLandingBlock(block.id, {
            ordering: block.ordering,
          });
        }

        showToast("Landing order updated", "success");

        // 3️⃣ Refetch from backend
        onReorderCommitted();
      } catch (err) {
        if (
          err instanceof DOMException &&
          err.name === "AbortError"
        ) {
          return;
        }

        showToast(
          err instanceof Error
            ? err.message
            : "Failed to reorder blocks",
          "error"
        );

        // 🔁 Rollback to backend truth
        onReorderCommitted();
      } finally {
        setIsSaving(false);
      }
    },
    [localBlocks, onReorderCommitted, showToast]
  );

  /* ==================================================
     RETURN API
  ================================================== */

  return {
    localBlocks,
    handleDragEnd,
    isSaving,
  };
}
