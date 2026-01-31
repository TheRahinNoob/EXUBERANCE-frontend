import type { ReactNode } from "react";

/* ==================================================
   SHOP-SCOPED CART TRIGGER (CLIENT)
================================================== */
import ShopCartTrigger from "@/components/cart/ShopCartTrigger";

/* ==================================================
   SHOP LAYOUT
   - Server Component (no "use client")
   - Applies ONLY to /shop routes
   - Does NOT mount modals or drawers
================================================== */
export default function ShopLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      {/* =========================
         SHOP PAGE CONTENT
      ========================== */}
      {children}

      {/* =========================
         FLOATING CART ICON
         (VISIBLE ONLY IN /shop)
      ========================== */}
      <ShopCartTrigger />
    </>
  );
}
