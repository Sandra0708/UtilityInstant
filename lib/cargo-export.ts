// Rasterising the SVG keeps the exported plan identical to the selected view.
export async function cargoCanvas(svg:SVGSVGElement,lines:string[]){
 const canvas=document.createElement('canvas');canvas.width=1820;canvas.height=1080+lines.length*38;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas unavailable');
 ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
 const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'}));
 try{const img=new Image();await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(Error('Could not render plan'));img.src=url;});ctx.drawImage(img,0,0,1820,1000);}finally{URL.revokeObjectURL(url);}
 ctx.fillStyle='#152338';ctx.font='26px Arial';lines.forEach((line,i)=>ctx.fillText(line,50,1040+i*38,1720));return canvas;
}
export function canvasBlob(canvas:HTMLCanvasElement){return new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('PNG unavailable')),'image/png'));}
// One-page PDF with an embedded JPEG; text and diacritics are rasterised too.
export function jpegPdf(jpeg:Uint8Array,width:number,height:number){
 const enc=new TextEncoder(),parts:Uint8Array[]=[],offsets=[0];let size=0;
 const add=(s:string|Uint8Array)=>{const bytes=typeof s==='string'?enc.encode(s):s;parts.push(bytes);size+=bytes.length;};
 const pageWidth=842,pageHeight=Math.round(pageWidth*height/width);
 add('%PDF-1.4\n');
 const obj=(id:number,body:string)=>{offsets[id]=size;add(`${id} 0 obj\n${body}\nendobj\n`);};
 obj(1,'<< /Type /Catalog /Pages 2 0 R >>');obj(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
 obj(3,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
 offsets[4]=size;add(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);add(jpeg);add('\nendstream\nendobj\n');
 const content=`q ${pageWidth} 0 0 ${pageHeight} 0 0 cm /Im0 Do Q\n`;obj(5,`<< /Length ${enc.encode(content).length} >>\nstream\n${content}endstream`);
 const xref=size;add('xref\n0 6\n0000000000 65535 f \n');for(let i=1;i<6;i++)add(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`);add(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
 const out=new Uint8Array(size);let cursor=0;for(const p of parts){out.set(p,cursor);cursor+=p.length;}return out;
}
