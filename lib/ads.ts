import {adsensePublisher} from './adsense-account.ts';
export type AdState='loading'|'filled'|'empty'|'error'|'blocked'|'no-consent';
export const placements=['HOME_TOP','HOME_IN_CONTENT','HOME_BOTTOM','HOME_LEFT_RAIL','HOME_RIGHT_RAIL','CATEGORY_TOP','CATEGORY_BOTTOM','CATEGORY_LEFT_RAIL','CATEGORY_RIGHT_RAIL','TOOL_LEFT_RAIL','TOOL_RIGHT_RAIL','TOOL_TOP','TOOL_AFTER_RESULT','TOOL_AFTER_CHART','TOOL_IN_CONTENT_1','TOOL_IN_CONTENT_2','TOOL_BOTTOM','MOBILE_AFTER_RESULT','MOBILE_IN_CONTENT'] as const;
export type Placement=typeof placements[number];
export const AdConfig={enabled:true,sticky:false,lazyMargin:'200px',placements:Object.fromEntries(placements.map(p=>{const rail=p.includes('RAIL');const tallRail=rail&&p.startsWith('TOOL_');return [p,{allowedSizes:rail?[[300,tallRail?600:250]]:[[300,250],[728,90]],reservedWidth:300,reservedHeight:tallRail?600:250,lazyLoad:true}];}))};
// Three AdSense ad units created by the owner. Logical placements map onto them by name: any *_RAIL to Laterales, any *_BOTTOM to Final, everything else (top/in-content, inside tools and the homepage) to Contenido.
export const adUnits={RAIL:'8684583414',CONTENT:'1412598054',FINAL:'1847360679'} as const;
export type AdUnitKey=keyof typeof adUnits;
export const slotFor=(p:Placement):AdUnitKey=>p.includes('RAIL')?'RAIL':p.endsWith('_BOTTOM')?'FINAL':'CONTENT';
export type Consent={advertising:boolean;analytics:boolean};
// Adapter boundary for an external CMP. This is deliberately not a CMP implementation.
export class ConsentManager{private state:Consent={advertising:false,analytics:false};private listeners=new Set<()=>void>();get=()=>this.state;setFromCMP(next:Consent){this.state={advertising:next.advertising===true,analytics:next.analytics===true};this.listeners.forEach(fn=>fn());}subscribe=(fn:()=>void)=>{this.listeners.add(fn);return()=>{this.listeners.delete(fn);};};}
export interface AdProvider{load():Promise<void>;render(element:HTMLElement,placement:Placement):Promise<AdState>;destroy(element:HTMLElement):void;}
export class AdManager{private consent:ConsentManager;private provider?:AdProvider;constructor(consent:ConsentManager,provider?:AdProvider){this.consent=consent;this.provider=provider;}async request(element:HTMLElement,placement:Placement):Promise<AdState>{if(!this.consent.get().advertising)return 'no-consent';if(!AdConfig.enabled||!this.provider)return 'empty';try{await this.provider.load();if(!this.consent.get().advertising)return 'no-consent';return await this.provider.render(element,placement);}catch{return 'error';}}destroy(element:HTMLElement){this.provider?.destroy(element);}}
export const consentManager=new ConsentManager();

// Loads the AdSense tag at most once per page, regardless of consent state.
// Loading the tag itself is what lets the externally configured consent
// message (Funding Choices) appear at all; only actual ad requests below are
// consent-gated. Never used on AMP pages and never injected more than once.
const ADSENSE_SCRIPT_ID='adsbygoogle-js';
let scriptPromise:Promise<void>|null=null;
function loadAdSenseScript():Promise<void>{
	if(typeof document==='undefined')return Promise.resolve();
	if(scriptPromise)return scriptPromise;
	scriptPromise=new Promise(resolve=>{
		if(document.getElementById(ADSENSE_SCRIPT_ID)){resolve();return;}
		const script=document.createElement('script');
		script.id=ADSENSE_SCRIPT_ID;script.async=true;script.crossOrigin='anonymous';
		script.src=`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsensePublisher}`;
		script.onload=()=>resolve();
		script.onerror=()=>resolve();// Degrade to the empty/reserved placeholder rather than throwing.
		document.head.appendChild(script);
	});
	return scriptPromise;
}

// Real AdSense provider: one shared script tag, one <ins> per rendered slot,
// mapped to the logical placement's physical ad unit. Resolves 'filled' or
// 'empty' from the data-ad-status attribute AdSense sets on the element.
export class GoogleAdSenseProvider implements AdProvider{
	load(){return loadAdSenseScript();}
	async render(element:HTMLElement,placement:Placement):Promise<AdState>{
		if(typeof document==='undefined')return 'error';
		await loadAdSenseScript();
		element.innerHTML='';
		const ins=document.createElement('ins');
		ins.className='adsbygoogle';
		ins.style.display='block';ins.style.width='100%';ins.style.height='100%';
		ins.setAttribute('data-ad-client',adsensePublisher);
		ins.setAttribute('data-ad-slot',adUnits[slotFor(placement)]);
		ins.setAttribute('data-ad-format','auto');
		ins.setAttribute('data-full-width-responsive','true');
		element.appendChild(ins);
		return new Promise<AdState>(resolve=>{
			let settled=false;
			const finish=(state:AdState)=>{if(settled)return;settled=true;observer.disconnect();clearTimeout(timer);resolve(state);};
			const observer=new MutationObserver(()=>{
				const status=ins.getAttribute('data-ad-status');
				if(status==='filled')finish('filled');else if(status==='unfilled')finish('empty');
			});
			observer.observe(ins,{attributes:true,attributeFilter:['data-ad-status']});
			const timer=setTimeout(()=>finish(ins.getAttribute('data-ad-status')==='filled'?'filled':'empty'),4000);
			try{((window as unknown as {adsbygoogle:unknown[]}).adsbygoogle=(window as unknown as {adsbygoogle:unknown[]}).adsbygoogle||[]).push({});}
			catch{finish('error');}
		});
	}
	destroy(element:HTMLElement){element.innerHTML='';}
}
export const adsenseProvider=new GoogleAdSenseProvider();
export const adManager=new AdManager(consentManager,adsenseProvider);

// Bridges the externally configured, Google-certified consent message (Funding
// Choices, IAB TCF v2) into our own ConsentManager. Reads real purpose
// signals only; never renders a homemade consent box. Advertising is granted
// only for purposes 1 (store/access info), 3 and 4 (ad selection/personalization).
export function bridgeExternalConsent():void{
	if(typeof window==='undefined')return;
	const w=window as unknown as {__tcfapi?:(command:string,version:number,cb:(data:any,success:boolean)=>void)=>void;googlefc?:{callbackQueue:unknown[]}};
	const read=()=>{
		if(typeof w.__tcfapi!=='function')return;
		w.__tcfapi('addEventListener',2,(tcData:any,success:boolean)=>{
			if(!success||!tcData||tcData.eventStatus==='cmpuishown')return;
			if(tcData.gdprApplies===false){consentManager.setFromCMP({advertising:true,analytics:true});return;}
			const purpose=tcData.purpose?.consent||{};
			consentManager.setFromCMP({advertising:!!(purpose['1']&&purpose['3']&&purpose['4']),analytics:!!purpose['1']});
		});
	};
	w.googlefc=w.googlefc||{callbackQueue:[]};
	w.googlefc.callbackQueue.push({CONSENT_DATA_READY:read});
	read();
}
