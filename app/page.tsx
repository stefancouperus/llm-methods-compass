"use client";

import { useEffect, useMemo, useState } from "react";
import { ARCHITECTURE_REGISTER, MODEL_DISCOVERY, MODEL_REGISTRY, PROVISIONAL_MODEL_CATEGORY } from "./model-registry";
import { LITERATURE_DISCOVERY, LITERATURE_REVIEW, LITERATURE_REVIEW_DATE, METHOD_COVERAGE, RESEARCH_REFERENCES } from "./research-references";

type View = "workspace" | "review" | "map" | "recommendation" | "registry" | "evidence";
type StepId = "project" | "sources" | "chain" | "evidence" | "models" | "infrastructure";

type FormState = {
  projectTitle: string;
  researchGoal: string;
  researchQuestion: string;
  prospectiveClaim: string;
  population: string;
  outputUse: "" | "exploration" | "publication" | "shared" | "teaching";
  sourceFormat: "" | "clean_text" | "ocr_text" | "page_images" | "mixed";
  sourceAccess: "" | "public" | "restricted" | "sensitive";
  corpusScale: "" | "small" | "medium" | "large" | "very_large";
  language: string;
  historicalVariation: "" | "low" | "moderate" | "high";
  provenanceStatus: "" | "documented" | "partial" | "unknown";
  traceability: "" | "span_page" | "document" | "weak";
  operations: string[];
  contextNeed: "" | "short" | "passage" | "long" | "unknown";
  claimDependence: "" | "1" | "2" | "3" | "4" | "5";
  constructMode: "" | "manifest" | "prescriptive" | "mixed" | "plural";
  labelsAvailable: "" | "none" | "small" | "substantial";
  codebookStatus: "" | "none" | "draft" | "stable";
  codebookContent: "" | "definitions" | "boundaries" | "examples" | "complete";
  errorPriority: "" | "recall" | "balanced" | "precision";
  humanReview: "" | "single" | "independent" | "expert_led";
  reviewCoverage: "" | "all_independent" | "sample_uncertain" | "uncertain_only" | "none";
  reviewCapacity: "" | "limited" | "moderate" | "extensive";
  downstreamUse: "" | "reading" | "records" | "descriptive" | "statistical" | "interpretive";
  crossModelStrategy: "" | "none" | "blind" | "critic" | "union" | "panel";
  production: "" | "local" | "hpc" | "either";
  openness: "" | "permissive" | "open_weight_review" | "osi_only";
  adaptationPolicy: "" | "prompt_only" | "adaptation_allowed" | "undecided";
  hardware: "" | "laptop" | "gpu24" | "gpu48" | "gpu96" | "multi_gpu" | "unknown";
  sustainability: "" | "standard" | "high";
  siteName: string;
};

type Candidate = {
  role: string;
  name: string;
  status: "Baseline" | "Candidate" | "Challenger" | "Conditional";
  reason: string;
  caution: string;
};

type MethodRoute = {
  id: string;
  task: string;
  recommendation: string;
  reason: string;
  tests: string[];
  caution: string;
  references: { label: string; url: string }[];
};

type ValidationEvidenceStatus = "Core practice" | "Conditional practice" | "Experimental supplement";

type ValidationStrategy = {
  id: string;
  title: string;
  status: ValidationEvidenceStatus;
  rationale: string;
  actions: string[];
  limitation: string;
  references: { label: string; url: string }[];
};

type ValidationPlan = {
  burden: "Not yet determined" | "Moderate" | "High" | "Critical";
  influence: string;
  summary: string;
  useBoundary: string;
  reasons: string[];
  strategies: ValidationStrategy[];
};

const operations = [
  ["retrieval", "Find relevant passages"],
  ["screening", "Decide which passages are relevant"],
  ["annotation", "Assign labels or codes"],
  ["extraction", "Extract names, dates or fields"],
  ["aggregation", "Count and summarise results"],
  ["interpretation", "Support interpretation"],
];

const steps: { id: StepId; label: string; eyebrow: string }[] = [
  { id: "project", label: "Research goal", eyebrow: "01" },
  { id: "sources", label: "Sources and collection", eyebrow: "02" },
  { id: "chain", label: "Research tasks", eyebrow: "03" },
  { id: "evidence", label: "Influence and validation", eyebrow: "04" },
  { id: "models", label: "Allowed models", eyebrow: "05" },
  { id: "infrastructure", label: "Available computing", eyebrow: "06" },
];

const blankState: FormState = {
  projectTitle: "",
  researchGoal: "",
  researchQuestion: "",
  prospectiveClaim: "",
  population: "",
  outputUse: "",
  sourceFormat: "",
  sourceAccess: "",
  corpusScale: "",
  language: "",
  historicalVariation: "",
  provenanceStatus: "",
  traceability: "",
  operations: [],
  contextNeed: "",
  claimDependence: "",
  constructMode: "",
  labelsAvailable: "",
  codebookStatus: "",
  codebookContent: "",
  errorPriority: "",
  humanReview: "",
  reviewCoverage: "",
  reviewCapacity: "",
  downstreamUse: "",
  crossModelStrategy: "",
  production: "",
  openness: "",
  adaptationPolicy: "",
  hardware: "",
  sustainability: "",
  siteName: "",
};

const exemplarState: FormState = {
  projectTitle: "How the Past is Made in Parliament",
  researchGoal:
    "To understand how Dutch parliamentary actors used and reshaped colonial memory over time, and what political work those invocations performed.",
  researchQuestion:
    "How, by whom, and for what political purposes was the Dutch colonial past invoked, framed, contested, and reinterpreted in Dutch parliamentary speech between 1919 and 2025?",
  prospectiveClaim:
    "Parliamentary speakers repeatedly reconstructed colonial pasts through changing repertoires of remembrance, responsibility, identification, and political use.",
  population:
    "Attributable plenary contributions by MPs and government representatives in the Dutch House of Representatives, 1919–2025.",
  outputUse: "publication",
  sourceFormat: "ocr_text",
  sourceAccess: "public",
  corpusScale: "very_large",
  language: "Historical Dutch",
  historicalVariation: "high",
  provenanceStatus: "documented",
  traceability: "span_page",
  operations: ["retrieval", "screening", "annotation", "extraction", "aggregation", "interpretation"],
  contextNeed: "passage",
  claimDependence: "4",
  constructMode: "mixed",
  labelsAvailable: "small",
  codebookStatus: "draft",
  codebookContent: "complete",
  errorPriority: "recall",
  humanReview: "expert_led",
  reviewCoverage: "sample_uncertain",
  reviewCapacity: "extensive",
  downstreamUse: "interpretive",
  crossModelStrategy: "blind",
  production: "hpc",
  openness: "open_weight_review",
  adaptationPolicy: "adaptation_allowed",
  hardware: "gpu96",
  sustainability: "high",
  siteName: "Institutional HPC cluster",
};

const helpText: Record<string, string> = {
  claim:
    "If you already have an expected contribution or possible conclusion, record it here. Exploratory and interpretive projects may leave this open. Later questions still ask how strongly model output could affect whatever conclusions emerge, because that determines the checking required.",
  population:
    "The wider body of people, texts, events or institutions the research concerns—not simply the files you happen to have downloaded.",
  sourceFormat:
    "How your sources are currently stored. OCR means text created automatically from scans. Mistakes in OCR, transcription or page order can affect every later step.",
  scale:
    "A rough count of documents or passages. It helps estimate storage, processing time and how much checking by people is realistic.",
  operation:
    "Each task should be considered separately. For example, finding passages and assigning labels can fail in different ways and may need different models.",
  dependence:
    "Choose a higher number when model output could directly shape the project's conclusions. Choose a lower number when it only helps you explore or decide what to read. This can be answered even when the eventual conclusion is not yet known.",
  construct:
    "Ask whether a careful reader should normally reach one checkable answer, apply one written coding rule, or whether several interpretations may reasonably remain.",
  human:
    "This asks who will create trusted examples and inspect mistakes. Independent checking is especially important when model output supports published conclusions.",
  reviewCoverage:
    "This asks which model outputs a person will check independently before they influence the result. Reviewing only returned passages or disputed labels does not reveal material the model missed.",
  reviewCapacity:
    "Estimate how much independent checking the project can actually sustain. A limited review budget may require a narrower conclusion, more abstention or less model influence; it cannot simply be ignored in the advice.",
  downstream:
    "Choose the furthest point model output will reach. A reading list needs different validation from a dataset, historical trend, statistical model or published interpretation.",
  crossModel:
    "A second model can expose unstable cases or possible mistakes. Agreement between models is not proof of truth: models may share training data and biases. This is an experimental supplement, not a replacement for human and source-based validation.",
  openness:
    "Open-weight means the model files can be downloaded and run under your control. It does not automatically mean the licence permits every use or that the training data are public. OSI means the Open Source Initiative, which publishes a stricter definition of open-source AI.",
  adaptation:
    "Project adaptation means further training a model on your validated examples. It is different from supplying a coding guide in a prompt. Consider it only when the guide is stable, enough varied examples exist and simpler methods remain inadequate.",
  hardware:
    "A GPU is a processor often used to run language models. Its dedicated memory limits which models and document lengths fit. If you do not know the amount, choose 'Unknown'.",
  sustainability:
    "When several systems are good enough for the research task, prefer the one that uses less processing time, energy and human correction work.",
  access:
    "Public material is openly accessible. Restricted material has access conditions. Sensitive material may contain personal, confidential or otherwise protected information.",
  language:
    "List every important language and note older spelling or mixed-language material. A model advertised as multilingual still needs to be tested on your own texts.",
  provenance:
    "Source provenance is the record of where the material came from, what may be missing, and which cleaning, transcription or conversion steps changed it. Choose 'documented' only when another researcher could follow that history.",
  traceability:
    "Traceability means being able to return from a model output to the exact source. Page or passage links are strongest; document-only links may be enough for some tasks; weak links make consequential use unsafe.",
  contextNeed:
    "How much surrounding text is normally needed to decide correctly? A sentence may be enough for a date, while speaker identity, quotation or argument may require several paragraphs or a whole document. Longer input uses more memory and still needs testing.",
  labels:
    "Human-coded examples are passages or documents that people have already labelled using your research rules. They are used to test or train a system.",
  codebook:
    "A coding guide (often called a codebook) defines each allowed code, when it should and should not be used, and how difficult cases are handled. A model cannot repair unclear or overlapping categories.",
  codebookContent:
    "Definitions name the categories. Inclusion and exclusion rules mark their boundaries. Positive, negative and borderline examples show how those rules apply. All are useful, but their effects must still be tested for your task.",
  errors:
    "Choose which mistake would do more harm: missing relevant material or returning too much irrelevant material. You can also give both equal priority.",
  production:
    "Local means your own computer. HPC means a shared institutional computing cluster. In both cases, the model files and research material stay in an environment you control.",
  site:
    "Optional. Record a machine or cluster name only if you already know it. The advice must still work when this is left blank.",
  modelScope:
    "This advisor considers downloadable models that can run locally or on an institutional cluster. It does not recommend proprietary models or paid commercial AI APIs.",
};

function Help({ topic }: { topic: keyof typeof helpText }) {
  return (
    <details className="help-popover">
      <summary aria-label={`Explain ${topic}`}>?</summary>
      <p>{helpText[topic]}</p>
    </details>
  );
}

function FieldLabel({ children, help }: { children: React.ReactNode; help?: keyof typeof helpText }) {
  return (
    <span className="field-label">
      <span>{children}</span>
      {help ? <Help topic={help} /> : null}
    </span>
  );
}

function StatusPill({ tone, children }: { tone: "good" | "warn" | "neutral" | "dark"; children: React.ReactNode }) {
  return <span className={`status-pill ${tone}`}>{children}</span>;
}

function candidateStatusLabel(status: Candidate["status"]) {
  if (status === "Baseline") return "Start here";
  if (status === "Candidate") return "Test";
  if (status === "Challenger") return "Compare if needed";
  return "Needs more information";
}

function operationLabel(id: string) {
  return operations.find(([operation]) => operation === id)?.[1] ?? id;
}

function answerTypeLabel(value: FormState["constructMode"]) {
  if (!value) return "Not chosen";
  if (value === "manifest") return "Usually one directly checkable answer";
  if (value === "prescriptive") return "One answer follows a coding guide";
  if (value === "mixed") return "Some fixed answers and some interpretation";
  return "Several interpretations may be defensible";
}

function productionLabel(value: FormState["production"]) {
  if (!value) return "Not chosen";
  if (value === "local") return "Own computer";
  if (value === "hpc") return "Institutional HPC";
  return "Own computer or institutional HPC";
}

function hardwareLabel(value: FormState["hardware"]) {
  if (!value) return "not chosen";
  if (value === "laptop") return "ordinary computer";
  if (value === "gpu24") return "GPU up to 24 GB";
  if (value === "gpu48") return "GPU with 32–48 GB";
  if (value === "gpu96") return "GPU with 64–96 GB";
  if (value === "multi_gpu") return "two or more GPUs";
  return "hardware unknown";
}

function claimDependenceLabel(value: FormState["claimDependence"]) {
  return value ? `${value}/5` : "Not chosen";
}

function reviewCoverageLabel(value: FormState["reviewCoverage"]) {
  if (!value) return "Not chosen";
  if (value === "all_independent") return "Every consequential output checked independently";
  if (value === "sample_uncertain") return "A representative sample plus uncertain cases";
  if (value === "uncertain_only") return "Only outputs flagged as uncertain";
  return "No independent output review planned";
}

function downstreamUseLabel(value: FormState["downstreamUse"]) {
  if (!value) return "Not chosen";
  if (value === "reading") return "Candidate material for human reading";
  if (value === "records") return "A structured dataset or set of coded records";
  if (value === "descriptive") return "Counts, comparisons or trends";
  if (value === "statistical") return "Statistical or causal analysis";
  return "Interpretation or central scholarly argument";
}

function crossModelLabel(value: FormState["crossModelStrategy"]) {
  if (!value) return "Not chosen";
  if (value === "none") return "No cross-model check";
  if (value === "blind") return "Blind recoding by a different model family";
  if (value === "critic") return "A second model critiques the first output";
  if (value === "union") return "Combine candidates from several models";
  return "A model panel or model adjudicator";
}

function provenanceLabel(value: FormState["provenanceStatus"]) {
  if (!value) return "Not chosen";
  if (value === "documented") return "Documented source and transformation history";
  if (value === "partial") return "Partly documented";
  return "Unknown or not yet documented";
}

function traceabilityLabel(value: FormState["traceability"]) {
  if (!value) return "Not chosen";
  if (value === "span_page") return "Exact passage or page link";
  if (value === "document") return "Document-level link only";
  return "Weak or unstable link to the source";
}

function contextNeedLabel(value: FormState["contextNeed"]) {
  if (!value) return "Not chosen";
  if (value === "short") return "A sentence or short excerpt";
  if (value === "passage") return "Several paragraphs or a page";
  if (value === "long") return "A long document or linked documents";
  return "Context need is not yet known";
}

function reviewCapacityLabel(value: FormState["reviewCapacity"]) {
  if (!value) return "Not chosen";
  if (value === "limited") return "Limited independent checking time";
  if (value === "moderate") return "Moderate checking capacity";
  return "Extensive checking capacity";
}

function adaptationPolicyLabel(value: FormState["adaptationPolicy"]) {
  if (!value) return "Not chosen";
  if (value === "prompt_only") return "Prompting only; no project training";
  if (value === "adaptation_allowed") return "Project adaptation may be compared";
  return "Adaptation policy not yet decided";
}

function sourceFormatLabel(value: FormState["sourceFormat"]) {
  if (!value) return "Not chosen";
  if (value === "clean_text") return "Born-digital or checked text";
  if (value === "ocr_text") return "Text recovered from scans";
  if (value === "page_images") return "Scanned pages or photographs";
  return "A mixture of text and page images";
}

function sourceAccessLabel(value: FormState["sourceAccess"]) {
  if (!value) return "Not chosen";
  if (value === "public") return "Publicly accessible sources";
  if (value === "restricted") return "Restricted-access sources";
  return "Sensitive or protected sources";
}

function corpusScaleLabel(value: FormState["corpusScale"]) {
  if (!value) return "Not chosen";
  if (value === "small") return "Up to about 1,000 items";
  if (value === "medium") return "About 1,000–100,000 items";
  if (value === "large") return "About 100,000–1 million items";
  return "More than about 1 million items";
}

function outputUseLabel(value: FormState["outputUse"]) {
  if (!value) return "Not chosen";
  if (value === "exploration") return "Exploratory research";
  if (value === "publication") return "Publication";
  if (value === "shared") return "Shared dataset or research infrastructure";
  return "Teaching";
}

function opennessLabel(value: FormState["openness"]) {
  if (!value) return "Not chosen";
  if (value === "permissive") return "Permissively licensed models only";
  if (value === "osi_only") return "OSI-defined open-source AI only";
  return "Downloadable weights, followed by a separate licence review";
}

function sustainabilityLabel(value: FormState["sustainability"]) {
  if (!value) return "Not chosen";
  return value === "high" ? "Resource use is a major selection criterion" : "Prefer the smallest adequate setup";
}

function historicalVariationLabel(value: FormState["historicalVariation"]) {
  if (!value) return "Not chosen";
  if (value === "low") return "Little expected variation over time";
  if (value === "moderate") return "Some language or genre change";
  return "Substantial language, spelling or genre change";
}

function labelsAvailableLabel(value: FormState["labelsAvailable"]) {
  if (!value) return "Not chosen";
  if (value === "none") return "No validated examples yet";
  if (value === "small") return "A small set of validated examples";
  return "A substantial set of validated examples";
}

function codebookStatusLabel(value: FormState["codebookStatus"]) {
  if (!value) return "Not chosen";
  if (value === "stable") return "Stable coding guide";
  if (value === "draft") return "Draft coding guide";
  return "No coding guide yet";
}

function codebookContentLabel(value: FormState["codebookContent"]) {
  if (!value) return "Not chosen";
  if (value === "definitions") return "Definitions only";
  if (value === "boundaries") return "Definitions plus inclusion/exclusion boundaries";
  if (value === "examples") return "Definitions plus worked examples";
  return "Definitions, boundaries and positive, negative and borderline examples";
}

function errorPriorityLabel(value: FormState["errorPriority"]) {
  if (!value) return "Not chosen";
  if (value === "recall") return "Missing relevant material is more harmful";
  if (value === "precision") return "Including irrelevant material is more harmful";
  return "Both error types matter similarly";
}

function humanReviewLabel(value: FormState["humanReview"]) {
  if (!value) return "Not chosen";
  if (value === "expert_led") return "Expert-led reference coding";
  if (value === "independent") return "Independent trained coders";
  return "One researcher or coder";
}

function literatureDecisionLabel(value: string) {
  if (value === "integrated") return "Integrated";
  if (value === "already_covered") return "Already covered";
  if (value === "superseded") return "Superseded";
  if (value === "out_of_scope") return "Outside scope";
  return "Background only";
}

function discoveryStreamText(id: string) {
  const labels: Record<string, [string, string]> = {
    "retrieval-embeddings": ["Search by meaning", "Models that may find related passages even when the wording differs."],
    "retrieval-rerankers": ["Reorder search results", "Models that may move the most relevant passages higher in an existing result list."],
    "encoder-backbones": ["Smaller labelling models", "Models that can be trained with human examples for screening, coding or extraction."],
    "span-entity-extraction": ["Find exact names and phrases", "Models designed to mark names, places, dates or other exact source phrases."],
    "sequence-transformations": ["Translate or transform text", "Models for tasks such as translation, normalisation or controlled summarisation."],
    "instruction-models": ["Instruction-following models", "Downloadable generative models that may support contextual coding or bounded interpretation."],
    "document-understanding": ["Read scans and page layout", "Models for pages where handwriting, layout, tables or reading order matter."],
  };
  return labels[id] ?? [id, "A current repository that may deserve inspection."];
}

function displayDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

function getStepComplete(step: StepId, form: FormState) {
  if (step === "project") return Boolean(form.projectTitle && form.researchGoal && form.researchQuestion && form.population && form.outputUse);
  if (step === "sources") return Boolean(form.sourceFormat && form.sourceAccess && form.corpusScale && form.language && form.historicalVariation && form.provenanceStatus && form.traceability);
  if (step === "chain") return form.operations.length > 0 && Boolean(form.contextNeed);
  if (step === "evidence") {
    const coreComplete = Boolean(form.claimDependence && form.constructMode && form.labelsAvailable && form.errorPriority && form.humanReview && form.reviewCoverage && form.reviewCapacity && form.downstreamUse && form.crossModelStrategy);
    const usesCodingGuide = form.operations.some((operation) => ["screening", "annotation"].includes(operation));
    const guideComplete = !usesCodingGuide || Boolean(form.codebookStatus && (form.codebookStatus === "none" || form.codebookContent));
    return coreComplete && guideComplete;
  }
  if (step === "models") return Boolean(form.openness && form.adaptationPolicy);
  return Boolean(form.production && form.hardware && form.sustainability);
}

function reviewSections(form: FormState) {
  return [
    {
      id: "project" as StepId,
      label: "Research goal",
      complete: getStepComplete("project", form),
      answers: [
        ["Working title", form.projectTitle || "Not described"],
        ["Goal", form.researchGoal || "Not described"],
        ["Question", form.researchQuestion || "Not described"],
        ["Possible contribution or conclusion", form.prospectiveClaim || "Open / not yet known"],
        ["Research concerns", form.population || "Not described"],
        ["Intended use", outputUseLabel(form.outputUse)],
      ],
    },
    {
      id: "sources" as StepId,
      label: "Sources and collection",
      complete: getStepComplete("sources", form),
      answers: [
        ["Material", sourceFormatLabel(form.sourceFormat)],
        ["Access", sourceAccessLabel(form.sourceAccess)],
        ["Scale", corpusScaleLabel(form.corpusScale)],
        ["Language", form.language || "Not described"],
        ["Change over time", historicalVariationLabel(form.historicalVariation)],
        ["Source history", provenanceLabel(form.provenanceStatus)],
        ["Link to evidence", traceabilityLabel(form.traceability)],
      ],
    },
    {
      id: "chain" as StepId,
      label: "Research tasks",
      complete: getStepComplete("chain", form),
      answers: [
        ["Tasks", form.operations.length ? form.operations.map(operationLabel).join(" · ") : "Not chosen"],
        ["Context needed", contextNeedLabel(form.contextNeed)],
      ],
    },
    {
      id: "evidence" as StepId,
      label: "Influence and validation",
      complete: getStepComplete("evidence", form),
      answers: [
        ["Influence on conclusions", claimDependenceLabel(form.claimDependence)],
        ["Answer type", answerTypeLabel(form.constructMode)],
        ["Validated examples", labelsAvailableLabel(form.labelsAvailable)],
        ["Coding guide", codebookStatusLabel(form.codebookStatus)],
        ["Guide contents", form.codebookStatus === "none" ? "Not applicable until a guide is developed" : codebookContentLabel(form.codebookContent)],
        ["More harmful error", errorPriorityLabel(form.errorPriority)],
        ["Human reference", humanReviewLabel(form.humanReview)],
        ["Independent checking", `${reviewCoverageLabel(form.reviewCoverage)} · ${reviewCapacityLabel(form.reviewCapacity)}`],
        ["Furthest use", downstreamUseLabel(form.downstreamUse)],
        ["Another-model check", crossModelLabel(form.crossModelStrategy)],
      ],
    },
    {
      id: "models" as StepId,
      label: "Allowed models",
      complete: getStepComplete("models", form),
      answers: [
        ["Openness rule", opennessLabel(form.openness)],
        ["Project adaptation", adaptationPolicyLabel(form.adaptationPolicy)],
      ],
    },
    {
      id: "infrastructure" as StepId,
      label: "Available computing",
      complete: getStepComplete("infrastructure", form),
      answers: [
        ["Run models on", productionLabel(form.production)],
        ["Named environment", form.siteName || "Not named (optional)"],
        ["Largest usual hardware", hardwareLabel(form.hardware)],
        ["Resource-use priority", sustainabilityLabel(form.sustainability)],
      ],
    },
  ];
}

function deriveCandidates(form: FormState): Candidate[] {
  const candidates: Candidate[] = [];
  const has = (operation: string) => form.operations.includes(operation);
  const add = (candidate: Candidate) => {
    if (!candidates.some((existing) => existing.role === candidate.role && existing.name === candidate.name)) candidates.push(candidate);
  };
  const language = form.language.trim().toLowerCase();
  const languageProfile = !language
    ? "unknown"
    : /multilingual|multiple languages|;|\/|\+|\band\b|\ben\b/.test(language)
      ? "multilingual"
      : /dutch|nederlands/.test(language)
        ? "dutch"
        : /english|engels/.test(language)
          ? "english"
          : "language_specific";
  const encoder = languageProfile === "dutch"
    ? MODEL_REGISTRY.candidates.dutchEncoder
    : languageProfile === "english"
      ? MODEL_REGISTRY.candidates.englishEncoder
      : languageProfile === "multilingual"
        ? MODEL_REGISTRY.candidates.multilingualEncoder
        : MODEL_REGISTRY.candidates.languageSpecificEncoder;
  const embedding = languageProfile === "english"
    ? MODEL_REGISTRY.candidates.englishEmbedding
    : ["dutch", "multilingual"].includes(languageProfile)
      ? MODEL_REGISTRY.candidates.multilingualEmbedding
      : MODEL_REGISTRY.candidates.languageSpecificEmbedding;
  const reranker = languageProfile === "english"
    ? MODEL_REGISTRY.candidates.englishReranker
    : MODEL_REGISTRY.candidates.multilingualReranker;

  if (!form.operations.length) return candidates;

  if (["ocr_text", "page_images", "mixed"].includes(form.sourceFormat)) {
    add({ role: "Check the source text and page order", name: MODEL_REGISTRY.candidates.ocrLayout, status: "Baseline", reason: "First check whether scans became accurate text and whether page layout and reading order were preserved.", caution: "Test a varied set of pages. Automatic correction can erase original spelling, uncertainty or layout information." });
    if (["page_images", "mixed"].includes(form.sourceFormat)) {
      add({ role: "Read information from page images", name: MODEL_REGISTRY.candidates.documentVision, status: "Conditional", reason: "Compare an image-reading model only when layout, handwriting or tables contain necessary evidence.", caution: "Use it only when the image itself matters. Check every answer against the original page and measure processing time." });
    }
  }

  if (has("retrieval")) {
    add({ role: "Search by words and spelling variants", name: MODEL_REGISTRY.candidates.lexical, status: "Baseline", reason: "This transparent search provides the comparison needed to show whether meaning-based search adds useful passages.", caution: "Develop words, older spellings and likely text-recognition errors for this collection. A passage not found is not proof that it does not exist." });
    add({ role: "Search by meaning", name: embedding, status: languageProfile === "unknown" ? "Conditional" : "Candidate", reason: "Tests whether related meanings, indirect references and different wording can be found beyond exact word matching.", caution: languageProfile === "unknown" ? "Describe the collection's languages before selecting a model." : "Compare how much relevant text is found, what is found only by this method and how much a person must review." });
    if (["large", "very_large"].includes(form.corpusScale) || ["recall", "precision"].includes(form.errorPriority)) {
      add({ role: "Reorder the first search results", name: reranker, status: languageProfile === "unknown" ? "Conditional" : "Challenger", reason: "A second model may place the most useful passages earlier and reduce reading work in a large collection.", caution: "It cannot recover passages that the first search missed. Test this second stage separately." });
    }
  }

  if ((has("screening") || has("annotation")) && ["manifest", "prescriptive", "mixed"].includes(form.constructMode)) {
    const trainedModelBlocked = form.adaptationPolicy === "prompt_only";
    add({ role: "Smaller model trained for your labels", name: encoder, status: trainedModelBlocked || form.labelsAvailable === "none" || languageProfile === "unknown" ? "Conditional" : "Candidate", reason: "For stable categories, a smaller labelling model may be faster and more consistent than a generative language model.", caution: trainedModelBlocked ? "The selected policy excludes project-specific training. Retain this only as an explicitly out-of-scope comparison or change the policy before development." : form.labelsAvailable === "none" ? "First create a varied set of examples labelled by people." : languageProfile === "unknown" ? "Describe the languages before selecting the model family." : "Keep related documents together when splitting training and test examples. Check every label and source group separately." });
  }

  if (has("extraction")) {
    add({ role: "Extract fixed fields with rules", name: MODEL_REGISTRY.candidates.rulesExtraction, status: "Baseline", reason: "Names, dates and other clearly formatted fields should first be tested with transparent rules and format checks.", caution: "Check both the value and the exact source words. Keep missing or uncertain values visible." });
    if (form.labelsAvailable !== "none") {
      add({ role: "Find names, places and exact source phrases", name: MODEL_REGISTRY.candidates.tokenClassifier, status: languageProfile === "unknown" ? "Conditional" : "Candidate", reason: "A specialised extraction model can mark exact words in the source without writing a free-form answer.", caution: "Create trusted examples marking the exact phrase boundaries and test them in the project's languages and source types." });
    }
  }

  if (has("aggregation")) {
    add({ role: "Count and combine results with ordinary code", name: MODEL_REGISTRY.candidates.deterministicAggregation, status: "Baseline", reason: "Counts, joins and summaries should be repeatable and easy to check.", caution: "Do not use a language model for arithmetic or routine data processing when ordinary code can do it exactly." });
  }

  if (form.constructMode === "plural" || has("interpretation")) {
    add({ role: "Researcher-led interpretation", name: MODEL_REGISTRY.candidates.humanInterpretation, status: "Baseline", reason: "Write the researcher's reading first, then test whether a model can suggest counterevidence, ambiguity or a different reading.", caution: "A model-generated interpretation is a suggestion to examine, not source evidence or the one correct reading." });
  }

  const needsGenerativeComparison = has("annotation") || has("interpretation") || (has("screening") && form.labelsAvailable === "none") || (has("extraction") && form.constructMode !== "manifest");
  if (needsGenerativeComparison) {
    const compactName = ["dutch", "multilingual"].includes(languageProfile) ? MODEL_REGISTRY.candidates.resourceMinimalGenerator : MODEL_REGISTRY.candidates.compactGenerator;
    add({ role: "Smaller instruction-following language model", name: compactName, status: languageProfile === "unknown" ? "Conditional" : "Candidate", reason: "Use this comparison only when rules or smaller labelling models may miss meaning that depends on wider context.", caution: `Check the language, licence, document length and hardware needs of the exact model. A model description is not evidence that it works for your task.${form.contextNeed === "long" ? " Test chunking or retrieval against direct long input because a published context limit does not show that all supplied text is used reliably." : ""}` });

    if (["gpu48", "gpu96", "multi_gpu"].includes(form.hardware) && Number(form.claimDependence) >= 3) {
      add({ role: "Larger local or HPC comparison model", name: MODEL_REGISTRY.candidates.balancedGenerator, status: "Challenger", reason: "Tests whether a larger downloadable model handles difficult cases better enough to justify more computing.", caution: "Measure memory, processing time, storage, energy and quality for the exact downloaded version and memory-saving format." });
    }
    if (["gpu96", "multi_gpu"].includes(form.hardware)) {
      add({ role: "One model from a different family", name: MODEL_REGISTRY.candidates.structuralChallenger, status: "Challenger", reason: "A genuinely different model family helps show whether results depend on one developer or design.", caution: "Choose one carefully checked alternative rather than testing an unlimited list of models." });
    }
  }
  return candidates;
}

function candidateTest(candidate: Candidate, form: FormState) {
  if (candidate.role.includes("source text") || candidate.role.includes("page images")) return "Compare outputs with original pages sampled across periods, layouts and image quality; record text, reading-order and evidence-link errors.";
  if (candidate.role.includes("Search by words")) return "Measure which known relevant passages it finds, which it misses and how the search behaves across periods, spellings and source groups.";
  if (candidate.role.includes("Search by meaning")) return "Show that it adds relevant passages missed by word search without creating an unacceptable reading burden; report results by source group.";
  if (candidate.role.includes("Reorder")) return "Measure whether relevant passages appear earlier in the list; remember that reranking cannot recover anything omitted by the first search.";
  if (candidate.role.includes("trained for your labels")) return "Train only on development examples, then compare per-label errors, robustness and processing cost on untouched human-coded examples.";
  if (candidate.role.includes("Extract fixed") || candidate.role.includes("Find names")) return "Check every field against the exact supporting source span, including missing, uncertain, negated and incorrectly bounded cases.";
  if (candidate.role.includes("Count and combine")) return "Recalculate important totals independently and preserve the code, input versions and automatic checks.";
  if (candidate.role.includes("Researcher-led")) return "Assess whether suggestions reveal useful counterevidence or ambiguity without anchoring the researcher's initial reading or inventing source support.";
  if (candidate.role.includes("instruction-following") || candidate.role.includes("HPC comparison") || candidate.role.includes("different family")) return `Apply the same frozen coding guide and evaluation set; test allowed-label compliance, per-code errors, instruction-order robustness, abstention and human review burden${form.sustainability === "high" ? ", then prefer the least demanding system that meets the quality floor" : ""}.`;
  return "Compare this option with the simplest credible baseline on untouched project examples, and record quality, failures, human effort and computing used.";
}

function deriveMethodRoutes(form: FormState): MethodRoute[] {
  const routes: MethodRoute[] = [];
  const has = (operation: string) => form.operations.includes(operation);

  if (["ocr_text", "page_images", "mixed"].includes(form.sourceFormat) || ["partial", "unknown"].includes(form.provenanceStatus) || ["document", "weak"].includes(form.traceability)) {
    routes.push({
      id: "source",
      task: "Source preparation",
      recommendation: "Document the source history and strengthen links back to the evidence before consequential model use.",
      reason: "Missing material, recognition errors, unstable identifiers and weak source links change what later search and coding systems can see and what a researcher can verify.",
      tests: ["Sample material across periods, source groups, layouts and image quality where relevant.", "Record source origin, known gaps, transformations, document boundaries and stable identifiers.", "Require every consequential output to retain the strongest available document, passage and page link."],
      caution: "A more capable model cannot recover evidence that was lost upstream, and a plausible answer cannot compensate for a broken link to the source.",
      references: [{ label: "Hill & Hengchen", url: "https://doi.org/10.1093/llc/fqz024" }, { label: "Romein et al.", url: "https://doi.org/10.1111/1468-229X.12969" }],
    });
  }

  if (has("retrieval")) {
    routes.push({
      id: "retrieval",
      task: "Passage finding",
      recommendation: "Begin with transparent word search, then test meaning-based search and reranking only for demonstrated additional value.",
      reason: "Retrieval determines which evidence enters the later analysis. Meaning-based models may find paraphrases, while word search provides an inspectable baseline and often remains valuable in a hybrid system.",
      tests: ["Build human relevance judgments that include difficult and period-specific cases.", "Measure missed relevant passages and reading workload separately.", "Compare word-only, meaning-only and combined search across important source groups."],
      caution: "A fluent downstream coder cannot analyse a relevant passage that retrieval failed to supply.",
      references: [{ label: "Blair & Maron", url: "https://doi.org/10.1145/3166.3197" }, { label: "Grossman & Cormack", url: "https://doi.org/10.1145/2063576.2063654" }],
    });
  }

  if (has("screening") || has("annotation")) {
    const plural = form.constructMode === "plural";
    routes.push({
      id: "coding",
      task: plural ? "Plural or interpretive coding" : "Codebook-based coding",
      recommendation: plural
        ? "Keep human interpretation primary; use an instruction-tuned model to propose evidence-linked alternatives rather than force one supposedly correct label."
        : "For direct application of a coding guide, start with an instruction-tuned open-weight model—not its base checkpoint—and compare it with a smaller trained classifier when human examples exist.",
      reason: plural
        ? "Several readings may be warranted, so agreement with one label is not the complete validity target. Model output is a proposition for review."
        : "Instruction tuning is designed to improve response to written tasks and formats. Codebook studies nevertheless show task variation, order sensitivity and invalid labels, so the instruction model is only a candidate measurement instrument.",
      tests: plural
        ? ["Record a researcher reading before model exposure.", "Require source evidence, counterevidence and unresolved ambiguity.", "Evaluate usefulness, distortion and anchoring rather than only label agreement."]
        : ["Stabilise definitions, inclusion and exclusion rules, and difficult examples.", "Test direct codebook prompting before project-specific fine-tuning.", "Evaluate compliance, every code, source groups, paraphrases and label order on untouched human-coded examples.", "If direct prompting remains inadequate, compare lightweight adaptation and a smaller supervised classifier."],
      caution: plural
        ? "Do not treat generated explanations as historical evidence or a faithful window into the model's hidden reasoning."
        : "The word ‘Instruct’ does not establish validity, reliability or transfer to a new language, period, genre or codebook.",
      references: plural
        ? [{ label: "Kommers et al.", url: "https://doi.org/10.3389/frai.2026.1753041" }, { label: "Ngo et al.", url: "https://arxiv.org/abs/2602.18352" }]
        : [{ label: "Wei et al. — instruction tuning", url: "https://arxiv.org/abs/2109.01652" }, { label: "Halterman & Keith — codebook LLMs", url: "https://doi.org/10.1017/pan.2025.10017" }, { label: "Dey et al. — social-science instruction tuning", url: "https://doi.org/10.18653/v1/2024.eacl-short.40" }],
    });
  }

  if (has("extraction")) {
    routes.push({
      id: "extraction",
      task: "Structured extraction",
      recommendation: "Start with rules or a model that marks exact source spans; add an instruction model only when the field depends on wider context.",
      reason: "Extraction must preserve both the value and the source words supporting it. A well-formatted generated answer can still be wrong or unsupported.",
      tests: ["Define each field, allowed missing states and exact evidence requirement.", "Score fields separately and inspect boundary, negation and relation errors.", "Compare against transparent rules and a specialised span model."],
      caution: "Do not accept a structured output merely because it parses correctly.",
      references: [{ label: "Ziems et al.", url: "https://doi.org/10.1162/coli_a_00502" }, { label: "Grimmer & Stewart", url: "https://doi.org/10.1093/pan/mps028" }],
    });
  }

  if (has("aggregation")) {
    routes.push({
      id: "aggregation",
      task: "Counting and aggregation",
      recommendation: "Use recorded R, Python or SQL—not a language model—for arithmetic, joins and reproducible summaries.",
      reason: "Deterministic code is easier to inspect, repeat and test. The uncertainty to carry forward comes from the validated inputs, sampling and statistical model, not from conversational arithmetic.",
      tests: ["Recalculate important totals independently.", "Version input records and transformations.", "Propagate annotation and sampling uncertainty into reported quantities."],
      caution: "Accurate code cannot remove bias already introduced by source selection, retrieval or coding.",
      references: [{ label: "Hopkins & King", url: "https://doi.org/10.1111/j.1540-5907.2009.00428.x" }, { label: "Grimmer & Stewart", url: "https://doi.org/10.1093/pan/mps028" }],
    });
  }

  if (has("interpretation")) {
    routes.push({
      id: "interpretation",
      task: "Interpretive assistance",
      recommendation: "Write the researcher's interpretation first; then, if useful, test a local instruction model as a bounded devil's advocate that proposes counterarguments and questions to pursue.",
      reason: "Interpretation depends on context, standpoint and scholarly warrant. Model counterarguments may broaden attention, but they remain generated artifacts and must be checked manually against the source.",
      tests: ["Compare researcher-first with researcher-first-plus-model conditions.", "Keep the original memo, prompt and model counterarguments as separate records.", "Verify every objection against the cited source and record useful additions, invented support, flattening of ambiguity and anchoring effects.", "Retain disagreement and indeterminacy when they are substantively meaningful."],
      caution: "The model is not an interpretive authority, witness, participant, member checker or independent validator.",
      references: [{ label: "Kommers et al.", url: "https://doi.org/10.3389/frai.2026.1753041" }, { label: "Gillespie — devil's-advocate protocol", url: "https://doi.org/10.1037/qup0000374" }, { label: "Ngo et al.", url: "https://arxiv.org/abs/2602.18352" }],
    });
  }

  return routes;
}

function deriveValidationPlan(form: FormState): ValidationPlan {
  const has = (operation: string) => form.operations.includes(operation);
  const strategies: ValidationStrategy[] = [];
  const reasons: string[] = [];
  const declaredInfluence = Number(form.claimDependence || 0);
  let effectiveInfluence = declaredInfluence;

  if (form.downstreamUse === "reading") effectiveInfluence = Math.max(effectiveInfluence, 2);
  if (form.downstreamUse === "records") effectiveInfluence = Math.max(effectiveInfluence, 3);
  if (form.downstreamUse === "descriptive" || has("aggregation")) effectiveInfluence = Math.max(effectiveInfluence, 4);
  if (["statistical", "interpretive"].includes(form.downstreamUse)) effectiveInfluence = Math.max(effectiveInfluence, 5);
  if (has("retrieval") && form.operations.length > 1) reasons.push("Retrieval can hide evidence from every later task, so reading returned passages does not test what was missed.");
  if (has("aggregation") || ["descriptive", "statistical"].includes(form.downstreamUse)) reasons.push("Item-level errors may be amplified into counts, trends or statistical conclusions.");
  if (has("interpretation") || form.downstreamUse === "interpretive") reasons.push("Model suggestions may redirect attention and interpretation even when they are not copied into the final text.");
  if (["mixed", "plural"].includes(form.constructMode)) reasons.push("Reasonable disagreement or interpretive plurality cannot be reduced to one accuracy score.");
  if (["moderate", "high"].includes(form.historicalVariation)) reasons.push("Language or source conditions vary, so an overall average could hide period- or source-specific failure.");
  if (["partial", "unknown"].includes(form.provenanceStatus)) reasons.push("The source history or transformation record is incomplete, so an apparent model error or pattern may originate upstream.");
  if (["document", "weak"].includes(form.traceability)) reasons.push("Model outputs cannot yet be returned consistently to the strongest available passage or page evidence.");
  if (form.contextNeed === "long") reasons.push("Decisions require long context, so chunking, retrieval and direct long-input routes must be compared rather than trusting an advertised context limit.");
  if (form.reviewCoverage === "uncertain_only") reasons.push("Reviewing only model-flagged uncertainty misses confident errors and requires a separate representative audit.");
  if (form.reviewCoverage === "none" && effectiveInfluence >= 3) reasons.push("Consequential model outputs would enter the analysis without independent checking.");
  if (form.reviewCapacity === "limited" && effectiveInfluence >= 4) reasons.push("Planned checking capacity is limited relative to the influence of model-derived records or interpretations.");

  if (!form.operations.length || !form.claimDependence || !form.downstreamUse) {
    return {
      burden: "Not yet determined",
      influence: "Complete the research tasks, conclusion-influence and downstream-use questions.",
      summary: "The advisor cannot derive a project-specific validation contract until it knows what the model may change and how those outputs will enter the research result.",
      useBoundary: "No validation-based use recommendation yet.",
      reasons,
      strategies,
    };
  }

  const burden: ValidationPlan["burden"] = effectiveInfluence >= 5 ? "Critical" : effectiveInfluence >= 3 ? "High" : "Moderate";
  const influence = effectiveInfluence <= 1
    ? "Support only — model output should not enter the evidential record"
    : effectiveInfluence === 2
      ? "Navigation — model output affects what is considered or read"
      : effectiveInfluence === 3
        ? "Reviewed contribution — model outputs enter part of the analysis after checking"
        : effectiveInfluence === 4
          ? "Research measurement — model-derived records shape reported patterns"
          : "Conclusion shaping — model-derived measurements or interpretations materially support the argument";

  strategies.push({
    id: "foundation",
    title: "Define the validation target and human reference process",
    status: "Core practice",
    rationale: `The project must show that its observations represent the intended construct and intended use. ${answerTypeLabel(form.constructMode)} determines whether one frozen rule or several defensible judgments should be preserved.`,
    actions: [
      "Freeze the unit, context, definitions, inclusion and exclusion rules before the final test.",
      "Create human reference material independently of model exposure and document expertise, calibration and disagreement.",
      "Keep development material separate from untouched evaluation material.",
    ],
    limitation: "Human agreement is evidence about a reference process; it does not by itself establish construct validity.",
    references: [
      { label: "Adcock & Collier — measurement validity", url: "https://doi.org/10.1017/S0003055401003100" },
      { label: "Jacobs & Wallach — constructs and operationalisation", url: "https://doi.org/10.1145/3442188.3445901" },
    ],
  });

  if (["ocr_text", "page_images", "mixed"].includes(form.sourceFormat) || ["partial", "unknown"].includes(form.provenanceStatus) || ["document", "weak"].includes(form.traceability)) {
    strategies.push({
      id: "source-validation",
      title: "Validate source history and evidence links before model behaviour",
      status: "Core practice",
      rationale: "Provenance, text recognition, page order, stable identifiers and evidence links determine what every later operation can see and what a researcher can verify.",
      actions: ["Document source origin, coverage, transformations and known gaps.", "Sample text, reading order and identifiers against original material where available.", "Require consequential outputs to retain the strongest available document, passage and page link."],
      limitation: "Agreement between downstream models cannot show that converted or weakly linked material faithfully represents the source.",
      references: [{ label: "Hill & Hengchen — OCR quality", url: "https://doi.org/10.1093/llc/fqz024" }, { label: "Romein et al. — digital source criticism", url: "https://doi.org/10.1111/1468-229X.12969" }],
    });
  }

  if (has("retrieval") || has("screening")) {
    strategies.push({
      id: "retrieval-validation",
      title: "Test omissions as well as returned material",
      status: "Core practice",
      rationale: `The project prioritises ${form.errorPriority === "recall" ? "avoiding missed material" : form.errorPriority === "precision" ? "avoiding irrelevant returns" : "both missed and irrelevant material"}. Retrieval and screening therefore need a relevance set and a false-negative audit matched to that cost.`,
      actions: ["Create pooled or sampled human relevance judgments, including rejected material.", "Report recall and precision at realistic reading budgets.", "Check results separately across periods, sources, languages and source quality."],
      limitation: "Careful reading of every returned passage does not establish that the system found enough relevant evidence.",
      references: [{ label: "Blair & Maron — retrieval recall", url: "https://doi.org/10.1145/3166.3197" }, { label: "Grossman & Cormack — technology-assisted review", url: "https://doi.org/10.1145/2063576.2063654" }],
    });
  }

  if (has("annotation") || has("screening")) {
    strategies.push({
      id: "coding-validation",
      title: form.constructMode === "plural" ? "Evaluate defensible readings without forcing consensus" : "Evaluate codebook application on untouched examples",
      status: "Core practice",
      rationale: form.constructMode === "plural" ? "Different evidence-linked readings may be substantively meaningful, so agreement is not the only target." : "An instruction-tuned model remains a fallible measurement instrument whose compliance and category errors depend on the project codebook.",
      actions: form.constructMode === "plural"
        ? ["Record independent human readings and preserve warranted disagreement.", "Assess source support, counterevidence, ambiguity and contextual adequacy.", "Do not convert model consensus into a gold interpretation."]
        : ["Use a protected human-coded test set after the coding guide is frozen.", "Report every category's precision, recall and confusions, including rare categories.", "Test prompt wording, code order, repeated runs, model revision and relevant corpus groups."],
      limitation: form.constructMode === "plural" ? "Reliability statistics cannot decide which historically defensible interpretation is correct." : "High average accuracy may conceal construct confusion or a category that fails in one period or source group.",
      references: [{ label: "Halterman & Keith — codebook LLM framework", url: "https://doi.org/10.1017/pan.2025.10017" }, { label: "Röttger et al. — prescriptive and descriptive annotation", url: "https://doi.org/10.18653/v1/2022.naacl-main.13" }],
    });
  }

  if (has("extraction")) {
    strategies.push({
      id: "extraction-validation",
      title: "Verify fields against exact source evidence",
      status: "Core practice",
      rationale: "A well-formed record can still contain an invented, negated, incomplete or incorrectly bounded value.",
      actions: ["Score every field and exact evidence span separately.", "Record missing, uncertain, unsupported and boundary-error rates.", "Compare human-verified and model-derived records in any later summary."],
      limitation: "Valid JSON or agreement between extractors is not proof that a field is supported by the source.",
      references: [{ label: "Ziems et al. — LLMs in computational social science", url: "https://doi.org/10.1162/coli_a_00502" }, { label: "Grimmer & Stewart — problem-specific validation", url: "https://doi.org/10.1093/pan/mps028" }],
    });
  }

  if (has("aggregation") || ["descriptive", "statistical"].includes(form.downstreamUse)) {
    strategies.push({
      id: "downstream-validation",
      title: form.downstreamUse === "statistical" ? "Correct or bound measurement error in downstream inference" : "Stress-test counts, comparisons and trends",
      status: "Conditional practice",
      rationale: "Item-level accuracy does not guarantee unbiased aggregate results. Uneven errors may change the direction or size of the substantive finding.",
      actions: ["Recalculate the intended result with human reference labels and model outputs.", "Test plausible worst-case and stratum-specific errors.", form.downstreamUse === "statistical" ? "Use a probability-sampled human validation set and an appropriate design-based or measurement-error correction." : "Narrow the conclusion when the reported pattern is fragile to remaining errors."],
      limitation: "F1, inter-coder agreement or cross-model consensus alone cannot guarantee unbiased estimates or valid confidence intervals.",
      references: [{ label: "Egami et al. — valid downstream inference", url: "https://arxiv.org/abs/2306.04746" }, { label: "Knox, Lucas & Cho — learned proxies", url: "https://doi.org/10.1146/annurev-polisci-051120-111443" }],
    });
  }

  if (has("interpretation") || form.downstreamUse === "interpretive") {
    strategies.push({
      id: "interpretive-validation",
      title: "Protect researcher-led interpretation and test model influence",
      status: "Conditional practice",
      rationale: "Interpretive adequacy depends on source support, context, plurality and scholarly warrant rather than one gold label.",
      actions: ["Record a researcher-first reading before model exposure.", "If using a devil's-advocate prompt, preserve the original memo and treat every model counterargument as a generated artifact.", "Require exact source support, counterevidence and alternative readings, then verify them manually.", "Audit anchoring, invented context, anachronism and flattening of ambiguity."],
      limitation: "A fluent counterargument or agreement among models cannot establish the uniquely correct historical interpretation, replace member checking or provide independent validation.",
      references: [{ label: "Kommers et al. — computational hermeneutics", url: "https://doi.org/10.3389/frai.2026.1753041" }, { label: "Gillespie — experimental devil's advocate", url: "https://doi.org/10.1037/qup0000374" }, { label: "Röttger et al. — plural judgments", url: "https://doi.org/10.18653/v1/2022.naacl-main.13" }],
    });
  }

  if (form.crossModelStrategy && form.crossModelStrategy !== "none") {
    const variants: Record<Exclude<FormState["crossModelStrategy"], "" | "none">, { title: string; rationale: string; actions: string[]; limitation: string }> = {
      blind: {
        title: "Blind cross-model recoding",
        rationale: "A genuinely different model family can reveal whether results depend on one model lineage.",
        actions: ["Give each model the same frozen source and protocol without showing the other output.", "Review disagreements and a representative sample of agreements with people.", "Report model-specific results rather than only consensus."],
        limitation: "Shared training data and correlated biases mean agreement is robustness evidence, not truth or construct validity.",
      },
      critic: {
        title: "Model criticism of another model's output",
        rationale: "A second model may expose unsupported evidence, missed rules or alternative readings.",
        actions: ["Ask for specific source-grounded objections rather than a general score.", "Keep the critic's output separate from blind recoding.", "Send suggested defects to human and source verification."],
        limitation: "The critic sees the first answer and may be anchored by it; this is diagnostic criticism, not independent replication.",
      },
      union: {
        title: "Multi-model candidate union",
        rationale: "When false negatives are costly, combining independently found passages or records may expand the review pool.",
        actions: ["Combine all candidates rather than majority-voting away minority findings.", "Measure the additional relevant material and human workload.", "Review the union against written relevance or extraction rules."],
        limitation: "A larger candidate pool may improve recall but does not establish completeness, accuracy or interpretive validity.",
      },
      panel: {
        title: "Model panel or model adjudicator",
        rationale: "A panel can prioritize disputed cases when full human review is infeasible.",
        actions: ["Calibrate the panel or adjudicator against independent human decisions.", "Randomize answer order where relevant and test repeat consistency.", "Use the result to prioritize expert review, not replace it."],
        limitation: "LLM judges show position, verbosity, self-preference and reasoning biases and cannot serve as the sole reference.",
      },
    };
    const selected = variants[form.crossModelStrategy];
    strategies.push({
      id: "cross-model",
      title: selected.title,
      status: "Experimental supplement",
      rationale: selected.rationale,
      actions: selected.actions,
      limitation: selected.limitation,
      references: [{ label: "Zheng et al. — LLM-as-a-judge limitations", url: "https://papers.neurips.cc/paper_files/paper/2023/hash/91f18a1287b398d378ef22505bf41832-Abstract-Datasets_and_Benchmarks.html" }, { label: "Ziems et al. — LLMs as multiple labelers", url: "https://doi.org/10.1162/coli_a_00502" }],
    });
  }

  let useBoundary = form.downstreamUse === "reading"
    ? "Potentially suitable for candidate discovery after retrieval coverage and omissions are tested."
    : form.downstreamUse === "records"
      ? "Potentially suitable for producing reviewed records after the relevant component tests pass."
      : form.downstreamUse === "descriptive"
        ? "Not suitable for reporting counts or trends until component errors and conclusion sensitivity are measured."
        : form.downstreamUse === "statistical"
          ? "Not suitable for statistical inference until a probability-sampled human validation design and downstream correction are specified."
          : "Interpretive use must remain researcher-led, source-traceable and explicitly tested for anchoring and alternative readings.";

  const coding = has("annotation") || has("screening");
  if (coding && effectiveInfluence >= 4 && (form.codebookStatus !== "stable" || form.labelsAvailable === "none")) useBoundary = "Exploratory use only: the coding instrument or human reference evidence is not ready to support research conclusions.";
  if (form.reviewCoverage === "none" && effectiveInfluence >= 3) useBoundary = "Do not permit conclusion-supporting use while consequential outputs enter the analysis without independent review.";
  if (form.traceability === "weak" && effectiveInfluence >= 3) useBoundary = "Do not permit conclusion-supporting use until outputs can be traced reliably to the source evidence.";
  if (form.reviewCapacity === "limited" && effectiveInfluence >= 4) useBoundary = "Reduce model influence, narrow the conclusion or increase independent checking capacity before model-derived outputs support reported patterns or interpretations.";

  return {
    burden,
    influence,
    summary: `${burden} validation burden. The plan follows the selected operation chain and the furthest point at which model output may shape the result; it does not validate a model in the abstract.`,
    useBoundary,
    reasons,
    strategies,
  };
}

function deriveCodebookAdvice(form: FormState) {
  if (!form.operations.some((operation) => ["screening", "annotation"].includes(operation))) return null;
  if (form.constructMode === "plural") return {
    title: "Do not force a single-code protocol",
    decision: "Use evidence-linked propositions, counterevidence and explicit ambiguity under researcher authority.",
    readiness: "A plural construct needs a documented interpretation protocol rather than a codebook that hides warranted disagreement.",
    adaptation: "Do not fine-tune merely to make disagreement disappear. First define what a useful alternative reading is and how it will be assessed.",
  };

  const readiness = !form.codebookStatus
    ? "Coding-guide readiness has not been described yet. Complete the evidence section before treating this as a project route."
    : form.codebookStatus === "none"
    ? "No coding guide is ready. Draft and test it with human readers before judging a model."
    : form.codebookStatus === "draft"
      ? "The coding guide is still changing. Use development examples to revise it; do not treat current model scores as final."
      : form.codebookContent === "complete"
        ? "The coding guide is ready for a frozen project comparison, subject to human review and robustness tests."
        : "The coding guide is described as stable, but its category boundaries or examples still need strengthening before a final comparison.";
  const adaptation = form.adaptationPolicy === "prompt_only"
    ? "Project-specific training is outside the selected policy. Develop and test direct codebook prompting, rules and non-generative baselines; revisit the policy only through an explicit methodological decision."
    : !form.labelsAvailable
    ? "The amount of validated human-coded material has not been described, so adaptation readiness cannot yet be assessed."
    : form.codebookStatus === "stable" && form.labelsAvailable === "substantial"
    ? "Project-specific adaptation is eligible for comparison because the guide is stable and a sizeable varied set of validated examples exists. It is not automatically preferred: compare it with direct prompting and a smaller supervised classifier on the same untouched test set."
    : form.labelsAvailable === "none"
      ? "Fine-tuning is premature. First create varied human-coded development and evaluation examples."
      : "Keep direct codebook prompting as the first generative baseline. Consider lightweight adaptation only after the guide is stable and repeated errors remain after prompt and schema repair.";
  return {
    title: "Instruction-tuned first; adaptation only after evidence",
    decision: "Use a downloadable instruction-tuned checkpoint for direct codebook application. Do not begin with the corresponding base checkpoint unless it is a deliberately controlled research comparison.",
    readiness,
    adaptation,
  };
}

function derivePromptPlan(form: FormState) {
  if (!form.operations.length) return { title: "No instruction plan yet", summary: "Choose a research task first. Some tasks should use ordinary code or a smaller labelling model and need no language-model prompt.", variants: ["No prompt needed", "Decision depends on the task"] };
  if (form.operations.length === 1 && form.operations[0] === "aggregation") return { title: "Use ordinary code", summary: "Use recorded code and automatic checks rather than a language-model prompt for counting or combining data.", variants: ["Code with automatic tests", "Compare totals against a second calculation"] };
  if (form.constructMode === "plural") return { title: "Compare more than one supported reading", summary: "Write the researcher's interpretation first. Then ask the model for a different reading, the source words supporting it, evidence against it and remaining uncertainty.", variants: ["Researcher reads first", "Ask for a different interpretation", "Ask for evidence against each reading", "Do not ask the model to pretend to be a historical person"] };
  if (form.operations.includes("annotation") || form.operations.includes("screening")) return { title: "Instructions based on the coding guide", summary: "Use an instruction-tuned checkpoint with exact allowed codes, definitions, inclusion and exclusion rules, and positive, negative and borderline examples. Require source evidence and an uncertainty or abstention state.", variants: ["Direct codebook instruction", "Balanced examples kept outside the final test set", "Check one criterion at a time", "Fixed fields and allowed labels only", "Test label and example order"] };
  if (form.operations.includes("extraction")) return { title: "Instructions based on the extraction schema", summary: "Define each field, allowed missing values and the exact supporting source words. Use an instruction model only for fields that rules or a span model cannot recover reliably.", variants: ["Direct field definitions", "Positive and negative examples", "Fixed output fields", "Unknown and insufficient-context states"] };
  return { title: "Instructions for finding relevant passages", summary: "Ask for possible period-appropriate terms, then judge passages against written relevance rules. A researcher approves every generated search term.", variants: ["Direct instructions without examples", "Add period-specific terms", "Add reviewed examples", "Generate terms that should not count"] };
}

function architectureTitle(form: FormState) {
  if (!form.operations.length) return "No research task selected yet";
  if (form.operations.length === 1 && form.operations[0] === "aggregation") return "Repeatable counting and summaries — no language model needed";
  const parts = [];
  if (["ocr_text", "page_images", "mixed"].includes(form.sourceFormat)) parts.push("check and improve the source text");
  if (form.operations.includes("retrieval")) parts.push("search by words and meaning");
  if (form.operations.some((operation) => ["screening", "annotation"].includes(operation))) parts.push("assign and check labels");
  if (form.operations.includes("extraction")) parts.push("extract fields with source links");
  if (form.operations.includes("interpretation") || form.constructMode === "plural") parts.push("researcher-led interpretation");
  if (form.operations.includes("aggregation")) parts.push("repeatable counting and summaries");
  return parts.join(" + ") || "Comparison matched to the chosen task";
}

function deriveResources(form: FormState) {
  const common = {
    pilot: "A varied sample of 1,000–10,000 items",
    wall: form.contextNeed === "long" ? "Trial realistic long inputs and a chunked/retrieval route before estimating time" : "Measure time on a small trial first",
  };
  if (form.hardware === "gpu96") return { ...common, gpu: "One GPU with 64–96 GB memory", cpu: "Start with 8–24 CPU cores", ram: "Start with 96–256 GB", scratch: "Estimate from model, source files and outputs" };
  if (form.hardware === "multi_gpu") return { ...common, gpu: "Two or more GPUs; verify local limits", cpu: "Start with 16–32 CPU cores", ram: "Start with 128–512 GB", scratch: "Estimate from model, source files and outputs" };
  if (form.hardware === "gpu48") return { ...common, gpu: "One GPU with 32–48 GB memory", cpu: "Start with 8–16 CPU cores", ram: "Start with 64–192 GB", scratch: "Estimate from model, source files and outputs" };
  if (form.hardware === "gpu24") return { ...common, gpu: "One GPU with up to 24 GB memory", cpu: "Start with 4–12 CPU cores", ram: "Start with 32–96 GB", scratch: "Estimate from model, source files and outputs" };
  if (form.hardware === "laptop") return { ...common, gpu: "CPU or built-in graphics processor", cpu: "Use the available 4–16 CPU cores", ram: "Usually 16–64 GB", scratch: "Use available local storage; keep a safety margin" };
  return { ...common, gpu: "Unknown — identify this before choosing a model size", cpu: "Measure during the trial", ram: "Measure during the trial", scratch: "Estimate after a small source and model trial" };
}

function markdownReport(form: FormState, candidates: Candidate[], routes: MethodRoute[], validation: ValidationPlan, codebook: ReturnType<typeof deriveCodebookAdvice>, prompt: ReturnType<typeof derivePromptPlan>, resources: ReturnType<typeof deriveResources>) {
  return `# LLM Methods Compass advisory report

Status: planning_suggestion_only

## Project

- Title: ${form.projectTitle || "Undecided"}
- Research goal: ${form.researchGoal || "Undecided"}
- Question: ${form.researchQuestion || "Undecided"}
- Possible contribution or conclusion: ${form.prospectiveClaim || "Open / not yet known"}
- People, texts, institutions, places, periods or events concerned: ${form.population || "Undecided"}
- Intended use: ${outputUseLabel(form.outputUse)}
- Source material: ${sourceFormatLabel(form.sourceFormat)}
- Source access: ${sourceAccessLabel(form.sourceAccess)}
- Collection scale: ${corpusScaleLabel(form.corpusScale)}
- Language: ${form.language || "Undecided"}
- Historical language/genre variation: ${historicalVariationLabel(form.historicalVariation)}
- Source provenance: ${provenanceLabel(form.provenanceStatus)}
- Evidence traceability: ${traceabilityLabel(form.traceability)}
- Tasks: ${form.operations.map(operationLabel).join(" → ") || "Undecided"}
- Context normally needed: ${contextNeedLabel(form.contextNeed)}
- Influence on conclusions: ${claimDependenceLabel(form.claimDependence)}
- Validated examples: ${labelsAvailableLabel(form.labelsAvailable)}
- Coding guide: ${codebookStatusLabel(form.codebookStatus)}
- Coding-guide contents: ${form.codebookStatus === "none" ? "Not applicable until a guide is developed" : codebookContentLabel(form.codebookContent)}
- Error priority: ${errorPriorityLabel(form.errorPriority)}
- Human reference process: ${humanReviewLabel(form.humanReview)}
- Furthest downstream use: ${downstreamUseLabel(form.downstreamUse)}
- Independent review coverage: ${reviewCoverageLabel(form.reviewCoverage)}
- Available review capacity: ${reviewCapacityLabel(form.reviewCapacity)}
- Cross-model corroboration: ${crossModelLabel(form.crossModelStrategy)}
- What counts as a good answer: ${answerTypeLabel(form.constructMode)}
- Model openness rule: ${opennessLabel(form.openness)}
- Where models may run: ${productionLabel(form.production)}
- Named computing environment: ${form.siteName || "Not named (optional)"}
- Project adaptation: ${adaptationPolicyLabel(form.adaptationPolicy)}
- Largest usual hardware: ${hardwareLabel(form.hardware)}
- Resource-use priority: ${sustainabilityLabel(form.sustainability)}

## Why each methodological route is suggested

${routes.map((route) => `### ${route.task}\n\n**Advice:** ${route.recommendation}\n\n**Why:** ${route.reason}\n\n**Required comparison:**\n${route.tests.map((item) => `- ${item}`).join("\n")}\n\n**Limit:** ${route.caution}\n\nSources: ${route.references.map((reference) => `[${reference.label}](${reference.url})`).join("; ")}`).join("\n\n") || "Choose research tasks to generate task-specific routes."}

## Project-conditioned validation contract

- Validation burden: ${validation.burden}
- Epistemic influence: ${validation.influence}
- Permitted-use boundary: ${validation.useBoundary}

${validation.reasons.length ? `Why this burden applies:\n${validation.reasons.map((reason) => `- ${reason}`).join("\n")}` : "Complete the influence questions to generate project-specific reasons."}

${validation.strategies.map((strategy) => `### ${strategy.title}\n\n**Evidence status:** ${strategy.status}\n\n${strategy.rationale}\n\nRequired work:\n${strategy.actions.map((action) => `- ${action}`).join("\n")}\n\n**What this cannot establish:** ${strategy.limitation}\n\nSources: ${strategy.references.map((reference) => `[${reference.label}](${reference.url})`).join("; ")}`).join("\n\n") || "No validation strategies generated yet."}

${codebook ? `## Codebook-model decision\n\n**${codebook.title}.** ${codebook.decision}\n\n- Readiness: ${codebook.readiness}\n- Adaptation: ${codebook.adaptation}\n- Recommended fields: exact code, exact source evidence, short decision note, uncertainty/abstention flag, and human-review flag.\n- A generated decision note is an audit aid, not hidden chain-of-thought or proof that the answer is correct. A self-reported confidence number is not a calibrated probability unless tested against held-out human judgments.\n` : ""}

## Candidate portfolio

${candidates.map((c) => `- **${c.role}: ${c.name}** — ${c.reason} Evidence needed: ${candidateTest(c, form)} Caution: ${c.caution}`).join("\n")}

## Provisional model candidates

- Updated: ${MODEL_DISCOVERY.generatedAt}
- Status: ${PROVISIONAL_MODEL_CATEGORY.evidenceStatus}
- Decision: ${PROVISIONAL_MODEL_CATEGORY.decision}
- Boundary: this review has not established sufficient task-relevant published evidence or project testing for promotion into the curated recommendations

${MODEL_DISCOVERY.streams.map((stream) => `### ${stream.label}\n\n${stream.candidates.map((candidate) => `- ${candidate.id} @ ${candidate.revision} — declared license: ${candidate.license}; ${candidate.url}`).join("\n")}`).join("\n\n")}

## Monthly literature screening queue

- Updated: ${LITERATURE_DISCOVERY.generatedAt}
- Appraisal status: ${LITERATURE_REVIEW.reviewedDiscoveryGeneratedAt !== LITERATURE_DISCOVERY.generatedAt ? "new discovery snapshot awaiting review" : String(LITERATURE_REVIEW.confirmationStatus) === "researcher_confirmed" ? `all ${LITERATURE_REVIEW.decisions.length} leads researcher-confirmed on ${LITERATURE_REVIEW.confirmedAt || LITERATURE_REVIEW.reviewedAt}` : `all ${LITERATURE_REVIEW.decisions.length} leads provisionally appraised on ${LITERATURE_REVIEW.reviewedAt}; researcher confirmation required before publication`}
- Boundary: metadata discovery alone cannot change the advice

### Logged appraisal decisions

${LITERATURE_REVIEW.decisions.map((decision) => { const candidate = LITERATURE_DISCOVERY.candidates.find((item) => item.id === decision.id); return `- **${literatureDecisionLabel(decision.status)} — ${candidate?.title ?? decision.id}.** ${decision.reason}`; }).join("\n")}

### Discovery metadata

${LITERATURE_DISCOVERY.candidates.map((candidate) => `- [${candidate.title}](${candidate.url}) — ${candidate.authors.join(", ") || "authors unavailable"}; ${candidate.published || "date unavailable"}; ${candidate.venue}`).join("\n")}

## Prompt strategy

**${prompt.title}.** ${prompt.summary}

Compare the variants as documented instrument configurations rather than assuming that a longer, more theoretical or persona-based prompt is better. Scholarly basis: [Liu et al. — prompting survey](https://doi.org/10.1145/3560815); [Than et al. — qualitative coding workflow](https://doi.org/10.1177/00491241251339188); [Pichler and Pagel — theory-prompt variability](https://doi.org/10.18653/v1/2026.latechclfl-1.27).

## Formula-only resource pilot

- GPU: ${resources.gpu}
- CPU: ${resources.cpu}
- RAM: ${resources.ram}
- Storage: ${resources.scratch}
- Pilot: ${resources.pilot}; ${resources.wall}

No corpus analysis or model execution was performed by this advisory dashboard.
`;
}

function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = name;
  link.click();
  URL.revokeObjectURL(href);
}

export default function Home() {
  const [view, setView] = useState<View>("workspace");
  const [activeStep, setActiveStep] = useState<StepId>("project");
  const [form, setForm] = useState<FormState>(blankState);
  const [notice, setNotice] = useState("Blank questionnaire ready");
  const [savedAt, setSavedAt] = useState("");

  useEffect(() => {
    const restoreDraft = window.setTimeout(() => {
      const saved = window.localStorage.getItem("llm-methods-compass-draft-v1") ?? window.localStorage.getItem("method-chain-draft-v6");
      if (saved) {
        try { setForm({ ...blankState, ...JSON.parse(saved) }); setNotice("Local draft restored"); }
        catch { window.localStorage.removeItem("llm-methods-compass-draft-v1"); }
      }
    }, 0);
    return () => window.clearTimeout(restoreDraft);
  }, []);

  const candidates = useMemo(() => deriveCandidates(form), [form]);
  const methodRoutes = useMemo(() => deriveMethodRoutes(form), [form]);
  const validationPlan = useMemo(() => deriveValidationPlan(form), [form]);
  const codebookAdvice = useMemo(() => deriveCodebookAdvice(form), [form]);
  const promptPlan = useMemo(() => derivePromptPlan(form), [form]);
  const resources = useMemo(() => deriveResources(form), [form]);
  const answerReview = useMemo(() => reviewSections(form), [form]);
  const literatureReviewCurrent = LITERATURE_REVIEW.reviewedDiscoveryGeneratedAt === LITERATURE_DISCOVERY.generatedAt;
  const literatureReviewConfirmed = String(LITERATURE_REVIEW.confirmationStatus) === "researcher_confirmed";
  const literatureReviewCounts = LITERATURE_REVIEW.decisions.reduce<Record<string, number>>((counts, decision) => ({ ...counts, [decision.status]: (counts[decision.status] ?? 0) + 1 }), {});
  const completedSteps = steps.filter((step) => getStepComplete(step.id, form)).length;
  const allCoreComplete = completedSteps === steps.length;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => { setForm((current) => ({ ...current, [key]: value })); setNotice("Unsaved local changes"); };
  const toggleOperation = (operation: string) => update("operations", form.operations.includes(operation) ? form.operations.filter((item) => item !== operation) : [...form.operations, operation]);
  const saveDraft = () => { window.localStorage.setItem("llm-methods-compass-draft-v1", JSON.stringify(form)); setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })); setNotice("Saved on this device"); };
  const loadExemplar = () => { setForm(exemplarState); setSavedAt(""); setNotice("Example project loaded"); setActiveStep("project"); setView("workspace"); };
  const resetQuestionnaire = () => { window.localStorage.removeItem("llm-methods-compass-draft-v1"); window.localStorage.removeItem("method-chain-draft-v6"); setForm(blankState); setSavedAt(""); setNotice("Blank questionnaire ready"); setActiveStep("project"); setView("workspace"); };
  const exportJson = () => downloadFile("llm-methods-compass-advisory.json", JSON.stringify({ schema_version: "0.6", generated_at: new Date().toISOString(), recommendation_status: "planning_suggestion_only", registry_snapshot: MODEL_REGISTRY.snapshotDate, model_discovery_snapshot: MODEL_DISCOVERY, literature_discovery_snapshot: LITERATURE_DISCOVERY, literature_review_log: LITERATURE_REVIEW, curated_literature_reviewed: LITERATURE_REVIEW_DATE, project: form, methodological_routes: methodRoutes, validation_plan: validationPlan, codebook_advice: codebookAdvice, candidates: candidates.map((candidate) => ({ ...candidate, evidence_needed: candidateTest(candidate, form) })), prompt_plan: promptPlan, resource_pilot: resources, prohibited_action: "No corpus, model, or HPC execution by dashboard" }, null, 2), "application/json");
  const exportMarkdown = () => downloadFile("llm-methods-compass-advisory.md", markdownReport(form, candidates, methodRoutes, validationPlan, codebookAdvice, promptPlan, resources), "text/markdown");
  const nextStep = () => { const current = steps.findIndex((step) => step.id === activeStep); if (current < steps.length - 1) setActiveStep(steps[current + 1].id); else setView("review"); };
  const previousStep = () => { const current = steps.findIndex((step) => step.id === activeStep); if (current > 0) setActiveStep(steps[current - 1].id); };
  const editStep = (step: StepId) => { setActiveStep(step); setView("workspace"); };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup"><div className="brand-mark" aria-hidden="true">LLM</div><div><p className="brand-title">LLM Methods Compass</p><p className="brand-subtitle">Qualitative text research advisor</p></div></div>
        <div className="project-switcher"><span className="micro-label">Current workspace</span><strong>{form.projectTitle || "Untitled research project"}</strong><span>{notice}{savedAt ? ` · ${savedAt}` : ""}</span></div>
        <nav className="step-nav" aria-label="Questionnaire sections">
          <p className="nav-heading">Research intake</p>
          {steps.map((step) => {
            const complete = getStepComplete(step.id, form);
            const current = activeStep === step.id && view === "workspace";
            return <button className={`step-link ${current ? "active" : ""}`} key={step.id} aria-current={current ? "step" : undefined} aria-label={`${step.label}, ${complete ? "completed" : "not completed"}`} onClick={() => { setActiveStep(step.id); setView("workspace"); }}><span className="step-number">{complete ? "✓" : step.eyebrow}</span><span>{step.label}</span></button>;
          })}
        </nav>
        <div className="sidebar-note"><span className="advisory-dot" aria-hidden="true" /><div><strong>Advice, not execution</strong><p>The dashboard does not receive your sources or run a model.</p></div></div>
        <div className="registry-freshness"><span>Monthly evidence checks</span><strong>Models · {displayDate(MODEL_DISCOVERY.generatedAt)}</strong><strong>Literature · {displayDate(LITERATURE_DISCOVERY.generatedAt)}</strong><small>Metadata leads; human review required</small></div>
        <div className="sidebar-actions"><button className="text-button" title="Fills the generic questionnaire with one worked case; it does not change the advisory rules" onClick={loadExemplar}>Load example</button><button className="text-button" onClick={resetQuestionnaire}>Start blank</button></div>
      </aside>

      <main className="main-shell">
        <header className="topbar">
          <nav className="view-tabs" aria-label="Dashboard views">
            {([ ["workspace", "Your project"], ["review", "Review answers"], ["map", "How advice is made"], ["recommendation", "Advice"], ["registry", "Model options"], ["evidence", "Terms & evidence"] ] as [View, string][]).map(([id, label]) => <button key={id} className={view === id ? "active" : ""} onClick={() => setView(id)}>{label}</button>)}
          </nav>
          <div className="top-actions"><span className="text-scope-chip">Qualitative text analysis only</span><button className="secondary-button" onClick={saveDraft}>Save draft</button><button className="primary-button" onClick={() => setView(view === "review" ? "recommendation" : "review")}>{view === "review" ? (allCoreComplete ? "Generate advice" : "View provisional advice") : "Review answers"} <span aria-hidden="true">→</span></button></div>
        </header>

        {view === "workspace" ? (
          <div className="content workspace-view">
            <section className="page-intro">
              <div><p className="eyebrow">Project questionnaire · Part {steps.findIndex((s) => s.id === activeStep) + 1} of {steps.length}</p><h1>{steps.find((step) => step.id === activeStep)?.label}</h1><p className="intro-copy">Begin with the research problem. Model options come later, after the sources, tasks, checking needs and available computing are clear. Allow about 10–15 minutes; no source text is uploaded.</p></div>
              <div className="completion-card" aria-label={`${completedSteps} of ${steps.length} sections described`}><span className="completion-value">{completedSteps}/{steps.length}</span><span>sections described</span><div className="completion-track"><span style={{ width: `${(completedSteps / steps.length) * 100}%` }} /></div></div>
            </section>

            {activeStep === "project" ? <section className="scope-intro"><div><span className="scope-kicker">What this advisor covers</span><h2>LLM advice for qualitative analysis of textual sources</h2><p>This advisor concerns written or transcribed text. It does not advise on qualitative analysis of audio, video, photographs or other image content. Scanned document pages may be considered only to recover or verify their text and layout.</p></div><ul><li>Textual research material only</li><li>Downloadable models on your computer or institutional HPC</li><li>No proprietary models or commercial AI APIs</li></ul></section> : null}

            <div className="workspace-grid">
              <section className="form-panel">
                {activeStep === "project" ? (
                  <div className="form-section">
                    <div className="section-callout"><span>Why this matters</span><p>Your research goal and question determine what the system may help with. A possible conclusion is useful when already known, but it is not required for exploratory or interpretive research.</p></div>
                    <label><FieldLabel>Working title</FieldLabel><input value={form.projectTitle} onChange={(event) => update("projectTitle", event.target.value)} placeholder="Give this methodological case a clear name" /></label>
                    <label><FieldLabel>Research goal</FieldLabel><textarea rows={4} value={form.researchGoal} onChange={(event) => update("researchGoal", event.target.value)} placeholder="What do you want to understand, explore, describe, compare or explain?" /></label>
                    <label><FieldLabel>Research question</FieldLabel><textarea rows={4} value={form.researchQuestion} onChange={(event) => update("researchQuestion", event.target.value)} placeholder="State the historical or social-scientific question, without choosing a model yet" /></label>
                    <label><FieldLabel help="claim">Expected contribution or possible conclusion <span className="optional-label">optional</span></FieldLabel><textarea rows={4} value={form.prospectiveClaim} onChange={(event) => update("prospectiveClaim", event.target.value)} placeholder="If already known, what kind of contribution or conclusion might the research support?" /></label>
                    <label><FieldLabel help="population">Who or what does the research concern?</FieldLabel><textarea rows={3} value={form.population} onChange={(event) => update("population", event.target.value)} placeholder="Which people, texts, institutions, places, periods or events does it concern?" /></label>
                    <div className="segmented-field"><FieldLabel>How will the result be used?</FieldLabel><div className="segmented-options">{(["exploration", "publication", "shared", "teaching"] as const).map((value) => <button key={value} className={form.outputUse === value ? "selected" : ""} onClick={() => update("outputUse", value)}>{value === "shared" ? "Shared dataset" : value}</button>)}</div></div>
                  </div>
                ) : null}

                {activeStep === "sources" ? (
                  <div className="form-section">
                    <div className="section-callout"><span>Why this matters</span><p>Missing pages, poor scans and text-recognition errors can be mistaken for patterns in the sources.</p></div>
                    <div className="field-grid two">
                      <label><FieldLabel help="sourceFormat">Current source format</FieldLabel><select value={form.sourceFormat} onChange={(event) => update("sourceFormat", event.target.value as FormState["sourceFormat"])}><option value="">Choose a format…</option><option value="clean_text">Reliable digital text</option><option value="ocr_text">Text made from scans (OCR)</option><option value="page_images">Scanned pages or handwriting</option><option value="mixed">A mixture of these</option></select></label>
                      <label><FieldLabel help="access">Who may access the material?</FieldLabel><select value={form.sourceAccess} onChange={(event) => update("sourceAccess", event.target.value as FormState["sourceAccess"])}><option value="">Choose an access level…</option><option value="public">Anyone — public material</option><option value="restricted">Approved users only</option><option value="sensitive">Sensitive or personal material</option></select></label>
                      <label><FieldLabel help="scale">Collection size</FieldLabel><select value={form.corpusScale} onChange={(event) => update("corpusScale", event.target.value as FormState["corpusScale"])}><option value="">Choose a size…</option><option value="small">Under 10,000 items</option><option value="medium">10,000–100,000 items</option><option value="large">100,000–1 million items</option><option value="very_large">More than 1 million items</option></select></label>
                      <label><FieldLabel help="language">Language(s)</FieldLabel><input value={form.language} onChange={(event) => update("language", event.target.value)} placeholder="For example: English; Arabic; multilingual" /></label>
                      <label><FieldLabel help="provenance">How well is the source history documented?</FieldLabel><select value={form.provenanceStatus} onChange={(event) => update("provenanceStatus", event.target.value as FormState["provenanceStatus"])}><option value="">Choose a provenance status…</option><option value="documented">Origin, gaps and transformations are documented</option><option value="partial">Some information is documented</option><option value="unknown">Unknown or not documented yet</option></select></label>
                      <label><FieldLabel help="traceability">Can outputs be linked back to the source?</FieldLabel><select value={form.traceability} onChange={(event) => update("traceability", event.target.value as FormState["traceability"])}><option value="">Choose a traceability level…</option><option value="span_page">Yes — exact passage or page</option><option value="document">Document only</option><option value="weak">Not reliably yet</option></select></label>
                    </div>
                    <div className="segmented-field"><FieldLabel>How much does language vary across the collection?</FieldLabel><div className="segmented-options">{(["low", "moderate", "high"] as const).map((value) => <button key={value} className={form.historicalVariation === value ? "selected" : ""} onClick={() => update("historicalVariation", value)}>{value}</button>)}</div></div>
                    <div className="audit-card"><span className="audit-index">A</span><div><strong>Before testing models</strong><p>Record where the sources came from, what is missing, how pages and documents are linked, which changes were made to the text, and whether identifiers remain stable.</p></div></div>
                  </div>
                ) : null}

                {activeStep === "chain" ? (
                  <div className="form-section">
                    <div className="section-callout"><span>Why this matters</span><p>Finding passages, assigning labels and summarising results are different jobs. They may need different methods and separate tests.</p></div>
                    <fieldset><legend><FieldLabel help="operation">Which tasks should the workflow perform?</FieldLabel></legend><div className="operation-grid">{operations.map(([id, label], index) => <label className={`operation-card ${form.operations.includes(id) ? "checked" : ""}`} key={id}><input type="checkbox" checked={form.operations.includes(id)} onChange={() => toggleOperation(id)} /><span className="operation-number">{String(index + 1).padStart(2, "0")}</span><strong>{label}</strong><span>{id === "aggregation" ? "Ordinary code is usually best" : "Test this task separately"}</span></label>)}</div></fieldset>
                    <label className="single-field context-field"><FieldLabel help="contextNeed">How much text is normally needed for one sound decision?</FieldLabel><select value={form.contextNeed} onChange={(event) => update("contextNeed", event.target.value as FormState["contextNeed"])}><option value="">Choose a typical context need…</option><option value="short">A sentence or short excerpt</option><option value="passage">Several paragraphs or a page</option><option value="long">A long document or linked documents</option><option value="unknown">Not known yet</option></select></label>
                    <div className="chain-preview" aria-label="Selected research tasks">{form.operations.length ? form.operations.map((item, index) => <div className="chain-item" key={item}><span>{operationLabel(item)}</span>{index < form.operations.length - 1 ? <b aria-hidden="true">→</b> : null}</div>) : <p>Select at least one task.</p>}</div>
                  </div>
                ) : null}

                {activeStep === "evidence" ? (
                  <div className="form-section">
                    <div className="section-callout"><span>Why this matters</span><p>Validation follows what the model can change: the evidence a researcher sees, the records produced, the patterns reported or the interpretation advanced. One general accuracy score is not enough.</p></div>
                    <label><FieldLabel help="dependence">How strongly could model-generated results affect the project’s conclusions?</FieldLabel><select value={form.claimDependence} onChange={(event) => update("claimDependence", event.target.value as FormState["claimDependence"])}><option value="">Choose a level…</option><option value="1">1 — support only; output does not enter the evidence</option><option value="2">2 — affects what is considered or read</option><option value="3">3 — reviewed outputs enter part of the analysis</option><option value="4">4 — model-derived measurements shape findings</option><option value="5">5 — model-derived analysis is central to the conclusions</option></select></label>
                    <div className="field-grid two">
                      <label><FieldLabel help="downstream">What is the furthest point model output will reach?</FieldLabel><select value={form.downstreamUse} onChange={(event) => update("downstreamUse", event.target.value as FormState["downstreamUse"])}><option value="">Choose a downstream use…</option><option value="reading">Candidate material for human reading</option><option value="records">Coded records or a structured dataset</option><option value="descriptive">Counts, comparisons or trends</option><option value="statistical">Statistical or causal analysis</option><option value="interpretive">Interpretation or the central argument</option></select></label>
                      <label><FieldLabel help="reviewCoverage">Which outputs will be independently checked?</FieldLabel><select value={form.reviewCoverage} onChange={(event) => update("reviewCoverage", event.target.value as FormState["reviewCoverage"])}><option value="">Choose review coverage…</option><option value="all_independent">Every consequential output</option><option value="sample_uncertain">A representative sample plus uncertain cases</option><option value="uncertain_only">Only outputs flagged as uncertain</option><option value="none">No independent output review planned</option></select></label>
                      <label><FieldLabel help="reviewCapacity">How much independent checking is realistically available?</FieldLabel><select value={form.reviewCapacity} onChange={(event) => update("reviewCapacity", event.target.value as FormState["reviewCapacity"])}><option value="">Choose available checking capacity…</option><option value="limited">Limited — only a small sample is feasible</option><option value="moderate">Moderate — a planned sample and difficult cases</option><option value="extensive">Extensive — broad or full review is feasible</option></select></label>
                      <label><FieldLabel help="construct">What counts as a good answer?</FieldLabel><select value={form.constructMode} onChange={(event) => update("constructMode", event.target.value as FormState["constructMode"])}><option value="">Choose an answer type…</option><option value="manifest">One answer can usually be checked directly</option><option value="prescriptive">One answer follows a written coding guide</option><option value="mixed">Some answers are fixed; others allow interpretation</option><option value="plural">Several interpretations may be defensible</option></select></label>
                      <label><FieldLabel help="labels">Examples already coded by people</FieldLabel><select value={form.labelsAvailable} onChange={(event) => update("labelsAvailable", event.target.value as FormState["labelsAvailable"])}><option value="">Choose an amount…</option><option value="none">None yet</option><option value="small">A small set</option><option value="substantial">A sizeable, varied set</option></select></label>
                      <label><FieldLabel help="errors">Which error matters most?</FieldLabel><select value={form.errorPriority} onChange={(event) => update("errorPriority", event.target.value as FormState["errorPriority"])}><option value="">Choose an error priority…</option><option value="recall">Missing relevant material</option><option value="balanced">Both errors matter equally</option><option value="precision">Including irrelevant material</option></select></label>
                      <label><FieldLabel help="human">Who will check the system?</FieldLabel><select value={form.humanReview} onChange={(event) => update("humanReview", event.target.value as FormState["humanReview"])}><option value="">Choose a review arrangement…</option><option value="single">One trained reader</option><option value="independent">Two readers working independently</option><option value="expert_led">Two readers plus expert review of difficult cases</option></select></label>
                    </div>
                    {form.operations.some((operation) => ["screening", "annotation"].includes(operation)) ? <div className="codebook-input"><div className="field-grid two"><label><FieldLabel help="codebook">Coding guide status</FieldLabel><select value={form.codebookStatus} onChange={(event) => update("codebookStatus", event.target.value as FormState["codebookStatus"])}><option value="">Choose a status…</option><option value="none">None yet</option><option value="draft">Draft — still being revised</option><option value="stable">Stable enough for a project test</option></select></label>{form.codebookStatus && form.codebookStatus !== "none" ? <label><FieldLabel help="codebookContent">What does each code currently include?</FieldLabel><select value={form.codebookContent} onChange={(event) => update("codebookContent", event.target.value as FormState["codebookContent"])}><option value="">Choose the current contents…</option><option value="definitions">Label and definition only</option><option value="boundaries">Definitions plus inclusion and exclusion rules</option><option value="examples">Definitions plus examples</option><option value="complete">Definitions, boundaries, and positive, negative and borderline examples</option></select></label> : null}</div><p>A coding guide is part of the research instrument. The advice will distinguish prompt development from project-specific model adaptation.</p></div> : null}
                    <label><FieldLabel help="crossModel">Should another LLM be used as an experimental cross-check?</FieldLabel><select value={form.crossModelStrategy} onChange={(event) => update("crossModelStrategy", event.target.value as FormState["crossModelStrategy"])}><option value="">Choose whether to use a cross-model check…</option><option value="none">No cross-model check</option><option value="blind">Blind recoding by a different model family</option><option value="critic">A second model critiques the first output</option><option value="union">Combine candidates from several models</option><option value="panel">A model panel or model adjudicator</option></select></label>
                    {form.crossModelStrategy && form.crossModelStrategy !== "none" ? <div className="experimental-note"><strong>Experimental supplement</strong><p>Use this to find instability or prioritize human review. Agreement between models is not independent validation and cannot replace human reference material or source checking.</p></div> : null}
                    <div className="evidence-floor-grid"><div><span>Validation burden</span><strong>{validationPlan.burden}</strong><p>{validationPlan.burden === "Not yet determined" ? "Complete the influence questions." : validationPlan.influence}</p></div><div><span>Independent review</span><strong>{reviewCoverageLabel(form.reviewCoverage)}</strong><p>Also audit material the model omitted or confidently misclassified.</p></div><div><span>Downstream use</span><strong>{downstreamUseLabel(form.downstreamUse)}</strong><p>The advice will test whether remaining errors change the substantive result.</p></div></div>
                  </div>
                ) : null}

                {activeStep === "models" ? (
                  <div className="form-section">
                    <div className="section-callout"><span>Fixed scope</span><p>This advisor considers downloadable models that run on your own computer or an institutional cluster. Proprietary models and commercial AI APIs are outside scope.</p></div>
                    <div className="field-grid two"><label><FieldLabel help="openness">Which open-model rule should apply?</FieldLabel><select value={form.openness} onChange={(event) => update("openness", event.target.value as FormState["openness"])}><option value="">Choose an openness rule…</option><option value="open_weight_review">Downloadable model files + separate licence check</option><option value="permissive">Only models with a permissive licence</option><option value="osi_only">Only models meeting the OSI open-source definition</option></select></label><label><FieldLabel help="adaptation">May a model be trained further on project examples?</FieldLabel><select value={form.adaptationPolicy} onChange={(event) => update("adaptationPolicy", event.target.value as FormState["adaptationPolicy"])}><option value="">Choose an adaptation rule…</option><option value="prompt_only">No — prompting and existing models only</option><option value="adaptation_allowed">Yes — adaptation may be compared if justified</option><option value="undecided">Not decided yet</option></select></label></div>
                    <div className="gate-list"><div><span className="gate-icon pass">✓</span><p><strong>Downloadable:</strong> the exact model files can be saved and run under your control.</p></div><div><span className="gate-icon pass">✓</span><p><strong>Permitted:</strong> the licence allows the intended research use and any planned adaptation.</p></div><div><span className="gate-icon pass">✓</span><p><strong>Reproducible:</strong> the exact version and software settings can be recorded.</p></div><div><span className="gate-icon wait">!</span><p><strong>Suitable:</strong> language and task quality still need to be tested on your own material.</p></div></div>
                    <p className="small-note">The model and research-literature watchlists are refreshed monthly. Newly found items are suggestions to inspect, never automatic model recommendations or automatic changes to the method.</p>
                  </div>
                ) : null}

                {activeStep === "infrastructure" ? (
                  <div className="form-section">
                    <div className="section-callout"><span>Why this matters</span><p>Model size alone cannot predict memory, speed or storage. The final request should be based on a small trial using the actual model and typical texts.</p></div>
                    <div className="field-grid two">
                      <label><FieldLabel help="production">Where will the model run?</FieldLabel><select value={form.production} onChange={(event) => update("production", event.target.value as FormState["production"])}><option value="">Choose a location…</option><option value="local">My own computer only</option><option value="hpc">An institutional HPC cluster</option><option value="either">Either my computer or an HPC cluster</option></select></label>
                      <label><FieldLabel help="hardware">Largest GPU usually available</FieldLabel><select value={form.hardware} onChange={(event) => update("hardware", event.target.value as FormState["hardware"])}><option value="">Choose available hardware…</option><option value="unknown">Unknown</option><option value="laptop">No separate GPU / ordinary computer</option><option value="gpu24">One GPU with up to 24 GB memory</option><option value="gpu48">One GPU with 32–48 GB memory</option><option value="gpu96">One GPU with 64–96 GB memory</option><option value="multi_gpu">Two or more GPUs</option></select></label>
                      <label><FieldLabel help="site">Computer or cluster name (optional)</FieldLabel><input value={form.siteName} onChange={(event) => update("siteName", event.target.value)} placeholder="Leave blank if you do not know" /></label>
                      <label><FieldLabel help="sustainability">How should resource use affect the choice?</FieldLabel><select value={form.sustainability} onChange={(event) => update("sustainability", event.target.value as FormState["sustainability"])}><option value="">Choose a resource-use rule…</option><option value="standard">Report time and computing used</option><option value="high">Prefer the least demanding system that works well enough</option></select></label>
                    </div>
                    <div className="resource-strip"><div><span>Graphics processor</span><strong>{resources.gpu}</strong></div><div><span>Processor and memory</span><strong>{resources.cpu} · {resources.ram}</strong></div><div><span>Storage</span><strong>{resources.scratch}</strong></div><div><span>Small trial</span><strong>{resources.wall}</strong></div></div>
                    <p className="small-note">These are starting ranges, not a job request. Check the cluster’s own GPU names, account rules, job limits, software and storage paths before writing the final cluster job file (often called a Slurm script).</p>
                  </div>
                ) : null}

                <div className="form-footer"><div>{activeStep !== "project" ? <button className="text-button back-button" onClick={previousStep}><span aria-hidden="true">←</span> Back</button> : <span /> }<span className="footer-status">{getStepComplete(activeStep, form) ? "Required fields described" : "Complete the core fields to continue"}</span></div><button className="primary-button" onClick={nextStep}>{activeStep === "infrastructure" ? "Review answers" : "Continue"} <span aria-hidden="true">→</span></button></div>
              </section>

              <aside className="live-panel">
                <div className="live-panel-header"><div><p className="eyebrow">Current answers</p><h2>Emerging route</h2></div><StatusPill tone="warn">Not tested</StatusPill></div>
                <dl className="profile-list"><div><dt>Tasks</dt><dd>{form.operations.length ? form.operations.map(operationLabel).join(" · ") : "Not chosen"}</dd></div><div><dt>Source link</dt><dd>{traceabilityLabel(form.traceability)}</dd></div><div><dt>Influence on conclusions</dt><dd>{claimDependenceLabel(form.claimDependence)}</dd></div><div><dt>Furthest use</dt><dd>{downstreamUseLabel(form.downstreamUse)}</dd></div><div><dt>Validation burden</dt><dd>{validationPlan.burden}</dd></div><div><dt>Answer type</dt><dd>{answerTypeLabel(form.constructMode)}</dd></div><div><dt>Runs on</dt><dd>{productionLabel(form.production)} · {hardwareLabel(form.hardware)}</dd></div></dl>
                <div className="route-recommendation"><span className="micro-label">Possible workflow</span><strong>{architectureTitle(form)}</strong><p>{candidates.length} options currently need comparison. Nothing is recommended for full use before testing.</p></div>
                <div className="mini-gates"><div><span>Research goal</span><b className={getStepComplete("project", form) ? "done" : "open"}>{getStepComplete("project", form) ? "described" : "open"}</b></div><div><span>Sources</span><b className={getStepComplete("sources", form) ? "done" : "open"}>{getStepComplete("sources", form) ? "described" : "open"}</b></div><div><span>Test results</span><b className="open">not measured</b></div><div><span>Local hardware details</span><b className="open">check</b></div></div>
                <button className="full-link" onClick={() => setView("recommendation")}>Open full advice <span>→</span></button>
              </aside>
            </div>
          </div>
        ) : null}

        {view === "review" ? (
          <div className="content review-view">
            <section className="page-intro compact"><div><p className="eyebrow">Before generating advice</p><h1>Check the information used for your advice</h1><p className="intro-copy">The advisor uses only the answers shown below. Change anything that misstates the project; blank or uncertain answers will make the advice more cautious.</p></div><StatusPill tone={allCoreComplete ? "good" : "warn"}>{allCoreComplete ? "Ready for provisional advice" : `${steps.length - completedSteps} sections incomplete`}</StatusPill></section>
            {!allCoreComplete ? <div className="review-warning" role="status"><strong>You can still view provisional advice.</strong><p>Incomplete sections are marked below. The report will identify unresolved choices rather than silently filling them from the worked example.</p></div> : null}
            <section className="answer-review-list" aria-label="Answers used by the advisor">
              {answerReview.map((section, index) => <article className="answer-review-card" key={section.id}><div className="answer-review-heading"><div><span className="review-number">{String(index + 1).padStart(2, "0")}</span><h2>{section.label}</h2></div><div><StatusPill tone={section.complete ? "good" : "warn"}>{section.complete ? "Described" : "Incomplete"}</StatusPill><button className="text-button" onClick={() => editStep(section.id)} aria-label={`Change ${section.label}`}>Change</button></div></div><dl>{section.answers.map(([term, answer]) => <div key={term}><dt>{term}</dt><dd>{answer}</dd></div>)}</dl></article>)}
            </section>
            <section className="review-actions"><button className="secondary-button" onClick={() => editStep(steps.find((step) => !getStepComplete(step.id, form))?.id ?? "project")}><span aria-hidden="true">←</span> {allCoreComplete ? "Return to questionnaire" : "Complete missing answers"}</button><div><span>Advice remains conditional on project-specific testing.</span><button className="primary-button" onClick={() => setView("recommendation")}>{allCoreComplete ? "Generate advice" : "View provisional advice"} <span aria-hidden="true">→</span></button></div></section>
          </div>
        ) : null}

        {view === "map" ? (
          <div className="content map-view">
            <section className="page-intro compact"><div><p className="eyebrow">How the advice is made</p><h1>From research goal to a careful recommendation</h1><p className="intro-copy">Each stage depends on the one before it. A good model cannot repair missing sources, unreadable scans or relevant passages that were never found.</p></div><StatusPill tone="neutral">Method version 1.23</StatusPill></section>
            <section className="decision-canvas">
              <div className="map-lane-label">Understand the project</div><div className="decision-row"><div className="decision-node"><span>01</span><strong>Goal, question and scope</strong><p>What does the research seek to understand?</p></div><i aria-hidden="true">→</i><div className="decision-node"><span>02</span><strong>Check the sources</strong><p>What is missing, altered or hard to read?</p></div><i aria-hidden="true">→</i><div className="decision-node"><span>03</span><strong>Split the work into tasks</strong><p>What must be found, labelled or extracted?</p></div></div>
              <div className="map-drop" aria-hidden="true">↓</div><div className="map-lane-label">Design the validation</div><div className="decision-row"><div className="decision-node"><span>04</span><strong>Profile model influence</strong><p>What can the model hide, measure or reinterpret?</p></div><i aria-hidden="true">→</i><div className="decision-node"><span>05</span><strong>Create reference evidence</strong><p>Which human and source checks fit each task?</p></div><i aria-hidden="true">→</i><div className="decision-node"><span>06</span><strong>Choose methods and resources</strong><p>Compare credible baselines, models and computing</p></div></div>
              <div className="map-drop" aria-hidden="true">↓</div><div className="map-lane-label">Test the chain and result</div><div className="decision-row"><div className="decision-node"><span>07</span><strong>Test on unseen examples</strong><p>Check errors across periods, sources and groups</p></div><i aria-hidden="true">→</i><div className="decision-node"><span>08</span><strong>Stress-test the result</strong><p>Would plausible errors change the finding?</p></div><i aria-hidden="true">→</i><div className="decision-node outcome"><span>09</span><strong>Give advice with limits</strong><p>Authorize one use, restrict it, or reject it</p></div></div>
            </section>
            <section className="map-legend-grid"><div className="method-card"><span className="method-index">A</span><div><strong>Must-have conditions</strong><p>A model is excluded if its licence, data handling, hardware needs or exact version cannot meet the project’s rules.</p></div></div><div className="method-card"><span className="method-index">B</span><div><strong>Minimum quality</strong><p>Every important task, category, period and source group must meet a quality level chosen in advance.</p></div></div><div className="method-card"><span className="method-index">C</span><div><strong>Use no more than needed</strong><p>Among methods that work well enough, prefer the one requiring less computing and human correction.</p></div></div><div className="method-card"><span className="method-index">D</span><div><strong>Researcher responsibility</strong><p>Source criticism, interpretation and the final scholarly conclusions remain with the researcher.</p></div></div></section>
          </div>
        ) : null}

        {view === "recommendation" ? (
          <div className="content recommendation-view">
            <section className="recommendation-hero"><div><p className="eyebrow">Advice based on your current answers</p><h1>{form.projectTitle || "Untitled research project"}</h1><p>{form.researchGoal || form.researchQuestion || "Complete the research goal to place this advice in context."}</p></div><div className="recommendation-status"><StatusPill tone="warn">Planning advice only</StatusPill><span>{allCoreComplete ? "Project described · testing still needed" : "Questionnaire incomplete"}</span></div></section>
            <section className="recommendation-summary"><div className="summary-main"><span className="micro-label">Suggested research workflow</span><h2>{architectureTitle(form)}</h2><p>Start with the simplest credible method. Add a language model only when it offers useful evidence that the simpler method misses, then test the full setup on unseen material.</p></div><div className="summary-stat"><span>Options to test</span><strong>{candidates.length}</strong><small>not yet approved for full use</small></div><div className="summary-stat"><span>Validation burden</span><strong>{validationPlan.burden}</strong><small>{form.claimDependence ? `conclusion influence ${form.claimDependence}/5` : "influence not chosen"}</small></div><div className="summary-stat"><span>Where models may run</span><strong>{productionLabel(form.production)}</strong><small>open-weight models only</small></div></section>
            <section className="method-rationale"><div className="section-title-row"><div><p className="eyebrow">Reasoning behind the advice</p><h2>Why these routes are suggested</h2></div><StatusPill tone="good">Sources linked</StatusPill></div>{methodRoutes.length ? <div className="route-list">{methodRoutes.map((route, index) => <article className="route-card" key={route.id}><div className="route-card-index">{String(index + 1).padStart(2, "0")}</div><div><span className="micro-label">{route.task}</span><h3>{route.recommendation}</h3><p>{route.reason}</p><details><summary>Required test, limits and academic basis <span aria-hidden="true">+</span></summary><div className="route-detail"><strong>What must be shown</strong><ol>{route.tests.map((item) => <li key={item}>{item}</li>)}</ol><p><strong>Limit:</strong> {route.caution}</p><div className="route-sources">{route.references.map((reference) => <a href={reference.url} target="_blank" rel="noreferrer" key={reference.url}>{reference.label}</a>)}</div></div></details></div></article>)}</div> : <div className="empty-candidate-state"><strong>No methodological route yet</strong><p>Choose at least one research task. The explanation will then change with the task, source format, coding rules, human examples and intended use.</p></div>}</section>
            <section className="validation-contract">
              <div className="section-title-row"><div><p className="eyebrow">Project-conditioned validation</p><h2>What must be validated—and why</h2><p>The contract follows how model output enters this research chain. It does not certify a model in general.</p></div><StatusPill tone={validationPlan.burden === "Critical" || validationPlan.burden === "High" ? "warn" : "neutral"}>{validationPlan.burden} burden</StatusPill></div>
              <div className="validation-overview"><div><span>How output affects the result</span><strong>{validationPlan.influence}</strong></div><div><span>Use allowed only if</span><strong>{validationPlan.useBoundary}</strong></div><div><span>Another-model cross-check</span><strong>{crossModelLabel(form.crossModelStrategy)}</strong></div></div>
              {validationPlan.reasons.length ? <div className="validation-reasons"><strong>Why this burden applies</strong><ul>{validationPlan.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></div> : null}
              {validationPlan.strategies.length ? <div className="validation-strategy-list">{validationPlan.strategies.map((strategy, index) => <article className={`validation-strategy ${strategy.status === "Experimental supplement" ? "experimental" : ""}`} key={strategy.id}><div className="validation-strategy-index">{String(index + 1).padStart(2, "0")}</div><div><div className="validation-strategy-heading"><h3>{strategy.title}</h3><StatusPill tone={strategy.status === "Experimental supplement" ? "warn" : strategy.status === "Conditional practice" ? "neutral" : "good"}>{strategy.status}</StatusPill></div><p>{strategy.rationale}</p><details><summary>Required work, limit and scholarly basis <span aria-hidden="true">+</span></summary><div className="validation-strategy-detail"><strong>What the project should do</strong><ol>{strategy.actions.map((action) => <li key={action}>{action}</li>)}</ol><p><strong>What this cannot establish:</strong> {strategy.limitation}</p><div className="route-sources">{strategy.references.map((reference) => <a href={reference.url} target="_blank" rel="noreferrer" key={reference.url}>{reference.label}</a>)}</div></div></details></div></article>)}</div> : <div className="empty-candidate-state"><strong>No validation contract yet</strong><p>Complete the tasks, influence, review and downstream-use questions.</p></div>}
              <p className="validation-boundary"><strong>Important:</strong> cross-model agreement is a robustness signal, not independent validation. Human reference evidence and source checking remain necessary whenever model output shapes research results.</p>
            </section>
            {codebookAdvice ? <section className="codebook-decision"><div className="section-title-row"><div><p className="eyebrow">Codebook-based research</p><h2>{codebookAdvice.title}</h2></div><StatusPill tone="neutral">Task-specific route</StatusPill></div><div className="codebook-decision-grid"><article><span>01 · Model starting point</span><h3>{codebookAdvice.decision}</h3><p>Instruction tuning makes a checkpoint more suitable for following a task description and output format than its unmodified base version. It does not make the resulting codes valid by itself.</p></article><article><span>02 · Coding guide readiness</span><h3>{codebookAdvice.readiness}</h3><p>Definitions alone are rarely enough for difficult concepts. State inclusion, exclusion and boundary rules, plus positive, negative and borderline examples.</p></article><article><span>03 · When adaptation enters</span><h3>{codebookAdvice.adaptation}</h3><p>There is no universal minimum number of examples. Use learning curves and untouched evaluation material rather than a fixed numerical threshold.</p></article></div>{form.constructMode !== "plural" ? <details className="protocol-template"><summary><span className="info-icon" aria-hidden="true">i</span><span><strong>Suggested coding-guide and output protocol</strong><small>Fields to test—not a universal prompt</small></span><span className="disclosure-mark" aria-hidden="true">+</span></summary><div className="protocol-grid"><div><h3>For each code</h3><pre>{`CODE ID\nDefinition\nInclude when\nDo not include when\nPositive example\nNegative example\nBorderline example`}</pre></div><div><h3>For each model decision</h3><pre>{`CODE\nEVIDENCE: exact source span\nDECISION_NOTE: short rule-based justification\nUNCERTAINTY: none / borderline / insufficient context\nHUMAN_REVIEW: yes / no`}</pre></div></div><p className="protocol-warning">A decision note helps auditing; it is not hidden chain-of-thought or proof of correctness. A model’s numerical “confidence” is not a probability unless it has been calibrated against held-out human judgments.</p></details> : null}<div className="codebook-sources"><span>Academic basis</span><a href="https://arxiv.org/abs/2109.01652" target="_blank" rel="noreferrer">Wei et al. — instruction tuning</a><a href="https://doi.org/10.1017/pan.2025.10017" target="_blank" rel="noreferrer">Halterman & Keith — codebook evaluation</a><a href="https://doi.org/10.18653/v1/2024.eacl-short.40" target="_blank" rel="noreferrer">Dey et al. — social-science instruction tuning</a><a href="https://doi.org/10.1145/3581754.3584136" target="_blank" rel="noreferrer">Xiao et al. — prompting method only; proprietary system excluded</a></div></section> : null}
            <div className="recommendation-layout">
              <section><div className="section-title-row"><div><p className="eyebrow">Methods and models to compare</p><h2>What to test next</h2></div><StatusPill tone="neutral">List dated {MODEL_REGISTRY.snapshotDate}</StatusPill></div><div className="candidate-list">{candidates.length ? candidates.map((candidate, index) => <article className="candidate-card" key={`${candidate.role}-${candidate.name}`}><div className="candidate-order">{String(index + 1).padStart(2, "0")}</div><div className="candidate-body"><div className="candidate-heading"><div><span>{candidate.role}</span><h3>{candidate.name}</h3></div><StatusPill tone={candidate.status === "Baseline" ? "dark" : candidate.status === "Conditional" ? "warn" : "neutral"}>{candidateStatusLabel(candidate.status)}</StatusPill></div><p>{candidate.reason}</p><details className="candidate-proof"><summary>What would justify this option? <span aria-hidden="true">+</span></summary><p><strong>Evidence needed:</strong> {candidateTest(candidate, form)}</p><p><strong>Could rule it out:</strong> {candidate.caution}</p></details></div></article>) : <div className="empty-candidate-state"><strong>No project-specific options yet</strong><p>Choose at least one research task and describe the language and source format. You can still inspect the general model list.</p><button className="secondary-button" onClick={() => setView("registry")}>Open model options</button></div>}</div></section>
              <aside className="recommendation-aside"><div className="aside-card prompt-card"><p className="eyebrow">How to instruct the model</p><h3>{promptPlan.title}</h3><p>{promptPlan.summary}</p><ul>{promptPlan.variants.map((variant) => <li key={variant}>{variant}</li>)}</ul><span className="aside-foot">Compare only a small number of meaningful instruction variants and keep an exact copy of each one.</span><div className="aside-sources"><span>Academic basis</span><a href="https://doi.org/10.1145/3560815" target="_blank" rel="noreferrer">Prompting survey</a><a href="https://doi.org/10.1177/00491241251339188" target="_blank" rel="noreferrer">Qualitative coding workflow</a><a href="https://doi.org/10.18653/v1/2026.latechclfl-1.27" target="_blank" rel="noreferrer">Theory-prompt variability</a></div></div><div className="aside-card resource-card"><div className="aside-heading"><p className="eyebrow">Small computing trial</p><StatusPill tone="warn">Starting estimate</StatusPill></div><dl><div><dt>GPU</dt><dd>{resources.gpu}</dd></div><div><dt>CPU / memory</dt><dd>{resources.cpu} · {resources.ram}</dd></div><div><dt>Storage</dt><dd>{resources.scratch}</dd></div><div><dt>Trial</dt><dd>{resources.pilot} · {resources.wall}</dd></div></dl></div><div className="aside-card validation-card"><p className="eyebrow">Validation snapshot</p><h3>{validationPlan.burden} burden</h3><p>{validationPlan.summary}</p><strong className="aside-validation-boundary">{validationPlan.useBoundary}</strong><span className="aside-foot">The complete referenced contract appears above and is included in both downloads.</span></div></aside>
            </div>
            <section className="discovery-watchlist provisional-models">
              <div className="section-title-row"><div><p className="eyebrow">{PROVISIONAL_MODEL_CATEGORY.label}</p><h2>Current models to investigate—not yet curated choices</h2><p>Updated {displayDate(MODEL_DISCOVERY.generatedAt)} from the public Hugging Face catalogue. {PROVISIONAL_MODEL_CATEGORY.explanation}</p></div><StatusPill tone="warn">Provisional · evidence pending</StatusPill></div>
              <details className="watchlist-method"><summary><span className="info-icon" aria-hidden="true">i</span><span>What “provisional” means</span><span className="disclosure-mark" aria-hidden="true">+</span></summary><div><p>{PROVISIONAL_MODEL_CATEGORY.decision}</p><strong>Promotion requires</strong><ul>{PROVISIONAL_MODEL_CATEGORY.promotionChecks.map((check) => <li key={check}>{check}</li>)}</ul></div></details>
              <div className="discovery-stream-grid">{MODEL_DISCOVERY.streams.map((stream) => { const [label, purpose] = discoveryStreamText(stream.id); return <article className="discovery-stream" key={stream.id}><span className="micro-label">{label}</span><p>{purpose}</p><ul>{stream.candidates.map((candidate) => <li key={`${candidate.id}-${candidate.revision}`}><a href={candidate.url} target="_blank" rel="noreferrer"><strong>{candidate.id}</strong></a><span>{candidate.license} · revised {displayDate(candidate.lastModified)}</span></li>)}</ul></article>; })}</div>
              <p className="discovery-boundary">Before testing any entry, check its licence, who produced it, which exact version is used, whether it runs safely on the available hardware, and whether it works for the project’s language and task.</p>
            </section>
            <section className="export-bar"><div><strong>Export this advisory packet</strong><p>Files contain descriptions and proposed tests only—never corpus content or credentials.</p></div><div><button className="secondary-button light" onClick={exportJson}>Download JSON</button><button className="primary-button light" onClick={exportMarkdown}>Download Markdown</button></div></section>
          </div>
        ) : null}

        {view === "registry" ? (
          <div className="content registry-view">
            <section className="page-intro compact"><div><p className="eyebrow">General method list · version {MODEL_REGISTRY.schemaVersion}</p><h1>Model and non-model options by research task</h1><p className="intro-copy">Start with what the research needs to do. Each route begins with a simpler method and adds a model only when it may provide useful additional evidence.</p></div><StatusPill tone="neutral">Reviewed · {MODEL_REGISTRY.snapshotDate}</StatusPill></section>
            <details className="selection-method">
              <summary><span className="info-icon" aria-hidden="true">i</span><span><strong>How options enter this list</strong><small>Plain-language explanation of the evidence rules</small></span><span className="disclosure-mark" aria-hidden="true">+</span></summary>
              <div className="selection-method-body">
                <p>An option is included only when it serves a clear research task, has a simpler comparison method and may add something meaningfully different. Four kinds of support are shown separately:</p>
                <ol><li><strong>Method research</strong> explains how the task should be tested.</li><li><strong>Use in research</strong> shows that a named model has been tried in a published or pre-published study.</li><li><strong>Technical documentation</strong> describes what a model is designed to do and how it can run.</li><li><strong>Your project test</strong> checks performance, mistakes and computing needs on your own material.</li></ol>
                <p className="selection-caution">A model used in a publication is not automatically suitable for another project. Only testing on your own sources can justify an actual recommendation.</p>
              </div>
            </details>
            <details className="technical-terms"><summary><span className="info-icon" aria-hidden="true">?</span><span><strong>Technical terms used in the model list</strong><small>Search methods, model types and memory-saving formats</small></span><span className="disclosure-mark" aria-hidden="true">+</span></summary><dl><div><dt>OCR / HTR</dt><dd>Software that turns scanned print or handwriting into searchable text.</dd></div><div><dt>BM25 / Boolean</dt><dd>Established word-based search methods. Boolean search combines terms with rules such as AND, OR and NOT.</dd></div><div><dt>Embedding</dt><dd>A numerical representation used to find passages with related meanings, even when the wording differs.</dd></div><div><dt>Reranker</dt><dd>A second model that reorders a shorter list of search results.</dd></div><div><dt>Encoder</dt><dd>A usually smaller model trained to assign labels rather than write free text.</dd></div><div><dt>Base model</dt><dd>A general text-prediction checkpoint before instruction training. It can be adapted by experts, but it is usually not the first choice for directly applying a coding guide.</dd></div><div><dt>Instruction-tuned model</dt><dd>A generative checkpoint further trained to respond to written tasks and formats. This makes it a suitable starting candidate, not an automatically valid coder.</dd></div><div><dt>Project-adapted model</dt><dd>An existing model trained further on validated examples from one project. It must be compared with prompting and smaller specialised models on untouched examples.</dd></div><div><dt>LoRA / QLoRA</dt><dd>Memory-saving ways to adapt a model by training a small set of additional parameters. QLoRA also stores the main model in a compressed format.</dd></div><div><dt>7B / 12B</dt><dd>An approximate model-size label: B means billion learned numerical values. Size affects memory but does not by itself prove quality.</dd></div><div><dt>Quantization</dt><dd>A memory-saving model format. It can change quality, so the exact version must be retested.</dd></div></dl></details>
            <section className="architecture-register">{ARCHITECTURE_REGISTER.map((entry, index) => <article className="architecture-entry" key={entry.id}><div className="architecture-index">{String(index + 1).padStart(2, "0")}</div><div className="architecture-body"><span className="micro-label">{entry.operation}</span><h2>{entry.need}</h2><dl><div><dt>Start by testing</dt><dd>{entry.baseline}</dd></div><div><dt>Other options</dt><dd><ul>{entry.families.map((family) => <li key={family}>{family}</li>)}</ul></dd></div><div><dt>When to add complexity</dt><dd>{entry.escalation}</dd></div></dl><details className="register-evidence"><summary><span className="info-icon" aria-hidden="true">i</span><span>Why this route is included</span><span className="disclosure-mark" aria-hidden="true">+</span></summary><div className="register-evidence-body"><p>{entry.selectionBasis}</p><div className="documented-examples"><strong>Examples to inspect</strong><ul>{entry.documentedExamples.map((example) => <li key={example}>{example}</li>)}</ul></div><div className="register-sources">{entry.references.map((reference) => <a href={reference.url} target="_blank" rel="noreferrer" key={reference.url}><span>{reference.kind}</span>{reference.label}</a>)}</div></div></details></div></article>)}</section>
            <section className="discovery-watchlist provisional-models">
              <div className="section-title-row"><div><p className="eyebrow">{PROVISIONAL_MODEL_CATEGORY.label}</p><h2>Recently found repositories requiring further evidence</h2><p>Updated {displayDate(MODEL_DISCOVERY.generatedAt)}. {PROVISIONAL_MODEL_CATEGORY.explanation}</p></div><StatusPill tone="warn">Provisional · evidence pending</StatusPill></div>
              <details className="watchlist-method"><summary><span className="info-icon" aria-hidden="true">i</span><span>How repositories reach this category—and leave it</span><span className="disclosure-mark" aria-hidden="true">+</span></summary><div><p>Every month, an automated search finds recent and widely used repositories for seven kinds of task. It removes private or access-controlled entries and obvious add-ons or compressed copies. A licence and an exact version must be listed. Popularity and recent updates only determine what to inspect first; they do not prove research quality.</p><p>{PROVISIONAL_MODEL_CATEGORY.decision}</p><strong>Promotion into the curated register requires</strong><ul>{PROVISIONAL_MODEL_CATEGORY.promotionChecks.map((check) => <li key={check}>{check}</li>)}</ul></div></details>
              <div className="discovery-stream-grid">{MODEL_DISCOVERY.streams.map((stream) => { const [label, purpose] = discoveryStreamText(stream.id); return <article className="discovery-stream" key={stream.id}><span className="micro-label">{label}</span><p>{purpose}</p><ul>{stream.candidates.map((candidate) => <li key={`${candidate.id}-${candidate.revision}`}><a href={candidate.url} target="_blank" rel="noreferrer"><strong>{candidate.id}</strong></a><span>{candidate.license} · revised {displayDate(candidate.lastModified)}</span></li>)}</ul></article>; })}</div>
            </section>
          </div>
        ) : null}

        {view === "evidence" ? (
          <div className="content evidence-view">
            <section className="page-intro compact"><div><p className="eyebrow">Terms and supporting research</p><h1>Why the advisor asks these questions</h1><p className="intro-copy">This page explains the main rules in ordinary language and links them to academic sources. A model description or popularity score is never treated as proof that it will work for your project.</p></div><StatusPill tone="good">Sources linked</StatusPill></section>
            <div className="evidence-layout"><section className="evidence-main">
              <article className="evidence-block"><span>01</span><div><h2>Define the research purpose and what is being measured</h2><p>Begin with the research goal. A label is a research decision, not a fact produced automatically by a model. If a possible conclusion is already known, state it; otherwise record how model output could affect the conclusions that emerge.</p><div className="source-tags"><a href="https://doi.org/10.1093/pan/mps028" target="_blank" rel="noreferrer">Grimmer & Stewart</a><a href="https://doi.org/10.1145/3442188.3445901" target="_blank" rel="noreferrer">Jacobs & Wallach</a><a href="https://doi.org/10.1017/S0003055401003100" target="_blank" rel="noreferrer">Adcock & Collier</a><a href="https://doi.org/10.1007/s41111-026-00351-4" target="_blank" rel="noreferrer">Bao — LLMs as candidate measures</a></div></div></article>
              <article className="evidence-block"><span>02</span><div><h2>Test passage finding separately</h2><p>A later model cannot analyse a relevant passage that the search stage failed to find. Check how much relevant material is found, how much a person must review and whether some periods or sources are missed.</p><div className="source-tags"><a href="https://doi.org/10.1145/3166.3197" target="_blank" rel="noreferrer">Blair & Maron</a><a href="https://doi.org/10.1145/2063576.2063654" target="_blank" rel="noreferrer">Grossman & Cormack</a></div></div></article>
              <article className="evidence-block"><span>03</span><div><h2>Treat model instructions as part of the method</h2><p>Wording, examples, order, assigned role and output format can change results. More theory or a more elaborate persona does not necessarily improve coding. Save the exact instructions and compare small, meaningful variants on the project’s material.</p><div className="source-tags"><a href="https://doi.org/10.1145/3560815" target="_blank" rel="noreferrer">Prompting survey</a><a href="https://doi.org/10.18653/v1/2022.acl-long.556" target="_blank" rel="noreferrer">Prompt order</a><a href="https://doi.org/10.1177/00491241251339188" target="_blank" rel="noreferrer">Than et al. — qualitative coding</a><a href="https://doi.org/10.18653/v1/2026.latechclfl-1.27" target="_blank" rel="noreferrer">Pichler & Pagel — theory prompts</a><a href="https://doi.org/10.18653/v1/2024.findings-emnlp.888" target="_blank" rel="noreferrer">Zheng et al. — persona effects</a></div></div></article>
              <article className="evidence-block"><span>04</span><div><h2>Check what “open” really means</h2><p>Downloadable model files, permission to use them, available software, information about training data and the ability to reproduce a result are separate questions.</p><div className="source-tags"><a href="https://opensource.org/ai/open-source-ai-definition" target="_blank" rel="noreferrer">Open Source AI Definition</a><a href="https://doi.org/10.1145/3630106.3659005" target="_blank" rel="noreferrer">Open-washing study</a></div></div></article>
              <article className="evidence-block"><span>05</span><div><h2>Use the smallest adequate setup</h2><p>First decide which systems are good enough for the research purpose. Among those, prefer the one using less processing time, energy and human correction work.</p><div className="source-tags"><a href="https://doi.org/10.1002/advs.202100707" target="_blank" rel="noreferrer">Green Algorithms</a><a href="https://doi.org/10.1145/3531146.3533234" target="_blank" rel="noreferrer">Carbon reporting</a></div></div></article>
              <article className="evidence-block"><span>06</span><div><h2>Use an instruction-tuned checkpoint for direct codebook prompting</h2><p>Instruction training improves a model’s ability to respond to task descriptions and requested formats. This is why an instruction-tuned open-weight checkpoint—not its base version—is the normal generative starting point for applying a coding guide. Its outputs still require project-specific validation.</p><div className="source-tags"><a href="https://arxiv.org/abs/2109.01652" target="_blank" rel="noreferrer">Wei et al.</a><a href="https://doi.org/10.18653/v1/2024.eacl-short.40" target="_blank" rel="noreferrer">Dey et al.</a><a href="https://doi.org/10.1017/pan.2025.10017" target="_blank" rel="noreferrer">Halterman & Keith</a></div></div></article>
              <article className="evidence-block"><span>07</span><div><h2>Separate prompting from project-specific adaptation</h2><p>First test a structured coding guide, allowed labels, evidence fields and difficult examples. Adapt a model only when the guide is stable, validated examples exist and direct prompting leaves a repeatable shortfall. There is no universal number of examples that guarantees success.</p><div className="source-tags"><a href="https://doi.org/10.1017/pan.2025.10017" target="_blank" rel="noreferrer">Halterman & Keith</a><a href="https://doi.org/10.1145/3581754.3584136" target="_blank" rel="noreferrer">Xiao et al. — method evidence; proprietary model excluded</a><a href="https://doi.org/10.1017/psrm.2025.10086" target="_blank" rel="noreferrer">Choi et al.</a></div></div></article>
              <article className="evidence-block"><span>08</span><div><h2>Validate the research use, not a model in general</h2><p>The required evidence changes when model output moves from suggesting passages to producing records, measurements, statistical variables or interpretations. High labelling accuracy does not by itself guarantee an unbiased historical trend or valid confidence interval.</p><div className="source-tags"><a href="https://arxiv.org/abs/2306.04746" target="_blank" rel="noreferrer">Egami et al.</a><a href="https://doi.org/10.1146/annurev-polisci-051120-111443" target="_blank" rel="noreferrer">Knox, Lucas & Cho</a><a href="https://arxiv.org/abs/2607.07915" target="_blank" rel="noreferrer">Desai, Card & Jacobs — emerging norms preprint</a></div></div></article>
              <article className="evidence-block"><span>09</span><div><h2>Treat another LLM as a cross-check, not a gold standard</h2><p>Different models can expose unstable cases, suggest objections or expand a retrieval pool. Their agreement is only evidence about robustness to model choice: shared training data and judge biases can produce shared errors.</p><div className="source-tags"><a href="https://papers.neurips.cc/paper_files/paper/2023/hash/91f18a1287b398d378ef22505bf41832-Abstract-Datasets_and_Benchmarks.html" target="_blank" rel="noreferrer">Zheng et al.</a><a href="https://doi.org/10.1162/coli_a_00502" target="_blank" rel="noreferrer">Ziems et al.</a></div></div></article>
              <article className="evidence-block"><span>10</span><div><h2>Use a model devil’s advocate only after the researcher interprets</h2><p>A model can experimentally generate counterarguments to a completed researcher memo. Preserve the original reading, treat each objection as a generated artifact and verify it manually against the source. This is not testimony, member checking or independent validation.</p><div className="source-tags"><a href="https://doi.org/10.1037/qup0000374" target="_blank" rel="noreferrer">Gillespie — provoking interpretation</a></div></div></article>
              <article className="validation-matrix-panel"><div className="validation-matrix-heading"><p className="eyebrow">Validation strategy matrix</p><h2>Match the test to what the LLM does</h2><p>These are starting requirements. The Advice view combines them with the research goal, possible influence on conclusions, review coverage and downstream use.</p></div><div className="validation-table-wrap"><table><thead><tr><th>Operation</th><th>Main risk</th><th>Core evidence</th><th>Cross-model role</th></tr></thead><tbody><tr><th>Source conversion</th><td>Evidence is altered, lost or reordered</td><td>Compare sampled outputs with original pages across source-quality groups</td><td>Find disagreements for page inspection only</td></tr><tr><th>Retrieval</th><td>Relevant evidence remains invisible</td><td>Human relevance judgments, recall, precision and false-negative analysis</td><td>Combine candidate pools when misses are costly</td></tr><tr><th>Coding</th><td>Construct or category errors enter the dataset</td><td>Frozen guide, independent human reference, per-code and stratum errors</td><td>Blind recoding to locate model-sensitive cases</td></tr><tr><th>Extraction</th><td>Fields are unsupported, missing or wrongly bounded</td><td>Field and exact-source-span verification</td><td>Use discrepancies to prioritize source checks</td></tr><tr><th>Aggregation</th><td>Item errors bias trends or estimates</td><td>Conclusion sensitivity and, where needed, design-based correction</td><td>Competing imperfect proxies—not a human-label substitute</td></tr><tr><th>Interpretation</th><td>Anchoring, anachronism or flattened ambiguity</td><td>Researcher-first reading, traceability, counterevidence and rival readings</td><td>Generate source-linked alternatives rather than vote for truth</td></tr></tbody></table></div></article>
              <article className="coverage-panel"><div className="validation-matrix-heading"><p className="eyebrow">Method coverage</p><h2>How the QMD enters the advisor</h2><p>Every major methodological module is either asked from the researcher, derived by a visible rule, or flagged for verification outside this advisory site.</p></div><div className="coverage-list">{METHOD_COVERAGE.map((item) => <div key={item.module}><span>Module {item.module}</span><p>{item.concern}</p><strong>{item.treatment}</strong></div>)}</div></article>
              <article className="reference-library"><div className="validation-matrix-heading"><p className="eyebrow">Reference library</p><h2>Sources for consultation</h2><p>Curated working literature last appraised {displayDate(LITERATURE_REVIEW_DATE)}. Peer-reviewed work and preprints are labelled separately; the full QMD bibliography remains the comprehensive record. {literatureReviewConfirmed ? "The current appraisal is researcher-confirmed." : "Newly integrated items require researcher confirmation before publication."}</p></div>{[...new Set(RESEARCH_REFERENCES.map((reference) => reference.group))].map((group) => <section key={group}><h3>{group}</h3><ul>{RESEARCH_REFERENCES.filter((reference) => reference.group === group).map((reference) => <li key={reference.url}><a href={reference.url} target="_blank" rel="noreferrer"><strong>{reference.authors} ({reference.year})</strong><span>{reference.title}</span></a><small>{reference.status}</small></li>)}</ul></section>)}</article>
              <article className="literature-watch"><div className="validation-matrix-heading"><p className="eyebrow">Monthly literature check</p><h2>{!literatureReviewCurrent ? "New work awaiting scholarly screening" : literatureReviewConfirmed ? "Current discovery queue reviewed" : "Current discovery queue provisionally appraised"}</h2><p>Discovery updated {displayDate(LITERATURE_DISCOVERY.generatedAt)} from public Crossref metadata. Discovery produces search leads; the separately dated appraisal below determines whether any lead changes the working method.</p></div><div className={`literature-review-status ${literatureReviewCurrent ? "current" : "stale"}`}><div><span>{!literatureReviewCurrent ? "New appraisal required" : literatureReviewConfirmed ? "Researcher-confirmed review current" : "Provisional appraisal current"}</span><strong>{LITERATURE_REVIEW.decisions.length} publications appraised · {displayDate(LITERATURE_REVIEW.reviewedAt)}</strong><small>{literatureReviewConfirmed ? `Confirmed by ${LITERATURE_REVIEW.confirmedBy || "researcher"} · ${displayDate(LITERATURE_REVIEW.confirmedAt || LITERATURE_REVIEW.reviewedAt)}` : "AI-assisted initial review · researcher confirmation required before publication"}</small></div><dl><div><dt>Integrated</dt><dd>{literatureReviewCounts.integrated ?? 0}</dd></div><div><dt>Already covered</dt><dd>{literatureReviewCounts.already_covered ?? 0}</dd></div><div><dt>Background</dt><dd>{literatureReviewCounts.background ?? 0}</dd></div><div><dt>Other</dt><dd>{(literatureReviewCounts.superseded ?? 0) + (literatureReviewCounts.out_of_scope ?? 0)}</dd></div></dl></div><details className="review-decision-log"><summary><span className="info-icon" aria-hidden="true">i</span><span>See every appraisal decision and reason</span><span className="disclosure-mark" aria-hidden="true">+</span></summary><div><p>“Integrated” means the work added a distinct consideration to the working QMD and curated reference library. The other labels preserve relevant, duplicate, superseded and out-of-scope leads without turning them into advisory evidence. The project owner should confirm promoted sources before public methodological claims rely on them.</p><ul>{LITERATURE_REVIEW.decisions.map((decision) => { const candidate = LITERATURE_DISCOVERY.candidates.find((item) => item.id === decision.id); return <li key={decision.id}><div><StatusPill tone={decision.status === "integrated" ? "good" : decision.status === "out_of_scope" ? "warn" : "neutral"}>{literatureDecisionLabel(decision.status)}</StatusPill><strong>{candidate?.title ?? decision.id}</strong></div><p>{decision.reason}</p><small>{decision.affectedModules.length ? `QMD modules considered: ${decision.affectedModules.join(", ")}` : "No QMD module affected"}</small></li>; })}</ul></div></details><details className="watchlist-method"><summary><span className="info-icon" aria-hidden="true">i</span><span>How future discoveries are reviewed</span><span className="disclosure-mark" aria-hidden="true">+</span></summary><p>A researcher reads each plausible item, verifies its publication status and judges its methods, scope, limitations and relevance. Only an explicit, recorded decision can update a public methodological rule or curated reference list.</p></details><ul>{LITERATURE_DISCOVERY.candidates.map((candidate) => <li key={candidate.id}><a href={candidate.url} target="_blank" rel="noreferrer"><strong>{candidate.title}</strong></a><span>{candidate.authors.slice(0, 3).join(", ") || "Authors unavailable"} · {candidate.published || "Date unavailable"} · {candidate.venue}</span></li>)}</ul></article>
            </section><aside className="glossary-panel"><p className="eyebrow">Plain-language glossary</p><h2>Terms used here</h2>{[["Large language model (LLM)", "A model trained on very large text collections that can follow instructions, classify text or generate language."], ["Open-weight model", "A model whose trained files can be downloaded and run under your control. The licence still needs checking."], ["Base model", "A checkpoint trained mainly to continue text, before additional instruction training. It is usually not the first direct-prompt choice for applying a coding guide."], ["Instruction-tuned model", "A checkpoint further trained to respond to written tasks and formats. It is a starting candidate, not a validated coder."], ["Project adaptation", "Further training on validated examples from one project, tested against simpler prompting and specialised models."], ["Source provenance", "A record of where material came from, what may be missing and which transformations changed it."], ["Traceability", "The ability to return from an output to the exact supporting document, passage or page."], ["Few-shot prompt", "An instruction that includes a small number of worked examples. Those examples belong to development and must not come from the final test set."], ["Calibrated confidence", "A score whose relationship to actual correctness has been measured on held-out examples. A model's self-reported number is not calibrated automatically."], ["Validation contract", "A project-specific plan stating what must be tested, what evidence would permit a particular use, and what would restrict or rule it out."], ["Downstream use", "What happens after a model output is produced—for example human reading, a dataset, a trend, a statistical analysis or an interpretation."], ["Cross-model corroboration", "Using another LLM to expose unstable cases or possible errors. Agreement is a robustness signal, not independent proof that the answer is valid."], ["HPC cluster", "A shared institutional computing system with larger processors, GPUs and job scheduling."], ["Recall", "Among all relevant passages, the share the system finds."], ["Precision", "Among the passages returned as relevant, the share that really qualifies."], ["Source group check", "Testing a period, source type or group separately so an average cannot hide a blind spot."], ["Unseen test set", "Examples kept away from development and used only for the final comparison."], ["Embedding", "A numerical representation used to find related meanings, not only matching words."], ["Reranker", "A second model that reorders a smaller list of search results."], ["Quantization", "A memory-saving model format. Because it may change quality, the exact format must be retested."], ["GPU memory", "Dedicated memory on a graphics processor. It limits which models and document lengths can run."], ["Abstention", "The system says it cannot decide and sends the case to a person."], ["Model version", "The exact published checkpoint of a model. Recording it helps another researcher reproduce the test."], ["Context window", "The maximum amount of text a model can receive at once. Advertised limits do not guarantee reliable use of every part."]].map(([term, definition]) => <details key={term}><summary>{term}<span aria-hidden="true">+</span></summary><p>{definition}</p></details>)}<div className="boundary-box"><strong>What the dashboard does not do</strong><p>It does not upload sources, run models, send prompts, connect to a cluster or submit computing jobs.</p></div><div className="boundary-box"><strong>No commercial AI dependency</strong><p>The live dashboard calls no AI service. Monthly build-time searches read public model and publication metadata; they do not run a model or rewrite the advice automatically.</p></div></aside></div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
