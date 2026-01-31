"use client";

/**
 * ==================================================
 * ADMIN CMS — HERO BANNER FORM
 * ==================================================
 */

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createAdminHeroBanner,
  updateAdminHeroBanner,
} from "@/lib/admin-api";

import type {
  AdminHeroBanner,
  AdminHeroBannerCreatePayload,
  AdminHeroBannerUpdatePayload,
} from "@/lib/admin-api";

import { resolveMediaUrl } from "@/lib/admin-api/media";
import { useAdminToast } from "@/hooks/useAdminToast";

import "./hero-banner-form.css";

/* ==================================================
   TYPES
================================================== */

type Mode = "create" | "edit";

type Props = {
  mode: Mode;
  existing?: AdminHeroBanner;
};

type ImageInputProps = {
  label: string;
  required?: boolean;
  existing?: string | null;
  onChange: (file: File | null) => void;
};

type InputProps = {
  label: string;
  type: string;
  value: string | number;
  onChange: (value: string) => void;
};

/* ==================================================
   COMPONENT
================================================== */

export default function HeroBannerForm({
  mode,
  existing,
}: Props) {
  const router = useRouter();
  const { showToast } = useAdminToast();

  /* ================= STATE ================= */

  const [imageDesktop, setImageDesktop] =
    useState<File | null>(null);
  const [imageTablet, setImageTablet] =
    useState<File | null>(null);
  const [imageMobile, setImageMobile] =
    useState<File | null>(null);

  const [isActive, setIsActive] =
    useState(existing?.is_active ?? true);

  const [startsAt, setStartsAt] =
    useState(existing?.starts_at ?? "");

  const [endsAt, setEndsAt] =
    useState(existing?.ends_at ?? "");

  const [ordering, setOrdering] =
    useState(existing?.ordering ?? 0);

  const [submitting, setSubmitting] =
    useState(false);

  /* ================= DERIVED ================= */

  const canSubmit = useMemo(() => {
    if (submitting) return false;
    if (mode === "create" && !imageDesktop) return false;
    return true;
  }, [mode, imageDesktop, submitting]);

  /* ================= SUBMIT ================= */

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!canSubmit) return;

      try {
        setSubmitting(true);

        if (mode === "create") {
          if (!imageDesktop) {
            throw new Error("Desktop image required");
          }

          const payload: AdminHeroBannerCreatePayload = {
            image_desktop: imageDesktop,
            is_active: isActive,
            starts_at: startsAt || null,
            ends_at: endsAt || null,
            ordering,
          };

          if (imageTablet)
            payload.image_tablet = imageTablet;
          if (imageMobile)
            payload.image_mobile = imageMobile;

          await createAdminHeroBanner(payload);
          showToast("Hero banner created", "success");
        } else {
          if (!existing) {
            throw new Error("Missing banner");
          }

          const payload: AdminHeroBannerUpdatePayload = {
            is_active: isActive,
            starts_at: startsAt || null,
            ends_at: endsAt || null,
            ordering,
          };

          if (imageDesktop)
            payload.image_desktop = imageDesktop;
          if (imageTablet)
            payload.image_tablet = imageTablet;
          if (imageMobile)
            payload.image_mobile = imageMobile;

          await updateAdminHeroBanner(
            existing.id,
            payload
          );
          showToast("Hero banner updated", "success");
        }

        router.push("/admin/cms/hero-banners");
      } catch (err) {
        showToast(
          err instanceof Error
            ? err.message
            : "Save failed",
          "error"
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      canSubmit,
      mode,
      existing,
      imageDesktop,
      imageTablet,
      imageMobile,
      isActive,
      startsAt,
      endsAt,
      ordering,
      router,
      showToast,
    ]
  );

  /* ================= RENDER ================= */

  return (
    <form
      className="hero-form"
      onSubmit={handleSubmit}
    >
      {/* ================= IMAGES ================= */}
      <fieldset className="hero-fieldset hero-images">
        <legend>Images</legend>

        <ImageInput
          label="Desktop image"
          required={mode === "create"}
          existing={existing?.image_desktop ?? null}
          onChange={setImageDesktop}
        />

        <ImageInput
          label="Tablet image"
          existing={existing?.image_tablet ?? null}
          onChange={setImageTablet}
        />

        <ImageInput
          label="Mobile image"
          existing={existing?.image_mobile ?? null}
          onChange={setImageMobile}
        />
      </fieldset>

      {/* ================= VISIBILITY ================= */}
      <fieldset className="hero-fieldset hero-visibility">
        <legend>Visibility</legend>

        <label className="checkbox checkbox-large">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) =>
              setIsActive(e.target.checked)
            }
          />
          <span>Active</span>
        </label>

        <div className="row stack-on-mobile">
          <Input
            label="Starts at"
            type="datetime-local"
            value={startsAt}
            onChange={setStartsAt}
          />

          <Input
            label="Ends at"
            type="datetime-local"
            value={endsAt}
            onChange={setEndsAt}
          />
        </div>

        <Input
          label="Ordering"
          type="number"
          value={ordering}
          onChange={(v) =>
            setOrdering(Number(v) || 0)
          }
        />
      </fieldset>

      {/* ================= ACTION ================= */}
      <div className="hero-form-actions">
        <button
          className="btn primary"
          type="submit"
          disabled={!canSubmit}
        >
          {mode === "create"
            ? "Create Banner"
            : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

/* ==================================================
   SUB COMPONENTS
================================================== */

function ImageInput({
  label,
  required = false,
  existing,
  onChange,
}: ImageInputProps) {
  const preview = resolveMediaUrl(existing);

  return (
    <div className="form-group">
      <label>
        {label}
        {required && <span className="required">*</span>}
      </label>

      {preview && (
        <img
          src={preview}
          className="image-preview"
          alt=""
        />
      )}

      <input
        type="file"
        accept="image/*"
        required={required}
        onChange={(e) =>
          onChange(e.target.files?.[0] ?? null)
        }
      />
    </div>
  );
}

function Input({
  label,
  type,
  value,
  onChange,
}: InputProps) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input
        type={type}
        value={value}
        inputMode={
          type === "number" ? "numeric" : undefined
        }
        onChange={(e) =>
          onChange(e.target.value)
        }
      />
    </div>
  );
}
