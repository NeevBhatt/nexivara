# Nexivara Database Migrations

This directory contains SQL migration files for the Nexivara healthcare management system database.

## Files

### `20260921000001_initial_schema.sql`
Complete database schema with all tables, relationships, constraints, and triggers.

**Tables created:**
- `profiles` - Base user profiles (linked to Supabase Auth)
- `specializations` - Medical specializations lookup
- `doctors` - Doctor information and qualifications
- `patients` - Patient information
- `doctor_schedules` - Doctor availability schedules
- `appointments` - Appointment bookings
- `prescriptions` - Medical prescriptions
- `medicines` - Medicine reference data
- `prescription_medicines` - Prescription-medicine junction table
- `reviews` - Patient reviews for doctors
- `notifications` - User notifications

**Key Constraints:**
- Unique doctor appointment slots (prevents double booking)
- Rating validation (1-5 only)
- Experience and consultation fee >= 0
- Valid appointment statuses (pending, confirmed, rejected, completed, cancelled)
- One review per appointment
- Automatic timestamp updates via triggers

### `20260921000002_seed_data.sql`
Sample reference data for testing:
- 10 medical specializations
- 10 common medicines

## Applying Migrations

### Option 1: Using Supabase CLI
```bash
# Install Supabase CLI if not already installed
# brew install supabase/tap/supabase  # macOS
# npm install -g supabase              # npm

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

### Option 2: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the content of `20260921000001_initial_schema.sql`
4. Click **Run**
5. Repeat for `20260921000002_seed_data.sql`

### Option 3: Using psql (Direct PostgreSQL)
```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@[HOST]:[PORT]/postgres" -f supabase/migrations/20260921000001_initial_schema.sql
psql "postgresql://postgres:[YOUR-PASSWORD]@[HOST]:[PORT]/postgres" -f supabase/migrations/20260921000002_seed_data.sql
```

## Verification

After applying migrations, verify the schema:

```sql
-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check table row counts
SELECT 
    'specializations' as table_name, COUNT(*) as count FROM specializations
UNION ALL
SELECT 'medicines', COUNT(*) FROM medicines;

-- Verify constraints
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
ORDER BY conrelid::regclass::text, conname;
```

## Database Design Notes

### Normalization (3NF)
- **1NF**: All tables have atomic values, no repeating groups
- **2NF**: No partial dependencies (all non-key attributes fully depend on primary key)
- **3NF**: No transitive dependencies (non-key attributes don't depend on other non-key attributes)

### Key Relationships
```
profiles (1) ──→ (1) patients
profiles (1) ──→ (1) doctors
doctors (M) ──→ (1) specializations
doctors (1) ──→ (M) doctor_schedules
patients (1) ──→ (M) appointments
doctors (1) ──→ (M) appointments
appointments (1) ──→ (1) prescriptions
prescriptions (M) ──→ (M) medicines (via prescription_medicines)
appointments (1) ──→ (1) reviews
profiles (1) ──→ (M) notifications
```

### Business Rules Enforced
1. ✅ No double booking (UNIQUE constraint on doctor + date + time)
2. ✅ Valid rating (CHECK constraint 1-5)
3. ✅ Valid experience (CHECK constraint >= 0)
4. ✅ Valid consultation fee (CHECK constraint >= 0)
5. ✅ Review eligibility (one review per appointment via UNIQUE)
6. ✅ Prescription belongs to appointment (FK constraint)
7. ✅ Medicines must exist (FK constraint with RESTRICT)

## Next Steps

After applying migrations:
1. Set up Row Level Security (RLS) policies
2. Create database views for common queries
3. Add any required database functions
4. Configure Supabase Auth
5. Test all constraints with sample data
