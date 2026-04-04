-- =============================================================================
-- Al Seeb Bay Parking Management System
-- Migration 001: Core Schema
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for text search

-- =============================================================================
-- ROLES
-- =============================================================================
CREATE TABLE roles (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO roles (name, description) VALUES
  ('admin', 'Full system access including user management and settings'),
  ('staff', 'Operational access for managing boats, sessions and payments');

-- =============================================================================
-- USERS (extends Supabase auth.users)
-- =============================================================================
CREATE TABLE users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id    UUID REFERENCES roles(id),
  full_name  VARCHAR(255),
  email      VARCHAR(255),
  phone      VARCHAR(50),
  is_active  BOOLEAN DEFAULT TRUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create user profile on sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  staff_role_id UUID;
BEGIN
  SELECT id INTO staff_role_id FROM roles WHERE name = 'staff';
  INSERT INTO public.users (id, email, full_name, role_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    staff_role_id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- =============================================================================
-- OWNERS
-- =============================================================================
CREATE TABLE owners (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name         VARCHAR(255) NOT NULL,
  phone             VARCHAR(50),
  email             VARCHAR(255),
  alternate_contact VARCHAR(255),
  billing_notes     TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  created_by        UUID REFERENCES users(id)
);

CREATE INDEX idx_owners_name ON owners USING gin(full_name gin_trgm_ops);
CREATE INDEX idx_owners_email ON owners(email);
CREATE INDEX idx_owners_phone ON owners(phone);

-- =============================================================================
-- BOATS
-- =============================================================================
CREATE TABLE boats (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                VARCHAR(255) NOT NULL,
  registration_number VARCHAR(100) UNIQUE NOT NULL,
  type                VARCHAR(100),
  color               VARCHAR(100),
  length_meters       DECIMAL(6,2),
  notes               TEXT,
  status              VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'parked', 'maintenance')),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  created_by          UUID REFERENCES users(id)
);

CREATE INDEX idx_boats_name ON boats USING gin(name gin_trgm_ops);
CREATE INDEX idx_boats_registration ON boats(registration_number);
CREATE INDEX idx_boats_status ON boats(status);

-- =============================================================================
-- BOAT-OWNER RELATIONSHIP
-- =============================================================================
CREATE TABLE boat_owners (
  boat_id    UUID NOT NULL REFERENCES boats(id) ON DELETE CASCADE,
  owner_id   UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  since_date DATE,
  PRIMARY KEY (boat_id, owner_id)
);

CREATE INDEX idx_boat_owners_owner ON boat_owners(owner_id);
CREATE INDEX idx_boat_owners_boat ON boat_owners(boat_id);

-- =============================================================================
-- PARKING SPOTS
-- =============================================================================
CREATE TABLE parking_spots (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spot_number      VARCHAR(20) UNIQUE NOT NULL,
  coordinates      JSONB,  -- GeoJSON Point or Polygon
  description      TEXT,
  max_length_meters DECIMAL(6,2),
  status           VARCHAR(50) DEFAULT 'empty' CHECK (status IN ('empty', 'occupied', 'maintenance', 'reserved')),
  pier_section     VARCHAR(50),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_spots_number ON parking_spots(spot_number);
CREATE INDEX idx_spots_status ON parking_spots(status);

-- =============================================================================
-- PARKING SESSIONS
-- =============================================================================
CREATE TABLE parking_sessions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boat_id          UUID NOT NULL REFERENCES boats(id),
  parking_spot_id  UUID NOT NULL REFERENCES parking_spots(id),
  start_date       DATE NOT NULL,
  expected_end_date DATE NOT NULL,
  actual_exit_date DATE,
  status           VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'ending_soon', 'overdue', 'closed')),
  pricing_model    VARCHAR(50) DEFAULT 'monthly' CHECK (pricing_model IN ('daily', 'weekly', 'monthly', 'custom')),
  base_fee         DECIMAL(10,3) NOT NULL DEFAULT 0,
  total_due        DECIMAL(10,3) NOT NULL DEFAULT 0,
  total_paid       DECIMAL(10,3) NOT NULL DEFAULT 0,
  last_payment_date DATE,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  created_by       UUID REFERENCES users(id),
  closed_by        UUID REFERENCES users(id)
);

-- Computed column via trigger (remaining_balance)
ALTER TABLE parking_sessions
  ADD COLUMN remaining_balance DECIMAL(10,3) GENERATED ALWAYS AS (total_due - total_paid) STORED;

-- Only one active/ending_soon/overdue session per spot
CREATE UNIQUE INDEX idx_one_active_session_per_spot
  ON parking_sessions(parking_spot_id)
  WHERE status IN ('active', 'ending_soon', 'overdue');

CREATE INDEX idx_sessions_boat ON parking_sessions(boat_id);
CREATE INDEX idx_sessions_status ON parking_sessions(status);
CREATE INDEX idx_sessions_end_date ON parking_sessions(expected_end_date);
CREATE INDEX idx_sessions_spot ON parking_sessions(parking_spot_id);

-- =============================================================================
-- PAYMENTS
-- =============================================================================
CREATE TABLE payments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id       UUID NOT NULL REFERENCES parking_sessions(id),
  amount           DECIMAL(10,3) NOT NULL CHECK (amount > 0),
  payment_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method   VARCHAR(100),
  reference_number VARCHAR(255),
  adjustment_reason TEXT, -- for manual adjustments
  is_adjustment    BOOLEAN DEFAULT FALSE,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  created_by       UUID REFERENCES users(id)
);

CREATE INDEX idx_payments_session ON payments(session_id);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- Trigger to update session total_paid and last_payment_date after payment insert
CREATE OR REPLACE FUNCTION update_session_on_payment()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE parking_sessions
  SET
    total_paid = (
      SELECT COALESCE(SUM(amount), 0)
      FROM payments
      WHERE session_id = NEW.session_id
    ),
    last_payment_date = (
      SELECT MAX(payment_date)
      FROM payments
      WHERE session_id = NEW.session_id
    ),
    updated_at = NOW()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER payment_inserted
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE PROCEDURE update_session_on_payment();

-- =============================================================================
-- REMINDER RULES
-- =============================================================================
CREATE TABLE reminder_rules (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 VARCHAR(255) NOT NULL,
  days_before_end      INT,           -- negative = days AFTER end date
  repeat_interval_days INT,           -- for post-due repeat reminders
  recipient_type       VARCHAR(50) CHECK (recipient_type IN ('customer', 'staff', 'both')),
  template_key         VARCHAR(100),
  is_active            BOOLEAN DEFAULT TRUE,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Default reminder rules
INSERT INTO reminder_rules (name, days_before_end, recipient_type, template_key) VALUES
  ('30 Days Before End', 30,  'both',     'reminder_30d'),
  ('20 Days Before End', 20,  'both',     'reminder_20d'),
  ('10 Days Before End', 10,  'both',     'reminder_10d'),
  ('7 Days Before End',   7,  'both',     'reminder_7d'),
  ('3 Days Before End',   3,  'both',     'reminder_3d'),
  ('1 Day Before End',    1,  'both',     'reminder_1d'),
  ('Due Date',            0,  'both',     'reminder_due'),
  ('Post-Due Follow-up', -7,  'both',     'reminder_overdue');

-- The post-due follow-up repeats every 7 days (handled by cron logic)

-- =============================================================================
-- REMINDERS
-- =============================================================================
CREATE TABLE reminders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      UUID NOT NULL REFERENCES parking_sessions(id),
  rule_id         UUID REFERENCES reminder_rules(id),
  reminder_type   VARCHAR(100) NOT NULL,
  recipient_type  VARCHAR(50) CHECK (recipient_type IN ('customer', 'staff')),
  recipient_email VARCHAR(255),
  scheduled_date  DATE NOT NULL,
  sent_at         TIMESTAMPTZ,
  status          VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped', 'cancelled')),
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reminders_session ON reminders(session_id);
CREATE INDEX idx_reminders_status ON reminders(status);
CREATE INDEX idx_reminders_scheduled ON reminders(scheduled_date);

-- =============================================================================
-- NOTIFICATION LOGS
-- =============================================================================
CREATE TABLE notification_logs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reminder_id         UUID REFERENCES reminders(id),
  recipient_email     VARCHAR(255) NOT NULL,
  subject             VARCHAR(500),
  provider_message_id VARCHAR(255),
  status              VARCHAR(50),
  error_detail        TEXT,
  sent_at             TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- AUDIT LOGS
-- =============================================================================
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id),
  action      VARCHAR(100) NOT NULL,
  table_name  VARCHAR(100),
  record_id   UUID,
  old_values  JSONB,
  new_values  JSONB,
  description TEXT,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- =============================================================================
-- VIEWS
-- =============================================================================

-- Active sessions with full details
CREATE OR REPLACE VIEW active_sessions_view AS
SELECT
  ps.id AS session_id,
  ps.start_date,
  ps.expected_end_date,
  ps.actual_exit_date,
  ps.status,
  ps.pricing_model,
  ps.base_fee,
  ps.total_due,
  ps.total_paid,
  ps.remaining_balance,
  ps.last_payment_date,
  ps.notes AS session_notes,
  b.id AS boat_id,
  b.name AS boat_name,
  b.registration_number,
  b.type AS boat_type,
  b.color AS boat_color,
  b.length_meters,
  sp.id AS spot_id,
  sp.spot_number,
  sp.pier_section,
  sp.coordinates,
  o.id AS owner_id,
  o.full_name AS owner_name,
  o.phone AS owner_phone,
  o.email AS owner_email,
  (CURRENT_DATE - ps.expected_end_date) AS days_overdue,
  (ps.expected_end_date - CURRENT_DATE) AS days_remaining
FROM parking_sessions ps
JOIN boats b ON b.id = ps.boat_id
JOIN parking_spots sp ON sp.id = ps.parking_spot_id
LEFT JOIN boat_owners bo ON bo.boat_id = b.id AND bo.is_primary = TRUE
LEFT JOIN owners o ON o.id = bo.owner_id
WHERE ps.status != 'closed';

-- Dashboard stats view
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM parking_spots) AS total_spots,
  (SELECT COUNT(*) FROM parking_spots WHERE status = 'occupied') AS occupied_spots,
  (SELECT COUNT(*) FROM parking_spots WHERE status = 'empty') AS empty_spots,
  (SELECT COUNT(*) FROM parking_sessions WHERE status = 'ending_soon') AS ending_soon,
  (SELECT COUNT(*) FROM parking_sessions WHERE status = 'overdue') AS overdue_count,
  (SELECT COALESCE(SUM(remaining_balance), 0) FROM parking_sessions WHERE status != 'closed' AND remaining_balance > 0) AS total_unpaid,
  (SELECT COUNT(*) FROM reminders WHERE status = 'pending' AND scheduled_date = CURRENT_DATE) AS reminders_today,
  (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE DATE_TRUNC('month', payment_date) = DATE_TRUNC('month', CURRENT_DATE)) AS collected_this_month;

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Update session status based on current date
CREATE OR REPLACE FUNCTION refresh_session_statuses()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  -- Mark as ending_soon (within 7 days)
  UPDATE parking_sessions
  SET status = 'ending_soon', updated_at = NOW()
  WHERE status = 'active'
    AND expected_end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days';

  -- Mark as overdue (past end date, not closed)
  UPDATE parking_sessions
  SET status = 'overdue', updated_at = NOW()
  WHERE status IN ('active', 'ending_soon')
    AND expected_end_date < CURRENT_DATE
    AND actual_exit_date IS NULL;

  -- Update parking_spots status
  UPDATE parking_spots sp
  SET status = 'occupied', updated_at = NOW()
  WHERE EXISTS (
    SELECT 1 FROM parking_sessions ps
    WHERE ps.parking_spot_id = sp.id
      AND ps.status IN ('active', 'ending_soon', 'overdue')
  );

  UPDATE parking_spots sp
  SET status = 'empty', updated_at = NOW()
  WHERE sp.status = 'occupied'
    AND NOT EXISTS (
      SELECT 1 FROM parking_sessions ps
      WHERE ps.parking_spot_id = sp.id
        AND ps.status IN ('active', 'ending_soon', 'overdue')
    );
END;
$$;

-- Generate reminders for a session
CREATE OR REPLACE FUNCTION generate_reminders_for_session(p_session_id UUID)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_session parking_sessions%ROWTYPE;
  v_rule reminder_rules%ROWTYPE;
  v_owner owners%ROWTYPE;
  v_staff_emails TEXT[];
  v_scheduled_date DATE;
BEGIN
  SELECT * INTO v_session FROM parking_sessions WHERE id = p_session_id;

  -- Get primary owner
  SELECT o.* INTO v_owner
  FROM owners o
  JOIN boat_owners bo ON bo.owner_id = o.id
  WHERE bo.boat_id = v_session.boat_id AND bo.is_primary = TRUE
  LIMIT 1;

  -- Get staff emails
  SELECT ARRAY_AGG(email) INTO v_staff_emails
  FROM users WHERE is_active = TRUE;

  -- Delete existing pending reminders for this session (will regenerate)
  DELETE FROM reminders
  WHERE session_id = p_session_id AND status = 'pending';

  -- Create reminders for each rule
  FOR v_rule IN SELECT * FROM reminder_rules WHERE is_active = TRUE AND days_before_end >= 0 LOOP
    v_scheduled_date := v_session.expected_end_date - v_rule.days_before_end;

    -- Only create future reminders
    IF v_scheduled_date >= CURRENT_DATE THEN
      -- Customer reminder
      IF v_rule.recipient_type IN ('customer', 'both') AND v_owner.email IS NOT NULL THEN
        INSERT INTO reminders (session_id, rule_id, reminder_type, recipient_type, recipient_email, scheduled_date)
        VALUES (p_session_id, v_rule.id, v_rule.template_key, 'customer', v_owner.email, v_scheduled_date)
        ON CONFLICT DO NOTHING;
      END IF;

      -- Staff reminder (simplified: insert one per rule, email list handled at send time)
      IF v_rule.recipient_type IN ('staff', 'both') THEN
        INSERT INTO reminders (session_id, rule_id, reminder_type, recipient_type, recipient_email, scheduled_date)
        VALUES (p_session_id, v_rule.id, v_rule.template_key, 'staff', 'staff-group', v_scheduled_date)
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
  END LOOP;
END;
$$;
