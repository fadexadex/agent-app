/**
 * CursorPath Component
 *
 * Animates a cursor along a path defined by waypoints.
 * Uses Catmull-Rom spline interpolation for smooth, natural curves.
 *
 * @example Basic usage
 * ```tsx
 * <CursorPath
 *   waypoints={[
 *     { x: 100, y: 100 },
 *     { x: 300, y: 150, click: true },
 *     { x: 500, y: 200, pause: 15 },
 *   ]}
 *   startTime={0}
 * />
 * ```
 *
 * @example With variant changes
 * ```tsx
 * <CursorPath
 *   waypoints={[
 *     { x: 100, y: 100, variant: 'arrow' },
 *     { x: 300, y: 200, variant: 'pointer', click: true },
 *     { x: 500, y: 300, variant: 'text' },
 *   ]}
 *   duration={90}
 * />
 * ```
 */

import React, { useMemo } from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { DynamicCursor, CursorVariant } from "./DynamicCursor";

// ============================================
// Types
// ============================================

interface Point {
    x: number;
    y: number;
}

export type CursorEasing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';

/**
 * Enhanced waypoint with optional timing and interaction controls.
 * AI only needs to specify waypoints - smooth curves are generated automatically.
 */
export interface CursorWaypoint {
    /** X coordinate */
    x: number;
    /** Y coordinate */
    y: number;
    /** Frames to reach this point from previous (default: auto-calculated) */
    duration?: number;
    /** Frames to pause at this point (default: 0) */
    pause?: number;
    /** Trigger click animation at this point */
    click?: boolean;
    /** Change cursor variant at this point */
    variant?: CursorVariant;
    /** Easing for segment leading to this point */
    easing?: CursorEasing;
}

export interface CursorPathProps {
    /** Legacy: Array of simple points */
    points?: Point[];
    /** New: Array of enhanced waypoints with timing/interaction controls */
    waypoints?: CursorWaypoint[];
    /** Frame to start movement */
    startTime?: number;
    /** Total duration of movement (frames) - used when points is provided */
    duration?: number;
    /** Default cursor variant */
    variant?: CursorVariant;
    /** Cursor color */
    color?: string;
    /** Cursor label */
    label?: string;
    /** Show trailing ghost cursors */
    showTrail?: boolean;
    /** Number of ghost cursors in trail */
    trailLength?: number;
    /** Use smooth Catmull-Rom spline interpolation */
    smoothPath?: boolean;
    /** Spline tension (0 = sharp corners, 1 = smooth) */
    tension?: number;
    /** Click ripple color */
    clickColor?: string;
}

// ============================================
// Catmull-Rom Spline Interpolation
// ============================================

/**
 * Catmull-Rom spline interpolation.
 * Generates smooth curves that pass through all control points.
 * Much easier for AI to use than Bezier - just specify waypoints.
 */
function catmullRomInterpolate(
    p0: Point,
    p1: Point,
    p2: Point,
    p3: Point,
    t: number,
    tension: number = 0.5
): Point {
    const t2 = t * t;
    const t3 = t2 * t;

    // Catmull-Rom basis functions
    const s = (1 - tension) / 2;

    const b0 = -s * t3 + 2 * s * t2 - s * t;
    const b1 = (2 - s) * t3 + (s - 3) * t2 + 1;
    const b2 = (s - 2) * t3 + (3 - 2 * s) * t2 + s * t;
    const b3 = s * t3 - s * t2;

    return {
        x: b0 * p0.x + b1 * p1.x + b2 * p2.x + b3 * p3.x,
        y: b0 * p0.y + b1 * p1.y + b2 * p2.y + b3 * p3.y,
    };
}

/**
 * Get position along a Catmull-Rom spline path.
 */
function getSplinePosition(points: Point[], t: number, tension: number): Point {
    if (points.length < 2) return points[0] || { x: 0, y: 0 };
    if (points.length === 2) {
        // Linear interpolation for 2 points
        return {
            x: points[0].x + (points[1].x - points[0].x) * t,
            y: points[0].y + (points[1].y - points[0].y) * t,
        };
    }

    const numSegments = points.length - 1;
    const scaledT = t * numSegments;
    const segmentIndex = Math.min(Math.floor(scaledT), numSegments - 1);
    const localT = scaledT - segmentIndex;

    // Get control points (extend at ends for smooth curve)
    const p0 = points[Math.max(0, segmentIndex - 1)];
    const p1 = points[segmentIndex];
    const p2 = points[Math.min(segmentIndex + 1, points.length - 1)];
    const p3 = points[Math.min(segmentIndex + 2, points.length - 1)];

    return catmullRomInterpolate(p0, p1, p2, p3, localT, tension);
}

/**
 * Linear interpolation between points (legacy behavior).
 */
function getLinearPosition(points: Point[], t: number): Point {
    if (points.length < 2) return points[0] || { x: 0, y: 0 };

    const numSegments = points.length - 1;
    const scaledT = t * numSegments;
    const segmentIndex = Math.min(Math.floor(scaledT), numSegments - 1);
    const localT = scaledT - segmentIndex;

    const p1 = points[segmentIndex];
    const p2 = points[Math.min(segmentIndex + 1, points.length - 1)];

    return {
        x: p1.x + (p2.x - p1.x) * localT,
        y: p1.y + (p2.y - p1.y) * localT,
    };
}



// ============================================
// Click Ripple Component
// ============================================

interface ClickRippleProps {
    x: number;
    y: number;
    progress: number;
    color: string;
}

const ClickRipple: React.FC<ClickRippleProps> = ({ x, y, progress, color }) => {
    const scale = progress * 2;
    const opacity = (1 - progress) * 0.6;

    return (
        <div
            style={{
                position: 'absolute',
                left: x - 15,
                top: y - 15,
                width: 30,
                height: 30,
                borderRadius: '50%',
                backgroundColor: color,
                transform: `scale(${scale})`,
                opacity,
                pointerEvents: 'none',
            }}
        />
    );
};

// ============================================
// Main Component
// ============================================

export const CursorPath: React.FC<CursorPathProps> = ({
    points,
    waypoints,
    startTime = 0,
    duration = 60,
    variant = "arrow",
    color = "#000000",
    label,
    showTrail = false,
    trailLength = 5,
    smoothPath = true,
    tension = 0.5,
    clickColor = "#6366F1",
}) => {
    const frame = useCurrentFrame();

    // Convert waypoints to timeline with cumulative timing
    const timeline = useMemo(() => {
        const effectiveWaypoints: CursorWaypoint[] = waypoints || (points?.map(p => ({ x: p.x, y: p.y })) || []);
        if (effectiveWaypoints.length === 0) return { waypoints: [], totalDuration: 0 };

        let totalDuration = 0;
        const processedWaypoints = effectiveWaypoints.map((wp, i) => {
            const segmentDuration = wp.duration !== undefined ? wp.duration : Math.round(duration / effectiveWaypoints.length);
            const pauseDuration = wp.pause !== undefined ? wp.pause : 0;

            const processed = {
                ...wp,
                startFrame: totalDuration,
                segmentDuration,
                pauseDuration,
                endFrame: totalDuration + segmentDuration + pauseDuration,
            };

            totalDuration += segmentDuration + pauseDuration;
            return processed;
        });

        return { waypoints: processedWaypoints, totalDuration };
    }, [waypoints, points, duration]);

    // Use simple path if just points provided (legacy mode)
    const effectivePoints: Point[] = useMemo(() => {
        if (waypoints) {
            return waypoints.map(wp => ({ x: wp.x, y: wp.y }));
        }
        return points || [];
    }, [waypoints, points]);

    // Calculate overall progress
    const effectiveDuration = waypoints ? timeline.totalDuration : duration;
    const localFrame = frame - startTime;

    const progress = interpolate(localFrame, [0, effectiveDuration], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.25, 1, 0.5, 1),
    });

    // Get position at progress
    const getPositionAt = (p: number): Point => {
        if (smoothPath) {
            return getSplinePosition(effectivePoints, p, tension);
        }
        return getLinearPosition(effectivePoints, p);
    };

    const currentPos = getPositionAt(progress);

    // Determine current waypoint for variant/click
    const currentWaypointIndex = useMemo(() => {
        if (!waypoints || waypoints.length === 0) return -1;

        const processedWaypoints = timeline.waypoints;
        for (let i = processedWaypoints.length - 1; i >= 0; i--) {
            if (localFrame >= processedWaypoints[i].startFrame) {
                return i;
            }
        }
        return 0;
    }, [waypoints, timeline, localFrame]);

    // Get current variant
    const currentVariant = useMemo(() => {
        if (waypoints && currentWaypointIndex >= 0) {
            // Find the most recent waypoint with a variant specified
            for (let i = currentWaypointIndex; i >= 0; i--) {
                if (waypoints[i].variant) {
                    return waypoints[i].variant;
                }
            }
        }
        return variant;
    }, [waypoints, currentWaypointIndex, variant]);

    // Calculate click animation
    const clickAnimation = useMemo(() => {
        if (!waypoints || currentWaypointIndex < 0) return { active: false, progress: 0 };

        const wp = timeline.waypoints[currentWaypointIndex];
        if (!wp || !waypoints[currentWaypointIndex].click) return { active: false, progress: 0 };

        // Click triggers when arriving at waypoint
        const clickStartFrame = wp.startFrame + wp.segmentDuration;
        const clickFrame = localFrame - clickStartFrame;

        if (clickFrame >= 0 && clickFrame <= 15) {
            return {
                active: true,
                progress: interpolate(clickFrame, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
            };
        }

        return { active: false, progress: 0 };
    }, [waypoints, timeline, currentWaypointIndex, localFrame]);

    // Render ghost trail
    const ghosts = useMemo(() => {
        if (!showTrail) return [];

        const ghostElements = [];
        for (let i = 1; i <= trailLength; i++) {
            const lag = 0.02 * i;
            const ghostProgress = Math.max(0, progress - lag);

            if (ghostProgress > 0 && ghostProgress < 1) {
                const ghostPos = getPositionAt(ghostProgress);
                ghostElements.push(
                    <DynamicCursor
                        key={`ghost-${i}`}
                        x={ghostPos.x}
                        y={ghostPos.y}
                        variant={currentVariant || 'arrow'}
                        color={color}
                        opacity={0.3 - i * 0.05}
                        scale={1}
                    />
                );
            }
        }
        return ghostElements;
    }, [showTrail, trailLength, progress, currentVariant, color, getPositionAt]);

    // Don't render before start
    if (frame < startTime) return null;

    return (
        <>
            {ghosts}

            {/* Click ripple effect */}
            {clickAnimation.active && (
                <ClickRipple
                    x={currentPos.x}
                    y={currentPos.y}
                    progress={clickAnimation.progress}
                    color={clickColor}
                />
            )}

            <DynamicCursor
                x={currentPos.x}
                y={currentPos.y}
                variant={currentVariant || 'arrow'}
                color={color}
                label={label}
                isClicking={clickAnimation.active && clickAnimation.progress < 0.5}
            />
        </>
    );
};
