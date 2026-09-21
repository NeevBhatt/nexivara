# 🏥 Nexivara — Smart Healthcare Appointment & Management System

> **College DBMS Project**
> **Team:** Neev & Jatin

---

## 1. Project Overview

**Nexivara** is a healthcare appointment and management web application that connects patients, doctors, and administrators through a single platform.

The system allows patients to discover doctors, check availability, book appointments, track appointment status, access prescriptions, and review doctors.

Doctors can manage their profiles, schedules, appointments, patients, and prescriptions.

Administrators can manage doctors, patients, medical reference data, appointments, and system analytics.

### Main Objective

Build a **professional-looking but manageable full-stack DBMS project** that demonstrates strong PostgreSQL/DBMS concepts without unnecessary complexity.

---

# 2. Technology Stack

| Area                | Technology    |
| ------------------- | ------------- |
| Ideation & Planning | NotebookLM    |
| UI/UX               | v0.dev        |
| Frontend            | React + Vite  |
| Styling             | Tailwind CSS  |
| Backend Platform    | Supabase      |
| Database            | PostgreSQL    |
| Authentication      | Supabase Auth |
| Coding              | any model.    |
| Version Control     | Git + GitHub  |

### Architecture

```text
                    USER
                     │
                     ▼
              React + Vite
                     │
                     ▼
              Supabase Client
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
   Supabase Auth          PostgreSQL
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
                Patients     Doctors      Admin
```

We will **not build a large custom Node.js/Express backend** unless a specific requirement makes it necessary.

Supabase will provide the backend infrastructure and PostgreSQL database.

---

# 3. Project Philosophy

The project must follow:

> **High marks + professional appearance + strong DBMS + manageable development**

We are NOT trying to build a production hospital management system.

### Avoid

* AI diagnosis
* Video consultation
* Real hospital integration
* Insurance
* Complex payment gateway
* Complex medical records
* SMS/WhatsApp integration
* Excessive animations
* Unnecessary microservices
* Unnecessary backend complexity

---

# 4. User Roles

There are three main roles.

```text
                    MediCo
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
     PATIENT        DOCTOR         ADMIN
```

---

# 5. Patient Features

## Core

### Authentication

* Register
* Login
* Logout
* Profile management

### Doctor Discovery

* Search doctors
* Filter by specialization
* View doctor profile
* View experience
* View consultation fee
* View rating

### Appointment

* View availability
* Select date
* Select available time
* Enter reason for visit
* Book appointment
* Cancel appointment
* Track appointment status

### Medical History

* Appointment history
* Prescription history
* Prescription details

### Reviews

* Rate doctor
* Write review
* Only allow reviews after completed appointments

### Notifications

* Appointment confirmation
* Appointment rejection
* Appointment cancellation
* Prescription availability

---

# 6. Doctor Features

## Core

### Professional Profile

* Name
* Specialization
* Qualification
* Experience
* Biography
* Consultation fee
* Verification status

### Schedule

* Define weekly availability
* View schedule
* Update schedule

### Appointments

* View pending appointments
* Accept appointment
* Reject appointment
* View upcoming appointments
* Mark appointment completed

### Patient Information

* View relevant appointment information
* View previous appointment history where permitted

### Prescription

* Create prescription
* Add diagnosis
* Add notes
* Add medicines
* Add dosage
* Add duration
* Add instructions

### Reviews

* View ratings
* View patient reviews

---

# 7. Admin Features

## Core

### Dashboard

Display:

* Total patients
* Total doctors
* Total appointments
* Pending appointments
* Completed appointments
* Popular specializations
* Average doctor ratings

### Management

* Manage doctors
* Verify doctors
* Manage patients
* Manage specializations
* Manage medicines
* View appointments

---

# 8. Appointment Lifecycle

The appointment system is the core transaction of MediCo.

```text
Patient
   │
   ▼
Find Doctor
   │
   ▼
Check Availability
   │
   ▼
Select Date + Time
   │
   ▼
Book Appointment
   │
   ▼
PENDING
   │
   ├───────────────┐
   ▼               ▼
CONFIRMED       REJECTED
   │
   ▼
CONSULTATION
   │
   ▼
COMPLETED
   │
   ├───────────────┐
   ▼               ▼
PRESCRIPTION     REVIEW
```

Possible appointment statuses:

```text
pending
confirmed
rejected
completed
cancelled
```

---

# 9. Critical Business Rules

These rules must be enforced properly.

### Rule 1 — No Double Booking

A doctor cannot have two appointments at:

```text
same doctor
+
same date
+
same time
```

This must be protected at the **database level**.

---

### Rule 2 — Valid Rating

```text
Rating = 1 to 5
```

---

### Rule 3 — Valid Experience

```text
Experience >= 0
```

---

### Rule 4 — Valid Consultation Fee

```text
Consultation Fee >= 0
```

---

### Rule 5 — Review Eligibility

A patient should only be able to review a doctor after a completed appointment.

---

### Rule 6 — Prescription Relationship

A prescription must belong to a valid appointment.

---

### Rule 7 — Medicine Relationship

Medicines attached to a prescription must exist in the medicine table.

---

# 10. Database Design

The database should be normalized and relational.

### Planned entities

```text
profiles
patients
doctors
specializations
doctor_schedules
appointments
prescriptions
medicines
prescription_medicines
reviews
notifications
```

The final schema must be reviewed before implementation.

Do not create tables just because they "sound useful."

Every table must have a clear purpose and relationship.

---

# 11. Database Relationships

Basic structure:

```text
PROFILES
   │
   ├──────── PATIENTS
   │
   └──────── DOCTORS
                 │
                 ├──── SPECIALIZATIONS
                 │
                 ├──── DOCTOR_SCHEDULES
                 │
                 └──── APPOINTMENTS
                           │
                           ├──── PATIENT
                           │
                           ├──── PRESCRIPTION
                           │           │
                           │           └──── PRESCRIPTION_MEDICINES
                           │                         │
                           │                         └──── MEDICINES
                           │
                           └──── REVIEW
```

---

# 12. DBMS Concepts We Must Demonstrate

The project should intentionally demonstrate:

## Keys

* Primary Key
* Foreign Key
* Composite Primary Key where appropriate

## Constraints

* NOT NULL
* UNIQUE
* CHECK
* DEFAULT

## Relationships

* One-to-One
* One-to-Many
* Many-to-Many

## SQL

* SELECT
* INSERT
* UPDATE
* DELETE
* INNER JOIN
* LEFT JOIN
* GROUP BY
* HAVING
* ORDER BY
* Aggregate Functions
* Subqueries

## Advanced PostgreSQL

* Views
* Indexes
* Triggers
* Functions where useful
* Transactions/business rules
* Row Level Security
* Referential Integrity

---

# 13. Normalization

The final database must be analyzed up to **3NF**.

We must be able to explain:

```text
1NF
 ↓
2NF
 ↓
3NF
```

The explanation must use our actual MediCo tables.

Avoid generic textbook-only explanations.

---

# 14. Security

Use:

### Supabase Auth

For:

* Registration
* Login
* Sessions
* Logout

### PostgreSQL Row Level Security

Examples:

```text
Patient A
   ↓
Can access own appointments
Cannot access Patient B's appointments
```

```text
Doctor A
   ↓
Can access assigned appointments
Cannot access Doctor B's appointments
```

```text
Admin
   ↓
Administrative access
```

Security must not depend only on frontend restrictions.

---

# 15. UI/UX Structure

## Public

```text
Landing Page
Login
Register
Doctor Discovery
Doctor Profile
```

## Patient

```text
Dashboard
Doctors
Doctor Profile
Book Appointment
My Appointments
Appointment Details
Prescription History
Prescription Details
Notifications
Profile
```

## Doctor

```text
Dashboard
Appointments
Appointment Details
Schedule
Patients
Create Prescription
Profile
Reviews
```

## Admin

```text
Dashboard
Doctors
Patients
Appointments
Specializations
Medicines
Analytics
```

---

# 16. UI Design Direction

The interface should feel like a modern healthcare SaaS application.

### Use

* Clean typography
* Consistent spacing
* Professional color palette
* Cards
* Tables
* Status badges
* Clear forms
* Responsive design
* Empty states
* Loading states
* Error states
* Confirmation dialogs

### Avoid

* Excessive animations
* Overuse of gradients
* Excessive glassmorphism
* Huge decorative elements
* Unnecessary 3D effects

The goal is:

> **Professional, clean, modern — not flashy.**

---

# 17. Development Workflow

We will build in phases.

```text
PHASE 1
Requirements
     ↓
PHASE 2
Database Design
     ↓
PHASE 3
UI/UX Prototype
     ↓
PHASE 4
Supabase Setup
     ↓
PHASE 5
Authentication
     ↓
PHASE 6
Core Features
     ↓
PHASE 7
Integration
     ↓
PHASE 8
Security
     ↓
PHASE 9
Testing
     ↓
PHASE 10
Documentation + Viva
```

---

# 18. Tool Coordination

## NotebookLM

Use for:

* Requirements
* Architecture
* Feature decisions
* DBMS planning
* ER diagram planning
* Documentation
* Viva questions
* Presentation structure

NotebookLM is the **planning/source-of-truth tool**.

---

## v0.dev

Use for:

* UI/UX
* React page prototypes
* Components
* Responsive design

Start with mock data.

Do not connect the first prototype to Supabase.

---

## Claude

Use for:

* React implementation
* Supabase integration
* Authentication
* CRUD
* Database queries
* Routing
* Validation
* Debugging
* Feature integration

Antigravity must work **feature-by-feature**.

Do not ask it to rebuild the entire project for every change.

---

## Supabase

Use for:

* PostgreSQL
* Authentication
* Tables
* Relationships
* Constraints
* RLS
* Views
* Triggers
* Realtime where useful

---

# 19. Development Order

Follow this order:

```text
1. Project setup
2. UI prototype
3. Database schema
4. Supabase project
5. Authentication
6. Role-based routing
7. Doctor profiles
8. Doctor search
9. Doctor schedules
10. Appointment booking
11. Doctor appointment management
12. Prescription system
13. Reviews
14. Notifications
15. Admin dashboard
16. RLS
17. Testing
18. UI polish
19. Documentation
20. Viva preparation
```

---

# 20. Team Coordination

## Neev — Primary Ownership

* UI/UX
* React
* v0
* Patient experience
* Patient dashboard
* Doctor discovery
* Booking interface
* Frontend integration
* Documentation coordination

## Jatin — Primary Ownership

* Supabase
* PostgreSQL
* Database schema
* ER diagram
* Authentication
* RLS
* Doctor-side functionality
* Admin-side functionality
* Database queries

## Both

* Architecture
* Appointment logic
* Database decisions
* Testing
* Debugging
* Integration
* Documentation
* Presentation
* Viva

### Important

Neither person should say:

> "I don't know that part because the other person built it."

Both must understand the complete system.

---

# 21. GitHub Rules

Use:

```text
main
│
└── develop
     │
     ├── feature/patient
     ├── feature/doctor
     ├── feature/admin
     ├── feature/database
     └── feature/appointments
```

### Before working

```bash
git pull
```

Create a feature branch.

### After completing work

```text
Code
 ↓
Test
 ↓
Commit
 ↓
Push
 ↓
Review
 ↓
Merge
```

Never directly modify `main` unless both agree.

---

# 22. Shared Project Status

Maintain:

```text
PROJECT_STATUS.md
```

Example:

```text
## Completed

[x] React setup
[x] Landing page
[x] Login UI
[x] Database schema

## In Progress

[ ] Authentication
[ ] Doctor dashboard

## Pending

[ ] Appointment booking
[ ] Prescription
[ ] Reviews
[ ] Admin analytics

## Bugs

- Fix appointment date validation
- Fix mobile sidebar
```

This is the shared coordination board for Neev and Jatin.

---

# 23. Feature Change Rule

Before adding a new feature, ask:

1. Does it improve the project?
2. Does it demonstrate DBMS concepts?
3. Does it improve the user experience?
4. How difficult is it?
5. Does it require database changes?
6. Does it affect existing features?
7. Will it affect documentation?
8. Will it be useful during viva?

Classify every new feature:

```text
CORE
OPTIONAL
AVOID
```

Do not add features just because AI suggests them.

---

# 24. Testing

## Database Testing

Test:

* Duplicate appointments
* Invalid ratings
* Invalid fees
* Invalid experience
* Foreign key violations
* Delete/cascade behavior
* RLS policies

## Application Testing

Test:

* Registration
* Login
* Doctor search
* Booking
* Cancellation
* Doctor approval
* Prescription
* Review
* Notifications

## Role Testing

Patient:

```text
Patient pages → YES
Doctor pages → NO
Admin pages → NO
```

Doctor:

```text
Doctor pages → YES
Patient private data → Restricted
Admin pages → NO
```

Admin:

```text
Administrative pages → YES
```

---

# 25. Final Demonstration Flow

The final demo should tell one complete story.

```text
1. Patient registers
        ↓
2. Patient logs in
        ↓
3. Searches for a dermatologist
        ↓
4. Opens doctor profile
        ↓
5. Checks available slots
        ↓
6. Books appointment
        ↓
7. Doctor logs in
        ↓
8. Doctor accepts appointment
        ↓
9. Doctor completes consultation
        ↓
10. Doctor creates prescription
        ↓
11. Patient views prescription
        ↓
12. Patient submits review
        ↓
13. Admin opens dashboard
        ↓
14. Analytics show updated data
```

This should be the primary live demonstration.

---

# 26. DBMS Demo

During the DBMS demonstration, show:

1. ER Diagram
2. Tables
3. Primary Keys
4. Foreign Keys
5. Constraints
6. JOIN query
7. Aggregate query
8. GROUP BY/HAVING
9. Subquery
10. View
11. Trigger
12. RLS
13. Double-booking prevention
14. Normalization

---

# 27. Documentation

Final report should contain:

1. Abstract
2. Introduction
3. Problem Statement
4. Objectives
5. Existing System
6. Proposed System
7. Scope
8. Functional Requirements
9. Non-Functional Requirements
10. Technology Stack
11. System Architecture
12. Use Case Diagram
13. ER Diagram
14. Relational Schema
15. Normalization
16. Table Descriptions
17. SQL Queries
18. Screenshots
19. Testing
20. Results
21. Limitations
22. Future Scope
23. Conclusion
24. References

Documentation must always match the actual implementation.

---

# 28. Presentation

Recommended structure:

### Slide 1

Project title + team

### Slide 2

Problem Statement

### Slide 3

Existing vs Proposed System

### Slide 4

Objectives + Features

### Slide 5

Technology Stack

### Slide 6

System Architecture

### Slide 7

ER Diagram

### Slide 8

DBMS Concepts

### Slide 9

Application Screenshots / Demo

### Slide 10

Results + Future Scope

### Slide 11

Conclusion

### Slide 12

Q&A

---

# 29. Viva Preparation

Prepare questions covering:

### DBMS

* Keys
* Constraints
* Relationships
* Normalization
* Transactions
* Referential integrity

### SQL

* JOIN
* GROUP BY
* HAVING
* Subqueries
* Views
* Aggregates

### PostgreSQL

* Constraints
* Triggers
* Functions
* Indexes

### Supabase

* Authentication
* RLS
* Realtime
* PostgreSQL integration

### Project-specific

* How booking works
* How double booking is prevented
* How prescriptions are stored
* Why prescription_medicines exists
* How reviews are linked to appointments
* How users are separated by role

Every answer should explain:

**WHAT → WHY → HOW**

---

# 30. Feature Freeze

Once all CORE features work:

> **STOP adding major features.**

Remaining time should be used for:

* Bug fixing
* UI polish
* Database cleanup
* SQL queries
* Testing
* Documentation
* Presentation
* Viva preparation

---

# 31. Definition of "Finished"

MediCo is considered complete only when:

* [ ] Patient registration works
* [ ] Patient login works
* [ ] Doctor login works
* [ ] Admin access works
* [ ] Doctor search works
* [ ] Doctor profile works
* [ ] Doctor availability works
* [ ] Appointment booking works
* [ ] Double booking is prevented
* [ ] Doctor can accept/reject
* [ ] Appointment can be completed
* [ ] Prescription can be created
* [ ] Patient can view prescription
* [ ] Reviews work
* [ ] Notifications work
* [ ] Admin dashboard works
* [ ] RLS is tested
* [ ] Database constraints are tested
* [ ] ER diagram is finalized
* [ ] 3NF explanation is ready
* [ ] SQL queries are ready
* [ ] Documentation is complete
* [ ] Presentation is complete
* [ ] Both Neev and Jatin can explain the project

---

# 32. Golden Rule

> **Do not over-engineer. Do not under-build.**

The project should look like a real healthcare application while remaining simple enough for two students to build and explain.

The priority is:

```text
                   Nexivara
                       │
       ┌───────────────┼────────────────┐
       ▼               ▼                ▼
   Good UI        Strong DBMS       Reliable Demo
       │               │                │
       └───────────────┼────────────────┘
                       ▼
                  HIGH MARKS
```

**Every feature, table, page and technology must have a clear reason for existing.**
