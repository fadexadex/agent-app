import { describe, expect, it } from "vitest";

import { getProjectVideoUrl } from "@/lib/export-video-url";
import type { Scene } from "@/lib/mockData";

const scenes: Scene[] = [
  {
    id: "the-hook",
    name: "Hook",
    category: "hook",
    duration: 90,
    background: { type: "solid", color: "#000" },
    elements: [],
  },
];

describe("getProjectVideoUrl", () => {
  it("returns the current versioned url when available", () => {
    expect(
      getProjectVideoUrl(
        0,
        scenes,
        [{ previewSceneId: "the-hook", videoUrl: "/previews/project-1/the-hook/v2.mp4" }],
        true,
      ),
    ).toBe("/previews/project-1/the-hook/v2.mp4");
  });

  it("does not fall back to legacy flat preview urls for project-backed exports", () => {
    expect(
      getProjectVideoUrl(0, scenes, [{ previewSceneId: "the-hook" }], true),
    ).toBe("");
  });

  it("still supports the legacy flat fallback when there is no project context", () => {
    expect(
      getProjectVideoUrl(0, scenes, [{ previewSceneId: "the-hook" }], false),
    ).toBe("/previews/the-hook.mp4");
  });
});
