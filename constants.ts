export const APP_NAME = "Creston Rewards";
export const COIN_SYMBOL = "FLR";
export const EXCHANGE_NAME = "Flare Cash Out";
export const FLR_USD_RATE = 0.04; // Mock 1 FLR = $0.04 USD

export const BOARD_SIZE = 15;

export const LETTER_VALUES: Record<string, number> = {
  A: 1, B: 4, C: 4, D: 2, E: 1, F: 4, G: 3, H: 3, I: 1, J: 10, K: 5, L: 2, M: 4,
  N: 2, O: 1, P: 4, Q: 10, R: 1, S: 1, T: 1, U: 2, V: 5, W: 4, X: 8, Y: 3, Z: 10,
  _: 0 
};

export const INITIAL_LETTER_BAG: string[] = [
  ...'AAAAAAAAABBCCDDDDEEEEEEEEEEEEFFGGGHHIIIIIIIIIJKLLLLMMNNNNNNOOOOOOOOPPQRRRRRRSSSSTTTTTTUUUUVVWWXYYZ'.split(''),
  '_', '_'
];

// Helper to determine bonus type for a cell (Standard Layout)
export const getBonusType = (r: number, c: number): import('./types').BonusType | null => {
  // Center
  if (r === 7 && c === 7) return 'START';

  // Triple Word (TW) - Red/Orange
  if ((r === 0 || r === 7 || r === 14) && (c === 0 || c === 7 || c === 14)) {
     if (r === 7 && c === 7) return 'START';
     return 'TW';
  }

  // Double Word (DW) - Pink
  if (
    (r === c || r + c === 14) && 
    (r < 5 || r > 9) &&
    (r !== 0 && r !== 14) // Exclude TW spots
  ) return 'DW';

  // Triple Letter (TL) - Blue
  if (
    ((r === 1 || r === 13) && (c === 5 || c === 9)) ||
    ((r === 5 || r === 9) && (c === 1 || c === 5 || c === 9 || c === 13))
  ) return 'TL';

  // Double Letter (DL) - Light Blue/Green
  if (
    ((r === 0 || r === 14) && (c === 3 || c === 11)) ||
    ((r === 2 || r === 12) && (c === 6 || c === 8)) ||
    ((r === 3 || r === 11) && (c === 0 || c === 7 || c === 14)) ||
    ((r === 6 || r === 8) && (c === 2 || c === 6 || c === 8 || c === 12)) ||
    ((r === 7) && (c === 3 || c === 11))
  ) return 'DL';

  return null;
};