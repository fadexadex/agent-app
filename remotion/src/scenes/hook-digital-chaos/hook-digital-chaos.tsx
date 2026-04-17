import React from 'react';
import {
	AbsoluteFill,
	useCurrentFrame,
	useVideoConfig,
	interpolate,
	spring,
	Sequence,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Montserrat';

const { fontFamily } = loadFont();

// --- Components ---

const ChaosSphere: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const icons = [
		'M20 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H20c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm16 4-8 5-8-5v10h16V8z', // Email
		'M21 15h11l5 5V5H16v10l5 5z', // Chat
		'M19 3h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2zm-4-8h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2zm-4-8h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2z', // Calendar/Grid
		'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z', // Doc
	];

	const entrance = spring({
		frame,
		fps,
		config: { damping: 20 },
	});

	return (
		<div
			style={{
				position: 'absolute',
				width: 400,
				height: 400,
				left: '50%',
				top: '55%',
				transform: `translate(-50%, -50%) scale(${entrance})`,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			{[...Array(12)].map((_, i) => {
				const angle = (frame / 60) * Math.PI * 2 + (i * Math.PI) / 6;
				const radius = 120 + Math.sin(frame * 0.05 + i) * 20;
				const x = Math.cos(angle) * radius;
				const y = Math.sin(angle) * radius;
				const iconScale = interpolate(Math.sin(frame * 0.1 + i), [-1, 1], [0.8, 1.2]);
				const opacity = interpolate(Math.sin(frame * 0.08 + i), [-1, 1], [0.3, 0.7]);
				const glitchX = Math.random() > 0.95 ? (Math.random() - 0.5) * 10 : 0;

				return (
					<svg
						key={i}
						viewBox="0 0 40 40"
						style={{
							position: 'absolute',
							width: 40,
							height: 40,
							transform: `translate(${x + glitchX}px, ${y}px) scale(${iconScale})`,
							opacity,
							fill: i % 2 === 0 ? '#666' : '#888',
							filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.1))',
						}}
					>
						<path d={icons[i % icons.length]} />
					</svg>
				);
			})}
			<div
				style={{
					width: 150,
					height: 150,
					borderRadius: '50%',
					background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
					filter: 'blur(20px)',
				}}
			/>
		</div>
	);
};

const GlitchOverlay: React.FC = () => {
	const frame = useCurrentFrame();
	const opacity = interpolate(
		Math.sin(frame * 0.2),
		[0.8, 1],
		[0, 0.05],
		{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
	);

	if (Math.random() < 0.98) return null;

	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
				opacity: 0.1,
				mixBlendMode: 'overlay',
			}}
		/>
	);
};

const HookQuestion: React.FC<{ text: string }> = ({ text }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const words = text.split(' ');
	
	return (
		<div
			style={{
				fontFamily,
				fontSize: 70,
				fontWeight: 800,
				color: 'white',
				textAlign: 'center',
				width: '100%',
				letterSpacing: '-2px',
				textTransform: 'uppercase',
			}}
		>
			{words.map((word, i) => {
				const wordStart = 10 + i * 5;
				const wordSpring = spring({
					frame: frame - wordStart,
					fps,
					config: { damping: 12 },
				});

				const opacity = interpolate(wordSpring, [0, 1], [0, 1]);
				const translateY = interpolate(wordSpring, [0, 1], [20, 0]);
				const blur = interpolate(wordSpring, [0, 1], [10, 0]);

				// Glitch logic
				const isGlitching = Math.random() > 0.97;
				const glitchOffset = isGlitching ? (Math.random() - 0.5) * 5 : 0;

				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							marginRight: '15px',
							opacity,
							transform: `translateY(${translateY}px) translateX(${glitchOffset}px)`,
							filter: `blur(${blur}px)`,
							position: 'relative',
						}}
					>
						{word}
						{isGlitching && (
							<span
								style={{
									position: 'absolute',
									left: 2,
									top: 0,
									color: '#ff00ff',
									opacity: 0.5,
									mixBlendMode: 'screen',
								}}
							>
								{word}
							</span>
						)}
					</span>
				);
			})}
		</div>
	);
};

// --- Main Scene ---

export const HookDigitalChaos: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps, width, height, durationInFrames } = useVideoConfig();

	// Global exit animations
	const exitStart = 90;
	const getExitScale = (offset: number) =>
		interpolate(frame, [exitStart + offset, exitStart + offset + 10], [1, 0.8], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});
	const getExitOpacity = (offset: number) =>
		interpolate(frame, [exitStart + offset, exitStart + offset + 10], [1, 0], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});

	// Swipe transition at the end
	const swipeProgress = spring({
		frame: frame - (durationInFrames - 20),
		fps,
		config: { damping: 200 },
	});
	const swipeX = interpolate(swipeProgress, [0, 1], [0, -width]);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#1A1A1A',
				background: 'radial-gradient(circle, #333333 0%, #1A1A1A 100%)',
				transform: `translateX(${swipeX}px)`,
			}}
		>
			<GlitchOverlay />

			<Sequence from={0} durationInFrames={durationInFrames}>
				<div
					style={{
						position: 'absolute',
						width: '100%',
						top: '50%',
						transform: `translateY(-240px) scale(${getExitScale(0)})`,
						opacity: getExitOpacity(0),
					}}
				>
					<HookQuestion text="Tired of the Digital Chaos?" />
				</div>
			</Sequence>

			<Sequence from={5} durationInFrames={durationInFrames}>
				<div
					style={{
						transform: `scale(${getExitScale(3)})`,
						opacity: getExitOpacity(3),
					}}
				>
					<ChaosSphere />
				</div>
			</Sequence>

			{/* Swipe Overlay */}
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: width,
					width: width,
					height: height,
					backgroundColor: '#FFFFFF',
				}}
			/>
		</AbsoluteFill>
	);
};
