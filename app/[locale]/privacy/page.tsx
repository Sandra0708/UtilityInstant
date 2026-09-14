import {privacyContent} from '@/lib/localization/privacy';
import {isLanguage} from '@/lib/localization';
import {translate,type Language} from '@/lib/localization';
import {notFound} from 'next/navigation';
import {Brand} from '@/components/platform';
import {alternate} from '@/lib/seo';
import type {Locale} from '@/lib/tools';

export async function generateMetadata({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;
  if(!isLanguage(locale))return {};
  return {title:translate(locale,"Política de privacidad · UtilityInstant","Privacy policy · UtilityInstant"),robots:{index:false,follow:true},alternates:alternate(locale,'/privacy')};
}

export default async function PrivacyPage({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;
  if(!isLanguage(locale))notFound();
  const en=locale==='en';
  return <main className="policy-page" id="main">
    <header className="policy-header"><Brand locale={locale as Locale}/><a href={`/${locale}`}>{translate(locale,"Volver a las herramientas","Back to tools")}</a></header>
    <article className="policy-content">
      <p className="eyebrow">{translate(locale,"PRIVACIDAD Y COOKIES","PRIVACY AND COOKIES")}</p>
      <h1>{translate(locale,"Política de privacidad","Privacy policy")}</h1>
      <p className="policy-updated">{translate(locale,"Última actualización: 10 de septiembre de 2026","Last updated: September 10, 2026")}</p>
      {privacyContent(locale).map(([tag,text],i)=>tag==='h2'?<h2 key={i}>{text}</h2>:<p key={i}>{text.split('utilityinstant2026@mail.com').map((part,j)=><span key={j}>{j>0&&<a href="mailto:utilityinstant2026@mail.com">utilityinstant2026@mail.com</a>}{part}</span>)}</p>)}
      <p className="policy-note">{translate(locale,"Esta política se actualizará si el sitio incorpora un nuevo proveedor o finalidad de tratamiento.","This policy may be updated when the site adds a new provider or processing purpose.")}</p>
    </article>
  </main>;
}
