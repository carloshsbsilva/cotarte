import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Decimal from 'decimal.js';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string | Decimal): string {
  const numericValue = new Decimal(value);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numericValue.toNumber());
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

export function calculateMarketValue(
  originalPrice: number,
  totalShares: number,
  sharesSold: number
): number {
  const soldRatio = new Decimal(sharesSold).div(totalShares);
  let marketValue = new Decimal(originalPrice).mul(Decimal.add(1, soldRatio));
  
  // If all shares are sold, double the market value
  if (sharesSold === totalShares) {
    marketValue = marketValue.mul(2);
  }
  
  return marketValue.toNumber();
}

export function calculateSharePrice(
  marketValue: number,
  totalShares: number
): number {
  return new Decimal(marketValue).div(totalShares).toNumber();
}

export function calculatePlatformFee(
  amount: number,
  type: 'ipo' | 'secondary'
): number {
  const feePercentage = type === 'ipo' ? 0.05 : 0.025;
  return new Decimal(amount).mul(feePercentage).toNumber();
}