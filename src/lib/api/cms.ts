import { API_BASE } from "./config";
import type { ApiBlockResponse, LandingCMSBlock } from "./types";

/* ==================================================
   LANDING CMS FETCHER (AUTHORITATIVE)
==================================================
- Never throws
- Never crashes homepage
- Backend is source of truth
- Unknown blocks are ignored safely
*/

export async function getLandingCMS(): Promise<LandingCMSBlock[]> {
  let res: Response;

  /* ----------------------------------------------
     NETWORK SAFETY
  ---------------------------------------------- */
  try {
    res = await fetch(
      `${API_BASE}/api/landing/cms/`,
      { cache: "no-store" }
    );
  } catch (error) {
    console.error("[Landing CMS] Network error:", error);
    return [];
  }

  /* ----------------------------------------------
     HTTP SAFETY
  ---------------------------------------------- */
  if (!res.ok) {
    console.error(
      "[Landing CMS] HTTP error:",
      res.status,
      res.statusText
    );
    return [];
  }

  /* ----------------------------------------------
     JSON SAFETY
  ---------------------------------------------- */
  let data: ApiBlockResponse<any>;

  try {
    data = await res.json();
  } catch (error) {
    console.error("[Landing CMS] Invalid JSON:", error);
    return [];
  }

  if (!Array.isArray(data.items)) {
    console.error(
      "[Landing CMS] Invalid payload shape:",
      data
    );
    return [];
  }

  /* ----------------------------------------------
     NORMALIZATION (STRICT BUT SAFE)
  ---------------------------------------------- */
  return data.items
    .map((block): LandingCMSBlock | null => {
      if (!block || typeof block.type !== "string") {
        console.warn(
          "[Landing CMS] Skipping malformed block:",
          block
        );
        return null;
      }

      switch (block.type) {
        case "hero":
        case "menu":
        case "featured":
        case "hot":
        case "comfort_block":
          return { type: block.type };

        case "comfort_rail":
          return {
            type: "comfort_rail",
            comfort_rail_id:
              typeof block.comfort_rail_id === "number"
                ? block.comfort_rail_id
                : null,
          };

        default:
          console.warn(
            "[Landing CMS] Unknown block ignored:",
            block.type
          );
          return null;
      }
    })
    .filter(
      (block): block is LandingCMSBlock =>
        block !== null
    );
}
