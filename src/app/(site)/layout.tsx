import type { Metadata } from "next";
import Script from "next/script";

import Navbar from "../../components/navbar/Navbar";
import CartHydration from "@/components/CartHydration";

/* 🔥 GLOBAL UI OVERLAYS */
import AddToCartModal from "@/components/cart/AddToCartModal";
import CartDrawer from "@/components/cart/CartDrawer";

import "@fortawesome/fontawesome-free/css/all.min.css";

/* ==================================================
   GLOBAL CONFIG
================================================== */
const SITE_NAME = "Exuberance";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/* ==================================================
   GLOBAL SEO METADATA (DEFAULTS)
================================================== */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },

  description:
    "Exuberance – Premium lifestyle & fashion brand. Discover quality clothing, modern designs, and everyday essentials.",

  alternates: {
    canonical: SITE_URL,
  },

  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description:
      "Exuberance – Premium lifestyle & fashion brand. Discover quality clothing and everyday essentials.",
    url: SITE_URL,
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: "Exuberance – Premium lifestyle & fashion brand.",
    images: ["/og-default.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

/* ==================================================
   SITE ROOT LAYOUT (PUBLIC ONLY)
================================================== */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* =========================================
           META PIXEL (BASE – LOADS ONCE)
        ========================================== */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <Script
            id="meta-pixel-base"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');

                fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}
      </head>

      <body suppressHydrationWarning>
        {/* =========================================
           NOSCRIPT FALLBACK (META PIXEL)
        ========================================== */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        )}

        {/* =========================================
           CLIENT-SIDE STORE HYDRATION
        ========================================== */}
        <CartHydration />

        {/* =========================================
           GLOBAL NAVIGATION
        ========================================== */}
        <Navbar />

        {/* =========================================
           GLOBAL OVERLAYS (ONCE)
        ========================================== */}
        <AddToCartModal />
        <CartDrawer />

        {/* =========================================
           PAGE CONTENT
        ========================================== */}
        <main id="app-content">{children}</main>
      </body>
    </html>
  );
}
