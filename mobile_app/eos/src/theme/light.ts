// Light palette for app screens (same brand colors as colors.ts, tuned for a white background).
export const colors = {
  bg: '#ffffff',
  charcoal: '#f1f1ef',   // card / surface fill
  charcoal2: '#e6e5e0',
  gold: '#c9a227',
  goldLight: '#a8841a',  // deeper gold, readable on white
  green: '#6a9a44',
  greenLight: '#6a9a44',
  white: '#161613',      // primary text
  gray: '#77756b',
  grayDim: '#a3a198',
  line: 'rgba(22,22,19,0.08)',
  lineSoft: 'rgba(22,22,19,0.05)',
  black: '#0a0a0a',
  red: '#e0355a',
};

// Same soft shadow as the bottom nav bar, for cards.
export const cardShadow = {
  shadowColor: 'rgb(149,157,165)',
  shadowOpacity: 0.2,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 8 },
  elevation: 8,
};
