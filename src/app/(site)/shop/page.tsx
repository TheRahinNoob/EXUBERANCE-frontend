import ProductGrid from "@/components/ProductGrid";
import ShopSidebar from "@/components/ShopSidebar";
import Breadcrumbs from "@/components/Breadcrumbs";
import { searchProducts } from "@/lib/search";
import { getCategories } from "@/lib/api";
import styles from "./ShopPage.module.css";

/* ==================================================
   TYPES
================================================== */
type Category = {
  id: number;
  name: string;
  slug: string;
  children?: Category[];
};

/* ==================================================
   HELPERS
================================================== */
function findCategoryPath(
  categories: Category[],
  slug: string,
  path: Category[] = []
): Category[] | null {
  for (const category of categories) {
    const nextPath = [...path, category];

    if (category.slug === slug) return nextPath;

    if (category.children?.length) {
      const found = findCategoryPath(
        category.children,
        slug,
        nextPath
      );
      if (found) return found;
    }
  }
  return null;
}

/* ==================================================
   PAGE — SERVER COMPONENT
================================================== */
export default async function ShopPage({ searchParams }: any) {
  const params = await searchParams;

  const selectedCategories =
    params.categories?.split(",").filter(Boolean) ?? [];

  const offer =
    params.offer && params.offer.trim() !== ""
      ? params.offer.trim()
      : undefined;

  const searchQuery =
    params.q && params.q.trim() !== ""
      ? params.q.trim()
      : undefined;

  const page = Number(params.page || 1);

  /* ---------------------------------------------
     FETCH DATA
  ---------------------------------------------- */
  const [productsData, categoryTree] = await Promise.all([
    searchProducts({
      categories:
        selectedCategories.length > 0
          ? selectedCategories
          : undefined,
      q: searchQuery,
      page,
      ...(offer ? { offer } : {}),
    }),
    getCategories(),
  ]);

  /* ---------------------------------------------
     BUILD BREADCRUMBS (FINAL LOGIC)
  ---------------------------------------------- */
  const breadcrumbItems: {
    label: string;
    href?: string;
  }[] = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
  ];

  // 🔍 Search
  if (searchQuery) {
    breadcrumbItems.push({
      label: `Search: "${searchQuery}"`,
    });
  }

  // 🎯 Offer
  else if (offer) {
    breadcrumbItems.push({
      label: offer.replace(/-/g, " "),
    });
  }

  // 🧩 Multiple categories (IMPORTANT FIX)
  else if (selectedCategories.length > 1) {
    breadcrumbItems.push({
      label: "Filtered results",
    });
  }

  // 📁 Single category → resolve hierarchy
  else if (selectedCategories.length === 1) {
    const path = findCategoryPath(
      categoryTree,
      selectedCategories[0]
    );

    path?.forEach((cat) => {
      breadcrumbItems.push({
        label: cat.name,
        href: `/shop?categories=${cat.slug}`,
      });
    });
  }

  /* ---------------------------------------------
     RENDER
  ---------------------------------------------- */
  return (
    <main className={styles.layout}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <ShopSidebar />
      </aside>

      {/* CONTENT */}
      <section className={styles.content}>
        <Breadcrumbs items={breadcrumbItems} />

        <ProductGrid
          products={productsData.results}
          emptyMessage={
            searchQuery
              ? `No results found for “${searchQuery}”.`
              : "No products found."
          }
        />
      </section>
    </main>
  );
}
