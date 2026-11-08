-- Nexivara Database - Seed Data
-- Purpose: Sample data for testing and development
-- Note: This should be run AFTER the initial schema migration

-- ============================================================================
-- SEED: Specializations
-- ============================================================================
INSERT INTO specializations (name, description) VALUES
('General Medicine', 'General medical practice and primary care'),
('Cardiology', 'Heart and cardiovascular system specialists'),
('Dermatology', 'Skin, hair, and nail conditions'),
('Pediatrics', 'Medical care for infants, children, and adolescents'),
('Orthopedics', 'Bone, joint, and muscle disorders'),
('Neurology', 'Brain and nervous system disorders'),
('Gynecology', 'Women''s reproductive health'),
('Psychiatry', 'Mental health and behavioral disorders'),
('Ophthalmology', 'Eye and vision care'),
('ENT', 'Ear, nose, and throat specialists');

-- ============================================================================
-- SEED: Medicines
-- ============================================================================
INSERT INTO medicines (name, generic_name, type, description) VALUES
('Paracetamol 500mg', 'Paracetamol', 'Tablet', 'Pain relief and fever reducer'),
('Amoxicillin 500mg', 'Amoxicillin', 'Capsule', 'Antibiotic for bacterial infections'),
('Ibuprofen 400mg', 'Ibuprofen', 'Tablet', 'Anti-inflammatory and pain relief'),
('Cetirizine 10mg', 'Cetirizine', 'Tablet', 'Antihistamine for allergies'),
('Omeprazole 20mg', 'Omeprazole', 'Capsule', 'Reduces stomach acid'),
('Metformin 500mg', 'Metformin', 'Tablet', 'Type 2 diabetes management'),
('Amlodipine 5mg', 'Amlodipine', 'Tablet', 'Blood pressure medication'),
('Azithromycin 500mg', 'Azithromycin', 'Tablet', 'Antibiotic for respiratory infections'),
('Salbutamol Inhaler', 'Salbutamol', 'Inhaler', 'Asthma and breathing difficulties'),
('Vitamin D3 1000IU', 'Cholecalciferol', 'Capsule', 'Vitamin D supplement');

-- Note: User profiles, doctors, patients, and appointments should be created
-- through the application after authentication is set up, not via seed data.
