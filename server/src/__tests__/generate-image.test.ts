import { describe, it, expect, vi } from "vitest";
import { generateImageTool } from "../tools/generate-image.js";

const toolOpts = { toolCallId: "test", messages: [] as never[] };

describe("generateImageTool", () => {
  it("should return an error if API key is not valid or network fails", async () => {
    // Save original API key
    const originalApiKey = process.env.GOOGLE_API_KEY;
    // Set to invalid
    process.env.GOOGLE_API_KEY = "invalid_key";

    const result = (await generateImageTool.execute!(
      { prompt: "A beautiful sunset" },
      toolOpts
    )) as { success: boolean; error?: string };

    // Since the API key is invalid or network won't be available, it should fail gracefully
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();

    // Restore original
    process.env.GOOGLE_API_KEY = originalApiKey;
  });
});
