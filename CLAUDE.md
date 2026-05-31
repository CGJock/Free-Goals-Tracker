# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

Two processes must run concurrently:

```bash
npm run server   # Express + json-server backend on :3001 (server.cjs)
npm run dev      # Vite dev server on :5173
```

Other commands:

```bash
npm run build    # Production build → dist/
npm run preview  # Serve production build locally
npm run lint     # ESLint check
```

No test framework is configured.

## Architecture

**Stack**: React 19 SPA + Vite + React Router DOM + json-server (mock backend)  
**Language**: JavaScript (JSX) — no TypeScript despite `@types/react` being installed  
**State**: React hooks only (`useState`, `useEffect`) with prop drilling — no Context or Redux

**Data flow**: Components → `src/api/goals.js` (fetch wrappers) → `GET/POST/PATCH/DELETE http://localhost:3001/goals` → `db.json`  
**Media flow**: `POST /upload/:goalId` (multer, 50 MB limit) → `media/goals/{id}/` on disk + `goal.media[]` in db.json → served statically at `/media/goals/{id}/{filename}`

**Routes**:
- `/` — `GoalList`: dashboard grid of all goal cards
- `/create` — `CreateGoal`: form with dynamic subgoal creation
- `/goal/:id` — `GoalDetail`: full view with inline editing and subgoal CRUD

## Data Model

Goals live in `db.json` under a `"goals"` array:

```js
{
  id, title, description, year,
  status: "not-started" | "in-progress" | "completed" | "failed",
  deadline: ISO string | null,
  createdAt: ISO string,
  subgoals: [{ id, title, description, deadline, status, createdAt }]
}
```

Subgoals are nested inside their parent goal (not a separate collection). All persistence goes through json-server PATCH calls that replace the entire `subgoals` array.

## Key Behaviors

**Auto-fail**: On `GoalList` and `GoalDetail` mount, any goal/subgoal with a past deadline and non-terminal status is automatically PATCHed to `"failed"`.

**Progress**: Computed as `completedSubgoals / totalSubgoals` — displayed as a bar on cards and the detail view.

**Subgoal status cycle**: Clicking a status icon cycles not-started → in-progress → completed → failed → not-started. Marking a subgoal in-progress auto-promotes a not-started parent goal to in-progress.

**Inline editing**: Double-click a title to edit; Enter saves, Escape cancels.

## Styling

CSS custom properties defined in `src/index.css` (dark theme only):
- Colors: `--primary`, `--green`, `--amber`, `--orange`, `--red`, `--gray`
- Surfaces: `--background`, `--surface`, `--surface2`
- Text: `--text`, `--text-muted`

Goal card border color reflects status; deadline countdown color transitions green → amber → orange → red as the deadline approaches.
