/**
 * Formats a number as Thai Baht (THB) with ฿ symbol
 * @param amount - The amount to format (number or string that can be converted to number)
 * @returns Formatted currency string with ฿ symbol (e.g., '฿1,234.56')
 * @example
 * formatCurrency(1234.5) // returns '฿1,234.50'
 * formatCurrency('1234.5') // returns '฿1,234.50'
 */
export const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) {
    console.warn('Invalid amount provided to formatCurrency:', amount);
    return '฿0.00';
  }

  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  .format(num)
  .replace('THB', '฿')
  .trim();
};

/**
 * Formats a number with 2 decimal places (without currency symbol)
 * @param amount - The amount to format (number or string that can be converted to number)
 * @returns Formatted number string with 2 decimal places (e.g., '1,234.56')
 */
export const formatAmount = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) {
    console.warn('Invalid amount provided to formatAmount:', amount);
    return '0.00';
  }

  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

/**
 * Parses a currency string into a number
 * @param currencyString - The currency string to parse (e.g., '฿1,234.56' or '1,234.56')
 * @returns Parsed number or 0 if invalid
 */
export const parseCurrency = (currencyString: string): number => {
  if (!currencyString) return 0;
  
  // Remove currency symbol and thousands separators
  const numberString = currencyString
    .replace(/[^0-9.,-]/g, '') // Remove all non-numeric characters except . , -
    .replace(/,/g, ''); // Remove thousands separators
    
  const num = parseFloat(numberString);
  return isNaN(num) ? 0 : num;
};
