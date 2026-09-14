import {translate,type Language} from './localization/index.ts';
export type FinanceReport={title:string;metrics:{label:string;value:number|null;unit?:'money'|'percent'|'years'}[];columns:string[];rows:(number|string)[][];chart:{x:number;a:number;b:number}[];series:[string,string];notes:string[]};
export function imagePagesPdf(images:{bytes:Uint8Array;width:number;height:number}[]){
 const enc=new TextEncoder(),chunks:Uint8Array[]=[],offsets=[0];let length=0;
 const add=(v:string|Uint8Array)=>{const bytes=typeof v==='string'?enc.encode(v):v;chunks.push(bytes);length+=bytes.length;};
 const object=(id:number,body:string)=>{offsets[id]=length;add(`${id} 0 obj\n${body}\nendobj\n`);};
 add('%PDF-1.4\n');object(1,'<< /Type /Catalog /Pages 2 0 R >>');object(2,`<< /Type /Pages /Count ${images.length} /Kids [${images.map((_,i)=>`${3+i*3} 0 R`).join(' ')}] >>`);
 images.forEach((image,i)=>{const id=3+i*3;object(id,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /XObject << /Im0 ${id+1} 0 R >> >> /Contents ${id+2} 0 R >>`);
 offsets[id+1]=length;add(`${id+1} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>\nstream\n`);add(image.bytes);add('\nendstream\nendobj\n');
 const content='q 842 0 0 595 0 0 cm /Im0 Do Q\n';object(id+2,`<< /Length ${content.length} >>\nstream\n${content}endstream`);});
 const xref=length;add(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);offsets.slice(1).forEach(n=>add(`${String(n).padStart(10,'0')} 00000 n \n`));add(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
 const result=new Uint8Array(length);let p=0;for(const c of chunks){result.set(c,p);p+=c.length;}return result;
}
export async function financePdf(report:FinanceReport,format:(v:number|null,unit?:string)=>string,svg:SVGSVGElement|null,inputs:[string,string][],locale:Language='es'){
 const images:{bytes:Uint8Array;width:number;height:number}[]=[];
 const canvas=document.createElement('canvas');canvas.width=1684;canvas.height=1190;const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas unavailable');
 const page=(heading:string)=>{ctx.fillStyle='#fff';ctx.fillRect(0,0,1684,1190);ctx.fillStyle='#183354';ctx.font='bold 32px Arial';ctx.fillText('UtilityInstant · '+report.title,50,65,1570);ctx.font='24px Arial';ctx.fillText(heading,50,110,1570);};
 const save=()=>{ctx.fillStyle='#627086';ctx.font='18px Arial';ctx.fillText(String(images.length+1),1590,1150);images.push({width:1684,height:1190,bytes:Uint8Array.from(atob(canvas.toDataURL('image/jpeg',.91).split(',')[1]),c=>c.charCodeAt(0))});};
 page(translate(locale,'Resumen','Summary'));report.metrics.forEach((m,i)=>{ctx.fillStyle='#183354';ctx.font='22px Arial';ctx.fillText(m.label+': '+format(m.value,m.unit),50+(i%2)*800,165+Math.floor(i/2)*38,760);});
 if(svg){const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'}));try{const img=new Image();await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=reject;img.src=url;});ctx.drawImage(img,50,420,1580,480);}finally{URL.revokeObjectURL(url);}}
 ctx.font='18px Arial';report.notes.slice(0,5).forEach((s,i)=>ctx.fillText(s,50,945+i*34,1570));save();
 const table=(headers:string[],rows:(string|number)[][],heading:string)=>{for(let offset=0;offset<rows.length;offset+=24){page(heading);const widths=headers.map(()=>1580/headers.length);ctx.fillStyle='#315fdf';ctx.fillRect(50,140,1580,36);ctx.font='17px Arial';headers.forEach((h,i)=>{ctx.fillStyle='#fff';ctx.fillText(h,55+i*widths[i],165,widths[i]-10);});rows.slice(offset,offset+24).forEach((row,j)=>{ctx.fillStyle=j%2?'#f0f4fa':'#fff';ctx.fillRect(50,180+j*37,1580,37);ctx.fillStyle='#183354';row.forEach((v,i)=>ctx.fillText(typeof v==='number'?format(v):v,55+i*widths[i],205+j*37,widths[i]-10));});save();}};
 table(report.columns,report.rows,translate(locale,'Tabla completa','Full schedule'));table([translate(locale,'Entradas','Inputs'),translate(locale,'Valor','Value')],inputs,translate(locale,'Supuestos y limitaciones','Assumptions and limitations'));return imagePagesPdf(images);
}
