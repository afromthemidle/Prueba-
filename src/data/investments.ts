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

export const initialInvestments: Investment[] = [];
