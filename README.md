# 🏥 Nexivara — Smart Healthcare Appointment & Management System

> **College DBMS Project**  
> **Team:** Neev & Jatin

---

## Technology Stack

- **Frontend:** React + Vite
- **Styling:** Tailwind CSS
- **Backend:** Supabase
- **Database:** PostgreSQL
- **Authentication:** Supabase Auth
- **Version Control:** Git + GitHub

---

## Project Structure

```
Nexivara/
│
├── frontend/              # React + Vite application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── layouts/      # Layout wrappers
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities, Supabase client
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # Entry point
│   ├── public/
│   └── .env.example      # Environment variables template
│
├── supabase/             # Database & backend (to be created)
│   ├── migrations/
│   └── functions/
│
├── docs/                 # Documentation (to be created)
│
├── PROJECT_GUIDELINES.md
├── PROJECT_STATUS.md
└── README.md
```

---

## Getting Started

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Set Up Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your Supabase credentials:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### 4. Build for Production

```bash
npm run build
```

---

## Current Status

**Phase:** Planning → Project Setup ✅  
**Progress:** 5%

See `PROJECT_STATUS.md` for detailed progress tracking.

---

## Documentation

- **PROJECT_GUIDELINES.md** — Complete project specification
- **PROJECT_STATUS.md** — Current progress tracker

---

## Team

**Neev** — UI/UX, React, Frontend Integration  
**Jatin** — Supabase, PostgreSQL, Database Design

---

## License

Educational project for college DBMS coursework.
