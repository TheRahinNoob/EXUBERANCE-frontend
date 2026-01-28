"use client";

import { useState } from "react";
import "./add-attribute-form.css";

/* ==================================================
   PROPS
================================================== */

type Props = {
  onCreate: (name: string, ordering: number) => void | Promise<void>;
};

/* ==================================================
   COMPONENT
================================================== */

export default function AddAttributeForm({ onCreate }: Props) {
  const [name, setName] = useState("");
  const [ordering, setOrdering] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  /* ==================================================
     SUBMIT
  ================================================== */

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);

    try {
      await onCreate(trimmed, ordering);
      setName("");
      setOrdering(0);
    } finally {
      setSubmitting(false);
    }
  };

  /* ==================================================
     KEYBOARD SUPPORT
  ================================================== */

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  /* ==================================================
     RENDER
  ================================================== */

  return (
    <div className="add-attribute-bar">
      <input
        className="add-attribute-input"
        type="text"
        placeholder="Attribute name (e.g. Fabric, GSM)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={submitting}
      />

      <input
        className="add-attribute-order"
        type="number"
        placeholder="Order"
        value={ordering}
        onChange={(e) =>
          setOrdering(Number(e.target.value) || 0)
        }
        disabled={submitting}
      />

      <button
        className="add-attribute-btn"
        onClick={handleSubmit}
        disabled={submitting || !name.trim()}
      >
        {submitting ? "Adding…" : "Add Attribute"}
      </button>
    </div>
  );
}
