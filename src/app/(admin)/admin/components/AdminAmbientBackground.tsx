"use client";

import styles from "./AdminAmbientBackground.module.css";

export default function AdminAmbientBackground() {
  return (
    <div className={styles.wrapper} aria-hidden>
      <span className={styles.bubble} />
      <span className={styles.bubble} />
      <span className={styles.bubble} />
      <span className={styles.bubble} />
      <span className={styles.bubble} />
      <span className={styles.bubble} />
    </div>
  );
}
