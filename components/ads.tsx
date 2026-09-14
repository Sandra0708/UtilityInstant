'use client';
import {translate,type Language} from '@/lib/localization';
import { useEffect,useRef,useState } from 'react';
import {AdConfig,adManager,adsenseProvider,bridgeExternalConsent,consentManager,type Placement,type AdState} from '@/lib/ads';
// Mounted once in the root layout. Loads the AdSense tag unconditionally (that
// tag is also what serves the externally configured consent message) and
// connects real consent signals; it never requests or renders an ad itself.
let bootstrapped=false;
export function AdsBootstrap(){useEffect(()=>{if(bootstrapped)return;bootstrapped=true;void adsenseProvider.load();bridgeExternalConsent();},[]);return null;}
export function AdSlot({placement,locale='es'}:{placement:Placement;locale?:string}){const ref=useRef<HTMLDivElement>(null);const [state,setState]=useState<AdState>('no-consent');useEffect(()=>{const element=ref.current;if(!element)return;let alive=true,visible=false,generation=0;const load=async()=>{const current=++generation;if(!consentManager.get().advertising){adManager.destroy(element);setState('no-consent');return;}if(visible){setState('loading');const next=await adManager.request(element,placement);if(alive&&current===generation)setState(next);else adManager.destroy(element);}};const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){visible=true;void load();observer.disconnect();}},{rootMargin:AdConfig.lazyMargin});observer.observe(element);const unsubscribe=consentManager.subscribe(()=>void load());return()=>{alive=false;generation++;observer.disconnect();unsubscribe();adManager.destroy(element);};},[placement]);return <aside className={'ad-slot '+(placement.includes('RAIL')?'ad-rail':'ad-inline')} aria-label={translate(locale,"Espacio publicitario","Advertisement space")} data-placement={placement} data-state={state}><span>{translate(locale,"PUBLICIDAD","ADVERTISEMENT")}</span><div ref={ref}/></aside>;}
