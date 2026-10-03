# DayForge — Design System & UX Guide

**Vibe:** calm, focused, a little playful. Like a premium habit app (think Linear x Notion Calendar x Duolingo warmth). Clean surfaces, soft depth, one confident accent color, delightful micro-interactions. NOT a generic dashboard.

---

## 1. Color Tokens (define as CSS variables, map in Tailwind)

### Light
| Token | Value | Use |
|---|---|---|
| `--bg` | `#F7F6FB` | App background |
| `--surface` | `#FFFFFF` | Cards |
| `--surface-2` | `#F0EEF8` | Inset areas, inputs |
| `--border` | `#E4E1F0` | Hairlines |
| `--text` | `#1B1A29` | Primary text |
| `--text-muted` | `#6B6880` | Secondary text |
| `--primary` | `#6C5CE7` | Main accent (violet) |
| `--primary-soft` | `#ECE9FD` | Accent tint backgrounds |
| `--success` | `#2FBF8F` | Done, streaks |
| `--warning` | `#F5A524` | Due soon |
| `--danger` | `#EF5B6B` | Missed, destructive |
| `--flame` | `#FF7A45` | Streak flame |

### Dark
| Token | Value |
|---|---|
| `--bg` | `#0F0E17` |
| `--surface` | `#1A1826` |
| `--surface-2` | `#242136` |
| `--border` | `#2E2A45` |
| `--text` | `#F3F2FA` |
| `--text-muted` | `#9A97B3` |
| `--primary` | `#8B7CFF` |
| `--primary-soft` | `#2A2550` |

### Category colors (tasks/habits)
DSA `#6C5CE7` · Study `#3B82F6` · Health `#2FBF8F` · Project `#F5A524` · Personal `#EC6FB3` · Other `#8E8AA8`

Gradients (sparingly): hero cards use `linear-gradient(135deg, #6C5CE7, #9B8CFF)`; success moments use `#2FBF8F → #6FE3B8`.

---

## 2. Typography
- Headings: **Plus Jakarta Sans** (600/700). Body/UI: **Inter** (400/500/600). Numbers/timers: tabular figures (`font-variant-numeric: tabular-nums`).
- Scale: 12 / 14 / 16 (base) / 18 / 22 / 28 / 36.
- Line height 1.5 body, 1.2 headings. Max text width ~65ch.
- Greeting on dashboard uses 28–36px, bold.

## 3. Spacing, Shape, Depth
- 4px base grid. Common gaps: 8, 12, 16, 24, 32.
- Radius: inputs/buttons 12px · cards 20px · chips 999px · modals 24px.
- Shadows (soft, layered): `0 1px 2px rgba(20,16,50,.04), 0 8px 24px rgba(20,16,50,.06)`. In dark mode use borders + subtle glow instead of heavy shadows.
- Cards: generous padding (16–20px), no harsh borders.

## 4. Layout
- **Mobile (<768px):** bottom tab bar (Home, Planner, Stats, Reminders, Goals) with a floating center **"+" quick-add** button. Settings in a profile menu. Safe-area padding.
- **Desktop (≥1024px):** left sidebar (collapsible) with icons+labels, main content max-width 1100px, right rail with avatar + upcoming reminders on dashboard.
- Sticky page headers with blur backdrop.

## 5. Core Components
- **TaskCard:** colored category stripe on left, time range in muted text, title, circular checkbox (24px). Checking fills with success color + checkmark draws in (stroke animation) + card gently fades/strikes. Swipe right to complete, swipe left for edit/delete (mobile).
- **Timeline (day view):** vertical hour grid, "now" line in primary color with a pulsing dot, tasks as rounded blocks colored by category. Auto-scrolls to current time.
- **ProgressRing:** circular ring for day completion with % in center, animated fill.
- **StreakBadge:** flame icon + number, flickers subtly; gray when streak is broken.
- **Heatmap:** 7-row contribution grid, 4 intensity levels of the category/primary color, tooltip on hover/tap.
- **Chips:** category and priority tags, pill-shaped, tinted background.
- **QuickAdd sheet:** bottom sheet (mobile) / modal (desktop). Single input parsing natural text like "DSA 7pm-9pm" into title + time. Below it: category chips, alarm toggle.
- **Toasts:** bottom-center, with Undo for delete/complete.
- **Empty states:** friendly illustration/emoji, one-line message, one primary button.
- **Skeletons** for all loading states (shimmer).

## 6. Motion
- Page transitions: fade + 8px slide, 200ms.
- List items stagger in (30ms offset).
- Checkbox complete: scale pop (1 → 1.15 → 1) + subtle haptic (`navigator.vibrate(10)` where supported).
- Day fully complete: confetti burst (canvas-confetti) + avatar celebration.
- Streak milestone (3/7/14/30/50/100): full-screen celebratory modal with big flame.
- Respect `prefers-reduced-motion`.

## 7. Avatar Design
- Cute, friendly mascot (suggest: a small round fox/owl/robot in violet tones) drawn as inline SVG with 5 mood states: `idle`, `cheering`, `celebrating`, `encouraging`, `sleepy`.
- Gentle idle animation (blink, bob). Bounce on completion.
- Shown as a floating bubble (bottom-right, above tab bar on mobile). Tap → expands speech bubble with message + a quick action button ("Start next task").
- Dashboard hero: larger avatar next to greeting + message in a rounded speech bubble.
- Tone of messages: warm, encouraging, never guilt-tripping. Short (max 2 sentences). Use name "Haripriya" as default user name in messages (editable in Settings).

## 8. Screen Notes
- **Dashboard:** gradient hero card (greeting, date, avatar + message), day ProgressRing, "Next up" task highlighted, goal progress strip with days remaining, top 3 streaks, upcoming reminders, big "Plan Tomorrow" CTA after 6 PM.
- **Planner:** date strip (swipeable week), toggle Timeline/List, floating add button. "Plan Tomorrow" mode shows tomorrow with a calm night-themed header.
- **Stats:** tabs (Habits / Logins / Summary). Big numbers on top (current streak, 30-day rate), heatmap, weekly bar chart. Each habit is a card with a mini sparkline.
- **Reminders:** grouped by "Today / This week / Later", each with countdown chip ("in 2 days"). Color shifts warning → danger as the date nears.
- **Goals:** big goal card with progress arc, "Day X of Y", milestones as a vertical stepper, daily contributions as checklist chips, an "On track / Behind" status pill.
- **Settings:** grouped list, toggles, theme switch (light/dark/system), notification permission helper with clear explanation.

## 9. Microcopy
Friendly and short. Examples: "Plan tomorrow while it's fresh ✨", "3 of 5 done — nice rhythm!", "Missed yesterday? Fresh start today.", empty planner: "Nothing planned yet. Future you will thank you."

## 10. Quality Bar (acceptance)
- Looks polished at 390px and 1280px, in both themes.
- Consistent spacing/typography with the tokens above.
- No default browser-looking controls; all inputs styled.
- Contrast AA, 44px touch targets, visible focus states.
- Every screen has loading, empty, and error states.
