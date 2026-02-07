import { API_BASE } from "./config";
import type { ApiBlockResponse, LandingCMSBlock } from "./types";

/* ==================================================
   LANDING CMS FETCHER (AUTHORITATIVE)
================================================== */
export async function getLandingCMS(): Promise<LandingCMSBlock[]> {
  let res: Response;

  try {
    res = await fetch(`${API_BASE}/api/landing/cms/`, { cache: "no-store" });
  } catch (error) {
    console.error("[Landing CMS] Network error:", error);
    return [];
  }

  if (!res.ok) {
    console.error("[Landing CMS] HTTP error:", res.status, res.statusText);
    return [];
  }

  let data: ApiBlockResponse<any>;
  try {
    data = await res.json();
  } catch (error) {
    console.error("[Landing CMS] Invalid JSON:", error);
    return [];
  }

  if (!Array.isArray(data.items)) {
    console.error("[Landing CMS] Invalid payload shape:", data);
    return [];
  }

  /* ===============================================
     NORMALIZATION (STRICT BUT SAFE)
  =============================================== */
  return data.items
    .map((block, index): LandingCMSBlock | null => {
      if (!block || typeof block.type !== "string") {
        console.warn("[Landing CMS] Skipping malformed block:", block);
        return null;
      }

      // Every block needs an id and order
      const id = typeof block.id === "number" ? block.id : index;
      const order = typeof block.order === "number" ? block.order : index;

      switch (block.type) {
        case "hero":
        case "menu":
        case "featured":
        case "hot":
        case "comfort_block":
          return {
            type: block.type,
            id,
            order,
          };

        case "comfort_rail": {
          const comfort_rail_id =
            typeof block.comfort_rail_id === "number" ? block.comfort_rail_id : index;
          return {
            type: "comfort_rail",
            id,
            order,
            comfort_rail_id,
          };
        }

        default:
          console.warn("[Landing CMS] Unknown block ignored:", block.type);
          return null;
      }
    })
    .filter((block): block is LandingCMSBlock => block !== null);
}
