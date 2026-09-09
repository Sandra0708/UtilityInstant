export const primaryOrigin = 'https://utilityinstant.com';
const redirectHosts = new Set(['www.utilityinstant.com','utilityinstant.net','www.utilityinstant.net','utilityinstant.org']);
// Redirect only configured aliases; leave certificate validation and preview hosts intact.
export function domainRedirect(rawUrl: string): string | null {
  const source = new URL(rawUrl);
  if (!redirectHosts.has(source.hostname) || source.pathname.startsWith('/.well-known/')) return null;
  const target = new URL(primaryOrigin);
  target.pathname = source.pathname;
  target.search = source.search;
  return target.toString();
}
