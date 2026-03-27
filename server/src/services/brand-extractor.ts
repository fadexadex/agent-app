/**
 * Brand Color Extractor Service
 *
 * Calls openbrand.sh API to extract brand colors, logos, and metadata from websites.
 * Used to generate brand-consistent video scenes with the extracted color palette.
 */

export interface BrandColors {
  brandName?: string;
  colors: string[]; // Hex color array: ["#FF5733", "#C70039"]
  logos?: string[];
  /** Hero / OG images from OpenBrand (present when colors could not be derived) */
  backdrops?: string[];
}

/** Current API: { success, data } — legacy: flat brand_name / colors on root */
interface OpenBrandJson {
  success?: boolean;
  data?: OpenBrandPayload;
  brand_name?: string;
  brandName?: string;
  colors?: OpenBrandColor[];
  logos?: Array<{ url: string; type?: string }>;
  error?: string | { code?: string; message?: string };
}

interface OpenBrandPayload {
  brand_name?: string;
  brandName?: string;
  colors?: unknown[];
  logos?: unknown[];
  backdrops?: Array<{ url: string; description?: string }>;
}

interface OpenBrandColor {
  hex?: string;
  color?: string;
  value?: string;
  rgb?: string;
  source?: string;
  usage?: string;
}

function errorMessageFromBody(error: OpenBrandJson["error"]): string | undefined {
  if (error == null) return undefined;
  if (typeof error === "string") return error;
  return error.message;
}

function normalizePayload(json: OpenBrandJson): OpenBrandPayload {
  if (json.success === false) {
    throw new Error(errorMessageFromBody(json.error) ?? "API returned an error");
  }
  const inner = json.data ?? json;
  return inner;
}

function normalizeHexForPalette(raw: string): string | null {
  let s = raw.trim();
  if (!s) return null;
  if (!s.startsWith("#")) s = `#${s}`;
  if (/^#[0-9A-Fa-f]{3}$/.test(s)) {
    s = `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  }
  if (/^#[0-9A-Fa-f]{8}$/.test(s)) {
    s = s.slice(0, 7);
  }
  if (/^#[0-9A-Fa-f]{6}$/.test(s)) {
    return s.toUpperCase();
  }
  return null;
}

function hexFromColorEntry(entry: unknown): string | null {
  if (typeof entry === "string") {
    return normalizeHexForPalette(entry);
  }
  if (!entry || typeof entry !== "object") return null;
  const o = entry as OpenBrandColor & Record<string, unknown>;
  const fromHex =
    typeof o.hex === "string"
      ? o.hex
      : typeof o.color === "string"
        ? o.color
        : typeof o.value === "string"
          ? o.value
          : null;
  if (fromHex) {
    const h = normalizeHexForPalette(fromHex);
    if (h) return h;
  }
  if (typeof o.rgb === "string") {
    const m = o.rgb.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (m) {
      const r = Number(m[1]);
      const g = Number(m[2]);
      const b = Number(m[3]);
      return normalizeHexForPalette(
        `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`,
      );
    }
  }
  return null;
}

function mapToBrandColors(payload: OpenBrandPayload, fallbackUrl: string): BrandColors {
  const brandName = payload.brandName ?? payload.brand_name;

  const colors: string[] = [];
  if (payload.colors && Array.isArray(payload.colors)) {
    for (const entry of payload.colors) {
      const hex = hexFromColorEntry(entry);
      if (hex) colors.push(hex);
    }
  }

  const uniqueColors = Array.from(new Set(colors));

  const logos: string[] = [];
  if (payload.logos && Array.isArray(payload.logos)) {
    for (const logoObj of payload.logos) {
      if (typeof logoObj === "string" && /^https?:\/\//i.test(logoObj)) {
        logos.push(logoObj);
        continue;
      }
      if (logoObj && typeof logoObj === "object" && "url" in logoObj) {
        const u = (logoObj as { url: unknown }).url;
        if (typeof u === "string" && u.length > 0) logos.push(u);
      }
    }
  }

  const backdrops: string[] = [];
  if (payload.backdrops && Array.isArray(payload.backdrops)) {
    for (const b of payload.backdrops) {
      if (b?.url) backdrops.push(b.url);
    }
  }

  console.log(
    `[BrandExtractor] Parsed: ${uniqueColors.length} colors, ${logos.length} logos, ${backdrops.length} backdrops for ${brandName ?? fallbackUrl}`,
  );

  return {
    brandName,
    colors: uniqueColors,
    logos: logos.length > 0 ? logos : undefined,
    backdrops: backdrops.length > 0 ? backdrops : undefined,
  };
}

/**
 * Extracts brand colors from a website URL using openbrand.sh API
 */
export async function extractBrandColors(websiteUrl: string): Promise<BrandColors> {
  if (!websiteUrl || typeof websiteUrl !== "string") {
    throw new Error("Invalid URL: URL must be a non-empty string");
  }

  let normalizedUrl = websiteUrl.trim();
  if (!normalizedUrl.match(/^https?:\/\//i)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  try {
    new URL(normalizedUrl);
  } catch {
    throw new Error("Invalid URL format");
  }

  console.log(`[BrandExtractor] Input: "${websiteUrl}" → Normalized: "${normalizedUrl}"`);

  const apiKey = process.env.OPENBRAND_API_KEY?.trim();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const apiUrl = `https://openbrand.sh/api/extract?url=${encodeURIComponent(normalizedUrl)}`;

    console.log(`[BrandExtractor] Calling openbrand.sh API for: ${normalizedUrl}`);

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    let json: OpenBrandJson | null = null;
    try {
      json = (await response.json()) as OpenBrandJson;
    } catch {
      json = null;
    }

    if (!response.ok) {
      const msg = json ? errorMessageFromBody(json.error) : undefined;
      if (response.status === 404) {
        console.log(`[BrandExtractor] Brand not found for: ${normalizedUrl}`);
        return { colors: [], brandName: undefined };
      }
      if (response.status === 403 || response.status === 401) {
        console.error("[BrandExtractor] Authentication failed - check OPENBRAND_API_KEY");
        throw new Error("Authentication failed");
      }
      if (response.status === 429) {
        console.error("[BrandExtractor] Rate limit exceeded");
        throw new Error("Rate limit exceeded");
      }
      console.error(`[BrandExtractor] API error: ${response.status}`, msg);
      throw new Error(msg ?? `API request failed with status ${response.status}`);
    }

    if (!json) {
      throw new Error("Invalid API response");
    }

    const payload = normalizePayload(json);
    return mapToBrandColors(payload, normalizedUrl);
  } catch (error) {
    clearTimeout(timeout);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.error("[BrandExtractor] Request timeout");
        throw new Error("Request timeout - please try again");
      }
      throw error;
    }

    console.error("[BrandExtractor] Unexpected error:", error);
    throw new Error("Failed to extract brand colors");
  }
}
