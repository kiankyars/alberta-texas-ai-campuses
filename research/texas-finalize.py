from pathlib import Path
import json
root=Path('/Users/kian/Developer/ai-campus-development')
p=root/'data/texas.json';d=json.loads(p.read_text())
d['modelOverrides']['firstOperationMonth']=48
d['executiveSummary'][2]=d['executiveSummary'][2].replace('42/48/54/60','48/54/60/66')
d['executiveSummary'][3]=d['executiveSummary'][3].replace('10.3%','10.2%')
for x in d['assumptions']:
 if x['id']=='TX-A19':x['value']=48;x['basis']='Conditional M48 COD: M12 HV order, 30-month manufacture/delivery to M42, installation/SAT M42-46, integrated acceptance M46-48. Clock starts only after regulatory release; all milestones require written supplier/utility evidence.'
 if x['id']=='TX-A20':x['basis']='25 MW at model months 48/54/60/66 if capacity, demand and delivery gates pass.'
 if x['id']=='TX-A14':x['basis']+=' Beyond each initial 15-year lease, the 20-year project model assumes uninterrupted reletting at unchanged rent and occupancy, no downtime or renewal CAPEX. This is an uncontracted tail of 60/54/48/42 months by phase, not secured revenue.'
 if x['id']=='TX-A06':x['basis']=x['basis'].replace('Excludes separate land and HV connection','Excludes separate land and off-plot utility connection; includes customer-owned HV substation')
d['assumptions'] += [] if any(x['id']=='TX-A25' for x in d['assumptions']) else [dict(id='TX-A25',label='Post-lease renewal revenue',value='60 / 54 / 48 / 42',unit='months beyond 15-year initial leases by phase',basis='Project horizon is 20 years from first operation. Model assumes uninterrupted renewals/reletting at unchanged occupancy/rent after initial leases, with zero downtime or renewal investment; no contracts exist. Lender case must haircut/remove the tail.',status='Uncontracted modelling assumption',sourceIds=[])]
d['commercial']['contracting']+=' Initial term is 15 years per accepted phase. Model revenue thereafter is an explicit uncontracted renewal assumption; do not describe it as take-or-pay coverage.'
for x in d['permits']:
 if x['name']=='Large-load study and connection':x['sequence']='M0-18 studies/agreements; utility and substation works through M46; M46-48 phase-1 authorization and acceptance';x['assumedMonths']=48
 if x['name']=='Water, wastewater and fire service':x['sequence']='M1-12 agreements; actual commissioning verification before M48'
old=[x for x in d['delivery'] if x['name'] not in ['Long-lead procurement reservation']]
for x in old:
 if x['name']=='Phase 1 build, energize and commission':x.update(startMonth=24,endMonth=48,output='25 MW IT accepted at M48 after factory delivery, site testing and explicit energization permission')
 if x['name']=='Phase 2 delivery':x.update(startMonth=30,endMonth=54,output='50 MW cumulative IT accepted at M54')
 if x['name']=='Phase 3 delivery':x.update(startMonth=36,endMonth=60,output='75 MW cumulative IT accepted at M60')
 if x['name']=='Phase 4 delivery':x.update(startMonth=42,endMonth=66,output='100 MW cumulative IT accepted at M66')
 if x['name']=='Operations, warranty and compliance':x.update(startMonth=48,endMonth=78)
new=[
 dict(name='HV tender and technical freeze',startMonth=3,endMonth=12,dependency='Preliminary TSP interface, fault duty, site access and supplier quotations',output='Reviewed RFQ, bankable manufacturing slot, interfaces and sponsor-approved cancellation exposure',status='Planned; no supplier slot'),
 dict(name='HV equipment release and manufacture',startMonth=12,endMonth=42,dependency='Separate sponsor approval for pre-FID order; utility design sufficiently mature; permit conditions and cancel/change exposure accepted',output='30-month order-to-site window including factory witness tests, freight and all 4 primary transformers delivered by M42',status='Conditional; no order or quote'),
 dict(name='HV install and site acceptance',startMonth=42,endMonth=46,dependency='Foundations and cable routes ready, compliant delivery, utility works and authorized installation',output='Installed primary equipment, SAT, calibrated metering, relay and telemetry evidence',status='Conditional'),
 dict(name='Phase 1 integrated commissioning and handover',startMonth=46,endMonth=48,dependency='Utility/ERCOT energization approval, complete cooling/UPS/standby and tenant acceptance criteria',output='Witnessed capacity/thermal/failure tests and signed 25 MW acceptance',status='Conditional; no approved test plan')]
d['delivery']=old[:5]+new+old[5:]
for x in d['procurement']:
 if x['package']=='HV substation and transformers':x['status']='RFQ M3-9; technical freeze/release M12; 30-month order-to-site delivery M42; SAT M42-46; integrated acceptance M46-48. All dates estimates and pre-FID order separately gated.'
d['nextActions'].append('Use texas-execution.md for unsent utility/landowner/OEM requests, phase acceptance criteria, O&M staffing assumptions and anchor lease terms; no template has been dispatched.') if not any('texas-execution' in a for a in d['nextActions']) else None
p.write_text(json.dumps(d,indent=2)+'\n')
p=root/'docs/texas-dossier.md';s=p.read_text()
s=s.replace('42-month first-phase path','48-month first-phase path')
s=s.replace('| Long-lead reservations/fabrication | 12–36 | Approved deposits, factory acceptance and delivery |','| HV technical freeze / order | 3–12 | Mature utility interface, slot and separately approved cancellation exposure |\n| HV manufacture, factory tests and delivery | 12–42 | All primary units on site after 30-month order-to-site allowance |\n| HV installation and site acceptance | 42–46 | Protection, telemetry and electrical installation tested |\n| Integrated commissioning and handover | 46–48 | Written energization permission and tenant acceptance |')
s=s.replace('| First 25 MW block and integrated commissioning | 18–42 |','| First 25 MW block and integrated commissioning | 24–48 |')
s=s.replace('| Additional blocks | 24–48 / 30–54 / 36–60 |','| Additional blocks | 30–54 / 36–60 / 42–66 |')
s=s.replace('| Operations mobilization and warranty | 36 onward |','| Operations mobilization and warranty | 42 onward |')
s=s.replace('Procurement is conditional on adequate design certainty. Early transformer reservations at M12 create at-risk deposits before the M18 FID and require a separate sponsor-approved cap. Without that choice, move the equipment order and first-operation dates later.','Procurement is conditional on adequate design certainty. The base first-operation assumption is now **M48**, providing 30 months from the M12 HV release to M42 delivery, four months for installation/SAT and two for integrated acceptance. M42 operation is not credible on this ordering sequence. Early transformer releases at M12 create at-risk deposits and cancellation liabilities before the M18 FID and require separate sponsor approval. If the sponsor waits for M18 FID to order, shift delivery to M48 and first operation to at least M54. If preliminary utility data cannot freeze the interface by M12, move the release and downstream dates; do not shorten the lead time without supplier evidence.')
s=s.replace('Minimum monthly DSCR','Minimum annual operating DSCR').replace('USD1,453.2m','USD1,456.4m').replace('**10.3%**','**10.2%**').replace('**−USD97m**','**−USD94.9m**').replace('**USD217/kW/month**','**USD218/kW/month**')
s=s.replace('No counterparties have been contacted and no demand is represented as secured.','No counterparties have been contacted and no demand is represented as secured.\n\nThe model horizon is 20 years from the first COD, but the proposed initial lease term is 15 years per phase. It therefore includes **60, 54, 48 and 42 months of uncontracted renewal/reletting revenue** for phases 1–4. That tail assumes unchanged rent and occupancy, no downtime and no renewal CAPEX. It is an explicit underwriting assumption, not part of the initial take-or-pay lease. A lender case must haircut or remove the tail and fund reletting costs; no present customer contract supports it.')
s=s.replace('- `data/texas.json`:', '- `docs/texas-execution.md`: RFQ milestones, measurable acceptance matrix, O&M roles/compliance, proposed lease terms and unsent requests.\n- `data/texas.json`:')
p.write_text(s)
