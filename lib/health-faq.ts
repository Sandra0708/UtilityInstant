import {healthText,type HealthKey} from './localization/health.ts';
import type {Language} from './localization/languages.ts';
import type {HealthId} from './health-tools.ts';
export const healthHelp:Record<HealthId,HealthKey>={bmi:'bmiHelp',tdee:'tdeeHelp','body-fat':'fatHelp','ideal-weight':'idealHelp'};
export function healthFaq(id:HealthId,locale:Language){return [{q:healthText(locale,'how'),a:healthText(locale,healthHelp[id])},{q:healthText(locale,'diet'),a:healthText(locale,'safety')},{q:healthText(locale,'save'),a:healthText(locale,'private')}];}
