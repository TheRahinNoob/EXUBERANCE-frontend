// src/lib/admin-auth/token.ts

const ACCESS_KEY = "admin_access_token";
const REFRESH_KEY = "admin_refresh_token";
const REMEMBER_ME_KEY = "admin_remember_me";

type StorageMode = "local" | "session";

function isBrowser() {
  return typeof window !== "undefined";
}

function getLocalStorageSafe(): Storage | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getSessionStorageSafe(): Storage | null {
  if (!isBrowser()) return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function readFrom(storage: Storage | null, key: string): string | null {
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeTo(storage: Storage | null, key: string, value: string) {
  if (!storage) return;
  try {
    storage.setItem(key, value);
  } catch {
    // fail silently
  }
}

function removeFrom(storage: Storage | null, key: string) {
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    // fail silently
  }
}

function clearTokenKeys(storage: Storage | null) {
  removeFrom(storage, ACCESS_KEY);
  removeFrom(storage, REFRESH_KEY);
  removeFrom(storage, REMEMBER_ME_KEY);
}

function getPreferredStorageMode(): StorageMode {
  const local = getLocalStorageSafe();
  const session = getSessionStorageSafe();

  const rememberFromLocal = readFrom(local, REMEMBER_ME_KEY);
  if (rememberFromLocal === "true") return "local";

  const rememberFromSession = readFrom(session, REMEMBER_ME_KEY);
  if (rememberFromSession === "false") return "session";

  const hasLocalAccess = !!readFrom(local, ACCESS_KEY);
  const hasLocalRefresh = !!readFrom(local, REFRESH_KEY);
  if (hasLocalAccess || hasLocalRefresh) return "local";

  return "session";
}

function getPreferredStorage(): Storage | null {
  return getPreferredStorageMode() === "local"
    ? getLocalStorageSafe()
    : getSessionStorageSafe();
}

function getAnyToken(key: string): string | null {
  const preferred = getPreferredStorage();
  const local = getLocalStorageSafe();
  const session = getSessionStorageSafe();

  return (
    readFrom(preferred, key) ??
    readFrom(local, key) ??
    readFrom(session, key) ??
    null
  );
}

export function setTokens(
  access: string,
  refresh: string,
  rememberMe = false
) {
  const local = getLocalStorageSafe();
  const session = getSessionStorageSafe();

  clearTokenKeys(local);
  clearTokenKeys(session);

  const target = rememberMe ? local : session;
  writeTo(target, ACCESS_KEY, access);
  writeTo(target, REFRESH_KEY, refresh);
  writeTo(target, REMEMBER_ME_KEY, rememberMe ? "true" : "false");
}

export function setAccessToken(access: string) {
  const target = getPreferredStorage();
  if (!target) return;
  writeTo(target, ACCESS_KEY, access);
}

export function setRefreshToken(refresh: string) {
  const target = getPreferredStorage();
  if (!target) return;
  writeTo(target, REFRESH_KEY, refresh);
}

export function getAccessToken(): string | null {
  return getAnyToken(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return getAnyToken(REFRESH_KEY);
}

export function getRememberMe(): boolean {
  const local = getLocalStorageSafe();
  const session = getSessionStorageSafe();

  if (readFrom(local, REMEMBER_ME_KEY) === "true") return true;
  if (readFrom(session, REMEMBER_ME_KEY) === "false") return false;

  return false;
}

export function clearTokens() {
  clearTokenKeys(getLocalStorageSafe());
  clearTokenKeys(getSessionStorageSafe());
}

export function isLoggedIn(): boolean {
  return !!getAccessToken();
}