export const measurementId = 'G-BLYPX8LPFV';
type ConsentValues = {analyticsStoragePurposeConsentStatus?: number};
type ConsentEnums = Record<string, number>;
export function permitsAnalytics(values: ConsentValues, enums: ConsentEnums): boolean {
  const status = values.analyticsStoragePurposeConsentStatus;
  return typeof status === 'number' && (status === enums.CONSENT_MODE_PURPOSE_STATUS_GRANTED || status === enums.CONSENT_MODE_PURPOSE_STATUS_NOT_APPLICABLE);
}
type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  googlefc?: {callbackQueue: unknown[]; getGoogleConsentModeValues?: () => ConsentValues; ConsentModePurposeStatusEnum?: ConsentEnums};
  [key: `ga-disable-${string}`]: boolean;
};
let started = false;
let allowed = false;
let loaded = false;
let lastPath = '';
// Basic consent mode: no Analytics script or events before a valid CMP decision.
// Never infer Analytics permission from advertising/TCF storage permission.
export function startAnalytics(): void {
  if (typeof window === 'undefined' || started) return;
  started = true;
  const w = window as unknown as AnalyticsWindow;
  w.dataLayer = w.dataLayer || [];
  w.gtag = w.gtag || function () { w.dataLayer!.push(arguments); };
  w[`ga-disable-${measurementId}`] = true;
  w.gtag('consent', 'default', {analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  w.googlefc = w.googlefc || {callbackQueue:[]};
  w.googlefc.callbackQueue = w.googlefc.callbackQueue || [];
  w.googlefc.callbackQueue.push({CONSENT_MODE_DATA_READY: () => {
    const fc = w.googlefc!;
    allowed = permitsAnalytics(fc.getGoogleConsentModeValues?.() || {}, fc.ConsentModePurposeStatusEnum || {});
    w[`ga-disable-${measurementId}`] = !allowed;
    w.gtag!('consent', 'update', {analytics_storage:allowed?'granted':'denied'});
    if (!allowed) { lastPath = ''; return; }
    if (!loaded) {
      loaded = true;
      w.gtag!('js', new Date());
      w.gtag!('config', measurementId, {send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false});
      const script = document.createElement('script');
      script.id = 'utilityinstant-analytics'; script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);
    }
    analyticsPageView(window.location.pathname);
  }});
}
export function analyticsPageView(path: string): void {
  if (typeof window === 'undefined' || !allowed || !loaded || lastPath === path) return;
  lastPath = path;
  // Exclude query strings, fragments and all calculator inputs/results.
  (window as unknown as AnalyticsWindow).gtag?.('event','page_view',{send_to:measurementId,page_location:`https://utilityinstant.com${path}`,page_title:`UtilityInstant ${path}`,page_referrer:''});
}
