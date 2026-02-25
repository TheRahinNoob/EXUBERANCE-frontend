"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import AdminTable from "../../../components/AdminTable";
import { useAdminToast } from "@/hooks/useAdminToast";

import {
  fetchAdminProductVariants,
  createAdminProductVariant,
  bulkCreateAdminProductVariants,
  updateAdminVariantStock,
  deleteAdminVariant,
  type AdminProductVariant,
  type AdminBulkVariantCreateResult,
} from "@/lib/admin-api/product-variants";

/* ==================================================
   PROPS
================================================== */

type Props = {
  productId: number;
};

/* ==================================================
   HELPERS
================================================== */

function normalizeToken(value: unknown): string {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function uniqPreserveOrder(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items) {
    const s = normalizeToken(raw);
    if (!s) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

function parseSizesInput(input: string): string[] {
  // Accept: "38 40 42", "38,40,42", "38\n40\n42", and mixes.
  // Strategy:
  // 1) split by newlines/commas/semicolons
  // 2) split each chunk by whitespace
  // 3) normalize + dedupe
  const chunks = input.split(/[\n,;]+/g);

  const parts = chunks.flatMap((chunk) =>
    chunk
      .split(/\s+/g)
      .map((s) => normalizeToken(s))
      .filter(Boolean)
  );

  return uniqPreserveOrder(parts);
}

function sortVariantsStable(items: AdminProductVariant[]): AdminProductVariant[] {
  // Deterministic sort: color -> size -> id
  // Avoid locale pitfalls by using localeCompare with base sensitivity
  return [...items].sort((a, b) => {
    const c = a.color.localeCompare(b.color, undefined, { sensitivity: "base" });
    if (c !== 0) return c;

    const s = a.size.localeCompare(b.size, undefined, { sensitivity: "base" });
    if (s !== 0) return s;

    return a.id - b.id;
  });
}

function mergeVariants(
  prev: AdminProductVariant[],
  incoming: AdminProductVariant[]
): AdminProductVariant[] {
  if (incoming.length === 0) return prev;

  const map = new Map<number, AdminProductVariant>();
  for (const v of prev) map.set(v.id, v);

  for (const v of incoming) map.set(v.id, v);

  return sortVariantsStable(Array.from(map.values()));
}

/* ==================================================
   COMPONENT
================================================== */

export default function AdminProductVariantManager({ productId }: Props) {
  const { showToast } = useAdminToast();

  /* ==================================================
     STATE
  ================================================== */

  const [variants, setVariants] = useState<AdminProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Single create (fallback)
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [stock, setStock] = useState<number>(0);
  const [creating, setCreating] = useState(false);

  // Bulk create (primary UX)
  const [bulkColor, setBulkColor] = useState("");
  const [bulkSizes, setBulkSizes] = useState(""); // textarea
  const [bulkStock, setBulkStock] = useState<number>(0);
  const [bulkCreating, setBulkCreating] = useState(false);

  // Stock inputs: keep controlled drafts so UX is predictable (no defaultValue/onBlur mismatch)
  const [stockDrafts, setStockDrafts] = useState<Record<number, string>>({});

  // Avoid race updates when productId changes quickly
  const requestSeq = useRef(0);

  const busy = creating || bulkCreating;

  const bulkSizesParsed = useMemo(() => parseSizesInput(bulkSizes), [bulkSizes]);

  const bulkSummary = useMemo(() => {
    if (bulkSizesParsed.length === 0) return "—";
    // show first N sizes to avoid huge line
    const N = 24;
    const preview =
      bulkSizesParsed.length > N
        ? `${bulkSizesParsed.slice(0, N).join(", ")} … (+${
            bulkSizesParsed.length - N
          })`
        : bulkSizesParsed.join(", ");
    return preview;
  }, [bulkSizesParsed]);

  /* ==================================================
     LOAD VARIANTS
  ================================================== */

  const loadVariants = useCallback(async () => {
    const seq = ++requestSeq.current;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchAdminProductVariants(productId);
      if (seq !== requestSeq.current) return;

      const sorted = sortVariantsStable(data);
      setVariants(sorted);

      // Initialize drafts
      const drafts: Record<number, string> = {};
      for (const v of sorted) drafts[v.id] = String(v.stock);
      setStockDrafts(drafts);
    } catch (err) {
      if (seq !== requestSeq.current) return;
      setError(err instanceof Error ? err.message : "Failed to load variants");
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadVariants();
  }, [loadVariants]);

  /* ==================================================
     CREATE VARIANT (SINGLE)
  ================================================== */

  const handleCreate = async () => {
    if (creating || bulkCreating) return;

    const sizeValue = normalizeToken(size);
    const colorValue = normalizeToken(color);

    if (!sizeValue || !colorValue) {
      showToast("Size and color are required", "error");
      return;
    }
    if (!Number.isFinite(stock) || stock < 0) {
      showToast("Stock cannot be negative", "error");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const created = await createAdminProductVariant(productId, {
        size: sizeValue,
        color: colorValue,
        stock: Math.trunc(stock),
      });

      setVariants((prev) => mergeVariants(prev, [created]));
      setStockDrafts((prev) => ({ ...prev, [created.id]: String(created.stock) }));

      setSize("");
      setColor("");
      setStock(0);

      showToast("Variant created", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create variant", "error");
    } finally {
      setCreating(false);
    }
  };

  /* ==================================================
     BULK CREATE (ONE COLOR + MANY SIZES)
  ================================================== */

  const handleBulkCreate = async () => {
    if (bulkCreating || creating) return;

    const colorValue = normalizeToken(bulkColor);

    if (!colorValue) {
      showToast("Color is required for bulk add", "error");
      return;
    }
    if (!Number.isFinite(bulkStock) || bulkStock < 0) {
      showToast("Stock cannot be negative", "error");
      return;
    }
    if (bulkSizesParsed.length === 0) {
      showToast("Add at least one size (comma / space / newline separated)", "error");
      return;
    }

    setBulkCreating(true);
    setError(null);

    try {
      const result: AdminBulkVariantCreateResult = await bulkCreateAdminProductVariants(
        productId,
        {
          color: colorValue,
          sizes: bulkSizesParsed,
          default_stock: Math.trunc(bulkStock),
        }
      );

      // Merge created items
      if (result.created.length > 0) {
        setVariants((prev) => mergeVariants(prev, result.created));
        setStockDrafts((prev) => {
          const next = { ...prev };
          for (const v of result.created) next[v.id] = String(v.stock);
          return next;
        });
      }

      // Toast summary
      const createdCount = result.created.length;
      const skippedCount = result.skipped_existing.length;

      if (createdCount > 0 && skippedCount === 0) {
        showToast(`Added ${createdCount} variants`, "success");
      } else if (createdCount > 0 && skippedCount > 0) {
        showToast(`Added ${createdCount}, skipped ${skippedCount} existing`, "success");
      } else {
        showToast("No new variants added (all already existed)", "success");
      }

      // Reset sizes input (keep color/stock for speed)
      setBulkSizes("");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to bulk create variants",
        "error"
      );
    } finally {
      setBulkCreating(false);
    }
  };

  /* ==================================================
     STOCK EDITING (CONTROLLED INPUTS)
================================================== */

  const setDraft = (variantId: number, value: string) => {
    setStockDrafts((prev) => ({ ...prev, [variantId]: value }));
  };

  const commitStock = async (variant: AdminProductVariant) => {
    const draft = stockDrafts[variant.id] ?? String(variant.stock);
    const trimmed = normalizeToken(draft);

    if (trimmed === "") {
      // revert to current
      setDraft(variant.id, String(variant.stock));
      return;
    }

    const n = Number(trimmed);

    if (!Number.isFinite(n) || Number.isNaN(n)) {
      showToast("Stock must be a number", "error");
      setDraft(variant.id, String(variant.stock));
      return;
    }

    const newStock = Math.trunc(n);

    if (newStock < 0) {
      showToast("Stock cannot be negative", "error");
      setDraft(variant.id, String(variant.stock));
      return;
    }

    if (newStock === variant.stock) return;

    // Optimistic update
    const snapshot = variants;
    setVariants((prev) =>
      prev.map((v) => (v.id === variant.id ? { ...v, stock: newStock } : v))
    );

    try {
      await updateAdminVariantStock(variant.id, newStock);
      showToast("Stock updated", "success");
    } catch (err) {
      setVariants(snapshot);
      setDraft(variant.id, String(variant.stock));
      showToast(err instanceof Error ? err.message : "Failed to update stock", "error");
    }
  };

  /* ==================================================
     DELETE VARIANT
================================================== */

  const handleDelete = async (variantId: number) => {
    if (busy) return;

    const confirmed = window.confirm("Delete this variant permanently?");
    if (!confirmed) return;

    try {
      await deleteAdminVariant(variantId);

      setVariants((prev) => prev.filter((v) => v.id !== variantId));
      setStockDrafts((prev) => {
        const next = { ...prev };
        delete next[variantId];
        return next;
      });

      showToast("Variant deleted", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete variant", "error");
    }
  };

  /* ==================================================
     RENDER
  ================================================== */

  return (
    <section className="admin-section">
      <div className="admin-section-title">Product Variants</div>

      {/* ERROR */}
      {error && <div className="admin-error">{error}</div>}

      {/* BULK CREATE (PRIMARY UX) */}
      <div className="admin-form-row" style={{ marginBottom: 12 }}>
        <div className="admin-form-group">
          <label>Bulk Color</label>
          <input
            placeholder="e.g. Blue"
            value={bulkColor}
            onChange={(e) => setBulkColor(e.target.value)}
            disabled={bulkCreating || creating}
          />
        </div>

        <div className="admin-form-group" style={{ flex: 2 }}>
          <label>
            Bulk Sizes{" "}
            <span className="mono" style={{ opacity: 0.7 }}>
              (comma / space / newline)
            </span>
          </label>
          <textarea
            placeholder={`e.g.\n38 40 42 44\nor\n38,40,42,44`}
            value={bulkSizes}
            onChange={(e) => setBulkSizes(e.target.value)}
            disabled={bulkCreating || creating}
            style={{
              width: "100%",
              minHeight: 80,
              resize: "vertical",
            }}
          />
          <div className="mono" style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
            Parsed sizes: {bulkSummary}
          </div>
        </div>

        <div className="admin-form-group">
          <label>Default Stock</label>
          <input
            type="number"
            min={0}
            value={bulkStock}
            onChange={(e) => setBulkStock(Number(e.target.value))}
            disabled={bulkCreating || creating}
          />
        </div>

        <div className="admin-form-group">
          <label>&nbsp;</label>
          <button
            className="admin-action admin-action-primary"
            onClick={handleBulkCreate}
            disabled={bulkCreating || creating}
            title="Create all missing variants for this color"
          >
            {bulkCreating ? "Adding…" : "Bulk Add"}
          </button>
        </div>
      </div>

      {/* SINGLE CREATE (FALLBACK / EDGE CASES) */}
      <div className="admin-form-row">
        <div className="admin-form-group">
          <label>Size</label>
          <input
            placeholder="e.g. M"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            disabled={creating || bulkCreating}
          />
        </div>

        <div className="admin-form-group">
          <label>Color</label>
          <input
            placeholder="e.g. Black"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            disabled={creating || bulkCreating}
          />
        </div>

        <div className="admin-form-group">
          <label>Stock</label>
          <input
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            disabled={creating || bulkCreating}
          />
        </div>

        <div className="admin-form-group">
          <label>&nbsp;</label>
          <button
            className="admin-action admin-action-primary"
            onClick={handleCreate}
            disabled={creating || bulkCreating}
          >
            {creating ? "Adding…" : "Add Variant"}
          </button>
        </div>
      </div>

      {/* TABLE */}
      <AdminTable>
        <thead>
          <tr>
            <th align="left">Size</th>
            <th align="left">Color</th>
            <th align="left">Stock</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan={4} className="admin-table-empty">
                Loading variants…
              </td>
            </tr>
          )}

          {!loading && variants.length === 0 && (
            <tr>
              <td colSpan={4} className="admin-table-empty">
                No variants added yet
              </td>
            </tr>
          )}

          {!loading &&
            variants.map((variant) => (
              <tr key={variant.id}>
                <td>{variant.size}</td>
                <td>{variant.color}</td>
                <td>
                  <input
                    type="number"
                    min={0}
                    className="admin-input-sm"
                    value={stockDrafts[variant.id] ?? String(variant.stock)}
                    onChange={(e) => setDraft(variant.id, e.target.value)}
                    onBlur={() => commitStock(variant)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        // Commit on Enter (and blur to match UX)
                        (e.currentTarget as HTMLInputElement).blur();
                      } else if (e.key === "Escape") {
                        // Revert on Escape
                        setDraft(variant.id, String(variant.stock));
                        (e.currentTarget as HTMLInputElement).blur();
                      }
                    }}
                    disabled={busy}
                    aria-label={`Stock for ${variant.color} ${variant.size}`}
                  />
                </td>
                <td>
                  <button
                    className="admin-action admin-action-danger"
                    onClick={() => handleDelete(variant.id)}
                    disabled={busy}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </AdminTable>
    </section>
  );
}