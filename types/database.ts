// Database Types for Prisma

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Watchlist {
  id: string;
  userId: string;
  symbol: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalEntry {
  id: string;
  userId: string;
  symbol: string;
  date: Date;
  timeframe: string;
  direction: 'BUY' | 'SELL';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  result?: 'WIN' | 'LOSS' | 'BREAKEVEN' | 'OPEN';
  profit?: number;
  notes?: string;
  screenshot?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedAnalysis {
  id: string;
  userId: string;
  symbol: string;
  timeframe: string;
  data: any; // JSON data of MarketAnalysis
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreference {
  id: string;
  userId: string;
  theme: 'dark' | 'light';
  defaultTimeframe: string;
  favoriteIndicators: string[];
  notifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}
