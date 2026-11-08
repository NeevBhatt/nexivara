-- Nexivara Database Schema
-- Migration: Initial schema with all tables, constraints, and relationships
-- Date: 2026-09-21
-- Normalized to 3NF

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: profiles
-- Purpose: Base user profile (linked to Supabase Auth)
-- Relationship: 1:1 with auth.users
-- ============================================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: specializations
-- Purpose: Medical specializations lookup table
-- Relationship: Referenced by doctors
-- ============================================================================
CREATE TABLE specializations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: doctors
-- Purpose: Doctor-specific information
-- Relationship: 1:1 with profiles (where role = 'doctor')
-- ============================================================================
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    specialization_id UUID NOT NULL REFERENCES specializations(id) ON DELETE RESTRICT,
    qualification TEXT NOT NULL,
    experience INTEGER NOT NULL CHECK (experience >= 0),
    consultation_fee DECIMAL(10, 2) NOT NULL CHECK (consultation_fee >= 0),
    biography TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: patients
-- Purpose: Patient-specific information
-- Relationship: 1:1 with profiles (where role = 'patient')
-- ============================================================================
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: doctor_schedules
-- Purpose: Doctor availability schedules
-- Relationship: Many schedules per doctor
-- ============================================================================
CREATE TABLE doctor_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    CONSTRAINT unique_doctor_schedule UNIQUE (doctor_id, day_of_week, start_time)
);

-- ============================================================================
-- TABLE: appointments
-- Purpose: Appointment booking and tracking
-- Relationship: Links patients and doctors
-- Business Rule: Prevents double booking at database level
-- ============================================================================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'confirmed', 'rejected', 'completed', 'cancelled')
    ),
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Prevent double booking: same doctor cannot have overlapping appointments
    CONSTRAINT unique_doctor_appointment UNIQUE (doctor_id, appointment_date, appointment_time)
);

-- Index for faster appointment queries
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- ============================================================================
-- TABLE: medicines
-- Purpose: Medicine reference data
-- Relationship: Referenced by prescription_medicines
-- ============================================================================
CREATE TABLE medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    generic_name TEXT,
    type TEXT, -- tablet, capsule, syrup, injection, etc.
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: prescriptions
-- Purpose: Medical prescriptions issued by doctors
-- Relationship: 1:1 with completed appointments
-- Business Rule: Must belong to a valid appointment
-- ============================================================================
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    diagnosis TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: prescription_medicines
-- Purpose: Junction table linking prescriptions to medicines
-- Relationship: Many-to-Many between prescriptions and medicines
-- Business Rule: Medicines must exist in medicines table
-- ============================================================================
CREATE TABLE prescription_medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE RESTRICT,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration TEXT NOT NULL,
    instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Prevent duplicate medicine entries in same prescription
    CONSTRAINT unique_prescription_medicine UNIQUE (prescription_id, medicine_id)
);

-- ============================================================================
-- TABLE: reviews
-- Purpose: Patient reviews for doctors
-- Relationship: Linked to completed appointments
-- Business Rule: One review per appointment, rating 1-5
-- ============================================================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for doctor ratings aggregation
CREATE INDEX idx_reviews_doctor ON reviews(doctor_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- ============================================================================
-- TABLE: notifications
-- Purpose: User notifications for appointments and prescriptions
-- Relationship: Links to profiles
-- ============================================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('appointment', 'prescription', 'review', 'general')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    related_id UUID, -- ID of related appointment, prescription, etc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster notification queries
CREATE INDEX idx_notifications_profile ON notifications(profile_id);
CREATE INDEX idx_notifications_unread ON notifications(profile_id, is_read);

-- ============================================================================
-- TRIGGERS: Auto-update updated_at timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctor_schedules_updated_at BEFORE UPDATE ON doctor_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS: Documentation for tables and constraints
-- ============================================================================
COMMENT ON TABLE profiles IS 'Base user profiles linked to Supabase Auth';
COMMENT ON TABLE specializations IS 'Medical specializations lookup table';
COMMENT ON TABLE doctors IS 'Doctor-specific information and qualifications';
COMMENT ON TABLE patients IS 'Patient-specific information';
COMMENT ON TABLE doctor_schedules IS 'Doctor availability schedules by day and time';
COMMENT ON TABLE appointments IS 'Patient appointments with doctors (prevents double booking)';
COMMENT ON TABLE medicines IS 'Reference data for medicines';
COMMENT ON TABLE prescriptions IS 'Medical prescriptions issued after appointments';
COMMENT ON TABLE prescription_medicines IS 'Junction table linking prescriptions to medicines';
COMMENT ON TABLE reviews IS 'Patient reviews for doctors (one per appointment)';
COMMENT ON TABLE notifications IS 'User notifications for various events';

COMMENT ON CONSTRAINT unique_doctor_appointment ON appointments IS 'Prevents double booking: same doctor cannot have two appointments at same date/time';
COMMENT ON CONSTRAINT unique_prescription_medicine ON prescription_medicines IS 'Prevents duplicate medicines in same prescription';
