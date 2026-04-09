// =============================================================================
// Al Seeb Boat Club — Type Definitions
// =============================================================================

export type Role = {
  id: string;
  name: "admin" | "staff";
  description: string | null;
  created_at: string;
};

export type User = {
  id: string;
  role_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  role?: Role;
};

export type OwnerType = "individual" | "company";

export type Owner = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  alternate_contact: string | null;
  billing_notes: string | null;
  owner_type: OwnerType;
  civil_id: string | null;
  company_name_ar: string | null;
  company_name_en: string | null;
  commercial_register_number: string | null;
  commercial_register_expiry: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  boats?: Boat[];
};

export type BoatStatus = "available" | "parked" | "maintenance";

export type Boat = {
  id: string;
  name: string;
  registration_number: string;
  type: string | null;
  color: string | null;
  length_meters: number | null;
  width_meters: number | null;
  insurance_company: string | null;
  insurance_expiry: string | null;
  insurance_policy_number: string | null;
  notes: string | null;
  status: BoatStatus;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  owners?: Owner[];
  active_session?: ParkingSession | null;
};

export type BoatOwner = {
  boat_id: string;
  owner_id: string;
  is_primary: boolean;
  since_date: string | null;
  boat?: Boat;
  owner?: Owner;
};

export type SpotStatus = "empty" | "occupied" | "maintenance" | "reserved";

export type GeoJSONPoint = {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
};

export type ParkingSpot = {
  id: string;
  spot_number: string;
  coordinates: GeoJSONPoint | null;
  description: string | null;

  status: SpotStatus;

  created_at: string;
  updated_at: string;
  active_session?: ActiveSessionView | null;
};

export type SessionStatus = "active" | "ending_soon" | "overdue" | "closed";
export type PricingModel = "daily" | "weekly" | "monthly" | "custom";

export type ParkingSession = {
  id: string;
  boat_id: string;
  parking_spot_id: string;
  start_date: string;
  expected_end_date: string;
  actual_exit_date: string | null;
  status: SessionStatus;
  pricing_model: PricingModel;
  base_fee: number;
  total_due: number;
  total_paid: number;
  remaining_balance: number;
  last_payment_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  closed_by: string | null;
  boat?: Boat;
  parking_spot?: ParkingSpot;
  payments?: Payment[];
};

export type Payment = {
  id: string;
  session_id: string;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  reference_number: string | null;
  adjustment_reason: string | null;
  is_adjustment: boolean;
  notes: string | null;
  created_at: string;
  created_by: string | null;
  session?: ParkingSession;
};

export type ReminderRule = {
  id: string;
  name: string;
  days_before_end: number | null;
  repeat_interval_days: number | null;
  recipient_type: "customer" | "staff" | "both";
  template_key: string | null;
  is_active: boolean;
  created_at: string;
};

export type ReminderStatus = "pending" | "sent" | "failed" | "skipped" | "cancelled";
export type RecipientType = "customer" | "staff";

export type Reminder = {
  id: string;
  session_id: string;
  rule_id: string | null;
  reminder_type: string;
  recipient_type: RecipientType;
  recipient_email: string | null;
  scheduled_date: string;
  sent_at: string | null;
  status: ReminderStatus;
  error_message: string | null;
  created_at: string;
  session?: ParkingSession;
  rule?: ReminderRule;
};

export type NotificationLog = {
  id: string;
  reminder_id: string | null;
  recipient_email: string;
  subject: string | null;
  provider_message_id: string | null;
  status: string | null;
  error_detail: string | null;
  sent_at: string;
};

export type AuditLog = {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string | null;
  record_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  description: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: User;
};

// =============================================================================
// View Types (from DB views)
// =============================================================================

export type ActiveSessionView = {
  session_id: string;
  start_date: string;
  expected_end_date: string;
  actual_exit_date: string | null;
  status: SessionStatus;
  pricing_model: PricingModel;
  base_fee: number;
  total_due: number;
  total_paid: number;
  remaining_balance: number;
  last_payment_date: string | null;
  session_notes: string | null;
  boat_id: string;
  boat_name: string;
  registration_number: string;
  boat_type: string | null;
  boat_color: string | null;
  length_meters: number | null;
  spot_id: string;
  spot_number: string;

  coordinates: GeoJSONPoint | null;
  owner_id: string | null;
  owner_name: string | null;
  owner_phone: string | null;
  owner_email: string | null;
  days_overdue: number;
  days_remaining: number;
};

export type DashboardStats = {
  total_spots: number;
  occupied_spots: number;
  empty_spots: number;
  ending_soon: number;
  overdue_count: number;
  total_unpaid: number;
  reminders_today: number;
  collected_this_month: number;
};

// =============================================================================
// Form Types
// =============================================================================

export type BoatFormData = {
  name: string;
  registration_number: string;
  type: string;
  color: string;
  length_meters: string;
  notes: string;
  owner_id: string;
};

export type OwnerFormData = {
  full_name: string;
  phone: string;
  email: string;
  alternate_contact: string;
  billing_notes: string;
  owner_type: OwnerType;
  civil_id: string;
  company_name_ar: string;
  company_name_en: string;
  commercial_register_number: string;
  commercial_register_expiry: string;
};

export type SessionFormData = {
  boat_id: string;
  parking_spot_id: string;
  start_date: string;
  expected_end_date: string;
  pricing_model: PricingModel;
  base_fee: string;
  total_due: string;
  notes: string;
};

export type PaymentFormData = {
  session_id: string;
  amount: string;
  payment_date: string;
  payment_method: string;
  reference_number: string;
  notes: string;
  is_adjustment: boolean;
  adjustment_reason: string;
};

// =============================================================================
// Filter / Search types
// =============================================================================

export type SessionFilters = {
  status?: SessionStatus | "all";
  search?: string;
  pier?: string;
  unpaid?: boolean;
  dateFrom?: string;
  dateTo?: string;
};

export type PaymentStatus = "paid" | "partial" | "unpaid" | "overdue";

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  active: "Active",
  ending_soon: "Ending Soon",
  overdue: "Overdue",
  closed: "Closed",
};

export const PRICING_MODEL_LABELS: Record<PricingModel, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  custom: "Custom",
};

export const SPOT_STATUS_LABELS: Record<SpotStatus, string> = {
  empty: "Empty",
  occupied: "Occupied",
  maintenance: "Maintenance",
  reserved: "Reserved",
};


// =============================================================================
// Penalty
// =============================================================================

export type Penalty = {
  id: string;
  session_id: string;
  daily_rate_omr: number;
  start_date: string;
  end_date: string | null;
  days_overdue: number;
  total_penalty_omr: number;
  discount_type: "percentage" | "fixed" | null;
  discount_value: number;
  discount_reason: string | null;
  final_penalty_omr: number;
  approved_by: string | null;
  is_paid: boolean;
  paid_date: string | null;
  created_at: string;
  updated_at: string;
};

// =============================================================================
// Employees
// =============================================================================

export type EmploymentStatus = "active" | "on_leave" | "terminated";

export type Employee = {
  id: string;
  name_ar: string | null;
  name_en: string;
  civil_id: string | null;
  phone: string | null;
  email: string | null;
  position_ar: string | null;
  position_en: string | null;
  department: string | null;
  hire_date: string | null;
  base_salary_omr: number;
  allowances_omr: number;
  deductions_omr: number;
  bank_name: string | null;
  bank_account_number: string | null;
  employment_status: EmploymentStatus;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  salary_records?: SalaryRecord[];
};

export type SalaryRecord = {
  id: string;
  employee_id: string;
  month: string;
  base_salary_omr: number;
  allowances_omr: number;
  deductions_omr: number;
  bonus_omr: number;
  net_salary_omr: number;
  payment_status: "pending" | "paid";
  payment_date: string | null;
  notes: string | null;
  created_at: string;
};

// =============================================================================
// Expenses
// =============================================================================

export type ExpenseCategory = {
  id: string;
  name_ar: string | null;
  name_en: string;
  is_active: boolean;
  created_at: string;
};

export type Expense = {
  id: string;
  category_id: string;
  amount_omr: number;
  description: string | null;
  expense_date: string;
  receipt_url: string | null;
  recorded_by: string | null;
  created_at: string;
  category?: ExpenseCategory;
};
