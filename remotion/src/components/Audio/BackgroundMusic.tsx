import { Audio, staticFile } from "remotion";

interface BackgroundMusicProps {
  trackId: string;
  volume?: number;
  startFrom?: number;
  loop?: boolean;
}

/**
 * BackgroundMusic component for adding audio tracks to Remotion scenes.
 *
 * @param trackId - The ID of the track (matches filename without extension in public/audio/)
 * @param volume - Volume level from 0 to 1 (default: 0.3)
 * @param startFrom - Start playing from this many seconds into the track (default: 0)
 * @param loop - Whether to loop the audio (default: false)
 *
 * @example
 * <BackgroundMusic trackId="upbeat-corporate" volume={0.5} />
 */
export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({
  trackId,
  volume = 0.3,
  startFrom = 0,
  loop = false,
}) => {
  return (
    <Audio
      src={staticFile(`audio/${trackId}.mp3`)}
      volume={volume}
      startFrom={startFrom * 30} // Convert seconds to frames (30fps)
      loop={loop}
    />
  );
};
