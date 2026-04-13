import { useRef, useEffect } from "react";
import { Player, PlayerRef } from "@remotion/player";
import * as AllScenes from "./scenes";

// All scene components indexed by their exported name (e.g. "HookIntro")
const SceneComponents = AllScenes as Record<string, React.ComponentType<Record<string, never>>>;

/**
 * Minimal player page served at localhost:3200/player?scene=X&component=Y&duration=90&w=1920&h=1080&fps=30
 *
 * The parent window (client app) communicates via postMessage:
 *   parent → iframe: { type: 'play' | 'pause' | 'seek', frame?: number }
 *   iframe → parent: { type: 'timeupdate', frame: number } | { type: 'ended' } | { type: 'error', message: string }
 */
export const PlayerApp = () => {
  const params = new URLSearchParams(window.location.search);
  const componentName = params.get("component") || "";
  const duration = Math.max(1, Number(params.get("duration")) || 90);
  const fps = Math.max(1, Number(params.get("fps")) || 30);
  const width = Math.max(1, Number(params.get("w")) || 1920);
  const height = Math.max(1, Number(params.get("h")) || 1080);

  const playerRef = useRef<PlayerRef>(null);

  // Listen for commands from the parent window
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      const player = playerRef.current;
      if (!player) return;

      const { type, frame } = (e.data ?? {}) as { type?: string; frame?: number };
      if (type === "play") player.play();
      else if (type === "pause") player.pause();
      else if (type === "seek" && typeof frame === "number") player.seekTo(frame);
      else if (type === "getFrame") {
        window.parent.postMessage(
          { type: "frame", frame: player.getCurrentFrame() },
          "*",
        );
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Subscribe to player events and relay them to the parent
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onTimeUpdate = (e: { detail: { frame: number } }) => {
      window.parent.postMessage({ type: "timeupdate", frame: e.detail.frame }, "*");
    };

    const onEnded = () => {
      window.parent.postMessage({ type: "ended" }, "*");
    };

    player.addEventListener("timeupdate", onTimeUpdate);
    player.addEventListener("ended", onEnded);

    return () => {
      player.removeEventListener("timeupdate", onTimeUpdate);
      player.removeEventListener("ended", onEnded);
    };
  });

  const Component = SceneComponents[componentName];

  if (!Component) {
    return (
      <div
        style={{
          color: "white",
          background: "#111",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          fontFamily: "monospace",
          fontSize: 14,
        }}
      >
        Scene component not found: <strong style={{ marginLeft: 6 }}>{componentName || "(none)"}</strong>
      </div>
    );
  }

  return (
    <Player
      ref={playerRef}
      component={Component}
      durationInFrames={duration}
      fps={fps}
      compositionWidth={width}
      compositionHeight={height}
      style={{ width: "100%", height: "100%" }}
      controls={false}
      inputProps={{}}
    />
  );
};
