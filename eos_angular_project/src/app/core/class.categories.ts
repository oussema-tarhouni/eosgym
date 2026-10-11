// Single source of truth for class categories (shared by admin + schedule filters).
export const CLASS_CATEGORIES = [
  'Pilates',
  'Dance Orientale',
  'Zumba',
  'Dance Tunisienne',
  'Body Attack',
  'Body Combat',
  'Body Balance',
  'Step',
  'Lia',
  'Yoga',
  'Cardio Mix',
  'CAF',
  'Abdo',
  'Circuit Training',
  'Zumba Kids',
  'Cross Fit Kids',
  'EMOM',
] as const;

export type ClassCategory = typeof CLASS_CATEGORIES[number];
