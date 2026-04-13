import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion';

export const BouncingBall: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps, width, height } = useVideoConfig();

	// 1. Horizontal movement: slide from left to right
	const moveX = interpolate(frame, [0, 90], [width * 0.2, width * 0.8], {
		extrapolateRight: 'clamp',
	});

	// 2. Vertical bounce logic
	// We'll use a sine wave absolute value for the bounce, or a series of springs.
	// Let's create a "bouncing" progress using math for a classic look.
	const bounceHeight = 300;
	const groundY = height / 2 + 100;
	
	// Create a bounce effect using absolute sine
	const bounceProgress = Math.abs(Math.sin((frame / fps) * Math.PI * 1.5));
	const moveY = groundY - bounceProgress * bounceHeight;

	// 3. Squash and Stretch
	// When near the ground, the ball should flatten.
	const isNearGround = interpolate(bounceProgress, [0, 0.2], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	
	const scaleX = interpolate(isNearGround, [0, 1], [1, 1.4]);
	const scaleY = interpolate(isNearGround, [0, 1], [1, 0.6]);

	// 4. Shadow animation
	const shadowScale = interpolate(bounceProgress, [0, 1], [1, 0.4]);
	const shadowOpacity = interpolate(bounceProgress, [0, 1], [0.4, 0.1]);

	return (
		<AbsoluteFill style={{ backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }}>
			{/* Ground Line */}
			<div style={{
				position: 'absolute',
				bottom: height - groundY - 50,
				width: '80%',
				height: 4,
				backgroundColor: '#333',
				borderRadius: 2,
				opacity: 0.2
			}} />

			{/* Shadow */}
			<div style={{
				position: 'absolute',
				left: moveX - 50,
				top: groundY + 40,
				width: 100 * shadowScale,
				height: 20 * shadowScale,
				backgroundColor: '#000',
				borderRadius: '50%',
				opacity: shadowOpacity,
				filter: 'blur(10px)',
				transform: `translateX(${(1 - shadowScale) * 50}px)`
			}} />

			{/* The Ball */}
			<div style={{
				position: 'absolute',
				left: moveX - 50,
				top: moveY - 50,
				width: 100,
				height: 100,
				backgroundColor: '#ff4757',
				borderRadius: '50%',
				boxShadow: '0 10px 30px rgba(255, 71, 87, 0.4)',
				transform: `scale(${scaleX}, ${scaleY})`,
				transformOrigin: 'bottom'
			}}>
				{/* Shine/Highlight */}
				<div style={{
					position: 'absolute',
					top: 15,
					left: 15,
					width: 30,
					height: 30,
					backgroundColor: 'rgba(255, 255, 255, 0.4)',
					borderRadius: '50%',
					filter: 'blur(5px)'
				}} />
			</div>
		</AbsoluteFill>
	);
};
