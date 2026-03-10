export type InvestmentSector = 
  | 'Financial' 
  | 'Technology'
  | 'Healthcare'
  | 'Consumer Goods'
  | 'Industrials'
  | 'Energy' 
  | 'Cryptocurrencies' 
  | 'Real Estate' 
  | 'Others';

export type InvestmentType = 'Fixed' | 'Variable';

export interface Investment {
  id: string;
  name: string;
  rate: number;
  currency: string;
  country: string;
  type: InvestmentType;
  sector: InvestmentSector;
  maturityDate?: string;
  updatedAt?: string;
}

export interface PortfolioSnapshot {
  id: string;
  date: string;
  totalNetWorth: number;
  investments: Investment[];
  amounts: Record<string, number>;
}

export const initialInvestments: Investment[] = [];
