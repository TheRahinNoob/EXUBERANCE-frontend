"use client";

/**
 * ==================================================
 * HERO BANNER IMAGE FIELD
 * ==================================================
 */

import { useEffect, useMemo, useState } from "react";
import "./hero-banner-image-field.css";

type Props = {
  label: string;
  name: string;
  existingImage?: string | null;
  onFileSelect: (file: File | null) => void;
  hint?: string;
};

export default function HeroBannerImageField({
  label,
  name,
  existingImage = null,
  onFileSelect,
  hint,
}: Props) {
  const [localFile, setLocalFile] = useState<File | null>(null);

  const previewUrl = useMemo(() => {
    if (localFile) return URL.createObjectURL(localFile);
    return existingImage;
  }, [localFile, existingImage]);

  useEffect(() => {
    if (!localFile) return;
    return () => URL.revokeObjectURL(previewUrl!);
  }, [localFile, previewUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setLocalFile(file);
    onFileSelect(file);
  };

  const handleClear = () => {
    setLocalFile(null);
    onFileSelect(null);
  };

  return (
    <div className="hero-image-field">
      {/* LABEL */}
      <label htmlFor={name} className="hero-image-label">
        {label}
      </label>

      {/* PREVIEW */}
      <div className="hero-image-preview">
        {previewUrl ? (
          <img src={previewUrl} alt={`${label} preview`} />
        ) : (
          <span className="hero-image-placeholder">
            No image selected
          </span>
        )}
      </div>

      {/* INPUT */}
      <input
        id={name}
        name={name}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hero-image-input"
      />

      {/* ACTION */}
      {previewUrl && (
        <button
          type="button"
          onClick={handleClear}
          className="hero-image-remove"
        >
          Remove image
        </button>
      )}

      {/* HINT */}
      {hint && <p className="hero-image-hint">{hint}</p>}
    </div>
  );
}
