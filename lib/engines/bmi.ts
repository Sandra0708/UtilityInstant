import categories from '../../data/bmi-categories.json' with {type:'json'};
import {bounded, dimensions} from './health-input.ts';
export function bmi(weight: number, height: number, age?: number, region: 'international'|'japan' = 'international') {
  dimensions(weight, height);
  if (age !== undefined) bounded(age, 1, 120);
  const value = weight / (height / 100) ** 2;
  const rules = categories[region];
  const index = rules.thresholds.findIndex(limit => value < limit);
  return {value, category: age !== undefined && age < 18 ? 'minor' : rules.categories[index < 0 ? rules.categories.length - 1 : index],
    lower:18.5 * (height / 100) ** 2, upper:25 * (height / 100) ** 2};
}
