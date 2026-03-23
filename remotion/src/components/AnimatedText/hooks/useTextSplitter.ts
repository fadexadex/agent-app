import { useMemo } from 'react';
import type { AnimationUnit, TextUnit, TextSegment, ParsedUnit } from '../types';
import { getIcon } from '../icons';

/**
 * Split text into animatable units (words, characters, or lines)
 */
export const useTextSplitter = (
  text: string,
  unit: AnimationUnit
): TextUnit[] => {
  return useMemo(() => {
    if (unit === 'full') {
      return [{ text, index: 0 }];
    }

    if (unit === 'line') {
      return text.split('\n').map((line, index) => ({
        text: line,
        index,
      }));
    }

    if (unit === 'word') {
      const units: TextUnit[] = [];
      let index = 0;

      // Split by spaces but preserve spaces as separate units for layout
      const parts = text.split(/(\s+)/);

      parts.forEach((part) => {
        if (part.length === 0) return;

        if (/^\s+$/.test(part)) {
          // This is whitespace - render as a space
          units.push({ text: part, index: index++, isSpace: true });
        } else {
          // This is a word
          units.push({ text: part, index: index++ });
        }
      });

      return units;
    }

    if (unit === 'character') {
      return text.split('').map((char, index) => ({
        text: char,
        index,
        isSpace: char === ' ',
      }));
    }

    return [{ text, index: 0 }];
  }, [text, unit]);
};

/**
 * Split segments into animatable units while preserving per-segment styles.
 * Each word/character inherits the style from its parent segment.
 */
export const useSegmentSplitter = (
  segments: TextSegment[],
  unit: AnimationUnit
): ParsedUnit[] => {
  return useMemo(() => {
    const units: ParsedUnit[] = [];
    let globalIndex = 0;

    segments.forEach((segment) => {
      // Handle icon segments - always treated as a single unit
      if (segment.icon) {
        units.push({
          text: getIcon(segment.icon),
          index: globalIndex++,
          isIcon: true,
          color: segment.color,
          fontWeight: segment.fontWeight,
          fontSize: segment.fontSize,
          highlight: segment.highlight,
        });
        return;
      }

      const text = segment.text || '';

      if (unit === 'full') {
        // For full mode, each segment is one unit
        if (text.length > 0) {
          units.push({
            text,
            index: globalIndex++,
            color: segment.color,
            fontWeight: segment.fontWeight,
            fontSize: segment.fontSize,
            highlight: segment.highlight,
          });
        }
        return;
      }

      if (unit === 'line') {
        // Split segment by lines, preserving styles
        const lines = text.split('\n');
        lines.forEach((line) => {
          if (line.length > 0) {
            units.push({
              text: line,
              index: globalIndex++,
              color: segment.color,
              fontWeight: segment.fontWeight,
              fontSize: segment.fontSize,
              highlight: segment.highlight,
            });
          }
        });
        return;
      }

      if (unit === 'word') {
        // Split by spaces but preserve spaces as separate units
        const parts = text.split(/(\s+)/);

        parts.forEach((part) => {
          if (part.length === 0) return;

          if (/^\s+$/.test(part)) {
            // Whitespace - no styling needed
            units.push({ text: part, index: globalIndex++, isSpace: true });
          } else {
            // Word - apply segment styles
            units.push({
              text: part,
              index: globalIndex++,
              color: segment.color,
              fontWeight: segment.fontWeight,
              fontSize: segment.fontSize,
              highlight: segment.highlight,
            });
          }
        });
        return;
      }

      if (unit === 'character') {
        // Split into characters, each inherits segment styles
        text.split('').forEach((char) => {
          units.push({
            text: char,
            index: globalIndex++,
            isSpace: char === ' ',
            // Only apply styles to non-space characters
            ...(char !== ' ' && {
              color: segment.color,
              fontWeight: segment.fontWeight,
              fontSize: segment.fontSize,
              highlight: segment.highlight,
            }),
          });
        });
        return;
      }
    });

    return units;
  }, [segments, unit]);
};

/**
 * Get total count of non-space units for stagger calculations
 */
export const useAnimatableUnitCount = (units: TextUnit[]): number => {
  return useMemo(() => {
    return units.filter((u) => !u.isSpace).length;
  }, [units]);
};
