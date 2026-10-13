# What would make the projects viable?

The current assumptions do not generate enough rent relative to development cost, construction carry and debt service. Alberta has the larger gap, including CAD360m of primary generation. Both models assume zero terminal property sale value and include uncontracted lease-renewal revenue.

| Independent project | Alberta (CAD) | Texas (USD) |
|---|---:|---:|
| Equity hurdle | 15% | 14% |
| Base equity NPV | -419.26m | -94.86m |
| Base rent / kW-month | 235 | 195 |
| Rent needed for zero equity NPV | 339.28 (+44.4%) | 218.12 (+11.9%) |
| Alternatively, facility hard cost / IT kW | 6,974.79 (-48.3%) | 8,617.31 (-13.8%) |

These are separate one-variable thresholds, keeping other assumptions fixed. The cost thresholds retain land, utility connection and generation allowances; related soft costs, contingency, interest and maintenance recalculate.

Illustrative combined cases that pass the model:

- **Alberta:** facility cost CAD10,000/IT kW, rent CAD300/kW-month, and 15-year debt amortization produce CAD38.47m equity NPV, 1.85x minimum DSCR and no terminal debt balloon. Occupancy remains 95%.
- **Texas:** facility cost USD9,000/IT kW and rent USD210/kW-month produce USD35.28m equity NPV, 15.49% equity IRR and 1.94x minimum DSCR. Occupancy remains 90%.

These are calculated possibilities, not supplier quotations or achievable customer prices. Real viability requires enforceable leases, credible construction bids, land control, permits and a bankable power/fuel route. Alberta's base case also needs a plan for the CAD130.72m terminal debt balloon; its cash flows have multiple IRR roots, so there is no unique base equity IRR. Texas remains subject to the regulatory and interconnection gates documented in its dossier.

Cheaper electricity alone does not improve landlord returns in this model: energy passes through at cost. It may improve customer competitiveness. The base proposals remain unchanged; these scenarios are sensitivities, not a new investment recommendation.

Calculated from `src/model.mjs` and `data/{alberta,texas}.json`, evidence date 13 October 2026.
