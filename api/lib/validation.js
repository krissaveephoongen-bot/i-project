// Input validation schemas using simple validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateRequired = (value, fieldName) => {
  if (!value) {
    throw new Error(`${fieldName} is required`);
  }
  return value;
};

export const validateMinLength = (value, length, fieldName) => {
  if (!value || value.toString().length < length) {
    throw new Error(`${fieldName} must be at least ${length} characters`);
  }
  return value;
};

export const validateMaxLength = (value, length, fieldName) => {
  if (value && value.toString().length > length) {
    throw new Error(`${fieldName} must not exceed ${length} characters`);
  }
  return value;
};

export const validateNumber = (value, fieldName) => {
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`${fieldName} must be a number`);
  }
  return num;
};

export const validateInArray = (value, allowedValues, fieldName) => {
  if (!allowedValues.includes(value)) {
    throw new Error(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
  }
  return value;
};

export const validatePagination = (page, limit) => {
  const p = page ? parseInt(page) : 1;
  const l = limit ? parseInt(limit) : 10;

  if (p < 1) throw new Error('Page must be greater than 0');
  if (l < 1 || l > 100) throw new Error('Limit must be between 1 and 100');

  return { page: p, limit: l, offset: (p - 1) * l };
};
