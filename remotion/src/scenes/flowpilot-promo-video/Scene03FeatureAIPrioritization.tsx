import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from 'remotion';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';
import React from 'react';

// Constants for timing
const FPS = 30;
const DURATION_FRAMES = 150; // 5 seconds

// Entrance timings
const AI_INDICATOR_ENTRY_START = 0;
const BROWSER_MOCKUP_ENTRY_START = 10;
const FEATURE_PILL_ENTRY_START = 60;

const ENTRY_DURATION = 30; // General entry duration

// Task reordering timing
const TASK_REORDER_START = 40;
const TASK_REORDER_DURATION = 30; // 1 second for tasks to reorder

// Exit timings (staggered blur-out)
const MOCKUP_EXIT_START = 120;
const FEATURE_PILL_EXIT_START = 125;
const AI_INDICATOR_EXIT_START = 130;
const EXIT_DURATION = 20;

interface Scene03FeatureAIPrioritizationProps {}

export const Scene03FeatureAIPrioritization: React.FC<Scene03FeatureAIPrioritizationProps> = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // AI Indicator Animations
  const aiIndicatorCombinedScale = interpolate(frame,
    [AI_INDICATOR_ENTRY_START, AI_INDICATOR_ENTRY_START + ENTRY_DURATION, AI_INDICATOR_EXIT_START, AI_INDICATOR_EXIT_START + EXIT_DURATION],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const aiIndicatorOpacity = interpolate(frame,
    [AI_INDICATOR_ENTRY_START, AI_INDICATOR_ENTRY_START + ENTRY_DURATION, AI_INDICATOR_EXIT_START, AI_INDICATOR_EXIT_START + EXIT_DURATION],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const aiIndicatorBlur = interpolate(frame,
    [AI_INDICATOR_EXIT_START, AI_INDICATOR_EXIT_START + EXIT_DURATION],
    [0, 10],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Browser Mockup Animations
  const mockupCombinedTranslateY = interpolate(frame,
    [BROWSER_MOCKUP_ENTRY_START, BROWSER_MOCKUP_ENTRY_START + ENTRY_DURATION, MOCKUP_EXIT_START, MOCKUP_EXIT_START + EXIT_DURATION],
    [height / 2, 0, 0, height / 2], // Start off-bottom, to 0 offset, stay, then go off-bottom again
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const mockupOpacity = interpolate(frame,
    [BROWSER_MOCKUP_ENTRY_START, BROWSER_MOCKUP_ENTRY_START + ENTRY_DURATION, MOCKUP_EXIT_START, MOCKUP_EXIT_START + EXIT_DURATION],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const mockupBlur = interpolate(frame,
    [MOCKUP_EXIT_START, MOCKUP_EXIT_START + EXIT_DURATION],
    [0, 10],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Feature Pill Animations
  const featurePillCombinedTranslateY = interpolate(frame,
    [FEATURE_PILL_ENTRY_START, FEATURE_PILL_ENTRY_START + ENTRY_DURATION, FEATURE_PILL_EXIT_START, FEATURE_PILL_EXIT_START + EXIT_DURATION],
    [50, 0, 0, 50], // Start 50px below, to 0 offset, stay, then go 50px below again
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const featurePillOpacity = interpolate(frame,
    [FEATURE_PILL_ENTRY_START, FEATURE_PILL_ENTRY_START + ENTRY_DURATION, FEATURE_PILL_EXIT_START, FEATURE_PILL_EXIT_START + EXIT_DURATION],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const featurePillBlur = interpolate(frame,
    [FEATURE_PILL_EXIT_START, FEATURE_PILL_EXIT_START + EXIT_DURATION],
    [0, 10],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Task Data & Initial/Final Positions
  const taskHeight = 40;
  const taskGap = 10;
  const listOffsetTop = 100; // Offset from the top of the mockup content area

  const allTasks = [
    { id: 't1', text: 'Review Q3 Report', isPrioritized: true },
    { id: 't2', text: 'Schedule Client Demo', isPrioritized: true },
    { id: 't3', text: 'Update Project Plan', isPrioritized: true },
    { id: 't4', text: 'Draft marketing copy', isPrioritized: false },
    { id: 't5', text: 'Follow up with leads', isPrioritized: false },
    { id: 't6', text: 'Prep for weekly sync', isPrioritized: false },
    { id: 't7', text: 'Organize team offsite', isPrioritized: false },
    { id: 't8', text: 'Approve design mockups', isPrioritized: false },
    { id: 't9', text: 'Research competitor features', isPrioritized: false },
    { id: 't10', text: 'Process expense reports', isPrioritized: false },
  ];

  const prioritizedTasks = allTasks.filter(t => t.isPrioritized);
  const otherTasks = allTasks.filter(t => !t.isPrioritized);

  // Map tasks to initial and final positions
  const tasksWithPositions = allTasks.map((task, index) => {
    let initialY = index * (taskHeight + taskGap); // Relative to listOffsetTop
    let finalY;

    if (task.isPrioritized) {
      const pIndex = prioritizedTasks.findIndex(t => t.id === task.id);
      finalY = pIndex * (taskHeight + taskGap);
    } else {
      const oIndex = otherTasks.findIndex(t => t.id === task.id);
      finalY = prioritizedTasks.length * (taskHeight + taskGap) + oIndex * (taskHeight + taskGap);
    }

    return { ...task, initialY, finalY };
  });

  // Task reordering animation (only spring needed for progress)
  const reorderProgress = spring({
    frame: frame - TASK_REORDER_START,
    fps,
    config: { damping: 200 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#F0F8FF' }}>
      <Background preset="skyLight" />

      {/* AI Indicator Pill */}
      <div
        style={{
          position: 'absolute',
          top: 50,
          left: 50,
          backgroundColor: 'black',
          color: 'white',
          borderRadius: 9999,
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 20,
          fontWeight: 600,
          opacity: aiIndicatorOpacity,
          filter: `blur(${aiIndicatorBlur}px)`,
          transform: `scale(${aiIndicatorCombinedScale})`,
          transformOrigin: 'top left',
          zIndex: 10,
        }}
      >
        <span role="img" aria-label="brain icon">🧠</span>
        AI Prioritization
      </div>

      {/* Mockup Frame Container */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(${width * -0.5}px, ${height * -0.5 + 20 + mockupCombinedTranslateY}px)`,
          opacity: mockupOpacity,
          filter: `blur(${mockupBlur}px)`,
          zIndex: 5,
        }}
      >
        <MockupFrame
          type="browser"
          width={800}
          height={500}
          theme="light"
          browserConfig={{ url: "flowpilot.com/tasks" }}
        >
          {/* Browser Content */}
          <div style={{ display: 'flex', height: '100%', backgroundColor: 'white' }}>
            {/* Sidebar */}
            <div style={{ width: '200px', backgroundColor: '#f0f2f5', padding: '20px', borderRight: '1px solid #e0e0e0', color: '#333' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '1.2em' }}>FlowPilot</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '10px' }}>Dashboard</li>
                <li style={{ marginBottom: '10px', fontWeight: 'bold' }}>My Tasks</li>
                <li style={{ marginBottom: '10px' }}>Projects</li>
                <li style={{ marginBottom: '10px' }}>Settings</li>
              </ul>
            </div>

            {/* Main Content Area */}
            <div style={{ flexGrow: 1, padding: '30px', position: 'relative', overflow: 'hidden' }}>
              <h2 style={{ marginBottom: '20px', fontSize: '1.8em', color: '#222' }}>My Tasks</h2>
              <div style={{ position: 'relative', top: listOffsetTop, left: 0, width: '100%', height: 'calc(100% - 100px)' }}> {/* Position list container */}
                {tasksWithPositions.map((task) => {
                  const currentY = interpolate(reorderProgress, [0, 1], [task.initialY, task.finalY], { extrapolateRight: 'clamp' });

                  const isDuringReorderPhase = frame >= TASK_REORDER_START && frame < TASK_REORDER_START + TASK_REORDER_DURATION;
                  const popScale = task.isPrioritized && isDuringReorderPhase
                    ? interpolate(reorderProgress, [0, 0.5, 1], [1, 1.05, 1], { extrapolateRight: 'clamp' })
                    : 1;
                  const glowIntensity = task.isPrioritized && isDuringReorderPhase
                    ? interpolate(reorderProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0], { extrapolateRight: 'clamp' })
                    : 0;

                  return (
                    <div
                      key={task.id}
                      style={{
                        position: 'absolute',
                        top: 0, // Now relative to the new list container's top: listOffsetTop
                        left: 0,
                        width: 'calc(100% - 40px)', // account for padding
                        backgroundColor: task.isPrioritized ? '#e6f7ff' : '#f9f9f9',
                        border: task.isPrioritized ? '1px solid #91d5ff' : '1px solid #eee',
                        borderRadius: '8px',
                        padding: '12px 15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: task.isPrioritized ? `0 0 10px rgba(66, 153, 225, ${glowIntensity})` : 'none',
                        transform: `translateY(${currentY}px) scale(${popScale})`,
                        color: '#333',
                      }}
                    >
                      <span>{task.text}</span>
                      {task.isPrioritized && (
                        <span style={{
                          backgroundColor: '#4299e1',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '0.8em',
                          fontWeight: 'bold',
                        }}>
                          AI Priority
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </MockupFrame>
      </div>

      {/* Feature Pill */}
      <div
        style={{
          position: 'absolute',
          bottom: 50,
          left: '50%',
          transform: `translateX(-50%) translateY(${featurePillCombinedTranslateY}px)`,
          backgroundColor: 'black',
          color: 'white',
          borderRadius: 9999,
          padding: '12px 30px',
          fontSize: 24,
          fontWeight: 700,
          opacity: featurePillOpacity,
          filter: `blur(${featurePillBlur}px)`,
          zIndex: 10,
          whiteSpace: 'nowrap',
          width: '320px',
          height: '48px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        Effortless Smart Prioritization
      </div>
    </AbsoluteFill>
  );
};
