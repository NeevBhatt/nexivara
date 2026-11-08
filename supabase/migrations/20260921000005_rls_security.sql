-- Nexivara Row Level Security (RLS) Policies
-- Migration: Enable RLS on all tables and define security policies for patients, doctors, and admins

-- ============================================================================
-- 1. Enable RLS on all tables
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. Helper functions for role checking
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. PROFILES POLICIES
-- ============================================================================
CREATE POLICY "Profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 4. SPECIALIZATIONS POLICIES
-- ============================================================================
CREATE POLICY "Specializations are viewable by everyone" ON specializations
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage specializations" ON specializations
    FOR ALL USING (public.get_user_role() = 'admin');

-- ============================================================================
-- 5. DOCTORS POLICIES
-- ============================================================================
CREATE POLICY "Doctors are viewable by everyone" ON doctors
    FOR SELECT USING (true);

CREATE POLICY "Doctors can update their own doctor record" ON doctors
    FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "Doctors can insert their own doctor record" ON doctors
    FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Admins can manage doctors" ON doctors
    FOR ALL USING (public.get_user_role() = 'admin');

-- ============================================================================
-- 6. PATIENTS POLICIES
-- ============================================================================
CREATE POLICY "Patients are viewable by patients themselves and their doctors/admins" ON patients
    FOR SELECT USING (
        profile_id = auth.uid() OR
        public.get_user_role() IN ('doctor', 'admin')
    );

CREATE POLICY "Patients can update their own patient record" ON patients
    FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "Patients can insert their own patient record" ON patients
    FOR INSERT WITH CHECK (profile_id = auth.uid());

-- ============================================================================
-- 7. DOCTOR SCHEDULES POLICIES
-- ============================================================================
CREATE POLICY "Schedules are viewable by everyone" ON doctor_schedules
    FOR SELECT USING (true);

CREATE POLICY "Doctors can manage their own schedules" ON doctor_schedules
    FOR ALL USING (
        doctor_id IN (SELECT id FROM doctors WHERE profile_id = auth.uid()) OR
        public.get_user_role() = 'admin'
    );

-- ============================================================================
-- 8. APPOINTMENTS POLICIES
-- ============================================================================
CREATE POLICY "Appointments viewable by involved patient, doctor, or admin" ON appointments
    FOR SELECT USING (
        patient_id IN (SELECT id FROM patients WHERE profile_id = auth.uid()) OR
        doctor_id IN (SELECT id FROM doctors WHERE profile_id = auth.uid()) OR
        public.get_user_role() = 'admin'
    );

CREATE POLICY "Patients can insert appointments" ON appointments
    FOR INSERT WITH CHECK (
        patient_id IN (SELECT id FROM patients WHERE profile_id = auth.uid())
    );

CREATE POLICY "Patients and doctors can update appointments" ON appointments
    FOR UPDATE USING (
        patient_id IN (SELECT id FROM patients WHERE profile_id = auth.uid()) OR
        doctor_id IN (SELECT id FROM doctors WHERE profile_id = auth.uid()) OR
        public.get_user_role() = 'admin'
    );

-- ============================================================================
-- 9. PRESCRIPTIONS POLICIES
-- ============================================================================
CREATE POLICY "Prescriptions viewable by involved patient, doctor, or admin" ON prescriptions
    FOR SELECT USING (
        patient_id IN (SELECT id FROM patients WHERE profile_id = auth.uid()) OR
        doctor_id IN (SELECT id FROM doctors WHERE profile_id = auth.uid()) OR
        public.get_user_role() = 'admin'
    );

CREATE POLICY "Doctors can insert prescriptions" ON prescriptions
    FOR INSERT WITH CHECK (
        doctor_id IN (SELECT id FROM doctors WHERE profile_id = auth.uid())
    );

-- ============================================================================
-- 10. MEDICINES POLICIES
-- ============================================================================
CREATE POLICY "Medicines viewable by everyone" ON medicines
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage medicines" ON medicines
    FOR ALL USING (public.get_user_role() = 'admin');

-- ============================================================================
-- 11. PRESCRIPTION MEDICINES POLICIES
-- ============================================================================
CREATE POLICY "Prescription medicines viewable by involved parties" ON prescription_medicines
    FOR SELECT USING (
        prescription_id IN (
            SELECT id FROM prescriptions WHERE
            patient_id IN (SELECT id FROM patients WHERE profile_id = auth.uid()) OR
            doctor_id IN (SELECT id FROM doctors WHERE profile_id = auth.uid())
        ) OR
        public.get_user_role() = 'admin'
    );

CREATE POLICY "Doctors can insert prescription medicines" ON prescription_medicines
    FOR INSERT WITH CHECK (
        prescription_id IN (
            SELECT id FROM prescriptions WHERE doctor_id IN (SELECT id FROM doctors WHERE profile_id = auth.uid())
        )
    );

-- ============================================================================
-- 12. REVIEWS POLICIES
-- ============================================================================
CREATE POLICY "Reviews viewable by everyone" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Patients can insert reviews for their appointments" ON reviews
    FOR INSERT WITH CHECK (
        patient_id IN (SELECT id FROM patients WHERE profile_id = auth.uid())
    );

CREATE POLICY "Patients can update their reviews" ON reviews
    FOR UPDATE USING (
        patient_id IN (SELECT id FROM patients WHERE profile_id = auth.uid())
    );

-- ============================================================================
-- 13. NOTIFICATIONS POLICIES
-- ============================================================================
CREATE POLICY "Notifications viewable by owner" ON notifications
    FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON notifications
    FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "System/Users can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);
