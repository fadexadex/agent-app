import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { Background } from "@/components/Global";
import { MockupFrame } from "@/components/MockupFrame";
import { AnimatedText } from "@/components/AnimatedText";
import { MotionContainer } from "@/components/Layout";
import { CameraRig } from "@/components/Camera";

interface FeatureAIPrioritizationProps {}

export const FeatureAIPrioritization: React.FC<FeatureAIPrioritizationProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig(); // fps is used implicitly by spring in MotionContainer

  // CameraRig zoom for scene transition: zoom in at start, zoom out at end
  const currentZoom = interpolate(frame, [0, 15, 135 - 15, 135], [1.1, 1, 1, 1.1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Custom pill component styles (for AI Analyzing and Feature Pill)
  const pillStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 9999, // fully rounded
    padding: '10px 25px',
  };

  // AI Analyzing pill animation for dots
  const dot1Opacity = interpolate(frame, [30, 40, 50], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const dot2Opacity = interpolate(frame, [35, 45, 55], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const dot3Opacity = interpolate(frame, [40, 50, 60], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#FFFFFF' }}>
      <Background layers={[{ type: 'solid', color: '#FFFFFF' }]} />

      <CameraRig zoom={currentZoom}> {/* Apply overall scene zoom */}
        {/* Unsorted Tasks */}
        <MotionContainer
          initial="offscreen-left"
          delay={0}
          duration={30}
          exit="slide-left"
          exitStartFrame={60}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <MockupFrame type="card" width={500} height={300} theme="light">
            <div style={{ padding: 30, display: 'flex', flexDirection: 'column', gap: 15, fontSize: 24, color: '#333' }}>
              <div style={{ fontWeight: 600 }}>Unsorted Tasks:</div>
              <div>- Design UI <span style={{ fontSize: 18, opacity: 0.6 }}>[Medium]</span></div>
              <div>- Write Copy <span style={{ fontSize: 18, opacity: 0.6 }}>[Medium]</span></div>
              <div>- Develop Backend <span style={{ fontSize: 18, opacity: 0.6 }}>[Medium]</span></div>
              <div>- Marketing Campaign <span style={{ fontSize: 18, opacity: 0.6 }}>[Medium]</span></div>
            </div>
          </MockupFrame>
        </MotionContainer>

        {/* AI Analyzing Pill */}
        <MotionContainer
          initial="scale-zero"
          delay={30}
          duration={20}
          exit="scale-down"
          exitStartFrame={75}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, calc(-50% - 150px))', // Y offset
            width: 250,
            height: 50,
            zIndex: 10,
          }}
        >
          <div style={{ ...pillStyle, backgroundColor: '#333', color: 'white', width: '100%', height: '100%' }}>
            <AnimatedText text="AI Analyzing" fontSize={24} fontWeight={600} color="white" animationUnit="full" stagger={0} startFrame={0} />
            <div style={{ marginLeft: 8, display: 'flex', gap: 5 }}>
              <div style={{ opacity: dot1Opacity, width: 6, height: 6, borderRadius: '50%', backgroundColor: 'white' }} />
              <div style={{ opacity: dot2Opacity, width: 6, height: 6, borderRadius: '50%', backgroundColor: 'white' }} />
              <div style={{ opacity: dot3Opacity, width: 6, height: 6, borderRadius: '50%', backgroundColor: 'white' }} />
            </div>
          </div>
        </MotionContainer>

        {/* Sorted Tasks */}
        <MotionContainer
          initial="offscreen-right"
          delay={70}
          duration={30}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <MockupFrame type="card" width={500} height={300} theme="light">
            <div style={{ padding: 30, display: 'flex', flexDirection: 'column', gap: 15, fontSize: 24, color: '#333' }}>
              <div style={{ fontWeight: 600 }}>Sorted by AI Priority:</div>
              <div>- Develop Backend <span style={{ color: '#E53935', fontSize: 18, fontWeight: 600 }}>[High]</span></div>
              <div>- Design UI <span style={{ color: '#FFB300', fontSize: 18, fontWeight: 600 }}>[Medium]</span></div>
              <div>- Marketing Campaign <span style={{ color: '#4CAF50', fontSize: 18, fontWeight: 600 }}>[Medium]</span></div>
              <div>- Write Copy <span style={{ color: '#2196F3', fontSize: 18, fontWeight: 600 }}>[Low]</span></div>
            </div>
          </MockupFrame>
        </MotionContainer>

        {/* Feature Label Pill */}
        <MotionContainer
          initial="offscreen-bottom"
          delay={80}
          duration={25}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, calc(-50% + 180px))', // Y offset
            width: 300,
            height: 55,
            zIndex: 10,
          }}
        >
          <div style={{ ...pillStyle, backgroundColor: '#1E88E5', color: 'white', width: '100%', height: '100%' }}>
            <AnimatedText text="Smart Task Prioritization" fontSize={26} fontWeight={700} color="white" animationUnit="full" stagger={0} startFrame={0} />
          </div>
        </MotionContainer>
      </CameraRig>
    </AbsoluteFill>
  );
};