# DayForge — Antigravity Pack

## How to use
1. Create a new folder for the project, e.g. `dayforge/`.
2. Copy everything from this pack into it, keeping the structure:
   - `GEMINI.md` (project rules, always active; also works as AGENTS.md)
   - `docs/SPEC.md` and `docs/DESIGN.md`
   - `.agent/workflows/` (slash commands: `/plan-phase`, `/verify-ui`, `/polish-ui`)
3. Open the folder in Antigravity.
4. In Agent Manager, start with the **Phase 0** prompt from `docs/SPEC.md` section 12.
5. Approve the plan, let it build, then run `/verify-ui`. Move to the next phase only after you are happy.

Note: newer Antigravity versions may default to `.agents/` instead of `.agent/`. Both work; rename the folder if workflows don't show up in the panel.
