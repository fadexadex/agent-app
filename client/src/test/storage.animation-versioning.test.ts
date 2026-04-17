import type { UIMessage } from "ai";
import { beforeEach, describe, expect, it } from "vitest";

import {
  addChatVersion,
  getAnimationChat,
  restoreChatVersion,
  saveAnimationChat,
  type StoredAnimationChat,
} from "@/lib/storage";

const createChat = (overrides: Partial<StoredAnimationChat> = {}): StoredAnimationChat => ({
  id: "chat-1",
  title: "Animation chat",
  createdAt: 1,
  updatedAt: 1,
  messages: [] as UIMessage[],
  projectId: "project-chat-1",
  latestVideoUrl: null,
  latestPreviewUrl: null,
  latestSceneId: null,
  currentVersion: 1,
  versions: [],
  ...overrides,
});

describe("animation chat version storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates version 1 from the first completed render without a placeholder entry", () => {
    saveAnimationChat(
      createChat({
        latestPreviewUrl: "http://localhost:3200/player?scene=scene-a&_t=1",
        latestSceneId: "scene-a",
      }),
    );

    const updated = addChatVersion("chat-1", {
      videoUrl: "/previews/project-chat-1/scene-a/v1.mp4",
      previewUrl: "http://localhost:3200/player?scene=scene-a&_t=1",
      sceneId: "scene-a",
      prompt: "Initial render",
    });

    expect(updated?.versions).toHaveLength(1);
    expect(updated?.versions?.[0].videoUrl).toBe("/previews/project-chat-1/scene-a/v1.mp4");
    expect(updated?.versions?.[0].sceneId).toBe("scene-a");
    expect(updated?.currentVersion).toBe(1);
    expect(updated?.latestVideoUrl).toBe("/previews/project-chat-1/scene-a/v1.mp4");
  });

  it("appends later renders on the same scene as distinct versions", () => {
    saveAnimationChat(createChat());

    addChatVersion("chat-1", {
      videoUrl: "/previews/project-chat-1/scene-a/v1.mp4",
      previewUrl: "http://localhost:3200/player?scene=scene-a&_t=1",
      sceneId: "scene-a",
      prompt: "Version one",
    });

    const updated = addChatVersion("chat-1", {
      videoUrl: "/previews/project-chat-1/scene-a/v2.mp4",
      previewUrl: "http://localhost:3200/player?scene=scene-a&_t=2",
      sceneId: "scene-a",
      prompt: "Version two",
    });

    expect(updated?.versions).toHaveLength(2);
    expect(updated?.versions?.map((version) => version.videoUrl)).toEqual([
      "/previews/project-chat-1/scene-a/v1.mp4",
      "/previews/project-chat-1/scene-a/v2.mp4",
    ]);
    expect(updated?.currentVersion).toBe(2);
    expect(updated?.latestVideoUrl).toBe("/previews/project-chat-1/scene-a/v2.mp4");
  });

  it("restores an older version and preserves scene metadata for subsequent renders", () => {
    saveAnimationChat(createChat());

    addChatVersion("chat-1", {
      videoUrl: "/previews/project-chat-1/scene-a/v1.mp4",
      previewUrl: "http://localhost:3200/player?scene=scene-a&_t=1",
      sceneId: "scene-a",
      prompt: "Version one",
    });

    addChatVersion("chat-1", {
      videoUrl: "/previews/project-chat-1/scene-a/v2.mp4",
      previewUrl: "http://localhost:3200/player?scene=scene-a&_t=2",
      sceneId: "scene-a",
      prompt: "Version two",
    });

    const restored = restoreChatVersion("chat-1", 0);

    expect(restored?.currentVersion).toBe(1);
    expect(restored?.latestVideoUrl).toBe("/previews/project-chat-1/scene-a/v1.mp4");
    expect(restored?.latestPreviewUrl).toBe("http://localhost:3200/player?scene=scene-a&_t=1");
    expect(restored?.latestSceneId).toBe("scene-a");

    const next = addChatVersion("chat-1", {
      videoUrl: "/previews/project-chat-1/scene-a/v3.mp4",
      previewUrl: "http://localhost:3200/player?scene=scene-a&_t=3",
      sceneId: "scene-a",
      prompt: "Version three after restore",
    });

    expect(next?.versions).toHaveLength(3);
    expect(next?.currentVersion).toBe(3);
    expect(getAnimationChat("chat-1")?.latestVideoUrl).toBe("/previews/project-chat-1/scene-a/v3.mp4");
  });

  it("deduplicates stored versions with the same video url on reload", () => {
    saveAnimationChat(
      createChat({
        latestVideoUrl: "/previews/project-chat-1/scene-a/v2.mp4",
        latestPreviewUrl: "http://localhost:3200/player?scene=scene-a&_t=2",
        latestSceneId: "scene-a",
        currentVersion: 3,
        versions: [
          {
            id: "v1",
            videoUrl: "/previews/project-chat-1/scene-a/v1.mp4",
            previewUrl: "http://localhost:3200/player?scene=scene-a&_t=1",
            sceneId: "scene-a",
            createdAt: 1,
            prompt: "First",
          },
          {
            id: "v2",
            videoUrl: "/previews/project-chat-1/scene-a/v2.mp4",
            previewUrl: "http://localhost:3200/player?scene=scene-a&_t=2",
            sceneId: "scene-a",
            createdAt: 2,
            prompt: "Second",
          },
          {
            id: "v2-dup",
            videoUrl: "/previews/project-chat-1/scene-a/v2.mp4",
            previewUrl: "http://localhost:3200/player?scene=scene-a&_t=2",
            sceneId: "scene-a",
            createdAt: 3,
            prompt: "Duplicate second",
          },
        ],
      }),
    );

    const chat = getAnimationChat("chat-1");

    expect(chat?.versions).toHaveLength(2);
    expect(chat?.currentVersion).toBe(2);
    expect(chat?.latestVideoUrl).toBe("/previews/project-chat-1/scene-a/v2.mp4");
  });
});
