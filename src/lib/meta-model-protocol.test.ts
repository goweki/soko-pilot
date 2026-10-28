import assert from "node:assert/strict";
import test from "node:test";
import {
  getMetaChatCompletionsEndpoint,
  isMetaModelConfigured,
  parseCatalogueSearchArguments,
  parseMetaCompletion,
} from "./meta-model-protocol";

test("Meta endpoint accepts only the official HTTPS API base", () => {
  assert.equal(
    getMetaChatCompletionsEndpoint("https://api.meta.ai/v1"),
    "https://api.meta.ai/v1/chat/completions",
  );
  assert.equal(getMetaChatCompletionsEndpoint("http://api.meta.ai/v1"), null);
  assert.equal(getMetaChatCompletionsEndpoint("https://example.com/v1"), null);
  assert.equal(
    getMetaChatCompletionsEndpoint("https://api.meta.ai/v1?proxy=1"),
    null,
  );
});

test("model readiness requires a key, a model, and a valid Meta endpoint", () => {
  assert.equal(
    isMetaModelConfigured({
      url: "https://api.meta.ai/v1",
      model: "muse-wonder-1.0",
      apiKey: "configured",
    }),
    true,
  );
  assert.equal(
    isMetaModelConfigured({
      url: "https://example.com/v1",
      model: "muse-wonder-1.0",
      apiKey: "configured",
    }),
    false,
  );
  assert.equal(
    isMetaModelConfigured({
      url: "https://api.meta.ai/v1",
      model: "muse-wonder-1.0",
      apiKey: "  ",
    }),
    false,
  );
});

test("catalogue tool arguments accept one bounded query and reject extra fields", () => {
  assert.deepEqual(parseCatalogueSearchArguments('{"query":"linen shirt"}'), {
    query: "linen shirt",
  });
  assert.equal(
    parseCatalogueSearchArguments('{"query":"shirt","merchantId":"other"}'),
    null,
  );
  assert.equal(parseCatalogueSearchArguments('{"query":"x"}'), null);
  assert.equal(
    parseCatalogueSearchArguments(`{"query":"${"x".repeat(161)}"}`),
    null,
  );
  assert.equal(parseCatalogueSearchArguments("not-json"), null);
});

test("completion parser preserves tool calls and rejects malformed provider output", () => {
  assert.deepEqual(
    parseMetaCompletion({
      model: "muse-wonder-1.0",
      choices: [
        {
          finish_reason: "tool_calls",
          message: {
            content: null,
            tool_calls: [
              {
                id: "call_1",
                type: "function",
                function: {
                  name: "search_catalogue",
                  arguments: '{"query":"linen"}',
                },
              },
            ],
          },
        },
      ],
    }),
    {
      model: "muse-wonder-1.0",
      content: null,
      finishReason: "tool_calls",
      toolCalls: [
        {
          id: "call_1",
          name: "search_catalogue",
          arguments: '{"query":"linen"}',
        },
      ],
    },
  );
  assert.equal(parseMetaCompletion({ model: "wrong", choices: [] }), null);
  assert.equal(
    parseMetaCompletion({
      model: "muse-wonder-1.0",
      choices: [
        {
          finish_reason: "tool_calls",
          message: { tool_calls: [{ id: "missing-function" }] },
        },
      ],
    }),
    null,
  );
});
