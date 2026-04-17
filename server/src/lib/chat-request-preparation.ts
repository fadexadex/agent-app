import {
  buildReferenceAssetsBlock,
  createAssetInlineBase64,
  resolveUploadedAsset,
  resolveUploadedAssets,
  type UploadedAssetDescriptor,
} from "./uploaded-assets.js";

function ensureMessageParts(message: any): any[] {
  if (Array.isArray(message.parts)) {
    return message.parts;
  }

  if (typeof message.content === "string") {
    message.parts = [{ type: "text", text: message.content }];
    return message.parts;
  }

  if (Array.isArray(message.content)) {
    message.parts = message.content
      .map((part: any) => {
        if (part?.type === "text" && typeof part.text === "string") {
          return { type: "text", text: part.text };
        }

        if (
          part?.type === "file" &&
          typeof part.url === "string" &&
          typeof part.mediaType === "string"
        ) {
          return {
            type: "file",
            url: part.url,
            mediaType: part.mediaType,
            filename: part.filename,
          };
        }

        return null;
      })
      .filter(Boolean);

    return message.parts;
  }

  message.parts = [];
  return message.parts;
}

function prependTextToMessage(message: any, text: string) {
  const parts = ensureMessageParts(message);
  const textPart = parts.find((part: any) => part.type === "text");

  if (textPart) {
    textPart.text = text + textPart.text;
    return;
  }

  parts.unshift({ type: "text", text });
}

function sanitizeAssistantMessages(messages: any[]) {
  return messages.map((message: any) => {
    if (message.role !== "assistant" || !Array.isArray(message.parts)) {
      return message;
    }

    const parts = [...message.parts];
    const toolCallIdsWithResults = new Set(
      parts
        .filter((part: any) => part.type === "tool-result")
        .map((part: any) => part.toolCallId),
    );

    message.parts = parts.filter((part: any) => {
      if (part.type === "tool-invocation" || part.type === "tool-call") {
        return toolCallIdsWithResults.has(part.toolCallId);
      }

      return true;
    });

    return message;
  });
}

function upsertLegacyAssetParts(
  message: any,
  assets: UploadedAssetDescriptor[],
  existingSourceUrls: Set<string>,
) {
  const parts = ensureMessageParts(message);

  for (const asset of assets) {
    if (existingSourceUrls.has(asset.sourceUrl)) {
      continue;
    }

    parts.push({
      type: "file",
      // Keep this as raw base64. data: URLs are routed through the AI SDK
      // downloader in this path and rejected before provider conversion.
      url: createAssetInlineBase64(asset),
      mediaType: asset.mediaType,
      filename: asset.filename,
    });
  }
}

export interface PreparedChatMessagesResult {
  messages: any[];
  referenceAssets: UploadedAssetDescriptor[];
}

export async function prepareChatMessagesForAgent(params: {
  rawMessages: any[];
  legacyAssetUrls?: string[];
  sceneContext?: Record<string, unknown>;
  projectId?: string;
}): Promise<PreparedChatMessagesResult> {
  const {
    rawMessages,
    legacyAssetUrls = [],
    sceneContext,
    projectId,
  } = params;

  const messages = sanitizeAssistantMessages(
    JSON.parse(JSON.stringify(rawMessages)),
  );

  const lastUserMsgIndex = messages.reduce(
    (lastIndex: number, message: any, index: number) =>
      message?.role === "user" ? index : lastIndex,
    -1,
  );

  if (lastUserMsgIndex === -1) {
    return { messages, referenceAssets: [] };
  }

  const resolvedLastMessageAssets: UploadedAssetDescriptor[] = [];
  const lastMessageSourceUrls = new Set<string>();

  for (let messageIndex = 0; messageIndex < messages.length; messageIndex++) {
    const message = messages[messageIndex];
    if (message?.role !== "user") {
      continue;
    }

    const parts = ensureMessageParts(message);
    for (const part of parts) {
      if (part?.type !== "file" || typeof part.url !== "string") {
        continue;
      }

      const asset = await resolveUploadedAsset({
        url: part.url,
        filename: part.filename,
        mediaType: part.mediaType,
      });

      if (!asset) {
        continue;
      }

      part.url = createAssetInlineBase64(asset);
      part.mediaType = asset.mediaType;
      part.filename = asset.filename;

      if (messageIndex === lastUserMsgIndex) {
        if (!lastMessageSourceUrls.has(asset.sourceUrl)) {
          resolvedLastMessageAssets.push(asset);
          lastMessageSourceUrls.add(asset.sourceUrl);
        }
      }
    }
  }

  const legacyAssets = await resolveUploadedAssets(
    legacyAssetUrls.map((url) => ({ url })),
  );
  const combinedAssets = new Map<string, UploadedAssetDescriptor>();

  for (const asset of resolvedLastMessageAssets) {
    combinedAssets.set(asset.sourceUrl, asset);
  }

  for (const asset of legacyAssets) {
    combinedAssets.set(asset.sourceUrl, asset);
  }

  const lastMessage = messages[lastUserMsgIndex];
  upsertLegacyAssetParts(lastMessage, legacyAssets, lastMessageSourceUrls);

  const referenceAssets = Array.from(combinedAssets.values());
  const referenceAssetsText = buildReferenceAssetsBlock(referenceAssets);

  if (referenceAssetsText) {
    prependTextToMessage(lastMessage, referenceAssetsText);
  }

  if (sceneContext) {
    prependTextToMessage(
      lastMessage,
      `[SCENE_JSON_PAYLOAD:\n\`\`\`json\n${JSON.stringify(
        sceneContext,
        null,
        2,
      )}\n\`\`\`\n]\n\n`,
    );
  }

  if (projectId) {
    prependTextToMessage(
      lastMessage,
      `[PROJECT_CONTEXT: projectId="${projectId}"]\nWhen calling renderScene, always pass this projectId so videos are stored under the project folder.\n\n`,
    );
  }

  return {
    messages,
    referenceAssets,
  };
}
