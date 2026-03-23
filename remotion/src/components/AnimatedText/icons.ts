/**
 * Unicode Icon Map for AnimatedText Segments
 *
 * A lightweight, dependency-free icon system using Unicode symbols.
 * Icons animate alongside text in segments and inherit font styling.
 *
 * Usage:
 * <AnimatedText
 *   segments={[
 *     { text: "Click " },
 *     { icon: "arrowRight" },
 *     { text: " to continue" }
 *   ]}
 * />
 */

export const iconMap: Record<string, string> = {
  // Bullets & shapes
  circle: "●",
  circleFilled: "●",
  circleOutline: "○",
  square: "■",
  squareOutline: "□",
  diamond: "◆",
  diamondOutline: "◇",
  triangle: "▲",
  triangleDown: "▼",
  triangleRight: "▶",
  triangleLeft: "◀",

  // Arrows
  arrowRight: "→",
  arrowLeft: "←",
  arrowUp: "↑",
  arrowDown: "↓",
  arrowUpRight: "↗",
  arrowDownRight: "↘",
  arrowUpLeft: "↖",
  arrowDownLeft: "↙",
  doubleArrowRight: "»",
  doubleArrowLeft: "«",

  // Common symbols
  check: "✓",
  checkBold: "✔",
  cross: "✕",
  crossBold: "✖",
  star: "★",
  starOutline: "☆",
  heart: "♥",
  heartOutline: "♡",
  sparkle: "✦",
  sparkles: "✧",
  bullet: "•",
  dash: "—",
  ellipsis: "…",

  // Tech/UI symbols
  keyboard: "⌨",
  cursor: "▶",
  play: "▶",
  pause: "⏸",
  stop: "■",
  record: "●",
  power: "⏻",
  settings: "⚙",
  search: "🔍",
  link: "🔗",
  lock: "🔒",
  unlock: "🔓",
  eye: "👁",
  pin: "📌",
  lightning: "⚡",
  fire: "🔥",

  // Math & logic
  plus: "+",
  minus: "−",
  multiply: "×",
  divide: "÷",
  equals: "=",
  notEquals: "≠",
  lessThan: "<",
  greaterThan: ">",
  infinity: "∞",

  // Misc
  sun: "☀",
  moon: "☽",
  cloud: "☁",
  umbrella: "☂",
  music: "♪",
  musicNotes: "♫",
};

/**
 * Get an icon character by name.
 * Returns the input string if icon is not found (allows custom emoji/unicode).
 *
 * @param name - Icon name from iconMap or custom unicode/emoji
 * @returns Unicode character for the icon
 */
export const getIcon = (name: string): string => iconMap[name] || name;

/**
 * List of all available icon names
 */
export const availableIcons = Object.keys(iconMap);
