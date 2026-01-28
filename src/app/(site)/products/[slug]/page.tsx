import type { Metadata } from "next";
import styles from "./page.module.css";

import ProductGallery from "@/components/ProductGallery";
import ProductInfo from "@/components/ProductInfo";
import ProductPurchase from "@/components/ProductPurchase";
import ProductAttributes from "@/components/ProductAttributes";

// ✅ META VIEW CONTENT (CLIENT COMPONENT)
import ViewContentPixel from "@/components/meta/ViewContentPixel";

import type { ProductDetail, Product } from "@/types/product";
import {
  getProduct,
  getRelatedProducts,
} from "@/lib/api/products";

/* ==================================================
   CONFIG
================================================== */
const SITE_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "http://localhost:3000";

/* ==================================================
   SEO SCHEMA
================================================== */
function buildProductSchema(
  product: ProductDetail,
  slug: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description:
      product.short_description ||
      product.description,
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
      availability: product.variants.some(
        (v) => v.stock > 0
      )
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition:
        "https://schema.org/NewCondition",
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
   PAGE
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

  const relatedProducts: Product[] =
    await getRelatedProducts(slug, 8);

  return (
    <main className={styles.page}>
      {/* 🔥 META VIEW CONTENT EVENT (CLIENT-SAFE) */}
<ViewContentPixel
  productId={product.id}
  price={Number(product.price)}
/>


      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildProductSchema(product, slug)
          ),
        }}
      />

      {/* PDP MAIN */}
      <section className={styles.pdpMain}>
        <ProductGallery
          images={product.images}
          name={product.name}
        />

        <div className={styles.right}>
          <ProductInfo product={product} />

          <ProductPurchase
            product={product}
            productSlug={slug}
          />

          <ProductAttributes
            description={product.description}
            attributes={product.attributes ?? []}
          />
        </div>
      </section>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className={styles.related}>
          <h2 className={styles.relatedTitle}>
            You may also like
          </h2>

          <div className={styles.relatedGrid}>
            {relatedProducts.map((item) => (
              <a
                key={item.id}
                href={`/products/${item.slug}`}
                className={styles.card}
              >
                <div className={styles.imageWrap}>
                  <img
                    src={item.main_image}
                    alt={item.name}
                  />

                  <span className={styles.actionIcon}>
                    ✎
                  </span>

                  <div className={styles.priceBar}>
                    <div className={styles.priceBarInner}>
                      <span className={styles.price}>
                        ৳ {item.price}
                      </span>

                      {item.old_price && (
                        <span className={styles.oldPrice}>
                          ৳ {item.old_price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button className={styles.addToCart}>
                  + Add To Cart
                </button>
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
