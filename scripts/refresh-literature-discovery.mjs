import { readFile, writeFile } from "node:fs/promises";

const snapshotUrl = new URL("../app/literature-discovery.json", import.meta.url);
const endpoint = "https://api.crossref.org/works";
const queryVersion = "0.1";
const cadenceDays = 30;
const lookbackDays = 550;
const resultLimit = 18;

const searches = [
  { id: "qualitative-methods", label: "Qualitative research and interpretation", text: "large language models qualitative research interpretation coding" },
  { id: "annotation-measurement", label: "Text annotation and measurement", text: "large language models text annotation measurement social science" },
  { id: "validation-inference", label: "Validation and downstream inference", text: "large language models validation downstream inference classification error" },
  { id: "prompting-reproducibility", label: "Prompting and reproducibility", text: "large language models prompting reproducibility social science humanities" },
  { id: "historical-multilingual", label: "Historical and multilingual text", text: "large language models historical text multilingual humanities" },
  { id: "open-local", label: "Open-weight and local research use", text: "open weight large language models local research text analysis" },
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

function isoDateDaysAgo(days) {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
}

function decodeEntities(value) {
  return String(value ?? "")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function titleOf(item) {
  return decodeEntities(item.title?.[0]).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function publishedDate(item) {
  const parts = item.published?.["date-parts"]?.[0] ?? item.created?.["date-parts"]?.[0] ?? [];
  if (!parts[0]) return null;
  return `${parts[0]}-${String(parts[1] ?? 1).padStart(2, "0")}-${String(parts[2] ?? 1).padStart(2, "0")}`;
}

function relevanceScore(item) {
  const text = `${titleOf(item)} ${(item.subtitle ?? []).join(" ")} ${(item.subject ?? []).join(" ")} ${(item["container-title"] ?? []).join(" ")}`.toLowerCase();
  const llmSignal = /large language model|\bllms?\b|generative (?:artificial intelligence|ai)/.test(text) ? 12 : 0;
  const methodTerms = ["qualitative", "annotation", "coding", "measurement", "validation", "inference", "prompt", "reproduc", "humanities", "social science", "historical", "retrieval", "open-weight", "open source"];
  const methodSignal = methodTerms.reduce((sum, term) => sum + (text.includes(term) ? 2 : 0), 0);
  const typeSignal = ["journal-article", "proceedings-article", "posted-content", "report"].includes(item.type) ? 2 : 0;
  const year = Number(publishedDate(item)?.slice(0, 4) ?? 0);
  return llmSignal + methodSignal + typeSignal + Math.max(0, year - 2024);
}

function isInScope(item) {
  const text = `${titleOf(item)} ${(item.subtitle ?? []).join(" ")}`.toLowerCase();
  const llm = /large language model|\bllms?\b|generative (?:artificial intelligence|ai)/.test(text);
  const researchMethod = /qualitative|annotation|coding|measurement|downstream inference|social science|humanities|historical text|interpretation|content analysis|text analysis/.test(text);
  const excludedDomain = /automatic speech recognition|\basr\b|person retrieval|multimodal retrieval|clinical assistant|personal privacy|parameter-efficient tuning|adaptive inference|protein|synthetic document generation|^supplemental material/.test(text);
  return llm && researchMethod && !excludedDomain;
}

function normalize(item, query) {
  const date = publishedDate(item);
  const doi = String(item.DOI ?? "").toLowerCase() || null;
  return {
    id: doi ?? item.URL ?? titleOf(item).toLowerCase(),
    title: titleOf(item),
    authors: (item.author ?? []).slice(0, 5).map((author) => [author.given, author.family].filter(Boolean).join(" ")),
    published: date,
    year: date ? Number(date.slice(0, 4)) : null,
    venue: decodeEntities(item["container-title"]?.[0] ?? item.publisher ?? "Venue not declared"),
    type: item.type ?? "not-declared",
    doi,
    url: doi ? `https://doi.org/${doi}` : item.URL,
    score: relevanceScore(item),
    queryIds: [query.id],
    reviewStatus: "screening_required",
  };
}

async function queryCrossref(query) {
  const url = new URL(endpoint);
  url.searchParams.set("query.bibliographic", query.text);
  url.searchParams.set("filter", `from-pub-date:${isoDateDaysAgo(lookbackDays)}`);
  url.searchParams.set("sort", "relevance");
  url.searchParams.set("order", "desc");
  url.searchParams.set("rows", "50");
  const response = await fetch(url, {
    headers: { "user-agent": "llm-methods-compass-literature-watch/0.1 (mailto:no-reply@example.org)" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Crossref query failed for ${query.id}: HTTP ${response.status}`);
  const body = await response.json();
  const items = body?.message?.items;
  if (!Array.isArray(items)) throw new Error(`Unexpected Crossref response for ${query.id}`);
  const candidates = items
    .filter((item) => titleOf(item) && isInScope(item) && relevanceScore(item) >= 16)
    .map((item) => normalize(item, query))
    .slice(0, 8);
  return { id: query.id, label: query.label, text: query.text, returned: items.length, retained: candidates.length, candidates };
}

function validate(snapshot) {
  if (snapshot?.schemaVersion !== "0.1") throw new Error("Unsupported literature-discovery schema");
  if (!Number.isFinite(Date.parse(snapshot.generatedAt))) throw new Error("Literature timestamp is invalid");
  if (snapshot.cadenceDays !== cadenceDays) throw new Error("Literature cadence must be 30 days");
  if (!Array.isArray(snapshot.queries) || snapshot.queries.length !== searches.length) throw new Error("Literature queries are incomplete");
  if (!Array.isArray(snapshot.candidates) || snapshot.candidates.length < 5) throw new Error("Literature screening queue is unexpectedly small");
  for (const candidate of snapshot.candidates) {
    if (!candidate.title || !candidate.url || candidate.reviewStatus !== "screening_required") throw new Error("Literature candidate metadata is incomplete");
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
  console.log(`Valid literature snapshot: ${existing.generatedAt}`);
  process.exit(0);
}

const staleDays = Number(optionValue("if-stale-days"));
if (Number.isFinite(staleDays) && staleDays > 0 && existing && daysSince(existing.generatedAt) < staleDays) {
  console.log(`Literature snapshot is younger than ${staleDays} days; refresh skipped.`);
  process.exit(0);
}

const results = [];
for (const search of searches) results.push(await queryCrossref(search));

const deduplicated = new Map();
for (const result of results) {
  for (const candidate of result.candidates) {
    const key = candidate.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const current = deduplicated.get(key);
    if (current) {
      current.queryIds = [...new Set([...current.queryIds, ...candidate.queryIds])];
      current.score = Math.max(current.score, candidate.score);
      if (candidate.type === "journal-article" && current.type !== "journal-article") deduplicated.set(key, candidate);
    } else {
      deduplicated.set(key, candidate);
    }
  }
}

const snapshot = {
  schemaVersion: "0.1",
  generatedAt: new Date().toISOString(),
  source: "Crossref public Works API",
  sourceUrl: endpoint,
  status: "automated_bibliographic_screening_queue_only",
  cadenceDays,
  queryVersion,
  methodNote: "Automated metadata leads for human screening. Presence does not establish relevance, quality, peer-review status, applicability, or authority to change the QMD or dashboard.",
  queries: results.map((result) => ({ id: result.id, label: result.label, text: result.text, returned: result.returned, retained: result.retained })),
  candidates: [...deduplicated.values()].sort((a, b) => b.score - a.score || String(b.published).localeCompare(String(a.published))).slice(0, resultLimit),
};

validate(snapshot);
await writeFile(snapshotUrl, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
console.log(`Refreshed ${snapshot.candidates.length} literature leads at ${snapshot.generatedAt}.`);
