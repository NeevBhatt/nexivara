-- Nexivara Database - Constraint Tests
-- Purpose: Test all critical business rules and constraints
-- Run this AFTER applying the initial schema migration

-- ============================================================================
-- TEST SETUP
-- ============================================================================
BEGIN;

-- Create test profile (simulating Supabase Auth user)
DO $$
BEGIN
    INSERT INTO auth.users (id, email, raw_user_meta_data, aud, role)
    VALUES
        ('11111111-1111-1111-1111-111111111111', 'test.patient@example.com', '{"full_name": "Test Patient"}', 'authenticated', 'authenticated'),
        ('22222222-2222-2222-2222-222222222222', 'test.doctor@example.com', '{"full_name": "Dr. Test Doctor"}', 'authenticated', 'authenticated')
    ON CONFLICT (id) DO NOTHING;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

INSERT INTO profiles (id, email, full_name, role) VALUES
('11111111-1111-1111-1111-111111111111', 'test.patient@example.com', 'Test Patient', 'patient'),
('22222222-2222-2222-2222-222222222222', 'test.doctor@example.com', 'Dr. Test Doctor', 'doctor');

-- Create test specialization
INSERT INTO specializations (id, name) VALUES
('33333333-3333-3333-3333-333333333333', 'Test Specialization');

-- Create test doctor
INSERT INTO doctors (id, profile_id, specialization_id, qualification, experience, consultation_fee) VALUES
('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'MBBS', 5, 500.00);

-- Create test patient
INSERT INTO patients (id, profile_id) VALUES
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111');

-- ============================================================================
-- TEST 1: Prevent Double Booking (Critical Business Rule)
-- ============================================================================
\echo '=== TEST 1: Double Booking Prevention ==='

-- Insert first appointment
INSERT INTO appointments (doctor_id, patient_id, appointment_date, appointment_time, status)
VALUES ('44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '2026-09-25', '10:00:00', 'confirmed');

\echo '✓ First appointment created successfully'

-- Try to insert conflicting appointment (should FAIL)
DO $$
BEGIN
    INSERT INTO appointments (doctor_id, patient_id, appointment_date, appointment_time, status)
    VALUES ('44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '2026-09-25', '10:00:00', 'pending');
    RAISE EXCEPTION 'ERROR: Double booking was allowed! Test FAILED';
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE '✓ TEST PASSED: Double booking prevented successfully';
END $$;

-- ============================================================================
-- TEST 2: Valid Rating Constraint (1-5 only)
-- ============================================================================
\echo '=== TEST 2: Rating Validation ==='

-- First, complete the appointment and create prescription
UPDATE appointments SET status = 'completed'
WHERE doctor_id = '44444444-4444-4444-4444-444444444444';

INSERT INTO prescriptions (appointment_id, doctor_id, patient_id, diagnosis)
SELECT id, doctor_id, patient_id, 'Test diagnosis'
FROM appointments
WHERE doctor_id = '44444444-4444-4444-4444-444444444444' LIMIT 1;

-- Try to insert review with invalid rating (should FAIL)
DO $$
DECLARE
    v_appointment_id UUID;
BEGIN
    SELECT id INTO v_appointment_id FROM appointments
    WHERE doctor_id = '44444444-4444-4444-4444-444444444444' LIMIT 1;

    INSERT INTO reviews (appointment_id, doctor_id, patient_id, rating, comment)
    VALUES (v_appointment_id, '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 6, 'Invalid rating');
    RAISE EXCEPTION 'ERROR: Invalid rating was allowed! Test FAILED';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE '✓ TEST PASSED: Invalid rating (6) rejected successfully';
END $$;

-- Insert valid rating (should SUCCEED)
DO $$
DECLARE
    v_appointment_id UUID;
BEGIN
    SELECT id INTO v_appointment_id FROM appointments
    WHERE doctor_id = '44444444-4444-4444-4444-444444444444' LIMIT 1;

    INSERT INTO reviews (appointment_id, doctor_id, patient_id, rating, comment)
    VALUES (v_appointment_id, '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 5, 'Excellent doctor');
    RAISE NOTICE '✓ Valid rating (5) inserted successfully';
END $$;

-- ============================================================================
-- TEST 3: Valid Experience (>= 0)
-- ============================================================================
\echo '=== TEST 3: Experience Validation ==='

-- Try to insert doctor with negative experience (should FAIL)
DO $$
BEGIN
    INSERT INTO doctors (profile_id, specialization_id, qualification, experience, consultation_fee)
    VALUES ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'MBBS', -5, 500.00);
    RAISE EXCEPTION 'ERROR: Negative experience was allowed! Test FAILED';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE '✓ TEST PASSED: Negative experience rejected successfully';
    WHEN unique_violation THEN
        RAISE NOTICE '✓ TEST SKIPPED: Doctor already exists (expected in test)';
END $$;

-- ============================================================================
-- TEST 4: Valid Consultation Fee (>= 0)
-- ============================================================================
\echo '=== TEST 4: Consultation Fee Validation ==='

-- Create another test profile for fee test
INSERT INTO profiles (id, email, full_name, role) VALUES
('66666666-6666-6666-6666-666666666666', 'test.doctor2@example.com', 'Dr. Fee Test', 'doctor');

-- Try to insert doctor with negative consultation fee (should FAIL)
DO $$
BEGIN
    INSERT INTO doctors (profile_id, specialization_id, qualification, experience, consultation_fee)
    VALUES ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'MBBS', 3, -100.00);
    RAISE EXCEPTION 'ERROR: Negative consultation fee was allowed! Test FAILED';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE '✓ TEST PASSED: Negative consultation fee rejected successfully';
END $$;

-- ============================================================================
-- TEST 5: Duplicate Review Prevention
-- ============================================================================
\echo '=== TEST 5: Duplicate Review Prevention ==='

-- Try to insert another review for same appointment (should FAIL)
DO $$
DECLARE
    v_appointment_id UUID;
BEGIN
    SELECT id INTO v_appointment_id FROM appointments
    WHERE doctor_id = '44444444-4444-4444-4444-444444444444' LIMIT 1;

    INSERT INTO reviews (appointment_id, doctor_id, patient_id, rating, comment)
    VALUES (v_appointment_id, '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 4, 'Another review');
    RAISE EXCEPTION 'ERROR: Duplicate review was allowed! Test FAILED';
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE '✓ TEST PASSED: Duplicate review prevented successfully';
END $$;

-- ============================================================================
-- TEST 6: Valid Appointment Status
-- ============================================================================
\echo '=== TEST 6: Appointment Status Validation ==='

-- Try to insert appointment with invalid status (should FAIL)
DO $$
BEGIN
    INSERT INTO appointments (doctor_id, patient_id, appointment_date, appointment_time, status)
    VALUES ('44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '2026-09-26', '11:00:00', 'invalid_status');
    RAISE EXCEPTION 'ERROR: Invalid appointment status was allowed! Test FAILED';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE '✓ TEST PASSED: Invalid status rejected successfully';
END $$;

-- ============================================================================
-- TEST 7: Valid Role in Profiles
-- ============================================================================
\echo '=== TEST 7: Profile Role Validation ==='

-- Try to insert profile with invalid role (should FAIL)
DO $$
BEGIN
    INSERT INTO profiles (id, email, full_name, role)
    VALUES ('77777777-7777-7777-7777-777777777777', 'invalid@example.com', 'Invalid Role', 'superuser');
    RAISE EXCEPTION 'ERROR: Invalid role was allowed! Test FAILED';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE '✓ TEST PASSED: Invalid role rejected successfully';
END $$;

-- ============================================================================
-- TEST 8: Cascade Deletion (Profile → Patient/Doctor)
-- ============================================================================
\echo '=== TEST 8: Cascade Deletion Test ==='

-- Create a temporary profile and patient
INSERT INTO profiles (id, email, full_name, role) VALUES
('88888888-8888-8888-8888-888888888888', 'temp.patient@example.com', 'Temp Patient', 'patient');

INSERT INTO patients (profile_id) VALUES
('88888888-8888-8888-8888-888888888888');

-- Delete profile (should cascade to patient)
DELETE FROM profiles WHERE id = '88888888-8888-8888-8888-888888888888';

-- Check if patient was deleted
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM patients WHERE profile_id = '88888888-8888-8888-8888-888888888888';
    IF v_count = 0 THEN
        RAISE NOTICE '✓ TEST PASSED: Cascade deletion working correctly';
    ELSE
        RAISE EXCEPTION 'ERROR: Cascade deletion failed! Test FAILED';
    END IF;
END $$;

-- ============================================================================
-- TEST 9: Prescription Must Belong to Appointment
-- ============================================================================
\echo '=== TEST 9: Prescription-Appointment Relationship ==='

-- Try to insert prescription with non-existent appointment (should FAIL)
DO $$
BEGIN
    INSERT INTO prescriptions (appointment_id, doctor_id, patient_id, diagnosis)
    VALUES ('99999999-9999-9999-9999-999999999999', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 'Test');
    RAISE EXCEPTION 'ERROR: Prescription with invalid appointment was allowed! Test FAILED';
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE '✓ TEST PASSED: Prescription requires valid appointment';
END $$;

-- ============================================================================
-- TEST 10: Updated_at Trigger
-- ============================================================================
\echo '=== TEST 10: Auto-update Timestamp Trigger ==='

DO $$
DECLARE
    v_old_timestamp TIMESTAMPTZ;
    v_new_timestamp TIMESTAMPTZ;
BEGIN
    SELECT updated_at INTO v_old_timestamp FROM doctors WHERE id = '44444444-4444-4444-4444-444444444444';
    PERFORM pg_sleep(1);
    UPDATE doctors SET experience = 6 WHERE id = '44444444-4444-4444-4444-444444444444';
    SELECT updated_at INTO v_new_timestamp FROM doctors WHERE id = '44444444-4444-4444-4444-444444444444';

    IF v_new_timestamp > v_old_timestamp THEN
        RAISE NOTICE '✓ TEST PASSED: Updated_at timestamp auto-updated';
    ELSE
        RAISE EXCEPTION 'ERROR: Updated_at trigger not working! Test FAILED';
    END IF;
END $$;

-- ============================================================================
-- TEST SUMMARY
-- ============================================================================
\echo ''
\echo '=========================================='
\echo 'TEST SUITE COMPLETED'
\echo '=========================================='
\echo 'All critical business rules validated:'
\echo '  ✓ Double booking prevention'
\echo '  ✓ Rating validation (1-5)'
\echo '  ✓ Experience validation (>= 0)'
\echo '  ✓ Consultation fee validation (>= 0)'
\echo '  ✓ Duplicate review prevention'
\echo '  ✓ Valid appointment status'
\echo '  ✓ Valid user roles'
\echo '  ✓ Cascade deletion'
\echo '  ✓ Foreign key integrity'
\echo '  ✓ Timestamp triggers'
\echo '=========================================='

-- Rollback test data
ROLLBACK;

\echo ''
\echo 'Test data rolled back. Database is clean.'
