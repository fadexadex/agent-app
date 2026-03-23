/**
 * ScrollContainer Component
 *
 * Enables animated scrolling within a container for UI demos.
 * Perfect for showcasing scrollable interfaces within MockupFrame.
 *
 * @example
 * ```tsx
 * import { ScrollContainer } from '@/components/UIDemo';
 *
 * const scrollY = interpolate(frame, [0, 60], [0, 500], { extrapolateRight: 'clamp' });
 *
 * <ScrollContainer
 *   scrollY={scrollY}
 *   height={600}
 *   contentHeight={1200}
 *   showScrollbar
 * >
 *   <LongContent />
 * </ScrollContainer>
 * ```
 */

import React from 'react';
import { interpolate } from 'remotion';

// ============================================
// Types
// ============================================

export interface ScrollContainerProps {
  /** Current scroll position (Y offset in pixels) */
  scrollY: number;
  /** Visible height of the container */
  height: number;
  /** Total height of the scrollable content */
  contentHeight: number;
  /** Width of the container (default: 100%) */
  width?: number | string;
  /** Whether to show a scrollbar indicator */
  showScrollbar?: boolean;
  /** Scrollbar color */
  scrollbarColor?: string;
  /** Scrollbar width */
  scrollbarWidth?: number;
  /** Content to scroll */
  children: React.ReactNode;
  /** Additional styles for the container */
  style?: React.CSSProperties;
  /** Overflow behavior for content outside bounds */
  overflow?: 'hidden' | 'visible';
}

// ============================================
// Component
// ============================================

export const ScrollContainer: React.FC<ScrollContainerProps> = ({
  scrollY,
  height,
  contentHeight,
  width = '100%',
  showScrollbar = true,
  scrollbarColor = 'rgba(255, 255, 255, 0.3)',
  scrollbarWidth = 6,
  children,
  style,
  overflow = 'hidden',
}) => {
  // Calculate scrollbar metrics
  const scrollableDistance = Math.max(0, contentHeight - height);
  const scrollbarHeight = Math.max(40, (height / contentHeight) * height);
  const maxScrollbarY = height - scrollbarHeight;

  // Clamp scrollY to valid range
  const clampedScrollY = Math.max(0, Math.min(scrollY, scrollableDistance));

  // Calculate scrollbar position
  const scrollbarY = scrollableDistance > 0
    ? interpolate(clampedScrollY, [0, scrollableDistance], [0, maxScrollbarY])
    : 0;

  // Calculate scrollbar opacity (fade when not scrolling)
  const scrollbarOpacity = showScrollbar ? 1 : 0;

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        overflow,
        ...style,
      }}
    >
      {/* Scrollable content */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: showScrollbar ? scrollbarWidth + 8 : 0,
          transform: `translateY(-${clampedScrollY}px)`,
          willChange: 'transform',
        }}
      >
        {children}
      </div>

      {/* Scrollbar track */}
      {showScrollbar && scrollableDistance > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: scrollbarWidth,
            height: height - 8,
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: scrollbarWidth / 2,
            opacity: scrollbarOpacity,
          }}
        >
          {/* Scrollbar thumb */}
          <div
            style={{
              position: 'absolute',
              top: scrollbarY,
              left: 0,
              width: scrollbarWidth,
              height: scrollbarHeight,
              backgroundColor: scrollbarColor,
              borderRadius: scrollbarWidth / 2,
              transition: 'background-color 0.15s ease',
            }}
          />
        </div>
      )}

      {/* Fade gradients at top/bottom edges */}
      {clampedScrollY > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 30,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), transparent)',
            pointerEvents: 'none',
          }}
        />
      )}
      {clampedScrollY < scrollableDistance && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 30,
            background: 'linear-gradient(to top, rgba(0,0,0,0.1), transparent)',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};

export default ScrollContainer;
