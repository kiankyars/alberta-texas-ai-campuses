# Alberta & Texas AI Campuses

[Live site](https://kiankyars.github.io/alberta-texas-ai-campuses/) · [Repository](https://github.com/kiankyars/alberta-texas-ai-campuses) · [What would make the projects viable](docs/viability.md)

Two independent, end-to-end concept / pre-feasibility proposals: Alberta and Texas. Each contains its own site case, grid/generation strategy, technical design, financial model, permitting, delivery, commercial structure, risks, sources and execution gates. Neither is a benchmark.

## Deliverables

The interactive site is in `dist/`. Independent downloadable project packages are under `dist/downloads/alberta/` and `dist/downloads/texas/`. Each includes a PDF and editable Markdown dossier, vector drawings, raw project evidence/assumptions, calculated base case and executable model.

## Reproduce

Node 20+ and Python 3.11+ are required. No JavaScript dependencies are needed.

1. `npm run build` — assemble site data, diagrams and model-backed reports.
2. Install `requirements.txt` in a Python virtual environment, then run `python scripts/render_reports.py` and `python scripts/package.py`.
3. `npm test` — engineering, finance, project integrity and generated-package checks.
4. `npm run dev` — http://127.0.0.1:4318.

The site works as static files served over HTTP. Each project’s scenario is independent. Controls update the same audited model provided in the downloadable package. Inputs can be exported as JSON.

## Hosting

GitHub Pages is the canonical host. `.github/workflows/pages.yml` rebuilds the project data, reports and ZIP packages, runs verification, and publishes `dist/` on pushes to `main`. Pull requests run the same checks without publishing. All app and download URLs are relative, so the site works under the repository path.

The deployment's `build-info.json` records its source commit and SHA-256 hashes of the served files. No ChatGPT account, hosting runtime, credentials or API service is required by the site.

## Boundary

This work produces development proposals, not physical facilities, secured rights, certified engineering, procurement commitments or investment guarantees. Candidate site/control, approvals, available capacity, OEM performance/lead times, customer demand and financing require the proof specified in each project's decision gates. All costs are local-currency concept estimates. See SPEC.md and the reports for complete scope.

## Source ownership

- `data/alberta.json`, `data/texas.json`: independently researched source/assumption registers and project content.
- `src/model.mjs`: calculation engine; `src/view-model.mjs`: presentation aliases only.
- `src/drawings.mjs`: concept drawing generator.
- `docs/*-dossier.md`: authored project narratives.
- `dist/app.mjs`, `dist/style.css`, `dist/index.html`: application source (buildless).
- `scripts/build.mjs`: generates downloads and copies engine/data.

Evidence date: 13 October 2026. Do not treat historical site announcements as current availability. Financial returns exclude tax, inflation and terminal property value. See methodology for complete limitations.
