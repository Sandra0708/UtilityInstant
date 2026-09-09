export type AdState='loading'|'filled'|'empty'|'error'|'blocked'|'no-consent';
export const placements=['HOME_TOP','HOME_IN_CONTENT','CATEGORY_TOP','TOOL_LEFT_RAIL','TOOL_RIGHT_RAIL','TOOL_TOP','TOOL_AFTER_RESULT','TOOL_AFTER_CHART','TOOL_IN_CONTENT_1','TOOL_IN_CONTENT_2','MOBILE_AFTER_RESULT','MOBILE_IN_CONTENT'] as const;
export type Placement=typeof placements[number];
export const AdConfig={enabled:false,sticky:false,lazyMargin:'200px',placements:Object.fromEntries(placements.map(p=>[p,{allowedSizes:p.includes('RAIL')?[[300,600]]:[[300,250]],reservedWidth:300,reservedHeight:p.includes('RAIL')?600:250,lazyLoad:true}]))};
export type Consent={advertising:boolean;analytics:boolean};
// Adapter boundary for an external CMP. This is deliberately not a CMP implementation.
export class ConsentManager{private state:Consent={advertising:false,analytics:false};private listeners=new Set<()=>void>();get=()=>this.state;setFromCMP(next:Consent){this.state={advertising:next.advertising===true,analytics:next.analytics===true};this.listeners.forEach(fn=>fn());}subscribe=(fn:()=>void)=>{this.listeners.add(fn);return()=>{this.listeners.delete(fn);};};}
export interface AdProvider{load():Promise<void>;render(element:HTMLElement,placement:Placement):Promise<AdState>;destroy(element:HTMLElement):void;}
export class AdManager{private consent:ConsentManager;private provider?:AdProvider;constructor(consent:ConsentManager,provider?:AdProvider){this.consent=consent;this.provider=provider;}async request(element:HTMLElement,placement:Placement):Promise<AdState>{if(!this.consent.get().advertising)return 'no-consent';if(!AdConfig.enabled||!this.provider)return 'empty';try{await this.provider.load();if(!this.consent.get().advertising)return 'no-consent';return await this.provider.render(element,placement);}catch{return 'error';}}destroy(element:HTMLElement){this.provider?.destroy(element);}}
export const consentManager=new ConsentManager();
export const adManager=new AdManager(consentManager);

