# NexPulse BPO Command Center & HRMS Platform

A full-stack, enterprise-grade **BPO Operations & HR Management Suite** built specifically for 24/7 call centers and business process outsourcing organizations.

> **Privacy & Compliance Notice:**
> - **100% Synthetic Data:** All employee records, client campaigns, call audits, and metrics are completely simulated and fictional.
> - **Zero PII (Personally Identifiable Information):** Uses synthetic names, fictional `@pulse-bpo.internal` emails, and officially reserved fictional phone numbers (`+1-555-01xx`). No real personal, financial, or health information is used or stored.
> - **Zero Real Credentials:** No live API keys, tokens, passwords, or confidential materials are present or required.

---

## Architecture

- **Backend:** Python 3.10+ with **FastAPI**, **Pydantic v2**, and **SQLite3**
- **Frontend:** **TypeScript**, **React 18**, **Vite**, **Tailwind CSS**, and **Lucide React**
- **Deployment & Serving:** Dual-mode support:
  - Development with hot reload (Vite on `http://localhost:5173` proxying to FastAPI on `http://127.0.0.1:8000`)
  - Standalone production serving (FastAPI automatically serves pre-bundled static assets at `http://127.0.0.1:8000`)

---

## Core Modules & BPO Capabilities

1. **Operations Floor & Live Agent Telemetry:**
   - Real-time agent status grid: `Available`, `In Call`, `Wrap Up (ACW)`, `Break`, `Training`, and `Offline`.
   - Real-time operational KPIs: Occupancy Rate, Shift Adherence %, Average Handling Time (AHT in mm:ss), and CSAT scores.
   - Interactive 1-click state switcher to simulate real-time floor status updates.
   - Filtering by Client Campaign and state.

2. **24/7 Rotational Roster & Shift Planner:**
   - 7-Day rotational matrix supporting standard BPO shifts:
     - `MOR` (Morning: 06:00 - 15:00)
     - `DAY` (Day / Afternoon: 14:00 - 23:00)
     - `GRA` (Graveyard / Night: 22:00 - 07:00, marked for +15% Night Differential)
     - `SPL` (Split shift: 10:00 - 19:00)
     - `OFF` (Rest day)
   - Interactive Shift Adjustment & Swap coordination workflow.

3. **Workforce & Talent Directory:**
   - Detailed employee profiles: Role (Agent, Team Lead, QA Specialist, WFM Analyst, HR), Seat/Bay allocation (e.g. `FLR2-BAY-A12`), hourly rates, and campaign deployments.
   - "Onboard Synthetic Agent" modal with synthetic data validation.

4. **Campaign & SLA Process Manager:**
   - Monitors multi-client contracts across `Inbound Voice`, `Blended Tier-2`, `Omni-channel Chat`, and `Back-Office`.
   - Visual SLA compliance tracking, target AHT, CSAT goals, and seat allocation.

5. **Quality Assurance (QA) Scorecard Lab:**
   - Multi-point rubric audits: Greeting (15 pts), Empathy & Listening (25 pts), Accuracy & Resolution (35 pts), Compliance & Disclaimers (25 pts).
   - **Fatal Error Flag:** Simulates zero-tolerance compliance events (e.g., disclosure omission) that drop audit score to 0% with alert.
   - Interactive "Audit Synthetic Interaction" scoring modal.

6. **Time, Attendance & Leave Hub:**
   - Simulated Web Punch Terminal (`Punch IN` / `Punch OUT`).
   - Daily punch logs with On-Time, Late, Absent, Half-Day status, and overtime hours.
   - Leave Request approval queue with 1-click Approve / Reject decisions.

7. **Payroll & Shift Differential Calculator:**
   - BPO-specific compensation breakdown: Base Salary + Night Shift Differential Allowance (+15% for graveyard hours) + QA Performance Bonus - Deductions = Net Pay.

---

## Quick Start

### Option 1: Unified Start (Recommended)
Run the automated launcher from the project root:
```bash
./run.sh
```
This boots both the FastAPI Python backend and the TypeScript Vite frontend.
- **Web Application:** `http://localhost:5173`
- **FastAPI OpenAPI Swagger:** `http://127.0.0.1:8000/docs`

### Option 2: Running Individually

#### 1. Python Backend
```bash
# In bpohrms/
export PYTHONPATH=backend
backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. TypeScript Frontend
```bash
# In bpohrms/frontend/
npm run dev
```

---

## Project Structure

```
bpohrms/
├── backend/
│   ├── app/
│   │   ├── database.py       # SQLite connection and schema initializers
│   │   ├── models.py         # Pydantic v2 data models
│   │   ├── seed_data.py      # 100% synthetic seed generation
│   │   └── main.py           # FastAPI routes & static asset mounting
│   ├── requirements.txt      # Python dependencies
│   └── venv/                 # Virtual environment
├── frontend/
│   ├── src/
│   │   ├── types/            # TypeScript interfaces
│   │   ├── services/api.ts   # REST API client
│   │   ├── components/       # Specialized UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── PrivacyBadge.tsx
│   │   │   ├── LiveFloorMonitor.tsx
│   │   │   ├── RosterPlanner.tsx
│   │   │   ├── EmployeeDirectory.tsx
│   │   │   ├── CampaignManager.tsx
│   │   │   ├── QAScorecards.tsx
│   │   │   ├── AttendanceManager.tsx
│   │   │   └── PayrollIncentives.tsx
│   │   ├── App.tsx           # Application state coordinator
│   │   ├── main.tsx          # React DOM root
│   │   └── index.css         # Tailwind & operations floor theme
│   ├── dist/                 # Production-optimized build
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── run.sh                    # Unified startup script
└── README.md
```

