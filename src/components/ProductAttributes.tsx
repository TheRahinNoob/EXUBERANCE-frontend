"use client";

import styles from "./ProductAttributes.module.css";

/* ==================================================
   TYPES
================================================== */
type Attribute = {
  label: string;
  value: string;
};

type Props = {
  attributes: Attribute[];
  description?: string | null;
};

/* ==================================================
   COMPONENT
================================================== */
export default function ProductAttributes({
  attributes,
  description,
}: Props) {
  const hasDescription =
    description && description.trim() !== "";

  const hasAttributes =
    attributes && attributes.length > 0;

  if (!hasDescription && !hasAttributes) {
    return null;
  }

  return (
    <section className={styles.wrapper}>
      {/* PRODUCT DESCRIPTION (HTML FROM CMS) */}
      {hasDescription && (
        <div
          className={styles.description}
          dangerouslySetInnerHTML={{
            __html: description as string,
          }}
        />
      )}

      {/* PRODUCT DETAILS TABLE */}
      {hasAttributes && (
        <div className={styles.table}>
          {attributes.map((attr, index) => (
            <div
              key={`${attr.label}-${index}`}
              className={styles.row}
            >
              <div className={styles.label}>
                {attr.label}
              </div>
              <div className={styles.value}>
                {attr.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
