"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./MobileSearch.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function MobileSearch({ open, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const q = query.trim();
    if (!q) return;

    router.push(`/search?q=${encodeURIComponent(q)}`);
    setQuery("");
    onClose();
  }

  if (!open) return null;

  return (
    <>
      {/* SEARCH BAR */}
      <div className={styles.mobileSearch}>
        <form onSubmit={handleSubmit}>
          <input
            type="search"
            placeholder="Search products by titles or tags"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </form>
      </div>

      {/* BACKDROP (tap to close) */}
      <div className={styles.backdrop} onClick={onClose} />
    </>
  );
}
