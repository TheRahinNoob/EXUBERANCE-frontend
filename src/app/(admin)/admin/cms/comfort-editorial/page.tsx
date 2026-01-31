"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import {
  fetchAdminComfortEditorialBlocks,
  type AdminComfortEditorialBlock,
} from "@/lib/admin-api";

import styles from "./ComfortEditorialList.module.css";

/* ==================================================
   PAGE — COMFORT EDITORIAL (LIST)
================================================== */

export default function AdminComfortEditorialListPage() {
  const [items, setItems] = useState<AdminComfortEditorialBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  /* ================= LOAD ================= */

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    fetchAdminComfortEditorialBlocks()
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("Invalid response");
        }
        setItems(data);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load comfort editorials"
        );
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  /* ================= RENDER ================= */

  return (
    <section className={styles.page}>
      {/* ================= HEADER ================= */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Comfort Editorial</h1>
          <p className={styles.subtitle}>
            Editorial blocks used on the landing page
          </p>
        </div>

        <Link
          href="/admin/cms/comfort-editorial/new"
          className={styles.createBtn}
        >
          + New Editorial
        </Link>
      </header>

      {/* ================= STATES ================= */}
      {loading && (
        <p className={styles.muted}>Loading…</p>
      )}

      {error && (
        <p className={styles.error}>{error}</p>
      )}

      {!loading && !error && items.length === 0 && (
        <p className={styles.muted}>
          No comfort editorial blocks created yet.
        </p>
      )}

      {/* ================= TABLE ================= */}
      {!loading && !error && items.length > 0 && (
        <div className={styles.card}>
          <table
            className={styles.table}
            role="table"
            aria-label="Comfort editorial blocks"
          >
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Order</th>
                <th className={styles.right}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((block) => (
                <tr key={block.id} role="row">
                  <td
                    className={styles.titleCell}
                    data-label="Title"
                  >
                    {block.title}
                  </td>

                  <td data-label="Status">
                    {block.is_active ? (
                      <span
                        className={`${styles.badge} ${styles.success}`}
                      >
                        Active
                      </span>
                    ) : (
                      <span
                        className={`${styles.badge} ${styles.mutedBadge}`}
                      >
                        Inactive
                      </span>
                    )}
                  </td>

                  <td
                    className={styles.order}
                    data-label="Order"
                  >
                    {block.ordering}
                  </td>

                  <td
                    className={styles.right}
                    data-label="Actions"
                  >
                    <Link
                      href={`/admin/cms/comfort-editorial/${block.id}`}
                      className={styles.editLink}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
