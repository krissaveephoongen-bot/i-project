/**
 * Middleware to validate that all monetary values are in Thai Baht (THB)
 * This ensures consistency in currency representation across the application
 */

const validateCurrency = (req, res, next) => {
  // Skip validation for GET and DELETE requests
  if (req.method === 'GET' || req.method === 'DELETE') {
    return next();
  }

  // List of fields that should be in THB
  const currencyFields = [
    'amount', 'budget', 'cost', 'price', 'expense', 'total', 'subtotal',
    'tax', 'discount', 'shipping', 'fee', 'payment', 'refund', 'salary',
    'bonus', 'commission', 'revenue', 'profit', 'loss', 'income', 'expense',
    'paymentAmount', 'contractAmount', 'billingAmount', 'invoiceAmount',
    'credit', 'debit', 'balance', 'withdrawal', 'deposit', 'transfer'
  ];

  // Check request body
  const checkObject = (obj) => {
    if (!obj || typeof obj !== 'object') return false;
    
    for (const [key, value] of Object.entries(obj)) {
      // If the key indicates a currency field
      const isCurrencyField = currencyFields.some(field => 
        key.toLowerCase().includes(field.toLowerCase())
      );

      if (isCurrencyField && value !== undefined && value !== null) {
        // If it's a number or a string that can be converted to a number
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue !== 0) {
          // Check if the field has a currency code (e.g., amount_currency)
          const currencyField = Object.keys(obj).find(k => 
            k.toLowerCase() === `${key}_currency` || 
            k.toLowerCase() === `${key}currency` ||
            k === 'currency'
          );

          if (currencyField && obj[currencyField] && obj[currencyField].toUpperCase() !== 'THB') {
            return {
              valid: false,
              field: key,
              message: `Currency must be THB, got ${obj[currencyField]}`
            };
          }
        }
      }

      // Recursively check nested objects
      if (typeof value === 'object') {
        const result = checkObject(value);
        if (result && !result.valid) return result;
      }
    }
    
    return { valid: true };
  };

  const validation = checkObject(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: 'Invalid currency',
      message: validation.message || 'All monetary values must be in THB',
      field: validation.field
    });
  }

  // Add THB as default currency if not specified
  const addDefaultCurrency = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    
    for (const [key, value] of Object.entries(obj)) {
      const isCurrencyField = currencyFields.some(field => 
        key.toLowerCase().includes(field.toLowerCase())
      );

      if (isCurrencyField && value !== undefined && value !== null) {
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue !== 0) {
          const currencyField = Object.keys(obj).find(k => 
            k.toLowerCase() === `${key}_currency` || 
            k.toLowerCase() === `${key}currency`
          );

          if (!currencyField) {
            obj[`${key}Currency`] = 'THB';
          }
        }
      }

      // Recursively process nested objects
      if (typeof value === 'object') {
        addDefaultCurrency(value);
      }
    }
  };

  // Add default currency to request body
  addDefaultCurrency(req.body);
  
  next();
};

module.exports = validateCurrency;
