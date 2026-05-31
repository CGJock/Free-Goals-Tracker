# Free Goals Tracker

A personal goal-management web app built with React 19 + Vite. Track yearly goals and subgoals, visualize progress, attach media, and stay on top of deadlines — all running locally on your machine.

## Features

- Create goals with subgoals, deadlines, and importance levels
- 4 view modes: Grid, List, Squares, Calendar
- Media uploads (images & videos) per goal
- Cover images for goals
- Auto-fail goals when their deadline passes
- Progress tracking via subgoal completion

---

## Windows Setup

### 1. Check if Node.js is installed

Open **Command Prompt** or **PowerShell** and run:

```bash
node -v
npm -v
```

If you see version numbers (e.g. `v20.x.x`), skip to step 2.  
If you get an error, [download Node.js for Windows here](https://nodejs.org/en/download), run the installer, then re-run the commands above to confirm.

### 2. Clone and run

Open **Command Prompt** or **PowerShell**:

```bash
git clone https://github.com/CGJock/Free-Goals-Tracker.git
cd Free-Goals-Tracker
npm install
```

Then open **two separate terminal windows** in the project folder and run one command in each:

```bash
# Terminal 1 — backend
npm run server

# Terminal 2 — frontend
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Mac Setup

### 1. Check if Node.js is installed

Open **Terminal** and run:

```bash
node -v
npm -v
```

If you see version numbers (e.g. `v20.x.x`), skip to step 2.  
If you get an error, [download Node.js for Mac here](https://nodejs.org/en/download), run the `.pkg` installer, then re-run the commands above to confirm.

> Alternatively, if you use Homebrew: `brew install node`

### 2. Clone and run

In **Terminal**:

```bash
git clone https://github.com/CGJock/Free-Goals-Tracker.git
cd Free-Goals-Tracker
npm install
```

Then open **two separate terminal tabs** (`Cmd + T`) in the project folder and run one command in each:

```bash
# Terminal 1 — backend
npm run server

# Terminal 2 — frontend
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

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
