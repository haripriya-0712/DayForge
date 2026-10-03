# DayForge — Project Rules (always active)

Personal, single-user daily planner web app. Full product spec: `docs/SPEC.md`. Design system: `docs/DESIGN.md`. Read both before building any feature.

## Stack (do not change without asking)
- Frontend: React + Vite + TypeScript + Tailwind CSS + Framer Motion + Recharts + lucide-react
- Backend: FastAPI (Python 3.11+), SQLModel/SQLAlchemy, SQLite
- PWA: vite-plugin-pwa, service worker for notifications
- Package managers: `npm` (frontend), `pip` + `requirements.txt` (backend)

## Folder structure
```
/frontend   (src/components, src/pages, src/hooks, src/lib, src/styles)
/backend    (app/main.py, app/models.py, app/routers/, app/services/)
/docs       (SPEC.md, DESIGN.md)
```

## Working style
- Build **one phase at a time** as listed in `docs/SPEC.md` section 12. Never start the next phase until I say so.
- Before coding a phase: write a short **implementation plan** artifact and wait for my approval.
- After coding: run the app, **use the browser agent to open it and verify** the UI at 390px (mobile) and 1280px (desktop), and attach screenshots as artifacts.
- Keep files small and components reusable. No file over ~300 lines.
- Ask me before adding any new dependency.

## UI/UX rules (strict)
- Follow `docs/DESIGN.md` exactly: colors, spacing, type scale, radius, motion. Never hardcode colors; use CSS variables/Tailwind tokens.
- **Mobile-first.** Every screen must look polished at 390px width first, then scale up.
- Every screen needs: loading skeleton, friendly empty state, and error state.
- All interactive elements: min 44px touch target, visible focus ring, hover + pressed states.
- Animations: 150–300ms, ease-out, respect `prefers-reduced-motion`.
- Support light and dark theme from day one.
- No lorem ipsum, no placeholder boxes in finished screens. Use realistic sample data.
- Accessibility: semantic HTML, labels on inputs, color contrast AA.

## Code rules
- TypeScript strict mode. Type all API responses.
- Backend: Pydantic schemas for every request/response, proper HTTP status codes.
- All dates stored in UTC, displayed in the user's local timezone (default Asia/Kolkata).
- Wrap localStorage/Notification API access in safe helpers.
- Add seed data script (`backend/seed.py`) with realistic demo data.
- Keep a `README.md` with run instructions updated.

## Don'ts
- Don't build multi-user, payments, or social features.
- Don't use generic default-looking UI (plain white cards, default blue buttons, Bootstrap look).
- Don't leave TODO stubs in finished features.
- Don't modify `docs/` files unless I ask.
