import modelDiscovery from "./model-discovery.json";

/**
 * Documentary anchor families.
 *
 * These entries define information-distinct configurations worth considering.
 * They are not a universal ranking and become recommendations only after a
 * project-specific benchmark on the exact model revision and runtime.
 */
export const MODEL_REGISTRY = {
  schemaVersion: "0.4",
  snapshotDate: "2026-08-16",
  candidates: {
    lexical: "Filters and word-based search (for example Boolean search or BM25)",
    multilingualEmbedding: "Meaning-based multilingual search: compare BGE-M3, Granite Embedding and Qwen3-Embedding",
    englishEmbedding: "Meaning-based English search: compare Qwen3-Embedding, BGE and E5 families",
    languageSpecificEmbedding: "A meaning-based search model tested for the collection's language",
    multilingualReranker: "A multilingual model that reorders search results: compare BGE and Qwen reranker families",
    englishReranker: "An English model that reorders a first set of search results",
    dutchEncoder: "Compare a Dutch RobBERT model with multilingual XLM-R",
    multilingualEncoder: "XLM-R trained with the project's human-coded examples",
    englishEncoder: "Compare ModernBERT and DeBERTa families using the project's examples",
    languageSpecificEncoder: "Compare a language-specific labelling model with multilingual XLM-R",
    tokenClassifier: "A specialised model trained to mark exact names, places or source phrases",
    rulesExtraction: "Transparent rules, dictionaries and format checks",
    ocrLayout: "Text and layout recognition: compare Surya, Kraken or Tesseract on the actual pages",
    documentVision: "A downloadable model that reads both page images and text",
    compactGenerator: "A checked 7–12B downloadable instruction-following model",
    resourceMinimalGenerator: "Apertus 8B or another checked multilingual 7–12B model",
    balancedGenerator: "Qwen3.5-35B-A3B or another checked medium-sized downloadable model",
    structuralChallenger: "One checked instruction model from a genuinely different developer or design",
    deterministicAggregation: "Recorded R, Python or SQL code with automatic tests",
    humanInterpretation: "Researcher reads first; model is asked for an alternative reading and counterevidence",
  },
} as const;

export const ARCHITECTURE_REGISTER = [
  {
    id: "source-representation",
    operation: "Turn scans into reliable text",
    need: "Scans, handwriting, damaged print, page layout and tables must remain linked to text that a computer can search.",
    baseline: "Check the existing text against a varied sample of original pages",
    families: ["Software that recognises printed text or handwriting", "A model that reconstructs page layout and reading order", "A page-image model only when visual evidence is necessary"],
    escalation: "Improve the source text before adding a model for later research tasks.",
    documentedExamples: ["Surya or Kraken for source-specific OCR/layout trials", "Tesseract as a reproducible conventional OCR baseline"],
    selectionBasis: "This route is included because mistakes in recognised text and page layout change the evidence available to every later task. The named tools are options to test, not defaults. Compare them on pages that vary by period, writing or print style, layout and image quality.",
    references: [
      { kind: "Academic", label: "Hill & Hengchen — impact of dirty OCR", url: "https://doi.org/10.1093/llc/fqz024" },
      { kind: "Academic", label: "Romein et al. — digital source criticism", url: "https://doi.org/10.1111/1468-229X.12969" },
      { kind: "Technical", label: "Surya repository and model documentation", url: "https://github.com/datalab-to/surya" },
    ],
  },
  {
    id: "lexical-retrieval",
    operation: "Search by words",
    need: "Find names, phrases, spelling variants and explicit terms in a way that is easy to inspect.",
    baseline: "Filters, dictionaries, spelling-tolerant matching, Boolean search or BM25",
    families: ["Word-based search that accounts for historical periods", "Matching that tolerates text-recognition errors", "Additional search terms reviewed by a researcher"],
    escalation: "Add meaning-based search only when it finds important relevant passages that word-based search misses.",
    documentedExamples: ["BM25 or Boolean retrieval", "Researcher-reviewed dictionaries, spelling variants and fuzzy matching"],
    selectionBasis: "Word-based search remains because researchers can see exactly which terms were used and because search wording affects which sources become visible. It may be enough for explicit terms and provides the comparison needed to show whether meaning-based search adds useful material.",
    references: [
      { kind: "Academic", label: "Blair & Maron — retrieval effectiveness", url: "https://doi.org/10.1145/3166.3197" },
      { kind: "Academic", label: "Huistra & Mellink — phrasing history", url: "https://doi.org/10.1080/01615440.2016.1205964" },
    ],
  },
  {
    id: "semantic-retrieval",
    operation: "Search by meaning and reorder results",
    need: "Find paraphrases, indirect references, related concepts or expressions in another language when the wording differs.",
    baseline: "Compare combined word-and-meaning search with word-based search alone",
    families: ["A model that represents passage meanings as numbers", "A combined word-and-meaning search model", "A second model that reorders the first search results", "A generative model for only the hardest relevance decisions"],
    escalation: "Check missed passages, passages found only by this method, reading workload and results across important periods and source groups.",
    documentedExamples: ["BGE-M3 for multilingual dense/sparse retrieval trials", "BGE-reranker-v2-m3 as a multilingual reranking challenger"],
    selectionBasis: "Meaning-based search and result-reordering models are included for paraphrases, indirect references and expressions in different languages. The cited models are technically plausible examples, while the research sources explain how to test them. Neither proves that they will find enough relevant material in a new collection.",
    references: [
      { kind: "Academic", label: "Grossman & Cormack — technology-assisted review", url: "https://doi.org/10.1145/2063576.2063654" },
      { kind: "Preprint", label: "BGE-M3 technical paper", url: "https://arxiv.org/abs/2402.03216" },
      { kind: "Technical", label: "BGE reranker v2 M3 model card", url: "https://huggingface.co/BAAI/bge-reranker-v2-m3" },
    ],
  },
  {
    id: "classification",
    operation: "Assign labels using written rules",
    need: "Give documents or passages stable labels such as relevant/not relevant, topic, stance, frame or source type.",
    baseline: "Simple rules, the most common label and a smaller trained labelling model when human examples exist",
    families: ["A smaller model for one language", "A smaller multilingual model", "A small instruction-following model restricted to the allowed labels", "Lightweight model adaptation only after simpler repairs fail"],
    escalation: "Prefer the smallest system that meets the chosen quality level for every important label and source group.",
    documentedExamples: ["XLM-R, ModernBERT or a language-specific encoder", "DEBATE Base/Large as research-released task-specific classifiers", "Llama 3.1 8B only as a generative contrast when warranted"],
    selectionBasis: "Smaller labelling models remain because assigning categories does not always require a model that writes text. Recent political-text research reports large speed gains from models trained for this specific job. They should be compared with simple rules and the most common label before a generative model is justified.",
    references: [
      { kind: "Academic", label: "Grimmer & Stewart — text-as-data validation", url: "https://doi.org/10.1093/pan/mps028" },
      { kind: "Research use", label: "Burnham et al. — Political DEBATE", url: "https://doi.org/10.1017/pan.2025.10028" },
      { kind: "Technical", label: "ModernBERT model card", url: "https://huggingface.co/answerdotai/ModernBERT-base" },
    ],
  },
  {
    id: "structured-extraction",
    operation: "Extract names, dates and structured fields",
    need: "Recover names, dates, places, quotations or relations while keeping the exact supporting words from the source.",
    baseline: "Rules, dictionaries and automatic checks that every output follows the required format",
    families: ["A specialised model that marks exact words", "A model that finds phrases and relations between them", "A generative model forced to return fixed fields, including 'unknown' and supporting evidence"],
    escalation: "Check every field and supporting phrase. Correct-looking formatted output is not proof that the information is true.",
    documentedExamples: ["XLM-R or a language-specific token classifier", "A constrained open-weight generator only when rules and span models miss contextual fields"],
    selectionBasis: "Extraction is separate from labelling because it must return both a value and the exact source words supporting it. Published studies show that generative models can help, but transparent rules and specialised extraction models come first until a generator proves its value for each field.",
    references: [
      { kind: "Academic", label: "Lee et al. — information extraction with GPT", url: "https://doi.org/10.1017/S1049096525000046" },
      { kind: "Academic", label: "Ziems et al. — LLMs in computational social science", url: "https://doi.org/10.1162/coli_a_00502" },
    ],
  },
  {
    id: "contextual-coding",
    operation: "Assign labels that depend on context",
    need: "Apply categories that depend on surrounding text, negation, who is speaking, quotation or several linked rules.",
    baseline: "People apply the coding guide; compare this with a smaller labelling model and a direct model instruction",
    families: ["A smaller downloadable instruction-tuned model—not its base checkpoint—for direct codebook prompting", "A smaller supervised labelling model trained on human examples", "A larger instruction-tuned model only as a justified comparison", "Lightweight adaptation after the labels and coding guide are stable"],
    escalation: "First test a structured coding guide with supporting source words, uncertainty or abstention, instruction-order checks, human review and untouched examples. Consider adaptation only after this baseline remains inadequate.",
    documentedExamples: ["Mistral-7B-Instruct-v0.2", "Mistral-NeMo-12B-Instruct", "Llama-3.1-8B-Instruct", "OLMo-7B-Instruct"],
    selectionBasis: "Instruction tuning is intended to improve how a model follows written tasks and formats, making an instruction-tuned checkpoint a better direct-prompt starting point than its unmodified base checkpoint. The named 7–12B models were tested in a peer-reviewed coding-guide study because they were downloadable and fit within 24 GB of GPU memory. Performance still varied by task and label order. Fine-tuning enters only after the coding guide is stable, human examples exist and direct prompting has exposed a repeatable shortfall.",
    references: [
      { kind: "Academic", label: "Wei et al. — instruction tuning and unseen tasks", url: "https://arxiv.org/abs/2109.01652" },
      { kind: "Research use", label: "Halterman & Keith — Codebook LLMs", url: "https://doi.org/10.1017/pan.2025.10017" },
      { kind: "Research use", label: "Dey et al. — instruction tuning for social-science tasks", url: "https://doi.org/10.18653/v1/2024.eacl-short.40" },
      { kind: "Method only", label: "Xiao et al. — codebook prompting; proprietary model excluded here", url: "https://doi.org/10.1145/3581754.3584136" },
      { kind: "Research use", label: "Choi et al. — fine-tuned Llama 3 and RoBERTa", url: "https://doi.org/10.1017/psrm.2025.10086" },
      { kind: "Preprint", label: "Ngo et al. — local open-model qualitative coding", url: "https://arxiv.org/abs/2602.18352" },
    ],
  },
  {
    id: "interpretive-assistance",
    operation: "Support interpretation without replacing it",
    need: "Compare readings, identify evidence against them, trace themes or prepare notes linked to sources without treating one reading as the only truth.",
    baseline: "Researcher reading and memo written before model exposure",
    families: ["An instruction model given only selected source passages", "Instructions asking for a different supported reading", "A routine check for counterevidence and unresolved ambiguity"],
    escalation: "The researcher remains responsible for source criticism, interpretation, explanation and the final scholarly claim.",
    documentedExamples: ["No named model is treated as an interpretive default", "A current open-weight instruction challenger may enter only as an evidence-linked comparison"],
    selectionBasis: "Interpretive assistance is included as a limited collaboration between researcher and model, not as a shortcut that replaces reading. Research on interpretation stresses context, several defensible readings and ambiguity. A recent devil's-advocate study supports one narrowly experimental route: write the researcher interpretation first, ask for counterarguments, and manually verify every objection against the source. The model's response remains an artifact, not testimony or validation.",
    references: [
      { kind: "Academic", label: "Kommers et al. — computational hermeneutics", url: "https://doi.org/10.3389/frai.2026.1753041" },
      { kind: "Academic", label: "Fodor et al. — hermeneutically complex annotation", url: "https://doi.org/10.1016/j.amper.2026.100270" },
      { kind: "Academic", label: "Gillespie — LLMs as devil's advocates", url: "https://doi.org/10.1037/qup0000374" },
      { kind: "Preprint", label: "Ngo et al. — conditional trust in local QDA", url: "https://arxiv.org/abs/2602.18352" },
    ],
  },
  {
    id: "aggregation",
    operation: "Count, combine and summarise results",
    need: "Count, join, compare groups, calculate estimates or visualise records that have already been checked.",
    baseline: "Recorded code with automatic tests and a second check of important totals",
    families: ["Transparent transformations in SQL, R or Python", "A statistical method matched to the research question", "A chart whose underlying data can be inspected"],
    escalation: "Do not use a language model for arithmetic or routine data processing when ordinary code can do it exactly.",
    documentedExamples: ["Versioned R, Python or SQL", "A statistical estimator matched to the population claim"],
    selectionBasis: "This non-model route is included because good advice must sometimes conclude that no language model is appropriate. Ordinary recorded code makes counts, joins and estimates easier to reproduce and check after the input records have been validated.",
    references: [
      { kind: "Academic", label: "Hopkins & King — corpus-level content analysis", url: "https://doi.org/10.1111/j.1540-5907.2009.00428.x" },
      { kind: "Academic", label: "Grimmer & Stewart — promise and pitfalls", url: "https://doi.org/10.1093/pan/mps028" },
    ],
  },
] as const;

export const MODEL_DISCOVERY = modelDiscovery;

/**
 * Separates automated discovery leads from the curated task routes above.
 * No entry crosses into a project recommendation without documentary review
 * and an empirical benchmark on the intended material.
 */
export const PROVISIONAL_MODEL_CATEGORY = {
  label: "Provisional model candidates",
  evidenceStatus: "Not yet sufficiently corroborated",
  reviewedAt: "2026-08-16",
  decision: "Retain the current discovery snapshot in a separate provisional category; do not promote any entry into the curated register yet.",
  explanation: "These repositories were found by the monthly catalogue search. They may be technically plausible, but this review did not establish sufficient task-relevant published research or project testing to present them as curated recommendations.",
  promotionChecks: [
    "licence, lineage and exact revision",
    "fit with the research task, language and source type",
    "independent documentation or relevant published research",
    "project-specific performance and failure analysis",
    "hardware feasibility and measured resource use",
  ],
} as const;
