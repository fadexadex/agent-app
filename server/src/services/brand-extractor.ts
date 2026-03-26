/**
 * Brand Color Extractor Service
 *
 * Calls openbrand.sh API to extract brand colors, logos, and metadata from websites.
 * Used to generate brand-consistent video scenes with the extracted color palette.
 */

export interface BrandColors {
  brandName?: string;
  colors: string[];  // Hex color array: ["#FF5733", "#C70039"]
  logos?: string[];
}

interface OpenBrandResponse {
  brand_name?: string;
  colors?: Array<{
    hex?: string;
    rgb?: string;
    source?: string;
  }>;
  logos?: Array<{
    url: string;
    type?: string;
  }>;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Extracts brand colors from a website URL using openbrand.sh API
 *
 * @param websiteUrl - The website URL to extract colors from (e.g., "https://stripe.com")
 * @returns Promise with brand name, color array, and optional logos
 * @throws Error if API call fails or returns invalid data
 *
 * @example
 * ```typescript
 * const result = await extractBrandColors("https://stripe.com");
 * // Returns: { brandName: "Stripe", colors: ["#635BFF", "#0A2540"], logos: [...] }
 * ```
 */
export async function extractBrandColors(websiteUrl: string): Promise<BrandColors> {
  // Validate URL format
  if (!websiteUrl || typeof websiteUrl !== 'string') {
    throw new Error('Invalid URL: URL must be a non-empty string');
  }

  // Normalize URL - add https:// if missing protocol
  let normalizedUrl = websiteUrl.trim();
  if (!normalizedUrl.match(/^https?:\/\//i)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  // Validate URL format with URL constructor
  try {
    new URL(normalizedUrl);
  } catch (err) {
    throw new Error('Invalid URL format');
  }

  // Check for API key
  const apiKey = process.env.OPENBRAND_API_KEY;
  if (!apiKey) {
    console.error('[BrandExtractor] OPENBRAND_API_KEY not found in environment');
    throw new Error('Brand color extraction service is not configured');
  }

  // Call openbrand.sh API with timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const apiUrl = `https://openbrand.sh/api/extract?url=${encodeURIComponent(normalizedUrl)}`;

    console.log(`[BrandExtractor] Calling openbrand.sh API for: ${normalizedUrl}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[BrandExtractor] Brand not found for: ${normalizedUrl}`);
        return {
          colors: [],
          brandName: undefined,
        };
      } else if (response.status === 403 || response.status === 401) {
        console.error('[BrandExtractor] Authentication failed - check API key');
        throw new Error('Authentication failed');
      } else if (response.status === 429) {
        console.error('[BrandExtractor] Rate limit exceeded');
        throw new Error('Rate limit exceeded');
      } else {
        console.error(`[BrandExtractor] API error: ${response.status}`);
        throw new Error(`API request failed with status ${response.status}`);
      }
    }

    // Parse response
    const data: OpenBrandResponse = await response.json();

    // Check for API-level errors
    if (data.error) {
      console.error(`[BrandExtractor] API returned error: ${data.error.code} - ${data.error.message}`);
      throw new Error(data.error.message || 'API returned an error');
    }

    // Extract and clean colors
    const colors: string[] = [];
    if (data.colors && Array.isArray(data.colors)) {
      for (const colorObj of data.colors) {
        if (colorObj.hex) {
          // Ensure hex format with #
          const hex = colorObj.hex.startsWith('#') ? colorObj.hex : `#${colorObj.hex}`;
          // Validate hex format (3 or 6 digits)
          if (/^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$/.test(hex)) {
            colors.push(hex.toUpperCase());
          }
        }
      }
    }

    // Remove duplicates while preserving order
    const uniqueColors = Array.from(new Set(colors));

    // Extract logos
    const logos: string[] = [];
    if (data.logos && Array.isArray(data.logos)) {
      for (const logoObj of data.logos) {
        if (logoObj.url) {
          logos.push(logoObj.url);
        }
      }
    }

    console.log(`[BrandExtractor] Success: Found ${uniqueColors.length} colors for ${data.brand_name || normalizedUrl}`);

    return {
      brandName: data.brand_name,
      colors: uniqueColors,
      logos: logos.length > 0 ? logos : undefined,
    };

  } catch (error) {
    clearTimeout(timeout);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('[BrandExtractor] Request timeout');
        throw new Error('Request timeout - please try again');
      }
      throw error;
    }

    console.error('[BrandExtractor] Unexpected error:', error);
    throw new Error('Failed to extract brand colors');
  }
}
