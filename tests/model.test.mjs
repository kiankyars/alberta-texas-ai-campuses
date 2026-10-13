import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults, calculate, annualCashFlows, sensitivity, engineering } from '../src/model.mjs';

const project = { currency: 'CAD', modelOverrides: { facilityCapexPerKw: 11000, landCostM: 18, gridCostM: 80, powerPlantCostM: 250, peakPue: 1.3 } };
const close = (actual, expected, tolerance = 1e-7) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);
const total = (rows, key) => rows.reduce((sum, row) => sum + row[key], 0);

test('regional overrides and scenario overrides do not mutate defaults or project', () => {
  const snapshot = JSON.stringify(project);
  const result = calculate(project, { leaseRateKwMonth: 220 });
  assert.equal(result.currency, 'CAD');
  assert.equal(result.inputs.facilityCapexPerKw, 11000);
  assert.equal(result.inputs.leaseRateKwMonth, 220);
  assert.equal(defaults.leaseRateKwMonth, 180);
  assert.equal(JSON.stringify(project), snapshot);
});

test('CAPEX line items reconcile and do not duplicate site power or land', () => {
  const result = calculate(project);
  close(result.capex.facilityM, 1100);
  close(result.capex.hardCostM, 1100 + 18 + 80 + 250);
  close(result.capex.softCostM, 1448 * 0.12);
  close(result.capex.contingencyM, (1448 + 1448 * 0.12) * 0.15);
  close(total(result.capex.breakdown, 'amountM'), result.capex.totalM);
  close(total(result.cashFlows, 'capexM'), result.capex.totalM);
});

test('committed occupancy controls rent; IT load factor controls energy independently', () => {
  const a = calculate({}, { occupancyPct: 50, loadFactorPct: 80, basePue: 1.25 });
  close(a.stabilized.occupiedItMw, 50);
  close(a.stabilized.averageItMw, 40);
  close(a.stabilized.annualFacilityMwh, 40 * 1.25 * 8760);
  close(a.stabilized.baseRentM, 50e3 * 180 * 12 / 1e6);
  const b = calculate({}, { occupancyPct: 50, loadFactorPct: 40, basePue: 1.25 });
  close(b.stabilized.baseRentM, a.stabilized.baseRentM);
  close(b.stabilized.annualFacilityMwh, a.stabilized.annualFacilityMwh / 2);
});

test('electricity pass-through is an exact offset, while customer cost changes', () => {
  const low = calculate(project, { energyPriceMwh: 20 }), high = calculate(project, { energyPriceMwh: 200 });
  close(low.stabilized.electricityRevenueM, low.stabilized.energyCostM);
  close(low.finance.equityNpvM, high.finance.equityNpvM);
  close(low.stabilized.ebitdaM, high.stabilized.ebitdaM);
  assert.ok(high.stabilized.customerAllInKwMonth > low.stabilized.customerAllInKwMonth);
  for (const row of high.cashFlows) close(row.electricityRevenueM, row.energyCostM);
});

test('monthly phasing totals independent capacity-months and 20-year horizon', () => {
  const result = calculate({}, { firstOperationMonth: 36, phaseIntervalMonths: 12 });
  assert.deepEqual(result.timeline.phases.map(phase => phase.operationMonth), [36, 48, 60, 72]);
  assert.equal(result.timeline.lastModelMonth, 275);
  // First phase operates 240 months, subsequent phases 228, 216 and 204 months.
  const expectedFullCampusYears = (240 + 228 + 216 + 204) / (4 * 12);
  close(total(result.cashFlows, 'facilityMwh'), result.stabilized.annualFacilityMwh * expectedFullCampusYears, 1e-6);
  close(total(result.cashFlows, 'baseRentM'), result.stabilized.baseRentM * expectedFullCampusYears);
  assert.equal(result.cashFlows.at(-1).endMonth, 275);
  assert.ok(result.cashFlows.filter(row => row.endMonth < 36).every(row => row.baseRentM === 0));
});

test('primary generation CAPEX and maintenance follow independent module staging', () => {
  const result = calculate({}, { facilityCapexPerKw: 1000, landCostM: 0, gridCostM: 0, powerPlantCostM: 160, softCostPct: 0, contingencyPct: 0, constructionMonths: 12, firstOperationMonth: 25, phaseIntervalMonths: 12, debtPct: 0, generationPhaseShares: [0.375, 0.1875, 0.25, 0.1875] });
  close(result.capex.totalM, 260);
  close(result.cashFlows[1].capexM, 25 + 60);
  close(result.cashFlows[2].capexM, 25 + 30);
  close(result.cashFlows[3].capexM, 25 + 40);
  close(result.cashFlows[4].capexM, 25 + 30);
  close(result.cashFlows[2].maintenanceCapexM, (25 + 60) * 0.01);
  close(result.stabilized.maintenanceCapexM, 2.6);
  close(total(result.cashFlows, 'capexM'), result.capex.totalM);
});

test('Alberta plant cost staging funds all shared gas and BESS in phase one', () => {
  const engineFractions = [6 / 16, 3 / 16, 4 / 16, 3 / 16];
  const plantCostsM = engineFractions.map((fraction, index) => 305 * fraction + (index === 0 ? 55 : 0));
  const result = calculate({}, { facilityCapexPerKw: 1000, landCostM: 0, gridCostM: 0, powerPlantCostM: 360, softCostPct: 0, contingencyPct: 0, constructionMonths: 12, firstOperationMonth: 25, phaseIntervalMonths: 12, debtPct: 0, generationPhaseShares: plantCostsM.map(cost => cost / 360) });
  const actualPlantCostsM = result.cashFlows.slice(1, 5).map(row => row.capexM - 25);
  for (let phase = 0; phase < 4; phase++) {
    close(actualPlantCostsM[phase], plantCostsM[phase]);
    close(actualPlantCostsM[phase] - 305 * engineFractions[phase], phase === 0 ? 55 : 0);
  }
  close(actualPlantCostsM.reduce((sum, value) => sum + value, 0), 360);
  close(result.cashFlows[2].maintenanceCapexM, (25 + 169.375) * 0.01);
  close(result.stabilized.maintenanceCapexM, 4.6);
});

test('construction IDC is financed once, loans reconcile, cash flow identities hold', () => {
  const result = calculate(project), rows = result.cashFlows;
  let previousDebt = 0;
  for (const row of rows) {
    close(row.debtBalanceM, previousDebt + row.debtDrawM + row.capitalizedInterestM - row.principalM - row.balloonM);
    close(row.ebitdaM, row.baseRentM + row.electricityRevenueM - row.energyCostM - row.fixedOpexM - row.variableOpexM);
    close(row.cfadsM, row.ebitdaM - row.maintenanceCapexM);
    close(row.debtServiceM, row.interestM + row.principalM + row.balloonM);
    close(row.unleveredCashFlowM, row.cfadsM - row.capexM - row.collateralDepositM + row.collateralReturnM);
    close(row.equityCashFlowM, row.unleveredCashFlowM + row.debtDrawM - row.debtServiceM);
    previousDebt = row.debtBalanceM;
  }
  assert.ok(result.finance.capitalizedInterestM > 0);
  close(total(rows, 'debtDrawM'), result.capex.totalM * 0.6);
  close(total(rows, 'principalM') + total(rows, 'balloonM'), result.finance.totalDebtIncludingIdcM);
  close(result.finance.totalFundingM, result.finance.constructionEquityM + result.finance.totalDebtIncludingIdcM);
  close(rows.at(-1).debtBalanceM, 0);
});

test('zero-debt cash flows and IRRs agree; zero interest amortizes principal without interest', () => {
  const noDebt = calculate(project, { debtPct: 0 });
  close(noDebt.finance.capitalizedInterestM, 0);
  close(noDebt.finance.equityNpvM, noDebt.finance.unleveredNpvM);
  assert.equal(noDebt.finance.minDscr, null);
  close(noDebt.finance.equityIrrPct, noDebt.finance.unleveredIrrPct);
  for (const row of noDebt.cashFlows) close(row.equityCashFlowM, row.unleveredCashFlowM);
  const freeDebt = calculate(project, { interestPct: 0 });
  close(freeDebt.finance.capitalizedInterestM, 0);
  close(total(freeDebt.cashFlows, 'interestM'), 0);
  close(total(freeDebt.cashFlows, 'principalM'), freeDebt.capex.totalM * 0.6);
});

test('empty campus keeps fixed costs and returns null for undefined ratios', () => {
  const empty = calculate(project, { occupancyPct: 0 });
  close(empty.stabilized.baseRentM, 0);
  close(empty.stabilized.energyCostM, 0);
  assert.ok(empty.stabilized.fixedOpexM > 0);
  assert.ok(empty.stabilized.ebitdaM < 0);
  assert.equal(empty.stabilized.customerAllInKwMonth, null);
  assert.equal(empty.finance.breakEvenRentKwMonth, null);
  assert.equal(empty.finance.equityIrrPct, null);
  assert.equal(empty.finance.equityIrrStatus, 'no-sign-change');
  assert.ok(empty.finance.minDscr < 0);
});

test('IRR is not fabricated for all-negative cash flows, and negative IRR is supported', () => {
  const negative = calculate({}, { leaseRateKwMonth: 0 });
  assert.equal(negative.finance.unleveredIrrPct, null);
  const loss = calculate({}, { leaseRateKwMonth: 50, debtPct: 0 });
  assert.ok(loss.finance.unleveredIrrPct < 0);
  assert.ok(loss.finance.unleveredIrrPct > -100);
  const normal = calculate();
  close(calculate({}, { equityDiscountPct: normal.finance.equityIrrPct }).finance.equityNpvM, 0, 1e-6);
});

test('reported break-even rent solves both independently valued cash flow streams', () => {
  const result = calculate(project);
  close(calculate(project, { leaseRateKwMonth: result.finance.breakEvenRentKwMonth }).finance.equityNpvM, 0, 1e-6);
  close(calculate(project, { leaseRateKwMonth: result.finance.unleveredBreakEvenRentKwMonth }).finance.unleveredNpvM, 0, 1e-6);
});

test('refundable collateral changes liquidity/NPV but is not an operating expense or CAPEX', () => {
  const baseline = calculate(project), collateral = calculate(project, { utilityCollateralM: 7 });
  close(collateral.capex.totalM, baseline.capex.totalM);
  close(collateral.stabilized.ebitdaM, baseline.stabilized.ebitdaM);
  close(collateral.finance.constructionEquityM, baseline.finance.constructionEquityM + 7);
  close(total(collateral.cashFlows, 'collateralDepositM'), 7);
  close(total(collateral.cashFlows, 'collateralReturnM'), 7);
  close(collateral.finance.totalEquityCashFlowM, baseline.finance.totalEquityCashFlowM);
  assert.ok(collateral.finance.equityNpvM < baseline.finance.equityNpvM);
});

test('debt extending beyond horizon is repaid with explicit terminal balloon', () => {
  const result = calculate(project, { debtYears: 40 });
  assert.ok(result.finance.terminalDebtBalloonM > 0);
  close(total(result.cashFlows, 'principalM') + result.finance.terminalDebtBalloonM, result.finance.totalDebtIncludingIdcM);
  close(result.cashFlows.at(-1).debtBalanceM, 0);
  assert.ok(result.warnings.some(warning => warning.includes('extends beyond')));
});

test('nonconventional terminal cash flows expose multiple IRR roots rather than choosing one', () => {
  const result = calculate({}, { debtYears: 40 });
  assert.equal(result.finance.equityIrrPct, null);
  assert.equal(result.finance.equityIrrStatus, 'multiple-roots');
  assert.equal(result.finance.equityIrrRootsPct.length, 2);
  assert.ok(result.finance.equityIrrRootsPct[0] < 0);
  assert.ok(result.finance.equityIrrRootsPct[1] > 0);
  close(calculate({}, { debtYears: 40, equityDiscountPct: result.finance.equityIrrRootsPct[1] }).finance.equityNpvM, 0, 1e-6);
  assert.ok(result.finance.minDscr < result.finance.minOperatingDscr);
});

test('thermal, hydraulic and electrical dimensions close; redundant capacities survive one unit loss', () => {
  const e = engineering({}, { peakPue: 1.4, rackKw: 120 });
  close(e.itMw, 100);
  close(e.facilityPeakMw, 140);
  close(e.itMw + e.electricalLossMw + e.otherPeakOverheadMw, e.facilityPeakMw);
  close(e.cooling.liquidDutyMw + e.cooling.residualAirDutyMw, 100);
  close(e.cooling.liquidFlowKgS * defaults.coolantSpecificHeatKjKgK * e.cooling.deltaTC / 1000, e.cooling.liquidDutyMw);
  close(e.cooling.rejectionFlowM3H / 3600 * defaults.coolantDensityKgM3 * defaults.coolantSpecificHeatKjKgK * e.cooling.deltaTC / 1000, 140);
  assert.ok(e.rackPositions * 120 >= 100000);
  assert.ok((e.racksPerPhase - 1) * 120 < 25000);
  assert.ok(e.transformer.capacityAfterOneFailureMva >= e.facilityPeakMva);
  assert.ok(e.phaseTransformer.capacityAfterOneFailurePerPhaseMva >= e.facilityPeakMva / 4);
  assert.ok(e.standby.capacityAfterOneFailurePerPhaseMw >= e.facilityPeakMw / 4);
  assert.ok(e.cooling.rejectionDutyPerPhase * e.cooling.rejectionUnitMw >= 140 / 4);
  assert.ok(e.cooling.cduDutyPerPhase * e.cooling.cduUnitMw >= 90 / 4);
  close(e.ups.deliveredBatteryMwh, 100 * 5 / 60);
  close(e.ups.storedBatteryMwh * 0.9, e.ups.deliveredBatteryMwh);
});

test('energy, occupancy and cost sensitivities move the intended economics', () => {
  const rows = sensitivity(project);
  const energy = rows.find(row => row.variable === 'energyPriceMwh');
  close(energy.lowNpvM, energy.highNpvM);
  const rent = rows.find(row => row.variable === 'leaseRateKwMonth');
  assert.ok(rent.lowNpvM < rent.baseNpvM && rent.baseNpvM < rent.highNpvM);
  const capex = rows.find(row => row.variable === 'facilityCapexPerKw');
  assert.ok(capex.lowNpvM > capex.baseNpvM && capex.baseNpvM > capex.highNpvM);
});

test('invalid values are rejected rather than coerced, and valid results contain no nonfinite numbers', () => {
  for (const values of [{ occupancyPct: -1 }, { loadFactorPct: 101 }, { energyPriceMwh: Infinity }, { leaseRateKwMonth: '180' }, { debtPct: NaN }, { basePue: 0.9 }, { peakPue: 1.1 }, { firstOperationMonth: 12 }, { constructionMonths: 36 }, { firstOperationMonth: 36.5 }, { operatingYears: 5, phaseIntervalMonths: 24 }, { generationPhaseShares: [0.5, 0.5, 0.5, 0.5] }, { generationPhaseShares: [-0.1, 0.1, 0.5, 0.5] }, { generationPhaseShares: [0.5, 0.5] }]) {
    assert.throws(() => calculate(project, values), RangeError);
  }
  const inspect = value => {
    if (typeof value === 'number') assert.ok(Number.isFinite(value));
    else if (value && typeof value === 'object') Object.values(value).forEach(inspect);
  };
  inspect(calculate(project));
  inspect(calculate(project, { occupancyPct: 0, debtPct: 0 }));
  inspect(engineering(project));
  assert.deepEqual(annualCashFlows(project), calculate(project).cashFlows);
});
