/**
 * การตั้งค่าคอนโซลผู้ดูแลระบบ
 * 
 * การตั้งค่าความปลอดภัย:
 * - MAX_ATTEMPTS: จำนวนครั้งสูงสุดที่ใส่ PIN ผิดก่อนถูกล็อก (ค่าเริ่มต้น: 5 ครั้ง)
 * - LOG_ATTEMPTS: บันทึกประวัติการเข้าถึง (เปิดใช้งาน)
 * - NOTIFY_ON_FAILED_ATTEMPTS: แจ้งเตือนเมื่อมีการพยายามเข้าถึงไม่สำเร็จ
 * - PIN_SESSION_DURATION: ระยะเวลาที่ session ยังคงอยู่ (ค่าเริ่มต้น: 1 ชั่วโมง)
 */

export const adminConfig = {
  MAX_ATTEMPTS: 5,
  LOG_ATTEMPTS: true,
  NOTIFY_ON_FAILED_ATTEMPTS: true,
  PIN_SESSION_DURATION: 60 * 60 * 1000, // 1 hour in milliseconds
  SESSION_WARNING_TIME: 55 * 60 * 1000, // Warn 5 minutes before expiry
};

/**
 * PIN Validation Function
 * 
 * Change this PIN to your desired 6-digit code
 * Default: 123456
 * 
 * For production, use a strong PIN and update regularly
 */
export const validateAdminPIN = (pin: string): boolean => {
  // เปลี่ยนรหัส PIN นี้เป็นรหัสที่ปลอดภัย
  // ตัวอย่าง: ใช้รหัส 6 หลักที่จดจำง่ายแต่คาดเดายาก
  return pin === '246810';
};

/**
 * Admin User Roles
 * Users with these roles can access admin console
 */
export const ADMIN_ROLES = ['admin', 'superadmin'];

/**
 * API Endpoints Configuration
 */
export const ADMIN_ENDPOINTS = {
  METRICS: '/api/admin/metrics',
  HEALTH: '/api/admin/health',
  LOGS: '/api/admin/logs',
  MAINTENANCE_DATABASE: '/api/admin/maintenance/database',
  CACHE_CLEAR: '/api/admin/cache/clear',
};

/**
 * Feature Flags
 * Control which features are available in admin console
 */
export const FEATURE_FLAGS = {
  ENABLE_METRICS: true,
  ENABLE_HEALTH_CHECK: true,
  ENABLE_LOGS: true,
  ENABLE_MAINTENANCE: true,
  ENABLE_CACHE_MANAGEMENT: true,
  ENABLE_DEBUG_MODE: true,
};

/**
 * Theme Configuration
 */
export const ADMIN_THEME = {
  PRIMARY_COLOR: '#3B82F6',
  SECONDARY_COLOR: '#10B981',
  DANGER_COLOR: '#EF4444',
  WARNING_COLOR: '#F59E0B',
  DARK_BG: '#1F2937',
  LIGHT_BG: '#F9FAFB',
};

/**
 * Logging Configuration
 */
export const LOG_CONFIG = {
  LEVEL: 'info', // 'debug' | 'info' | 'warn' | 'error'
  ENABLE_CONSOLE: true,
  ENABLE_FILE: false,
  MAX_LOG_SIZE: 100, // MB
};
