import literatureDiscovery from "./literature-discovery.json";
import literatureReviewDecisions from "./literature-review-decisions.json";

export const LITERATURE_DISCOVERY = literatureDiscovery;
export const LITERATURE_REVIEW = literatureReviewDecisions;
export const LITERATURE_REVIEW_DATE = literatureReviewDecisions.reviewedAt;

export const RESEARCH_REFERENCES = [
  { group: "Claims and measurement", authors: "Adcock & Collier", year: 2001, title: "Measurement Validity: A Shared Standard for Qualitative and Quantitative Research", status: "Peer reviewed", url: "https://doi.org/10.1017/S0003055401003100" },
  { group: "Claims and measurement", authors: "Grimmer & Stewart", year: 2013, title: "Text as Data: The Promise and Pitfalls of Automatic Content Analysis Methods for Political Texts", status: "Peer reviewed", url: "https://doi.org/10.1093/pan/mps028" },
  { group: "Claims and measurement", authors: "Jacobs & Wallach", year: 2021, title: "Measurement and Fairness", status: "Peer reviewed", url: "https://doi.org/10.1145/3442188.3445901" },
  { group: "Claims and measurement", authors: "Egami et al.", year: 2023, title: "Using Imperfect Surrogates for Downstream Inference", status: "Peer reviewed", url: "https://arxiv.org/abs/2306.04746" },
  { group: "Claims and measurement", authors: "Knox, Lucas & Cho", year: 2022, title: "Testing Causal Theories with Learned Proxies", status: "Peer reviewed", url: "https://doi.org/10.1146/annurev-polisci-051120-111443" },
  { group: "Claims and measurement", authors: "Bao", year: 2026, title: "Beyond the Conventional Pipeline: Large Language Models for Social Science Measurement", status: "Peer reviewed", url: "https://doi.org/10.1007/s41111-026-00351-4" },
  { group: "Sources and retrieval", authors: "Blair & Maron", year: 1985, title: "An Evaluation of Retrieval Effectiveness for a Full-Text Document-Retrieval System", status: "Peer reviewed", url: "https://doi.org/10.1145/3166.3197" },
  { group: "Sources and retrieval", authors: "Hill & Hengchen", year: 2019, title: "Quantifying the Impact of Dirty OCR on Historical Text Analysis", status: "Peer reviewed", url: "https://doi.org/10.1093/llc/fqz024" },
  { group: "Sources and retrieval", authors: "Romein et al.", year: 2020, title: "State of the Field: Digital History", status: "Peer reviewed", url: "https://doi.org/10.1111/1468-229X.12969" },
  { group: "Annotation and qualitative practice", authors: "Röttger et al.", year: 2022, title: "Two Contrasting Data Annotation Paradigms for Subjective NLP Tasks", status: "Peer reviewed", url: "https://doi.org/10.18653/v1/2022.naacl-main.13" },
  { group: "Annotation and qualitative practice", authors: "Ziems et al.", year: 2024, title: "Can Large Language Models Transform Computational Social Science?", status: "Peer reviewed", url: "https://doi.org/10.1162/coli_a_00502" },
  { group: "Annotation and qualitative practice", authors: "Schroeder et al.", year: 2025, title: "Large Language Models in Qualitative Research: Uses, Tensions, and Intentions", status: "Peer reviewed", url: "https://doi.org/10.1145/3706598.3713120" },
  { group: "Annotation and qualitative practice", authors: "Dunivin", year: 2025, title: "Scaling Hermeneutics: A Guide to Qualitative Coding with LLMs for Reflexive Content Analysis", status: "Peer reviewed", url: "https://doi.org/10.1140/epjds/s13688-025-00548-8" },
  { group: "Annotation and qualitative practice", authors: "Karjus", year: 2025, title: "Machine-Assisted Quantitizing Designs", status: "Peer reviewed", url: "https://doi.org/10.1057/s41599-025-04503-w" },
  { group: "Annotation and qualitative practice", authors: "Halterman & Keith", year: 2026, title: "Codebook LLMs: Evaluating LLMs as Measurement Tools for Political Science Concepts", status: "Peer reviewed", url: "https://doi.org/10.1017/pan.2025.10017" },
  { group: "Annotation and qualitative practice", authors: "Fodor, Katona & Németh", year: 2026, title: "Evaluating Large Language Models on a Hermeneutically Complex Text Annotation Task", status: "Peer reviewed", url: "https://doi.org/10.1016/j.amper.2026.100270" },
  { group: "Annotation and qualitative practice", authors: "Mousavi et al.", year: 2026, title: "From Lexicons to Large Language Models", status: "Peer reviewed", url: "https://doi.org/10.1287/isre.2024.1143" },
  { group: "Annotation and qualitative practice", authors: "Than et al.", year: 2025, title: "Updating ‘The Future of Coding’: Qualitative Coding with Generative Large Language Models", status: "Peer reviewed", url: "https://doi.org/10.1177/00491241251339188" },
  { group: "Annotation and qualitative practice", authors: "Gillespie", year: 2026, title: "Provoking Interpretation: Using Large Language Models as Devil’s Advocates", status: "Peer reviewed", url: "https://doi.org/10.1037/qup0000374" },
  { group: "Prompting and model use", authors: "Wei et al.", year: 2022, title: "Finetuned Language Models Are Zero-Shot Learners", status: "Peer reviewed", url: "https://arxiv.org/abs/2109.01652" },
  { group: "Prompting and model use", authors: "Liu et al.", year: 2023, title: "Pre-train, Prompt, and Predict: A Systematic Survey of Prompting Methods in Natural Language Processing", status: "Peer reviewed", url: "https://doi.org/10.1145/3560815" },
  { group: "Prompting and model use", authors: "Zheng et al.", year: 2024, title: "When ‘A Helpful Assistant’ Is Not Really Helpful: Personas in System Prompts Do Not Improve Performances of Large Language Models", status: "Peer reviewed", url: "https://doi.org/10.18653/v1/2024.findings-emnlp.888" },
  { group: "Prompting and model use", authors: "Dey et al.", year: 2024, title: "SOCIALITE-LLAMA: An Instruction-Tuned Model for Social Scientific Tasks", status: "Peer reviewed", url: "https://doi.org/10.18653/v1/2024.eacl-short.40" },
  { group: "Prompting and model use", authors: "Pichler & Pagel", year: 2026, title: "Evaluating Humanities Theory Alignment in Large Language Models: Incremental Prompting and Statistical Assessment", status: "Peer reviewed", url: "https://doi.org/10.18653/v1/2026.latechclfl-1.27" },
  { group: "Validation and reporting", authors: "Kempny et al.", year: 2026, title: "The Use and Methodological Reporting of Large Language Models in Qualitative Research: A Scoping Review", status: "Peer reviewed", url: "https://doi.org/10.1186/s12874-026-02913-1" },
  { group: "Validation and reporting", authors: "Fang, Garcia Bernardo & van Kesteren", year: 2026, title: "A Methodological Guide on Using Large Language Models for Reproducible Text Annotation in the Social Sciences and Humanities", status: "Preprint", url: "https://arxiv.org/abs/2604.09638" },
  { group: "Validation and reporting", authors: "Desai, Card & Jacobs", year: 2026, title: "Validating LLMs in Social Science: Epistemic Threats and Emerging Norms", status: "Preprint", url: "https://arxiv.org/abs/2607.07915" },
  { group: "Validation and reporting", authors: "Zheng et al.", year: 2023, title: "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena", status: "Peer reviewed", url: "https://papers.neurips.cc/paper_files/paper/2023/hash/91f18a1287b398d378ef22505bf41832-Abstract-Datasets_and_Benchmarks.html" },
  { group: "Openness and sustainability", authors: "Liesenfeld & Dingemanse", year: 2024, title: "Rethinking Open Source Generative AI", status: "Peer reviewed", url: "https://doi.org/10.1145/3630106.3659005" },
  { group: "Openness and sustainability", authors: "Lannelongue, Grealey & Inouye", year: 2021, title: "Green Algorithms: Quantifying the Carbon Footprint of Computation", status: "Peer reviewed", url: "https://doi.org/10.1002/advs.202100707" },
  { group: "Openness and sustainability", authors: "Dodge et al.", year: 2022, title: "Measuring the Carbon Intensity of AI in Cloud Instances", status: "Peer reviewed", url: "https://doi.org/10.1145/3531146.3533234" },
] as const;

export const METHOD_COVERAGE = [
  { module: "1", concern: "Claim, model role, plurality and influence on the conclusion", treatment: "Asked in plain language" },
  { module: "2", concern: "Separate tasks, handoffs and error amplification", treatment: "Asked and derived" },
  { module: "3", concern: "Source format, access, scale, language change, provenance and traceability", treatment: "Asked; source gate" },
  { module: "4", concern: "Word search, meaning search, reranking and relevance screening", treatment: "Derived as separate routes" },
  { module: "5", concern: "Answer type, coding guide, examples and human reference process", treatment: "Asked; readiness restriction" },
  { module: "6", concern: "Prompt family, evidence fields, persona and rationale cautions, and bounded adversarial interpretation", treatment: "Derived; exact prompt tested later" },
  { module: "7", concern: "Baselines, model families, instruction tuning, adaptation and openness", treatment: "Asked and derived" },
  { module: "8", concern: "Unseen tests, task metrics, source-group checks and claim stress tests", treatment: "Derived validation work" },
  { module: "8A", concern: "Project-conditioned validation burden and permitted use", treatment: "Asked and derived" },
  { module: "9", concern: "Human expertise, independent checking, capacity and anchoring", treatment: "Asked; team test required" },
  { module: "10", concern: "Access, licence, local/HPC control and reproducibility", treatment: "Asked; approval verified later" },
  { module: "11", concern: "Smallest adequate system and measured resource use", treatment: "Asked and derived" },
  { module: "12", concern: "Hardware, context, exact versions and pilot resource ranges", treatment: "Asked; runtime pilot required" },
  { module: "13", concern: "Hard gates, alternatives, bounded advice and no-LLM outcomes", treatment: "Derived report" },
  { module: "14", concern: "Dated evidence, appraisal decisions, expiry, revalidation and reporting", treatment: "Visible monthly watchlists and review log" },
] as const;
