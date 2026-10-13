"""Validate rebuilt release PDFs and ZIPs before publication."""
from pathlib import Path
from zipfile import ZipFile
from pypdf import PdfReader
import json

for region in ['alberta','texas']:
    root=Path('dist/downloads')/region
    model=json.loads((root/'base-case.json').read_text())['model']
    reader=PdfReader(root/'dossier.pdf')
    pages=[page.extract_text() or '' for page in reader.pages]
    text='\n'.join(pages)
    assert len(pages)>10 and all(len(page)>80 for page in pages), 'Missing report pages'
    assert not any(bad in text for bad in ['■','undefined%','NaN']), 'Invalid rendered values'
    assert f"{model['finance']['equityNpvM']:.2f}" in text, 'Report NPV does not match model'
    assert 'Commissioning' in text or 'commissioning' in text
    assert len(reader.outline)>=8, 'Missing report navigation'
    with ZipFile(root/'project-package.zip') as archive:
        assert archive.testzip() is None
        for name in archive.namelist():
            assert archive.read(name)==(root/name).read_bytes(), f'Stale ZIP member: {name}'
    print(f'{region}: {len(pages)} PDF pages; values, bookmarks and ZIP integrity verified')
