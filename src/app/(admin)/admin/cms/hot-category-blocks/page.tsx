"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import "./hot-category-blocks.css";

import {
  fetchAdminHotCategoryBlocks,
  createAdminHotCategoryBlock,
  updateAdminHotCategoryBlock,
  deleteAdminHotCategoryBlock,
  type AdminHotCategoryBlock,
} from "@/lib/admin-api/cms/hot-category-blocks";

import { useAdminToast } from "@/hooks/useAdminToast";

/* ==================================================
   PAGE
================================================== */

export default function AdminHotCategoryBlocksPage() {
  const { showToast } = useAdminToast();

  const [blocks, setBlocks] = useState<AdminHotCategoryBlock[]>([]);
  const [loading, setLoading] = useState(true);

  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      setLoading(true);
      const data = await fetchAdminHotCategoryBlocks();
      setBlocks(data);
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Failed to load hot category blocks",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  async function handleCreate(title: string) {
    try {
      await createAdminHotCategoryBlock({ title });
      showToast("Hot category block created", "success");
      load();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Create failed",
        "error"
      );
    }
  }

  async function handleUpdate(
    id: number,
    payload: {
      title?: string;
      is_active?: boolean;
      ordering?: number;
    }
  ) {
    try {
      await updateAdminHotCategoryBlock(id, payload);
      showToast("Block updated", "success");
      load();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Update failed",
        "error"
      );
    }
  }

  async function handleDelete(id: number) {
    if (
      !confirm(
        "Delete this hot category block?\n\nThis cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteAdminHotCategoryBlock(id);
      showToast("Block deleted", "success");
      load();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Delete failed",
        "error"
      );
    }
  }

  return (
    <section className="hot-blocks-page">
      {/* HEADER */}
      <header className="hot-blocks-header">
        <h1>Hot Category Blocks</h1>
        <p>
          Manage landing-page hot category sections
        </p>
      </header>

      {/* CREATE */}
      <CreateBlock onCreate={handleCreate} />

      {/* CONTENT */}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : blocks.length === 0 ? (
        <p className="muted italic">
          No hot category blocks created yet.
        </p>
      ) : (
        <div className="hot-blocks-grid">
          {blocks.map((block) => (
            <BlockCard
              key={block.id}
              block={block}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ==================================================
   CREATE BLOCK
================================================== */

function CreateBlock({
  onCreate,
}: {
  onCreate: (title: string) => void;
}) {
  const [title, setTitle] = useState("");

  return (
    <div className="hot-block-create">
      <input
        type="text"
        placeholder="Block title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <button
        className="btn primary"
        onClick={() => {
          onCreate(title.trim());
          setTitle("");
        }}
      >
        Create Block
      </button>
    </div>
  );
}

/* ==================================================
   BLOCK CARD
================================================== */

function BlockCard({
  block,
  onUpdate,
  onDelete,
}: {
  block: AdminHotCategoryBlock;
  onUpdate: (
    id: number,
    payload: {
      title?: string;
      is_active?: boolean;
      ordering?: number;
    }
  ) => void;
  onDelete: (id: number) => void;
}) {
  const [title, setTitle] = useState(block.title ?? "");
  const [ordering, setOrdering] = useState(block.ordering);

  return (
    <div className="hot-block-card">
      <input
        className="block-title"
        type="text"
        value={title}
        placeholder="Block title"
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => {
          if (title !== block.title) {
            onUpdate(block.id, { title });
          }
        }}
      />

      <div className="block-controls">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={block.is_active}
            onChange={(e) =>
              onUpdate(block.id, {
                is_active: e.target.checked,
              })
            }
          />
          Active
        </label>

        <input
          type="number"
          value={ordering}
          onChange={(e) =>
            setOrdering(Number(e.target.value))
          }
          onBlur={() => {
            if (ordering !== block.ordering) {
              onUpdate(block.id, { ordering });
            }
          }}
        />
      </div>

      <Link
        href={`/admin/cms/hot-category-blocks/${block.id}/items`}
        className="manage-link"
      >
        Manage Items →
      </Link>

      <button
        className="danger"
        onClick={() => onDelete(block.id)}
      >
        Delete Block
      </button>
    </div>
  );
}
