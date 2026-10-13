# Common model and engineering basis

**Status: concept / pre-feasibility, 13 October 2026.** This is an inspectable calculation basis for two separate development proposals. Every equipment selection, cost, financing term and schedule here is a design assumption unless a project dossier gives a supporting source. It is not a stamped design, power reservation, cost quote, Tier certification, construction authorization or underwriting opinion. Each project retains its own native currency, inputs and commercial/power risks.

## Scope and accounting boundary

Each campus has **100 MW of IT capacity in four 25 MW phases**. The modeled business owns and leases powered/cooled facility capacity. It does not buy GPUs or sell cloud compute. Tenant occupancy is contracted IT kW; tenant load factor is average metered IT consumption divided by contracted IT capacity. Those quantities are independent.

The facility hard-cost input includes the building, on-plot civil works, transformers, UPS, an **independent emergency diesel system**, cooling, controls, campus fiber and commissioning. Land and off-plot utility works are separate. If `powerPlantCostM > 0`, that is a separate continuously operating primary plant, also owned by the project. It does not replace the emergency diesel equipment in this design. Removing diesel from an alternative proposal requires changing the equipment scope and facility hard-cost estimate, not just changing the narrative. Both normal plant and standby plant require separate emissions/noise/fire reviews.

For a grid-fed project, `energyPriceMwh` is a blended delivered energy allowance, including any tariff components allocated per consumed MWh. For an owner-operated generation project, it means **variable fuel, variable maintenance, emissions/carbon and any grid energy expense per delivered facility MWh**. It must not include the primary plant's capital recovery or fixed O&M: capital is already in `powerPlantCostM`, and fixed plant O&M must be in `fixedOpexM`. That boundary avoids charging for the plant twice. Uncontracted power-price risk, peak tariff ratchets, take-or-pay gas and pass-through enforceability remain material commercial questions.

## Calculation and API contract

`model.mjs` is browser-compatible JavaScript ESM, with no dependencies. All monetary outputs ending in `M` are **millions of the project's native currency**. Return percentages are percentage points, not fractions. Capacity is MW IT unless specified otherwise. All exports merge `defaults`, `project.modelOverrides`, then explicit scenario `overrides`; inputs are validated without silent type coercion.

```js
import { defaults, calculate, annualCashFlows, sensitivity, engineering } from './model.mjs';
const result = calculate(project, { occupancyPct: 85 });
```

| Export / output | Meaning |
|---|---|
| `defaults` | Frozen numerical fallback assumptions; regional overrides are the actual project basis. |
| `calculate(project, overrides)` | `{currency, inputs, capex, stabilized, finance, timeline, cashFlows, warnings}`. |
| `capex` | `facilityM, landM, gridM, powerPlantM, hardCostM, softCostM, contingencyM, totalM, breakdown[]`. Breakdown rows contain `id, label, amountM, basis`. Excludes IDC and refundable collateral. |
| `stabilized` | `occupiedItMw, averageItMw, averageFacilityMw, annualItMwh, annualFacilityMwh, baseRentM, electricityRevenueM, energyCostM, totalRevenueM, fixedOpexM, variableOpexM, ebitdaM, maintenanceCapexM, cfadsM, customerAllInKwMonth`. |
| `finance` | IDC, funding, debt draw, construction equity, peak cumulative equity deficit, total equity contributions, equity/unlevered NPV and IRR, IRR status, minimum annual DSCR, equity/unlevered break-even rent, yield on construction cost, terminal value/debt balloon, collateral and total cash flows. See exact names in the source. |
| `timeline` | `firstOperationMonth, finalOperationMonth, lastModelMonth, operatingYears, phases[]`. Each phase has phase number, IT MW, cumulative IT MW, construction start and operation month. |
| `annualCashFlows(project, overrides)` | Same annual array as `calculate().cashFlows`, without computing IRRs. |
| `cashFlows[]` | Model year, first/last month in year, operating months, annual-equivalent average online IT MW, ending online IT MW, facility MWh, ending debt balance and DSCR. Cash columns: `capexM, collateralDepositM, collateralReturnM, debtDrawM, capitalizedInterestM, baseRentM, electricityRevenueM, energyCostM, fixedOpexM, variableOpexM, ebitdaM, maintenanceCapexM, cfadsM, interestM, principalM, balloonM, debtServiceM, unleveredCashFlowM, equityCashFlowM`. |
| `sensitivity(project, overrides)` | Six one-variable-at-a-time rows with `variable, label, unit, low, base, high, lowNpvM, baseNpvM, highNpvM, lowIrrPct, highIrrPct, lowCustomerCostKwMonth, highCustomerCostKwMonth`. Other inputs remain at the scenario basis. |
| `engineering(project, overrides)` | Design MW/MVA, PUE, rack count, electrical losses, plus `transformer, phaseTransformer, ups, standby, cooling, qualifications`. Engineering sizes to `peakPue`; operating energy uses `basePue`. |

Undefined financial ratios are `null`, never fabricated as zero or Infinity. In particular no-debt DSCR is null; zero-occupancy break-even rent and tenant cost are null; IRR without a unique root found in the scan domain is null. Error messages identify the offending input. The API does not assert that valid numeric inputs are commercially or technically achievable.

## Operating equations

At full commissioned campus size:

```text
Occupied IT MW = 100 × occupancy / 100
Average IT MW = occupied IT MW × load factor / 100
Annual IT MWh = average IT MW × 8,760
Annual facility MWh = annual IT MWh × annual PUE
Base rent = occupied IT MW × 1,000 × rent per kW-month × 12
Electricity revenue = energy expense = annual facility MWh × price per MWh
Variable operating expense = occupied IT kW × variable expense per kW-year
EBITDA = base rent + electricity revenue − electricity expense − fixed OPEX − variable OPEX
Maintenance capital = (facility + primary-generation hard cost) × annual maintenance-capital rate
CFADS = EBITDA − maintenance capital
```

Each commissioned phase immediately reaches the chosen steady occupancy; no customer ramp, bad debt, outage, SLA credit or collection lag is assumed. Fixed OPEX and maintenance capital scale with commissioned phases, including at zero occupancy. Actual sitewide staffing and insurance may be more front-loaded. At zero tenant load the model has zero metered energy: actual unloaded UPS, security, lighting and mechanical energy would worsen the result. Annual PUE is constant through occupancy/load scenarios and requires low-load and hourly validation. All years use 8,760 hours; no leap-year effect is modeled.

Pass-through changes deliberately do **not** create landlord EBITDA. Energy cost still changes the customer's all-in payment and competitive viability. `customerAllInKwMonth` divides base rent plus energy by committed kW-month, not metered kWh.

The maintenance reserve is a level annual capital allowance, not an OEM overhaul forecast or debt-funded expense. Fixed OPEX must cover operating labor, insurance, property/local taxes, security, routine facilities/plant maintenance and administration; variable OPEX must not duplicate the variable costs inside the energy input.

## Construction, financing and valuation

Hard cost equals facility cost plus land, grid connection and primary generation. Soft cost is a percentage of **all hard costs including land**; contingency is a percentage of **hard plus soft costs**. This mechanical base is explicitly visible to avoid ambiguous percentage application. Soft cost is not a loan fee. Facility hard cost is allocated 18% shell, 40% electrical/UPS/standby, 22% cooling, 10% civil, 5% controls/security/fiber and 5% commissioning; these are concept allocations, not a quantity-survey estimate.

The engine runs monthly, beginning at M0. Land and off-plot utility cost, including their proportional soft cost and contingency, are spent uniformly M1–M12. Facility cost is allocated equally to four phases. Primary-generation cost uses `generationPhaseShares`, four validated **cost fractions**, summing to one; equal quarters are the fallback. These are distinct from the fraction of physical gas modules installed in each phase.

Alberta installs 6 / 9 / 13 / 16 cumulative gas modules, or incremental engine-count fractions 6/16, 3/16, 4/16 and 3/16. Its CAD360m plant allowance separately allocates **all CAD55m of shared gas lateral (CAD25m) and BESS (CAD30m) to phase 1**, because both must be available for first operation. The remaining CAD305m is allocated by incremental engine counts, giving phase plant costs **CAD169.375m / 57.1875m / 76.25m / 57.1875m**. Accordingly `generationPhaseShares` is `[0.4704861111111111, 0.15885416666666666, 0.21180555555555555, 0.15885416666666666]`. These cost shares do not alter the 6 / 9 / 13 / 16 module schedule. Engine-related balance of plant and dedicated civil/electrical works within the CAD305m still follow a proportional approximation; a quantity-based procurement estimate may require additional early common expenditure.

Facility and allocated plant costs are each spent evenly during the relevant phase's `constructionMonths`, ending one month before that phase's operation month. The full gas lateral and BESS allowance is therefore spent before first operation, but its exact supplier deposit, manufacturing milestone and site-payment timing is **not modeled**. Maintenance capital follows commissioned facility and commissioned plant cost separately. All land/grid common costs are allocated equally to the four phase loan tranches. This assumes early, at-risk common expenditure and does **not** implement the real project's conditional capital-release gates; actual land options, reservation deposits, cancellation exposure, civil sequencing and grid security requirements need a procurement-specific funding curve. The schedule sensitivity moves both phased construction spending and operation dates, while common M1–M12 costs stay fixed. It is not a sunk-cost delay scenario: deferring a negative-NPV project may make its present loss smaller, which does not establish a benefit from construction delay.

Each tranche draws `debtPct` of its construction spending; equity funds the remainder. Monthly interest is `interestPct / 12` times opening balance plus half of that month's new draw. Before a phase operates, interest is capitalized and fully debt financed. IDC is shown separately from construction CAPEX, added to financed principal, and is not also subtracted as an equity-funded cost. Therefore `debtPct` is the proportion of construction CAPEX financed, **not** the final debt-to-total-funding ratio. A lender has not committed to financing IDC.

Starting in the phase's first operation month, its loan pays level monthly principal and interest over `debtYears`. At zero interest, payments are straight-line principal. There is no interest-only operating period, refinancing or sculpting. A remaining balance at the model endpoint is explicitly repaid as a terminal balloon. Monthly identities are preserved in annual aggregation:

```text
Closing debt = opening debt + construction draws + capitalized interest − principal − final balloon
Unlevered CF = CFADS − construction CAPEX − collateral deposit + collateral refund
Equity CF = unlevered CF + construction debt draws − cash interest − principal − final balloon
```

Utility collateral is assumed cash funded by equity at M1, locked throughout the model, and refunded at the endpoint; it is not a cost, rent or depreciable asset. This is a conservative liquidity convention, not a contractual statement about when a utility returns security. Earlier milestone release, letter-of-credit alternatives, interest on cash and financing fees are excluded. `constructionEquityM` excludes subsequent operating losses; `maximumCumulativeEquityDeficitM` shows the largest cumulative net equity funding requirement assuming interim cash is retained, while `totalEquityContributionsM` totals negative equity cash flows without netting interim distributions. Neither includes additional lender reserves or discretionary working capital.

The horizon is **20 operating years from the first phase**, plus construction. Later phases therefore have fewer than 20 modeled operating years. Partial calendar years are retained. This deliberately assigns **zero terminal enterprise value and zero land residual value**, with no terminal sale costs or decommissioning expense. Debt is still fully settled. Expanding the horizon changes that assumption; a resale multiple is not hidden in returns.

NPV discounts each monthly cash flow using `(1 + annual hurdle)^(month/12)`. Both equity and unlevered NPV use the displayed `equityDiscountPct` as a common user-selected hurdle. The unlevered number is not an independently estimated WACC valuation. IRR is an annual effective rate calculated from monthly timing. The solver scans annual log-growth rates from −99.99% to 10,000%, bisects sign-changing roots, and reports a value only when one scanned root is found. Nonconventional cash flows can have multiple roots; the scan is not a symbolic proof against arbitrarily close/tangent roots, and `equityIrrStatus` / `unleveredIrrStatus` expose that qualification.

DSCR is annual CFADS divided by that year's cash interest plus principal, including a terminal balloon. Construction equity is not in the numerator. The minimum is across years with debt service; cash-flow insolvency is not hidden by clipping negative ratios. `minOperatingDscr` separately excludes the terminal balloon from the denominator, so normal operating coverage and terminal liquidity can be distinguished. Neither is a lender covenant definition. Yield on construction cost is stabilized EBITDA / CAPEX, before maintenance capital and IDC. Break-even base rent solves a **zero equity NPV at the chosen hurdle**; the separate unlevered break-even solves zero unlevered NPV. It is not merely an operating break-even.

Cash flows are nominal local-currency amounts with **zero escalation/inflation assumed**. Corporate/income tax, tax depreciation, sales-tax timing, depreciation shields, tax incentives/grants, loan/arrangement fees, debt-service reserve, construction revenue, receivable/payable working capital, compute hardware and revenue, terminal asset value and decommissioning costs are excluded. The outputs are pre-tax scenario results. No FX comparison is performed.

## Electrical and thermal concept

| Item | Calculation / sizing rule |
|---|---|
| IT | 4 × 25 MW; planning density 100 kW per rack yields 250 rack positions per phase and 1,000 total. Other rack densities round positions upward per phase while capacity remains 25 MW. |
| Peak facility input | `100 MW × peakPue`. Annual average PUE is used only for energy. Texas input 1.40, for example, implies 140 MW at design peak, independent of contracted occupancy. This is a preliminary sizing proxy, not an equipment/weather load calculation. |
| Electrical overhead | Default 4 MW of IT-relative electrical losses, with the remaining peak overhead assigned to cooling/auxiliaries. Losses are included within PUE; not added a second time. |
| Primary substation | 50 MVA units; duty count is ceiling of peak MW / power factor / 50; add one spare. A 140 MW, 0.95 PF example requires 147.37 MVA and 3 duty + 1 spare, 200 MVA installed / 150 MVA after one loss. Power factor 0.95 is an assumption. |
| Phase transformation | 10 MVA units; duty count is ceiling of phase peak MVA / 10; add one spare per phase. A 35 MW phase at 0.95 PF has 36.84 MVA duty: 4 duty + 1 spare, 20 installed units campus-wide. |
| IT UPS | 5 × 5 MW duty + 1 × 5 MW spare per phase. 120 MW installed, 100 MW firm IT. Five minutes at 100 MW is 8.333 MWh delivered; at assumed 90% delivery efficiency, 9.259 MWh stored. End-of-life, discharge-rate, temperature and reserve margins must be separately specified. |
| Standby | Net-at-site 5 MW emergency-diesel blocks; ceiling of phase peak MW / 5 plus one spare per phase. At 140 MW campus peak this is 7 duty + 1 spare per phase: 32 units / 160 MW installed. Nameplate catalog capacity cannot substitute for derated net site capacity. Fuel runtime and refueling are unquantified. |
| IT liquid capture | Assumed 90% of IT heat enters liquid, leaving 10 MW residual air heat at full IT load. Rack vendors must confirm that split. |
| Liquid loop | Preliminary facility supply/return design **35/45°C**, 10 K rise. 35°C is within the maximum supply associated with ASHRAE W40, subject to selected IT/OEM acceptance. CDU secondary temperature and approach must be verified; thermal class alone is not an equipment warranty. |
| Indoor liquid flow | `mass flow kg/s = liquid kW / (4.186 kJ/kg-K × 10 K)`. At 90 MW: 2,150.024 kg/s. Using assumed density 997 kg/m³ gives 7,763.376 m³/h. This is circulating clean water, not consumption or utility withdrawal. |
| CDU modules | 2.5 MW units; at 22.5 MW liquid duty per phase, 9 duty + 1 spare; 40 units total. Installed CDU rating must be at actual liquid temperatures and flow. |
| Heat rejection | Conservatively size the campus rejection boundary to all peak facility power. At 140 MW, a clean-water-equivalent 10 K circuit is 3,344.481 kg/s or 12,076.363 m³/h. Some losses are actually dissipated outdoors; this is an aggregate upper-bound heat balance, not a single mandatory loop flow. |
| Heat-rejection blocks | Net-at-design-ambient 5 MW blocks; ceiling of phase heat duty / 5 plus one spare per phase. At 140 MW: 7 duty + 1 spare per phase, 160 MW installed. Regional dry-cooler/mechanical-trim design must deliver that rating at local peak conditions. |

Outdoor freeze-protected glycol has different heat capacity, density and viscosity from the clean-water reference. The `coolantSpecificHeatKjKgK` and `coolantDensityKgM3` inputs allow alternate preliminary checks; actual fluid concentration, minimum outdoor temperature, pressure drop, pipe diameters, pump curves and heat-exchanger approach require engineering. A 10 K temperature rise is not evidence that free cooling works in summer. Residual room-air cooling needs a separate appropriately rated air-handling/chilled-water path; the 35°C liquid supply is not a room-air cooling set point. Texas's mechanical trim and Alberta's freeze protection have different requirements even though their conservation equations are the same.

The full 100 MW of IT electricity ultimately becomes heat; facility electrical and mechanical consumption adds heat within the boundary. **Primary gas-plant exhaust/radiator heat and fuel energy are outside data-center PUE** and require separate plant heat rejection/emissions design. Dry cooling does not justify a zero total-water claim: potable use, leakage, flushing, fire reserve, and any optional adiabatic cooling remain unresolved. Annual WUE cannot be inferred from loop circulation.

N+1 quantities prove only installed capacity after one module outage. They do not prove concurrent maintainability, fault tolerance or certification. The engineering package still needs sectionalized buses/valves, maintenance isolation, diverse A/B distribution, rack transfer compatibility, selectivity, grounding, arc-flash/fault studies, harmonic/dynamic-load studies, generator start and load acceptance, cooling/control ride-through and thermal buffer sizing. The UPS schedule currently reserves IT ride-through; it does not silently claim the cooling system is UPS-backed. The commercial availability SLA is conditional on those studies and a commissioned failure-mode test plan.

## Evidence and limits

Primary materials accessed 13 October 2026:

1. [US Department of Energy, Cooling Water Efficiency Opportunities for Federal Data Centers](https://www.energy.gov/cmei/femp/cooling-water-efficiency-opportunities-federal-data-centers). Supports annual PUE = facility energy / IT energy, WUE = water / IT energy, the distinction between circulating systems and evaporative consumption, and separation of direct-liquid and residual-air paths. It does **not** support this project's numerical PUE, cost, schedule or water allowance.
2. [ASHRAE Handbook, Chapter 20: Data Centers and Telecommunication Facilities](https://handbook.ashrae.org/Handbooks/A23/IP/A23_Ch20/a23_ch20_ip.aspx). Supports rack-level load characterization, liquid-cooling interfaces, dependence on workload/low-load behavior, and the need to coordinate reliability across facility systems. Its water-class discussion identifies class labels by maximum facility supply temperature. It does **not** certify the proposed rack density, redundancy or OEM compatibility.
3. [ASHRAE, 2021 Thermal Guidelines liquid-cooling reference card](https://www.ashrae.org/file%20library/technical%20resources/bookstore/supplemental%20files/therm-gdlns-5th-r-e-refcard.pdf). Identifies W40 among facility water-supply classes. The proposed 35/45°C operation remains an assumption requiring equipment confirmation.

Costs and financial terms are project estimates, not drawn from those thermal references. The documentation separates source-supported definitions from author-created sizing and arithmetic so the proposal can be reviewed without confusing an assumption with a vendor commitment.

## Verification

Run `node --test tests/model.test.mjs`. Tests reconcile CAPEX and monthly capacity exposure, source/use cash flows, IDC/debt balance and amortization, electricity pass-through, zero-debt and zero-interest cases, zero occupancy and invalid inputs, negative and undefined IRRs, zero-NPV break-even rents, refundable collateral and terminal balloon, and independent electrical/hydraulic/thermal equations. Sensitivities check the direction of economically relevant changes. A passing test establishes calculation consistency, not external feasibility.
