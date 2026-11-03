import { writeFile } from "node:fs/promises";
import { db } from "@/prisma/db";
import {
  ASSISTANT_EVALUATION_VERSION,
  runAssistantEvaluation,
} from "@/lib/assistant-evaluation";
import { buildConstrainedBundle } from "@/lib/bundle";
import { listDemoCatalogue } from "@/lib/catalogue";
import { previewMetaAssistantReply } from "@/lib/meta-assistant";

/**
 * Runs the versioned assistant evaluation set against the configured live
 * model via the read-only prompt preview (no conversations, runs, or
 * WhatsApp messages are created). Usage:
 *   npm run eval:assistant [-- --out report.json]
 * Exits non-zero when any scenario fails or the model is not configured.
 */
async function main() {
  const outIndex = process.argv.indexOf("--out");
  const outPath = outIndex >= 0 ? process.argv[outIndex + 1] : undefined;

  const report = await runAssistantEvaluation(async (scenario) => {
    const startedAt = Date.now();
    const result = await previewMetaAssistantReply(scenario.customerMessage);
    const durationMs = Date.now() - startedAt;
    if (!result.ok) {
      return {
        reply: "",
        handedOff: false,
        catalogueSearches: 0,
        durationMs,
        error: result.error,
      };
    }
    return {
      reply: result.reply,
      handedOff: result.handedOff,
      catalogueSearches: result.catalogueSearches,
      durationMs,
    };
  });

  // Deterministic catalogue bundle check (offline, no model call): the
  // evaluation scenario set expects a bundle under KES 5,000 to be
  // constructible from current catalogue facts without invented discounts.
  const catalogue = await listDemoCatalogue();
  const bundle = catalogue.ok
    ? buildConstrainedBundle(catalogue.products, 500_000, "KES")
    : null;
  const bundleCheck = {
    scenario: "bundle-budget",
    budgetMinor: 500_000,
    currency: "KES",
    bundleFound: bundle !== null,
    totalMinor: bundle?.totalMinor ?? null,
    itemCount: bundle?.items.length ?? 0,
  };

  console.info(
    `[evaluation] ${ASSISTANT_EVALUATION_VERSION}: ${report.passed}/${report.total} passed (${Math.round(report.passRate * 100)}%)`,
  );
  for (const result of report.results) {
    console.info(
      `${result.passed ? "PASS" : "FAIL"} ${result.id} (${result.group}) ${result.durationMs}ms searches=${result.catalogueSearches}${result.passed ? "" : ` checks=${result.checks.filter((c) => !c.passed).map((c) => c.name).join(",") || result.error || ""}`}`,
    );
  }
  console.info(
    `[evaluation] bundle check: ${bundleCheck.bundleFound ? `KES ${(bundleCheck.totalMinor ?? 0) / 100} across ${bundleCheck.itemCount} items within KES 5,000` : "no bundle within KES 5,000 from current catalogue"}`,
  );

  if (outPath) {
    await writeFile(
      outPath,
      JSON.stringify(
        { generatedAt: new Date().toISOString(), report, bundleCheck },
        null,
        2,
      ),
    );
    console.info(`[evaluation] Report written to ${outPath}`);
  }

  if (report.failed > 0 || report.total === 0) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error(
      "[evaluation] Run failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.close();
  });
