"use client";

import { useEffect, useState } from "react";
import "./create-landing-block-modal.css";

import {
  createAdminLandingBlock,
  type LandingBlockType,
} from "@/lib/admin-api/cms/landing-blocks";

import {
  fetchAdminHotCategoryBlocks,
  type AdminHotCategoryBlock,
} from "@/lib/admin-api/cms/hot-category-blocks";

import {
  fetchAdminComfortRails,
  type AdminComfortCategoryRail,
} from "@/lib/admin-api/cms/comfort-rails";

import {
  fetchAdminComfortEditorialBlocks,
  type AdminComfortEditorialBlock,
} from "@/lib/admin-api/cms/comfort-editorial";

import { useAdminToast } from "@/hooks/useAdminToast";

/* ==================================================
   TYPES
================================================== */

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

/**
 * 🔒 MUST MATCH Django LandingBlock.BlockType EXACTLY
 */
const BLOCK_TYPES: {
  value: LandingBlockType;
  label: string;
}[] = [
  { value: "hero", label: "Hero Banner" },
  { value: "menu", label: "Landing Menu" },
  { value: "featured", label: "Featured Categories" },
  { value: "hot", label: "Hot Categories Block" },
  { value: "comfort_rail", label: "Comfort Rail" },
  { value: "comfort_block", label: "Comfort Editorial" },
];

/* ==================================================
   COMPONENT
================================================== */

export default function CreateLandingBlockModal({
  open,
  onClose,
  onCreated,
}: Props) {
  const { showToast } = useAdminToast();

  const [blockType, setBlockType] =
    useState<LandingBlockType | "">("");

  const [hotBlocks, setHotBlocks] =
    useState<AdminHotCategoryBlock[]>([]);
  const [comfortRails, setComfortRails] =
    useState<AdminComfortCategoryRail[]>([]);
  const [editorials, setEditorials] =
    useState<AdminComfortEditorialBlock[]>([]);

  const [hotBlockId, setHotBlockId] =
    useState<number | null>(null);
  const [comfortRailId, setComfortRailId] =
    useState<number | null>(null);
  const [editorialId, setEditorialId] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(false);

  /* ==================================================
     LOAD DEPENDENCIES
  ================================================== */

  useEffect(() => {
    if (!open || !blockType) return;

    if (blockType === "hot") {
      fetchAdminHotCategoryBlocks()
        .then(setHotBlocks)
        .catch(() =>
          showToast("Failed to load hot blocks", "error")
        );
    }

    if (blockType === "comfort_rail") {
      fetchAdminComfortRails()
        .then(setComfortRails)
        .catch(() =>
          showToast("Failed to load comfort rails", "error")
        );
    }

    if (blockType === "comfort_block") {
      fetchAdminComfortEditorialBlocks()
        .then(setEditorials)
        .catch(() =>
          showToast(
            "Failed to load comfort editorials",
            "error"
          )
        );
    }
  }, [open, blockType, showToast]);

  /* ==================================================
     VALIDATION
  ================================================== */

  function canSubmit(): boolean {
    if (!blockType) return false;

    if (blockType === "hot") return hotBlockId !== null;
    if (blockType === "comfort_rail")
      return comfortRailId !== null;
    if (blockType === "comfort_block")
      return editorialId !== null;

    return true;
  }

  /* ==================================================
     CREATE
  ================================================== */

  async function handleCreate() {
    if (!blockType) {
      showToast("Please select a block type", "error");
      return;
    }

    try {
      setLoading(true);

      await createAdminLandingBlock({
        block_type: blockType,

        hot_category_block_id:
          blockType === "hot" ? hotBlockId : null,

        comfort_rail_id:
          blockType === "comfort_rail"
            ? comfortRailId
            : null,

        comfort_editorial_block_id:
          blockType === "comfort_block"
            ? editorialId
            : null,
      });

      showToast("Landing block created", "success");
      onCreated();
      onClose();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Create failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  /* ==================================================
     RENDER
  ================================================== */

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <header className="modal-header">
          <h2>Add Landing Block</h2>
        </header>

        <div className="modal-body">
          {/* BLOCK TYPE */}
          <div className="form-group">
            <label>Block type</label>
            <select
              value={blockType}
              onChange={(e) => {
                const value =
                  e.target.value as LandingBlockType | "";

                setBlockType(value);
                setHotBlockId(null);
                setComfortRailId(null);
                setEditorialId(null);
              }}
            >
              <option value="">Select…</option>
              {BLOCK_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* HOT */}
          {blockType === "hot" && (
            <div className="form-group">
              <label>Hot category block</label>
              <select
                value={hotBlockId ?? ""}
                onChange={(e) =>
                  setHotBlockId(
                    e.target.value
                      ? Number(e.target.value)
                      : null
                  )
                }
              >
                <option value="">Select…</option>
                {hotBlocks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title || `Block #${b.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* COMFORT RAIL */}
          {blockType === "comfort_rail" && (
            <div className="form-group">
              <label>Comfort rail</label>
              <select
                value={comfortRailId ?? ""}
                onChange={(e) =>
                  setComfortRailId(
                    e.target.value
                      ? Number(e.target.value)
                      : null
                  )
                }
              >
                <option value="">Select…</option>
                {comfortRails.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 🧠 COMFORT EDITORIAL */}
          {blockType === "comfort_block" && (
            <div className="form-group">
              <label>Comfort editorial</label>
              <select
                value={editorialId ?? ""}
                onChange={(e) =>
                  setEditorialId(
                    e.target.value
                      ? Number(e.target.value)
                      : null
                  )
                }
              >
                <option value="">Select…</option>
                {editorials.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <footer className="modal-actions">
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn primary"
            disabled={!canSubmit() || loading}
            onClick={handleCreate}
          >
            {loading ? "Creating…" : "Create"}
          </button>
        </footer>
      </div>
    </div>
  );
}
