"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import AdminTable from "../../../components/AdminTable";
import { useAdminToast } from "@/hooks/useAdminToast";

import {
  fetchAdminProductVariants,
  createAdminProductVariant,
  bulkCreateAdminProductVariants,
  updateAdminVariant,
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
  return [...items].sort((a, b) => {
    const c = a.color.localeCompare(b.color, undefined, { sensitivity: "base" });
    if (c !== 0) return c;

    const s = a.size.localeCompare(b.size, undefined, { sensitivity: "base" });
    if (s !== 0) return s;

    return a.id - b.id;
  });
}

function mergeVariants(prev: AdminProductVariant[], incoming: AdminProductVariant[]): AdminProductVariant[] {
  if (incoming.length === 0) return prev;

  const map = new Map<number, AdminProductVariant>();
  for (const v of prev) map.set(v.id, v);
  for (const v of incoming) map.set(v.id, v);

  return sortVariantsStable(Array.from(map.values()));
}

/**
 * Returns:
 * - "" if empty
 * - "#RRGGBB" if valid (upper)
 * - "__INVALID__" if invalid
 */
function normalizeHexColorInput(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const upper = raw.toUpperCase();
  if (!/^#[0-9A-F]{6}$/.test(upper)) return "__INVALID__";
  return upper;
}

function isValidHexOrEmpty(value: string): boolean {
  if (!value) return true;
  return /^#[0-9A-F]{6}$/.test(value.toUpperCase());
}

function Swatch({ hex }: { hex: string }) {
  const valid = isValidHexOrEmpty(hex);
  const bg = valid && hex ? hex : undefined;

  return (
    <span
      title={hex ? hex : "No hex"}
      aria-label={hex ? `Color ${hex}` : "No color hex"}
      style={{
        display: "inline-block",
        width: 14,
        height: 14,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.25)",
        background: bg ?? "transparent",
        verticalAlign: "middle",
        marginRight: 8,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15)",
      }}
    />
  );
}

/* ==================================================
   COMPONENT
================================================== */

export default function AdminProductVariantManager({ productId }: Props) {
  const { showToast } = useAdminToast();

  /* ================= STATE ================= */

  const [variants, setVariants] = useState<AdminProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Single create
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [colorHex, setColorHex] = useState("");
  const [stock, setStock] = useState<number>(0);
  const [creating, setCreating] = useState(false);

  // Bulk create
  const [bulkColor, setBulkColor] = useState("");
  const [bulkColorHex, setBulkColorHex] = useState("");
  const [bulkSizes, setBulkSizes] = useState("");
  const [bulkStock, setBulkStock] = useState<number>(0);
  const [bulkCreating, setBulkCreating] = useState(false);

  // Drafts (controlled inputs)
  const [stockDrafts, setStockDrafts] = useState<Record<number, string>>({});
  const [hexDrafts, setHexDrafts] = useState<Record<number, string>>({});

  const requestSeq = useRef(0);

  const busy = creating || bulkCreating;

  const bulkSizesParsed = useMemo(() => parseSizesInput(bulkSizes), [bulkSizes]);

  const bulkSummary = useMemo(() => {
    if (bulkSizesParsed.length === 0) return "—";
    const N = 24;
    return bulkSizesParsed.length > N
      ? `${bulkSizesParsed.slice(0, N).join(", ")} … (+${bulkSizesParsed.length - N})`
      : bulkSizesParsed.join(", ");
  }, [bulkSizesParsed]);

  const normalizedSingleHex = useMemo(() => normalizeHexColorInput(colorHex), [colorHex]);
  const normalizedBulkHex = useMemo(() => normalizeHexColorInput(bulkColorHex), [bulkColorHex]);

  const singleHexInvalid = normalizedSingleHex === "__INVALID__";
  const bulkHexInvalid = normalizedBulkHex === "__INVALID__";

  /* ================= LOAD ================= */

  const loadVariants = useCallback(async () => {
    const seq = ++requestSeq.current;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchAdminProductVariants(productId);
      if (seq !== requestSeq.current) return;

      const sorted = sortVariantsStable(data);
      setVariants(sorted);

      const stockNext: Record<number, string> = {};
      const hexNext: Record<number, string> = {};

      for (const v of sorted) {
        stockNext[v.id] = String(v.stock);
        hexNext[v.id] = v.color_hex ?? "";
      }

      setStockDrafts(stockNext);
      setHexDrafts(hexNext);
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

  /* ================= CREATE (SINGLE) ================= */

  const handleCreate = async () => {
    if (creating || bulkCreating) return;

    const sizeValue = normalizeToken(size);
    const colorValue = normalizeToken(color);
    const hexValue = normalizeHexColorInput(colorHex);

    if (!sizeValue || !colorValue) {
      showToast("Size and color are required", "error");
      return;
    }

    if (hexValue === "__INVALID__") {
      showToast("Color hex must be in the format #RRGGBB (or leave empty)", "error");
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
        color_hex: hexValue,
        stock: Math.trunc(stock),
      });

      setVariants((prev) => mergeVariants(prev, [created]));
      setStockDrafts((prev) => ({ ...prev, [created.id]: String(created.stock) }));
      setHexDrafts((prev) => ({ ...prev, [created.id]: created.color_hex ?? "" }));

      setSize("");
      setColor("");
      setColorHex("");
      setStock(0);

      showToast("Variant created", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create variant", "error");
    } finally {
      setCreating(false);
    }
  };

  /* ================= BULK CREATE ================= */

  const handleBulkCreate = async () => {
    if (bulkCreating || creating) return;

    const colorValue = normalizeToken(bulkColor);
    const hexValue = normalizeHexColorInput(bulkColorHex);

    if (!colorValue) {
      showToast("Color is required for bulk add", "error");
      return;
    }

    if (hexValue === "__INVALID__") {
      showToast("Bulk color hex must be #RRGGBB (or leave empty)", "error");
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
      const result: AdminBulkVariantCreateResult = await bulkCreateAdminProductVariants(productId, {
        color: colorValue,
        color_hex: hexValue,
        sizes: bulkSizesParsed,
        default_stock: Math.trunc(bulkStock),
      });

      if (result.created.length > 0) {
        setVariants((prev) => mergeVariants(prev, result.created));

        setStockDrafts((prev) => {
          const next = { ...prev };
          for (const v of result.created) next[v.id] = String(v.stock);
          return next;
        });

        setHexDrafts((prev) => {
          const next = { ...prev };
          for (const v of result.created) next[v.id] = v.color_hex ?? "";
          return next;
        });
      }

      const createdCount = result.created.length;
      const skippedCount = result.skipped_existing.length;

      if (createdCount > 0 && skippedCount === 0) {
        showToast(`Added ${createdCount} variants`, "success");
      } else if (createdCount > 0 && skippedCount > 0) {
        showToast(`Added ${createdCount}, skipped ${skippedCount} existing`, "success");
      } else {
        showToast("No new variants added (all already existed)", "success");
      }

      setBulkSizes("");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to bulk create variants", "error");
    } finally {
      setBulkCreating(false);
    }
  };

  /* ================= STOCK EDIT ================= */

  const setStockDraft = (variantId: number, value: string) => {
    setStockDrafts((prev) => ({ ...prev, [variantId]: value }));
  };

  const commitStock = async (variant: AdminProductVariant) => {
    const draft = stockDrafts[variant.id] ?? String(variant.stock);
    const trimmed = normalizeToken(draft);

    if (trimmed === "") {
      setStockDraft(variant.id, String(variant.stock));
      return;
    }

    const n = Number(trimmed);
    if (!Number.isFinite(n) || Number.isNaN(n)) {
      showToast("Stock must be a number", "error");
      setStockDraft(variant.id, String(variant.stock));
      return;
    }

    const newStock = Math.trunc(n);
    if (newStock < 0) {
      showToast("Stock cannot be negative", "error");
      setStockDraft(variant.id, String(variant.stock));
      return;
    }

    if (newStock === variant.stock) return;

    const snapshot = variants;

    setVariants((prev) => prev.map((v) => (v.id === variant.id ? { ...v, stock: newStock } : v)));

    try {
      await updateAdminVariant(variant.id, { stock: newStock });
      showToast("Stock updated", "success");
    } catch (err) {
      setVariants(snapshot);
      setStockDraft(variant.id, String(variant.stock));
      showToast(err instanceof Error ? err.message : "Failed to update stock", "error");
    }
  };

  /* ================= HEX EDIT ================= */

  const setHexDraft = (variantId: number, value: string) => {
    setHexDrafts((prev) => ({ ...prev, [variantId]: value }));
  };

  const commitHex = async (variant: AdminProductVariant) => {
    const draft = hexDrafts[variant.id] ?? (variant.color_hex ?? "");
    const normalized = normalizeHexColorInput(draft);

    if (normalized === "__INVALID__") {
      showToast("Hex must be #RRGGBB or empty", "error");
      setHexDraft(variant.id, variant.color_hex ?? "");
      return;
    }

    if (normalized === (variant.color_hex ?? "")) return;

    const snapshot = variants;

    setVariants((prev) =>
      prev.map((v) => (v.id === variant.id ? { ...v, color_hex: normalized } : v))
    );

    try {
      const updated = await updateAdminVariant(variant.id, { color_hex: normalized });
      // keep in sync with backend normalization
      setVariants((prev) =>
        prev.map((v) =>
          v.id === variant.id ? { ...v, color_hex: updated.color_hex } : v
        )
      );
      setHexDraft(variant.id, updated.color_hex);
      showToast("Color hex updated", "success");
    } catch (err) {
      setVariants(snapshot);
      setHexDraft(variant.id, variant.color_hex ?? "");
      showToast(err instanceof Error ? err.message : "Failed to update color hex", "error");
    }
  };

  /* ================= DELETE ================= */

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

      setHexDrafts((prev) => {
        const next = { ...prev };
        delete next[variantId];
        return next;
      });

      showToast("Variant deleted", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete variant", "error");
    }
  };

  /* ================= RENDER ================= */

  return (
    <section className="admin-section">
      <div className="admin-section-title">Product Variants</div>

      {error && <div className="admin-error">{error}</div>}

      {/* BULK CREATE */}
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

        <div className="admin-form-group">
          <label>
            Bulk Color Hex{" "}
            <span className="mono" style={{ opacity: 0.7 }}>
              (#RRGGBB optional)
            </span>
          </label>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Swatch hex={bulkHexInvalid ? "" : normalizedBulkHex || ""} />
            <input
              placeholder="e.g. #1E90FF"
              value={bulkColorHex}
              onChange={(e) => setBulkColorHex(e.target.value)}
              disabled={bulkCreating || creating}
              style={{ width: "100%" }}
            />
          </div>

          {bulkHexInvalid && (
            <div className="mono" style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
              Invalid hex. Use <b>#RRGGBB</b> or leave empty.
            </div>
          )}
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
            style={{ width: "100%", minHeight: 80, resize: "vertical" }}
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
            disabled={bulkCreating || creating || bulkHexInvalid}
            title="Create all missing variants for this color"
          >
            {bulkCreating ? "Adding…" : "Bulk Add"}
          </button>
        </div>
      </div>

      {/* SINGLE CREATE */}
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
          <label>
            Color Hex{" "}
            <span className="mono" style={{ opacity: 0.7 }}>
              (#RRGGBB optional)
            </span>
          </label>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Swatch hex={singleHexInvalid ? "" : normalizedSingleHex || ""} />
            <input
              placeholder="e.g. #000000"
              value={colorHex}
              onChange={(e) => setColorHex(e.target.value)}
              disabled={creating || bulkCreating}
              style={{ width: "100%" }}
            />
          </div>

          {singleHexInvalid && (
            <div className="mono" style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
              Invalid hex. Use <b>#RRGGBB</b> or leave empty.
            </div>
          )}
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
            disabled={creating || bulkCreating || singleHexInvalid}
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
            <th align="left">Color Hex</th>
            <th align="left">Stock</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan={5} className="admin-table-empty">
                Loading variants…
              </td>
            </tr>
          )}

          {!loading && variants.length === 0 && (
            <tr>
              <td colSpan={5} className="admin-table-empty">
                No variants added yet
              </td>
            </tr>
          )}

          {!loading &&
            variants.map((variant) => {
              const hexDraft = hexDrafts[variant.id] ?? (variant.color_hex ?? "");
              const hexNorm = normalizeHexColorInput(hexDraft);
              const hexInvalid = hexNorm === "__INVALID__";

              return (
                <tr key={variant.id}>
                  <td>{variant.size}</td>
                  <td>{variant.color}</td>

                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Swatch hex={hexInvalid ? "" : hexNorm || ""} />

                      <input
                        className="admin-input-sm mono"
                        placeholder="—"
                        value={hexDraft}
                        onChange={(e) => setHexDraft(variant.id, e.target.value)}
                        onBlur={() => commitHex(variant)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
                          else if (e.key === "Escape") {
                            setHexDraft(variant.id, variant.color_hex ?? "");
                            (e.currentTarget as HTMLInputElement).blur();
                          }
                        }}
                        disabled={busy}
                        style={{ width: 120 }}
                        aria-label={`Color hex for ${variant.color} ${variant.size}`}
                      />
                    </div>

                    {hexInvalid && (
                      <div className="mono" style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
                        Use <b>#RRGGBB</b> or empty.
                      </div>
                    )}
                  </td>

                  <td>
                    <input
                      type="number"
                      min={0}
                      className="admin-input-sm"
                      value={stockDrafts[variant.id] ?? String(variant.stock)}
                      onChange={(e) => setStockDraft(variant.id, e.target.value)}
                      onBlur={() => commitStock(variant)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
                        else if (e.key === "Escape") {
                          setStockDraft(variant.id, String(variant.stock));
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
              );
            })}
        </tbody>
      </AdminTable>
    </section>
  );
}