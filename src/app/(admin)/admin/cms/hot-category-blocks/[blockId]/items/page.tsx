"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import "./hot-category-block-items.css";

import { useAdminToast } from "@/hooks/useAdminToast";

import {
  fetchAdminHotCategories,
  type AdminHotCategory,
} from "@/lib/admin-api/cms/hot-categories";

import {
  fetchAdminHotCategoryBlock,
  createAdminHotCategoryBlockItem,
  reorderAdminHotCategoryBlockItems,
  deleteAdminHotCategoryBlockItem,
  type AdminHotCategoryBlockDetail,
} from "@/lib/admin-api/cms/hot-category-blocks";

/* ==================================================
   TYPES
================================================== */

type BlockItemState = {
  id: number;
  hot_category_id: number;
  name: string;
  image: string | null;
  is_active: boolean;
};

/* ==================================================
   PAGE
================================================== */

export default function AdminHotCategoryBlockItemsPage() {
  const { blockId } = useParams<{ blockId: string }>();
  const { showToast } = useAdminToast();

  const [block, setBlock] =
    useState<AdminHotCategoryBlockDetail | null>(null);
  const [hotCategories, setHotCategories] =
    useState<AdminHotCategory[]>([]);
  const [items, setItems] = useState<BlockItemState[]>([]);
  const [loading, setLoading] = useState(true);

  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      setLoading(true);

      const [blockData, allHotCategories] = await Promise.all([
        fetchAdminHotCategoryBlock(Number(blockId)),
        fetchAdminHotCategories(),
      ]);

      setBlock(blockData);
      setHotCategories(allHotCategories);

      setItems(
        blockData.items.map((item) => ({
          id: item.id,
          hot_category_id: item.hot_category.id,
          name: item.hot_category.category.name,
          image: item.hot_category.image,
          is_active: item.is_active,
        }))
      );
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Failed to load block",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [blockId, showToast]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  /* ================= ADD ================= */

  async function handleAdd(hc: AdminHotCategory) {
    if (!block) return;

    try {
      const created =
        await createAdminHotCategoryBlockItem(
          block.id,
          hc.id
        );

      setItems((prev) => [
        ...prev,
        {
          id: created.id,
          hot_category_id: created.hot_category.id,
          name: created.hot_category.category.name,
          image: created.hot_category.image,
          is_active: created.is_active,
        },
      ]);

      showToast("Hot category added", "success");
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Add failed",
        "error"
      );
    }
  }

  /* ================= DELETE ================= */

  async function handleDelete(itemId: number) {
    if (!block) return;

    if (
      !confirm(
        "Remove this hot category from the block?"
      )
    ) {
      return;
    }

    try {
      await deleteAdminHotCategoryBlockItem(
        block.id,
        itemId
      );

      setItems((prev) =>
        prev.filter((i) => i.id !== itemId)
      );

      showToast("Removed", "success");
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Delete failed",
        "error"
      );
    }
  }

  /* ================= SAVE ================= */

  async function handleSave() {
    if (!block) return;

    try {
      await reorderAdminHotCategoryBlockItems(
        block.id,
        {
          items: items.map((item, index) => ({
            id: item.id,
            ordering: index,
            is_active: item.is_active,
          })),
        }
      );

      showToast("Changes saved", "success");
      load();
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Save failed",
        "error"
      );
    }
  }

  /* ================= RENDER ================= */

  if (loading) {
    return <p className="muted">Loading…</p>;
  }

  if (!block) {
    return (
      <p className="error">Block not found</p>
    );
  }

  const usedIds = new Set(
    items.map((i) => i.hot_category_id)
  );

  const available = hotCategories.filter(
    (hc) => !usedIds.has(hc.id)
  );

  return (
    <section className="block-items-page">
      <header className="block-items-header">
        <h1>Compose Hot Categories</h1>
        <p>
          Block:{" "}
          {block.title || `Block #${block.id}`}
        </p>
      </header>

      <AddHotCategory
        available={available}
        onAdd={handleAdd}
      />

      {items.length === 0 ? (
        <p className="muted italic">
          No hot categories yet.
        </p>
      ) : (
        <div className="items-list">
          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onToggle={() =>
                setItems((prev) =>
                  prev.map((i) =>
                    i.id === item.id
                      ? {
                          ...i,
                          is_active: !i.is_active,
                        }
                      : i
                  )
                )
              }
              onDelete={() =>
                handleDelete(item.id)
              }
            />
          ))}
        </div>
      )}

      <button
        className="btn primary save-btn"
        onClick={handleSave}
      >
        Save Changes
      </button>
    </section>
  );
}

/* ==================================================
   ADD SELECT
================================================== */

function AddHotCategory({
  available,
  onAdd,
}: {
  available: AdminHotCategory[];
  onAdd: (hc: AdminHotCategory) => void;
}) {
  const [selected, setSelected] =
    useState<number | "">("");

  return (
    <div className="add-hot-category">
      <select
        value={selected}
        onChange={(e) =>
          setSelected(
            e.target.value
              ? Number(e.target.value)
              : ""
          )
        }
      >
        <option value="">
          Add hot category…
        </option>
        {available.map((hc) => (
          <option key={hc.id} value={hc.id}>
            {hc.category.name}
          </option>
        ))}
      </select>

      <button
        className="btn ghost"
        disabled={!selected}
        onClick={() => {
          const hc = available.find(
            (x) => x.id === selected
          );
          if (hc) {
            onAdd(hc);
            setSelected("");
          }
        }}
      >
        Add
      </button>
    </div>
  );
}

/* ==================================================
   ITEM ROW
================================================== */

function ItemRow({
  item,
  onToggle,
  onDelete,
}: {
  item: BlockItemState;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="item-row">
      {item.image && (
        <img
          src={item.image}
          alt=""
        />
      )}

      <div className="item-name">
        {item.name}
      </div>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={item.is_active}
          onChange={onToggle}
        />
        Active
      </label>

      <button
        className="danger"
        onClick={onDelete}
      >
        Remove
      </button>
    </div>
  );
}
