const spanishCountries = new Set(['ES','MX','AR','CO','CL','PE','VE','UY','PY','BO','EC','CR','PA','DO','GT','HN','SV','NI','CU','PR','GQ']);

// Country is supplied by the hosting edge, without calling a geolocation service.
export function preferredLocale(country?: string, acceptLanguage = ''): 'en' | 'es' {
  const code = country?.toUpperCase();
  if (code && /^[A-Z]{2}$/.test(code) && code !== 'XX') {
    return spanishCountries.has(code) ? 'es' : 'en';
  }
  const languages = acceptLanguage.toLowerCase().split(',').map((entry, index) => {
    const [tag, ...parameters] = entry.trim().split(';');
    const quality = parameters.find(parameter => parameter.trim().startsWith('q='));
    const weight = quality ? Number(quality.trim().slice(2)) : 1;
    return {language: tag.split('-')[0], weight, index};
  }).filter(entry => Number.isFinite(entry.weight) && entry.weight > 0 && entry.weight <= 1)
    .sort((a, b) => b.weight - a.weight || a.index - b.index);
  const supported = languages.find(entry => entry.language === 'en' || entry.language === 'es');
  return supported?.language === 'es' ? 'es' : 'en';
}
