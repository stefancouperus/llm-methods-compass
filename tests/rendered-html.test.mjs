import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function staticArtifact() {
  const root = new URL("../pages-dist/", import.meta.url);
  const index = await readFile(new URL("index.html", root), "utf8");
  const assetNames = await readdir(new URL("assets/", root));
  const scripts = await Promise.all(
    assetNames.filter((name) => name.endsWith(".js")).map((name) => readFile(new URL(`assets/${name}`, root), "utf8")),
  );
  return { index, bundle: scripts.join("\n") };
}

test("builds a self-contained GitHub Pages dashboard", async () => {
  const { index, bundle } = await staticArtifact();

  assert.match(index, /LLM Methods Compass — Qualitative Text Research Advisor/);
  assert.match(index, /og-v2\.png/);
  assert.match(bundle, /LLM Methods Compass/);
  assert.match(bundle, /Advice, not execution/);
  assert.match(bundle, /Qualitative text analysis only/);
  assert.match(bundle, /LLM advice for qualitative analysis of textual sources/);
  assert.match(bundle, /does not advise on qualitative analysis of audio, video, photographs or other image content/);
  assert.match(bundle, /Scanned document pages may be considered only to recover or verify their text and layout/);
  assert.match(bundle, /Research claim/);
  assert.match(bundle, /Blank questionnaire ready/);
  assert.match(bundle, /Load example/);
  assert.match(bundle, /Check the information used for your advice/);
  assert.match(bundle, /Review answers/);
  assert.match(bundle, /The advisor uses only the answers shown below/);
  assert.match(bundle, /Guide contents/);
  assert.match(bundle, /Another-model check/);
  assert.match(bundle, /Named environment/);
  assert.match(bundle, /Model options/);
  assert.match(bundle, /Model and non-model options by research task/);
  assert.match(bundle, /How options enter this list/);
  assert.match(bundle, /Why this route is included/);
  assert.match(bundle, /Why these routes are suggested/);
  assert.match(bundle, /What must be validated—and why/);
  assert.match(bundle, /Project-conditioned validation/);
  assert.match(bundle, /Validation strategy matrix/);
  assert.match(bundle, /Experimental supplement/);
  assert.match(bundle, /cross-model agreement is a robustness signal, not independent validation/i);
  assert.match(bundle, /Instruction-tuned first; adaptation only after evidence/);
  assert.match(bundle, /Coding guide status/);
  assert.match(bundle, /A model’s numerical “confidence” is not a probability/);
  assert.match(bundle, /What would justify this option/);
  assert.match(bundle, /Use in research/);
  assert.match(bundle, /Provisional model candidates/);
  assert.match(bundle, /How repositories reach this category—and leave it/);
  assert.match(bundle, /not yet curated choices/);
  assert.match(bundle, /No proprietary models or commercial AI APIs/);
  assert.match(bundle, /Largest GPU usually available/);
  assert.match(bundle, /Technical terms used in the model list/);
  assert.match(bundle, /Monthly evidence checks/);
  assert.match(bundle, /How the QMD enters the advisor/);
  assert.match(bundle, /Sources for consultation/);
  assert.match(bundle, /New work awaiting scholarly screening/);
  assert.match(bundle, /Current discovery queue provisionally appraised/);
  assert.match(bundle, /See every appraisal decision and reason/);
  assert.match(bundle, /Bao — LLMs as candidate measures/);
  assert.match(bundle, /Pichler & Pagel — theory prompts/);
  assert.match(bundle, /Gillespie — provoking interpretation/);
  assert.doesNotMatch(bundle, /broader than the Dutch worked example|Dutch parliamentary worked case/i);
  assert.doesNotMatch(bundle, /Hábrók|RTX Pro|hosted ceiling model/i);
  assert.doesNotMatch(`${index}\n${bundle}`, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
  await access(new URL("../pages-dist/og-v2.png", import.meta.url));
});

test("keeps execution outside the browser and validates discovery provenance", async () => {
  const [page, registry, packageJson, discoveryText, literatureText, reviewText, referencesText, workflow] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/model-registry.ts", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/model-discovery.json", import.meta.url), "utf8"),
    readFile(new URL("../app/literature-discovery.json", import.meta.url), "utf8"),
    readFile(new URL("../app/literature-review-decisions.json", import.meta.url), "utf8"),
    readFile(new URL("../app/research-references.ts", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8"),
  ]);
  const discovery = JSON.parse(discoveryText);
  const literature = JSON.parse(literatureText);
  const review = JSON.parse(reviewText);
  const blankState = page.match(/const blankState: FormState = \{[\s\S]*?\n\};/)?.[0] ?? "";
  const formType = page.match(/type FormState = \{([\s\S]*?)\n\};/)?.[1] ?? "";
  const formKeys = [...formType.matchAll(/^\s{2}(\w+):/gm)].map((match) => match[1]);
  const answerReview = page.slice(page.indexOf("function reviewSections"), page.indexOf("function deriveCandidates"));
  const markdownExport = page.slice(page.indexOf("function markdownReport"), page.indexOf("function downloadFile"));

  assert.match(page, /No corpus, model, or HPC execution by dashboard/);
  assert.match(page, /planning_suggestion_only/);
  assert.match(page, /window\.localStorage/);
  assert.match(page, /llm-methods-compass-draft-v1/);
  assert.match(page, /Download JSON/);
  assert.match(blankState, /language: ""/);
  assert.match(blankState, /operations: \[\]/);
  for (const field of ["outputUse", "sourceFormat", "sourceAccess", "corpusScale", "historicalVariation", "provenanceStatus", "traceability", "contextNeed", "claimDependence", "constructMode", "labelsAvailable", "codebookStatus", "codebookContent", "errorPriority", "humanReview", "reviewCoverage", "reviewCapacity", "downstreamUse", "crossModelStrategy", "production", "openness", "adaptationPolicy", "hardware", "sustainability"]) {
    assert.match(blankState, new RegExp(`${field}: ""`));
  }
  assert.equal(formKeys.length, 31);
  for (const field of formKeys) {
    assert.match(answerReview, new RegExp(`form\\.${field}\\b`), `${field} must appear in the pre-advice review`);
    assert.match(markdownExport, new RegExp(`form\\.${field}\\b`), `${field} must appear in the Markdown advisory report`);
  }
  assert.match(registry, /Turn scans into reliable text/);
  assert.match(registry, /Count, combine and summarise results/);
  assert.match(registry, /selectionBasis/);
  assert.match(registry, /documentedExamples/);
  assert.match(registry, /Research use/);
  assert.match(registry, /local open-model qualitative coding/);
  assert.match(registry, /not its base checkpoint/);
  assert.match(registry, /Fine-tuning enters only after the coding guide is stable/);
  assert.match(registry, /proprietary model excluded here/);
  assert.match(registry, /PROVISIONAL_MODEL_CATEGORY/);
  assert.match(registry, /not establish sufficient task-relevant published research or project testing/);
  assert.match(page, /deriveValidationPlan/);
  assert.match(page, /Egami et al. — valid downstream inference/);
  assert.match(page, /Zheng et al. — LLM-as-a-judge limitations/);
  assert.doesNotMatch(page, /hostedAllowed|rtx96|Hábrók|RTX Pro/i);
  assert.doesNotMatch(page, /fetch\(|axios|api[_-]?key|Authorization|Bearer/i);
  assert.doesNotMatch(packageJson, /openai|anthropic|@google\/generative-ai/i);
  assert.equal(discovery.status, "automated_metadata_watchlist_only");
  assert.equal(discovery.cadenceDays, 30);
  assert.ok(Number.isFinite(Date.parse(discovery.generatedAt)));
  assert.ok(discovery.streams.length >= 7);
  assert.ok(!discovery.streams.some((stream) => /dutch/i.test(`${stream.id} ${stream.label}`)));
  assert.ok(discovery.streams.every((stream) => stream.candidates.length > 0));
  assert.ok(discovery.streams.flatMap((stream) => stream.candidates).every((candidate) => /^[a-f0-9]{40,64}$/i.test(candidate.revision)));
  assert.equal(literature.status, "automated_bibliographic_screening_queue_only");
  assert.equal(literature.cadenceDays, 30);
  assert.ok(Number.isFinite(Date.parse(literature.generatedAt)));
  assert.ok(literature.candidates.length >= 5);
  assert.ok(literature.candidates.every((candidate) => candidate.reviewStatus === "screening_required"));
  assert.equal(review.reviewedDiscoveryGeneratedAt, literature.generatedAt);
  assert.equal(review.confirmationStatus, "researcher_confirmed");
  assert.ok(review.confirmedBy);
  assert.ok(Number.isFinite(Date.parse(review.confirmedAt)));
  assert.equal(review.decisions.length, literature.candidates.length);
  assert.deepEqual(new Set(review.decisions.map((decision) => decision.id)), new Set(literature.candidates.map((candidate) => candidate.id)));
  assert.equal(review.decisions.filter((decision) => decision.status === "integrated").length, 4);
  assert.equal(review.decisions.find((decision) => decision.id === "10.1037/qup0000374")?.status, "integrated");
  assert.equal(review.decisions.find((decision) => decision.id === "10.1177/23328584251389621")?.status, "out_of_scope");
  assert.doesNotMatch(review.decisions.find((decision) => decision.id === "10.1177/00491241251339188")?.reason ?? "", /persona prompts/i);
  assert.ok(review.decisions.every((decision) => decision.reason && Array.isArray(decision.affectedModules)));
  assert.match(referencesText, /Beyond the Conventional Pipeline/);
  assert.match(referencesText, /Updating ‘The Future of Coding’/);
  assert.match(referencesText, /Evaluating Humanities Theory Alignment/);
  assert.match(referencesText, /Provoking Interpretation/);
  assert.equal((page.match(/exemplarState/g) ?? []).length, 2);
  assert.match(workflow, /refresh-model-discovery|refresh:models/);
  assert.match(workflow, /refresh-literature-discovery|refresh:literature/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
});
