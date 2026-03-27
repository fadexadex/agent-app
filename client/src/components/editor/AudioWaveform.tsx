import { useEffect, useState, useRef, useMemo } from "react";

interface AudioWaveformProps {
  audioUrl: string;
  width: number;
  height: number;
  currentTime: number;
  duration: number;
  color?: string;
  backgroundColor?: string;
  /** Unique id for the SVG clipPath element — prevents duplicate-id issues */
  clipPathId?: string;
}

const AudioWaveform = ({
  audioUrl,
  width,
  height,
  currentTime,
  duration,
  color = "#10B981",
  backgroundColor = "rgba(16, 185, 129, 0.2)",
  clipPathId = "progress-clip",
}: AudioWaveformProps) => {
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Generate waveform data from audio file
  useEffect(() => {
    const loadAudio = async () => {
      setIsLoading(true);
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }

        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

        // Get audio data from first channel
        const channelData = audioBuffer.getChannelData(0);
        const samples = 200; // Number of bars to display
        const blockSize = Math.floor(channelData.length / samples);
        const waveform: number[] = [];

        for (let i = 0; i < samples; i++) {
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(channelData[i * blockSize + j]);
          }
          // Normalize to 0-1 range with some amplification
          waveform.push(Math.min(1, (sum / blockSize) * 3));
        }

        setWaveformData(waveform);
      } catch (error) {
        console.error("Failed to load audio for waveform:", error);
        // Generate placeholder waveform on error
        setWaveformData(Array(200).fill(0).map(() => Math.random() * 0.5 + 0.1));
      } finally {
        setIsLoading(false);
      }
    };

    if (audioUrl) {
      loadAudio();
    }

    return () => {
      if (audioContextRef.current?.state === "running") {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [audioUrl]);

  // Calculate progress position
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Generate SVG path for waveform
  const waveformPath = useMemo(() => {
    if (waveformData.length === 0) return "";

    const barWidth = width / waveformData.length;
    const centerY = height / 2;

    let path = "";
    waveformData.forEach((amplitude, i) => {
      const x = i * barWidth;
      const barHeight = amplitude * (height * 0.8);
      const y1 = centerY - barHeight / 2;
      const y2 = centerY + barHeight / 2;

      // Draw vertical bars
      path += `M${x + barWidth * 0.2},${y1} L${x + barWidth * 0.2},${y2} `;
    });

    return path;
  }, [waveformData, width, height]);

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ width, height, backgroundColor: "rgba(255,255,255,0.02)" }}
      >
        <span className="text-[9px] text-white/30">Loading waveform...</span>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width, height }}>
      {/* Background waveform */}
      <svg
        width={width}
        height={height}
        className="absolute inset-0"
        style={{ overflow: "visible" }}
      >
        <path
          d={waveformPath}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>

      {/* Progress waveform (clipped to current time) */}
      <svg
        width={width}
        height={height}
        className="absolute inset-0"
        style={{ overflow: "visible" }}
      >
        <defs>
          <clipPath id={clipPathId}>
            <rect x={0} y={0} width={`${progressPercent}%`} height={height} />
          </clipPath>
        </defs>
        <path
          d={waveformPath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          clipPath={`url(#${clipPathId})`}
        />
      </svg>

      {/* Playhead line */}
      <div
        className="absolute top-0 bottom-0 w-px bg-red-500 pointer-events-none"
        style={{ left: `${progressPercent}%` }}
      />
    </div>
  );
};

export default AudioWaveform;
