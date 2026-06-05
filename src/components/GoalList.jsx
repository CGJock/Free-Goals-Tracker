import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchGoals, fetchGoal, deleteGoal, updateGoal, MEDIA_BASE_URL } from '../api/goals'
import { getImportance, IMPORTANCE_LEVELS } from '../utils/importance'
import { getCategory, FALLBACK_ICON } from '../utils/categories'

function computeProgress(subgoals) {
  if (!subgoals || subgoals.length === 0) return 0
  const done = subgoals.filter((s) => s.status === 'completed').length
  return Math.round((done / subgoals.length) * 100)
}

function statusColor(status) {
  switch (status) {
    case 'completed': return 'var(--green)'
    case 'in-progress': return 'var(--amber)'
    case 'failed': return 'var(--red)'
    default: return 'var(--gray)'
  }
}

function statusLabel(status) {
  switch (status) {
    case 'completed': return 'Completed'
    case 'in-progress': return 'In Progress'
    case 'failed': return 'Failed'
    default: return 'Not Started'
  }
}

function subgoalIcon(status) {
  switch (status) {
    case 'completed': return '✓'
    case 'in-progress': return '◌'
    case 'failed': return '✗'
    default: return '○'
  }
}

function subgoalLabel(status) {
  switch (status) {
    case 'completed': return 'Done'
    case 'in-progress': return 'Doing'
    case 'failed': return 'Failed'
    default: return 'Todo'
  }
}

function isOverdue(goal) {
  if (!goal.deadline || goal.status === 'completed' || goal.status === 'failed') return false
  return new Date(goal.deadline) < new Date()
}

function formatDate(iso) {
  if (!iso) return null
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function remainingInfo(deadline, createdAt) {
  if (!deadline) return null
  const now = new Date()
  const end = new Date(deadline)
  const remaining = end - now
  const days = Math.ceil(remaining / (1000 * 60 * 60 * 24))
  if (days <= 0) return { days: 0, percent: 0, color: 'var(--red)' }
  const start = createdAt ? new Date(createdAt) : now
  const total = end - start
  const percent = total > 0 ? Math.min(100, Math.max(0, (remaining / total) * 100)) : 100
  let color
  if (percent >= 80) color = 'var(--green)'
  else if (percent >= 50) color = 'var(--amber)'
  else if (percent >= 30) color = 'var(--orange)'
  else color = 'var(--red)'
  return { days, percent: Math.round(percent), color }
}

const subgoalStatuses = ['not-started', 'in-progress', 'completed', 'failed']

function SubgoalList({ subgoals, goalId, onToggle, editSgId, editSgTitle, editSgDescription, editSgDeadline, onStartEdit, onSave, onCancelEdit, onDeadlineChange, onDescriptionChange, goalCreatedAt }) {
  return (
    <div className="subgoal-expand">
      {subgoals.map((sg) => {
        const sgRemaining = sg.deadline && sg.status !== 'completed' && sg.status !== 'failed'
          ? remainingInfo(sg.deadline, sg.createdAt || goalCreatedAt) : null
        return (
        <div key={sg.id} className={`subgoal-expand-item ${sg.status}${editSgId === sg.id ? ' editing' : ''}`}>
          <span className="subgoal-expand-icon" title="Click to cycle status" onClick={() => onToggle(goalId, sg.id)} style={{
            background: sg.status === 'completed' ? 'var(--green)' :
              sg.status === 'in-progress' ? 'var(--amber)' :
              sg.status === 'failed' ? 'var(--red)' : 'var(--gray)',
            cursor: 'pointer'
          }}>
            {subgoalIcon(sg.status)}
          </span>
          <div className="subgoal-expand-text">
            {editSgId === sg.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
                <input
                  className="subgoal-expand-input"
                  value={editSgTitle}
                  onChange={(e) => onStartEdit(sg.id, e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') onSave(goalId, sg.id); if (e.key === 'Escape') onCancelEdit() }}
                  autoFocus
                />
                <textarea
                  className="subgoal-edit-textarea"
                  value={editSgDescription}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Escape') onCancelEdit() }}
                  placeholder="Optional description"
                  rows={2}
                  style={{ fontSize: '0.8rem' }}
                />
                <input
                  type="date"
                  className="subgoal-expand-input"
                  value={editSgDeadline}
                  onChange={(e) => onDeadlineChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Escape') onCancelEdit() }}
                  style={{ fontSize: '0.8rem', width: 'auto' }}
                />
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <button className="btn btn-sm btn-primary" title="Save subgoal" onClick={() => onSave(goalId, sg.id)} style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}>Save</button>
                  <button className="btn btn-sm btn-secondary" title="Discard changes" onClick={onCancelEdit} style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <span className="subgoal-expand-title" onDoubleClick={() => onStartEdit(sg.id, sg.title, sg.deadline, sg.description)}>{sg.title}</span>
            )}
            {sg.description && editSgId !== sg.id && (
              <span className="subgoal-expand-desc">{sg.description}</span>
            )}
            {sg.deadline && editSgId !== sg.id && (
              <span className={`subgoal-deadline-badge ${!sgRemaining || sgRemaining.days === 0 ? 'overdue' : ''}`}>
                {formatDate(sg.deadline)}
                {sgRemaining && <span className="days-pill" style={{ background: sgRemaining.color }}>{sgRemaining.days}d</span>}
              </span>
            )}
          </div>
          <span className="subgoal-expand-status">{subgoalLabel(sg.status)}</span>
          {editSgId !== sg.id && (
            <button className="btn-icon-subgoal edit" onClick={() => onStartEdit(sg.id, sg.title, sg.deadline, sg.description)} title="Edit subgoal">✏</button>
          )}
        </div>
        )
      })}
    </div>
  )
}

export default function GoalList() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editSgId, setEditSgId] = useState(null)
  const [editSgTitle, setEditSgTitle] = useState('')
  const [editSgDescription, setEditSgDescription] = useState('')
  const [editSgDeadline, setEditSgDeadline] = useState('')
  const [view, setView] = useState(() => localStorage.getItem('goals-view') || 'grid')
  const [sortBy, setSortBy] = useState(() => localStorage.getItem('goals-sort') || 'default')
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [activeMonth, setActiveMonth] = useState(null)

  function changeView(v) {
    setView(v)
    localStorage.setItem('goals-view', v)
    setActiveMonth(null)
  }

  function handleSortChange(e) {
    const v = e.target.value
    setSortBy(v)
    localStorage.setItem('goals-sort', v)
  }

  function getSorted(list) {
    if (sortBy === 'default') return list
    const copy = [...list]
    const importanceIndex = {}
    IMPORTANCE_LEVELS.forEach((l, i) => { importanceIndex[l.value] = i })
    copy.sort((a, b) => {
      const ia = importanceIndex[a.importance] ?? 2
      const ib = importanceIndex[b.importance] ?? 2
      return sortBy === 'importance-asc' ? ia - ib : ib - ia
    })
    return copy
  }

  useEffect(() => {
    fetchGoals()
      .then((data) => applyAutoFail(data))
      .then((data) => setGoals(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function applyAutoFail(goals) {
    const now = new Date()
    let changed = false
    const updated = goals.map((g) => {
      if (g.deadline && g.status !== 'completed' && g.status !== 'failed') {
        if (new Date(g.deadline) < now) {
          changed = true
          return { ...g, status: 'failed' }
        }
      }
      return g
    })
    if (changed) {
      await Promise.all(updated.map((g) => updateGoal(g.id, { status: g.status })))
    }
    return updated
  }

  async function handleDelete(id) {
    if (!confirm('Delete this goal?')) return
    await deleteGoal(id)
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  async function handleStatus(goal, newStatus) {
    const label = statusLabel(newStatus)
    if (!confirm(`Mark this goal as "${label}"?`)) return
    const updated = await updateGoal(goal.id, { status: newStatus })
    setGoals((prev) => prev.map((g) => (g.id === goal.id ? updated : g)))
  }

  async function handleSubgoalToggle(goalId, subgoalId) {
    const current = await fetchGoal(goalId)
    const subgoal = current.subgoals.find((sg) => sg.id === subgoalId)
    if (!subgoal) return
    const idx = subgoalStatuses.indexOf(subgoal.status)
    const nextStatus = subgoalStatuses[(idx + 1) % subgoalStatuses.length]
    const newSubgoals = current.subgoals.map((sg) =>
      sg.id === subgoalId ? { ...sg, status: nextStatus } : sg
    )
    const updates = { subgoals: newSubgoals }
    if (nextStatus === 'in-progress' && current.status === 'not-started') {
      updates.status = 'in-progress'
    }
    const updatedGoal = await updateGoal(goalId, updates)
    setGoals((prev) => prev.map((g) =>
      g.id === goalId ? { ...g, ...updatedGoal, subgoals: newSubgoals } : g
    ))
  }

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  function startEdit(goal) {
    setEditingId(goal.id)
    setEditTitle(goal.title)
    setEditDescription(goal.description || '')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditTitle('')
    setEditDescription('')
  }

  async function saveEdit(goalId) {
    if (!editTitle.trim()) return
    await updateGoal(goalId, { title: editTitle.trim(), description: editDescription.trim() })
    setGoals((prev) => prev.map((g) =>
      g.id === goalId ? { ...g, title: editTitle.trim(), description: editDescription.trim() } : g
    ))
    setEditingId(null)
  }

  function startEditSg(sgId, title, deadline, description) {
    setEditSgId(sgId)
    setEditSgTitle(title)
    if (arguments.length >= 4) {
      setEditSgDescription(description || '')
    }
    if (arguments.length >= 3) {
      setEditSgDeadline(deadline ? deadline.slice(0, 10) : '')
    }
  }

  function cancelEditSg() {
    setEditSgId(null)
    setEditSgTitle('')
    setEditSgDescription('')
    setEditSgDeadline('')
  }

  async function saveSubgoalTitle(goalId, sgId) {
    if (!editSgTitle.trim()) return
    const current = await fetchGoal(goalId)
    const newSubgoals = current.subgoals.map((sg) =>
      sg.id === sgId ? { ...sg, title: editSgTitle.trim(), description: editSgDescription.trim(), deadline: editSgDeadline || null } : sg
    )
    await updateGoal(goalId, { subgoals: newSubgoals })
    setGoals((prev) => prev.map((g) =>
      g.id === goalId ? { ...g, subgoals: newSubgoals } : g
    ))
    setEditSgId(null)
  }

  if (loading) return <div className="loading">Loading goals...</div>

  return (
    <div className="goal-list">
      <div className="header-row">
        <h1>Yearly Goals</h1>
        <div className="header-actions">
          <div className="view-switcher">
            <button className={`view-btn${view === 'grid' ? ' active' : ''}`} onClick={() => changeView('grid')} title="Grid">⊞</button>
            <button className={`view-btn${view === 'list' ? ' active' : ''}`} onClick={() => changeView('list')} title="List">☰</button>
            <button className={`view-btn${view === 'squares' ? ' active' : ''}`} onClick={() => changeView('squares')} title="Squares">⊡</button>
            <button className={`view-btn${view === 'calendar' ? ' active' : ''}`} onClick={() => changeView('calendar')} title="Calendar">▦</button>
          </div>
          <select className="sort-select" value={sortBy} onChange={handleSortChange} title="Sort goals">
            <option value="default">Sort: Default</option>
            <option value="importance-asc">Sort: Importance ↑</option>
            <option value="importance-desc">Sort: Importance ↓</option>
          </select>
          <Link to="/profile" className="btn btn-primary">Profile</Link>
          <Link to="/create" className="btn btn-primary">+ New Goal</Link>
        </div>
      </div>
      {/* ── GRID VIEW ── */}
      {view === 'grid' && (
        <div className="goals-grid">
          {getSorted(goals).map((goal) => {
            const progress = computeProgress(goal.subgoals)
            const overdue = isOverdue(goal)
            return (
              <div key={goal.id} className={`goal-card ${overdue ? 'overdue' : ''}`} style={{ '--accent': statusColor(goal.status) }}>
                {editingId !== goal.id && (
                  <button className="btn-card-edit" onClick={() => startEdit(goal)} title="Edit goal">✏</button>
                )}
                {goal.cover && (
                  <div className="card-cover">
                    <img src={`${MEDIA_BASE_URL}/${goal.id}/${goal.cover.filename}`} alt="cover" />
                  </div>
                )}
                <div className="card-top">
                  {(() => { const imp = getImportance(goal.importance); return (
                    <span className="importance-badge" style={{ background: imp.color }} title={imp.label}>{imp.emoji}</span>
                  )})()}
                  <span className="year-badge">{goal.year}</span>
                  {goal.deadline && (
                    <span className={`deadline-badge ${overdue ? 'overdue' : ''}`}>
                      <span className="deadline-label">Deadline</span>
                      <span className="deadline-date">
                        {overdue ? '⚠ ' : ''}{formatDate(goal.deadline)}
                        {(() => {
                          const ri = remainingInfo(goal.deadline, goal.createdAt)
                          return ri ? <span className="days-pill" style={{ background: ri.color }}>{ri.days}d</span> : null
                        })()}
                      </span>
                    </span>
                  )}
                  <span className="status-badge" style={{ background: statusColor(goal.status) }}>
                    {statusLabel(goal.status)}
                  </span>
                </div>
                {editingId === goal.id ? (
                  <div className="card-edit-fields">
                    <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" className="card-edit-input" />
                    <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={2} placeholder="Description" className="card-edit-textarea" />
                    <div className="card-edit-actions">
                      <button className="btn btn-sm btn-primary" onClick={() => saveEdit(goal.id)} title="Save changes">Save</button>
                      <button className="btn btn-sm btn-secondary" onClick={cancelEdit} title="Discard changes">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="card-body-row">
                    <div className="card-body-text">
                      <Link to={`/goal/${goal.id}`} className="card-title">{goal.title}</Link>
                      <p className="card-desc">{goal.description}</p>
                    </div>
                    {(() => { const cat = getCategory(goal.category); const Icon = cat ? cat.Icon : FALLBACK_ICON; return (
                      <span className={`card-cat-icon${cat ? '' : ' fallback'}`} title={cat ? cat.label : 'No category'}>
                        <Icon size={22} />
                      </span>
                    )})()}
                  </div>
                )}
                {goal.subgoals && goal.subgoals.length > 0 && (
                  <div className="progress-section">
                    <div className="progress-header">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="subgoal-count">
                      {goal.subgoals.filter((s) => s.status === 'completed').length} / {goal.subgoals.length} subgoals
                    </span>
                  </div>
                )}
                {goal.subgoals && goal.subgoals.length > 0 && (
                  <>
                    <button className="btn btn-sm see-subgoals-btn" title={expandedId === goal.id ? 'Hide subgoals' : 'Show subgoals'} onClick={() => toggleExpand(goal.id)}>
                      {expandedId === goal.id ? '▲ Hide Subgoals' : '▼ See Subgoals'}
                    </button>
                    {expandedId === goal.id && (
                      <SubgoalList
                        subgoals={goal.subgoals}
                        goalId={goal.id}
                        onToggle={handleSubgoalToggle}
                        editSgId={editSgId}
                        editSgTitle={editSgTitle}
                        editSgDescription={editSgDescription}
                        editSgDeadline={editSgDeadline}
                        onStartEdit={startEditSg}
                        onSave={saveSubgoalTitle}
                        onCancelEdit={cancelEditSg}
                        onDeadlineChange={setEditSgDeadline}
                        onDescriptionChange={setEditSgDescription}
                        goalCreatedAt={goal.createdAt}
                      />
                    )}
                  </>
                )}
                <div className="card-actions">
                  {goal.status === 'completed' || goal.status === 'failed' ? (
                    <button className="btn btn-sm" title="Reset to not started" onClick={() => handleStatus(goal, 'not-started')}>↻ Reset</button>
                  ) : (
                    <>
                      <button className="btn btn-sm btn-success" title="Mark as accomplished" onClick={() => handleStatus(goal, 'completed')}>✓ Accomplished</button>
                      <button className="btn btn-sm btn-danger" title="Mark as failed" onClick={() => handleStatus(goal, 'failed')}>✗ Failed</button>
                    </>
                  )}
                  <button className="btn btn-sm btn-danger" title="Delete goal" onClick={() => handleDelete(goal.id)}>🗑</button>
                </div>
              </div>
            )
          })}
          {goals.length === 0 && (
            <div className="empty-state">
              <h2>No goals yet</h2>
              <p>Create your first goal to get started!</p>
              <Link to="/create" className="btn btn-primary">Create Goal</Link>
            </div>
          )}
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <div className="goals-list">
          {getSorted(goals).map((goal) => {
            const progress = computeProgress(goal.subgoals)
            const overdue = isOverdue(goal)
            const ri = goal.deadline ? remainingInfo(goal.deadline, goal.createdAt) : null
            return (
              <div key={goal.id} className={`goal-list-row ${overdue ? 'overdue' : ''}`} style={{ '--accent': statusColor(goal.status) }}>
                {goal.cover
                  ? <img src={`${MEDIA_BASE_URL}/${goal.id}/${goal.cover.filename}`} alt="" className="list-thumb" />
                  : <div className="list-thumb-placeholder" style={{ background: statusColor(goal.status) }}>{goal.title[0]}</div>
                }
                <Link to={`/goal/${goal.id}`} className="list-title">{goal.title}</Link>
                <div className="list-badges">
                  {(() => { const imp = getImportance(goal.importance); return (
                    <span className="importance-badge" style={{ background: imp.color }} title={imp.label}>{imp.emoji}</span>
                  )})()}
                  <span className="year-badge">{goal.year}</span>
                  {goal.deadline && (
                    <span className={`deadline-badge ${overdue ? 'overdue' : ''}`}>
                      <span className="deadline-label">Deadline</span>
                      <span className="deadline-date">
                        {overdue ? '⚠ ' : ''}{formatDate(goal.deadline)}
                        {ri && <span className="days-pill" style={{ background: ri.color }}>{ri.days}d</span>}
                      </span>
                    </span>
                  )}
                  <span className="status-badge" style={{ background: statusColor(goal.status) }}>{statusLabel(goal.status)}</span>
                </div>
                <div className="list-progress">
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
                  <span className="list-progress-pct">{progress}%</span>
                </div>
                {(() => { const cat = getCategory(goal.category); const Icon = cat ? cat.Icon : FALLBACK_ICON; return (
                  <span className={`list-cat-icon${cat ? '' : ' fallback'}`} title={cat ? cat.label : 'No category'}>
                    <Icon size={18} />
                  </span>
                )})()}
              </div>
            )
          })}
          {goals.length === 0 && (
            <div className="empty-state">
              <h2>No goals yet</h2>
              <p>Create your first goal to get started!</p>
              <Link to="/create" className="btn btn-primary">Create Goal</Link>
            </div>
          )}
        </div>
      )}

      {/* ── SQUARES VIEW ── */}
      {view === 'squares' && (
        <div className="goals-squares">
          {getSorted(goals).map((goal) => {
            const progress = computeProgress(goal.subgoals)
            return (
              <Link key={goal.id} to={`/goal/${goal.id}`} className="goal-square">
                {goal.cover
                  ? <img src={`${MEDIA_BASE_URL}/${goal.id}/${goal.cover.filename}`} alt="" className="square-img" />
                  : <div className="square-img square-placeholder" style={{ background: statusColor(goal.status) }}>{goal.title[0]}</div>
                }
                <div className="square-footer">
                  <span className="square-title">{goal.title}</span>
                  <div className="square-meta">
                    <span className="square-dot" style={{ background: statusColor(goal.status) }} />
                    <span className="square-pct">{progress}%</span>
                    {(() => { const cat = getCategory(goal.category); const Icon = cat ? cat.Icon : FALLBACK_ICON; return (
                      <span className={`square-cat${cat ? '' : ' fallback'}`} title={cat ? cat.label : 'No category'}><Icon size={12} /></span>
                    )})()}
                    <span style={{ marginLeft: 'auto', fontSize: '0.85rem' }} title={getImportance(goal.importance).label}>{getImportance(goal.importance).emoji}</span>
                  </div>
                </div>
              </Link>
            )
          })}
          {goals.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <h2>No goals yet</h2>
              <p>Create your first goal to get started!</p>
              <Link to="/create" className="btn btn-primary">Create Goal</Link>
            </div>
          )}
        </div>
      )}

      {/* ── CALENDAR VIEW ── */}
      {view === 'calendar' && (() => {
        const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
        const noDeadline = getSorted(goals).filter(g => !g.deadline)
        const byMonth = MONTH_NAMES.map((name, i) => ({
          name,
          index: i,
          goals: getSorted(goals).filter(g => {
            if (!g.deadline) return false
            const d = new Date(g.deadline)
            return d.getFullYear() === calYear && d.getMonth() === i
          })
        }))
        const activeGoals = activeMonth !== null ? byMonth[activeMonth].goals : []
        return (
          <div className="calendar-wrap">
            <div className="calendar-nav">
              <button className="btn btn-sm" title={`Go to ${calYear - 1}`} onClick={() => { setCalYear(y => y - 1); setActiveMonth(null) }}>← {calYear - 1}</button>
              <span className="calendar-year">{calYear}</span>
              <button className="btn btn-sm" title={`Go to ${calYear + 1}`} onClick={() => { setCalYear(y => y + 1); setActiveMonth(null) }}>{calYear + 1} →</button>
            </div>
            <div className="calendar-grid">
              {byMonth.map((m) => (
                <div
                  key={m.index}
                  className={`calendar-month${activeMonth === m.index ? ' active' : ''}${m.goals.length === 0 ? ' empty' : ''}`}
                  onClick={() => setActiveMonth(activeMonth === m.index ? null : m.index)}
                >
                  <div className="cal-month-name">{m.name}</div>
                  {m.goals.length === 0
                    ? <span className="cal-empty-hint">No goals</span>
                    : (
                      <div className="cal-goal-dots">
                        {m.goals.map(g => (
                          <span key={g.id} className="cal-dot" style={{ background: statusColor(g.status) }} title={g.title} />
                        ))}
                      </div>
                    )
                  }
                  {m.goals.length > 0 && <span className="cal-count">{m.goals.length} goal{m.goals.length > 1 ? 's' : ''}</span>}
                </div>
              ))}
            </div>
            {activeMonth !== null && (
              <div className="cal-detail">
                <h3 className="cal-detail-title">{MONTH_NAMES[activeMonth]} {calYear}</h3>
                {activeGoals.length === 0
                  ? <p className="hint">No goals due this month.</p>
                  : activeGoals.map(g => {
                    const progress = computeProgress(g.subgoals)
                    return (
                      <div key={g.id} className="cal-goal-row" style={{ '--accent': statusColor(g.status) }}>
                        {g.cover
                          ? <img src={`${MEDIA_BASE_URL}/${g.id}/${g.cover.filename}`} alt="" className="list-thumb" />
                          : <div className="list-thumb-placeholder" style={{ background: statusColor(g.status) }}>{g.title[0]}</div>
                        }
                        <div className="cal-goal-info">
                          <Link to={`/goal/${g.id}`} className="cal-goal-title">{g.title}</Link>
                          <div className="list-badges">
                            <span className="deadline-badge">{formatDate(g.deadline)}</span>
                            <span className="status-badge" style={{ background: statusColor(g.status) }}>{statusLabel(g.status)}</span>
                          </div>
                          <div className="list-progress">
                            <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
                            <span className="list-progress-pct">{progress}%</span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            )}
            {noDeadline.length > 0 && (
              <div className="cal-no-deadline">
                <h3 className="cal-detail-title">No deadline set</h3>
                {noDeadline.map(g => (
                  <div key={g.id} className="cal-goal-row" style={{ '--accent': statusColor(g.status) }}>
                    {g.cover
                      ? <img src={`${MEDIA_BASE_URL}/${g.id}/${g.cover.filename}`} alt="" className="list-thumb" />
                      : <div className="list-thumb-placeholder" style={{ background: statusColor(g.status) }}>{g.title[0]}</div>
                    }
                    <div className="cal-goal-info">
                      <Link to={`/goal/${g.id}`} className="cal-goal-title">{g.title}</Link>
                      <span className="status-badge" style={{ background: statusColor(g.status) }}>{statusLabel(g.status)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })()}
    </div>
  )
}
