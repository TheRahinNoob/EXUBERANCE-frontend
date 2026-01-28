/* ==================================================
   API TYPES — RAW BACKEND CONTRACT
   --------------------------------------------------
   ❗ STRICT MIRROR OF DJANGO RESPONSES
   ❗ STRINGS STAY STRINGS (DecimalField safety)
   ❗ NEVER USE DIRECTLY IN UI COMPONENTS
================================================== */

/* ==================================================
   GENERIC API RESPONSE
================================================== */
export type ApiBlockResponse<T> = {
  meta?: {
    page?: string;
    section?: string;
    generated_at?: string;
    seo?: {
      title?: string;
      description?: string;
    };
  };
  items: T[];
};

/* ==================================================
   CATEGORY (RAW)
================================================== */
export type APICategory = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  is_campaign?: boolean;
  children?: APICategory[];
};

/* ==================================================
   PRODUCT — LIST ITEM (RAW)
================================================== */
export type APIProduct = {
  id: number;
  slug: string;
  name: string;

  price: string;                 // DecimalField → string
  old_price: string | null;      // optional strike price

  main_image: string | null;

  is_featured?: boolean;
  categories?: string[];

  short_description?: string;
  description?: string;
};

/* ==================================================
   PRODUCT IMAGE (RAW)
================================================== */
export type APIProductImage = {
  id: number;
  image: string;
};

/* ==================================================
   PRODUCT VARIANT (RAW)
================================================== */
export type APIProductVariant = {
  id: number;
  size: string;
  color: string;
  stock: number;
};

/* ==================================================
   PRODUCT ATTRIBUTE (RAW)
================================================== */
export type APIProductAttribute = {
  name: string;
  value: string;
};

/* ==================================================
   PRODUCT DETAIL (RAW)
================================================== */
export type APIProductDetail = APIProduct & {
  images: APIProductImage[];
  variants: APIProductVariant[];
  attributes?: APIProductAttribute[];
};

/* ==================================================
   HERO BANNER (RAW)
================================================== */
export type APIHeroBanner = {
  id: number;
  image_desktop: string | null;
  image_tablet: string | null;
  image_mobile: string | null;
  ordering: number;
};

/* ==================================================
   LANDING MENU ITEM (RAW)
================================================== */
export type APILandingMenuItem = {
  name: string;
  slug: string;
  seo_title?: string;
  seo_description?: string;
};

/* ==================================================
   FEATURED CATEGORY (RAW)
================================================== */
export type APIFeaturedCategory = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
};

/* ==================================================
   HOT CATEGORY (RAW)
================================================== */
export type APIHotCategory = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
};

/* ==================================================
   🔥 COMFORT RAIL (RAW — SAFE)
================================================== */
export type APIComfortRail = {
  id: number;
  category: {
    name: string;
    slug: string;
    image: string | null;
  };
  products: {
    id: number;
    name: string;
    slug: string;

    price: string;
    old_price: string | null;

    main_image: string | null;
  }[];
};

/* ==================================================
   CMS LAYOUT BLOCK (RAW)
   --------------------------------------------------
   Discriminated union (STRICT)
================================================== */
export type LandingCMSBlock =
  | { type: "hero" }
  | { type: "menu" }
  | { type: "featured" }
  | { type: "hot" }
  | { type: "comfort_block" }
  | {
      type: "comfort_rail";
      comfort_rail_id: number;
    };
