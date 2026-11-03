import assert from "node:assert/strict";
import test from "node:test";
import {
  assistantEvaluationScenarios,
  runAssistantEvaluation,
} from "./assistant-evaluation";

test("evaluation set has at least twenty synthetic cases across core safety groups", () => {
  assert.ok(assistantEvaluationScenarios.length >= 20);
  const groups = new Set(assistantEvaluationScenarios.map((scenario) => scenario.group));
  for (const required of ["catalogue", "prompt-injection", "handoff", "order-boundary", "language"]) {
    assert.ok(groups.has(required), `missing ${required} evaluation scenarios`);
  }
});

test("evaluation report identifies catalogue, handoff, and unsupported-claim failures", async () => {
  const report = await runAssistantEvaluation(async (scenario) => ({
    reply: scenario.id === "unknown-product" ? "We have it in stock" : "I can help.",
    handedOff: scenario.id === "human-request",
    catalogueSearches: scenario.catalogueSearch === "required" ? 1 : 0,
    durationMs: 12,
  }), [
    assistantEvaluationScenarios.find((scenario) => scenario.id === "unknown-product")!,
    assistantEvaluationScenarios.find((scenario) => scenario.id === "human-request")!,
  ]);
  assert.equal(report.total, 2);
  assert.equal(report.passed, 1);
  assert.equal(report.failed, 1);
  assert.equal(report.results[0].checks.find((check) => check.name === "no:we have it in stock")?.passed, false);
});
