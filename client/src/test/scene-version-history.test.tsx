import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import SceneVersionHistory from "@/components/editor/SceneVersionHistory";
import type { SceneVersion } from "@/lib/storage";

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
  DropdownMenuSeparator: () => <div />,
}));

const versions: SceneVersion[] = [
  {
    id: "v1",
    videoUrl: "/previews/project/scene/v1.mp4",
    previewUrl: "http://localhost:3200/player?scene=scene-a&_t=1",
    sceneId: "scene-a",
    createdAt: Date.now() - 10_000,
    prompt: "Original generation",
  },
  {
    id: "v2",
    videoUrl: "/previews/project/scene/v2.mp4",
    previewUrl: "http://localhost:3200/player?scene=scene-a&_t=2",
    sceneId: "scene-a",
    createdAt: Date.now(),
    prompt: "Refined lighting",
  },
];

describe("SceneVersionHistory", () => {
  it("renders the current version and restores a selected older version", async () => {
    const onRestore = vi.fn();

    render(
      <SceneVersionHistory
        versions={versions}
        currentVersion={2}
        onRestore={onRestore}
      />,
    );

    expect(screen.getByRole("button", { name: /v2/i })).toBeInTheDocument();
    fireEvent.click(screen.getByText("Original generation"));

    expect(onRestore).toHaveBeenCalledWith(0);
  });
});
