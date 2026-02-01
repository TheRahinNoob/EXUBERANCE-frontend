/**
 * ==================================================
 * ADMIN CMS API — COMFORT EDITORIAL (CANONICAL)
 * ==================================================
 *
 * PRINCIPLES:
 * - Backend is the single source of truth
 * - CREATE !== UPDATE
 * - Multipart-safe (image upload)
 * - JWT-based admin auth
 * - Image updates allowed via PATCH
 * - NO inference, NO silent coercion
 */

import {
  API_BASE,
  adminFetch,
} from "@/lib/admin-api/config";

import {
  safeJson,
  parseErrorResponse,
} from "@/lib/admin-api/helpers";

/* ==================================================
   TYPES — READ MODEL
================================================== */

export type AdminComfortEditorialBlock = {
  id: number;

  title: string;
  subtitle: string | null;

  image: string | null;

  cta_text: string | null;
  cta_url: string | null;

  ordering: number;
  is_active: boolean;

  created_at: string;
};

/* ==================================================
   TYPES — WRITE MODELS
================================================== */

export type AdminComfortEditorialBlockCreatePayload = {
  title: string;
  subtitle?: string | null;

  image?: File;

  cta_text?: string | null;
  cta_url?: string | null;

  ordering?: number;
  is_active?: boolean;
};

export type AdminComfortEditorialBlockUpdatePayload = {
  title?: string;
  subtitle?: string | null;

  image?: File;

  cta_text?: string | null;
  cta_url?: string | null;

  ordering?: number;
  is_active?: boolean;
};

/* ==================================================
   INTERNAL CONSTANTS
================================================== */

const BASE_URL = `${API_BASE}/api/admin/cms/comfort-editorial/`;

/* ==================================================
   INTERNAL HELPERS
================================================== */

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  return safeJson<T>(res);
}

function buildFormData<T extends Record<string, unknown>>(
  payload: T
): FormData {
  const fd = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) return;

    if (value === null) {
      fd.append(key, "");
      return;
    }

    if (value instanceof File) {
      fd.append(key, value);
      return;
    }

    fd.append(key, String(value));
  });

  return fd;
}

/* ==================================================
   API — LIST
================================================== */

export async function fetchAdminComfortEditorialBlocks(): Promise<
  AdminComfortEditorialBlock[]
> {
  const res = await adminFetch(BASE_URL);

  const data = await handleResponse<unknown>(res);

  if (!Array.isArray(data)) {
    throw new Error("Invalid comfort editorial list");
  }

  return data as AdminComfortEditorialBlock[];
}

/* ==================================================
   API — DETAIL
================================================== */

export async function fetchAdminComfortEditorialBlock(
  id: number
): Promise<AdminComfortEditorialBlock> {
  if (!Number.isFinite(id)) {
    throw new Error("ComfortEditorialBlock id is required");
  }

  const res = await adminFetch(`${BASE_URL}${id}/`);

  return handleResponse<AdminComfortEditorialBlock>(res);
}

/* ==================================================
   API — CREATE (multipart)
================================================== */

export async function createAdminComfortEditorialBlock(
  payload: AdminComfortEditorialBlockCreatePayload
): Promise<AdminComfortEditorialBlock> {
  if (!payload.title?.trim()) {
    throw new Error("title is required");
  }

  const res = await adminFetch(BASE_URL, {
    method: "POST",
    body: buildFormData(payload),
  });

  return handleResponse<AdminComfortEditorialBlock>(res);
}

/* ==================================================
   API — UPDATE (metadata + optional image)
================================================== */

export async function updateAdminComfortEditorialBlock(
  id: number,
  payload: AdminComfortEditorialBlockUpdatePayload
): Promise<AdminComfortEditorialBlock> {
  if (!Number.isFinite(id)) {
    throw new Error("ComfortEditorialBlock id is required");
  }

  const res = await adminFetch(
    `${BASE_URL}${id}/`,
    {
      method: "PATCH",
      body: buildFormData(payload),
    }
  );

  return handleResponse<AdminComfortEditorialBlock>(res);
}

/* ==================================================
   API — UPDATE IMAGE ONLY (MULTIPART PATCH)
================================================== */

export async function updateAdminComfortEditorialBlockImage(
  id: number,
  image: File
): Promise<void> {
  if (!Number.isFinite(id)) {
    throw new Error("ComfortEditorialBlock id is required");
  }

  const formData = new FormData();
  formData.append("image", image);

  const res = await adminFetch(
    `${BASE_URL}${id}/image/`,
    {
      method: "PATCH",
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}

/* ==================================================
   API — DELETE
================================================== */

export async function deleteAdminComfortEditorialBlock(
  id: number
): Promise<void> {
  if (!Number.isFinite(id)) {
    throw new Error("ComfortEditorialBlock id is required");
  }

  const res = await adminFetch(
    `${BASE_URL}${id}/`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}
