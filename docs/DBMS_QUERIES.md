# Nexivara - DBMS Queries Reference

> **Phase 2C Documentation**  
> Comprehensive SQL queries demonstrating PostgreSQL capabilities using the Nexivara healthcare database

---

## Table of Contents

1. [Basic SELECT Queries](#basic-select-queries)
2. [JOIN Queries](#join-queries)
3. [Aggregate Functions](#aggregate-functions)
4. [GROUP BY and HAVING](#group-by-and-having)
5. [Subqueries](#subqueries)
6. [View Usage](#view-usage)
7. [Complex Queries](#complex-queries)
8. [Performance Queries](#performance-queries)

---

## Basic SELECT Queries

### 1. List all doctors with their specializations
```sql
SELECT 
    p.full_name AS doctor_name,
    s.name AS specialization,
    d.experience,
    d.consultation_fee,
    d.is_verified
FROM doctors d
JOIN profiles p ON d.profile_id = p.id
JOIN specializations s ON d.specialization_id = s.id
ORDER BY d.experience DESC;
```

### 2. Get all appointments for a specific date
```sql
SELECT 
    a.appointment_time,
    pat.full_name AS patient_name,
    doc.full_name AS doctor_name,
    a.status,
    a.reason
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN profiles pat ON p.profile_id = pat.id
JOIN doctors d ON a.doctor_id = d.id
JOIN profiles doc ON d.profile_id = doc.id
WHERE a.appointment_date = '2026-09-15'
ORDER BY a.appointment_time;
```

### 3. Find all medicines of a specific type
```sql
SELECT 
    name,
    generic_name,
    type,
    description
FROM medicines
WHERE type = 'Tablet'
ORDER BY name;
```

### 4. List all pending appointments
```sql
SELECT 
    a.appointment_date,
    a.appointment_time,
    pat.full_name AS patient_name,
    doc.full_name AS doctor_name,
    a.reason
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN profiles pat ON p.profile_id = pat.id
JOIN doctors d ON a.doctor_id = d.id
JOIN profiles doc ON d.profile_id = doc.id
WHERE a.status = 'pending'
ORDER BY a.appointment_date, a.appointment_time;
```

---

## JOIN Queries

### INNER JOIN

#### 1. Get doctors with their completed appointments
```sql
SELECT 
    d.id,
    p.full_name AS doctor_name,
    s.name AS specialization,
    COUNT(a.id) AS completed_appointments
FROM doctors d
INNER JOIN profiles p ON d.profile_id = p.id
INNER JOIN specializations s ON d.specialization_id = s.id
INNER JOIN appointments a ON d.id = a.doctor_id
WHERE a.status = 'completed'
GROUP BY d.id, p.full_name, s.name
ORDER BY completed_appointments DESC;
```

#### 2. Get prescriptions with patient and doctor details
```sql
SELECT 
    pr.diagnosis,
    pat.full_name AS patient_name,
    doc.full_name AS doctor_name,
    s.name AS specialization,
    a.appointment_date,
    pr.created_at AS prescription_date
FROM prescriptions pr
INNER JOIN appointments a ON pr.appointment_id = a.id
INNER JOIN patients p ON pr.patient_id = p.id
INNER JOIN profiles pat ON p.profile_id = pat.id
INNER JOIN doctors d ON pr.doctor_id = d.id
INNER JOIN profiles doc ON d.profile_id = doc.id
INNER JOIN specializations s ON d.specialization_id = s.id
ORDER BY pr.created_at DESC;
```

### LEFT JOIN

#### 1. List all doctors and their review counts (including doctors with no reviews)
```sql
SELECT 
    p.full_name AS doctor_name,
    s.name AS specialization,
    d.experience,
    COUNT(r.id) AS total_reviews,
    COALESCE(AVG(r.rating), 0)::DECIMAL(3,2) AS average_rating
FROM doctors d
JOIN profiles p ON d.profile_id = p.id
JOIN specializations s ON d.specialization_id = s.id
LEFT JOIN reviews r ON d.id = r.doctor_id
GROUP BY p.full_name, s.name, d.experience
ORDER BY average_rating DESC, total_reviews DESC;
```

#### 2. Get all appointments with prescription status (including appointments without prescriptions)
```sql
SELECT 
    a.appointment_date,
    a.appointment_time,
    pat.full_name AS patient_name,
    doc.full_name AS doctor_name,
    a.status,
    CASE 
        WHEN pr.id IS NOT NULL THEN 'Prescription Available'
        ELSE 'No Prescription'
    END AS prescription_status,
    pr.diagnosis
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN profiles pat ON p.profile_id = pat.id
JOIN doctors d ON a.doctor_id = d.id
JOIN profiles doc ON d.profile_id = doc.id
LEFT JOIN prescriptions pr ON a.id = pr.appointment_id
WHERE a.status = 'completed'
ORDER BY a.appointment_date DESC;
```

#### 3. Show all patients with their appointment counts (including patients without appointments)
```sql
SELECT 
    p.full_name AS patient_name,
    pt.date_of_birth,
    pt.gender,
    COUNT(a.id) AS total_appointments,
    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) AS completed_appointments
FROM profiles p
JOIN patients pt ON p.id = pt.profile_id
LEFT JOIN appointments a ON pt.id = a.patient_id
GROUP BY p.full_name, pt.date_of_birth, pt.gender
ORDER BY total_appointments DESC;
```

---

## Aggregate Functions

### COUNT

#### 1. Count appointments by status
```sql
SELECT 
    status,
    COUNT(*) AS count
FROM appointments
GROUP BY status
ORDER BY count DESC;
```

#### 2. Count doctors per specialization
```sql
SELECT 
    s.name AS specialization,
    COUNT(d.id) AS doctor_count
FROM specializations s
LEFT JOIN doctors d ON s.id = d.specialization_id
GROUP BY s.name
ORDER BY doctor_count DESC;
```

### AVG (Average)

#### 1. Average rating per doctor
```sql
SELECT 
    p.full_name AS doctor_name,
    s.name AS specialization,
    COUNT(r.id) AS review_count,
    ROUND(AVG(r.rating), 2) AS average_rating
FROM doctors d
JOIN profiles p ON d.profile_id = p.id
JOIN specializations s ON d.specialization_id = s.id
LEFT JOIN reviews r ON d.id = r.doctor_id
GROUP BY p.full_name, s.name
HAVING COUNT(r.id) > 0
ORDER BY average_rating DESC;
```

#### 2. Average consultation fee by specialization
```sql
SELECT 
    s.name AS specialization,
    ROUND(AVG(d.consultation_fee), 2) AS avg_consultation_fee,
    MIN(d.consultation_fee) AS min_fee,
    MAX(d.consultation_fee) AS max_fee,
    COUNT(d.id) AS doctor_count
FROM specializations s
JOIN doctors d ON s.id = d.specialization_id
GROUP BY s.name
ORDER BY avg_consultation_fee DESC;
```

### MIN/MAX

#### 1. Find most and least experienced doctors by specialization
```sql
SELECT 
    s.name AS specialization,
    MAX(d.experience) AS most_experienced,
    MIN(d.experience) AS least_experienced,
    ROUND(AVG(d.experience), 1) AS avg_experience
FROM specializations s
JOIN doctors d ON s.id = d.specialization_id
GROUP BY s.name
ORDER BY most_experienced DESC;
```

#### 2. Earliest and latest appointments by doctor
```sql
SELECT 
    p.full_name AS doctor_name,
    MIN(a.appointment_date) AS first_appointment,
    MAX(a.appointment_date) AS latest_appointment,
    COUNT(a.id) AS total_appointments
FROM doctors d
JOIN profiles p ON d.profile_id = p.id
LEFT JOIN appointments a ON d.id = a.doctor_id
GROUP BY p.full_name
HAVING COUNT(a.id) > 0
ORDER BY latest_appointment DESC;
```

---

## GROUP BY and HAVING

### 1. Doctors with more than 1 completed appointment
```sql
SELECT 
    p.full_name AS doctor_name,
    s.name AS specialization,
    COUNT(a.id) AS completed_appointments
FROM doctors d
JOIN profiles p ON d.profile_id = p.id
JOIN specializations s ON d.specialization_id = s.id
JOIN appointments a ON d.id = a.doctor_id
WHERE a.status = 'completed'
GROUP BY p.full_name, s.name
HAVING COUNT(a.id) > 1
ORDER BY completed_appointments DESC;
```

### 2. Specializations with average rating above 4.0
```sql
SELECT 
    s.name AS specialization,
    COUNT(DISTINCT d.id) AS doctor_count,
    COUNT(r.id) AS total_reviews,
    ROUND(AVG(r.rating), 2) AS average_rating
FROM specializations s
JOIN doctors d ON s.id = d.specialization_id
LEFT JOIN reviews r ON d.id = r.doctor_id
GROUP BY s.name
HAVING AVG(r.rating) > 4.0 OR AVG(r.rating) IS NULL
ORDER BY average_rating DESC NULLS LAST;
```

### 3. Patients with multiple appointments
```sql
SELECT 
    p.full_name AS patient_name,
    pt.gender,
    COUNT(a.id) AS total_appointments,
    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) AS completed,
    COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) AS cancelled
FROM profiles p
JOIN patients pt ON p.id = pt.profile_id
JOIN appointments a ON pt.id = a.patient_id
GROUP BY p.full_name, pt.gender
HAVING COUNT(a.id) >= 1
ORDER BY total_appointments DESC;
```

### 4. Medicines used in multiple prescriptions
```sql
SELECT 
    m.name AS medicine_name,
    m.type,
    COUNT(pm.id) AS times_prescribed
FROM medicines m
JOIN prescription_medicines pm ON m.id = pm.medicine_id
GROUP BY m.name, m.type
HAVING COUNT(pm.id) > 0
ORDER BY times_prescribed DESC;
```

---

## Subqueries

### 1. Find doctors with above-average consultation fees
```sql
SELECT 
    p.full_name AS doctor_name,
    s.name AS specialization,
    d.consultation_fee
FROM doctors d
JOIN profiles p ON d.profile_id = p.id
JOIN specializations s ON d.specialization_id = s.id
WHERE d.consultation_fee > (
    SELECT AVG(consultation_fee) FROM doctors
)
ORDER BY d.consultation_fee DESC;
```

### 2. Patients who have completed appointments but haven't left reviews
```sql
SELECT 
    p.full_name AS patient_name,
    COUNT(a.id) AS completed_appointments,
    COUNT(r.id) AS reviews_left
FROM profiles p
JOIN patients pt ON p.id = pt.profile_id
JOIN appointments a ON pt.id = a.patient_id
LEFT JOIN reviews r ON a.id = r.appointment_id
WHERE a.status = 'completed'
  AND a.id NOT IN (SELECT appointment_id FROM reviews)
GROUP BY p.full_name
ORDER BY completed_appointments DESC;
```

### 3. Doctors with the highest ratings in their specialization
```sql
SELECT 
    p.full_name AS doctor_name,
    s.name AS specialization,
    ROUND(AVG(r.rating), 2) AS average_rating
FROM doctors d
JOIN profiles p ON d.profile_id = p.id
JOIN specializations s ON d.specialization_id = s.id
LEFT JOIN reviews r ON d.id = r.doctor_id
GROUP BY d.id, p.full_name, s.name, d.specialization_id
HAVING AVG(r.rating) = (
    SELECT MAX(avg_rating)
    FROM (
        SELECT 
            d2.specialization_id,
            AVG(r2.rating) AS avg_rating
        FROM doctors d2
        LEFT JOIN reviews r2 ON d2.id = r2.doctor_id
        GROUP BY d2.id, d2.specialization_id
    ) AS spec_ratings
    WHERE spec_ratings.specialization_id = d.specialization_id
)
ORDER BY average_rating DESC;
```

### 4. Find appointments scheduled within next 7 days
```sql
SELECT 
    a.appointment_date,
    a.appointment_time,
    pat.full_name AS patient_name,
    doc.full_name AS doctor_name,
    a.status
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN profiles pat ON p.profile_id = pat.id
JOIN doctors d ON a.doctor_id = d.id
JOIN profiles doc ON d.profile_id = doc.id
WHERE a.appointment_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
  AND a.status IN ('pending', 'confirmed')
ORDER BY a.appointment_date, a.appointment_time;
```

### 5. Prescriptions with more medicines than average
```sql
SELECT 
    pr.id,
    pr.diagnosis,
    pat.full_name AS patient_name,
    COUNT(pm.id) AS medicine_count
FROM prescriptions pr
JOIN patients p ON pr.patient_id = p.id
JOIN profiles pat ON p.profile_id = pat.id
JOIN prescription_medicines pm ON pr.id = pm.prescription_id
GROUP BY pr.id, pr.diagnosis, pat.full_name
HAVING COUNT(pm.id) > (
    SELECT AVG(med_count)
    FROM (
        SELECT COUNT(*) AS med_count
        FROM prescription_medicines
        GROUP BY prescription_id
    ) AS avg_meds
)
ORDER BY medicine_count DESC;
```

---

## View Usage

### 1. Query doctor_appointment_summary view
```sql
-- Get top-rated doctors with appointment statistics
SELECT 
    doctor_name,
    specialization,
    experience,
    average_rating,
    total_reviews,
    total_appointments,
    completed_appointments
FROM doctor_appointment_summary
WHERE is_verified = TRUE
  AND total_reviews > 0
ORDER BY average_rating DESC, total_reviews DESC
LIMIT 10;
```

### 2. Query doctor_rating_details view
```sql
-- Get doctors with perfect 5-star ratings
SELECT 
    doctor_name,
    specialization,
    total_reviews,
    average_rating,
    five_star_reviews
FROM doctor_rating_details
WHERE average_rating = 5.00
ORDER BY total_reviews DESC;
```

### 3. Query patient_appointment_history view
```sql
-- Get a patient's complete appointment history
SELECT 
    appointment_date,
    appointment_time,
    doctor_name,
    specialization,
    status,
    has_prescription,
    has_review
FROM patient_appointment_history
WHERE patient_name = 'John Smith'
ORDER BY appointment_date DESC;
```

### 4. Query prescription_details view
```sql
-- Get all medicines prescribed for a specific diagnosis
SELECT 
    patient_name,
    doctor_name,
    diagnosis,
    medicine_name,
    dosage,
    frequency,
    duration,
    instructions
FROM prescription_details
WHERE diagnosis ILIKE '%hypertension%'
ORDER BY prescription_date DESC;
```

### 5. Query appointment_calendar view
```sql
-- Get today's appointments for a doctor
SELECT 
    appointment_time,
    patient_name,
    patient_phone,
    status,
    reason
FROM appointment_calendar
WHERE doctor_name = 'Dr. Robert Johnson'
  AND appointment_date = CURRENT_DATE
ORDER BY appointment_time;
```

---

## Complex Queries

### 1. Doctor Performance Dashboard
```sql
SELECT 
    p.full_name AS doctor_name,
    s.name AS specialization,
    d.experience,
    d.consultation_fee,
    -- Appointment metrics
    COUNT(DISTINCT a.id) AS total_appointments,
    COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) AS completed,
    ROUND(
        COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END)::DECIMAL / 
        NULLIF(COUNT(DISTINCT a.id), 0) * 100, 
        2
    ) AS completion_rate,
    -- Rating metrics
    COUNT(DISTINCT r.id) AS total_reviews,
    COALESCE(ROUND(AVG(r.rating), 2), 0) AS average_rating,
    -- Financial metrics
    COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) * d.consultation_fee AS total_revenue
FROM doctors d
JOIN profiles p ON d.profile_id = p.id
JOIN specializations s ON d.specialization_id = s.id
LEFT JOIN appointments a ON d.id = a.doctor_id
LEFT JOIN reviews r ON d.id = r.doctor_id
GROUP BY d.id, p.full_name, s.name, d.experience, d.consultation_fee
ORDER BY total_revenue DESC;
```

### 2. Patient Engagement Report
```sql
SELECT 
    p.full_name AS patient_name,
    EXTRACT(YEAR FROM AGE(pt.date_of_birth)) AS age,
    pt.gender,
    COUNT(DISTINCT a.id) AS total_appointments,
    COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) AS completed_appointments,
    COUNT(DISTINCT CASE WHEN a.status = 'cancelled' THEN a.id END) AS cancelled_appointments,
    COUNT(DISTINCT pr.id) AS prescriptions_received,
    COUNT(DISTINCT r.id) AS reviews_given,
    MIN(a.appointment_date) AS first_appointment,
    MAX(a.appointment_date) AS last_appointment
FROM profiles p
JOIN patients pt ON p.id = pt.profile_id
LEFT JOIN appointments a ON pt.id = a.patient_id
LEFT JOIN prescriptions pr ON pt.id = pr.patient_id
LEFT JOIN reviews r ON pt.id = r.patient_id
GROUP BY p.full_name, pt.date_of_birth, pt.gender
ORDER BY total_appointments DESC;
```

### 3. Specialization Comparison
```sql
SELECT 
    s.name AS specialization,
    COUNT(DISTINCT d.id) AS total_doctors,
    ROUND(AVG(d.experience), 1) AS avg_experience,
    ROUND(AVG(d.consultation_fee), 2) AS avg_fee,
    COUNT(DISTINCT a.id) AS total_appointments,
    COUNT(DISTINCT r.id) AS total_reviews,
    COALESCE(ROUND(AVG(r.rating), 2), 0) AS avg_rating
FROM specializations s
LEFT JOIN doctors d ON s.id = d.specialization_id
LEFT JOIN appointments a ON d.id = a.doctor_id
LEFT JOIN reviews r ON d.id = r.doctor_id
GROUP BY s.name
ORDER BY total_appointments DESC;
```

### 4. Prescription Medicine Analysis
```sql
SELECT 
    m.name AS medicine_name,
    m.type,
    COUNT(DISTINCT pm.prescription_id) AS prescriptions_count,
    COUNT(DISTINCT pr.doctor_id) AS doctors_prescribing,
    COUNT(DISTINCT pr.patient_id) AS patients_receiving,
    STRING_AGG(DISTINCT s.name, ', ') AS prescribed_by_specializations
FROM medicines m
JOIN prescription_medicines pm ON m.id = pm.medicine_id
JOIN prescriptions pr ON pm.prescription_id = pr.id
JOIN doctors d ON pr.doctor_id = d.id
JOIN specializations s ON d.specialization_id = s.id
GROUP BY m.name, m.type
ORDER BY prescriptions_count DESC;
```

---

## Performance Queries

### 1. Most Active Time Slots
```sql
SELECT 
    a.appointment_time::TIME AS time_slot,
    COUNT(*) AS appointment_count,
    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) AS completed_count
FROM appointments a
GROUP BY time_slot
ORDER BY appointment_count DESC;
```

### 2. Monthly Appointment Trends
```sql
SELECT 
    TO_CHAR(appointment_date, 'YYYY-MM') AS month,
    COUNT(*) AS total_appointments,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) AS rejected
FROM appointments
GROUP BY month
ORDER BY month DESC;
```

### 3. Unread Notifications Summary
```sql
SELECT 
    p.full_name,
    p.role,
    COUNT(n.id) AS unread_notifications,
    MAX(n.created_at) AS latest_notification
FROM profiles p
JOIN notifications n ON p.id = n.profile_id
WHERE n.is_read = FALSE
GROUP BY p.full_name, p.role
ORDER BY unread_notifications DESC;
```

---

## Query Performance Tips

1. **Use Indexes**: Queries on `appointment_date`, `status`, `doctor_id`, `patient_id` are optimized with existing indexes
2. **Views**: Use views for frequently-run complex queries instead of repeating JOIN logic
3. **Limit Results**: Add `LIMIT` clause for large result sets in dashboards
4. **Filter Early**: Add WHERE clauses before JOINs when possible
5. **Aggregate Wisely**: Use HAVING only when you need to filter aggregated results

---

## Notes

- All queries tested with Phase 2B demo data
- UUIDs used as primary keys for better distribution
- TIMESTAMPTZ used for proper timezone handling
- Indexes created on frequently-queried columns
- Views materialized for better performance (if needed)

---

**Last Updated:** 2026-09-21  
**Phase:** 2C - DBMS Features  
**Database:** Nexivara Healthcare Management System
