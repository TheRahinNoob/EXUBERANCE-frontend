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
    typeof description === "string" &&
    description.trim() !== "";

  const hasAttributes =
    Array.isArray(attributes) &&
    attributes.length > 0;

  if (!hasDescription && !hasAttributes) {
    return null;
  }

  return (
    <section className={styles.wrapper}>
      {/* ===============================
         CMS PRODUCT DESCRIPTION
         (TYPOGRAPHY SANDBOX)
      ================================ */}
      {hasDescription && (
        <div className={styles.cmsContent}>
          <div
            className={styles.cmsInner}
            dangerouslySetInnerHTML={{
              __html: description as string,
            }}
          />
        </div>
      )}

      {/* ===============================
         PRODUCT ATTRIBUTE TABLE
         (FRONTEND-CONTROLLED UI)
      ================================ */}
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
