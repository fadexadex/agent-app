import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion';

export const BouncingBall: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps, width, height } = useVideoConfig();

	// 1. Scene entrance
	const entrance = spring({
		frame,
		fps,
		config: { damping: 200 },
	});

	// 2. The Bounce
	const bouncePeriod = 45;
	const relativeFrame = frame % bouncePeriod;
	
	// Higher height at 0 and bouncePeriod, lower at midpoint (the hit)
	const bounceProgress = interpolate(
		relativeFrame,
		[0, bouncePeriod / 2, bouncePeriod],
		[0, 1, 0],
		{
			easing: Easing.bezier(0.45, 0, 0.55, 1),
		}
	);

	const ballY = interpolate(bounceProgress, [0, 1], [height / 2 - 150, height / 2 + 150]);
	
	// 3. Squash and Stretch (Fixed the strictly monotonic increasing range)
	// Progress is 1 when hitting the floor
	const squash = interpolate(
		bounceProgress,
		[0.85, 1], // Transition from normal to squashed as it hits bottom
		[1, 1.3],
		{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
	);
	const stretch = interpolate(
		bounceProgress,
		[0.85, 1], // Transition from normal to stretched as it hits bottom
		[1, 0.7],
		{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
	);

	// 4. Shadow
	const shadowScale = interpolate(bounceProgress, [0, 1], [0.5, 1.2]);
	const shadowOpacity = interpolate(bounceProgress, [0, 1], [0.2, 0.6]);

	return (
		<AbsoluteFill style={{ backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' }}>
			{/* Background */}
			<div
				style={{
					width: 600,
					height: 600,
					borderRadius: '50%',
					background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(255, 255, 255, 0) 70%)',
					position: 'absolute',
					transform: `scale(${entrance})`,
				}}
			/>

			{/* Shadow */}
			<div
				style={{
					position: 'absolute',
					top: height / 2 + 180,
					width: 120,
					height: 20,
					background: 'rgba(0,0,0,0.1)',
					borderRadius: '50%',
					filter: 'blur(8px)',
					transform: `scale(${shadowScale})`,
					opacity: shadowOpacity,
				}}
			/>

			{/* The Ball */}
			<div
				style={{
					position: 'absolute',
					top: ballY,
					width: 100,
					height: 100,
					borderRadius: '50%',
					background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
					boxShadow: '0 10px 25px -5px rgba(67, 56, 202, 0.4)',
					transform: `translateY(-50%) scaleX(${squash}) scaleY(${stretch})`,
					border: '2px solid rgba(255, 255, 255, 0.2)',
					transformOrigin: 'bottom center', // Squash happens from the bottom
				}}
			>
				<div
					style={{
						position: 'absolute',
						top: '15%',
						left: '15%',
						width: '25%',
						height: '25%',
						borderRadius: '50%',
						background: 'rgba(255,255,255,0.4)',
						filter: 'blur(2px)',
					}}
				/>
			</div>
		</AbsoluteFill>
	);
};
