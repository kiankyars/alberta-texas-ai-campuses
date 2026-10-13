# Two independent AI campus development proposals

User goal: Build the entire project: two end-to-end projects, Texas and Alberta. Neither is a benchmark. Each project is a complete evidence-backed concept/pre-feasibility development proposal for 100 MW IT load, phased 25/50/75/100 MW. Deliver a polished interactive website, independent downloadable dossiers, auditable model, technical drawings and execution package. Physical construction, land control, grid approval, paid procurement, and communications are outside this artifact-building request and must never be implied complete.

Scope: facility development and leasing powered/cooled IT capacity. GPU procurement/cloud revenue are outside the base asset boundary, clearly explained. Alberta native CAD, Texas native USD. Each project has its own location, power pathway, cost assumptions, schedule, risks and decision. Complete conceptual work with explicitly marked unresolved external confirmations, no invented quotes, commitments, parcel availability or approvals.

Content contract for research agents: data/<region>.json
- id, name, subtitle, region, currency, asOf (2026-10-13), verdict, thesis, executiveSummary (array of prose)
- site: name, municipality, addressOrArea, lat, lon, coordinateBasis, landStatus, areaHa (concept assumption), rationale, mapUrl, constraints (array), alternatives (array of {name,reason,decision}), sourceIds
- power: strategy, gridVoltageKv (design assumption unless sourced), gridRoute, generationRoute, utility, constraints (array), sourceIds
- cooling: strategy, climateImplications, waterStrategy, sourceIds
- permits: array {name,authority,requirement,sequence,assumedMonths,status,sourceIds}
- delivery: array {name,startMonth,endMonth,dependency,output,status} with project-relative months, no asserted utility energization date
- procurement: array {package,specification,quantity,leadMonths,status,sourceIds}
- commercial: customer, offering, contracting, financing, goToMarket (array), counterpartyQuestions (array)
- risks: array {risk,impact,mitigation,trigger,owner,sourceIds}
- gates: array {name,proof,owner,status}
- sources: array {id,title,url,publisher,published,accessed,claim,limitation}; primary sources verified through browse, quoted minimally
- assumptions: array {id,label,value,unit,basis,status,sourceIds} covering own regional economic and engineering factors
- modelOverrides: {energyPriceMwh,basePue,facilityCapexPerKw,landCostM,gridCostM,powerPlantCostM,softCostPct,contingencyPct,fixedOpexM,variableOpexPerKwYear,leaseRateKwMonth,debtPct,interestPct,debtYears,equityDiscountPct,occupancyPct,loadFactorPct,firstOperationMonth,phaseIntervalMonths}; values independently justified AS ESTIMATES, current prices not asserted without source
- killCriteria (array), nextActions (array)
Research markdown docs/<region>-dossier.md: complete coherent narrative, technical/commercial/site/permit/schedule/procurement/finance/risk/evidence treatment. Root will add model-derived values and drawings.

Engineering module agent owns src/model.mjs, tests/model.test.mjs, docs/engineering-basis.md only. Export defaults, calculate(project, overrides={}), annualCashFlows(project, overrides={}), sensitivity(project, overrides={}), engineering(project, overrides={}). API returns finite values for valid inputs, robust validation. Regional inputs = defaults + project.modelOverrides + overrides. Model nominal local currency, no FX blending, all $ outputs annotated. Assume N=20 operating years, 25 MW increments; express lease per committed kW, electricity pass-through on metered consumption, costs/revenues separated. Include CAPEX breakdown without double counting, PUE/load/occupancy distinct, DSCR/debt service, unlevered and levered cash flow with construction phasing and terminal value explicit; break-even lease, sensitivity. Engineering dimensions, electrical losses, cooling duty/flow, rack counts, redundancy (concurrent maintenance target, not certified) explicit. Root will adapt website to module's documented output fields. Independent tests for dimensional identities and edge cases.

Acceptance: both proposals populated independently; source links and assumption provenance; functioning interactive scenarios/reset/export/download; dimensioned campus/layout/single-line/cooling/schedule diagrams; financial/capacity validation; responsive browser QA desktop/mobile; separate downloadable project reports and raw data/models; deployed private Site with exact source commit. Claims of readiness must match evidence. Preserve existing repositories untouched.
