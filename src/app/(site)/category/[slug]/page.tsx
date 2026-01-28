import { redirect } from "next/navigation";

/**
 * /category/[slug] is deprecated.
 * All product discovery lives on /shop.
 * This route exists ONLY to redirect safely.
 */
export default async function CategoryRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  redirect(`/shop?categories=${encodeURIComponent(slug)}`);
}
