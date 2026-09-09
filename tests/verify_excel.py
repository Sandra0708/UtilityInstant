import zipfile, xml.etree.ElementTree as E
from pathlib import Path
for path in Path('outputs').glob('test-*.xlsx'):
 with zipfile.ZipFile(path) as z:
  assert z.testzip() is None
  for name in z.namelist(): E.fromstring(z.read(name))
  ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
  if 'injection' in path.name:
   root=E.fromstring(z.read('xl/worksheets/sheet1.xml'))
   assert not root.findall('.//s:f',ns)
   assert root.find('.//s:c[@r="A2"]',ns).attrib['t']=='inlineStr'
   assert root.find('.//s:c[@r="B2"]/s:v',ns).text=='123.45'
 print(path.name, 'ZIP CRC, XML and cell types verified')
