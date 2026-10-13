/** Auditable, pre-tax, local-currency concept model. See docs/engineering-basis.md. */
export const defaults = Object.freeze({
  energyPriceMwh: 70, basePue: 1.2, peakPue: 1.35,
  facilityCapexPerKw: 8500, landCostM: 12, gridCostM: 50, powerPlantCostM: 0,
  softCostPct: 12, contingencyPct: 15, fixedOpexM: 10,
  variableOpexPerKwYear: 60, leaseRateKwMonth: 180,
  debtPct: 60, interestPct: 7, debtYears: 15, equityDiscountPct: 12,
  occupancyPct: 90, loadFactorPct: 85, firstOperationMonth: 36,
  phaseIntervalMonths: 12, constructionMonths: 24, operatingYears: 20,
  maintenanceCapexPct: 1, utilityCollateralM: 0,
  generationPhaseShares: Object.freeze([0.25, 0.25, 0.25, 0.25]),
  rackKw: 100, liquidCapturePct: 90, coolingDeltaTC: 10,
  coolantSpecificHeatKjKgK: 4.186, coolantDensityKgM3: 997,
  powerFactor: 0.95, electricalLossPct: 4, batteryMinutes: 5,
});

const ranges = {
  energyPriceMwh: [0, 1000], basePue: [1, 2.5], peakPue: [1, 3],
  facilityCapexPerKw: [1, 100000], landCostM: [0, 10000], gridCostM: [0, 10000], powerPlantCostM: [0, 10000],
  softCostPct: [0, 100], contingencyPct: [0, 100], fixedOpexM: [0, 1000],
  variableOpexPerKwYear: [0, 10000], leaseRateKwMonth: [0, 5000],
  debtPct: [0, 95], interestPct: [0, 30], debtYears: [1, 40], equityDiscountPct: [0, 100],
  occupancyPct: [0, 100], loadFactorPct: [0, 100], firstOperationMonth: [13, 120],
  phaseIntervalMonths: [0, 36], constructionMonths: [1, 60], operatingYears: [5, 40],
  maintenanceCapexPct: [0, 10], utilityCollateralM: [0, 10000], rackKw: [10, 500],
  liquidCapturePct: [0, 100], coolingDeltaTC: [1, 30], coolantSpecificHeatKjKgK: [2, 5],
  coolantDensityKgM3: [800, 1300], powerFactor: [0.8, 1], electricalLossPct: [0, 30], batteryMinutes: [0, 120],
};
const integerFields = new Set(['firstOperationMonth', 'phaseIntervalMonths', 'constructionMonths', 'operatingYears', 'debtYears']);
const MW = 100, PHASE_MW = 25, PHASES = 4, HOURS_YEAR = 8760;

function inputsFor(project = {}, overrides = {}) {
  const inputs = { ...defaults, ...(project.modelOverrides || {}), ...overrides };
  for (const [key, [min, max]] of Object.entries(ranges)) {
    const value = inputs[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (integerFields.has(key) && !Number.isInteger(value))) {
      throw new RangeError(`${key} must be ${integerFields.has(key) ? 'an integer' : 'a finite number'} from ${min} to ${max}.`);
    }
  }
  if (inputs.peakPue < inputs.basePue) throw new RangeError('peakPue cannot be less than annual basePue.');
  if (!Array.isArray(inputs.generationPhaseShares) || inputs.generationPhaseShares.length !== 4 || inputs.generationPhaseShares.some(value => typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) || Math.abs(inputs.generationPhaseShares.reduce((sum, value) => sum + value, 0) - 1) > 1e-9) {
    throw new RangeError('generationPhaseShares must contain four nonnegative fractions summing to 1.');
  }
  inputs.generationPhaseShares = [...inputs.generationPhaseShares];
  if (inputs.electricalLossPct / 100 > inputs.peakPue - 1) throw new RangeError('Electrical losses cannot exceed peak non-IT power.');
  if (inputs.constructionMonths >= inputs.firstOperationMonth) throw new RangeError('Construction must begin in month 1 or later.');
  if (3 * inputs.phaseIntervalMonths >= inputs.operatingYears * 12) throw new RangeError('All four phases must operate inside the modeled horizon.');
  return inputs;
}

function capital(inputs) {
  const facilityM = MW * 1000 * inputs.facilityCapexPerKw / 1e6;
  const facilityItems = [
    ['shell', 'Building shell and fit-out', 0.18],
    ['electrical', 'Campus electrical, UPS and emergency diesel', 0.4],
    ['cooling', 'Cooling, heat rejection and CDUs', 0.22],
    ['civil', 'On-plot civil works and drainage', 0.1],
    ['controls', 'Controls, security and campus fiber', 0.05],
    ['commissioning', 'Installation testing and commissioning', 0.05],
  ].map(([id, label, share]) => ({ id, label, amountM: facilityM * share, basis: `${share * 100}% of facility hard cost; concept allocation` }));
  const hardCostM = facilityM + inputs.landCostM + inputs.gridCostM + inputs.powerPlantCostM;
  const softCostM = hardCostM * inputs.softCostPct / 100;
  const contingencyM = (hardCostM + softCostM) * inputs.contingencyPct / 100;
  return {
    facilityM, landM: inputs.landCostM, gridM: inputs.gridCostM, powerPlantM: inputs.powerPlantCostM,
    hardCostM, softCostM, contingencyM, totalM: hardCostM + softCostM + contingencyM,
    breakdown: [...facilityItems,
      { id: 'land', label: 'Land acquisition allowance', amountM: inputs.landCostM, basis: 'Regional estimate; no land control' },
      { id: 'grid', label: 'Off-plot grid connection and utility works', amountM: inputs.gridCostM, basis: 'Excludes campus electrical equipment' },
      { id: 'generation', label: 'Dedicated primary generation plant', amountM: inputs.powerPlantCostM, basis: 'Separate from emergency standby equipment' },
      { id: 'soft', label: 'Design, development, legal and permitting', amountM: softCostM, basis: `${inputs.softCostPct}% of all hard costs including land` },
      { id: 'contingency', label: 'Concept contingency', amountM: contingencyM, basis: `${inputs.contingencyPct}% of hard plus soft costs` },
    ],
  };
}

function stabilized(inputs) {
  const occupiedItMw = MW * inputs.occupancyPct / 100;
  const averageItMw = occupiedItMw * inputs.loadFactorPct / 100;
  const averageFacilityMw = averageItMw * inputs.basePue;
  const annualItMwh = averageItMw * HOURS_YEAR;
  const annualFacilityMwh = averageFacilityMw * HOURS_YEAR;
  const energyCostM = annualFacilityMwh * inputs.energyPriceMwh / 1e6;
  const baseRentM = occupiedItMw * 1000 * inputs.leaseRateKwMonth * 12 / 1e6;
  const variableOpexM = occupiedItMw * 1000 * inputs.variableOpexPerKwYear / 1e6;
  const fixedOpexM = inputs.fixedOpexM;
  const maintenanceCapexM = (MW * 1000 * inputs.facilityCapexPerKw / 1e6 + inputs.powerPlantCostM) * inputs.maintenanceCapexPct / 100;
  const ebitdaM = baseRentM - fixedOpexM - variableOpexM;
  return { occupiedItMw, averageItMw, averageFacilityMw, annualItMwh, annualFacilityMwh,
    baseRentM, electricityRevenueM: energyCostM, energyCostM, totalRevenueM: baseRentM + energyCostM,
    fixedOpexM, variableOpexM, ebitdaM, maintenanceCapexM, cfadsM: ebitdaM - maintenanceCapexM,
    customerAllInKwMonth: occupiedItMw ? (baseRentM + energyCostM) * 1e6 / (occupiedItMw * 1000 * 12) : null,
  };
}

const rowMoneyFields = ['capexM', 'collateralDepositM', 'collateralReturnM', 'debtDrawM', 'capitalizedInterestM', 'baseRentM', 'electricityRevenueM', 'energyCostM', 'fixedOpexM', 'variableOpexM', 'ebitdaM', 'maintenanceCapexM', 'cfadsM', 'interestM', 'principalM', 'balloonM', 'debtServiceM', 'unleveredCashFlowM', 'equityCashFlowM'];

function simulation(inputs, capex, steady) {
  const lastMonth = inputs.firstOperationMonth + inputs.operatingYears * 12 - 1;
  const phaseMonths = Array.from({ length: PHASES }, (_, i) => inputs.firstOperationMonth + i * inputs.phaseIntervalMonths);
  const loans = phaseMonths.map((operationMonth, phaseIndex) => ({ operationMonth, phaseIndex, balanceM: 0, paymentM: null }));
  const r = inputs.interestPct / 100 / 12;
  const months = [{ month: 0, onlineItMw: 0, occupiedItMw: 0, annualFacilityMwh: 0, facilityMwh: 0, debtBalanceM: 0, dscr: null, ...Object.fromEntries(rowMoneyFields.map(k => [k, 0])) }];
  // Land + off-plot utility works are common enabling assets spent M1-M12.
  // Facility is equal per phase; generation follows its explicitly selected shares.
  const multiplier = (1 + inputs.softCostPct / 100) * (1 + inputs.contingencyPct / 100);
  const commonM = (inputs.landCostM + inputs.gridCostM) * multiplier;
  for (let month = 1; month <= lastMonth; month++) {
    const row = { month, ...Object.fromEntries(rowMoneyFields.map(k => [k, 0])) };
    for (const loan of loans) {
      const construction = month >= loan.operationMonth - inputs.constructionMonths && month < loan.operationMonth;
      const phaseCapitalM = (capex.facilityM / PHASES + inputs.powerPlantCostM * inputs.generationPhaseShares[loan.phaseIndex]) * multiplier;
      const capitalM = (month <= 12 ? commonM / 12 / PHASES : 0) + (construction ? phaseCapitalM / inputs.constructionMonths : 0);
      const drawM = capitalM * inputs.debtPct / 100;
      row.capexM += capitalM;
      row.debtDrawM += drawM;
      // Half-month convention for new construction draws; existing debt accrues a full month.
      const interestM = (loan.balanceM + drawM / 2) * r;
      loan.balanceM += drawM;
      if (month < loan.operationMonth) {
        row.capitalizedInterestM += interestM;
        loan.balanceM += interestM; // IDC is additional financed principal, outside hard/soft CAPEX.
      } else if (loan.balanceM > 1e-10) {
        if (loan.paymentM === null) loan.paymentM = r ? loan.balanceM * r / (1 - (1 + r) ** (-inputs.debtYears * 12)) : loan.balanceM / (inputs.debtYears * 12);
        const principalM = Math.min(loan.balanceM, Math.max(0, loan.paymentM - interestM));
        row.interestM += interestM;
        row.principalM += principalM;
        loan.balanceM -= principalM;
        if (loan.balanceM < 1e-9) loan.balanceM = 0;
      }
    }
    const onlinePhases = phaseMonths.filter(operationMonth => month >= operationMonth).length;
    const share = onlinePhases / PHASES;
    row.onlineItMw = onlinePhases * PHASE_MW;
    row.occupiedItMw = steady.occupiedItMw * share;
    row.facilityMwh = steady.annualFacilityMwh * share / 12;
    for (const key of ['baseRentM', 'electricityRevenueM', 'energyCostM', 'fixedOpexM', 'variableOpexM', 'ebitdaM', 'maintenanceCapexM', 'cfadsM']) row[key] = steady[key] * share / 12;
    const onlineGenerationShare = inputs.generationPhaseShares.slice(0, onlinePhases).reduce((sum, value) => sum + value, 0);
    row.maintenanceCapexM = (capex.facilityM * share + inputs.powerPlantCostM * onlineGenerationShare) * inputs.maintenanceCapexPct / 100 / 12;
    row.cfadsM = row.ebitdaM - row.maintenanceCapexM;
    row.collateralDepositM = month === 1 ? inputs.utilityCollateralM : 0;
    row.collateralReturnM = month === lastMonth ? inputs.utilityCollateralM : 0;
    // Zero terminal enterprise/land value. Any outstanding debt must still be repaid.
    row.balloonM = month === lastMonth ? loans.reduce((sum, loan) => sum + loan.balanceM, 0) : 0;
    if (month === lastMonth) for (const loan of loans) loan.balanceM = 0;
    row.debtServiceM = row.interestM + row.principalM + row.balloonM;
    row.debtBalanceM = loans.reduce((sum, loan) => sum + loan.balanceM, 0);
    row.unleveredCashFlowM = row.cfadsM - row.capexM - row.collateralDepositM + row.collateralReturnM;
    row.equityCashFlowM = row.unleveredCashFlowM + row.debtDrawM - row.debtServiceM;
    row.dscr = row.debtServiceM > 1e-10 ? row.cfadsM / row.debtServiceM : null;
    months.push(row);
  }
  return { months, phaseMonths, lastMonth };
}

function annualize(months) {
  const rows = [];
  for (const row of months.slice(1)) {
    const year = Math.ceil(row.month / 12);
    let annual = rows[year - 1];
    if (!annual) {
      annual = { year, startMonth: row.month, endMonth: row.month, operatingMonths: 0, averageOnlineItMw: 0, endOnlineItMw: 0, facilityMwh: 0, debtBalanceM: 0, dscr: null, ...Object.fromEntries(rowMoneyFields.map(k => [k, 0])) };
      rows.push(annual);
    }
    annual.endMonth = row.month;
    annual.operatingMonths += row.onlineItMw > 0 ? 1 : 0;
    annual.averageOnlineItMw += row.onlineItMw / 12;
    annual.endOnlineItMw = row.onlineItMw;
    annual.facilityMwh += row.facilityMwh;
    annual.debtBalanceM = row.debtBalanceM;
    for (const key of rowMoneyFields) annual[key] += row[key];
    annual.dscr = annual.debtServiceM > 1e-10 ? annual.cfadsM / annual.debtServiceM : null;
  }
  return rows;
}

function npv(months, ratePct, key) {
  const logGrowth = Math.log1p(ratePct / 100);
  return months.reduce((sum, row) => sum + row[key] * Math.exp(-logGrowth * row.month / 12), 0);
}

// Scan the annual log-growth domain to find sign-changing IRR roots. Null is explicit
// when no unique economically interpretable root is found (rather than NaN/Infinity).
function irr(months, key) {
  const values = months.filter(row => Math.abs(row[key]) > 1e-12);
  if (!values.some(row => row[key] > 0) || !values.some(row => row[key] < 0)) return { valuePct: null, rootsPct: [], status: 'no-sign-change' };
  const evaluate = x => values.reduce((sum, row) => sum + row[key] * Math.exp(-x * row.month / 12), 0);
  const roots = [], min = Math.log(0.0001), max = Math.log(101), steps = 600;
  let x0 = min, y0 = evaluate(x0);
  for (let i = 1; i <= steps; i++) {
    const x1 = min + (max - min) * i / steps, y1 = evaluate(x1);
    if (y0 * y1 < 0 || y1 === 0) {
      let low = x0, high = x1, lowY = y0;
      for (let j = 0; j < 70; j++) {
        const mid = (low + high) / 2, midY = evaluate(mid);
        if ((midY > 0) === (lowY > 0)) { low = mid; lowY = midY; } else high = mid;
      }
      const root = Math.expm1((low + high) / 2) * 100;
      if (!roots.some(value => Math.abs(root - value) < 1e-6)) roots.push(root);
    }
    x0 = x1; y0 = y1;
  }
  return roots.length === 1 ? { valuePct: roots[0], rootsPct: roots, status: 'unique-scanned-root' } : { valuePct: null, rootsPct: roots, status: roots.length ? 'multiple-roots' : 'outside-scan-range' };
}

export function calculate(project = {}, overrides = {}) {
  const inputs = inputsFor(project, overrides), capex = capital(inputs), steady = stabilized(inputs);
  const sim = simulation(inputs, capex, steady), rows = annualize(sim.months);
  const sum = key => sim.months.reduce((value, row) => value + row[key], 0);
  const unlevered = irr(sim.months, 'unleveredCashFlowM'), levered = irr(sim.months, 'equityCashFlowM');
  const unleveredNpvM = npv(sim.months, inputs.equityDiscountPct, 'unleveredCashFlowM');
  const equityNpvM = npv(sim.months, inputs.equityDiscountPct, 'equityCashFlowM');
  const rentNpvM = npv(sim.months.map(row => ({ ...row, unitRentM: row.occupiedItMw * 1000 / 1e6 })), inputs.equityDiscountPct, 'unitRentM');
  const activeDscr = rows.filter(row => row.dscr !== null).map(row => row.dscr);
  const operatingDscr = rows.filter(row => row.interestM + row.principalM > 1e-10).map(row => row.cfadsM / (row.interestM + row.principalM));
  const idcM = sum('capitalizedInterestM');
  let cumulativeEquityM = 0, maximumCumulativeEquityDeficitM = 0;
  for (const row of sim.months) {
    cumulativeEquityM += row.equityCashFlowM;
    maximumCumulativeEquityDeficitM = Math.max(maximumCumulativeEquityDeficitM, -cumulativeEquityM);
  }
  const warnings = [
    'Concept estimates, not contractor quotes, grid rights, permit approvals or a financing offer.',
    'Pre-tax, constant nominal inputs: no inflation/escalation, corporate/income tax, depreciation, grants, terminal asset value or GPU purchases.',
    'PUE is an annual input, not an hourly weather simulation; low-load fixed power and demand ratchets are not modeled.',
    'Electricity is passed through at cost; changes affect tenant cost, not landlord EBITDA. Owned-plant energy price must contain variable generation costs only.',
    'No lease ramp: each commissioned phase immediately reaches the chosen occupancy. Schedule is conditional, not a forecast of approval.',
    'Returns use monthly timing; annual DSCR uses cash available after maintenance capital, including any final debt balloon.',
  ];
  if (!inputs.occupancyPct) warnings.push('No committed customers: rent and modeled metered energy are zero, while fixed operating and maintenance costs remain. Actual empty-facility electricity would add costs.');
  if (sum('balloonM') > 1e-6) warnings.push('Debt extends beyond the project horizon: the final cash flow includes repayment of the remaining principal.');
  if (inputs.powerPlantCostM > 0) warnings.push('Primary generation plant is separately owned in this scenario. Its fixed O&M must be included in fixed OPEX; major overhauls and fuel/carbon exposure require dedicated diligence.');
  return {
    currency: project.currency || 'USD', inputs, capex, stabilized: steady,
    finance: {
      capitalizedInterestM: idcM, totalFundingM: capex.totalM + idcM + inputs.utilityCollateralM,
      totalDebtDrawM: sum('debtDrawM'), totalDebtIncludingIdcM: sum('debtDrawM') + idcM,
      constructionEquityM: capex.totalM * (1 - inputs.debtPct / 100) + inputs.utilityCollateralM,
      maximumCumulativeEquityDeficitM,
      totalEquityContributionsM: sim.months.reduce((sum, row) => sum + Math.max(0, -row.equityCashFlowM), 0),
      equityNpvM, unleveredNpvM, equityIrrPct: levered.valuePct, equityIrrStatus: levered.status,
      unleveredIrrPct: unlevered.valuePct, unleveredIrrStatus: unlevered.status,
      equityIrrRootsPct: levered.rootsPct, unleveredIrrRootsPct: unlevered.rootsPct,
      minDscr: activeDscr.length ? Math.min(...activeDscr) : null,
      minOperatingDscr: operatingDscr.length ? Math.min(...operatingDscr) : null,
      breakEvenRentKwMonth: rentNpvM ? inputs.leaseRateKwMonth - equityNpvM / rentNpvM : null,
      unleveredBreakEvenRentKwMonth: rentNpvM ? inputs.leaseRateKwMonth - unleveredNpvM / rentNpvM : null,
      yieldOnCostPct: steady.ebitdaM / capex.totalM * 100,
      terminalValueM: 0, terminalDebtBalloonM: sum('balloonM'), collateralM: inputs.utilityCollateralM,
      totalEquityCashFlowM: sum('equityCashFlowM'), totalUnleveredCashFlowM: sum('unleveredCashFlowM'),
    },
    timeline: { firstOperationMonth: inputs.firstOperationMonth, finalOperationMonth: sim.phaseMonths.at(-1), lastModelMonth: sim.lastMonth, operatingYears: inputs.operatingYears, phases: sim.phaseMonths.map((operationMonth, index) => ({ phase: index + 1, itMw: PHASE_MW, cumulativeItMw: (index + 1) * PHASE_MW, constructionStartMonth: operationMonth - inputs.constructionMonths, operationMonth })) },
    cashFlows: rows, warnings,
  };
}

export function annualCashFlows(project = {}, overrides = {}) {
  const inputs = inputsFor(project, overrides);
  return annualize(simulation(inputs, capital(inputs), stabilized(inputs)).months);
}

export function sensitivity(project = {}, overrides = {}) {
  const base = calculate(project, overrides), i = base.inputs;
  const scenarios = [
    ['leaseRateKwMonth', 'Base rent', '/kW/month', i.leaseRateKwMonth * 0.8, i.leaseRateKwMonth * 1.2],
    ['facilityCapexPerKw', 'Facility construction cost', '/IT kW', i.facilityCapexPerKw * 0.8, i.facilityCapexPerKw * 1.2],
    ['occupancyPct', 'Committed occupancy', '%', Math.max(0, i.occupancyPct - 15), Math.min(100, i.occupancyPct + 10)],
    ['energyPriceMwh', 'Pass-through electricity cost', '/MWh', i.energyPriceMwh * 0.7, i.energyPriceMwh * 1.3],
    ['firstOperationMonth', 'Construction and commissioning shift', 'first COD month', Math.max(i.constructionMonths + 1, i.firstOperationMonth - 12), Math.min(120, i.firstOperationMonth + 12)],
    ['interestPct', 'Loan interest', '%', Math.max(0, i.interestPct - 2), Math.min(30, i.interestPct + 2)],
  ];
  return scenarios.map(([variable, label, unit, low, high]) => {
    const [min, max] = ranges[variable];
    low = Math.max(min, low); high = Math.min(max, high);
    const lowResult = calculate(project, { ...overrides, [variable]: low }), highResult = calculate(project, { ...overrides, [variable]: high });
    return { variable, label, unit, low, base: i[variable], high,
      lowNpvM: lowResult.finance.equityNpvM, baseNpvM: base.finance.equityNpvM, highNpvM: highResult.finance.equityNpvM,
      lowIrrPct: lowResult.finance.equityIrrPct, highIrrPct: highResult.finance.equityIrrPct,
      lowCustomerCostKwMonth: lowResult.stabilized.customerAllInKwMonth, highCustomerCostKwMonth: highResult.stabilized.customerAllInKwMonth,
    };
  });
}

export function engineering(project = {}, overrides = {}) {
  const i = inputsFor(project, overrides), steady = stabilized(i);
  const facilityPeakMw = MW * i.peakPue, facilityPeakMva = facilityPeakMw / i.powerFactor;
  const liquidDutyMw = MW * i.liquidCapturePct / 100;
  const liquidFlowKgS = liquidDutyMw * 1000 / (i.coolantSpecificHeatKjKgK * i.coolingDeltaTC);
  const rejectionFlowKgS = facilityPeakMw * 1000 / (i.coolantSpecificHeatKjKgK * i.coolingDeltaTC);
  const primaryDuty = Math.ceil(facilityPeakMva / 50), phaseTransformersDuty = Math.ceil(facilityPeakMva / PHASES / 10);
  const standbyDutyPerPhase = Math.ceil(facilityPeakMw / PHASES / 5);
  const heatRejectionDutyPerPhase = Math.ceil(facilityPeakMw / PHASES / 5);
  return {
    itMw: MW, phaseItMw: PHASE_MW, phases: PHASES, annualPue: i.basePue, peakPue: i.peakPue,
    facilityPeakMw, facilityPeakMva, averageFacilityMw: steady.averageFacilityMw, annualFacilityMwh: steady.annualFacilityMwh,
    rackKw: i.rackKw, rackEquivalentCount: MW * 1000 / i.rackKw, racksPerPhase: Math.ceil(PHASE_MW * 1000 / i.rackKw),
    rackPositions: Math.ceil(PHASE_MW * 1000 / i.rackKw) * PHASES,
    electricalLossMw: MW * i.electricalLossPct / 100,
    otherPeakOverheadMw: facilityPeakMw - MW - MW * i.electricalLossPct / 100,
    transformer: { unitMva: 50, duty: primaryDuty, spare: 1, installed: primaryDuty + 1, firmMva: primaryDuty * 50, installedMva: (primaryDuty + 1) * 50, capacityAfterOneFailureMva: primaryDuty * 50 },
    phaseTransformer: { unitMva: 10, dutyPerPhase: phaseTransformersDuty, sparePerPhase: 1, installedTotal: (phaseTransformersDuty + 1) * PHASES, capacityAfterOneFailurePerPhaseMva: phaseTransformersDuty * 10 },
    ups: { unitMw: 5, dutyPerPhase: 5, sparePerPhase: 1, installedTotal: 24, firmItMw: 100, installedMw: 120, batteryMinutes: i.batteryMinutes, deliveredBatteryMwh: MW * i.batteryMinutes / 60, storedBatteryMwh: MW * i.batteryMinutes / 60 / 0.9 },
    standby: { unitMw: 5, dutyPerPhase: standbyDutyPerPhase, sparePerPhase: 1, installedTotal: (standbyDutyPerPhase + 1) * PHASES, capacityAfterOneFailurePerPhaseMw: standbyDutyPerPhase * 5, installedMw: (standbyDutyPerPhase + 1) * PHASES * 5, basis: 'Emergency diesel, separate from any primary gas plant. Ratings must be net at site design conditions; no outage runtime is guaranteed.' },
    cooling: { liquidDutyMw, residualAirDutyMw: MW - liquidDutyMw, totalHeatRejectionMw: facilityPeakMw, deltaTC: i.coolingDeltaTC,
      liquidFlowKgS, liquidFlowM3H: liquidFlowKgS / i.coolantDensityKgM3 * 3600,
      rejectionFlowKgS, rejectionFlowM3H: rejectionFlowKgS / i.coolantDensityKgM3 * 3600,
      cduUnitMw: 2.5, cduDutyPerPhase: Math.ceil(liquidDutyMw / PHASES / 2.5), cduSparePerPhase: liquidDutyMw > 0 ? 1 : 0,
      cduInstalledTotal: (Math.ceil(liquidDutyMw / PHASES / 2.5) + (liquidDutyMw > 0 ? 1 : 0)) * PHASES,
      rejectionUnitMw: 5, rejectionDutyPerPhase: heatRejectionDutyPerPhase, rejectionSparePerPhase: 1,
      rejectionInstalledTotal: (heatRejectionDutyPerPhase + 1) * PHASES, rejectionInstalledMw: (heatRejectionDutyPerPhase + 1) * PHASES * 5,
      waterBasis: 'Closed-loop circulation is not water consumption. No cooling-tower consumption assumed; annual potable, leakage and optional adiabatic makeup remain unquantified.' },
    qualifications: [
      'All equipment ratings and topology are concept assumptions, not manufacturer selections or certified Tier ratings.',
      'N+1 capacity is checked independently per subsystem; common-mode faults and maintenance isolation need detailed design.',
      'Annual PUE is not a peak sizing multiplier. PeakPue sizes power and conservatively bounds campus heat rejection.',
      'Water heat capacity is an indoor clean-water assumption. Outdoor glycol changes density, heat capacity, viscosity and pump duty.',
      '100 kW/rack is a planning density, not a promise of compatibility with a particular GPU system.',
      'UPS capacity shown covers IT. Dedicated cooling/control ride-through, selective coordination and motor-starting studies remain required.',
      'Prime gas plant combustion/exhaust and radiator heat are outside the data-center PUE/cooling boundary.',
    ],
  };
}
