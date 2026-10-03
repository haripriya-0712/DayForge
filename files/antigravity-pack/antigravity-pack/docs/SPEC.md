# DayForge — Product Spec (for Antigravity)

> Single-user personal web app: plan tomorrow tonight, execute today, track consistency, keep an end goal in sight with a motivating avatar. UI/UX quality is a first-class requirement. See `docs/DESIGN.md` for the full design system.

**User:** Haripriya (only user). Timezone: Asia/Kolkata. Primary device: phone (PWA) + laptop.

---

## 1. Modules at a glance
1. Daily Timetable (planner) with times, alarms, tick-box completion
2. Consistency stats (habits, streaks, heatmaps)
3. Login/activity stats
4. Reminders (event-based, with "remind me X days before")
5. Goals (end goal + timeline + daily contributions)
6. Avatar motivator (reacts to progress, always encouraging)
7. Dashboard + Settings

## 2. Stack
React + Vite + TypeScript + Tailwind + Framer Motion + Recharts + lucide-react + canvas-confetti · FastAPI + SQLModel + SQLite · vite-plugin-pwa.

---

## 3. Daily Timetable
- Add/edit/delete tasks per date. Default view today; **"Plan Tomorrow"** shortcut (highlighted after 6 PM).
- Task fields: title, date, start time, end time, category (DSA/Study/Health/Project/Personal/Other), priority, notes, alarm on/off, alarm offset (at start / 5 / 10 / 30 min before), recurrence (none/daily/weekdays/custom days), optional linked habit, optional linked goal, completed + completed_at.
- Views: **Timeline** (hour grid, now-line) and **List** (sorted by time). Week strip for date navigation.
- Quick add: one text box parsing e.g. "DSA 7pm-9pm" + category chips.
- Copy yesterday's tasks, save/apply templates, overlap warning.
- Tick box completes a task, updates the day progress ring, triggers avatar reaction, logs habit completion.
- Evening prompt (default 9 PM, configurable): "Plan tomorrow."

### Alarms (important limitation)
A website cannot set the phone's native clock alarm. Implement:
- Web Notifications via service worker (works best when installed as PWA), with sound, **Snooze 10 min**, **Mark done**, **Open** actions.
- In-app alarm modal + audio when the tab is open.
- On app open, a "You missed these" panel for missed alarms.
- Request notification permission via a friendly explainer screen first.
- Later: `.ics` export so tasks can also alert via phone calendar.

## 4. Consistency Stats (Habits)
- Habit: name, category, frequency (daily / X days per week), start date, optional goal link.
- A habit day is done when its linked task is ticked (or manual check).
- Per habit: current streak, longest streak, completion rate (7d/30d/all), total days, GitHub-style heatmap, weekly bar chart.
- Overview: all habits with streak flames and %.
- Optional "grace day" setting for streak rules.

## 5. Login Stats
- Log each session. Show daily login streak, longest streak, active days this week/month, heatmap, typical time of day.

## 6. Reminders
- Fields: title, event date/time, notes, category, optional goal link, multiple remind-me rules (e.g., 3 days before, 1 day before, same morning, X hours before).
- Statuses: Upcoming, Due soon, Done, Missed. Grouped as Today / This week / Later with countdown chips.
- "Add prep task" button creates a timetable task on an earlier chosen day.
- Notifications fire per rule via same system as alarms.

## 7. Goals
- Fields: end goal text (e.g., "Get placed in a good company"), why it matters, timeline (1/3/6/12 months or custom end date), daily contributions (e.g., DSA daily, projects, aptitude, mock interviews), milestones with target dates.
- Daily contributions can auto-create habits + recurring timetable tasks.
- Progress: day X of Y, milestones completed, consistency of linked habits, **On track / Behind / Ahead** status.
- Multiple goals; one pinned as main goal on dashboard. Editable timeline.

## 8. Avatar Motivator
- SVG mascot with moods: idle, cheering, celebrating, encouraging, sleepy.
- Floating widget on every page; tap to expand message + quick action.
- Triggers: page load, task completion, missed alarm, streak milestones (3/7/14/30/50/100), end-of-day summary, no activity by afternoon.
- Message bank (20+ per mood) stored in a JSON file; messages reference real task names, streaks, and the end goal. Never guilt-trip; comeback messages after missed days are supportive.
- Optional (phase 6): LLM-generated messages via backend endpoint with API key from `.env`, cached, with preset fallback.
- Settings: choose avatar, rename it, frequency, mute.

## 9. Pages
Dashboard · Planner · Stats (Habits/Logins/Summary) · Reminders · Goals · Settings. Layout and component details: `docs/DESIGN.md`.

## 10. Data Model
```
tasks(id, title, date, start_time, end_time, category, priority, notes, alarm_enabled, alarm_offset_min, recurrence_rule, habit_id, goal_id, completed, completed_at, created_at)
habits(id, name, category, frequency_type, target_days, start_date, goal_id, active)
habit_logs(id, habit_id, date, completed, source_task_id)
login_logs(id, timestamp)
reminders(id, title, event_datetime, notes, category, goal_id, status)
reminder_rules(id, reminder_id, offset_minutes, fired)
goals(id, title, why, start_date, end_date, is_main, status)
milestones(id, goal_id, title, target_date, completed)
settings(id, user_name, theme, evening_plan_time, avatar_type, avatar_name, avatar_frequency, avatar_muted, alarm_sound)
```
Single user: simple password login (hashed) with session cookie, or local passcode.

## 11. API (FastAPI)
```
POST /auth/login
GET/POST /tasks, PATCH/DELETE /tasks/{id}, POST /tasks/copy
GET/POST /habits, GET /habits/{id}/stats
GET /stats/overview, GET /stats/logins, POST /stats/login-ping
GET/POST /reminders, PATCH/DELETE /reminders/{id}
GET/POST /goals, PATCH /goals/{id}, GET /goals/{id}/progress
GET /avatar/message?context=...
GET/PATCH /settings
```

---

## 12. Build Phases and Prompts
Give Antigravity ONE phase at a time (use `/plan-phase` first, approve the plan, then build, then `/verify-ui`).

### Phase 0 — Scaffold + Design System
> Read GEMINI.md, docs/SPEC.md, docs/DESIGN.md. Scaffold /frontend (Vite+React+TS+Tailwind) and /backend (FastAPI+SQLite). Implement design tokens (light/dark), fonts, base components (Button, Card, Chip, Input, Sheet, Toast, Skeleton, ProgressRing), app shell with mobile bottom tab bar and desktop sidebar, theme toggle, and routing for all pages with polished placeholder screens. Verify in browser at 390px and 1280px.

### Phase 1 — Planner MVP
> Build auth, tasks CRUD API and the Planner page: week strip, Timeline + List views, quick-add sheet, task cards with animated tick box, day progress ring, copy-yesterday, overlap warning, Plan Tomorrow mode. Add seed data. Verify UI.

### Phase 2 — Alarms and PWA
> Add PWA setup, service worker, notification permission explainer, alarm scheduling with snooze/mark-done actions, in-app alarm modal with sound, missed-alarm panel, evening "Plan tomorrow" prompt. Explain clearly how to test on phone.

### Phase 3 — Stats
> Build habits, habit logs, streak logic, heatmaps, weekly charts, login logging and login stats, and the Stats page with tabs. Link tasks to habits so ticking a task logs the habit.

### Phase 4 — Reminders and Goals
> Build reminders with multiple rules, countdown chips, prep-task creation, and notifications. Build goals with timeline, daily contributions (auto-create habits/recurring tasks), milestones, progress and on-track status.

### Phase 5 — Avatar and Dashboard
> Build the SVG avatar with moods and animations, message bank, trigger engine, floating widget, and the full Dashboard (gradient hero, next-up task, ring, goal strip, top streaks, upcoming reminders). Add confetti and streak milestone modals.

### Phase 6 — Polish
> Run /polish-ui on every screen. Add templates, recurring tasks edge cases, .ics export, data export/backup, optional LLM avatar messages, performance and accessibility pass, update README.

---

## 13. Acceptance Checklist
- [ ] Plan tomorrow tonight with times and alarms
- [ ] Ticking tasks updates progress instantly with satisfying animation
- [ ] Alarms fire with snooze and mark-done
- [ ] Habit streaks and heatmaps update from completed tasks
- [ ] Login streak tracked automatically
- [ ] Reminders fire days before events as configured
- [ ] Goal shows timeline, days remaining, on-track status
- [ ] Avatar reacts differently to progress, slipping, and comebacks
- [ ] Looks polished at 390px and 1280px in light and dark themes
