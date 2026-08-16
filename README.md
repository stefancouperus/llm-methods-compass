# LLM Methods Compass — Qualitative Text Research Advisor

A local-first advisory dashboard for deciding whether and how downloadable language models may assist **qualitative analysis of written or transcribed text**. It does not advise on qualitative analysis of audio, video, photographs or other image content. Scanned document pages enter only when text or page layout must be recovered or verified. Advice is based on the research goal, source format and access, collection size, language, task, human checking, error priorities, model openness, available computing and sustainability. It turns researcher-entered project descriptions into:

- a transparent operation and decision map;
- a generic architecture register spanning source representation, retrieval, classification, extraction, contextual coding, interpretation, and deterministic aggregation;
- a bounded model/component portfolio;
- operation-specific explanations of why each route is proposed, what evidence could justify it, and what could rule it out;
- a prompt-comparison proposal, including coding-guide readiness and base/instruction/project-adaptation distinctions;
- a project-conditioned validation contract tied to epistemic influence, review coverage and downstream use;
- task-specific human-reference, robustness and claim-sensitivity requirements with scholarly sources;
- optional cross-model corroboration, explicitly marked as an experimental supplement rather than independent validation;
- a formula-only local/HPC resource pilot; and
- downloadable JSON and Markdown advisory packets.

The advisor covers **open-weight models running on a researcher's own computer or an institutional HPC cluster**. It does not recommend proprietary models or commercial AI APIs. The dashboard does **not** ingest research corpora, execute prompts, download models, connect to an HPC, or submit jobs.

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

Open the local address printed by the development server. The dashboard starts with a generic blank questionnaire. **Load example** opens a completed worked case; **Start blank** returns the intake to its generic defaults. **Save draft** uses browser storage on the current device only.

## AI and external-service dependencies

The running dashboard does not call an AI API or run an AI model. Its advice is produced by transparent rules in `app/page.tsx`, a deliberately maintained benchmark registry in `app/model-registry.ts`, and a static discovery snapshot in `app/model-discovery.json`. No API key, model server, database, upload service or network connection is required while a researcher uses the questionnaire and recommendations. External evidence and model links are references, not runtime dependencies.

Automated evidence discovery introduces two limited **build-time data dependencies**: a scheduled GitHub Actions job queries public Hugging Face Hub metadata for model leads and public Crossref metadata for recent scholarly work, writes separately dated snapshots, and rebuilds the static site. It performs no inference and needs no API token. The dashboard always displays both snapshot dates. Automatically found repositories appear in a separate **Provisional model candidates** category; newly found publications remain a bibliographic screening queue. Neither becomes a curated recommendation or a methodological rule without human review.

The application still requires its ordinary open-source web packages to be installed and built. Once deployed, GitHub Pages serves static files and does not require a server-side application.

## Validate a change

```bash
npm run build
npm test
```

## Deploy with GitHub Pages

The project contains a dedicated static build and deployment workflow. Put the contents of this `dashboard/` folder at the root of the repository, then:

For a concise first-publication and day-to-day update guide, see [`UPDATE_AND_PUBLISH.qmd`](UPDATE_AND_PUBLISH.qmd) (or its self-contained rendered copy, [`UPDATE_AND_PUBLISH.html`](UPDATE_AND_PUBLISH.html)).
The importable [`MONTHLY_EVIDENCE_REVIEW.ics`](MONTHLY_EVIDENCE_REVIEW.ics) adds a recurring human-review reminder for the 15th of every month.

1. create the GitHub repository and push the files to its `main` branch;
2. open **Settings → Pages** and select **GitHub Actions** as the source;
3. open **Settings → Secrets and variables → Actions → Variables**, create `ENABLE_PAGES_DEPLOYMENT`, and give it the value `true`;
4. open **Settings → Actions → General → Workflow permissions** and allow read/write access so the scheduled job can preserve the refreshed snapshot;
5. open **Actions → Deploy dashboard to GitHub Pages** and run it manually once, or push another commit to `main`; and
6. use the Pages URL shown by the successful deployment.

The deployment variable is deliberately absent or `false` while the project is private-only, so ordinary pushes cannot accidentally publish the site. The workflow derives the repository subpath from GitHub Pages, so project sites such as `https://username.github.io/repository/` work without hard-coding a repository name. Repository privacy and website access are separate decisions: GitHub Pages is normally public even when its source repository is private, unless an eligible organization account supplies private Pages access control.

### Monthly model and literature discovery

The **Deploy dashboard to GitHub Pages** workflow refreshes the two discovery queues at 04:23 Europe/Amsterdam on the 14th of each month. GitHub may delay scheduled work, so the displayed dates—not the nominal schedule—are authoritative. The following day's calendar reminder supplies the human checkpoint.

Each successful model refresh:

1. queries both recently modified and frequently downloaded public repositories for seven generic task streams: embeddings, rerankers, encoder backbones, span/entity extraction, sequence transformation, instruction models, and document OCR/vision;
2. excludes gated/private repositories and obvious adapters, merges and quantized derivative packages;
3. deduplicates declared model lineages and records immutable revisions, license metadata and source links;
4. updates `app/model-discovery.json`; and
5. rebuilds and deploys the dated static dashboard.

The same run searches Crossref for recent work on qualitative research, text annotation and measurement, validation and downstream inference, prompting and reproducibility, historical or multilingual text, and open/local model use. It updates `app/literature-discovery.json` with metadata leads marked `screening_required`. The automated list is deliberately not integrated into advice: a researcher must read and appraise publication status, methods, scope, limitations and relevance before changing the QMD, rule set or curated reference library.

Every appraisal is preserved separately in `app/literature-review-decisions.json`. Each discovered item receives an explicit decision—integrated, already covered, superseded, background only or outside scope—plus a reason and the QMD modules considered. The first 18-item appraisal was researcher-confirmed on 16 August 2026. The dashboard compares the appraised snapshot identifier with the latest discovery snapshot. After the next automatic discovery refresh it will therefore show **review required** until a new set of decisions is recorded; neither an automated search nor an AI-assisted first pass can present itself as a completed scholarly literature review.

The update is therefore deliberately **semi-automated**. GitHub automates metadata discovery, validation, dating and preservation. A researcher still decides whether a discovered model is adequately documented and worth benchmarking, and whether a publication changes the QMD, curated reference library or advisory rules. Discovery never promotes an item automatically.

After checking the promoted sources and all decision reasons, the project owner records confirmation in that file by changing `confirmationStatus` to `researcher_confirmed` and entering `confirmedBy` and `confirmedAt`. Any disagreement should instead revise the relevant decision, QMD passage and curated reference entry before confirmation. The next static build will display the confirmed status; no browser-only click can alter the scholarly record.

If either API is unavailable or returned data fails validation, the workflow fails without replacing the last valid snapshot. A manual refresh is available through the same GitHub Actions workflow. Locally, use `npm run refresh:models` and `npm run refresh:literature`; validate snapshots with the same commands plus `-- --validate`.

To test the exact Pages artifact locally:

```bash
npm run build:pages
npm run preview:pages
```

## Main files

- `app/page.tsx` — intake, decision logic, recommendation and local export
- `app/model-registry.ts` — dated documentary candidates, kept separate from the interface
- `app/model-discovery.json` — automatically refreshed metadata leads shown as provisional model candidates
- `app/literature-discovery.json` — automatically refreshed bibliographic screening queue
- `app/literature-review-decisions.json` — human appraisal log tied to one exact discovery snapshot
- `app/research-references.ts` — curated, reviewed dashboard reference library and QMD coverage map
- `scripts/refresh-model-discovery.mjs` — reproducible public Hub query and validation rules
- `scripts/refresh-literature-discovery.mjs` — reproducible public Crossref query and validation rules
- `.github/workflows/pages.yml` — static Pages deployment and monthly evidence-refresh automation
- `vite.pages.config.ts` — repository-subpath-aware static build
- `app/globals.css` — responsive visual system
- `app/layout.tsx` — page and social-preview metadata
- `.openai/hosting.json` — no D1/R2 capabilities declared
- `tests/rendered-html.test.mjs` — server-render and product-boundary checks

## Methodological status

The named models are dated options to test, never asserted winners. For direct application of a coding guide, the normal generative starting point is an instruction-tuned open-weight checkpoint rather than its base checkpoint. This is only a starting condition: a valid recommendation still requires a stable coding guide, trusted examples created by people, separate tests of passage finding and labelling, error checks across relevant periods and source groups, a record of the exact model/software/instructions, and a small trial measuring memory, speed, storage and resource use. Project-specific adaptation enters only as a comparison after direct prompting remains inadequate and suitable validated examples exist.

Validation advice is generated for the stated project use, not for a model in the abstract. The rule set combines the selected research operations with their gatekeeping role, the extent of independent review, the furthest downstream use, construct type, claim dependence and possible error amplification. Where labels or extractions feed counts, trends or statistical analysis, the advice adds a downstream claim stress test and, where appropriate, design-based or measurement-error correction. Where interpretation is involved, it prioritises researcher-first reading, source traceability, counterevidence and alternative readings.

The optional multi-LLM routes—blind recoding, model criticism, candidate union and model-panel review—are deliberately labelled **experimental supplements**. They can expose sensitivity to model choice or focus human review, but agreement among models is not treated as proof of construct validity, source fidelity or unbiased inference.
