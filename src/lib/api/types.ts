/* ==================================================
   API TYPES — RAW BACKEND CONTRACT (FIXED)
--------------------------------------------------
✔ STRICT mirror of Django responses
✔ DecimalField values stay STRING
✔ NEVER consume directly in UI
✔ CMS + Atomic APIs aligned
✔ Discriminated unions are SAFE
================================================== */

/* ==================================================
   GENERIC API RESPONSE
================================================== */
export type ApiBlockResponse<T> = {
  meta?: {
    page?: string;
    section?: string;
    generated_at?: string;
    total?: number;
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
  starts_at?: string | null;
  ends_at?: string | null;
  show_countdown?: boolean;

  children?: APICategory[];
};

/* ==================================================
   PRODUCT — LIST ITEM (RAW)
================================================== */
export type APIProduct = {
  id: number;
  slug: string;
  name: string;

  price: string; // DecimalField → string
  old_price: string | null;

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
  hot_category_block_id?: number;
};

/* ==================================================
   COMFORT RAIL (RAW)
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
   🧠 COMFORT EDITORIAL BLOCK (RAW)
================================================== */
export type APIComfortEditorialBlock = {
  id: number;
  title: string;
  subtitle: string | null;
  image: string | null;
  cta_text: string | null;
  cta_url: string | null;
};

/* ==================================================
   CMS LAYOUT BLOCK (RAW — SAFE DISCRIMINATED UNION)
--------------------------------------------------
✔ Every block has id + order
✔ Matches LandingCMSAPIView
✔ Sortable & type-safe
================================================== */

type CMSBaseBlock = {
  id: number;
  order: number;
};

export type LandingCMSBlock =
  | (CMSBaseBlock & {
      type: "hero";
    })
  | (CMSBaseBlock & {
      type: "menu";
    })
  | (CMSBaseBlock & {
      type: "featured";
    })
  | (CMSBaseBlock & {
      type: "hot";
      hot_category_block_id: number;
    })
  | (CMSBaseBlock & {
      type: "comfort_block";
      comfort_editorial_block_id: number;
    })
  | (CMSBaseBlock & {
      type: "comfort_rail";
      comfort_rail_id: number;
    });
