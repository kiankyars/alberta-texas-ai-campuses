# Artifact verification — 13 October 2026

This record verifies the concept artifacts and calculation behavior. External approvals, commercial feasibility and engineering certification remain open gates in each proposal.

| Requirement | Delivered evidence | Verification |
|---|---|---|
| Two independent projects | Separate Alberta/CAD and Texas/USD project definitions, candidate sites, pathways and decisions | Project integrity checks; neither project is a benchmark |
| Site and infrastructure | Real candidate references, mapped location basis, alternatives, gross land allocation, gas/grid/fibre/water questions | 33 source records with claim-specific limitations; candidate control explicitly unconfirmed |
| Concept engineering | Dimensioned campus, electrical single-line, cooling path and editable SVGs | Equipment/heat/flow equations tested; diagram ratings and connections reviewed |
| Underwriting | Monthly phased model; CAPEX/OPEX, energy pass-through, IDC, debt, IRR/NPV, DSCR, collateral, balloon, sensitivities | 18 calculation tests, including shared Alberta infrastructure funded in phase one and multiple-IRR handling |
| Execution | Permits, procurement release/delivery/install/test gates, acceptance criteria, operations, proposed customer terms and unsent requests | Independent Alberta/Texas content review; COD reconciles to assumed long-lead sequence |
| Independent downloads | Each PDF, Markdown proposal/execution, project JSON, calculated results, model source, source register and vectors | 4 generated-artifact tests; both ZIPs pass CRC and exact member-to-file checks |
| Web experience | Six sections per project; independent scenarios, reset, presets, scenario export and source filtering | All 12 views inspected at desktop and mobile widths; no document overflow; drawings/tables intentionally scroll internally |
| Scenario consistency | Economics inputs stay separate from the published design/delivery basis | M96 hypothetical first COD leaves base delivery milestones intact; region state isolation and reset checked |
| Financial export | Downloadable scenario JSON | Browser download parsed successfully; Texas base rent 195 and equity IRR 10.150713982474109% match engine |
| Reports | Alberta 34 pages; Texas 29 pages, with PDF bookmarks and source hyperlinks | All pages rendered to contact sheets; engineering and dense tables inspected at readable resolution; no missing glyphs or non-finite values |
| Serving | 17 Alberta and 16 Texas package files | Every local HTTP response matches its file bytes |

`npm test`: **28 passed, 0 failed** (18 model, 6 project, 4 artifact tests). Browser console contained no warnings/errors at the inspected checkpoints. GitHub Pages publication is verified separately against the exact pushed source commit and its generated `build-info.json`. The workflow also verifies PDF content and ZIP member integrity.

Original reviewed PDF SHA-256 (regenerated PDFs may differ in creation metadata):

- Alberta: `8277d029816004c7ad19485dbbee31e08d6dc15f1f263a2e4ff818e458e6ddaa`
- Texas: `0e52685f94aaa51351f6d791301337df74cee18c1a78567914ffe4068d7dfc69`

Material boundaries: all cost/rent/lead-time inputs remain estimates; zero terminal sale proceeds; no tax, escalation or GPU ownership; lease renewal tails are uncontracted. Alberta has multiple equity IRR roots and a terminal debt balloon. Both base cases have negative equity NPV at their selected hurdles. This result is retained rather than adjusted to imply investment readiness.
