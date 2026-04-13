import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const BouncingBall: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps, width, height } = useVideoConfig();

	// Smooth entry for the background
	const bgOpacity = interpolate(frame, [0, 20], [0, 1], {
		extrapolateRight: 'clamp',
	});

	// Physics for the bounce
	// We'll create a repeating bounce effect using a simple sine wave modulated by a spring for the entry
	const entrance = spring({
		frame,
		fps,
		config: {
			damping: 20,
			stiffness: 100,
		},
	});

	// Vertical movement: simple periodic bounce
	const bounceHeight = 300;
	const period = 45; // frames per bounce cycle
	const rawY = Math.abs(Math.sin((frame / period) * Math.PI));
	const yOffset = interpolate(rawY, [0, 1], [0, bounceHeight]);

	// Squash and stretch effect based on Y position
	// Squash when near the bottom (yOffset is small)
	const squash = interpolate(yOffset, [0, 50], [0.3, 0], {
		extrapolateRight: 'clamp',
	});

	const scaleY = 1 - squash;
	const scaleX = 1 + squash;

	const ballSize = 120;

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#09090B',
				justifyContent: 'center',
				alignItems: 'center',
				opacity: bgOpacity,
			}}
		>
			{/* Floor Shadow */}
			<div
				style={{
					position: 'absolute',
					bottom: height / 2 - 80,
					width: ballSize * scaleX,
					height: 20,
					backgroundColor: 'rgba(0,0,0,0.4)',
					borderRadius: '50%',
					filter: 'blur(10px)',
					transform: `scale(${interpolate(yOffset, [0, bounceHeight], [1.2, 0.5])})`,
					opacity: interpolate(yOffset, [0, bounceHeight], [0.8, 0.2]),
				}}
			/>

			{/* The Ball */}
			<div
				style={{
					width: ballSize,
					height: ballSize,
					borderRadius: '50%',
					background: 'radial-gradient(circle at 30% 30%, #3b82f6, #1d4ed8)',
					boxShadow: '0 10px 30px rgba(59, 130, 246, 0.5)',
					transform: `translateY(${-yOffset}px) scaleX(${scaleX * entrance}) scaleY(${scaleY * entrance})`,
					position: 'absolute',
				}}
			/>

			{/* Reflective Highlight */}
			<div
				style={{
					position: 'absolute',
					width: ballSize * 0.4,
					height: ballSize * 0.2,
					backgroundColor: 'rgba(255, 255, 255, 0.3)',
					borderRadius: '50%',
					top: '20%',
					left: '20%',
					filter: 'blur(5px)',
					transform: `translateY(${-yOffset}px) scaleX(${scaleX * entrance}) scaleY(${scaleY * entrance})`,
				}}
			/>
		</AbsoluteFill>
	);
};
