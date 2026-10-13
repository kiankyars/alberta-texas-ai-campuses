# Texas execution package

**Temple AI Campus · 100 MW IT · 13 October 2026 · concept / pre-feasibility · USD**

This appendix turns the proposal into work packages, proposed contract terms and acceptance evidence. Every date, staffing figure and target below is a planning assumption. It is not an approved operating procedure or purchase authorization. All request templates are **unsent**.

## Delivery logic and capital releases

M0 is a future authorized restart after regulatory clearance. The current hold adds an unknown period before this clock. Base first acceptance is **M48**, with cumulative 50/75/100 MW IT at M54/M60/M66.

The 30-month HV allowance is measured from a technically frozen order to arrival on site, including factory tests and freight. The sequence is M12 order → M42 delivery → M46 installation/site tests → M48 integrated acceptance. An order first released at M18 FID instead yields a minimum M54 first COD on the same allowances. Utility or permit delay moves the entire path.

An M12 purchase creates real pre-FID cancellation exposure. Authorize it separately only after the utility interface is mature, the land option permits the intended development, supplier terms identify the exposure and equity can absorb a cancellation. A refundable slot reservation is not treated as a full equipment order unless the supplier commits the manufacturing start and delivery date. The shared financial model uses a simplified early common-cost cash curve; replace it with accepted contract milestones before financial close.

| Work package | Tender / technical freeze | Release / delivery | Installation and acceptance | Responsible / capital gate |
|---|---|---|---|---|
| TSP interface and off-site works | M0–12; settle voltage, peak/ramp, fault levels and protection boundary | Study/connection scope by M18; field completion target M42–46 | Energization authority before M46–48 tests | Power lead; utility agreement and funded security |
| Four 50 MVA primary transformers and associated HV equipment | RFQ M3–9; technical freeze M12 | M12 release; 30 months to M42 on-site | M42–46 SAT; no capacity accepted before tests | EPC electrical lead; separately approved pre-FID exposure |
| First-block MV/LV package | RFQ M9–12; interface freeze M16 | M16 release; 24 months to M40 | M40–46, coordinated with protection tests | Electrical lead; conditional release then FID |
| First-block UPS / emergency standby | RFQ M12–16; duty and net ratings frozen M18 | M18 release; 22 months to M40 | M40–46 SAT; M46–48 integrated test | Electrical/air leads; compliant engine specification and permitted operating envelope |
| First-block CDUs / dry rejection / trim | RFQ M14–18; customer temperatures frozen M20 | M20 release; 18 months to M38 | M38–44 assembly; M44–48 thermal/controls tests | MEP lead; customer interface, water and structural design |
| Civil / first hall | Survey/design M0–18 | Permitted enabling works M18–28; hall package M24 onward | Weather-tight target M36; ready for MEP and commissioning | Civil/EPC lead; permits, FID, drainage and access |
| Diverse external fiber | Two route proposals by M18; paths fixed M28 | Binding release by M30; 12 months to M42 | Route tracing, loss and failover tests M42–46 | Network lead; rights of way and independent path evidence |
| Controls, meters, commissioning agent | Controls RFQ M20–26; independent agent engaged M24 | Controls release M30; 12 months to M42 | FAT/SAT and script review, then M46–48 witness | Commissioning authority; owner-approved interface and test matrix |
| Later blocks | Repeat technical brief with lessons from first block | Order against each COD minus lead/install/test time; phase procurement is overlapping | Accepted at M54/M60/M66 only when complete | Commercial/EPC leads; each phase lease, power and capital gate |

Supplier quotations must distinguish manufacture, FAT, freight, customs/tax, storage, installation, energization and warranty start. Require net performance at design conditions, cancellation schedules, drawing-review deadlines, interface responsibilities, escalation and damages caps. Do not fund supplier deposits from debt assumed available before lender conditions precedent.

## Commissioning and acceptance matrix

The owner’s engineer and tenant must approve the final test specification before equipment release. Proposed numeric targets below define what a tender must answer; they are not manufacturer guarantees. Tests use approved switching, safety and load-bank plans under competent site supervision.

| System / test | Proposed measurable acceptance evidence | Required input still unresolved | Witness / release |
|---|---|---|---|
| IT capacity and metering | Demonstrate 25 MW IT continuously for an initial 8-hour capacity run per block; calibrated IT and facility meters reconcile within an agreed 1% accounting tolerance | Actual tenant load-bank profile, instrument accuracy, allowable transient envelope | Independent commissioning authority + tenant; rent start only after accepted report |
| Peak thermal duty | Equipment schedule supports 35 MW facility heat rejection per block at 43°C dry bulb with one 5 MW rejection module unavailable; document 46°C stress-case output and any derating | Site design weather, vendor curves, exact indoor conditions, glycol properties, fan/pump power | MEP engineer; OEM certified curves plus witnessed functional evidence; annual PUE remains modeled until measured |
| CDU/liquid path | 22.5 MW liquid duty per block at the agreed 35/45°C facility-loop basis, with one 2.5 MW CDU unavailable; balance and record flows, pressures and temperatures | Tenant secondary-loop temperature/chemistry, HX approach, pipe losses and allowed pressure | MEP + customer engineer; no final guarantee until interface is agreed |
| Residual room cooling | Demonstrate 2.5 MW residual IT heat per block plus relevant room losses, within tenant rack inlet limits, under one specified component fault | Exact air-cooled equipment share, air-flow paths and inlet limits | MEP/tenant; independent room cooling path required |
| Primary transformer resilience | At 140 MW campus peak and PF ≥0.95, 3 remaining 50 MVA units retain ≥147.37 MVA aggregate capacity; document that buses and protection can actually deliver it | TSP fault levels, impedance, sectionalization and common-mode studies | Electrical engineer + utility; arithmetic alone cannot release the gate |
| UPS N+1 and battery | Each block sustains 25 MW IT with one 5 MW module unavailable; demonstrate the specified 5-minute delivered autonomy or an accepted equivalent test | End-of-life battery sizing, temperature/discharge margin, actual voltage/frequency limits | OEM + commissioning authority; no interruption outside the approved customer envelope |
| Utility failure / standby | Each block has 35 MW net standby duty after one unit unavailable; integrated utility-loss and restoration tests stay inside customer electrical and thermal envelopes | Site-derated 5 MW unit ratings, start/load-step time, transfer/protection sequence and cooling/control ride-through | Utility, OEM, commissioning authority and tenant; UPS-only IT support does not prove cooling continuity |
| Fuel resilience | Verify tank usable volume against an initial **24-hour design-runtime target** at agreed critical load; independently test telemetry, containment and delivery access | OEM fuel curve, legally permitted storage, replenishment SLA and outage demand; runtime is not yet proven | Environmental/fire/operations leads; revise target or CAPEX before contract if infeasible |
| Fault / maintenance isolation | Complete a failure-mode matrix covering each electrical/cooling isolation boundary; witness representative failures with no loss outside the contractual tolerance | Agreed single-failure set, allowed maintenance windows and tenant tolerance | Independent commissioning authority; no certified availability claim |
| Fiber diversity | As-built route audit confirms two separate paths and entrances; demonstrate agreed service continuity under one carrier/path failure | Latency, bandwidth, packet loss/recovery limits and verified off-site shared structures | Network engineer + tenant; two carriers alone do not pass |
| Water / leak response | Verify separate mains/makeup metering, measured service pressure/flow and leak alarm/valve response to an approved test; record commissioning fill separately | City allocation, fire-flow design, domestic actuals and leakage response time | Civil/MEP/fire authorities; 15 m³/day is an allowance, not a pass/fail demand guarantee |
| Controls / cyber / handover | All critical points commissioned; all critical alarms delivered and acknowledged; restore from tested configuration backup; zero open critical defects at acceptance | Asset inventory, OT threat assessment, alarm classification and tenant interfaces | Controls lead + owner; signed as-builts, training, spares and operating procedures required |

The integrated proving period is an initial **72-hour owner target** under agreed varying load and approved fault demonstrations. Eight-hour individual capacity runs may form part of it. Do not promise a 43°C ambient site test on a particular date: use certified performance mapping plus witnessed testing, or defer seasonal verification with an agreed retention and remedy. No unavailable criterion may be silently treated as passed.

## Operating organization and budget basis

At full build, assume **40 direct operations FTE** as a scoping allowance: 24 rotating critical-facility FTE covering four simultaneous posts, with six FTE per post for roster/leave/training relief, 8 day-maintenance/controls positions, 4 facility management/compliance/planning positions and 4 network/service coordination positions. This is not a staffing minimum derived from law or an OEM requirement. Validate skill mix, shift calendars, absence/training relief and local labor costs before contracting. Physical security is a separately contracted 24/7 service, included in the staff/security budget allowance rather than these 40 FTE.

The existing USD6m/year staffing/security provision can provisionally allocate USD4.8m to 40 direct FTE at USD120,000 loaded annual cost each and USD1.2m to contracted security. Both are owner estimates, not market salary or vendor quotes. They may be inadequate once overtime, benefits and the actual security-post plan are priced; replace them before FID. OEM emergency support and specialized maintenance also draw on variable OPEX and the maintenance reserve. Texas's fixed OPEX includes separate property-tax, insurance and compliance/admin allowances.

| Responsibility | Staffing / service assumption | Routine control | Escalation and evidence |
|---|---|---|---|
| Incident command and dispatch | One appointed shift lead; continuous critical facilities coverage | Shift handover, alarm review, permit-to-work, change freeze during incidents | Immediate critical alarm response, owner incident commander and tenant notice under agreed SLA; timed event log |
| Electrical distribution, UPS and standby | Electrical specialists plus contracted OEM support | OEM- and risk-based PM, battery trends, protection maintenance, thermography under approved procedures | Duty capacity loss or unresolved protection defect stops affected maintenance/acceptance; incident and repair record |
| Cooling and water | Mechanical technicians and OEM specialist availability | Temperature/pressure/flow trends, leak checks, water chemistry, heat-exchanger cleanliness, freeze/hail readiness | Projected temperature breach triggers approved load-management escalation; environmental release follows response plan |
| Network and controls | Service coordination plus managed network/OT service | Route health, authenticated changes, configuration backup/restore, access reviews | Carrier failure to diverse path; OT incident isolates per approved plan and alerts security/tenant |
| Safety, environment and permits | Accountable compliance lead and specialist contractors | Permit conditions register, generator run-hour/fuel records, water reports, SWP3 during works, tank/fire inspections | Any permit limit breach escalates immediately to management; legal notification deadlines recorded by counsel |
| Commercial / asset management | Facility manager + off-site commercial/finance support | Meter-based invoices, SLA calculation, rent/credit monitoring, insurance and tax calendar | Credit-support shortfall, claims or DSCR covenant trigger to CFO and lender under agreed documents |

Before each phase opens, build a computerized maintenance system containing OEM intervals, criticality, work methods, trained personnel and spare links. No generic interval in this appendix overrides the approved OEM/permit requirement. Initial on-site spares should cover sensors, control modules, approved fuses/breakers, pump seals/motors, valves/actuators, compatible UPS modules and critical fan drives. Transformer and generator major spares need a priced pooled or OEM support arrangement; they are not assumed on a shelf.

Maintain tested emergency procedures for utility loss, failed generator, cooling interruption, leak, fire, severe weather, fuel disruption, security/OT incident and evacuation. Rehearse non-disruptive scenarios quarterly as an owner planning target and revalidate after topology changes; disruptive exercises require approved windows. Annual management review reconciles actual water/energy/PUE, engine hours/emissions, PM backlog, insurance, asset condition and maintenance capital.

The compliance register must identify each permit or agreement, responsible person, record retention, reporting period, legal deadline, evidence file and escalation contact. TCEQ engine limits, TWDB reporting, City water/fire conditions, utility/ERCOT metering/protection and local occupancy requirements are project-specific. No permit numbers or reporting dates are fabricated here.

## Proposed anchor lease heads of terms

These are discussion positions, not an offer, signed contract or legal opinion. Counsel and lenders must settle enforceable terms.

| Topic | Proposed position / unresolved commercial choice |
|---|---|
| Premises and capacity | Dedicated suites totaling a 50 MW anchor across two accepted 25 MW blocks; remaining capacity subject to paid, milestone-limited options |
| Initial term | 15 years separately from acceptance of each block; renewal rights and pricing negotiated separately |
| Base rent | USD195 per committed IT kW/month starting after objective acceptance; illustrative price, not a quote |
| Electricity | Separately metered cost pass-through with documented PUE/allocation method, losses, taxes, demand charges, curtailment treatment and audit rights; no landlord energy margin assumed |
| Credit | Parent guarantee or acceptable bank LC sized by independent credit review; replenish on use/downgrade; no unsecured AI venture assumption |
| Tenant boundary | Tenant owns IT/network assets and provides density, inlet/liquid-temperature, heat split, loading and load-step requirements before design freeze |
| Availability | Define electrical/thermal service envelope, maintenance windows and agreed curtailment; credits and caps priced after failure-mode analysis; no unproven Tier/uptime promise |
| Delivery and conditions | Conditional dates tied to regulatory restart, permits, utility ramp and customer design; long-stop, termination costs and extension rights explicitly negotiated |
| Capacity ramp | Binding take-or-pay ramp after accepted delivery; tenant-caused delay/late fit-out treatment and landlord commissioning access defined |
| Construction changes | Written change control allocates customer redesign, scope changes, fuel/air requirements and added redundancy to cost and schedule |
| Insurance / liability | Agree insured risks, deductibles, casualty/restoration, consequential-damage treatment, limitation caps, force majeure and lender step-in |
| End of term | Reinstatement, tenant equipment removal, environmental responsibilities, renewal notice and residual works; no automatic renewal revenue represented |

The model assumes later phases reach 90% occupancy immediately and continues rent after each initial lease. The resulting uncontracted tail is 60/54/48/42 months across phases 1–4. Underwriting must explicitly evaluate renewal downtime, new fit-out costs and rent reset; the current model does not price those items.

## Unsent diligence and RFQ templates

**Landowner / EDC request — draft, unsent**

> We are assessing a conditional 100 MW IT campus in the Moores Mill/Wendland study area. Please identify the currently available parcel IDs, ownership/authority, boundaries, asking terms, survey, title/easements, existing studies, permitted uses and utility correspondence. Would an option conditioned on planning, power and financing be available, and what fee, access, expiry and termination terms would apply? The historic 147-acre announcement is not being treated as current availability.

**DSP/TSP technical intake — draft, unsent**

> Please confirm the service territory, current lawful intake process and candidate connection points for a full-campus 140 MW peak facility demand, phased 25/50/75/100 MW IT. Annual PUE is estimated at 1.28 and peak at 1.40; expected metered load and UPS/standby dynamics will be supplied. Identify studies, disclosure/site-control requirements, security and fees, utility work scope, voltage/fault-duty assumptions, curtailment/ride-through requirements and the evidence needed before any staged energization date can be relied on. We claim no Batch Zero eligibility or existing capacity allocation.

**Electrical OEM RFQ — draft, unsent**

> Quote a budgetary campus package on the attached conceptual duty and interface schedule, identifying all exclusions. For primary transformation, assess four 50 MVA net-duty units and a provisional 138/34.5 kV interface; confirm ratings, fault duty, loss guarantees, dimensions, maintenance arrangements and shipping route. Break down engineering, approved drawings, manufacturing start, FAT, freight/site arrival, SAT and warranty. State earliest supported order-to-site lead, slot validity, deposit and cancellation exposure, escalation, spares and service response. No PO or delivery date is authorized by this request.

**Cooling OEM RFQ — draft, unsent**

> Assess a 25 MW IT block with 22.5 MW direct-liquid duty and 2.5 MW residual IT air duty, plus auxiliary losses. Evaluate the 35/45°C facility-loop concept and 35 MW design heat rejection at 43°C dry bulb, with 46°C stress results and one module unavailable. Provide capacity/power curves, mechanical-trim requirements, water use, winter protection, fluid properties, acoustic data, maintenance isolation, lead time and guaranteed test criteria. Identify every needed tenant interface input and any failure of the proposed N+1 sizing.

**Carrier / City / tenant request — draft, unsent**

> Carrier: supply two end-to-end route drawings, shared structures, entrance and diversity evidence, bandwidth/latency SLA, build costs and restoration terms. City: confirm parcel use, approvals, water/fire capacity and drought/discharge conditions against an initial 15 m³/day domestic/service allowance and separately designed fill/fire needs. Prospective anchor: provide credit support, capacity/ramp, thermal and power-quality requirements, curtailment tolerance and pricing response to the proposed rent plus transparent electricity pass-through. No interest or service availability will be represented without written evidence.

Returned evidence should be dated, attributed, scoped and retained in the project data room. Change the assumption register and model only after reconciling the reply's limits and interfaces. Escalate contradictory responses before releasing the next capital gate.
