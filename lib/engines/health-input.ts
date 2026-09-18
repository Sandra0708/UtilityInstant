export type Sex = 'male' | 'female';
export class HealthInputError extends Error {}
export function bounded(value: number, min: number, max: number) {
  if (!Number.isFinite(value) || value < min || value > max) throw new HealthInputError('invalid');
  return value;
}
export function adult(age: number) { bounded(age, 18, 120); }
export function sexValue(sex: Sex) { if (sex !== 'male' && sex !== 'female') throw new HealthInputError('invalid'); }
export function dimensions(weight: number, height: number) { bounded(weight, 20, 500); bounded(height, 100, 250); }
