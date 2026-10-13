# Temple AI Campus

Independent concept / pre-feasibility development package, 2026-10-13.

- dossier.pdf / dossier.md: full development proposal and calculated appendix
- project.json: site, technical/commercial strategy, sources and assumptions
- base-case.json: exact model outputs and sensitivity cases
- model.mjs: dependency-free model; import calculate, engineering or sensitivity
- layout.svg / electrical.svg / cooling.svg / campus.svg: editable vector drawings
- engineering-basis.md: sizing and financial methodology
- execution.md: RFQ milestones, commissioning, operations and commercial terms
- source-register.md / delivery-schedule.md: traceable evidence and execution dependencies

Run the model with Node.js:

```js
import { readFileSync } from 'node:fs';
import { calculate } from './model.mjs';
const project = JSON.parse(readFileSync('./project.json','utf8'));
console.log(calculate(project));
```

No land rights, service agreements, customer commitments, permits or equipment allocations are represented as secured.
