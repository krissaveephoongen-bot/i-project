/**
 * Centralized Toast Notification Utilities
 * Provides standardized success and error messages with emojis and Thai language support
 */

import { toast } from 'react-hot-toast';

// ============================================================================
// TOAST MESSAGE TEMPLATES
// ============================================================================

interface ToastMessage {
  en: string;
  th: string;
}

const TOAST_MESSAGES = {
  // ========== CREATE OPERATIONS ==========
  CREATE_SUCCESS: {
    en: '✅ Successfully created',
    th: '✅ สร้างสำเร็จ',
  } as ToastMessage,

  // ========== UPDATE OPERATIONS ==========
  UPDATE_SUCCESS: {
    en: '✅ Successfully updated',
    th: '✅ อัปเดตสำเร็จ',
  } as ToastMessage,

  // ========== DELETE OPERATIONS ==========
  DELETE_SUCCESS: {
    en: '✅ Successfully deleted',
    th: '✅ ลบสำเร็จ',
  } as ToastMessage,

  // ========== SAVE OPERATIONS ==========
  SAVE_SUCCESS: {
    en: '💾 Saved successfully',
    th: '💾 บันทึกสำเร็จ',
  } as ToastMessage,

  // ========== VALIDATION ERRORS ==========
  VALIDATION_ERROR: {
    en: '⚠️ Please check your input',
    th: '⚠️ กรุณาตรวจสอบข้อมูล',
  } as ToastMessage,

  REQUIRED_FIELD: {
    en: '⚠️ This field is required',
    th: '⚠️ กรุณาระบุข้อมูลนี้',
  } as ToastMessage,

  // ========== GENERIC ERRORS ==========
  ERROR: {
    en: '❌ An error occurred',
    th: '❌ เกิดข้อผิดพลาด',
  } as ToastMessage,

  FAILED_TO_SAVE: {
    en: '❌ Failed to save',
    th: '❌ บันทึกล้มเหลว',
  } as ToastMessage,

  FAILED_TO_DELETE: {
    en: '❌ Failed to delete',
    th: '❌ ลบล้มเหลว',
  } as ToastMessage,

  FAILED_TO_UPDATE: {
    en: '❌ Failed to update',
    th: '❌ อัปเดตล้มเหลว',
  } as ToastMessage,

  FAILED_TO_LOAD: {
    en: '❌ Failed to load data',
    th: '❌ โหลดข้อมูลล้มเหลว',
  } as ToastMessage,

  // ========== OPERATION SPECIFIC ==========
  LOADING: {
    en: '⏳ Loading...',
    th: '⏳ กำลังโหลด...',
  } as ToastMessage,

  SUBMITTING: {
    en: '⏳ Submitting...',
    th: '⏳ กำลังส่ง...',
  } as ToastMessage,

  // ========== PERMISSION ERRORS ==========
  UNAUTHORIZED: {
    en: '🔒 You do not have permission to perform this action',
    th: '🔒 คุณไม่มีสิทธิ์ในการดำเนินการนี้',
  } as ToastMessage,

  // ========== NETWORK ERRORS ==========
  NETWORK_ERROR: {
    en: '📡 Network error. Please check your connection',
    th: '📡 ข้อผิดพลาดด้านเครือข่าย โปรดตรวจสอบการเชื่อมต่อ',
  } as ToastMessage,
};

// ============================================================================
// TOAST UTILITY FUNCTIONS
// ============================================================================

/**
 * Get user's preferred language (default: Thai)
 * Can be expanded to read from user preferences/localStorage
 */
export const getPreferredLanguage = (): 'en' | 'th' => {
  if (typeof window === 'undefined') return 'th';
  const lang = localStorage.getItem('language') || 'th';
  return (lang === 'en' ? 'en' : 'th') as 'en' | 'th';
};

/**
 * Get localized message
 */
const getLocalizedMessage = (message: ToastMessage): string => {
  const lang = getPreferredLanguage();
  return message[lang];
};

// ============================================================================
// STANDARDIZED TOAST FUNCTIONS
// ============================================================================

/**
 * Success toast for CREATE operations
 * @param itemType The type of item created (e.g., "User", "Project")
 */
export const toastCreateSuccess = (itemType: string = '') => {
  const baseMsg = getLocalizedMessage(TOAST_MESSAGES.CREATE_SUCCESS);
  const message = itemType ? `${baseMsg} ${itemType}` : baseMsg;
  toast.success(message);
};

/**
 * Success toast for UPDATE operations
 * @param itemType The type of item updated (e.g., "User", "Project")
 */
export const toastUpdateSuccess = (itemType: string = '') => {
  const baseMsg = getLocalizedMessage(TOAST_MESSAGES.UPDATE_SUCCESS);
  const message = itemType ? `${baseMsg} ${itemType}` : baseMsg;
  toast.success(message);
};

/**
 * Success toast for DELETE operations
 * @param itemType The type of item deleted (e.g., "User", "Project")
 */
export const toastDeleteSuccess = (itemType: string = '') => {
  const baseMsg = getLocalizedMessage(TOAST_MESSAGES.DELETE_SUCCESS);
  const message = itemType ? `${baseMsg} ${itemType}` : baseMsg;
  toast.success(message);
};

/**
 * Success toast for SAVE operations
 * @param details Additional details about what was saved
 */
export const toastSaveSuccess = (details: string = '') => {
  const baseMsg = getLocalizedMessage(TOAST_MESSAGES.SAVE_SUCCESS);
  const message = details ? `${baseMsg} - ${details}` : baseMsg;
  toast.success(message);
};

/**
 * Error toast for validation errors
 * @param fieldName The field that failed validation
 * @param errorMsg The specific validation error message
 */
export const toastValidationError = (fieldName?: string, errorMsg?: string) => {
  if (errorMsg) {
    toast.error(errorMsg);
  } else if (fieldName) {
    const lang = getPreferredLanguage();
    const baseMsg = lang === 'en' ? '⚠️' : '⚠️';
    toast.error(`${baseMsg} ${fieldName} ${lang === 'en' ? 'is invalid' : 'ไม่ถูกต้อง'}`);
  } else {
    toast.error(getLocalizedMessage(TOAST_MESSAGES.VALIDATION_ERROR));
  }
};

/**
 * Error toast for failed operations
 * @param operation The operation that failed (create, update, delete, save, load)
 * @param errorMsg Optional custom error message
 */
export const toastError = (
  operation: 'create' | 'update' | 'delete' | 'save' | 'load' | 'submit' = 'save',
  errorMsg?: string
) => {
  if (errorMsg) {
    toast.error(`❌ ${errorMsg}`);
    return;
  }

  const errorMap: Record<string, ToastMessage> = {
    create: TOAST_MESSAGES.FAILED_TO_SAVE,
    update: TOAST_MESSAGES.FAILED_TO_UPDATE,
    delete: TOAST_MESSAGES.FAILED_TO_DELETE,
    save: TOAST_MESSAGES.FAILED_TO_SAVE,
    load: TOAST_MESSAGES.FAILED_TO_LOAD,
    submit: TOAST_MESSAGES.FAILED_TO_SAVE,
  };

  const message = getLocalizedMessage(errorMap[operation] || TOAST_MESSAGES.ERROR);
  toast.error(message);
};

/**
 * Generic success toast
 * @param message The success message to display
 */
export const toastSuccess = (message: string) => {
  toast.success(`✅ ${message}`);
};

/**
 * Generic error toast
 * @param message The error message to display
 */
export const toastGenericError = (message: string) => {
  toast.error(`❌ ${message}`);
};

/**
 * Loading toast (returns toast ID for dismissal)
 * @param message The loading message to display
 */
export const toastLoading = (message?: string) => {
  const msg = message || getLocalizedMessage(TOAST_MESSAGES.LOADING);
  return toast.loading(msg);
};

/**
 * Dismiss a specific toast
 * @param toastId The toast ID to dismiss
 */
export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

/**
 * Permission denied error
 */
export const toastUnauthorized = () => {
  toast.error(getLocalizedMessage(TOAST_MESSAGES.UNAUTHORIZED));
};

/**
 * Network error
 */
export const toastNetworkError = () => {
  toast.error(getLocalizedMessage(TOAST_MESSAGES.NETWORK_ERROR));
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  // Messages
  TOAST_MESSAGES,

  // Utility
  getPreferredLanguage,
  getLocalizedMessage,

  // Functions
  toastCreateSuccess,
  toastUpdateSuccess,
  toastDeleteSuccess,
  toastSaveSuccess,
  toastValidationError,
  toastError,
  toastSuccess,
  toastGenericError,
  toastLoading,
  dismissToast,
  toastUnauthorized,
  toastNetworkError,
};
