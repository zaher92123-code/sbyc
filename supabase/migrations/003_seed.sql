-- =============================================================================
-- Migration 003: Seed Data — Al Seeb Bay, Muscat, Oman
-- =============================================================================

-- Al Seeb Bay approximate center: 23.6886° N, 58.1897° E

-- =============================================================================
-- PARKING SPOTS (25 spots across 3 piers)
-- =============================================================================
INSERT INTO parking_spots (spot_number, pier_section, max_length_meters, status, coordinates) VALUES
-- Pier A (spots 1-8, northern pier)
('A-01', 'Pier A', 12.0, 'occupied',  '{"type":"Point","coordinates":[58.1880,23.6895]}'),
('A-02', 'Pier A', 12.0, 'occupied',  '{"type":"Point","coordinates":[58.1882,23.6895]}'),
('A-03', 'Pier A', 15.0, 'occupied',  '{"type":"Point","coordinates":[58.1884,23.6895]}'),
('A-04', 'Pier A', 15.0, 'empty',     '{"type":"Point","coordinates":[58.1886,23.6895]}'),
('A-05', 'Pier A', 18.0, 'occupied',  '{"type":"Point","coordinates":[58.1888,23.6895]}'),
('A-06', 'Pier A', 18.0, 'empty',     '{"type":"Point","coordinates":[58.1890,23.6895]}'),
('A-07', 'Pier A', 20.0, 'occupied',  '{"type":"Point","coordinates":[58.1892,23.6895]}'),
('A-08', 'Pier A', 20.0, 'maintenance','{"type":"Point","coordinates":[58.1894,23.6895]}'),
-- Pier B (spots 1-9, central pier)
('B-01', 'Pier B', 12.0, 'occupied',  '{"type":"Point","coordinates":[58.1880,23.6890]}'),
('B-02', 'Pier B', 12.0, 'occupied',  '{"type":"Point","coordinates":[58.1882,23.6890]}'),
('B-03', 'Pier B', 15.0, 'empty',     '{"type":"Point","coordinates":[58.1884,23.6890]}'),
('B-04', 'Pier B', 15.0, 'occupied',  '{"type":"Point","coordinates":[58.1886,23.6890]}'),
('B-05', 'Pier B', 18.0, 'occupied',  '{"type":"Point","coordinates":[58.1888,23.6890]}'),
('B-06', 'Pier B', 18.0, 'occupied',  '{"type":"Point","coordinates":[58.1890,23.6890]}'),
('B-07', 'Pier B', 20.0, 'empty',     '{"type":"Point","coordinates":[58.1892,23.6890]}'),
('B-08', 'Pier B', 25.0, 'occupied',  '{"type":"Point","coordinates":[58.1894,23.6890]}'),
('B-09', 'Pier B', 25.0, 'empty',     '{"type":"Point","coordinates":[58.1896,23.6890]}'),
-- Pier C (spots 1-8, southern pier)
('C-01', 'Pier C', 10.0, 'occupied',  '{"type":"Point","coordinates":[58.1880,23.6885]}'),
('C-02', 'Pier C', 10.0, 'empty',     '{"type":"Point","coordinates":[58.1882,23.6885]}'),
('C-03', 'Pier C', 12.0, 'occupied',  '{"type":"Point","coordinates":[58.1884,23.6885]}'),
('C-04', 'Pier C', 12.0, 'occupied',  '{"type":"Point","coordinates":[58.1886,23.6885]}'),
('C-05', 'Pier C', 15.0, 'empty',     '{"type":"Point","coordinates":[58.1888,23.6885]}'),
('C-06', 'Pier C', 15.0, 'occupied',  '{"type":"Point","coordinates":[58.1890,23.6885]}'),
('C-07', 'Pier C', 18.0, 'occupied',  '{"type":"Point","coordinates":[58.1892,23.6885]}'),
('C-08', 'Pier C', 20.0, 'empty',     '{"type":"Point","coordinates":[58.1894,23.6885]}');

-- =============================================================================
-- OWNERS (12 owners)
-- =============================================================================
INSERT INTO owners (full_name, phone, email, alternate_contact, billing_notes) VALUES
('Mohammed Al Balushi',  '+968 9101 2345', 'mbalushi@gmail.com',       '+968 2245 6789', 'Prefers invoice by email. Regular customer since 2021.'),
('Khalid Al Rawahi',     '+968 9202 3456', 'k.rawahi@hotmail.com',     '+968 2246 7890', 'Monthly payment arrangement. VIP client.'),
('Fatima Al Mujaini',    '+968 9303 4567', 'fatima.mujaini@yahoo.com', '+968 2247 8901', 'Pays quarterly in advance. No outstanding balance.'),
('Ahmed Al Habsi',       '+968 9404 5678', 'ahabsi@outlook.com',       '+968 2248 9012', 'Extended credit terms approved by admin.'),
('Salim Al Kindi',       '+968 9505 6789', 'salim.kindi@gmail.com',    '+968 2249 0123', 'Multiple boats. Consolidated billing preferred.'),
('Nasser Al Farsi',      '+968 9606 7890', 'nfarsi@gmail.com',         '+968 2240 1234', 'Overdue - second notice sent. Follow up required.'),
('Hanan Al Siyabi',      '+968 9707 8901', 'hanan.siyabi@gmail.com',   '+968 2241 2345', 'New customer. First boat registered March 2024.'),
('Ibrahim Al Maamari',   '+968 9808 9012', 'ibrahim.mm@outlook.com',   '+968 2242 3456', 'Corporate account - Al Maamari Trading LLC.'),
('Yusuf Al Busaidi',     '+968 9909 0123', 'ybusaidi@hotmail.com',     '+968 2243 4567', NULL),
('Aisha Al Rashdi',      '+968 9010 1234', 'aisha.rashdi@gmail.com',   '+968 2244 5678', 'Seasonal parking - Oct to Apr only.'),
('Hamood Al Ghafri',     '+968 9111 2345', 'hamood.ghafri@gmail.com',  '+968 2245 6780', 'Boat in maintenance - session paused.'),
('Zainab Al Harthi',     '+968 9212 3456', 'zainab.harthi@yahoo.com',  '+968 2246 7891', 'New account. Paid 6 months upfront.');

-- =============================================================================
-- BOATS (12 boats)
-- =============================================================================
INSERT INTO boats (name, registration_number, type, color, length_meters, status, notes) VALUES
('Al Nokhada',     'OM-MSC-2019-001', 'Dhow',          'White/Blue',   14.5, 'parked',    'Traditional wooden dhow. Well maintained.'),
('Sea Falcon',     'OM-MSC-2020-042', 'Motorboat',     'White',        9.2,  'parked',    'Twin engine. Owner prefers weekend mooring.'),
('Muscat Pearl',   'OM-MSC-2018-117', 'Luxury Yacht',  'White/Gold',   24.8, 'parked',    'Corporate charter vessel. Annual contract.'),
('Desert Wind',    'OM-MSC-2021-033', 'Sailing Yacht', 'Blue/White',   12.0, 'parked',    'Racing sailboat. Seasonal.'),
('Gulf Star',      'OM-MSC-2022-055', 'Motorboat',     'Red/White',    8.5,  'parked',    'New registration 2022.'),
('Al Wajha',       'OM-MSC-2017-089', 'Fishing Boat',  'Blue',         11.0, 'parked',    'Commercial fishing. Multi-owner.'),
('Sunrise II',     'OM-MSC-2023-012', 'Speed Boat',    'Orange',       7.0,  'parked',    'Private use only. Owner: Hanan Al Siyabi.'),
('Blue Horizon',   'OM-MSC-2019-204', 'Luxury Yacht',  'Navy Blue',    18.5, 'parked',    'Corporate events vessel. Ibrahim Al Maamari.'),
('Al Baraka',      'OM-MSC-2016-076', 'Dhow',          'Brown/White',  16.0, 'parked',    'Oldest vessel in registry. Needs regular inspection.'),
('Oman Pride',     'OM-MSC-2022-091', 'Motorboat',     'Green/White',  10.5, 'parked',    NULL),
('Silver Mast',    'OM-MSC-2020-158', 'Sailing Yacht', 'Silver',       13.5, 'maintenance','Mast repair in progress. ETA 2 weeks.'),
('Bahr Al Noor',   'OM-MSC-2023-067', 'Motorboat',     'White',        8.0,  'parked',    'Brand new registration. Paid 6 months upfront.');

-- =============================================================================
-- BOAT-OWNER LINKS
-- =============================================================================
-- Match boats to owners (using a WITH clause for readability)
INSERT INTO boat_owners (boat_id, owner_id, is_primary, since_date)
SELECT b.id, o.id, TRUE, '2021-01-15'::date
FROM boats b, owners o WHERE b.name = 'Al Nokhada' AND o.full_name = 'Mohammed Al Balushi';

INSERT INTO boat_owners (boat_id, owner_id, is_primary, since_date)
SELECT b.id, o.id, TRUE, '2020-06-01'::date
FROM boats b, owners o WHERE b.name = 'Sea Falcon' AND o.full_name = 'Khalid Al Rawahi';

INSERT INTO boat_owners (boat_id, owner_id, is_primary, since_date)
SELECT b.id, o.id, TRUE, '2018-03-10'::date
FROM boats b, owners o WHERE b.name = 'Muscat Pearl' AND o.full_name = 'Fatima Al Mujaini';

INSERT INTO boat_owners (boat_id, owner_id, is_primary, since_date)
SELECT b.id, o.id, TRUE, '2021-11-20'::date
FROM boats b, owners o WHERE b.name = 'Desert Wind' AND o.full_name = 'Ahmed Al Habsi';

INSERT INTO boat_owners (boat_id, owner_id, is_primary, since_date)
SELECT b.id, o.id, TRUE, '2022-04-05'::date
FROM boats b, owners o WHERE b.name = 'Gulf Star' AND o.full_name = 'Salim Al Kindi';

INSERT INTO boat_owners (boat_id, owner_id, is_primary, since_date)
SELECT b.id, o.id, TRUE, '2017-08-15'::date
FROM boats b, owners o WHERE b.name = 'Al Wajha' AND o.full_name = 'Nasser Al Farsi';

INSERT INTO boat_owners (boat_id, owner_id, is_primary, since_date)
SELECT b.id, o.id, TRUE, '2023-03-01'::date
FROM boats b, owners o WHERE b.name = 'Sunrise II' AND o.full_name = 'Hanan Al Siyabi';

INSERT INTO boat_owners (boat_id, owner_id, is_primary, since_date)
SELECT b.id, o.id, TRUE, '2019-09-12'::date
FROM boats b, owners o WHERE b.name = 'Blue Horizon' AND o.full_name = 'Ibrahim Al Maamari';

INSERT INTO boat_owners (boat_id, owner_id, is_primary, since_date)
SELECT b.id, o.id, TRUE, '2016-05-22'::date
FROM boats b, owners o WHERE b.name = 'Al Baraka' AND o.full_name = 'Yusuf Al Busaidi';

INSERT INTO boat_owners (boat_id, owner_id, is_primary, since_date)
SELECT b.id, o.id, TRUE, '2022-10-01'::date
FROM boats b, owners o WHERE b.name = 'Oman Pride' AND o.full_name = 'Aisha Al Rashdi';

INSERT INTO boat_owners (boat_id, owner_id, is_primary, since_date)
SELECT b.id, o.id, TRUE, '2020-07-18'::date
FROM boats b, owners o WHERE b.name = 'Silver Mast' AND o.full_name = 'Hamood Al Ghafri';

INSERT INTO boat_owners (boat_id, owner_id, is_primary, since_date)
SELECT b.id, o.id, TRUE, '2023-10-01'::date
FROM boats b, owners o WHERE b.name = 'Bahr Al Noor' AND o.full_name = 'Zainab Al Harthi';

-- Additional co-owner for Al Wajha
INSERT INTO boat_owners (boat_id, owner_id, is_primary, since_date)
SELECT b.id, o.id, FALSE, '2020-01-01'::date
FROM boats b, owners o WHERE b.name = 'Al Wajha' AND o.full_name = 'Salim Al Kindi';

-- =============================================================================
-- PARKING SESSIONS
-- =============================================================================
-- Using DO block for cleaner date arithmetic
DO $$
DECLARE
  v_now DATE := CURRENT_DATE;
BEGIN

-- Active sessions (various pricing models)
INSERT INTO parking_sessions (boat_id, parking_spot_id, start_date, expected_end_date, status, pricing_model, base_fee, total_due, total_paid)
SELECT
  b.id,
  sp.id,
  v_now - 45,
  v_now + 30,
  'active',
  'monthly',
  150.000,
  150.000,
  150.000
FROM boats b, parking_spots sp
WHERE b.name = 'Al Nokhada' AND sp.spot_number = 'A-01';

INSERT INTO parking_sessions (boat_id, parking_spot_id, start_date, expected_end_date, status, pricing_model, base_fee, total_due, total_paid)
SELECT b.id, sp.id, v_now - 60, v_now + 60, 'active', 'monthly', 120.000, 240.000, 120.000
FROM boats b, parking_spots sp
WHERE b.name = 'Sea Falcon' AND sp.spot_number = 'A-02';

INSERT INTO parking_sessions (boat_id, parking_spot_id, start_date, expected_end_date, status, pricing_model, base_fee, total_due, total_paid)
SELECT b.id, sp.id, v_now - 90, v_now + 90, 'active', 'monthly', 350.000, 1050.000, 1050.000
FROM boats b, parking_spots sp
WHERE b.name = 'Muscat Pearl' AND sp.spot_number = 'A-03';

INSERT INTO parking_sessions (boat_id, parking_spot_id, start_date, expected_end_date, status, pricing_model, base_fee, total_due, total_paid)
SELECT b.id, sp.id, v_now - 30, v_now + 5, 'ending_soon', 'monthly', 180.000, 180.000, 0.000
FROM boats b, parking_spots sp
WHERE b.name = 'Desert Wind' AND sp.spot_number = 'A-05';

INSERT INTO parking_sessions (boat_id, parking_spot_id, start_date, expected_end_date, status, pricing_model, base_fee, total_due, total_paid)
SELECT b.id, sp.id, v_now - 45, v_now + 3, 'ending_soon', 'monthly', 130.000, 130.000, 65.000
FROM boats b, parking_spots sp
WHERE b.name = 'Gulf Star' AND sp.spot_number = 'A-07';

-- Overdue sessions
INSERT INTO parking_sessions (boat_id, parking_spot_id, start_date, expected_end_date, status, pricing_model, base_fee, total_due, total_paid)
SELECT b.id, sp.id, v_now - 60, v_now - 15, 'overdue', 'monthly', 140.000, 140.000, 0.000
FROM boats b, parking_spots sp
WHERE b.name = 'Al Wajha' AND sp.spot_number = 'B-01';

INSERT INTO parking_sessions (boat_id, parking_spot_id, start_date, expected_end_date, status, pricing_model, base_fee, total_due, total_paid)
SELECT b.id, sp.id, v_now - 90, v_now - 30, 'overdue', 'monthly', 120.000, 360.000, 120.000
FROM boats b, parking_spots sp
WHERE b.name = 'Sunrise II' AND sp.spot_number = 'B-02';

-- Active with full payment
INSERT INTO parking_sessions (boat_id, parking_spot_id, start_date, expected_end_date, status, pricing_model, base_fee, total_due, total_paid)
SELECT b.id, sp.id, v_now - 10, v_now + 80, 'active', 'monthly', 280.000, 840.000, 840.000
FROM boats b, parking_spots sp
WHERE b.name = 'Blue Horizon' AND sp.spot_number = 'B-04';

INSERT INTO parking_sessions (boat_id, parking_spot_id, start_date, expected_end_date, status, pricing_model, base_fee, total_due, total_paid)
SELECT b.id, sp.id, v_now - 120, v_now + 30, 'active', 'monthly', 150.000, 450.000, 300.000
FROM boats b, parking_spots sp
WHERE b.name = 'Al Baraka' AND sp.spot_number = 'B-05';

INSERT INTO parking_sessions (boat_id, parking_spot_id, start_date, expected_end_date, status, pricing_model, base_fee, total_due, total_paid)
SELECT b.id, sp.id, v_now - 60, v_now + 30, 'active', 'weekly', 40.000, 480.000, 480.000
FROM boats b, parking_spots sp
WHERE b.name = 'Oman Pride' AND sp.spot_number = 'B-06';

INSERT INTO parking_sessions (boat_id, parking_spot_id, start_date, expected_end_date, status, pricing_model, base_fee, total_due, total_paid)
SELECT b.id, sp.id, v_now - 5, v_now + 175, 'active', 'monthly', 110.000, 660.000, 660.000
FROM boats b, parking_spots sp
WHERE b.name = 'Bahr Al Noor' AND sp.spot_number = 'B-08';

INSERT INTO parking_sessions (boat_id, parking_spot_id, start_date, expected_end_date, status, pricing_model, base_fee, total_due, total_paid)
SELECT b.id, sp.id, v_now - 30, v_now + 60, 'active', 'monthly', 200.000, 600.000, 400.000
FROM boats b, parking_spots sp
WHERE b.name = 'Silver Mast' AND sp.spot_number = 'C-01';

-- Closed historical sessions
INSERT INTO parking_sessions (boat_id, parking_spot_id, start_date, expected_end_date, actual_exit_date, status, pricing_model, base_fee, total_due, total_paid)
SELECT b.id, sp.id, v_now - 180, v_now - 90, v_now - 88, 'closed', 'monthly', 150.000, 450.000, 450.000
FROM boats b, parking_spots sp
WHERE b.name = 'Al Nokhada' AND sp.spot_number = 'C-03';

INSERT INTO parking_sessions (boat_id, parking_spot_id, start_date, expected_end_date, actual_exit_date, status, pricing_model, base_fee, total_due, total_paid)
SELECT b.id, sp.id, v_now - 270, v_now - 180, v_now - 178, 'closed', 'monthly', 120.000, 360.000, 360.000
FROM boats b, parking_spots sp
WHERE b.name = 'Sea Falcon' AND sp.spot_number = 'C-04';

END $$;

-- =============================================================================
-- PAYMENTS (sample payment records)
-- =============================================================================
-- Active session for 'Sea Falcon' has partial payment - add the payment record
INSERT INTO payments (session_id, amount, payment_date, payment_method, reference_number, notes)
SELECT ps.id, 120.000, CURRENT_DATE - 30, 'Bank Transfer', 'TXN-2024-001', 'First monthly installment'
FROM parking_sessions ps
JOIN boats b ON b.id = ps.boat_id
WHERE b.name = 'Sea Falcon' AND ps.status = 'active';

-- Al Baraka partial payment
INSERT INTO payments (session_id, amount, payment_date, payment_method, reference_number)
SELECT ps.id, 150.000, CURRENT_DATE - 60, 'Cash', 'CASH-2024-001'
FROM parking_sessions ps JOIN boats b ON b.id = ps.boat_id
WHERE b.name = 'Al Baraka' AND ps.status = 'active';

INSERT INTO payments (session_id, amount, payment_date, payment_method, reference_number)
SELECT ps.id, 150.000, CURRENT_DATE - 30, 'Cash', 'CASH-2024-002'
FROM parking_sessions ps JOIN boats b ON b.id = ps.boat_id
WHERE b.name = 'Al Baraka' AND ps.status = 'active';

-- Gulf Star partial payment
INSERT INTO payments (session_id, amount, payment_date, payment_method)
SELECT ps.id, 65.000, CURRENT_DATE - 20, 'Cash'
FROM parking_sessions ps JOIN boats b ON b.id = ps.boat_id
WHERE b.name = 'Gulf Star' AND ps.status = 'ending_soon';

-- Overdue - Sunrise II partial payment
INSERT INTO payments (session_id, amount, payment_date, payment_method, notes)
SELECT ps.id, 120.000, CURRENT_DATE - 55, 'Bank Transfer', 'Partial payment only - balance outstanding'
FROM parking_sessions ps JOIN boats b ON b.id = ps.boat_id
WHERE b.name = 'Sunrise II' AND ps.status = 'overdue';

-- Blue Horizon full payment
INSERT INTO payments (session_id, amount, payment_date, payment_method, reference_number)
SELECT ps.id, 840.000, CURRENT_DATE - 9, 'Bank Transfer', 'TXN-CORP-2024-BH-001'
FROM parking_sessions ps JOIN boats b ON b.id = ps.boat_id
WHERE b.name = 'Blue Horizon' AND ps.status = 'active';

-- Muscat Pearl full payment
INSERT INTO payments (session_id, amount, payment_date, payment_method, reference_number)
SELECT ps.id, 1050.000, CURRENT_DATE - 85, 'Bank Transfer', 'TXN-CORP-2024-MP-001'
FROM parking_sessions ps JOIN boats b ON b.id = ps.boat_id
WHERE b.name = 'Muscat Pearl' AND ps.status = 'active';

-- Al Nokhada full payment
INSERT INTO payments (session_id, amount, payment_date, payment_method)
SELECT ps.id, 150.000, CURRENT_DATE - 44, 'Cash'
FROM parking_sessions ps JOIN boats b ON b.id = ps.boat_id
WHERE b.name = 'Al Nokhada' AND ps.status = 'active';

-- Oman Pride full payment
INSERT INTO payments (session_id, amount, payment_date, payment_method)
SELECT ps.id, 480.000, CURRENT_DATE - 59, 'Bank Transfer'
FROM parking_sessions ps JOIN boats b ON b.id = ps.boat_id
WHERE b.name = 'Oman Pride' AND ps.status = 'active';

-- Bahr Al Noor full payment (6 months upfront)
INSERT INTO payments (session_id, amount, payment_date, payment_method, reference_number, notes)
SELECT ps.id, 660.000, CURRENT_DATE - 4, 'Bank Transfer', 'TXN-2024-BN-001', '6 months advance payment'
FROM parking_sessions ps JOIN boats b ON b.id = ps.boat_id
WHERE b.name = 'Bahr Al Noor' AND ps.status = 'active';

-- Silver Mast partial payment
INSERT INTO payments (session_id, amount, payment_date, payment_method)
SELECT ps.id, 200.000, CURRENT_DATE - 25, 'Cash'
FROM parking_sessions ps JOIN boats b ON b.id = ps.boat_id
WHERE b.name = 'Silver Mast' AND ps.status = 'active';

INSERT INTO payments (session_id, amount, payment_date, payment_method)
SELECT ps.id, 200.000, CURRENT_DATE - 5, 'Bank Transfer'
FROM parking_sessions ps JOIN boats b ON b.id = ps.boat_id
WHERE b.name = 'Silver Mast' AND ps.status = 'active';

-- Closed session payments
INSERT INTO payments (session_id, amount, payment_date, payment_method)
SELECT ps.id, 450.000, CURRENT_DATE - 175, 'Bank Transfer'
FROM parking_sessions ps JOIN boats b ON b.id = ps.boat_id
WHERE b.name = 'Al Nokhada' AND ps.status = 'closed';

INSERT INTO payments (session_id, amount, payment_date, payment_method)
SELECT ps.id, 360.000, CURRENT_DATE - 265, 'Cash'
FROM parking_sessions ps JOIN boats b ON b.id = ps.boat_id
WHERE b.name = 'Sea Falcon' AND ps.status = 'closed';

-- =============================================================================
-- SAMPLE REMINDER LOGS
-- =============================================================================
INSERT INTO reminders (session_id, reminder_type, recipient_type, recipient_email, scheduled_date, sent_at, status)
SELECT
  ps.id,
  'reminder_30d',
  'customer',
  o.email,
  ps.expected_end_date - 30,
  NOW() - INTERVAL '1 day',
  'sent'
FROM parking_sessions ps
JOIN boats b ON b.id = ps.boat_id
JOIN boat_owners bo ON bo.boat_id = b.id AND bo.is_primary = TRUE
JOIN owners o ON o.id = bo.owner_id
WHERE b.name = 'Desert Wind' AND o.email IS NOT NULL;

INSERT INTO reminders (session_id, reminder_type, recipient_type, recipient_email, scheduled_date, sent_at, status)
SELECT
  ps.id,
  'reminder_7d',
  'customer',
  o.email,
  ps.expected_end_date - 7,
  NOW() - INTERVAL '2 hours',
  'sent'
FROM parking_sessions ps
JOIN boats b ON b.id = ps.boat_id
JOIN boat_owners bo ON bo.boat_id = b.id AND bo.is_primary = TRUE
JOIN owners o ON o.id = bo.owner_id
WHERE b.name = 'Gulf Star' AND o.email IS NOT NULL;

INSERT INTO reminders (session_id, reminder_type, recipient_type, recipient_email, scheduled_date, status)
SELECT
  ps.id,
  'reminder_overdue',
  'customer',
  o.email,
  ps.expected_end_date + 7,
  'pending'
FROM parking_sessions ps
JOIN boats b ON b.id = ps.boat_id
JOIN boat_owners bo ON bo.boat_id = b.id AND bo.is_primary = TRUE
JOIN owners o ON o.id = bo.owner_id
WHERE b.name = 'Al Wajha' AND o.email IS NOT NULL;

INSERT INTO reminders (session_id, reminder_type, recipient_type, recipient_email, scheduled_date, status, error_message)
SELECT
  ps.id,
  'reminder_overdue',
  'customer',
  o.email,
  ps.expected_end_date + 7,
  'failed',
  'SMTP connection timeout'
FROM parking_sessions ps
JOIN boats b ON b.id = ps.boat_id
JOIN boat_owners bo ON bo.boat_id = b.id AND bo.is_primary = TRUE
JOIN owners o ON o.id = bo.owner_id
WHERE b.name = 'Sunrise II' AND o.email IS NOT NULL;

-- =============================================================================
-- Refresh session statuses based on current date
-- =============================================================================
SELECT refresh_session_statuses();
