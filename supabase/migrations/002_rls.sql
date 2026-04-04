-- =============================================================================
-- Migration 002: Row Level Security
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE boats ENABLE ROW LEVEL SECURITY;
ALTER TABLE boat_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER AS $$
  SELECT r.name FROM users u
  JOIN roles r ON r.id = u.role_id
  WHERE u.id = auth.uid()
$$;

-- Helper: is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT get_current_user_role() = 'admin'
$$;

-- Helper: is staff or admin
CREATE OR REPLACE FUNCTION is_staff_or_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT get_current_user_role() IN ('admin', 'staff')
$$;

-- =============================================================================
-- USERS policies
-- =============================================================================
CREATE POLICY "users_select" ON users
  FOR SELECT USING (is_staff_or_admin());

CREATE POLICY "users_insert" ON users
  FOR INSERT WITH CHECK (auth.uid() = id OR is_admin());

CREATE POLICY "users_update" ON users
  FOR UPDATE USING (auth.uid() = id OR is_admin());

CREATE POLICY "users_delete" ON users
  FOR DELETE USING (is_admin());

-- =============================================================================
-- OWNERS policies
-- =============================================================================
CREATE POLICY "owners_select" ON owners
  FOR SELECT USING (is_staff_or_admin());

CREATE POLICY "owners_insert" ON owners
  FOR INSERT WITH CHECK (is_staff_or_admin());

CREATE POLICY "owners_update" ON owners
  FOR UPDATE USING (is_staff_or_admin());

CREATE POLICY "owners_delete" ON owners
  FOR DELETE USING (is_admin());

-- =============================================================================
-- BOATS policies
-- =============================================================================
CREATE POLICY "boats_select" ON boats
  FOR SELECT USING (is_staff_or_admin());

CREATE POLICY "boats_insert" ON boats
  FOR INSERT WITH CHECK (is_staff_or_admin());

CREATE POLICY "boats_update" ON boats
  FOR UPDATE USING (is_staff_or_admin());

CREATE POLICY "boats_delete" ON boats
  FOR DELETE USING (is_admin());

-- =============================================================================
-- BOAT_OWNERS policies
-- =============================================================================
CREATE POLICY "boat_owners_select" ON boat_owners
  FOR SELECT USING (is_staff_or_admin());

CREATE POLICY "boat_owners_insert" ON boat_owners
  FOR INSERT WITH CHECK (is_staff_or_admin());

CREATE POLICY "boat_owners_update" ON boat_owners
  FOR UPDATE USING (is_staff_or_admin());

CREATE POLICY "boat_owners_delete" ON boat_owners
  FOR DELETE USING (is_admin());

-- =============================================================================
-- PARKING_SPOTS policies
-- =============================================================================
CREATE POLICY "spots_select" ON parking_spots
  FOR SELECT USING (is_staff_or_admin());

CREATE POLICY "spots_insert" ON parking_spots
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "spots_update" ON parking_spots
  FOR UPDATE USING (is_staff_or_admin());

CREATE POLICY "spots_delete" ON parking_spots
  FOR DELETE USING (is_admin());

-- =============================================================================
-- PARKING_SESSIONS policies
-- =============================================================================
CREATE POLICY "sessions_select" ON parking_sessions
  FOR SELECT USING (is_staff_or_admin());

CREATE POLICY "sessions_insert" ON parking_sessions
  FOR INSERT WITH CHECK (is_staff_or_admin());

CREATE POLICY "sessions_update" ON parking_sessions
  FOR UPDATE USING (is_staff_or_admin());

CREATE POLICY "sessions_delete" ON parking_sessions
  FOR DELETE USING (is_admin());

-- =============================================================================
-- PAYMENTS policies
-- =============================================================================
CREATE POLICY "payments_select" ON payments
  FOR SELECT USING (is_staff_or_admin());

CREATE POLICY "payments_insert" ON payments
  FOR INSERT WITH CHECK (is_staff_or_admin());

CREATE POLICY "payments_update" ON payments
  FOR UPDATE USING (is_admin());

CREATE POLICY "payments_delete" ON payments
  FOR DELETE USING (is_admin());

-- =============================================================================
-- REMINDER_RULES policies
-- =============================================================================
CREATE POLICY "reminder_rules_select" ON reminder_rules
  FOR SELECT USING (is_staff_or_admin());

CREATE POLICY "reminder_rules_all" ON reminder_rules
  FOR ALL USING (is_admin());

-- =============================================================================
-- REMINDERS policies
-- =============================================================================
CREATE POLICY "reminders_select" ON reminders
  FOR SELECT USING (is_staff_or_admin());

CREATE POLICY "reminders_insert" ON reminders
  FOR INSERT WITH CHECK (is_staff_or_admin());

CREATE POLICY "reminders_update" ON reminders
  FOR UPDATE USING (is_staff_or_admin());

-- =============================================================================
-- NOTIFICATION_LOGS policies
-- =============================================================================
CREATE POLICY "notif_logs_select" ON notification_logs
  FOR SELECT USING (is_staff_or_admin());

-- =============================================================================
-- AUDIT_LOGS policies
-- =============================================================================
CREATE POLICY "audit_select" ON audit_logs
  FOR SELECT USING (is_admin());

CREATE POLICY "audit_insert" ON audit_logs
  FOR INSERT WITH CHECK (is_staff_or_admin());
