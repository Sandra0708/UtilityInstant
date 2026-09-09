export const origin='https://nexo-herramientas-sgl.sandra0708.chatgpt.site';
export function alternate(locale:string,path=''){return {canonical:`${origin}/${locale}${path}`,languages:{es:`${origin}/es${path}`,en:`${origin}/en${path}`,'x-default':`${origin}/es${path}`}};}

