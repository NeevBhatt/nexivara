# Nexivara Database Schema - Normalization Analysis

## Overview

The Nexivara database is designed to **Third Normal Form (3NF)** to ensure data integrity, minimize redundancy, and optimize query performance.

---

## Normalization Stages

### First Normal Form (1NF)

**Requirements:**
- Atomic values (no repeating groups or arrays)
- Each column contains only one value
- Each row is unique (has a primary key)

**✅ Our Schema Satisfies 1NF:**

| Table | Primary Key | Atomic Values |
|-------|------------|---------------|
| profiles | id (UUID) | ✓ All columns are atomic |
| specializations | id (UUID) | ✓ All columns are atomic |
| doctors | id (UUID) | ✓ All columns are atomic |
| patients | id (UUID) | ✓ All columns are atomic |
| doctor_schedules | id (UUID) | ✓ All columns are atomic |
| appointments | id (UUID) | ✓ All columns are atomic |
| prescriptions | id (UUID) | ✓ All columns are atomic |
| medicines | id (UUID) | ✓ All columns are atomic |
| prescription_medicines | id (UUID) | ✓ All columns are atomic |
| reviews | id (UUID) | ✓ All columns are atomic |
| notifications | id (UUID) | ✓ All columns are atomic |

**Example:** Instead of storing multiple medicines in a single prescription field like:
```
prescription: { medicines: "Paracetamol, Ibuprofen, Amoxicillin" }
```

We use a junction table (`prescription_medicines`) where each medicine is a separate row.

---

### Second Normal Form (2NF)

**Requirements:**
- Already in 1NF
- No partial dependencies (all non-key attributes must depend on the entire primary key, not just part of it)
- Only relevant for composite keys

**✅ Our Schema Satisfies 2NF:**

All our tables use single-column primary keys (UUID), so partial dependencies are impossible. However, let's examine constraints:

**Example - doctor_schedules:**
- Primary Key: `id` (single column)
- Unique Constraint: `(doctor_id, day_of_week, start_time)` (composite)
- All non-key attributes (`end_time`, `is_available`) depend on the entire composite unique key, not just part of it

**Example - prescription_medicines:**
- Primary Key: `id` (single column)
- Unique Constraint: `(prescription_id, medicine_id)` (composite)
- All non-key attributes (`dosage`, `frequency`, `duration`, `instructions`) depend on the complete combination of prescription + medicine

---

### Third Normal Form (3NF)

**Requirements:**
- Already in 2NF
- No transitive dependencies (non-key attributes must not depend on other non-key attributes)

**✅ Our Schema Satisfies 3NF:**

Let's analyze each table for transitive dependencies:

#### ❌ **VIOLATION EXAMPLE (if we had done this):**
```sql
-- BAD: Doctor table with transitive dependency
CREATE TABLE doctors_bad (
    id UUID PRIMARY KEY,
    name TEXT,
    specialization_name TEXT,        -- ← Non-key attribute
    specialization_description TEXT  -- ← Depends on specialization_name (transitive!)
);
```
Here, `specialization_description` depends on `specialization_name`, not directly on `id`.

#### ✅ **OUR SOLUTION:**
```sql
-- GOOD: Separate tables to eliminate transitive dependency
CREATE TABLE doctors (
    id UUID PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id),
    specialization_id UUID REFERENCES specializations(id)  -- ← FK only
);

CREATE TABLE specializations (
    id UUID PRIMARY KEY,
    name TEXT,
    description TEXT  -- ← Depends on specialization.id, not doctor.id
);
```

#### **Analysis of Each Table:**

| Table | Non-Key Attributes Depend On | 3NF Status |
|-------|----------------------------|------------|
| **profiles** | All depend only on `id` | ✅ 3NF |
| **specializations** | `description` depends only on `id` | ✅ 3NF |
| **doctors** | All depend only on `id` (FKs point to other tables) | ✅ 3NF |
| **patients** | All depend only on `id` | ✅ 3NF |
| **doctor_schedules** | All depend only on `id` | ✅ 3NF |
| **appointments** | All depend only on `id` | ✅ 3NF |
| **prescriptions** | All depend only on `id` | ✅ 3NF |
| **medicines** | `generic_name`, `type` depend only on `id` | ✅ 3NF |
| **prescription_medicines** | Dosage info depends on the prescription-medicine combination | ✅ 3NF |
| **reviews** | Rating/comment depend only on `id` | ✅ 3NF |
| **notifications** | All depend only on `id` | ✅ 3NF |

---

## Key Design Decisions for Normalization

### 1. **Profiles as Base Entity**
Instead of duplicating user information:
```
profiles (1) ──→ (1) patients
profiles (1) ──→ (1) doctors
```
This prevents storing email, name, phone multiple times.

### 2. **Specializations Lookup Table**
Instead of storing specialization name in every doctor record:
```sql
doctors.specialization_id → specializations.id
```
This ensures consistency and allows updating specialization details once.

### 3. **Prescription-Medicines Junction Table**
To represent the many-to-many relationship:
```
prescriptions (M) ──→ (M) medicines
```
We use `prescription_medicines` to store the dosage/frequency specific to each prescription-medicine pair.

### 4. **Appointments as Central Entity**
Appointments link patients and doctors without duplicating their information:
```sql
appointments.patient_id → patients.id
appointments.doctor_id → doctors.id
```

---

## Relationship Summary

```
PROFILES (Base)
   │
   ├──→ PATIENTS (1:1)
   │      │
   │      └──→ APPOINTMENTS (1:M)
   │             │
   │             ├──→ PRESCRIPTIONS (1:1)
   │             │      │
   │             │      └──→ PRESCRIPTION_MEDICINES (1:M)
   │             │             │
   │             │             └──→ MEDICINES (M:1)
   │             │
   │             └──→ REVIEWS (1:1)
   │
   └──→ DOCTORS (1:1)
          │
          ├──→ SPECIALIZATIONS (M:1)
          ├──→ DOCTOR_SCHEDULES (1:M)
          ├──→ APPOINTMENTS (1:M)
          ├──→ PRESCRIPTIONS (1:M)
          └──→ REVIEWS (1:M)
```

---

## Benefits of 3NF in Nexivara

1. **No Data Redundancy**: Specialization details stored once, referenced many times
2. **Update Anomalies Eliminated**: Changing a specialization name updates one row, not hundreds
3. **Insertion Anomalies Eliminated**: Can add medicines without needing a prescription first
4. **Deletion Anomalies Eliminated**: Deleting a doctor doesn't delete their specialization
5. **Data Integrity**: Foreign keys enforce referential integrity
6. **Query Efficiency**: Well-indexed relationships enable fast JOINs

---

## Example Queries Demonstrating Normalization

### Get Doctor with Specialization (JOIN eliminates redundancy)
```sql
SELECT 
    p.full_name,
    d.qualification,
    d.experience,
    s.name as specialization
FROM doctors d
JOIN profiles p ON d.profile_id = p.id
JOIN specializations s ON d.specialization_id = s.id
WHERE d.id = 'doctor-uuid';
```

### Get Prescription with All Medicines (M:M via junction table)
```sql
SELECT 
    pr.diagnosis,
    m.name as medicine_name,
    pm.dosage,
    pm.frequency,
    pm.duration
FROM prescriptions pr
JOIN prescription_medicines pm ON pr.id = pm.prescription_id
JOIN medicines m ON pm.medicine_id = m.id
WHERE pr.id = 'prescription-uuid';
```

---

## Viva Questions - Normalization

**Q: Why did you create a separate specializations table?**
A: To achieve 3NF. If we stored specialization name and description in the doctors table, we'd have transitive dependency (description depends on name, not doctor). Separating eliminates redundancy and update anomalies.

**Q: Why use a junction table for prescriptions and medicines?**
A: To represent the many-to-many relationship. One prescription has many medicines, and one medicine appears in many prescriptions. The junction table also stores relationship-specific data (dosage, frequency) that belongs to the combination, not to either entity alone.

**Q: Is your schema in BCNF (Boyce-Codd Normal Form)?**
A: Yes. Since we only have single-column primary keys and all foreign keys reference primary keys, BCNF is automatically satisfied. BCNF requires that for every dependency X → Y, X must be a superkey. All our dependencies follow this rule.

**Q: Give an example of an update anomaly your normalization prevents.**
A: Without normalizing specializations, if "Cardiology" description changes, we'd need to update every doctor row with that specialization. With our design, we update one row in the specializations table.

---

## Conclusion

The Nexivara database schema is fully normalized to 3NF (and BCNF), ensuring:
- ✅ Minimal redundancy
- ✅ Data consistency
- ✅ No anomalies (insertion, update, deletion)
- ✅ Efficient queries via proper indexing
- ✅ Maintainable and scalable structure
