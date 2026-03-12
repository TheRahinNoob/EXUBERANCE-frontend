/**
 * ==================================================
 * ADMIN API CONFIG — JWT BASED
 * ==================================================
 */

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/lib/admin-auth/token";

const RAW_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL;

if (!RAW_API_BASE) {
  throw new Error("[API_BASE] Missing NEXT_PUBLIC_API_BASE_URL");
}

export const API_BASE = RAW_API_BASE.replace(/\/$/, "");

/* ==================================================
   HELPERS
================================================== */

function buildHeaders(init: RequestInit = {}, accessToken?: string | null) {
  const headers = new Headers(init.headers || {});

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();

  if (!refresh) {
    clearTokens();
    return null;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh }),
      cache: "no-store",
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const data = await res.json();

    if (!data?.access || typeof data.access !== "string") {
      clearTokens();
      return null;
    }

    setAccessToken(data.access);

    if (typeof data.refresh === "string" && data.refresh) {
      setRefreshToken(data.refresh);
    }

    return data.access;
  } catch (err) {
    console.error("[adminFetch] Token refresh failed:", err);
    clearTokens();
    return null;
  }
}

/* ==================================================
   ADMIN FETCH (JWT + AUTO REFRESH)
================================================== */

export async function adminFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  let response = await fetch(input, {
    ...init,
    headers: buildHeaders(init, accessToken),
    cache: "no-store",
  });

  if (response.status !== 401) {
    return response;
  }

  const newAccessToken = await refreshAccessToken();

  if (!newAccessToken) {
    throw new Error("Session expired");
  }

  response = await fetch(input, {
    ...init,
    headers: buildHeaders(init, newAccessToken),
    cache: "no-store",
  });

  if (response.status === 401) {
    clearTokens();
    throw new Error("Session expired");
  }

  return response;
}