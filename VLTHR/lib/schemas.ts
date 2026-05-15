export type PRICE_TICK = {
  id?: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
  timestamp: number;
  source: string;
};

export type TIME_SERIES = {
  symbol: string;
  interval: string;
  points: {
    t: number; // timestamp
    o: number; // open
    h: number; // high
    l: number; // low
    c: number; // close
    v: number; // volume
  }[];
};

export type NEWS_ITEM = {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  tickers: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  imageUrl?: string;
};

export type MACRO_SERIES = {
  indicator: string;
  country: string;
  unit: string;
  frequency: string;
  points: {
    date: string;
    value: number;
  }[];
};

export type FUNDAMENTAL = {
  symbol: string;
  marketCap: number;
  pe: number;
  eps: number;
  revenue: number;
  debtToEquity: number;
  dividendYield: number;
  sector: string;
};

export type SIGNAL = {
  id: string;
  type: string;
  symbol: string;
  value: string | number;
  label: string;
  timestamp: number;
};
