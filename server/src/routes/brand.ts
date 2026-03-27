/**
 * Brand API Routes
 *
 * Endpoints for extracting brand colors and assets from websites using openbrand.sh API
 */

import { Router, Request, Response } from "express";
import { extractBrandColors } from "../services/brand-extractor.js";

const router = Router();

/**
 * POST /api/brand/extract
 *
 * Extracts brand colors from a website URL
 *
 * Request body:
 * {
 *   "url": "https://stripe.com",
 *   "fresh": true
 * }
 * (`fresh` is optional — forwards to OpenBrand to skip cached extractions)
 *
 * Response (success):
 * {
 *   "success": true,
 *   "brandName": "Stripe",
 *   "colors": ["#635BFF", "#0A2540", "#00D4FF"],
 *   "logos": ["https://..."]
 * }
 *
 * Response (error):
 * {
 *   "success": false,
 *   "error": "Error message"
 * }
 */
router.post("/extract", async (req: Request, res: Response) => {
  try {
    const { url, fresh } = req.body as { url?: string; fresh?: boolean };

    // Validate request body
    if (!url) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: url",
      });
    }

    if (typeof url !== 'string' || url.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid URL: must be a non-empty string",
      });
    }

    // Call brand extractor service
    console.log(`[BrandAPI] Extracting colors for: ${url}`);
    const result = await extractBrandColors(url, { fresh: Boolean(fresh) });

    // Check if any colors were found
    if (result.colors.length === 0) {
      const logoN = result.logos?.length ?? 0;
      const backdropN = result.backdrops?.length ?? 0;
      let message =
        "No brand colors could be derived (OpenBrand uses theme-color, manifest, and logo pixels).";
      if (logoN > 0 || backdropN > 0) {
        const bits: string[] = [];
        if (logoN > 0) bits.push(`${logoN} logo asset(s)`);
        if (backdropN > 0) bits.push(`${backdropN} backdrop image(s)`);
        message = `Found ${bits.join(" and ")}, but no color palette. Try the homepage, another page, or enable bypass cache.`;
      } else {
        message +=
          " This site may block scrapers, use a minimal landing page, or lack favicon/theme metadata.";
      }
      return res.status(200).json({
        success: true,
        message,
        brandName: result.brandName,
        colors: [],
        logos: result.logos || [],
        backdrops: result.backdrops || [],
      });
    }

    // Return successful result
    return res.status(200).json({
      success: true,
      brandName: result.brandName,
      colors: result.colors,
      logos: result.logos || [],
      backdrops: result.backdrops || [],
    });

  } catch (error) {
    console.error('[BrandAPI] Error extracting colors:', error);

    // Handle specific error types
    if (error instanceof Error) {
      const message = error.message;

      // Authentication errors
      if (message.includes('Authentication failed') || message.includes('not configured')) {
        return res.status(503).json({
          success: false,
          error: "Brand color extraction service is temporarily unavailable",
        });
      }

      // Rate limit errors
      if (message.includes('Rate limit')) {
        return res.status(429).json({
          success: false,
          error: "Rate limit exceeded. Please try again in a few minutes.",
        });
      }

      // Timeout errors
      if (message.includes('timeout')) {
        return res.status(504).json({
          success: false,
          error: "Request timeout. Please try again.",
        });
      }

      // Invalid URL format
      if (message.includes('Invalid URL')) {
        return res.status(400).json({
          success: false,
          error: "Invalid website URL format",
        });
      }

      // Generic error with message
      return res.status(500).json({
        success: false,
        error: message,
      });
    }

    // Unknown error
    return res.status(500).json({
      success: false,
      error: "Failed to extract brand colors",
    });
  }
});

export default router;
