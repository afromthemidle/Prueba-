import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: string = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  } catch (e) {
    // Fallback for non-standard currencies like BTC, ETH, S&P 500, etc.
    return `${value.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${currency}`;
  }
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(dateString: string) {
  if (!dateString) return '';
  // Append T12:00:00 to avoid timezone shifts when parsing YYYY-MM-DD
  const date = new Date(`${dateString}T12:00:00`);
  return date.toLocaleDateString();
}

export function getDaysLeft(dateString: string) {
  if (!dateString) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maturity = new Date(`${dateString}T00:00:00`);
  return Math.round((maturity.getTime() - today.getTime()) / (1000 * 3600 * 24));
}
