"use client";

import Link from "next/link";
import styles from "./Breadcrumbs.module.css";

type Crumb = {
  label: string;
  href?: string;
};

export default function Breadcrumbs({
  items,
}: {
  items: Crumb[];
}) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
      <ol>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;

          return (
            <li key={idx}>
              {item.href && !isLast ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                <span>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
