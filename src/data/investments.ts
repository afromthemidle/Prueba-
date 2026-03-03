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

export const initialInvestments: Investment[] = [
  { id: "1", name: "Banco Guayaquil", rate: 0.055, currency: "USD", country: "Ecuador", type: "Fixed", sector: "Financial" },
  { id: "2", name: "Banco Pichincha", rate: 0.05, currency: "USD", country: "Ecuador", type: "Fixed", sector: "Financial" }
];
