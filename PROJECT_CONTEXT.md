# Goals Tracker — Project Context

## Overview

A personal goal-management web app built with React 19 + Vite 8. Users can create yearly goals with subgoals, track progress visually, and manage status through a clean dark-theme UI. Uses json-server as a mock REST backend.

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 19.2.6 |
| Build | Vite 8.0.12 |
| Routing | React Router DOM 7.15.1 |
| Backend | json-server 0.17.4 (port 3001) |
| Linting | ESLint 10.3.0 |
| Language | JavaScript (JSX) — no TypeScript |

## Architecture

```
index.html → src/main.jsx → App.jsx (BrowserRouter)
                                ├─ / → GoalList.jsx         (dashboard)
                                ├─ /create → CreateGoal.jsx (form)
                                └─ /goal/:id → GoalDetail.jsx (detail/edit)

src/api/goals.js → fetch() → json-server (localhost:3001/goals)
```

### Component Tree

```
App
├── GoalList          — fetches all goals, auto-fails overdue ones
│   ├── GoalCard      — displays title, progress bar, status, actions
│   └── SubgoalList   — expandable subgoal list per card
├── CreateGoal        — form with title, desc, year, deadline, dynamic subgoals
└── GoalDetail        — full detail view with inline editing, subgoal management
```

## Data Model (`db.json`)

```json
{
  "goals": [
    {
      "id":          number,
      "title":       string,
      "description": string,
      "status":      "not-started" | "in-progress" | "completed" | "failed",
      "year":        number,
      "deadline":    string (ISO date) | null,
      "createdAt":   string (ISO datetime),
      "subgoals": [
        { "id": number, "title": string, "description": string, "status": "not-started"|"in-progress"|"completed"|"failed" }
      ],
      "media":       array (optional — uploads via /upload/:goalId),
      "cover":       object (optional — cover image)
    }
  ]
}
```

## Routes

| Path | Component | Purpose |
|---|---|---|
| `/` | GoalList | Dashboard with all goals in a grid |
| `/create` | CreateGoal | New goal form |
| `/goal/:id` | GoalDetail | View/edit single goal |

## Scripts

```bash
npm run server    # Express + json-server backend on port 3001 (server.cjs)
npm run dev       # start Vite dev server (port 5173)
npm run build     # production build to dist/
npm run preview   # preview production build
npm run lint      # ESLint check
```

## Current Progress (db.json — snapshot 2026-06-02)

| # | Goal | Status | Year | Deadline | Subgoal Progress |
|---|---|---|---|---|---|
| 1 | Master React Development | in-progress | 2026 | 2026-12-31 | 0/3 (0%) |
| 2 | Get Fit | not-started | 2026 | 2026-06-01 | 0/2 (0%) |
| 3 | Read 12 Books | completed | 2025 | 2025-12-31 | 3/3 (100%) |
| 4 | Licencia de conducir 2026 | in-progress | 2026 | — | 0/3 (0%) |
| 5 | test | failed | 2026 | 2026-05-29 | 0/1 (0%) |
| 6 | Learn guitar | in-progress | 2026 | 2026-12-01 | 0/3 (0%) |
| 7 | Viajar a algun lugar de costa rica | in-progress | 2026 | 2026-12-31 | 0/0 (—) |

**Overall:** 7 goals — 1 completed, 4 in-progress, 1 failed, 1 not-started. 3/15 subgoals completed (20%).

## Notes & Observations

- **Git repo** initialized (4 commits). README customized with Windows/Mac setup instructions.
- **icons.svg** has social media icons (Bluesky, Discord, GitHub, X) not used in the UI.
- **@types/react** installed but no TypeScript used.
- **Media uploads** exist for goal id:8 (1 image + 1 cover image in `media/goals/8/`).
- No state management library — pure React hooks + prop drilling.
- Auto-fail logic runs on GoalList mount and GoalDetail mount (checks deadline). "Get Fit" (deadline 2026-06-01) is overdue but still "not-started" — auto-fail hasn't been triggered since app isn't running.
- Subgoal status cycles: not-started → in-progress → completed → failed → not-started.
- "Viajar a algun lugar de costa rica" (id:8) is the newest goal (added ~2026-05-31), has no subgoals but includes uploaded media and a cover image.
