export const INR_RATE = 1;
export const CURRENCY_SYMBOL = '₹';

export const formatCurrency = (value: number) => {
  return `${CURRENCY_SYMBOL}${Math.round(value).toLocaleString('en-IN')}`;
};
