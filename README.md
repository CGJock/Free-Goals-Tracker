# Free Goals Tracker

A personal goal-management web app built with React 19 + Vite. Track yearly goals and subgoals, visualize progress, attach media, and stay on top of deadlines — all running locally on your machine.

## Features

- Create goals with subgoals, deadlines, and importance levels
- 4 view modes: Grid, List, Squares, Calendar
- Media uploads (images & videos) per goal
- Cover images for goals
- Auto-fail goals when their deadline passes
- Progress tracking via subgoal completion

## Requirements

- [Node.js](https://nodejs.org/) v18 or higher (includes npm)

### Check if Node.js is installed

Open a terminal and run:

```bash
node -v
npm -v
```

If you see version numbers (e.g. `v20.x.x`), you're good to go.  
If you get a "command not found" error, [download Node.js here](https://nodejs.org/en/download) and install it, then re-run the commands above to confirm.

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/CGJock/Free-Goals-Tracker.git
cd Free-Goals-Tracker

# 2. Install dependencies
npm install

# 3. Start the backend (port 3001) — in one terminal
npm run server

# 4. Start the frontend (port 5173) — in another terminal
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

> `db.json` is created automatically on first run — no setup needed.

## Scripts

| Command | Description |
|---|---|
| `npm run server` | Start Express + json-server backend on port 3001 |
| `npm run dev` | Start Vite dev server on port 5173 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Tech Stack

- **Frontend:** React 19, Vite, React Router DOM
- **Backend:** Express + json-server (mock REST API)
- **Styling:** CSS custom properties, dark theme
- **Storage:** Local `db.json` + `media/` folder
