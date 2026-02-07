export enum ViewState {
  GAME = 'GAME',
  DASHBOARD = 'DASHBOARD',
  EXCHANGE = 'EXCHANGE',
  WALLET_CONNECT = 'WALLET_CONNECT'
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balanceFLR: number; // Main reward balance
  balanceUSD: number; // Cashed out balance
}

export interface GameStatus {
  isWinner: boolean;
  score: number;
  opponentScore: number;
  movesLeft: number;
}

export type BonusType = 'DL' | 'TL' | 'DW' | 'TW' | 'START';

export interface TileData {
  id: string;
  letter: string;
  value: number;
}

export interface CellData {
  row: number;
  col: number;
  bonus: BonusType | null;
  tile: TileData | null;
  isTemp: boolean; // If true, placed this turn but not committed
}