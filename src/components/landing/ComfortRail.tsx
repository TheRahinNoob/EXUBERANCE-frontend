"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./ComfortRail.module.css";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/* =========================
   TYPES
========================= */
type Product = {
  id: number;
  slug: string;
  name: string;
  price: string | number;
  old_price?: string | null;
  main_image: string | null;
};

type ComfortRailProps = {
  category: {
    name: string;
    slug: string;
    image?: string | null;
  };
  products: Product[];
};

/* =========================
   COMPONENT
========================= */
export default function ComfortRail({
  category,
  products,
}: ComfortRailProps) {
  const isCompact = useMediaQuery("(max-width: 1299px)");
  const visibleProducts = products.slice(0, 6);

  /* ==================================================
     🧩 MOBILE / SMALL LAPTOP (<1300px)
     ONE GRID SYSTEM
  ================================================== */
  if (isCompact) {
    return (
      <section className={styles.rail}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {/* CATEGORY AS CARD */}
            <Link
              href={`/category/${category.slug}`}
              className={`${styles.card} ${styles.category}`}
            >
              <div className={styles.categoryImageWrap}>
                {category.image && (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    unoptimized
                    className={styles.categoryImage}
                  />
                )}
              </div>
              <div className={styles.categoryOverlay}>
                <h3>{category.name}</h3>
              </div>
            </Link>

            {/* PRODUCTS */}
            {visibleProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className={styles.card}
              >
                <div className={styles.productImageWrap}>
                  {product.main_image && (
                    <Image
                      src={product.main_image}
                      alt={product.name}
                      fill
                      unoptimized
                      className={styles.productImage}
                    />
                  )}
                </div>

                <div className={styles.priceTag}>
                  <span className={styles.currency}>৳</span>
                  <span className={styles.priceMain}>
                    {product.price}
                  </span>

                  {product.old_price && (
                    <span className={styles.oldPrice}>
                      ৳ {product.old_price}
                    </span>
                  )}
                </div>
              </Link>
            ))}

            {/* VIEW MORE */}
            <Link
              href={`/category/${category.slug}`}
              className={`${styles.card} ${styles.viewMore}`}
            >
              <span>
                VIEW
                <br />
                MORE
              </span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  /* ==================================================
     🖥️ DESKTOP (≥1300px)
     ORIGINAL SYSTEM
  ================================================== */
  return (
    <section className={styles.rail}>
      <div className={styles.containerDesktop}>
        {/* CATEGORY LEFT */}
        <Link
          href={`/category/${category.slug}`}
          className={styles.category}
        >
          <div className={styles.categoryImageWrap}>
            {category.image && (
              <Image
                src={category.image}
                alt={category.name}
                fill
                unoptimized
                priority
                className={styles.categoryImage}
              />
            )}
          </div>
          <div className={styles.categoryOverlay}>
            <h3>{category.name}</h3>
          </div>
        </Link>

        {/* PRODUCTS RIGHT */}
        <div className={styles.grid}>
          {visibleProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className={styles.card}
            >
              <div className={styles.productImageWrap}>
                {product.main_image && (
                  <Image
                    src={product.main_image}
                    alt={product.name}
                    fill
                    unoptimized
                    className={styles.productImage}
                  />
                )}
              </div>

              <div className={styles.priceTag}>
                <span className={styles.currency}>৳</span>
                <span className={styles.priceMain}>
                  {product.price}
                </span>

                {product.old_price && (
                  <span className={styles.oldPrice}>
                    ৳ {product.old_price}
                  </span>
                )}
              </div>
            </Link>
          ))}

          <Link
            href={`/category/${category.slug}`}
            className={`${styles.card} ${styles.viewMore}`}
          >
            <span>
              VIEW
              <br />
              MORE
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
