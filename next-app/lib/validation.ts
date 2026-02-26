/**
 * Validation Utility Functions
 * Provides reusable validation for forms across the application
 */

// ============================================================================
// EMAIL VALIDATION
// ============================================================================

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  return EMAIL_REGEX.test(email);
};

export const validateEmailMessage = (email: string): string | null => {
  if (!email) return "Email is required";
  if (!validateEmail(email)) return "Invalid email format";
  return null;
};

// ============================================================================
// PHONE VALIDATION (Thailand Format)
// ============================================================================

export const PHONE_REGEX = /^[0-9\-\s\(\)]{9,}$/;

export const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Optional field
  return PHONE_REGEX.test(phone);
};

export const validatePhoneMessage = (phone: string): string | null => {
  if (!phone) return null; // Optional
  if (!validatePhone(phone))
    return "Invalid phone number format. Use 02-xxx-xxxx or 08-xxxx-xxxx";
  return null;
};

// ============================================================================
// TAX ID VALIDATION (Thailand - 13 digits)
// ============================================================================

export const THAI_TAX_ID_REGEX = /^\d{13}$/;

export const validateThaiTaxId = (taxId: string): boolean => {
  if (!taxId) return true; // Optional field
  return THAI_TAX_ID_REGEX.test(taxId);
};

export const validateThaiTaxIdMessage = (taxId: string): string | null => {
  if (!taxId) return null; // Optional
  if (!validateThaiTaxId(taxId)) return "Tax ID must be exactly 13 digits";
  return null;
};

// ============================================================================
// TEXT FIELD VALIDATION
// ============================================================================

export const validateRequired = (
  value: string,
  fieldName: string,
): string | null => {
  if (!value || !value.trim()) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string,
): string | null => {
  if (!value) return null; // Let validateRequired handle this
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName: string,
): string | null => {
  if (!value) return null;
  if (value.length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} characters`;
  }
  return null;
};

// ============================================================================
// NUMERIC VALIDATION
// ============================================================================

export const validateBudget = (budget: number | undefined | null): boolean => {
  if (budget === undefined || budget === null) return true; // Optional field
  return !isNaN(budget) && budget >= 0;
};

export const validateBudgetMessage = (
  budget: number | undefined | null,
): string | null => {
  if (budget === undefined || budget === null) return null;
  if (!validateBudget(budget)) return "Budget must be a positive number";
  return null;
};

export const validatePositiveNumber = (
  value: number | undefined | null,
  fieldName: string,
): string | null => {
  if (value === undefined || value === null) return null;
  if (isNaN(value) || value <= 0) {
    return `${fieldName} must be greater than 0`;
  }
  return null;
};

export const validateNonNegativeNumber = (
  value: number | undefined | null,
  fieldName: string,
): string | null => {
  if (value === undefined || value === null) return null;
  if (isNaN(value) || value < 0) {
    return `${fieldName} cannot be negative`;
  }
  return null;
};

// ============================================================================
// PASSWORD VALIDATION
// ============================================================================

export const validatePassword = (password: string): boolean => {
  if (!password) return false;
  return password.length >= 6;
};

export const validatePasswordMessage = (password: string): string | null => {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  if (password.length > 128) return "Password is too long";
  return null;
};

// Strong password validation (optional)
export const validateStrongPassword = (password: string): boolean => {
  if (!password) return false;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLongEnough = password.length >= 8;

  return hasUppercase && hasLowercase && hasNumber && isLongEnough;
};

// ============================================================================
// DATE VALIDATION
// ============================================================================

export const validateDateRange = (
  startDate: string | Date,
  endDate: string | Date,
): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end;
};

export const validateDateRangeMessage = (
  startDate: string | Date,
  endDate: string | Date,
): string | null => {
  if (!startDate || !endDate) return null; // Let validateRequired handle this
  if (!validateDateRange(startDate, endDate)) {
    return "End date must be after start date";
  }
  return null;
};

export const validateDateIsInFuture = (
  date: string | Date,
  fieldName: string,
): string | null => {
  if (!date) return null;
  const selected = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selected < today) {
    return `${fieldName} must be a future date`;
  }
  return null;
};

export const validateDateIsInPast = (
  date: string | Date,
  fieldName: string,
): string | null => {
  if (!date) return null;
  const selected = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selected > today) {
    return `${fieldName} must be a past date`;
  }
  return null;
};

// ============================================================================
// BULK VALIDATION
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, Array<() => string | null>>,
): ValidationResult => {
  const errors: Record<string, string> = {};

  Object.entries(rules).forEach(([fieldName, validations]) => {
    const value = data[fieldName];

    for (const validator of validations) {
      const error = validator();
      if (error) {
        errors[fieldName] = error;
        break; // Stop at first error for this field
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/*
// Single field validation
const emailError = validateEmailMessage('test@example.com');
const phoneError = validatePhoneMessage('02-1234-5678');
const taxIdError = validateThaiTaxIdMessage('1234567890123');

// Bulk validation
const errors = validateForm(
  {
    name: 'John Doe',
    email: 'invalid-email',
    phone: '123',
    budget: 50000,
    startDate: '2026-02-01',
    endDate: '2026-01-01'
  },
  {
    name: [
      () => validateRequired(data.name, 'Name'),
      () => validateMinLength(data.name, 2, 'Name')
    ],
    email: [
      () => validateRequired(data.email, 'Email'),
      () => validateEmailMessage(data.email)
    ],
    phone: [
      () => validatePhoneMessage(data.phone)
    ],
    budget: [
      () => validateBudgetMessage(data.budget)
    ],
    dates: [
      () => validateDateRangeMessage(data.startDate, data.endDate)
    ]
  }
);

if (!errors.isValid) {
  Object.entries(errors.errors).forEach(([field, message]) => {
    toast.error(`${field}: ${message}`);
  });
  return;
}
*/

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  // Email
  validateEmail,
  validateEmailMessage,
  EMAIL_REGEX,

  // Phone
  validatePhone,
  validatePhoneMessage,
  PHONE_REGEX,

  // Tax ID
  validateThaiTaxId,
  validateThaiTaxIdMessage,
  THAI_TAX_ID_REGEX,

  // Text
  validateRequired,
  validateMinLength,
  validateMaxLength,

  // Numeric
  validateBudget,
  validateBudgetMessage,
  validatePositiveNumber,
  validateNonNegativeNumber,

  // Password
  validatePassword,
  validatePasswordMessage,
  validateStrongPassword,

  // Date
  validateDateRange,
  validateDateRangeMessage,
  validateDateIsInFuture,
  validateDateIsInPast,

  // Bulk
  validateForm,
};
