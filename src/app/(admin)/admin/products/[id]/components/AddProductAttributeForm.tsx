"use client";

import { useEffect, useState } from "react";
import "./add-product-attribute-form.css";

import { useAdminToast } from "@/hooks/useAdminToast";

import {
  fetchAdminAttributeDefinitions,
  createAdminProductAttribute,
  type AdminProductAttributeDefinition,
} from "@/lib/admin-api/product-attributes";

/* ==================================================
   PROPS
================================================== */

type Props = {
  productId: number;
  usedAttributeIds: number[];
  onAdded: () => void;
};

/* ==================================================
   COMPONENT
================================================== */

export default function AddProductAttributeForm({
  productId,
  usedAttributeIds,
  onAdded,
}: Props) {
  const { showToast } = useAdminToast();

  const [definitions, setDefinitions] = useState<
    AdminProductAttributeDefinition[]
  >([]);
  const [attributeId, setAttributeId] = useState<number | "">("");
  const [value, setValue] = useState("");
  const [ordering, setOrdering] = useState(0);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD DEFINITIONS ================= */

  useEffect(() => {
    fetchAdminAttributeDefinitions()
      .then(setDefinitions)
      .catch(() =>
        showToast(
          "Failed to load attribute definitions",
          "error"
        )
      );
  }, []);

  /* ================= SUBMIT ================= */

  const handleAdd = async () => {
    if (!attributeId || !value.trim()) {
      showToast(
        "Select an attribute and enter a value",
        "error"
      );
      return;
    }

    if (usedAttributeIds.includes(attributeId as number)) {
      showToast(
        "This attribute is already added",
        "error"
      );
      return;
    }

    setLoading(true);

    try {
      await createAdminProductAttribute(productId, {
        attribute_id: attributeId,
        value: value.trim(),
        ordering,
      });

      setAttributeId("");
      setValue("");
      setOrdering(0);

      showToast("Attribute added", "success");
      onAdded();
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Failed to add attribute",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="admin-attr-add">
      <div className="admin-attr-add-title">
        Add Attribute
      </div>

      <div className="admin-attr-add-row">
        {/* ATTRIBUTE SELECT */}
        <select
          className="admin-select"
          value={attributeId}
          onChange={(e) =>
            setAttributeId(
              e.target.value
                ? Number(e.target.value)
                : ""
            )
          }
        >
          <option value="">Select attribute</option>

          {definitions.map((attr) => {
            const isUsed = usedAttributeIds.includes(attr.id);

            return (
              <option
                key={attr.id}
                value={attr.id}
                disabled={isUsed}
              >
                {attr.name}
                {isUsed ? " (added)" : ""}
              </option>
            );
          })}
        </select>

        {/* VALUE */}
        <input
          className="admin-input"
          placeholder="Value (e.g. 100% Cotton)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        {/* ORDER */}
        <input
          type="number"
          className="admin-input admin-input-xs"
          placeholder="Order"
          value={ordering}
          onChange={(e) =>
            setOrdering(Number(e.target.value))
          }
        />

        {/* BUTTON */}
        <button
          className="admin-action admin-action-primary"
          onClick={handleAdd}
          disabled={loading}
        >
          {loading ? "Adding…" : "Add"}
        </button>
      </div>
    </div>
  );
}
