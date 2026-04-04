-- =============================================================================
-- Migration 004: Performance Indexes & updated_at Auto-Triggers
-- =============================================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply to all tables that have updated_at
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'users', 'owners', 'boats', 'parking_spots', 'parking_sessions'
  ] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_set_updated_at ON %I;
       CREATE TRIGGER trg_set_updated_at
         BEFORE UPDATE ON %I
         FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
      tbl, tbl
    );
  END LOOP;
END;
$$;

-- Additional composite indexes for common filter patterns
CREATE INDEX IF NOT EXISTS idx_sessions_status_end
  ON parking_sessions(status, expected_end_date)
  WHERE status != 'closed';

CREATE INDEX IF NOT EXISTS idx_sessions_boat_status
  ON parking_sessions(boat_id, status);

CREATE INDEX IF NOT EXISTS idx_payments_session_date
  ON payments(session_id, payment_date DESC);

CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_status
  ON reminders(scheduled_date, status)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record
  ON audit_logs(table_name, record_id);

-- GIN index for JSONB coordinates search
CREATE INDEX IF NOT EXISTS idx_spots_coordinates
  ON parking_spots USING gin(coordinates);

-- Full-text search index on owner full_name for faster ILIKE queries
-- (already covered by gin_trgm_ops in migration 001)

-- View refresh function wrapper for cron
CREATE OR REPLACE FUNCTION run_daily_maintenance()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Refresh session statuses
  PERFORM refresh_session_statuses();

  -- Log the maintenance run
  INSERT INTO audit_logs (action, description)
  VALUES ('system_maintenance', 'Daily session status refresh completed at ' || NOW()::TEXT);
END;
$$;

-- Grant execute to authenticated users for the RPC calls
GRANT EXECUTE ON FUNCTION refresh_session_statuses() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_reminders_for_session(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_staff_or_admin() TO authenticated;
