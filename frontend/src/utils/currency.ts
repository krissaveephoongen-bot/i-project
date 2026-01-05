/**
 * Currency utilities for displaying Thai Baht (฿)
 */

export const formatCurrency = (
  amount: number | string | null | undefined,
  options?: {
    decimals?: number;
    prefix?: string;
    suffix?: string;
    includeSymbol?: boolean;
  }
): string => {
  if (amount === null || amount === undefined || amount === '') {
    return '฿0.00';
  }

  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(num)) {
    return '฿0.00';
  }

  const {
    decimals = 2,
    prefix = '฿',
    suffix = '',
    includeSymbol = true,
  } = options || {};

  const formatted = num.toLocaleString('th-TH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${includeSymbol ? prefix : ''}${formatted}${suffix}`;
};

export const formatCurrencyCompact = (
  amount: number | string | null | undefined
): string => {
  if (amount === null || amount === undefined || amount === '') {
    return '฿0';
  }

  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(num)) {
    return '฿0';
  }

  if (num >= 1000000) {
    return `฿${(num / 1000000).toFixed(2)}M`;
  } else if (num >= 1000) {
    return `฿${(num / 1000).toFixed(2)}K`;
  }

  return `฿${num.toFixed(0)}`;
};

export const parseCurrency = (
  value: string
): number => {
  // Remove ฿ symbol and spaces, then parse
  return parseFloat(value.replace(/[฿\s,]/g, '')) || 0;
};

export const calculatePercentage = (
  current: number | string,
  total: number | string
): number => {
  const c = typeof current === 'string' ? parseFloat(current) : current;
  const t = typeof total === 'string' ? parseFloat(total) : total;

  if (t === 0) return 0;
  return (c / t) * 100;
};

/**
 * Get Thai Baht symbol
 */
export const BAHT_SYMBOL = '฿';

/**
 * Format currency for display in tables
 */
export const formatTableCurrency = (
  amount: number | string | null | undefined
): string => {
  return formatCurrency(amount, { decimals: 2 });
};

/**
 * Format currency for display in headers/summaries
 */
export const formatSummaryCurrency = (
  amount: number | string | null | undefined
): string => {
  return formatCurrency(amount, { decimals: 2 });
};

/**
 * Get currency class for styling (e.g., positive/negative)
 */
export const getCurrencyClass = (amount: number | string | null): string => {
  if (amount === null || amount === undefined || amount === '') {
    return '';
  }

  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(num)) {
    return '';
  }

  if (num > 0) {
    return 'text-green-600 dark:text-green-400';
  } else if (num < 0) {
    return 'text-red-600 dark:text-red-400';
  }

  return '';
};
