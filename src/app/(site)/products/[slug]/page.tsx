// SERVER COMPONENT — DO NOT USE 'use client' HERE
import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

import ProductGallery from "@/components/ProductGallery";
import ProductInfo from "@/components/ProductInfo";
import ProductPurchaseWrapper from "@/components/ProductPurchaseWrapper";
import ProductAttributes from "@/components/ProductAttributes";

import ViewContentPixel from "@/components/meta/ViewContentPixel";

import type { ProductDetail, Product } from "@/types/product";
import { getProduct, getRelatedProducts } from "@/lib/api/products";

/* ==================================================
   CONFIG
================================================== */
const SITE_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/* ==================================================
   SEO SCHEMA
================================================== */
function buildProductSchema(product: ProductDetail, slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.short_description || product.description,
    sku: product.id.toString(),
    brand: {
      "@type": "Brand",
      name: "Fabrilife",
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_BASE_URL}/products/${slug}`,
      priceCurrency: "BDT",
      price: product.price,
      availability: product.variants.some((v) => (v.stock ?? 0) > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

/* ==================================================
   METADATA
================================================== */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product not found",
      robots: { index: false },
    };
  }

  return {
    title: `${product.name} | Fabrilife`,
    description:
      product.short_description ??
      `Buy ${product.name} at best price in Bangladesh.`,
    alternates: {
      canonical: `${SITE_BASE_URL}/products/${slug}`,
    },
    openGraph: {
      type: "website",
      title: product.name,
      description: product.short_description,
      images: product.images.slice(0, 1),
    },
  };
}

/* ==================================================
   PAGE COMPONENT
================================================== */
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProduct(slug);

  if (!product) {
    return (
      <main className={styles.notFound}>
        <h1>Product not found</h1>
      </main>
    );
  }

  const relatedProducts: Product[] = await getRelatedProducts(slug, 8);

  return (
    <main className={styles.page}>
      <ViewContentPixel
        productId={product.id}
        price={Number(product.price)}
        currency="BDT"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildProductSchema(product, slug)),
        }}
      />

      <section className={styles.pdpMain}>
        <div className={styles.galleryCol}>
          <ProductGallery images={product.images} name={product.name} />
        </div>

        <div className={styles.right}>
          <div className={styles.infoBlock}>
            <ProductInfo product={product} />
          </div>

          <div className={styles.purchaseBlock}>
            <ProductPurchaseWrapper product={product} productSlug={slug} />
          </div>

          <div className={styles.detailsBlock}>
            <ProductAttributes
              description={product.description}
              attributes={product.attributes ?? []}
            />
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className={styles.related}>
          <div className={styles.relatedHeader}>
            <h2 className={styles.relatedTitle}>You may also like</h2>
          </div>

          <div className={styles.relatedGrid}>
            {relatedProducts.map(
              (item) =>
                item.slug && (
                  <Link
                    key={item.id}
                    href={`/products/${item.slug}`}
                    className={styles.card}
                  >
                    <div className={styles.imageWrap}>
                      <img src={item.main_image} alt={item.name} />
                    </div>

                    <div className={styles.cardBody}>
                      <h3 className={styles.cardName}>{item.name}</h3>

                      <div className={styles.cardPriceRow}>
                        <span className={styles.price}>৳ {item.price}</span>

                        {item.old_price && (
                          <span className={styles.oldPrice}>
                            ৳ {item.old_price}
                          </span>
                        )}
                      </div>

                      <span className={styles.addToCart}>View Product</span>
                    </div>
                  </Link>
                )
            )}
          </div>
        </section>
      )}
    </main>
  );
}