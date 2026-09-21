# Nexivara — Project Status

> This file tracks the **current progress** of the project.
>
> `PROJECT_GUIDELINES.md` = Permanent project rules
> `PROJECT_STATUS.md` = Current project progress

---

## 1. Project Info

**Project:** Nexivara – Smart Healthcare Appointment & Management System

**Team:** Neev + Jatin

**Stack:**

* React + Vite
* Tailwind CSS
* Supabase
* PostgreSQL
* Supabase Auth
* Git + GitHub

---

## 2. Current Phase

**Phase:** Project Setup ✅ → Phase 1 Foundation Complete ✅

**Overall Progress:** 10%

**Last Updated:** 21-09-2026 11:36 UTC

---

## 3. Feature Status

| Feature                | Owner | Status        |
| ---------------------- | ----- | ------------- |
| Project Setup          | Both  | 🟢 Completed   |
| Database               | Neev  | ⬜ Not Started |
| Authentication         | Both  | ⬜ Not Started |
| Patient Dashboard      | Neev  | ⬜ Not Started |
| Doctor Search          | Jatin | ⬜ Not Started |
| Doctor Profile         | Jatin | ⬜ Not Started |
| Doctor Schedule        | Neev  | ⬜ Not Started |
| Appointment Booking    | Neev  | ⬜ Not Started |
| Appointment Management | Both  | ⬜ Not Started |
| Prescription System    | Both  | ⬜ Not Started |
| Reviews                | Jatin | ⬜ Not Started |
| Notifications          | Neev  | ⬜ Not Started |
| Admin Dashboard        | Jatin | ⬜ Not Started |
| Admin Analytics        | Jatin | ⬜ Not Started |
| RLS / Security         | Neev  | ⬜ Not Started |
| Testing                | Both  | ⬜ Not Started |
| Documentation          | Both  | ⬜ Not Started |
| Presentation           | Both  | ⬜ Not Started |
| Viva Preparation       | Both  | ⬜ Not Started |

### Status Meaning

* ⬜ Not Started
* 🟡 In Progress
* 🟢 Completed
* 🔴 Blocked

---

## 4. Database Status

### Tables

* [ ] profiles
* [ ] specializations
* [ ] doctors
* [ ] patients
* [ ] doctor_schedules
* [ ] appointments
* [ ] prescriptions
* [ ] medicines
* [ ] prescription_medicines
* [ ] reviews
* [ ] notifications

### DBMS Concepts

* [ ] Primary Key
* [ ] Foreign Key
* [ ] Constraints
* [ ] JOIN
* [ ] GROUP BY / HAVING
* [ ] Aggregate Functions
* [ ] Subquery
* [ ] View
* [ ] Normalization / 3NF
* [ ] Trigger
* [ ] RLS

---

## 5. Current Tasks

### Neev

* [ ] Set up Supabase
* [ ] Create database schema
* [ ] Implement doctor schedule
* [ ] Implement appointment logic
* [ ] Implement RLS
* [ ] Prepare DBMS queries

### Jatin

* [ ] Set up React project
* [ ] Build doctor profile
* [ ] Build doctor search
* [ ] Build admin dashboard
* [ ] Build analytics UI

### Both

* [ ] Authentication
* [ ] Appointment integration
* [ ] Prescription system
* [ ] Testing
* [ ] Documentation
* [ ] Presentation

---

## 6. Current Work

**Working On:** Phase 1 Complete ✅

**Next Task:** Phase 2 - Database Design (ER diagram + Supabase setup)

**Blockers:** None

**Note:** Supabase credentials (.env file) need to be added when Supabase project is created

---

## 7. Important Decisions

* Supabase will be used instead of building a large custom backend.
* PostgreSQL will be the project database.
* AI diagnosis is **not** part of the project.
* Video consultation is **not** part of the project.
* Real payment gateway is **not** part of the project.
* The project will focus on appointment management and DBMS concepts.

---

## 8. Rules for Updating This File

After completing a task:

1. Change its status.
2. Update **Current Work**.
3. Add any important decision.
4. Record blockers if any.

Do not add major features without discussing them with the team.

---

## 9. Definition of Done

A feature is complete when:

* [ ] It works
* [ ] Database integration works
* [ ] Permissions are correct
* [ ] Basic error handling works
* [ ] It has been tested
* [ ] Status is updated here

---

## 10. Quick Status

**Frontend:** 🟢 Complete (React + Vite + Tailwind + Router + Supabase client)
**Backend/Supabase:** ⬜ Not Started
**Database:** ⬜ Not Started
**Authentication:** ⬜ Not Started
**Patient Module:** ⬜ Not Started
**Doctor Module:** ⬜ Not Started
**Admin Module:** ⬜ Not Started
**Testing:** ⬜ Not Started
**Documentation:** ⬜ Not Started
**Presentation:** ⬜ Not Started

---

## 11. Phase 1 Verification Summary

**Date:** 21-09-2026
**Status:** ✅ Complete

### What Works
- ✅ React + Vite project initialized
- ✅ Tailwind CSS configured and working
- ✅ React Router DOM installed and configured
- ✅ Supabase client configured (needs credentials)
- ✅ Basic routing (/, /login, /register)
- ✅ Dev server runs on http://localhost:5173
- ✅ Project structure matches guidelines
- ✅ All foundation directories created

### Project Structure
```
frontend/
├── src/
│   ├── components/     ✅ Created
│   ├── pages/          ✅ Created (Home, Login, Register)
│   ├── layouts/        ✅ Created
│   ├── hooks/          ✅ Created
│   ├── lib/            ✅ Supabase client
│   ├── assets/         ✅ Ready
│   ├── App.jsx         ✅ Router configured
│   ├── main.jsx        ✅ Entry point
│   └── index.css       ✅ Tailwind imports
├── postcss.config.js   ✅ Configured
├── tailwind.config.js  ✅ Configured
├── vite.config.js      ✅ Configured
└── package.json        ✅ All dependencies
```

### Files Created in Phase 1
- /frontend/src/pages/Home.jsx
- /frontend/src/pages/Login.jsx
- /frontend/src/pages/Register.jsx
- /frontend/src/components/.gitkeep
- /frontend/src/layouts/.gitkeep
- /frontend/src/hooks/.gitkeep

### Files Modified in Phase 1
- /frontend/src/App.jsx (added React Router)

### What's Next
**Phase 2:** Database Design
- Design ER Diagram
- Create Supabase project
- Set up PostgreSQL tables
- Define relationships and constraints

---

## Golden Rule

**Keep this file updated.**

Anyone opening the project should be able to understand its current state immediately.
