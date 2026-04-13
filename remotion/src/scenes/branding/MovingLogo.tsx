import React from 'react';
import {
	AbsoluteFill,
	useCurrentFrame,
	useVideoConfig,
	interpolate,
	spring,
	Extrapolate,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Montserrat';

const { fontFamily } = loadFont();

export const MovingLogo: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps, width, height } = useVideoConfig();

	// Physical properties for smooth movement
	const entrance = spring({
		frame,
		fps,
		config: { damping: 200 },
	});

	// Floating animation using sine waves for a "stunning" organic feel
	const floatX = Math.sin(frame / 20) * 30;
	const floatY = Math.cos(frame / 25) * 40;
	const rotation = Math.sin(frame / 40) * 10;

	// Scale pulse
	const pulse = interpolate(
		Math.sin(frame / 15),
		[-1, 1],
		[0.95, 1.05],
		{ extrapolateRight: 'clamp' }
	);

	const opacity = interpolate(frame, [0, 20], [0, 1], {
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#09090B',
				justifyContent: 'center',
				alignItems: 'center',
				fontFamily,
			}}
		>
			{/* Animated Background Glow */}
			<div
				style={{
					position: 'absolute',
					width: 400,
					height: 400,
					borderRadius: '50%',
					background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%)',
					transform: `translate(${floatX * 0.5}px, ${floatY * 0.5}px) scale(${pulse * 1.5})`,
				}}
			/>

			{/* The Logo Container */}
			<div
				style={{
					opacity,
					transform: `translate(${floatX}px, ${floatY}px) rotate(${rotation}deg) scale(${entrance * pulse})`,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: '20px',
				}}
			>
				{/* Abstract Geometric Logo Shape */}
				<div
					style={{
						width: 120,
						height: 120,
						position: 'relative',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					{/* Outer Ring */}
					<div
						style={{
							position: 'absolute',
							width: '100%',
							height: '100%',
							border: '4px solid rgba(255, 255, 255, 0.1)',
							borderRadius: '30%',
							transform: `rotate(${frame * 0.5}deg)`,
						}}
					/>
					
					{/* Inner Gradient Shape */}
					<div
						style={{
							width: '60%',
							height: '60%',
							background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
							borderRadius: '20%',
							boxShadow: '0 0 40px rgba(168, 85, 247, 0.4)',
							transform: `rotate(${-frame * 1}deg)`,
						}}
					/>

					{/* Center Core */}
					<div
						style={{
							position: 'absolute',
							width: '20%',
							height: '20%',
							backgroundColor: 'white',
							borderRadius: '50%',
							boxShadow: '0 0 20px white',
						}}
					/>
				</div>

				{/* Logo Text */}
				<div
					style={{
						color: 'white',
						fontSize: '32px',
						fontWeight: 800,
						letterSpacing: '4px',
						textShadow: '0 10px 20px rgba(0,0,0,0.5)',
					}}
				>
					VOICE<span style={{ color: '#A855F7' }}>OS</span>
				</div>
				
				{/* Subtle Reflection Underneath */}
				<div
					style={{
						height: '2px',
						width: '60px',
						background: 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.5), transparent)',
						boxShadow: '0 0 10px rgba(168, 85, 247, 0.3)',
					}}
				/>
			</div>
		</AbsoluteFill>
	);
};
