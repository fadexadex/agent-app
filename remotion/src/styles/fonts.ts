/**
 * Font Registry - Pre-loaded Google Fonts for Motion Design
 *
 * This module loads and registers all available fonts at startup.
 * AI-generated compositions can use these fonts by simply passing
 * the font name as a string to fontFamily props.
 *
 * Usage:
 *   <AnimatedText text="Hello" fontFamily="DM Sans" />
 *   <div style={{ fontFamily: "Bebas Neue" }}>HEADLINE</div>
 */

// Sans-serif fonts (Modern/Clean)
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadRoboto } from "@remotion/google-fonts/Roboto";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadSora } from "@remotion/google-fonts/Sora";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";
import { loadFont as loadGolosText } from "@remotion/google-fonts/GolosText";

// Display fonts (Bold/Impactful headlines)
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as loadBebasNeue } from "@remotion/google-fonts/BebasNeue";

// Serif fonts (Elegant/Editorial)
import { loadFont as loadInstrumentSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadPlayfairDisplay } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadLora } from "@remotion/google-fonts/Lora";

// Monospace fonts (Technical/Code)
import { loadFont as loadRobotoMono } from "@remotion/google-fonts/RobotoMono";

/**
 * Font loading options to reduce network requests
 * Note: We use inline objects instead of a shared const to avoid TypeScript readonly issues
 */

/**
 * Initialize all fonts by calling their loaders.
 * Each loader returns an object with { fontFamily, ...styles }
 */
const loadedFonts = {
  // Sans-serif
  "DM Sans": loadDMSans("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"], ignoreTooManyRequestsWarning: true }),
  Inter: loadInter("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"], ignoreTooManyRequestsWarning: true }),
  Roboto: loadRoboto("normal", { weights: ["400", "500", "700"], subsets: ["latin"], ignoreTooManyRequestsWarning: true }),
  Montserrat: loadMontserrat("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"], ignoreTooManyRequestsWarning: true }),
  Poppins: loadPoppins("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"], ignoreTooManyRequestsWarning: true }),
  "Space Grotesk": loadSpaceGrotesk("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"], ignoreTooManyRequestsWarning: true }),
  Sora: loadSora("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"], ignoreTooManyRequestsWarning: true }),
  Manrope: loadManrope("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"], ignoreTooManyRequestsWarning: true }),
  "Golos Text": loadGolosText("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"], ignoreTooManyRequestsWarning: true }),

  // Display
  Oswald: loadOswald("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"], ignoreTooManyRequestsWarning: true }),
  "Bebas Neue": loadBebasNeue("normal", { subsets: ["latin"], ignoreTooManyRequestsWarning: true }),

  // Serif
  "Instrument Serif": loadInstrumentSerif("normal", { weights: ["400"], subsets: ["latin"], ignoreTooManyRequestsWarning: true }),
  "Playfair Display": loadPlayfairDisplay("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"], ignoreTooManyRequestsWarning: true }),
  Lora: loadLora("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"], ignoreTooManyRequestsWarning: true }),

  // Mono
  "Roboto Mono": loadRobotoMono("normal", { weights: ["400", "500", "700"], subsets: ["latin"], ignoreTooManyRequestsWarning: true }),
} as const;

/**
 * Font map - maps font names to their CSS fontFamily values
 * Use these values directly in style props
 */
export const fontMap: Record<string, string> = Object.fromEntries(
  Object.entries(loadedFonts).map(([name, { fontFamily }]) => [name, fontFamily])
);

/**
 * List of all available font names
 * AI can choose from this list when generating compositions
 */
export const availableFonts = Object.keys(fontMap);

/**
 * Fonts organized by category for semantic selection
 */
export const fontCategories = {
  /** Clean, modern sans-serif fonts - good for body text and UI */
  sans: [
    "DM Sans",
    "Inter",
    "Roboto",
    "Montserrat",
    "Poppins",
    "Space Grotesk",
    "Sora",
    "Manrope",
    "Golos Text",
  ],
  /** Bold, impactful fonts - great for headlines and titles */
  display: ["Oswald", "Bebas Neue"],
  /** Elegant serif fonts - good for editorial and luxury brands */
  serif: ["Instrument Serif", "Playfair Display", "Lora"],
  /** Monospace fonts - for code, technical, or retro aesthetics */
  mono: ["Roboto Mono"],
} as const;

/**
 * Recommended font pairings for motion design
 */
export const fontPairings = {
  /** Bold headlines with clean body text */
  bold: { headline: "Bebas Neue", body: "DM Sans" },
  /** Elegant editorial style */
  elegant: { headline: "Playfair Display", body: "Inter" },
  /** Modern tech aesthetic */
  tech: { headline: "Space Grotesk", body: "Roboto Mono" },
  /** Corporate professional */
  corporate: { headline: "Montserrat", body: "Roboto" },
  /** Friendly and approachable */
  friendly: { headline: "Poppins", body: "DM Sans" },
  /** Minimal and clean */
  minimal: { headline: "Inter", body: "Inter" },
} as const;

/**
 * Get the CSS fontFamily value for a font name.
 * Returns system fallback if font is not found.
 *
 * @param name - The font name (e.g., "DM Sans", "Bebas Neue")
 * @returns The CSS fontFamily string
 */
export function getFont(name: string): string {
  return fontMap[name] ?? "system-ui, sans-serif";
}

/**
 * Check if a font is available in the registry
 *
 * @param name - The font name to check
 * @returns true if the font is pre-loaded and available
 */
export function isFontAvailable(name: string): boolean {
  return name in fontMap;
}

// Export type for font names
export type FontName = keyof typeof loadedFonts;
export type FontCategory = keyof typeof fontCategories;
export type FontPairing = keyof typeof fontPairings;
