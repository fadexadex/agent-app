import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';

export const FeatureTeamCollaboration: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // --- Animation Timings ---
  // Entrances
  const mockupEntrance = spring({
    frame: frame - 0,
    fps,
    config: { damping: 14 },
  });
  
  const pillEntrance = spring({
    frame: frame - 10,
    fps,
    config: { damping: 14 },
  });

  // Exits (all slide out to right, staggered by 7 frames)
  // Mockup: 120, Avatars: 127, Feature Pill: 134
  const mockupExit = spring({
    frame: frame - 120,
    fps,
    config: { damping: 14 },
  });
  
  const avatarsExit = spring({
    frame: frame - 127,
    fps,
    config: { damping: 14 },
  });
  
  const pillExit = spring({
    frame: frame - 134,
    fps,
    config: { damping: 14 },
  });

  // --- Positional Calculations ---
  // Mockup: Slides in from left (-width to 0), slides out to right (0 to width)
  const mockupX =
    interpolate(mockupEntrance, [0, 1], [-width, 0]) +
    interpolate(mockupExit, [0, 1], [0, width]);

  // Pill: Slides in from right (width to 0), slides out to right (0 to width)
  const pillX =
    interpolate(pillEntrance, [0, 1], [width, 0]) +
    interpolate(pillExit, [0, 1], [0, width]);

  // Avatars exit: (0 to width)
  const avatarsX = interpolate(avatarsExit, [0, 1], [0, width]);

  // --- Chat Bubble Animation ---
  const chatBubbleScale = spring({
    frame: frame - 40,
    fps,
    config: { damping: 12 },
  });
  const chatBubbleOpacity = interpolate(frame, [100, 110], [1, 0], {
    extrapolateRight: 'clamp',
  });

  // --- Avatar Configurations ---
  const avatars = [
    { top: 200, left: width / 2 - 550, delay: 20 },
    { top: 250, left: width / 2 + 450, delay: 25 },
    { top: 750, left: width / 2 - 500, delay: 30 },
    { top: 800, left: width / 2 + 400, delay: 35 },
  ];

  return (
    <AbsoluteFill>
      <Background layers={[{ type: 'solid', color: '#FFFFFF' }]} />

      {/* Avatars */}
      <AbsoluteFill style={{ transform: `translateX(${avatarsX}px)` }}>
        {avatars.map((avatar, i) => {
          const avatarScale = spring({
            frame: frame - avatar.delay,
            fps,
            config: { damping: 14 },
          });

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: avatar.top,
                left: avatar.left,
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: '#f3f4f6',
                border: '4px solid white',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `scale(${avatarScale})`,
                overflow: 'hidden',
              }}
            >
              {/* Generic Face Icon SVG */}
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9ca3af"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          );
        })}
      </AbsoluteFill>

      {/* Mockup Container */}
      <AbsoluteFill
        style={{
          transform: `translateX(${mockupX}px)`,
          justifyContent: 'center',
          alignItems: 'center',
          top: 20, // Center with a slight 20px offset downwards
        }}
      >
        <div style={{ width: 1000, height: 600 }}>
          <MockupFrame
            type="browser"
            theme="light"
            browserConfig={{ title: 'FlowPilot - Design System Task' }}
          >
            {/* Split layout inside Mockup */}
            <div
              style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                backgroundColor: '#ffffff',
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              {/* Left Panel: Task Details */}
              <div
                style={{
                  flex: 1,
                  padding: 40,
                  borderRight: '1px solid #e5e7eb',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#fee2e2',
                    color: '#b91c1c',
                    padding: '6px 12px',
                    borderRadius: 16,
                    fontSize: 14,
                    fontWeight: 600,
                    width: 'fit-content',
                    marginBottom: 20,
                  }}
                >
                  Due: Oct 24
                </div>
                <h1 style={{ margin: '0 0 16px 0', fontSize: 32, color: '#111827' }}>
                  Design System Overhaul
                </h1>
                <p style={{ color: '#4b5563', lineHeight: 1.6, fontSize: 16 }}>
                  Update the core component library to match the new brand
                  guidelines. Ensure all primary buttons, input fields, and
                  modals are fully accessible.
                </p>
                <div style={{ marginTop: 'auto', display: 'flex', gap: 12 }}>
                  <div
                    style={{
                      height: 12,
                      width: '80%',
                      backgroundColor: '#f3f4f6',
                      borderRadius: 6,
                    }}
                  />
                  <div
                    style={{
                      height: 12,
                      width: '60%',
                      backgroundColor: '#f3f4f6',
                      borderRadius: 6,
                      marginTop: 12,
                    }}
                  />
                </div>
              </div>

              {/* Right Panel: Collaboration */}
              <div style={{ flex: 1, padding: 40, backgroundColor: '#fafafa', position: 'relative' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#374151', fontSize: 18 }}>
                  Comments
                </h3>
                
                {/* 3 Comments */}
                {[
                  { name: 'Sarah M.', text: 'I added the new button variants.' },
                  { name: 'Alex T.', text: 'Looks great! Approved.' },
                  { name: 'David K.', text: 'Are we updating the icons too?' },
                ].map((comment, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: 12,
                      marginBottom: 16,
                      backgroundColor: '#ffffff',
                      padding: 16,
                      borderRadius: 12,
                      border: '1px solid #f3f4f6',
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 'bold',
                        color: '#6b7280',
                      }}
                    >
                      {comment.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>
                        {comment.name}
                      </div>
                      <div style={{ fontSize: 14, color: '#4b5563', marginTop: 4 }}>
                        {comment.text}
                      </div>
                    </div>
                  </div>
                ))}

                <h3 style={{ margin: '32px 0 20px 0', color: '#374151', fontSize: 18 }}>
                  Files
                </h3>
                <div style={{ display: 'flex', gap: 16 }}>
                  {[1, 2].map((file) => (
                    <div
                      key={file}
                      style={{
                        padding: 16,
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          backgroundColor: '#eff6ff',
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                          <polyline points="13 2 13 9 20 9" />
                        </svg>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>
                        Doc_v{file}.pdf
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pop-up Chat Bubble Notification */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 24,
                    right: 24,
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    padding: '12px 20px',
                    borderRadius: 24,
                    borderBottomRightRadius: 4,
                    boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
                    fontWeight: 600,
                    fontSize: 14,
                    transform: `scale(${chatBubbleScale})`,
                    opacity: chatBubbleOpacity,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transformOrigin: 'bottom right',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  New Comment
                </div>
              </div>
            </div>
          </MockupFrame>
        </div>
      </AbsoluteFill>

      {/* Feature Pill Container */}
      <AbsoluteFill
        style={{
          transform: `translateX(${pillX}px)`,
          justifyContent: 'flex-start',
          alignItems: 'center',
          top: 100, // Positioned near the top
        }}
      >
        <div
          style={{
            backgroundColor: '#000000',
            color: '#ffffff',
            width: 300,
            height: 48,
            borderRadius: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: 16,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }}
        >
          Seamless Team Collaboration
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
