/**
 * @deprecated Use useAuth from "./useAuth" instead
 * This file provides backward compatibility for old vendor/staff auth hooks
 */

import { useAuth } from "./useAuth";

/**
 * @deprecated Use useAuth() instead - it now handles all authentication types
 * Provided for backward compatibility
 */
export function useVendorAuth() {
  return useAuth();
}

/**
 * @deprecated Use useAuth() instead - it now handles all authentication types
 * Provided for backward compatibility
 */
export function useStaffAuth() {
  return useAuth();
}
