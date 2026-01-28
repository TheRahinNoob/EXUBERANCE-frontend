"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import "./comfort-rail-detail.css";

import { useAdminToast } from "@/hooks/useAdminToast";

import {
  fetchAdminComfortRail,
  addProductToComfortRail,
  removeProductFromComfortRail,
  type AdminComfortCategoryRail,
} from "@/lib/admin-api/cms/comfort-rails";

import { fetchAdminProducts } from "@/lib/admin-api/products";
import type { AdminProduct } from "@/lib/admin-api/types";

/* ==================================================
   PAGE — COMFORT RAIL DETAIL (PRODUCT MANAGER)
================================================== */

export default function AdminComfortRailDetailPage() {
  const { railId } = useParams<{ railId: string }>();
  const railIdNum = Number(railId);

  const { showToast } = useAdminToast();

  const [rail, setRail] =
    useState<AdminComfortCategoryRail | null>(null);

  const [products, setProducts] =
    useState<AdminProduct[]>([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const abortRef = useRef<AbortController | null>(null);

  /* ================= LOAD ================= */

  const load = useCallback(async () => {
    if (!Number.isFinite(railIdNum)) {
      showToast("Invalid rail id", "error");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);

      const [railData, productData] = await Promise.all([
        fetchAdminComfortRail(railIdNum, {
          signal: controller.signal,
        }),
        fetchAdminProducts({
          page_size: 20,
          search: search || undefined,
          signal: controller.signal,
        }),
      ]);

      setRail(railData);
      setProducts([...productData.items]);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        showToast(
          err instanceof Error
            ? err.message
            : "Failed to load comfort rail",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [railIdNum, search, showToast]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  /* ================= ACTIONS ================= */

  async function handleAttach(productId: number) {
    if (!rail) return;

    try {
      await addProductToComfortRail(rail.id, productId);
      showToast("Product added", "success");
      load();
    } catch {
      showToast("Attach failed", "error");
    }
  }

  async function handleDetach(productId: number) {
    if (!rail) return;

    if (!confirm("Remove this product from the rail?")) return;

    try {
      await removeProductFromComfortRail(rail.id, productId);
      showToast("Product removed", "success");
      load();
    } catch {
      showToast("Detach failed", "error");
    }
  }

  /* ================= RENDER ================= */

  if (loading) {
    return <p className="muted">Loading…</p>;
  }

  if (!rail) {
    return <p className="error">Rail not found</p>;
  }

  const attachedIds = new Set(rail.products.map((p) => p.id));

  return (
    <section className="comfort-rail-detail">
      <header className="comfort-rail-header">
        <h1>
          Comfort Rail <span>— {rail.category.name}</span>
        </h1>

        <p className="muted">
          Auto-fill:{" "}
          <strong>
            {rail.auto_fill ? "Enabled" : "Disabled"}
          </strong>
        </p>
      </header>

      {/* SEARCH */}
      <input
        className="search-input"
        type="text"
        placeholder="Search products…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* PRODUCTS */}
      {products.length === 0 ? (
        <p className="muted italic">
          No products found.
        </p>
      ) : (
        <div className="product-grid">
          {products.map((product) => {
            const attached = attachedIds.has(product.id);

            return (
              <div key={product.id} className="product-card">
                <div className="product-meta">
                  <div className="product-name">
                    {product.name}
                  </div>
                  <div className="product-id">
                    ID: {product.id}
                  </div>
                </div>

                {attached ? (
                  <button
                    className="btn danger"
                    onClick={() =>
                      handleDetach(product.id)
                    }
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    className="btn accent"
                    onClick={() =>
                      handleAttach(product.id)
                    }
                  >
                    Add
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
