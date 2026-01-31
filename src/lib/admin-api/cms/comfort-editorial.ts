/**
 * ==================================================
 * ADMIN CMS API — COMFORT EDITORIAL (CANONICAL)
 * ==================================================
 *
 * PRINCIPLES:
 * - Backend is the single source of truth
 * - CREATE !== UPDATE
 * - Multipart-safe (image upload)
 * - CSRF-safe (Django session auth)
 * - Image updates allowed via PATCH
 * - NO inference, NO silent coercion
 */

import {
  API_BASE,
  DEFAULT_FETCH_OPTIONS,
} from "@/lib/admin-api/config";

import {
  safeJson,
  parseErrorResponse,
} from "@/lib/admin-api/helpers";

import { getCSRFToken } from "@/lib/admin-api/csrf";

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

function mutationHeaders(): HeadersInit {
  const csrf = getCSRFToken();
  return csrf ? { "X-CSRFToken": csrf } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await safeJson<unknown>(res);

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  return data as T;
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
  const res = await fetch(BASE_URL, {
    ...DEFAULT_FETCH_OPTIONS,
    method: "GET",
  });

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

  const res = await fetch(`${BASE_URL}${id}/`, {
    ...DEFAULT_FETCH_OPTIONS,
    method: "GET",
  });

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

  const res = await fetch(BASE_URL, {
    ...DEFAULT_FETCH_OPTIONS,
    method: "POST",
    headers: mutationHeaders(),
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

  const res = await fetch(`${BASE_URL}${id}/`, {
    ...DEFAULT_FETCH_OPTIONS,
    method: "PATCH",
    headers: mutationHeaders(),
    body: buildFormData(payload),
  });

  return handleResponse<AdminComfortEditorialBlock>(res);
}

/* ==================================================
   API — UPDATE IMAGE ONLY (🔥 REQUIRED FIX)
================================================== */

export async function updateAdminComfortEditorialBlockImage(
  id: number,
  image: File
): Promise<void> {
  if (!Number.isFinite(id)) {
    throw new Error("ComfortEditorialBlock id is required");
  }

  const csrf = getCSRFToken();

  const formData = new FormData();
  formData.append("image", image);

  const res = await fetch(
    `${BASE_URL}${id}/image/`,
    {
      method: "PATCH",
      credentials: "include",
      headers: csrf ? { "X-CSRFToken": csrf } : {},
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

  const res = await fetch(`${BASE_URL}${id}/`, {
    ...DEFAULT_FETCH_OPTIONS,
    method: "DELETE",
    headers: mutationHeaders(),
  });

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}
