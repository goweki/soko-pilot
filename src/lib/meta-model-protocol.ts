export type ModelToolCall = {
  id: string;
  name: string;
  arguments: string;
};

export type ModelCompletion = {
  model: string;
  content: string | null;
  finishReason: string | null;
  toolCalls: ModelToolCall[];
};

export function getMetaChatCompletionsEndpoint(baseUrl: string): string | null {
  try {
    const url = new URL(baseUrl);
    if (
      url.protocol !== "https:" ||
      url.hostname !== "api.meta.ai" ||
      url.port ||
      url.username ||
      url.password ||
      url.pathname.replace(/\/$/, "") !== "/v1" ||
      url.search ||
      url.hash
    ) {
      return null;
    }
    return "https://api.meta.ai/v1/chat/completions";
  } catch {
    return null;
  }
}

export function isMetaModelConfigured(config: {
  url?: string;
  model?: string;
  apiKey?: string;
}): boolean {
  return Boolean(
    config.apiKey?.trim() &&
    config.model?.trim() &&
    getMetaChatCompletionsEndpoint(config.url?.trim() ?? ""),
  );
}

export function parseCatalogueSearchArguments(
  value: string,
): { query: string } | null {
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return null;
    }
    const record = parsed as Record<string, unknown>;
    if (
      Object.keys(record).length !== 1 ||
      typeof record.query !== "string" ||
      record.query.trim().length < 2 ||
      record.query.trim().length > 160
    ) {
      return null;
    }
    return { query: record.query.trim() };
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseMetaCompletion(value: unknown): ModelCompletion | null {
  if (!isRecord(value) || typeof value.model !== "string") return null;
  if (!Array.isArray(value.choices) || !isRecord(value.choices[0])) {
    return null;
  }
  const choice = value.choices[0];
  if (!isRecord(choice.message)) return null;
  const message = choice.message;
  const content = typeof message.content === "string" ? message.content : null;
  const toolCalls: ModelToolCall[] = [];

  if (message.tool_calls !== undefined) {
    if (!Array.isArray(message.tool_calls)) return null;
    for (const rawCall of message.tool_calls) {
      if (
        !isRecord(rawCall) ||
        typeof rawCall.id !== "string" ||
        !isRecord(rawCall.function) ||
        typeof rawCall.function.name !== "string" ||
        typeof rawCall.function.arguments !== "string"
      ) {
        return null;
      }
      toolCalls.push({
        id: rawCall.id,
        name: rawCall.function.name,
        arguments: rawCall.function.arguments,
      });
    }
  }

  return {
    model: value.model,
    content,
    finishReason:
      typeof choice.finish_reason === "string" ? choice.finish_reason : null,
    toolCalls,
  };
}
