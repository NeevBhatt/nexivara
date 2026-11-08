-- Nexivara Database - Demo Data (Phase 2B)
-- Purpose: Realistic fictional demo data for testing and demonstration
-- This supplements the existing seed data (specializations and medicines)
-- Date: 2026-09-21
-- Run AFTER: 20260921000001_initial_schema.sql and 20260921000002_seed_data.sql

-- ============================================================================
-- DEMO DATA OVERVIEW
-- ============================================================================
-- This migration adds:
-- - 16 profiles (6 doctors, 9 patients, 1 admin)
-- - 6 doctors (linked to existing specializations)
-- - 9 patients
-- - 12 doctor schedules
-- - 9 appointments (various statuses)
-- - 3 prescriptions (for completed appointments)
-- - 6 prescription medicines (using existing medicines)
-- - 3 reviews (for completed appointments)
-- - 9 notifications

-- ============================================================================
-- 1. PROFILES (Base users for all roles)
-- ============================================================================
-- Ensure auth.users exist for demo profiles when running in Supabase with password 'password123'
DO $$
DECLARE
    enc_pw TEXT;
BEGIN
    BEGIN
        SELECT extensions.crypt('password123', extensions.gen_salt('bf')) INTO enc_pw;
    EXCEPTION WHEN OTHERS THEN
        BEGIN
            SELECT crypt('password123', gen_salt('bf')) INTO enc_pw;
        EXCEPTION WHEN OTHERS THEN
            enc_pw := '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1q1b8Z2qQkP5W3Y4X5Z6A7B8C9D0E1';
        END;
    END;

    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
    )
    VALUES
        ('00000000-0000-0000-0000-000000000000', 'a1111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'john.smith@example.com', enc_pw, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name": "John Smith"}', NOW(), NOW()),
        ('00000000-0000-0000-0000-000000000000', 'a2222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'maria.garcia@example.com', enc_pw, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name": "Maria Garcia"}', NOW(), NOW()),
        ('00000000-0000-0000-0000-000000000000', 'a3333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'li.wei@example.com', enc_pw, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name": "Li Wei"}', NOW(), NOW()),
        ('00000000-0000-0000-0000-000000000000', 'a4444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'sarah.jones@example.com', enc_pw, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name": "Sarah Jones"}', NOW(), NOW()),
        ('00000000-0000-0000-0000-000000000000', 'a5555555-5555-5555-5555-555555555555', 'authenticated', 'authenticated', 'david.chen@example.com', enc_pw, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name": "David Chen"}', NOW(), NOW()),
        ('00000000-0000-0000-0000-000000000000', 'a6666666-6666-6666-6666-666666666666', 'authenticated', 'authenticated', 'olga.petrov@example.com', enc_pw, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name": "Olga Petrov"}', NOW(), NOW()),
        ('00000000-0000-0000-0000-000000000000', 'a7777777-7777-7777-7777-777777777777', 'authenticated', 'authenticated', 'ahmed.hassan@example.com', enc_pw, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name": "Ahmed Hassan"}', NOW(), NOW()),
        ('00000000-0000-0000-0000-000000000000', 'a8888888-8888-8888-8888-888888888888', 'authenticated', 'authenticated', 'emily.wilson@example.com', enc_pw, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name": "Emily Wilson"}', NOW(), NOW()),
        ('00000000-0000-0000-0000-000000000000', 'a9999999-9999-9999-9999-999999999999', 'authenticated', 'authenticated', 'michael.brown@example.com', enc_pw, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name": "Michael Brown"}', NOW(), NOW()),
        ('00000000-0000-0000-0000-000000000000', 'd1111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'dr.johnson@nexivara.com', enc_pw, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name": "Dr. Robert Johnson"}', NOW(), NOW()),
        ('00000000-0000-0000-0000-000000000000', 'd2222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'dr.chen@nexivara.com', enc_pw, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name": "Dr. Lisa Chen"}', NOW(), NOW()),
        ('00000000-0000-0000-0000-000000000000', 'd3333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'dr.patel@nexivara.com', enc_pw, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name": "Dr. Sanjay Patel"}', NOW(), NOW()),
        ('00000000-0000-0000-0000-000000000000', 'd4444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'dr.williams@nexivara.com', enc_pw, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name": "Dr. Jennifer Williams"}', NOW(), NOW()),
        ('00000000-0000-0000-0000-000000000000', 'd5555555-5555-5555-5555-555555555555', 'authenticated', 'authenticated', 'dr.kim@nexivara.com', enc_pw, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name": "Dr. Min-ji Kim"}', NOW(), NOW()),
        ('00000000-0000-0000-0000-000000000000', 'd6666666-6666-6666-6666-666666666666', 'authenticated', 'authenticated', 'dr.rodriguez@nexivara.com', enc_pw, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name": "Dr. Carlos Rodriguez"}', NOW(), NOW()),
        ('00000000-0000-0000-0000-000000000000', 'admin001-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@nexivara.com', enc_pw, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name": "System Administrator"}', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password, email_confirmed_at = EXCLUDED.email_confirmed_at;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

INSERT INTO profiles (id, email, full_name, phone, role) VALUES
-- Patients (9 fictional patients)
('a1111111-1111-1111-1111-111111111111', 'john.smith@example.com', 'John Smith', '+1-555-0101', 'patient'),
('a2222222-2222-2222-2222-222222222222', 'maria.garcia@example.com', 'Maria Garcia', '+1-555-0102', 'patient'),
('a3333333-3333-3333-3333-333333333333', 'li.wei@example.com', 'Li Wei', '+1-555-0103', 'patient'),
('a4444444-4444-4444-4444-444444444444', 'sarah.jones@example.com', 'Sarah Jones', '+1-555-0104', 'patient'),
('a5555555-5555-5555-5555-555555555555', 'david.chen@example.com', 'David Chen', '+1-555-0105', 'patient'),
('a6666666-6666-6666-6666-666666666666', 'olga.petrov@example.com', 'Olga Petrov', '+1-555-0106', 'patient'),
('a7777777-7777-7777-7777-777777777777', 'ahmed.hassan@example.com', 'Ahmed Hassan', '+1-555-0107', 'patient'),
('a8888888-8888-8888-8888-888888888888', 'emily.wilson@example.com', 'Emily Wilson', '+1-555-0108', 'patient'),
('a9999999-9999-9999-9999-999999999999', 'michael.brown@example.com', 'Michael Brown', '+1-555-0109', 'patient'),

-- Doctors (6 fictional doctors)
('d1111111-1111-1111-1111-111111111111', 'dr.johnson@nexivara.com', 'Dr. Robert Johnson', '+1-555-0201', 'doctor'),
('d2222222-2222-2222-2222-222222222222', 'dr.chen@nexivara.com', 'Dr. Lisa Chen', '+1-555-0202', 'doctor'),
('d3333333-3333-3333-3333-333333333333', 'dr.patel@nexivara.com', 'Dr. Sanjay Patel', '+1-555-0203', 'doctor'),
('d4444444-4444-4444-4444-444444444444', 'dr.williams@nexivara.com', 'Dr. Jennifer Williams', '+1-555-0204', 'doctor'),
('d5555555-5555-5555-5555-555555555555', 'dr.kim@nexivara.com', 'Dr. Min-ji Kim', '+1-555-0205', 'doctor'),
('d6666666-6666-6666-6666-666666666666', 'dr.rodriguez@nexivara.com', 'Dr. Carlos Rodriguez', '+1-555-0206', 'doctor'),

-- Admin (1 admin user)
('admin001-0000-0000-0000-000000000000', 'admin@nexivara.com', 'System Administrator', '+1-555-0000', 'admin');

-- ============================================================================
-- 2. PATIENTS (Patient-specific information)
-- ============================================================================
INSERT INTO patients (id, profile_id, date_of_birth, gender, address) VALUES
('p1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', '1985-03-15', 'male', '123 Main Street, Springfield, IL 62701'),
('p2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', '1992-07-22', 'female', '456 Oak Avenue, Rivertown, CA 94102'),
('p3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', '1978-11-05', 'male', '789 Pine Road, Lakeside, NY 10001'),
('p4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', '2000-01-30', 'female', '101 Maple Lane, Hilltop, TX 75001'),
('p5555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', '1995-09-18', 'male', '202 Cedar Street, Valleyview, WA 98001'),
('p6666666-6666-6666-6666-666666666666', 'a6666666-6666-6666-6666-666666666666', '1988-12-25', 'female', '303 Elm Court, Mountainville, CO 80201'),
('p7777777-7777-7777-7777-777777777777', 'a7777777-7777-7777-7777-777777777777', '1999-04-12', 'male', '404 Birch Boulevard, Seaside, FL 33101'),
('p8888888-8888-8888-8888-888888888888', 'a8888888-8888-8888-8888-888888888888', '1975-06-08', 'female', '505 Redwood Drive, Sunset City, OR 97001'),
('p9999999-9999-9999-9999-999999999999', 'a9999999-9999-9999-9999-999999999999', '1993-02-28', 'male', '606 Sequoia Street, Sunrise Town, AZ 85001');

-- ============================================================================
-- 3. DOCTORS (Doctor-specific information linked to existing specializations)
-- ============================================================================

-- Get specialization IDs and insert doctors
-- Doctor 1: Cardiologist
INSERT INTO doctors (id, profile_id, specialization_id, qualification, experience, consultation_fee, biography, is_verified)
SELECT
    'd1111111-1111-1111-1111-111111111111',
    'd1111111-1111-1111-1111-111111111111',
    id,
    'MD, PhD Cardiology',
    15,
    800.00,
    'Board-certified cardiologist with 15 years of experience. Specializes in preventive cardiology and heart disease management. Published researcher with focus on cardiovascular health.',
    TRUE
FROM specializations WHERE name = 'Cardiology' LIMIT 1;

-- Doctor 2: Dermatologist
INSERT INTO doctors (id, profile_id, specialization_id, qualification, experience, consultation_fee, biography, is_verified)
SELECT
    'd2222222-2222-2222-2222-222222222222',
    'd2222222-2222-2222-2222-222222222222',
    id,
    'MD, Board Certified Dermatology',
    10,
    600.00,
    'Expert in cosmetic and medical dermatology. Specializes in acne treatment, skin cancer screening, and anti-aging procedures. Patient-focused approach.',
    TRUE
FROM specializations WHERE name = 'Dermatology' LIMIT 1;

-- Doctor 3: General Medicine
INSERT INTO doctors (id, profile_id, specialization_id, qualification, experience, consultation_fee, biography, is_verified)
SELECT
    'd3333333-3333-3333-3333-333333333333',
    'd3333333-3333-3333-3333-333333333333',
    id,
    'MBBS, MD Family Medicine',
    12,
    400.00,
    'Family medicine specialist with holistic approach to healthcare. Experienced in preventive care, chronic disease management, and wellness counseling.',
    TRUE
FROM specializations WHERE name = 'General Medicine' LIMIT 1;

-- Doctor 4: Pediatrician
INSERT INTO doctors (id, profile_id, specialization_id, qualification, experience, consultation_fee, biography, is_verified)
SELECT
    'd4444444-4444-4444-4444-444444444444',
    'd4444444-4444-4444-4444-444444444444',
    id,
    'MD, DCH Pediatrics',
    8,
    500.00,
    'Pediatric specialist with gentle, child-friendly approach. Focus on child development, vaccination programs, and adolescent health. Creates comfortable environment for young patients.',
    TRUE
FROM specializations WHERE name = 'Pediatrics' LIMIT 1;

-- Doctor 5: Psychiatrist
INSERT INTO doctors (id, profile_id, specialization_id, qualification, experience, consultation_fee, biography, is_verified)
SELECT
    'd5555555-5555-5555-5555-555555555555',
    'd5555555-5555-5555-5555-555555555555',
    id,
    'MD, Psychiatry, CBT Certified',
    14,
    750.00,
    'Mental health specialist treating anxiety, depression, and stress disorders. Certified in cognitive behavioral therapy and mindfulness-based approaches.',
    TRUE
FROM specializations WHERE name = 'Psychiatry' LIMIT 1;

-- Doctor 6: Orthopedic Surgeon
INSERT INTO doctors (id, profile_id, specialization_id, qualification, experience, consultation_fee, biography, is_verified)
SELECT
    'd6666666-6666-6666-6666-666666666666',
    'd6666666-6666-6666-6666-666666666666',
    id,
    'MD, MS Orthopedic Surgery',
    18,
    900.00,
    'Orthopedic surgeon specializing in joint replacements, sports injuries, and trauma care. Over 500 successful surgeries with excellent patient outcomes.',
    TRUE
FROM specializations WHERE name = 'Orthopedics' LIMIT 1;

-- ============================================================================
-- 4. DOCTOR SCHEDULES (Availability schedules)
-- ============================================================================

-- Doctor 1 (Cardiologist): Monday, Wednesday, Friday mornings
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, is_available) VALUES
('d1111111-1111-1111-1111-111111111111', 1, '09:00:00', '12:00:00', TRUE), -- Monday morning
('d1111111-1111-1111-1111-111111111111', 1, '14:00:00', '17:00:00', TRUE), -- Monday afternoon
('d1111111-1111-1111-1111-111111111111', 3, '10:00:00', '13:00:00', TRUE), -- Wednesday
('d1111111-1111-1111-1111-111111111111', 5, '08:00:00', '12:00:00', TRUE); -- Friday morning

-- Doctor 2 (Dermatologist): Tuesday, Thursday
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, is_available) VALUES
('d2222222-2222-2222-2222-222222222222', 2, '09:00:00', '13:00:00', TRUE), -- Tuesday
('d2222222-2222-2222-2222-222222222222', 2, '14:00:00', '18:00:00', TRUE), -- Tuesday afternoon
('d2222222-2222-2222-2222-222222222222', 4, '10:00:00', '14:00:00', TRUE); -- Thursday

-- Doctor 3 (General Medicine): Monday-Friday (busy schedule)
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, is_available) VALUES
('d3333333-3333-3333-3333-333333333333', 1, '08:00:00', '16:00:00', TRUE), -- Monday
('d3333333-3333-3333-3333-333333333333', 2, '08:00:00', '16:00:00', TRUE), -- Tuesday
('d3333333-3333-3333-3333-333333333333', 3, '08:00:00', '16:00:00', TRUE), -- Wednesday
('d3333333-3333-3333-3333-333333333333', 4, '08:00:00', '16:00:00', TRUE), -- Thursday
('d3333333-3333-3333-3333-333333333333', 5, '08:00:00', '12:00:00', TRUE); -- Friday morning

-- ============================================================================
-- 5. APPOINTMENTS (Sample appointments with different statuses)
-- ============================================================================

-- Appointment 1: COMPLETED - John with Dr. Johnson (Cardiologist)
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, reason, notes) VALUES
('apt11111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', '2026-09-15', '10:00:00', 'completed', 'Annual cardiac checkup', 'Patient vitals normal. ECG performed.');

-- Appointment 2: CONFIRMED - Maria with Dr. Chen (Dermatologist)
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, reason) VALUES
('apt22222-2222-2222-2222-222222222222', 'p2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', '2026-09-24', '11:00:00', 'confirmed', 'Skin rash evaluation');

-- Appointment 3: PENDING - Li Wei with Dr. Patel (General Medicine)
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, reason) VALUES
('apt33333-3333-3333-3333-333333333333', 'p3333333-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', '2026-09-25', '09:00:00', 'pending', 'General health consultation');

-- Appointment 4: CANCELLED - Sarah with Dr. Williams (Pediatrics)
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, reason, notes) VALUES
('apt44444-4444-4444-4444-444444444444', 'p4444444-4444-4444-4444-444444444444', 'd4444444-4444-4444-4444-444444444444', '2026-09-20', '14:00:00', 'cancelled', 'Child vaccination', 'Cancelled by patient - child has fever');

-- Appointment 5: COMPLETED - David with Dr. Kim (Psychiatrist)
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, reason) VALUES
('apt55555-5555-5555-5555-555555555555', 'p5555555-5555-5555-5555-555555555555', 'd5555555-5555-5555-5555-555555555555', '2026-09-18', '15:00:00', 'completed', 'Anxiety management consultation');

-- Appointment 6: CONFIRMED - Olga with Dr. Rodriguez (Orthopedics)
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, reason) VALUES
('apt66666-6666-6666-6666-666666666666', 'p6666666-6666-6666-6666-666666666666', 'd6666666-6666-6666-6666-666666666666', '2026-09-26', '10:30:00', 'confirmed', 'Knee pain consultation');

-- Appointment 7: PENDING - Ahmed with Dr. Johnson (Cardiologist)
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, reason) VALUES
('apt77777-7777-7777-7777-777777777777', 'p7777777-7777-7777-7777-777777777777', 'd1111111-1111-1111-1111-111111111111', '2026-09-27', '11:30:00', 'pending', 'High blood pressure follow-up');

-- Appointment 8: COMPLETED - Emily with Dr. Chen (Dermatologist)
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, reason) VALUES
('apt88888-8888-8888-8888-888888888888', 'p8888888-8888-8888-8888-888888888888', 'd2222222-2222-2222-2222-222222222222', '2026-09-17', '14:30:00', 'completed', 'Acne treatment follow-up');

-- Appointment 9: REJECTED - Michael with Dr. Patel (General Medicine)
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, reason, notes) VALUES
('apt99999-9999-9999-9999-999999999999', 'p9999999-9999-9999-9999-999999999999', 'd3333333-3333-3333-3333-333333333333', '2026-09-21', '10:00:00', 'rejected', 'Emergency consultation', 'Doctor unavailable. Please reschedule for next week.');

-- ============================================================================
-- 6. PRESCRIPTIONS (For completed appointments only)
-- ============================================================================

-- Prescription 1: For John's cardiac checkup (completed appointment)
INSERT INTO prescriptions (id, appointment_id, doctor_id, patient_id, diagnosis, notes) VALUES
('prx11111-1111-1111-1111-111111111111', 'apt11111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111',
'Mild hypertension, pre-diabetic condition',
'Patient advised to reduce salt intake, increase physical activity, and monitor blood pressure weekly. Follow-up in 3 months.');

-- Prescription 2: For David's anxiety consultation (completed appointment)
INSERT INTO prescriptions (id, appointment_id, doctor_id, patient_id, diagnosis, notes) VALUES
('prx22222-2222-2222-2222-222222222222', 'apt55555-5555-5555-5555-555555555555', 'd5555555-5555-5555-5555-555555555555', 'p5555555-5555-5555-5555-555555555555',
'Generalized anxiety disorder, mild depression',
'Patient responding well to CBT therapy. Continue mindfulness exercises daily. Schedule weekly sessions for next month.');

-- Prescription 3: For Emily's acne treatment (completed appointment)
INSERT INTO prescriptions (id, appointment_id, doctor_id, patient_id, diagnosis, notes) VALUES
('prx33333-3333-3333-3333-333333333333', 'apt88888-8888-8888-8888-888888888888', 'd2222222-2222-2222-2222-222222222222', 'p8888888-8888-8888-8888-888888888888',
'Acne vulgaris - moderate severity',
'Improvement noted from previous visit. Continue topical treatment and maintain strict skincare routine. Avoid oil-based cosmetics.');

-- ============================================================================
-- 7. PRESCRIPTION MEDICINES (Using existing medicines from seed data)
-- ============================================================================

-- For Prescription 1 (Hypertension and pre-diabetes)
INSERT INTO prescription_medicines (prescription_id, medicine_id, dosage, frequency, duration, instructions)
SELECT
    'prx11111-1111-1111-1111-111111111111',
    id,
    '5mg',
    'Once daily',
    '30 days',
    'Take in the morning with water. Monitor blood pressure weekly.'
FROM medicines WHERE name = 'Amlodipine 5mg' LIMIT 1;

INSERT INTO prescription_medicines (prescription_id, medicine_id, dosage, frequency, duration, instructions)
SELECT
    'prx11111-1111-1111-1111-111111111111',
    id,
    '500mg',
    'Twice daily',
    '30 days',
    'Take with meals to reduce stomach upset. Monitor blood sugar levels.'
FROM medicines WHERE name = 'Metformin 500mg' LIMIT 1;

-- For Prescription 2 (Anxiety - supportive medications)
INSERT INTO prescription_medicines (prescription_id, medicine_id, dosage, frequency, duration, instructions)
SELECT
    'prx22222-2222-2222-2222-222222222222',
    id,
    '20mg',
    'Once daily before breakfast',
    '14 days',
    'Take on empty stomach. May help with stress-related stomach issues.'
FROM medicines WHERE name = 'Omeprazole 20mg' LIMIT 1;

INSERT INTO prescription_medicines (prescription_id, medicine_id, dosage, frequency, duration, instructions)
SELECT
    'prx22222-2222-2222-2222-222222222222',
    id,
    '1000 IU',
    'Once daily',
    '60 days',
    'Take with food for better absorption. Helps with mood regulation.'
FROM medicines WHERE name = 'Vitamin D3 1000IU' LIMIT 1;

-- For Prescription 3 (Acne treatment)
INSERT INTO prescription_medicines (prescription_id, medicine_id, dosage, frequency, duration, instructions)
SELECT
    'prx33333-3333-3333-3333-333333333333',
    id,
    '500mg',
    'Twice daily',
    '14 days',
    'Take with plenty of water. Complete full course even if symptoms improve.'
FROM medicines WHERE name = 'Amoxicillin 500mg' LIMIT 1;

INSERT INTO prescription_medicines (prescription_id, medicine_id, dosage, frequency, duration, instructions)
SELECT
    'prx33333-3333-3333-3333-333333333333',
    id,
    '400mg',
    'As needed (max 3 times daily)',
    '14 days',
    'Take with food if inflammation occurs. Do not exceed 1200mg per day.'
FROM medicines WHERE name = 'Ibuprofen 400mg' LIMIT 1;

-- ============================================================================
-- 8. REVIEWS (Patient reviews for doctors - only for completed appointments)
-- ============================================================================

-- Review 1: John reviews Dr. Johnson (Cardiologist)
INSERT INTO reviews (appointment_id, doctor_id, patient_id, rating, comment) VALUES
('apt11111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111',
5,
'Dr. Johnson was excellent! Very thorough examination and took time to explain everything clearly. Highly recommend for cardiac care.');

-- Review 2: David reviews Dr. Kim (Psychiatrist)
INSERT INTO reviews (appointment_id, doctor_id, patient_id, rating, comment) VALUES
('apt55555-5555-5555-5555-555555555555', 'd5555555-5555-5555-5555-555555555555', 'p5555555-5555-5555-5555-555555555555',
4,
'Very empathetic and understanding. The breathing exercises and mindfulness techniques have been really helpful. Feeling much better.');

-- Review 3: Emily reviews Dr. Chen (Dermatologist)
INSERT INTO reviews (appointment_id, doctor_id, patient_id, rating, comment) VALUES
('apt88888-8888-8888-8888-888888888888', 'd2222222-2222-2222-2222-222222222222', 'p8888888-8888-8888-8888-888888888888',
5,
'Dr. Chen is amazing! My acne has improved significantly. She explained the treatment plan clearly and was very professional.');

-- ============================================================================
-- 9. NOTIFICATIONS (Sample notifications for users)
-- ============================================================================

-- Notifications for patients
INSERT INTO notifications (profile_id, title, message, type, is_read, related_id) VALUES
('a1111111-1111-1111-1111-111111111111', 'Appointment Completed', 'Your appointment with Dr. Johnson on September 15, 2026 has been completed.', 'appointment', TRUE, 'apt11111-1111-1111-1111-111111111111'),
('a1111111-1111-1111-1111-111111111111', 'Prescription Ready', 'Your prescription from Dr. Johnson is now available for viewing.', 'prescription', FALSE, 'prx11111-1111-1111-1111-111111111111'),
('a2222222-2222-2222-2222-222222222222', 'Appointment Confirmed', 'Your appointment with Dr. Chen on September 24 at 11:00 AM has been confirmed.', 'appointment', FALSE, 'apt22222-2222-2222-2222-222222222222'),
('a3333333-3333-3333-3333-333333333333', 'Appointment Pending', 'Your appointment request with Dr. Patel is pending confirmation.', 'appointment', TRUE, 'apt33333-3333-3333-3333-333333333333'),
('a4444444-4444-4444-4444-444444444444', 'Appointment Cancelled', 'Your appointment with Dr. Williams has been cancelled as requested.', 'appointment', TRUE, 'apt44444-4444-4444-4444-444444444444'),
('a5555555-5555-5555-5555-555555555555', 'Review Submitted', 'Thank you for submitting a review for Dr. Kim!', 'review', TRUE, 'apt55555-5555-5555-5555-555555555555');

-- Notifications for doctors
INSERT INTO notifications (profile_id, title, message, type, is_read, related_id) VALUES
('d1111111-1111-1111-1111-111111111111', 'New Appointment Request', 'Ahmed Hassan has requested an appointment for September 27 at 11:30 AM.', 'appointment', FALSE, 'apt77777-7777-7777-7777-777777777777'),
('d2222222-2222-2222-2222-222222222222', 'Patient Review Received', 'Emily Wilson left a 5-star review for your service!', 'review', FALSE, 'apt88888-8888-8888-8888-888888888888'),
('d3333333-3333-3333-3333-333333333333', 'Appointment Rejected', 'Appointment with Michael Brown has been rejected due to scheduling conflict.', 'appointment', TRUE, 'apt99999-9999-9999-9999-999999999999');

-- ============================================================================
-- 10. DATA VERIFICATION & SUMMARY
-- ============================================================================

DO $$
DECLARE
    profiles_count INTEGER;
    specializations_count INTEGER;
    doctors_count INTEGER;
    patients_count INTEGER;
    schedules_count INTEGER;
    medicines_count INTEGER;
    appointments_count INTEGER;
    prescriptions_count INTEGER;
    prescription_meds_count INTEGER;
    reviews_count INTEGER;
    notifications_count INTEGER;
BEGIN
    -- Count all records
    SELECT COUNT(*) INTO profiles_count FROM profiles;
    SELECT COUNT(*) INTO specializations_count FROM specializations;
    SELECT COUNT(*) INTO doctors_count FROM doctors;
    SELECT COUNT(*) INTO patients_count FROM patients;
    SELECT COUNT(*) INTO schedules_count FROM doctor_schedules;
    SELECT COUNT(*) INTO medicines_count FROM medicines;
    SELECT COUNT(*) INTO appointments_count FROM appointments;
    SELECT COUNT(*) INTO prescriptions_count FROM prescriptions;
    SELECT COUNT(*) INTO prescription_meds_count FROM prescription_medicines;
    SELECT COUNT(*) INTO reviews_count FROM reviews;
    SELECT COUNT(*) INTO notifications_count FROM notifications;

    RAISE NOTICE '';
    RAISE NOTICE '=== PHASE 2B: DEMO DATA INSERTION COMPLETE ===';
    RAISE NOTICE '';
    RAISE NOTICE 'Total Records by Table:';
    RAISE NOTICE '  Profiles: %', profiles_count;
    RAISE NOTICE '  Specializations: %', specializations_count;
    RAISE NOTICE '  Doctors: %', doctors_count;
    RAISE NOTICE '  Patients: %', patients_count;
    RAISE NOTICE '  Doctor Schedules: %', schedules_count;
    RAISE NOTICE '  Medicines: %', medicines_count;
    RAISE NOTICE '  Appointments: %', appointments_count;
    RAISE NOTICE '  Prescriptions: %', prescriptions_count;
    RAISE NOTICE '  Prescription Medicines: %', prescription_meds_count;
    RAISE NOTICE '  Reviews: %', reviews_count;
    RAISE NOTICE '  Notifications: %', notifications_count;
    RAISE NOTICE '';
    RAISE NOTICE '=== ALL DEMO DATA LOADED SUCCESSFULLY ===';
END $$;

-- ============================================================================
-- 11. RELATIONSHIP INTEGRITY CHECKS
-- ============================================================================

-- Verify all appointments have valid patient-doctor relationships
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_count
    FROM appointments a
    WHERE NOT EXISTS (SELECT 1 FROM patients p WHERE p.id = a.patient_id)
       OR NOT EXISTS (SELECT 1 FROM doctors d WHERE d.id = a.doctor_id);

    IF invalid_count = 0 THEN
        RAISE NOTICE '✓ All appointments have valid patient-doctor relationships';
    ELSE
        RAISE EXCEPTION 'ERROR: % appointments have invalid relationships', invalid_count;
    END IF;
END $$;

-- Verify all prescriptions belong to completed appointments
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_count
    FROM prescriptions pr
    JOIN appointments a ON pr.appointment_id = a.id
    WHERE a.status != 'completed';

    IF invalid_count = 0 THEN
        RAISE NOTICE '✓ All prescriptions belong to completed appointments';
    ELSE
        RAISE EXCEPTION 'ERROR: % prescriptions for non-completed appointments', invalid_count;
    END IF;
END $$;

-- Verify all reviews belong to completed appointments
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_count
    FROM reviews r
    JOIN appointments a ON r.appointment_id = a.id
    WHERE a.status != 'completed';

    IF invalid_count = 0 THEN
        RAISE NOTICE '✓ All reviews belong to completed appointments';
    ELSE
        RAISE EXCEPTION 'ERROR: % reviews for non-completed appointments', invalid_count;
    END IF;
END $$;

-- Check appointment status distribution
DO $$
DECLARE
    pending_count INTEGER;
    confirmed_count INTEGER;
    completed_count INTEGER;
    cancelled_count INTEGER;
    rejected_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO pending_count FROM appointments WHERE status = 'pending';
    SELECT COUNT(*) INTO confirmed_count FROM appointments WHERE status = 'confirmed';
    SELECT COUNT(*) INTO completed_count FROM appointments WHERE status = 'completed';
    SELECT COUNT(*) INTO cancelled_count FROM appointments WHERE status = 'cancelled';
    SELECT COUNT(*) INTO rejected_count FROM appointments WHERE status = 'rejected';

    RAISE NOTICE '';
    RAISE NOTICE '=== APPOINTMENT STATUS DISTRIBUTION ===';
    RAISE NOTICE '  Pending: %', pending_count;
    RAISE NOTICE '  Confirmed: %', confirmed_count;
    RAISE NOTICE '  Completed: % (with prescriptions & reviews)', completed_count;
    RAISE NOTICE '  Cancelled: %', cancelled_count;
    RAISE NOTICE '  Rejected: %', rejected_count;
    RAISE NOTICE '  Total: %', pending_count + confirmed_count + completed_count + cancelled_count + rejected_count;
END $$;

-- Verify prescription medicines reference existing medicines
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_count
    FROM prescription_medicines pm
    WHERE NOT EXISTS (SELECT 1 FROM medicines m WHERE m.id = pm.medicine_id);

    IF invalid_count = 0 THEN
        RAISE NOTICE '✓ All prescription medicines reference existing medicines';
    ELSE
        RAISE EXCEPTION 'ERROR: % prescription medicines have invalid medicine references', invalid_count;
    END IF;
END $$;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE 'PHASE 2B COMPLETE - DEMO DATA SUCCESSFULLY LOADED';
END $$;
