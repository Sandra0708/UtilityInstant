export function downloadName(id:string,extension:string,date=new Date()) {
  const p=(n:number)=>String(n).padStart(2,'0');
  return `${date.getFullYear()}${p(date.getMonth()+1)}${p(date.getDate())}_${p(date.getHours())}${p(date.getMinutes())}${p(date.getSeconds())}_utilityinstant_tools_${id}.${extension}`;
}
export function delimited(rows:(string|number)[][],separator='\t',quote='"') {
  if(!separator||/[\r\n]/.test(separator)||separator.includes('"')||separator.includes("'")) throw Error('Separador no válido / Invalid separator');
  return rows.map(row=>row.map(value=>{
    const s=String(value);
    if(!quote) {if(s.includes(separator)||/[\r\n]/.test(s)) throw Error('Hay celdas con separadores o saltos de línea: activa las comillas. / Enable quotes for these cells.');return s;}
    return quote+s.split(quote).join(quote+quote)+quote;
  }).join(separator)).join('\r\n');
}
export function saveFile(data:BlobPart,extension:string,id='json',type='text/plain;charset=utf-8') {
  const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=downloadName(id,extension);a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
