import { pgTable, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================
// HOLIDAYS TABLE
// ============================================================

export const holidays = pgTable('holidays', {
  id: text('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  date: text('date').notNull(), // ISO date string (YYYY-MM-DD)
  type: text('type').default('national'), // national, company, religious
  description: text('description'),
  isActive: boolean('is_active').default(true),
  recurring: boolean('recurring').default(true), // Recurs every year
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_holidays_date',
      columns: [table.date],
    },
    {
      name: 'idx_holidays_type',
      columns: [table.type],
    },
    {
      name: 'idx_holidays_active',
      columns: [table.isActive],
    },
    {
      name: 'idx_holidays_recurring',
      columns: [table.recurring],
    },
  ],
}));

// ============================================================
// LABOR RATES TABLE
// ============================================================

export const laborRates = pgTable('labor_rates', {
  id: text('id').primaryKey().defaultRandom(),
  role: text('role').notNull(), // e.g., 'developer', 'designer', 'pm', 'analyst'
  level: text('level').notNull(), // e.g., 'junior', 'mid', 'senior', 'lead'
  hourlyRate: text('hourly_rate').notNull(), // Store as string to handle decimal precision
  currency: text('currency').default('THB'),
  effectiveDate: text('effective_date').notNull(), // When this rate becomes effective
  
  isActive: boolean('is_active').default(true),
  notes: text('notes'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_labor_rates_role',
      columns: [table.role],
    },
    {
      name: 'idx_labor_rates_level',
      columns: [table.level],
    },
    {
      name: 'idx_labor_rates_effective',
      columns: [table.effectiveDate],
    },
    {
      name: 'idx_labor_rates_active',
      columns: [table.isActive],
    },
  ],
}));

// ============================================================
// VENDORS TABLE
// ============================================================

export const vendors = pgTable('vendors', {
  id: text('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  code: text('code').unique(),
  category: text('category').notNull(), // e.g., 'software', 'hardware', 'consulting', 'materials'
  
  // Contact Information
  contactPerson: text('contact_person'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  
  // Business Information
  taxId: text('tax_id'),
  businessLicense: text('business_license'),
  
  // Contract Information
  contractTerms: text('contract_terms'),
  paymentTerms: text('payment_terms'), // e.g., 'net_30', 'net_60', 'upon_completion'
  rateStructure: text('rate_structure'), // e.g., 'hourly', 'fixed', 'retainer'
  
  // Status
  status: text('status').default('active'), // active, inactive, suspended
  isPreferred: boolean('is_preferred').default(false),
  
  // Additional Information
  notes: text('notes'),
  attachments: text('attachments').$type('json'), // Array of file references
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_vendors_name',
      columns: [table.name],
    },
    {
      name: 'idx_vendors_code',
      columns: [table.code],
    },
    {
      name: 'idx_vendors_category',
      columns: [table.category],
    },
    {
      name: 'idx_vendors_status',
      columns: [table.status],
    },
    {
      name: 'idx_vendors_preferred',
      columns: [table.isPreferred],
    },
  ],
}));

// ============================================================
// WORKING DAYS CALENDAR TABLE
// ============================================================

export const workingDaysCalendar = pgTable('working_days_calendar', {
  id: text('id').primaryKey().defaultRandom(),
  date: text('date').notNull(), // ISO date string (YYYY-MM-DD)
  isWorkingDay: boolean('is_working_day').default(true),
  dayType: text('day_type').default('regular'), // regular, weekend, holiday, special
  
  // Optional notes for special days
  notes: text('notes'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_working_days_date',
      columns: [table.date],
    },
    {
      name: 'idx_working_days_type',
      columns: [table.dayType],
    },
    {
      name: 'idx_working_days_working',
      columns: [table.isWorkingDay],
    },
  ],
}));

// ============================================================
// RELATIONSHIPS
// ============================================================

export const holidaysRelations = relations(holidays, ({ many }) => ({
  // Holidays don't have direct relations to other tables in this schema
  // They are referenced by other modules
}));

export const laborRatesRelations = relations(laborRates, ({ many }) => ({
  // Labor rates are referenced by users/projects for cost calculations
}));

export const vendorsRelations = relations(vendors, ({ many }) => ({
  // Vendors are referenced by projects/expenses for procurement tracking
}));

export const workingDaysCalendarRelations = relations(workingDaysCalendar, ({ many }) => ({
  // Working days calendar is used for project timeline calculations
}));

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export type Holiday = typeof holidays.$inferSelect;
export type LaborRate = typeof laborRates.$inferSelect;
export type Vendor = typeof vendors.$inferSelect;
export type WorkingDay = typeof workingDaysCalendar.$inferSelect;

export type CreateHolidayInput = Omit<Holiday, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateHolidayInput = Partial<CreateHolidayInput>;

export type CreateLaborRateInput = Omit<LaborRate, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateLaborRateInput = Partial<CreateLaborRateInput>;

export type CreateVendorInput = Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateVendorInput = Partial<CreateVendorInput>;

export type CreateWorkingDayInput = Omit<WorkingDay, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateWorkingDayInput = Partial<CreateWorkingDayInput>;

// ============================================================
// CONSTANTS
// ============================================================

export const HOLIDAY_TYPES = {
  NATIONAL: 'national',
  COMPANY: 'company',
  RELIGIOUS: 'religious',
} as const;

export const LABOR_RATE_ROLES = {
  DEVELOPER: 'developer',
  DESIGNER: 'designer',
  PROJECT_MANAGER: 'project_manager',
  BUSINESS_ANALYST: 'business_analyst',
  QA_ENGINEER: 'qa_engineer',
  DEVOPS_ENGINEER: 'devops_engineer',
  DATA_ANALYST: 'data_analyst',
  CONSULTANT: 'consultant',
} as const;

export const LABOR_RATE_LEVELS = {
  JUNIOR: 'junior',
  MID: 'mid',
  SENIOR: 'senior',
  LEAD: 'lead',
  PRINCIPAL: 'principal',
} as const;

export const VENDOR_CATEGORIES = {
  SOFTWARE: 'software',
  HARDWARE: 'hardware',
  CONSULTING: 'consulting',
  TRAINING: 'training',
  MATERIALS: 'materials',
  EQUIPMENT: 'equipment',
  FACILITIES: 'facilities',
  LEGAL: 'legal',
  ACCOUNTING: 'accounting',
} as const;

export const VENDOR_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;

export const DAY_TYPES = {
  REGULAR: 'regular',
  WEEKEND: 'weekend',
  HOLIDAY: 'holiday',
  SPECIAL: 'special',
} as const;
