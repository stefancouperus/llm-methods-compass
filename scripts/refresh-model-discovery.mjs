import { readFile, writeFile } from "node:fs/promises";

const snapshotUrl = new URL("../app/model-discovery.json", import.meta.url);
const hubEndpoint = "https://huggingface.co/api/models";
const queryVersion = "0.3";
const resultLimit = 3;
const trustedPublishers = new Set([
  "alibaba-nlp", "answerdotai", "baai", "cohereforai", "datalab-to", "dtai-kuleuven",
  "facebookai", "google", "gronlp", "ibm-granite", "intfloat", "jinaai", "meta-llama",
  "microsoft", "mistralai", "mixedbread-ai", "naver-clova-ix", "qwen",
  "sentence-transformers", "swiss-ai", "thenlper", "umcu",
]);

const streams = [
  {
    id: "retrieval-embeddings",
    label: "Retrieval embeddings",
    purpose: "Possible challengers for monolingual, multilingual, semantic, or hybrid passage retrieval.",
    queries: [
      { search: "embedding", pipelineTag: "feature-extraction" },
      { search: "multilingual embedding", pipelineTag: "feature-extraction", filter: "multilingual" },
    ],
  },
  {
    id: "retrieval-rerankers",
    label: "Retrieval rerankers",
    purpose: "Possible second-stage relevance models for a hybrid retrieval chain.",
    queries: [
      { search: "reranker", pipelineTag: "text-classification" },
      { search: "multilingual reranker", pipelineTag: "text-classification", filter: "multilingual" },
    ],
  },
  {
    id: "encoder-backbones",
    label: "Encoder backbones",
    purpose: "Possible compact foundations to fine-tune for screening, classification, coding, or extraction.",
    queries: [
      { search: "ModernBERT", pipelineTag: "fill-mask" },
      { search: "XLM-RoBERTa", pipelineTag: "fill-mask" },
      { search: "DeBERTa", pipelineTag: "fill-mask" },
    ],
  },
  {
    id: "span-entity-extraction",
    label: "Span and entity extraction",
    purpose: "Possible task-ready leads for named entities, typed spans, and evidence-linked extraction.",
    queries: [
      { search: "NER", pipelineTag: "token-classification" },
      { search: "entity extraction", pipelineTag: "token-classification" },
    ],
  },
  {
    id: "sequence-transformations",
    label: "Sequence transformation",
    purpose: "Possible encoder-decoder leads for summarisation, translation, normalization, or controlled text transformation.",
    queries: [
      { search: "multilingual", pipelineTag: "text2text-generation" },
      { search: "summarization", pipelineTag: "summarization" },
    ],
  },
  {
    id: "instruction-models",
    label: "Instruction models",
    purpose: "Possible open-weight challengers for contextual coding, constrained generation, and bounded interpretive assistance.",
    queries: [
      { search: "instruct", pipelineTag: "text-generation" },
      { search: "multilingual instruct", pipelineTag: "text-generation", filter: "multilingual" },
    ],
  },
  {
    id: "document-understanding",
    label: "Document OCR and vision",
    purpose: "Possible upstream challengers when page pixels, layout, handwriting, tables, or reading order matter.",
    queries: [
      { search: "OCR", pipelineTag: "image-to-text" },
      { search: "document", pipelineTag: "image-text-to-text" },
    ],
  },
];

function optionValue(name) {
  const prefix = `--${name}=`;
  const option = process.argv.find((value) => value.startsWith(prefix));
  return option ? option.slice(prefix.length) : null;
}

function daysSince(value) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? (Date.now() - timestamp) / 86_400_000 : Infinity;
}

function declaredLicense(tags) {
  return tags.find((tag) => tag.startsWith("license:"))?.slice("license:".length) ?? "not-declared";
}

function baseModel(tags) {
  const preferred = tags.find((tag) => tag.startsWith("base_model:finetune:"));
  const any = preferred ?? tags.find((tag) => tag.startsWith("base_model:") && tag.split(":").length === 2);
  return any?.split(":").slice(-1)[0] ?? null;
}

function isDerivativePackage(model) {
  const text = `${model.id} ${(model.tags ?? []).join(" ")}`.toLowerCase();
  return /(?:gguf|gptq|awq|mlx|lora|adapter|merge|pruned|quant|oq\d|4bit|8bit|fp8|int8)/.test(text);
}

function candidateScore(model) {
  const tags = Array.isArray(model.tags) ? model.tags : [];
  const files = Array.isArray(model.siblings) ? model.siblings.map((file) => file.rfilename ?? "") : [];
  const license = declaredLicense(tags);
  const documentary = (license !== "not-declared" ? 3 : 0) + (files.some((file) => file.endsWith(".safetensors")) ? 2 : 0);
  const use = Math.log10(Number(model.downloads ?? 0) + 1) * 1.5 + Math.log10(Number(model.likes ?? 0) + 1);
  const publisher = String(model.author ?? model.id?.split("/")[0] ?? "").toLowerCase();
  const publisherSignal = trustedPublishers.has(publisher) ? 8 : 0;
  const ageDays = daysSince(model.lastModified);
  const freshness = Number.isFinite(ageDays) ? Math.max(0, 4 - ageDays / 180) : 0;
  return documentary + use + publisherSignal + freshness;
}

function normalizeCandidate(model) {
  const tags = Array.isArray(model.tags) ? model.tags : [];
  const files = Array.isArray(model.siblings) ? model.siblings.map((file) => file.rfilename ?? "") : [];
  return {
    id: model.id,
    revision: model.sha,
    lastModified: model.lastModified,
    license: declaredLicense(tags),
    gated: Boolean(model.gated),
    pipelineTag: model.pipeline_tag ?? "not-declared",
    library: model.library_name ?? "not-declared",
    downloads: Number(model.downloads ?? 0),
    likes: Number(model.likes ?? 0),
    baseModel: baseModel(tags),
    hasSafetensors: files.some((file) => file.endsWith(".safetensors")),
    url: `https://huggingface.co/${model.id}/tree/${model.sha}`,
  };
}

function selectCandidates(models) {
  const selected = [];
  const lineages = new Set();

  for (const model of models
    .filter((item) => item?.id && item?.sha && item.private !== true && item.gated !== true)
    .filter((item) => !isDerivativePackage(item))
    .sort((a, b) => candidateScore(b) - candidateScore(a))) {
    const tags = Array.isArray(model.tags) ? model.tags : [];
    const lineage = baseModel(tags) ?? model.id;
    if (lineages.has(lineage)) continue;
    lineages.add(lineage);
    selected.push(normalizeCandidate(model));
    if (selected.length === resultLimit) break;
  }

  return selected;
}

async function queryStream(stream) {
  const queries = stream.queries.flatMap((query) => ["lastModified", "downloads"].map(async (sort) => {
    const url = new URL(hubEndpoint);
    url.searchParams.set("search", query.search);
    url.searchParams.set("pipeline_tag", query.pipelineTag);
    if (query.filter) url.searchParams.set("filter", query.filter);
    url.searchParams.set("sort", sort);
    url.searchParams.set("direction", "-1");
    url.searchParams.set("limit", "80");
    url.searchParams.set("full", "true");

    const response = await fetch(url, {
      headers: { "user-agent": "method-chain-model-discovery/0.1" },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error(`Hugging Face query failed for ${stream.id}/${query.search}/${sort}: HTTP ${response.status}`);
    const results = await response.json();
    if (!Array.isArray(results)) throw new Error(`Unexpected Hugging Face response for ${stream.id}/${query.search}/${sort}`);
    return results;
  }));
  const resultSets = await Promise.all(queries);
  const models = [...new Map(resultSets.flat().map((model) => [model.id, model])).values()];

  const candidates = selectCandidates(models);
  if (!candidates.length) throw new Error(`No documentary candidates survived the ${stream.id} metadata screen`);

  return {
    id: stream.id,
    label: stream.label,
    purpose: stream.purpose,
    query: {
      requests: stream.queries,
      sorts: ["lastModified", "downloads"],
      inspected: models.length,
    },
    candidates,
  };
}

function validate(snapshot) {
  if (snapshot?.schemaVersion !== "0.1") throw new Error("Unsupported model-discovery schema");
  if (!Number.isFinite(Date.parse(snapshot.generatedAt))) throw new Error("Discovery timestamp is invalid");
  if (snapshot.cadenceDays !== 30) throw new Error("Model-discovery cadence must be 30 days");
  if (!Array.isArray(snapshot.streams) || snapshot.streams.length !== streams.length) throw new Error("Discovery streams are incomplete");
  for (const stream of snapshot.streams) {
    if (!stream.candidates?.length) throw new Error(`Discovery stream ${stream.id} has no candidates`);
    for (const candidate of stream.candidates) {
      if (!candidate.id || !/^[a-f0-9]{40,64}$/i.test(candidate.revision)) throw new Error(`Candidate ${candidate.id ?? "unknown"} lacks a pinned revision`);
    }
  }
}

let existing = null;
try {
  existing = JSON.parse(await readFile(snapshotUrl, "utf8"));
} catch {
  existing = null;
}

if (process.argv.includes("--validate")) {
  validate(existing);
  console.log(`Valid discovery snapshot: ${existing.generatedAt}`);
  process.exit(0);
}

const staleDays = Number(optionValue("if-stale-days"));
if (Number.isFinite(staleDays) && staleDays > 0 && existing && daysSince(existing.generatedAt) < staleDays) {
  console.log(`Discovery snapshot is younger than ${staleDays} days; refresh skipped.`);
  process.exit(0);
}

const refreshedStreams = await Promise.all(streams.map(queryStream));
const snapshot = {
  schemaVersion: "0.1",
  generatedAt: new Date().toISOString(),
  source: "Hugging Face public Hub API",
  sourceUrl: "https://huggingface.co/api/models",
  status: "automated_metadata_watchlist_only",
  cadenceDays: 30,
  queryVersion,
  methodNote: "Public, non-gated source repositories are deduplicated by declared lineage and ranked for documentary completeness and Hub use. Presence is not evidence of quality, openness, license suitability, language/domain validity, runtime compatibility, or scholarly adequacy.",
  streams: refreshedStreams,
};

validate(snapshot);
await writeFile(snapshotUrl, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
console.log(`Refreshed ${refreshedStreams.reduce((sum, stream) => sum + stream.candidates.length, 0)} watchlist entries at ${snapshot.generatedAt}.`);
