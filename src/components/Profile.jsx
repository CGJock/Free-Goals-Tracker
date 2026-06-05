import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchGoals } from '../api/goals'

const STATUSES = ['not-started', 'in-progress', 'completed', 'failed']

function statusColor(s) {
  switch (s) {
    case 'completed': return 'var(--green)'
    case 'in-progress': return 'var(--amber)'
    case 'failed': return 'var(--red)'
    default: return 'var(--gray)'
  }
}

function statusLabel(s) {
  switch (s) {
    case 'completed': return 'Completed'
    case 'in-progress': return 'In Progress'
    case 'failed': return 'Failed'
    default: return 'Not Started'
  }
}

function pieGradient(byStatus) {
  const entries = STATUSES.filter((s) => byStatus[s] > 0).map((s) => ({ key: s, count: byStatus[s], color: statusColor(s) }))
  const total = entries.reduce((sum, e) => sum + e.count, 0)
  if (total === 0) return 'none'
  let accum = 0
  const stops = entries.map((e) => {
    const start = (accum / total) * 100
    accum += e.count
    const end = (accum / total) * 100
    return `${e.color} ${start}% ${end}%`
  })
  return `conic-gradient(${stops.join(', ')})`
}

function computeStats(goals) {
  const total = goals.length
  const byStatus = { 'not-started': 0, 'in-progress': 0, 'completed': 0, 'failed': 0 }
  let totalSubgoals = 0
  let completedSubgoals = 0
  let totalWithSubgoals = 0

  goals.forEach((g) => {
    byStatus[g.status] = (byStatus[g.status] || 0) + 1
    if (g.subgoals && g.subgoals.length > 0) {
      totalSubgoals += g.subgoals.length
      completedSubgoals += g.subgoals.filter((s) => s.status === 'completed').length
      totalWithSubgoals++
    }
  })

  const goalCompletionRate = total > 0 ? Math.round((byStatus.completed / total) * 100) : 0
  const subgoalCompletionRate = totalSubgoals > 0 ? Math.round((completedSubgoals / totalSubgoals) * 100) : 0

  const byYear = {}
  goals.forEach((g) => {
    const y = g.year || '—'
    if (!byYear[y]) byYear[y] = { total: 0, completed: 0, inProgress: 0, notStarted: 0, failed: 0 }
    byYear[y].total++
    byYear[y][g.status === 'in-progress' ? 'inProgress' : g.status === 'not-started' ? 'notStarted' : g.status]++
  })

  return { total, byStatus, totalSubgoals, completedSubgoals, goalCompletionRate, subgoalCompletionRate, byYear, totalWithSubgoals }
}

export default function Profile() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGoals()
      .then(setGoals)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading profile...</div>

  const stats = computeStats(goals)
  const sortedYears = Object.keys(stats.byYear).sort((a, b) => b - a)

  const recentGoals = [...goals]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  return (
    <div className="profile-page">
      <div className="header-row">
        <h1>Profile</h1>
        <Link to="/" className="btn btn-primary">← Back to Goals</Link>
      </div>

      <div className="profile-summary">
        <div className="stat-card stat-total">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Goals</span>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--green)' }}>
          <span className="stat-value">{stats.byStatus.completed}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--amber)' }}>
          <span className="stat-value">{stats.byStatus['in-progress']}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--red)' }}>
          <span className="stat-value">{stats.byStatus.failed}</span>
          <span className="stat-label">Failed</span>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--gray)' }}>
          <span className="stat-value">{stats.byStatus['not-started']}</span>
          <span className="stat-label">Not Started</span>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-section">
          <h2>Completion Rates</h2>
          <div className="rates">
            <div className="rate-row">
              <span className="rate-label">Goals completed</span>
              <div className="rate-bar-wrap">
                <div className="rate-bar-bg">
                  <div className="rate-bar-fill" style={{ width: `${stats.goalCompletionRate}%`, background: 'var(--green)' }} />
                </div>
                <span className="rate-pct">{stats.goalCompletionRate}%</span>
              </div>
            </div>
            <div className="rate-row">
              <span className="rate-label">Subgoals completed</span>
              <div className="rate-bar-wrap">
                <div className="rate-bar-bg">
                  <div className="rate-bar-fill" style={{ width: `${stats.subgoalCompletionRate}%`, background: 'var(--primary)' }} />
                </div>
                <span className="rate-pct">{stats.subgoalCompletionRate}%</span>
              </div>
            </div>
          </div>
          <div className="subgoal-meta">
            {stats.completedSubgoals} / {stats.totalSubgoals} subgoals done
            {stats.totalWithSubgoals > 0 && ` across ${stats.totalWithSubgoals} goals with subgoals`}
          </div>
        </div>

        <div className="profile-section">
          <h2>Status Distribution</h2>
          {STATUSES.every((s) => stats.byStatus[s] === 0) ? (
            <p className="hint" style={{ padding: '1rem' }}>No goals yet</p>
          ) : (
            <div className="pie-wrap">
              <div className="pie" style={{ background: pieGradient(stats.byStatus) }}>
                <div className="pie-hole">
                  <span className="pie-total">{stats.total}</span>
                  <span className="pie-total-label">goals</span>
                </div>
              </div>
              <div className="pie-legend">
                {STATUSES.filter((s) => stats.byStatus[s] > 0).map((s) => (
                  <div key={s} className="pie-legend-item">
                    <span className="pie-legend-dot" style={{ background: statusColor(s) }} />
                    <span className="pie-legend-label">{statusLabel(s)}</span>
                    <span className="pie-legend-count">{stats.byStatus[s]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {sortedYears.length > 0 && (
          <div className="profile-section">
            <h2>Goals by Year</h2>
            <div className="year-breakdown">
              {sortedYears.map((year) => {
                const y = stats.byYear[year]
                return (
                  <div key={year} className="year-row">
                    <span className="year-label">{year}</span>
                    <div className="year-bar">
                      {y.completed > 0 && <div className="year-bar-seg" style={{ flex: y.completed, background: 'var(--green)', title: `Completed: ${y.completed}` }} />}
                      {y.inProgress > 0 && <div className="year-bar-seg" style={{ flex: y.inProgress, background: 'var(--amber)', title: `In progress: ${y.inProgress}` }} />}
                      {y.notStarted > 0 && <div className="year-bar-seg" style={{ flex: y.notStarted, background: 'var(--gray)', title: `Not started: ${y.notStarted}` }} />}
                      {y.failed > 0 && <div className="year-bar-seg" style={{ flex: y.failed, background: 'var(--red)', title: `Failed: ${y.failed}` }} />}
                    </div>
                    <span className="year-count">{y.total}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="profile-section">
          <h2>Recent Goals</h2>
          {recentGoals.length === 0 ? (
            <p className="hint">No goals created yet.</p>
          ) : (
            <div className="recent-list">
              {recentGoals.map((g) => (
                <Link key={g.id} to={`/goal/${g.id}`} className="recent-item" style={{ '--accent': statusColor(g.status) }}>
                  <span className="recent-dot" style={{ background: statusColor(g.status) }} />
                  <span className="recent-title">{g.title}</span>
                  <span className="recent-date">{new Date(g.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
