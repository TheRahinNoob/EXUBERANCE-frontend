import { redirect } from "next/navigation";

/**
 * /search is deprecated.
 * All product discovery lives on /shop.
 * This file exists ONLY for safe redirection.
 */
export default async function SearchRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const params = await searchParams;

  const sp = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => sp.append(key, v));
    } else if (value) {
      sp.set(key, value);
    }
  });

  redirect(`/shop?${sp.toString()}`);
}
