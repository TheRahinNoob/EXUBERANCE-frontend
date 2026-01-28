"use client";

import { useEffect, useMemo, useRef } from "react";
import "./image-picker.css";

/* ==================================================
   PROPS
================================================== */

type Props = {
  value: File | null;
  onChange: (file: File | null) => void;
};

/* ==================================================
   COMPONENT
================================================== */

export default function ImagePicker({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  /* ==================================================
     PREVIEW URL (SAFE)
  ================================================== */

  const previewUrl = useMemo(() => {
    return value ? URL.createObjectURL(value) : null;
  }, [value]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /* ==================================================
     HANDLERS
  ================================================== */

  function handleClear() {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  /* ==================================================
     RENDER
  ================================================== */

  return (
    <div className="image-picker">
      {/* ================= PREVIEW ================= */}
      <div className="image-picker-preview">
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" />
        ) : (
          <span>No image selected</span>
        )}
      </div>

      {/* ================= INPUT ================= */}
      <label className="image-picker-upload">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) =>
            onChange(e.target.files?.[0] ?? null)
          }
        />
        Select Image
      </label>

      {/* ================= REMOVE ================= */}
      {value && (
        <button
          type="button"
          className="image-picker-remove"
          onClick={handleClear}
        >
          Remove image
        </button>
      )}
    </div>
  );
}
