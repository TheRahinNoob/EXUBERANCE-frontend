/* ==================================================
   PRODUCT DOMAIN TYPES
   Single Source of Truth
================================================== */

/* ==================================================
   PRODUCT ATTRIBUTE
================================================== */
export type ProductAttribute = {
  label: string;
  value: string;
};

/* ==================================================
   PRODUCT VARIANT
================================================== */
export type ProductVariant = {
  id: number;
  size: string;
  color: string;
  stock: number;
};

/* ==================================================
   BASE PRODUCT
   (LIST / CARD / RELATED)
================================================== */
export type Product = {
  id: number;
  slug: string; // ✅ REQUIRED EVERYWHERE
  name: string;

  price: string;
  old_price?: string | null;

  main_image: string;

  is_featured?: boolean;
  short_description?: string;
};

/* ==================================================
   PRODUCT DETAIL (PDP)
================================================== */
export type ProductDetail = Product & {
  description?: string;

  /**
   * Structured specs
   */
  attributes?: ProductAttribute[];

  /**
   * Variants for purchase
   */
  variants: ProductVariant[];

  /**
   * Gallery images (FULL URLs)
   * main_image is INCLUDED
   */
  images: string[];
};
