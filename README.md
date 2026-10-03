# DayForge — Personal Daily Planner & Goal Tracker

DayForge is a single-user daily timetable planner, goal tracker, habit consistency tracker, and interactive motivator web app. Built with React, Vite, TypeScript, Tailwind CSS, Framer Motion, and a FastAPI SQLite backend.

---

## Key Features

- **Daily Timetable & Planner**:
  - Interactive hour timeline and list views.
  - Quick-add parsing (e.g., `"DSA 7pm-9pm"`).
  - Alarms, in-app missed alarm panel, and **.ics calendar file export**.
  - **Plan Tomorrow Tonight** shortcut mode (highlighted after 6 PM).
  - 1-click **Preset Task Templates** & copy yesterday's uncompleted tasks.

- **SVG Avatar Motivator & Mascot**:
  - Animated SVG Fox Mascot with 5 moods (`idle`, `cheering`, `celebrating`, `encouraging`, `sleepy`).
  - Speech bubble widget with contextual message engine.
  - Celebration fireworks burst with `canvas-confetti` on streak milestones and 100% daily task completion.

- **Consistency & Habit Stats**:
  - Streak tracking (current & longest streaks).
  - 60-day GitHub-style consistency heatmaps & weekly bar charts.
  - Ticking off tasks automatically logs linked habits.

- **Goals & Timeline**:
  - Multi-month career and health goals with milestone progress bars.
  - Days total vs elapsed tracking.

- **Reminders**:
  - Multiple offset notification rules with countdown status chips.
  - 1-click conversion from reminder to timetable task.

- **Data Portability**:
  - 1-click **JSON Data Backup Export** and **Backup Restore** in Settings.

---

## Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts, Lucide Icons, `canvas-confetti`.
- **Backend**: FastAPI (Python 3.11+), SQLModel / SQLAlchemy, SQLite, PyJWT, Bcrypt.
- **PWA**: `vite-plugin-pwa` with Service Worker for local notifications.

---

## Running Locally

### 1. Start Backend API Server
```bash
cd backend
# Create virtualenv (if not created)
python -m venv venv
venv\Scripts\activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run seed data script (optional)
python seed.py

# Launch FastAPI server
python -m uvicorn app.main:app --port 8000
```
Backend runs at `http://localhost:8000`.

### 2. Start Frontend Dev Server
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## Build Verification
To test production TypeScript compilation & build:
```bash
cd frontend
npm run build
```
