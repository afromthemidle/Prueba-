export type InvestmentSector = 
  | 'Financial' 
  | 'Cooperatives' 
  | 'Energy' 
  | 'Cryptocurrencies' 
  | 'Real Estate' 
  | 'Others';

export type InvestmentType = 'Fixed' | 'Variable';

export interface Investment {
  id: string;
  name: string;
  rate: number;
  currency: 'USD' | 'EUR';
  country: string;
  type: InvestmentType;
  sector: InvestmentSector;
  maturityDate?: string;
}

export interface PortfolioSnapshot {
  id: string;
  date: string;
  totalNetWorth: number;
  investments: Investment[];
  amounts: Record<string, number>;
}

export const initialInvestments: Investment[] = [];
