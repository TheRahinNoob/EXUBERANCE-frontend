// src/lib/admin-api/pagination.ts

/**
 * Pagination metadata returned by admin list endpoints.
 *
 * This contract is owned by the backend and must remain stable.
 * Frontend must treat this as read-only.
 */
export type PaginationMeta = Readonly<{
  /** Current page number (1-indexed) */
  page: number;

  /** Number of items requested per page */
  page_size: number;

  /** Total number of items available */
  total: number;

  /** Whether a next page exists */
  has_next: boolean;

  /** Whether a previous page exists */
  has_prev: boolean;
}>;

/**
 * Canonical paginated API response.
 *
 * Rules:
 * - `items` is always an array (never null)
 * - `meta` is always present
 * - Ordering is defined server-side
 */
export type PaginatedResponse<T> = Readonly<{
  items: readonly T[];
  meta: PaginationMeta;
}>;
