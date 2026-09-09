'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="not-found"><a className="brand" href="/es">UtilityInstant.</a><h1>No hemos podido abrir esta página.</h1><p>We could not load this page. Please try again.</p><button className="primary-button" onClick={reset}>Reintentar / Try again</button></main>;}
