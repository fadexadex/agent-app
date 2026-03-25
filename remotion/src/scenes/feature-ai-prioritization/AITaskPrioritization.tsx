import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';

const tasksList = [
  "Update server configurations",
  "Review Q3 Report",
  "Fix navigation bug on mobile",
  "Draft newsletter for Friday",
  "Schedule Client Demo",
  "Update design system components",
  "Reply to pending support tickets",
  "Update Project Plan",
  "Refactor authentication module",
  "Prepare slides for weekly sync"
];

const targetIndices = [3, 0, 4, 5, 1, 6, 7, 2, 8, 9];

const VoiceIndicator: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{
      backgroundColor: '#000', borderRadius: 999, padding: '12px 24px',
      display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
        <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
        <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
        <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
      </svg>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 24 }}>
        {[...Array(5)].map((_, i) => {
          const h = interpolate(Math.sin((frame + i * 5) * 0.15), [-1, 1], [6, 20]);
          return <div key={i} style={{ width: 4, height: h, backgroundColor: 'white', borderRadius: 2 }} />;
        })}
      </div>
    </div>
  );
};

const FeaturePill: React.FC = () => (
  <div style={{
    backgroundColor: '#000', color: '#fff', borderRadius: 999,
    padding: '16px 32px', fontSize: 20, fontWeight: 500,
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
  }}>
    Effortless Smart Prioritization
  </div>
);

export const AITaskPrioritization: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance springs
  const aiIndScale = spring({ frame, fps, config: { damping: 14 } });
  
  const mockupSlide = spring({ frame: frame - 10, fps, config: { damping: 14 } });
  const mockupY = interpolate(mockupSlide, [0, 1], [80, 0]);
  const mockupOpacity = interpolate(mockupSlide, [0, 1], [0, 1]);

  const pillSlide = spring({ frame: frame - 20, fps, config: { damping: 14 } });
  const pillY = interpolate(pillSlide, [0, 1], [50, 0]);
  const pillOpacity = interpolate(pillSlide, [0, 1], [0, 1]);

  // Task reorder animations
  const reorderSpring = spring({ frame: frame - 40, fps, config: { damping: 16 } });
  const popSpring = spring({ frame: frame - 35, fps, config: { damping: 12 } });

  // Exit animations (staggered)
  // mockup exits at 125, pill at 130, indicator at 135
  const mockupExitOp = interpolate(frame, [125, 135], [1, 0], { extrapolateRight: 'clamp' });
  const mockupExitBlur = interpolate(frame, [125, 135], [0, 20], { extrapolateRight: 'clamp' });

  const pillExitOp = interpolate(frame, [130, 140], [1, 0], { extrapolateRight: 'clamp' });
  const pillExitBlur = interpolate(frame, [130, 140], [0, 20], { extrapolateRight: 'clamp' });

  const indExitOp = interpolate(frame, [135, 145], [1, 0], { extrapolateRight: 'clamp' });
  const indExitBlur = interpolate(frame, [135, 145], [0, 20], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <Background layers={[
        { type: 'solid', color: '#F0F8FF' },
        { type: 'linear', colors: ['#F0F8FF', '#ADD8E6'] }
      ]} />
      
      {/* Voice Indicator */}
      <div style={{
        position: 'absolute', top: 120, width: '100%', display: 'flex', justifyContent: 'center',
        transform: `scale(${aiIndScale})`, opacity: indExitOp, filter: `blur(${indExitBlur}px)`,
        zIndex: 20
      }}>
        <VoiceIndicator />
      </div>

      {/* Browser Mockup */}
      <div style={{
        position: 'absolute', top: 240, width: '100%', display: 'flex', justifyContent: 'center',
        transform: `translateY(${mockupY}px)`, opacity: mockupOpacity * mockupExitOp, filter: `blur(${mockupExitBlur}px)`,
        zIndex: 10
      }}>
        <div style={{ width: 900, height: 620, margin: '0 auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
          <MockupFrame type="browser">
            <div style={{ display: 'flex', height: '100%', backgroundColor: '#f9fafb', fontFamily: 'system-ui, sans-serif' }}>
              {/* Sidebar */}
              <div style={{ width: 220, borderRight: '1px solid #e5e7eb', padding: '24px 16px', backgroundColor: '#ffffff' }}>
                <div style={{ width: '70%', height: 20, backgroundColor: '#e5e7eb', borderRadius: 4, marginBottom: 32 }} />
                <div style={{ width: '100%', height: 16, backgroundColor: '#f3f4f6', borderRadius: 4, marginBottom: 16 }} />
                <div style={{ width: '85%', height: 16, backgroundColor: '#f3f4f6', borderRadius: 4, marginBottom: 16 }} />
                <div style={{ width: '90%', height: 16, backgroundColor: '#f3f4f6', borderRadius: 4, marginBottom: 16 }} />
              </div>
              
              {/* Main Content */}
              <div style={{ flex: 1, padding: '32px 40px', position: 'relative' }}>
                <h2 style={{ margin: '0 0 24px 0', fontSize: 28, fontWeight: 700, color: '#111827' }}>My Tasks</h2>
                <div style={{ position: 'relative', height: 480 }}>
                  {tasksList.map((task, i) => {
                    const isKey = i === 1 || i === 4 || i === 7;
                    const targetIndex = targetIndices[i];
                    
                    const y = interpolate(reorderSpring, [0, 1], [i * 48, targetIndex * 48]);
                    
                    const popScale = interpolate(popSpring, [0, 0.5, 1], [1, 1.05, 1]);
                    const pop = isKey ? popScale : 1;
                    const glowOpacity = isKey ? interpolate(popSpring, [0, 1], [0, 0.5]) : 0;
                    const tagOpacity = isKey ? interpolate(reorderSpring, [0, 1], [0, 1]) : 0;
                    
                    return (
                      <div key={i} style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0,
                        height: 40,
                        transform: `translateY(${y}px) scale(${pop})`,
                        zIndex: isKey ? 10 : 1,
                        backgroundColor: 'white',
                        borderRadius: 8,
                        border: isKey ? `1px solid rgba(59, 130, 246, ${glowOpacity * 2})` : '1px solid #e5e7eb',
                        boxShadow: isKey ? `0 4px 12px rgba(59, 130, 246, ${glowOpacity})` : '0 1px 2px rgba(0,0,0,0.05)',
                        display: 'flex', alignItems: 'center', padding: '0 16px',
                        transition: 'box-shadow 0.2s'
                      }}>
                        <div style={{ 
                          width: 16, height: 16, borderRadius: 4, border: '1px solid #d1d5db', marginRight: 16, 
                          backgroundColor: isKey ? '#ebf5ff' : 'transparent',
                          borderColor: isKey ? '#3b82f6' : '#d1d5db'
                        }} />
                        <span style={{ fontSize: 15, color: '#374151', fontWeight: isKey ? 600 : 400 }}>{task}</span>
                        {isKey && (
                          <div style={{
                            marginLeft: 'auto',
                            backgroundColor: '#dbeafe', color: '#2563eb',
                            fontSize: 11, fontWeight: 600,
                            padding: '4px 10px', borderRadius: 999,
                            opacity: tagOpacity
                          }}>
                            AI Priority
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </MockupFrame>
        </div>
      </div>

      {/* Feature Pill */}
      <div style={{
        position: 'absolute', bottom: 120, width: '100%', display: 'flex', justifyContent: 'center',
        transform: `translateY(${pillY}px)`, opacity: pillOpacity * pillExitOp, filter: `blur(${pillExitBlur}px)`,
        zIndex: 30
      }}>
        <FeaturePill />
      </div>
    </AbsoluteFill>
  );
};
