"""Render reproducible independent project PDFs with reportlab and vector drawings."""
from pathlib import Path
import sys,json,re,html
sys.path.insert(0,str(Path('.tmp/pdfdeps').resolve()))
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,PageBreak,KeepTogether
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib.colors import HexColor,white
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from svglib.svglib import svg2rlg
from reportlab.graphics import renderPDF
from pypdf import PdfReader

INK=HexColor('#172e3c');TEAL=HexColor('#39776e');MUTED=HexColor('#60717a');LINE=HexColor('#d8ddd8')
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitleField',fontName='Helvetica',fontSize=35,leading=39,textColor=INK,spaceAfter=18))
styles.add(ParagraphStyle(name='LabelField',fontName='Courier',fontSize=8,leading=12,textColor=MUTED,spaceAfter=10))
styles.add(ParagraphStyle(name='BodyField',fontName='Helvetica',fontSize=9,leading=14,textColor=INK,spaceAfter=7))
styles.add(ParagraphStyle(name='SmallField',fontName='Helvetica',fontSize=7.3,leading=10.5,textColor=MUTED,spaceAfter=5))
styles.add(ParagraphStyle(name='H1Field',fontName='Helvetica-Bold',fontSize=19,leading=24,textColor=INK,spaceBefore=17,spaceAfter=12,keepWithNext=True))
styles.add(ParagraphStyle(name='H2Field',fontName='Helvetica-Bold',fontSize=12,leading=17,textColor=INK,spaceBefore=12,spaceAfter=8,keepWithNext=True))
styles.add(ParagraphStyle(name='TableField',fontName='Helvetica',fontSize=7.5,leading=10,textColor=INK,spaceAfter=0))
styles.add(ParagraphStyle(name='TableHead',fontName='Helvetica-Bold',fontSize=7.5,leading=10,textColor=INK,spaceAfter=0))

def clean(s):
 return str(s).replace('−','-').replace('–','-').replace('—',' - ').replace('→','>').replace('↗','').replace('•',' / ').replace('×',' x ').replace('≥','>=').replace('≤','<=').replace('Δ','Delta ').replace('°',' deg ').replace('₂','2').replace('³','3').replace('²','2').replace('ṁ','m_dot').replace('↑','N').replace('\u00a0',' ')

def rich(s):
 s=html.escape(clean(s))
 s=re.sub(r'\*\*(.+?)\*\*',r'<b>\1</b>',s)
 s=re.sub(r'`([^`]+)`',r'<font name="Courier">\1</font>',s)
 s=re.sub(r'\[([^\]]+)\]\((https?://[^\s)]+)\)',r'<a href="\2" color="#39776e">\1</a>',s)
 return s

def para(s,style='BodyField'):return Paragraph(rich(s),styles[style])

def make_table(rows):
 n=len(rows[0]);width=499
 if n==2:
  left=sum(len(r[0]) for r in rows);right=sum(len(r[1]) for r in rows)
  ratio=max(.28,min(.67,left**.5/(left**.5+right**.5)))
  widths=[width*ratio,width*(1-ratio)]
 elif n==3:widths=[width*.35,width*.30,width*.35]
 else:widths=[width/n]*n
 t=Table([[para(x,'TableHead' if i==0 else 'TableField') for x in row] for i,row in enumerate(rows)],colWidths=widths,repeatRows=1,hAlign='LEFT')
 t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),HexColor('#e9ede7')),('LINEBELOW',(0,0),(-1,-1),.35,LINE),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),('VALIGN',(0,0),(-1,-1),'TOP')]))
 return t

def parse_md(md):
 story=[];lines=md.splitlines();i=0;in_code=False
 while i<len(lines):
  l=lines[i].strip()
  if l.startswith('```'):in_code=not in_code;i+=1;continue
  if not l: i+=1;continue
  if l.startswith('|'):
   rows=[]
   while i<len(lines) and lines[i].strip().startswith('|'):
    row=[x.strip() for x in lines[i].strip().strip('|').split('|')]
    if not all(re.fullmatch(r':?-+:?',x or 'x') for x in row):rows.append(row)
    i+=1
   if rows and all(len(r)==len(rows[0]) for r in rows):story.extend([make_table(rows),Spacer(1,10)])
   else:story.append(para(' / '.join(' / '.join(r) for r in rows)))
   continue
  if l.startswith('# '):story.append(para(l[2:],'H1Field'))
  elif l.startswith('## '):story.append(para(l[3:],'H2Field'))
  elif l.startswith('### '):story.append(para(l[4:],'H2Field'))
  elif l.startswith('- '):story.append(para('- '+l[2:]))
  elif re.fullmatch(r'[-_*]{3,}',l):story.append(Spacer(1,12))
  else:
   accum=[l];i+=1
   while i<len(lines) and lines[i].strip() and not re.match(r'^(#|\||-|```)',lines[i].strip()):accum.append(lines[i].strip());i+=1
   story.append(para(' '.join(accum)));continue
  i+=1
 return story

def footer(canvas,doc):
 canvas.saveState();canvas.setStrokeColor(LINE);canvas.line(48,42,547,42);canvas.setFont('Courier',7);canvas.setFillColor(MUTED)
 canvas.drawString(48,29,f'ALBERTA & TEXAS AI CAMPUSES / {doc.region.upper()} / CONCEPT REV 01 / 13 OCT 2026');canvas.drawRightString(547,29,str(doc.page));canvas.restoreState()

class ProposalDoc(SimpleDocTemplate):
 def afterFlowable(self,flowable):
  if isinstance(flowable,Paragraph) and flowable.style.name=='H1Field':
   key='section-'+str(getattr(self,'section_count',0));self.section_count=getattr(self,'section_count',0)+1
   self.canv.bookmarkPage(key);self.canv.addOutlineEntry(flowable.getPlainText(),key,0,False)

for region in ['alberta','texas']:
 out=Path('dist/downloads')/region;p=json.loads((out/'project.json').read_text());data=json.loads((out/'base-case.json').read_text());m=data['model']
 doc=ProposalDoc(str(out/'dossier.pdf'),pagesize=A4,rightMargin=48,leftMargin=48,topMargin=44,bottomMargin=58,title=p['name']+' - Development Proposal',author='Alberta & Texas AI Campuses',subject='Independent 100 MW concept development proposal')
 doc.region=region;st=[]
 st += [para('ALBERTA & TEXAS AI CAMPUSES / DEVELOPMENT SERIES / '+('001' if region=='alberta' else '002'),'LabelField'),Spacer(1,20),para(region.title()+'<br/>100 MW AI Campus','TitleField')]
 # explicit line breaks are introduced here only as trusted presentation markup
 st[-1]=Paragraph(region.title()+'<br/>100 MW AI Campus',styles['TitleField'])
 st += [para(p['subtitle'],'H2Field'),para(p['thesis']),Spacer(1,15)]
 st += [make_table([['CONCEPT DESIGN BASIS','LOCAL-CURRENCY FINANCIAL CASE'],['100 MW IT / four 25 MW phases',f"{p['currency']} {m['capex']['totalM']:,.0f}m development CAPEX"],[p['site']['name'],f"{p['currency']} {m['finance']['totalFundingM']:,.0f}m funding incl. carry/collateral"],[f"Peak site demand {data['engineering']['designFacilityMw']:.0f} MW",(f"Equity IRR {m['finance']['equityIrrPct']:.1f}%" if m['finance']['equityIrrPct'] is not None else "Equity IRR: no unique result")+" / zero terminal sale value"]]),Spacer(1,20),para('Investment stance','H2Field'),para(p['verdict']),para('Evidence date: 13 October 2026. Land rights, power capacity, permits, suppliers, customers and financing are not secured. This package is concept/pre-feasibility work, not certified design or construction authorization.','SmallField'),Spacer(1,15),para('Package contents','H2Field'),para('Independent site and power case; concept engineering; permitting and delivery; commercial strategy; procurement; operations and commissioning; evidence and assumptions; calculated cash flows and sensitivities.'),PageBreak()]
 for kind,title in [('layout','01 / Campus test-fit'),('electrical','02 / Electrical single-line'),('cooling','03 / Thermal concept')]:
  st += [para(title,'H1Field'),para('Editable vector original included in the project package. Geometry, equipment and ratings are explicit concept assumptions.','SmallField')]
  d=svg2rlg(str(out/f'{kind}.svg'))
  if d:
   factor=499/d.width;d.scale(factor,factor);d.width*=factor;d.height*=factor;st.append(d)
  st += [Spacer(1,15),para({'layout':'A rectangular land budget tests the approximate program footprint. It is not a surveyed parcel overlay; site-specific easements, environmental setbacks, drainage and road geometry require a revised test-fit.','electrical':'The scheme shows capacity relationships. Isolation, diverse distribution, grounding, fault levels, protection coordination, standby transfer and load acceptance require detailed engineering.','cooling':'Annual energy efficiency and peak heat-rejection sizing are separate. Circulating flow is not water consumption. Water availability, local weather design points and manufacturer performance require confirmation.'}[kind]),PageBreak()]
 st.extend(parse_md((out/'dossier.md').read_text()))
 st += [Spacer(1,20),para('Engineering and financial methodology','H1Field')]
 st.extend(parse_md((out/'engineering-basis.md').read_text()))
 doc.build(st,onFirstPage=footer,onLaterPages=footer)
 reader=PdfReader(out/'dossier.pdf');words=sum(len((p.extract_text() or '').split()) for p in reader.pages)
 print(f'{region}: {len(reader.pages)} pages, {words} words, {out / "dossier.pdf"}')
