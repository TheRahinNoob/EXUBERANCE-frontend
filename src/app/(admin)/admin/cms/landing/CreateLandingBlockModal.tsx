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

import { useAdminToast } from "@/hooks/useAdminToast";

/* ==================================================
   TYPES
================================================== */

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

const BLOCK_TYPES: LandingBlockType[] = [
  "hero",
  "menu",
  "featured",
  "hot",
  "comfort_rail",
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

  const [hotBlockId, setHotBlockId] =
    useState<number | "">("");
  const [comfortRailId, setComfortRailId] =
    useState<number | "">("");

  const [loading, setLoading] = useState(false);

  /* ================= LOAD DEPENDENCIES ================= */

  useEffect(() => {
    if (!open) return;

    if (blockType === "hot") {
      fetchAdminHotCategoryBlocks()
        .then(setHotBlocks)
        .catch(() =>
          showToast("Failed to load hot category blocks", "error")
        );
    }

    if (blockType === "comfort_rail") {
      fetchAdminComfortRails()
        .then(setComfortRails)
        .catch(() =>
          showToast("Failed to load comfort rails", "error")
        );
    }
  }, [open, blockType, showToast]);

  /* ================= VALIDATION ================= */

  function canSubmit() {
    if (!blockType) return false;
    if (blockType === "hot") return typeof hotBlockId === "number";
    if (blockType === "comfort_rail")
      return typeof comfortRailId === "number";
    return true;
  }

  /* ================= CREATE ================= */

  async function handleCreate() {
    if (!canSubmit()) return;

    try {
      setLoading(true);

      await createAdminLandingBlock({
        block_type: blockType,
        hot_category_block_id:
          blockType === "hot" ? hotBlockId : null,
        comfort_rail_id:
          blockType === "comfort_rail" ? comfortRailId : null,
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

  /* ================= RENDER ================= */

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
              onChange={(e) =>
                setBlockType(e.target.value as LandingBlockType)
              }
            >
              <option value="">Select…</option>
              {BLOCK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* HOT BLOCK */}
          {blockType === "hot" && (
            <div className="form-group">
              <label>Hot category block</label>
              <select
                value={hotBlockId}
                onChange={(e) =>
                  setHotBlockId(Number(e.target.value))
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
                value={comfortRailId}
                onChange={(e) =>
                  setComfortRailId(Number(e.target.value))
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
