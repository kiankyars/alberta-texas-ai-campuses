from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
for region in ['alberta','texas']:
 out=Path('dist/downloads')/region
 with ZipFile(out/'project-package.zip','w',ZIP_DEFLATED) as z:
  for p in sorted(out.iterdir()):
   if p.is_file() and p.suffix!='.zip':z.write(p,p.name)
 print(region,(out/'project-package.zip').stat().st_size)
