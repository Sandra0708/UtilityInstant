export const origin='https://utilityinstant.com';
export function alternate(locale:string,path=''){return {canonical:`${origin}/${locale}${path}`,languages:{es:`${origin}/es${path}`,en:`${origin}/en${path}`,'x-default':`${origin}/en${path}`}};}

