import {notFound} from 'next/navigation';
import {Brand} from '@/components/platform';
import {alternate} from '@/lib/seo';
import type {Locale} from '@/lib/tools';

export async function generateMetadata({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;
  if(locale!=='es'&&locale!=='en')return {};
  return {title:locale==='es'?'Política de privacidad · UtilityInstant':'Privacy policy · UtilityInstant',robots:{index:false,follow:true},alternates:alternate(locale,'/privacy')};
}

export default async function PrivacyPage({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;
  if(locale!=='es'&&locale!=='en')notFound();
  const en=locale==='en';
  return <main className="policy-page" id="main">
    <header className="policy-header"><Brand locale={locale as Locale}/><a href={`/${locale}`}>{en?'Back to tools':'Volver a las herramientas'}</a></header>
    <article className="policy-content">
      <p className="eyebrow">{en?'PRIVACY AND COOKIES':'PRIVACIDAD Y COOKIES'}</p>
      <h1>{en?'Privacy policy':'Política de privacidad'}</h1>
      <p className="policy-updated">{en?'Last updated: September 9, 2026':'Última actualización: 9 de septiembre de 2026'}</p>
      {en?<>
        <h2>Contact and privacy enquiries</h2>
        <p>For technical support or privacy enquiries, contact UtilityInstant at <a href="mailto:utilityinstant2026@mail.com">utilityinstant2026@mail.com</a>.</p>
        <h2>What data do the tools process?</h2>
        <p>The calculators, converters and text tools process the information you enter in your browser. We do not create user accounts or store your inputs, results or generated passwords on our servers.</p>
        <p>Your browser may save preferences, favourite tools and recently used tools locally on your device. Normal technical information, such as the IP address and requested page, may be processed by the hosting provider to deliver and secure the site.</p>
        <h2>Advertising and cookies</h2>
        <p>UtilityInstant may use Google AdSense to fund the free tools. Advertising cookies and similar technologies are used only according to your choices in the consent message. Google and its advertising partners may process information such as IP address, browser identifiers and device data to provide, measure and prevent abuse in advertising services.</p>
        <p>You can accept, reject or manage advertising consent in the privacy message. You can also change or withdraw your choice through the privacy and cookie settings link when available.</p>
        <h2>Your rights</h2>
        <p>You may contact us to ask about your personal data or exercise the rights available under applicable law. We will respond through the contact address above.</p>
      </>:<>
        <h2>Contacto y consultas de privacidad</h2>
        <p>Para soporte técnico o consultas de privacidad, escribe a UtilityInstant en <a href="mailto:utilityinstant2026@mail.com">utilityinstant2026@mail.com</a>.</p>
        <h2>¿Qué datos procesan las herramientas?</h2>
        <p>Las calculadoras, conversores y herramientas de texto procesan los datos que introduces en tu navegador. No creamos cuentas de usuario ni guardamos en nuestros servidores tus entradas, resultados o contraseñas generadas.</p>
        <p>El navegador puede guardar localmente tus preferencias, herramientas favoritas y herramientas recientes. El alojamiento puede procesar información técnica normal, como la dirección IP y la página solicitada, para entregar y proteger el sitio.</p>
        <h2>Publicidad y cookies</h2>
        <p>UtilityInstant puede utilizar Google AdSense para mantener gratuitas las herramientas. Las cookies publicitarias y tecnologías similares se utilizan según las opciones que elijas en el mensaje de consentimiento. Google y sus partners publicitarios pueden tratar datos como la dirección IP, identificadores del navegador y datos del dispositivo para prestar, medir y proteger sus servicios publicitarios.</p>
        <p>Puedes aceptar, rechazar o gestionar el consentimiento publicitario en el mensaje de privacidad. También podrás cambiar o retirar tu elección desde el enlace de configuración de privacidad y cookies cuando esté disponible.</p>
        <h2>Tus derechos</h2>
        <p>Puedes escribirnos para consultar tus datos personales o ejercer los derechos que correspondan según la legislación aplicable. Responderemos en la dirección de contacto indicada.</p>
      </>}
      <p className="policy-note">{en?'This policy may be updated when the site adds a new provider or processing purpose.':'Esta política se actualizará si el sitio incorpora un nuevo proveedor o finalidad de tratamiento.'}</p>
    </article>
  </main>;
}
