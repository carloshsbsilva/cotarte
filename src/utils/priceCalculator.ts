import { PriceUpdateParams } from '../types';

export function calculateNewPrice(params: PriceUpdateParams): number {
  const { currentPrice, dailyBuyVolume, dailySellVolume, totalShares } = params;
  
  // Calculate net volume as a percentage of total shares
  const netVolume = dailyBuyVolume - dailySellVolume;
  const volumePercentage = Math.abs(netVolume) / totalShares;
  
  // Calculate price change percentage (max 10% per day)
  const maxChange = 0.10; // 10%
  let changePercentage = volumePercentage * (netVolume > 0 ? 1 : -1);
  changePercentage = Math.max(Math.min(changePercentage, maxChange), -maxChange);
  
  // Calculate and round new price to 2 decimal places
  const newPrice = currentPrice * (1 + changePercentage);
  return Math.round(newPrice * 100) / 100;
}