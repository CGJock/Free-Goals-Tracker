import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchGoal, updateGoal, deleteGoal, uploadMedia, deleteMedia, uploadCover, deleteCover, MEDIA_BASE_URL } from '../api/goals'
import { IMPORTANCE_LEVELS, DEFAULT_IMPORTANCE, getImportance } from '../utils/importance'

function computeProgress(subgoals) {
  if (!subgoals || subgoals.length === 0) return 0
  const done = subgoals.filter((s) => s.status === 'completed').length
  return Math.round((done / subgoals.length) * 100)
}

const statuses = ['not-started', 'in-progress', 'completed', 'failed']

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

function subgoalIcon(s) {
  switch (s) {
    case 'completed': return '✓'
    case 'in-progress': return '◌'
    case 'failed': return '✗'
    default: return '○'
  }
}

function subgoalLabel(s) {
  switch (s) {
    case 'completed': return 'Done'
    case 'in-progress': return 'Doing'
    case 'failed': return 'Failed'
    default: return 'Todo'
  }
}

function toDateInput(iso) {
  if (!iso) return ''
  return iso.slice(0, 10)
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

export default function GoalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [goal, setGoal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [importance, setImportance] = useState(DEFAULT_IMPORTANCE)
  const [editSgId, setEditSgId] = useState(null)
  const [editSgTitle, setEditSgTitle] = useState('')
  const [editSgDescription, setEditSgDescription] = useState('')
  const [editSgDeadline, setEditSgDeadline] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const coverInputRef = useRef(null)

  useEffect(() => {
    loadGoal()
  }, [id])

  useEffect(() => {
    if (goal) {
      setTitle(goal.title)
      setDescription(goal.description || '')
      setDeadline(toDateInput(goal.deadline))
      setImportance(goal.importance || DEFAULT_IMPORTANCE)
    }
  }, [goal])

  async function loadGoal() {
    try {
      const data = await fetchGoal(id)
      const now = new Date()
      if (data.deadline && data.status !== 'completed' && data.status !== 'failed') {
        if (new Date(data.deadline) < now) {
          const updated = await updateGoal(data.id, { status: 'failed' })
          setGoal(updated)
          return
        }
      }
      setGoal(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(newStatus) {
    const label = statusLabel(newStatus)
    if (!confirm(`Change status to "${label}"?`)) return
    const updated = await updateGoal(goal.id, { status: newStatus })
    setGoal(updated)
  }

  async function handleSubgoalToggle(subgoalId) {
    const current = await fetchGoal(goal.id)
    const subgoal = current.subgoals.find((sg) => sg.id === subgoalId)
    if (!subgoal) return
    const idx = statuses.indexOf(subgoal.status)
    const nextStatus = statuses[(idx + 1) % statuses.length]
    const newSubgoals = current.subgoals.map((sg) =>
      sg.id === subgoalId ? { ...sg, status: nextStatus } : sg
    )
    const updates = { subgoals: newSubgoals }
    if (nextStatus === 'in-progress' && current.status === 'not-started') {
      updates.status = 'in-progress'
    }
    const result = await updateGoal(goal.id, updates)
    setGoal(result)
  }

  async function handleSave() {
    const updated = await updateGoal(goal.id, { title, description, deadline: deadline || null, importance })
    setGoal(updated)
    setEditing(false)
  }

  async function handleDelete() {
    if (!confirm('Delete this goal permanently?')) return
    await deleteGoal(goal.id)
    navigate('/')
  }

  function cancelEditSg() {
    setEditSgId(null)
    setEditSgTitle('')
    setEditSgDescription('')
    setEditSgDeadline('')
  }

  function startEditSg(sg) {
    setEditSgId(sg.id)
    setEditSgTitle(sg.title)
    setEditSgDescription(sg.description || '')
    setEditSgDeadline(sg.deadline ? sg.deadline.slice(0, 10) : '')
  }

  async function saveSubgoalTitle(sgId) {
    if (!editSgTitle.trim()) return
    const current = await fetchGoal(goal.id)
    const newSubgoals = current.subgoals.map((sg) =>
      sg.id === sgId
        ? { ...sg, title: editSgTitle.trim(), description: editSgDescription.trim(), deadline: editSgDeadline || null }
        : sg
    )
    const result = await updateGoal(goal.id, { subgoals: newSubgoals })
    setGoal(result)
    cancelEditSg()
  }

  async function removeSubgoal(sgId) {
    if (!confirm('Remove this subgoal?')) return
    const current = await fetchGoal(goal.id)
    const newSubgoals = current.subgoals.filter((sg) => sg.id !== sgId)
    const result = await updateGoal(goal.id, { subgoals: newSubgoals })
    setGoal(result)
  }

  async function addSubgoal() {
    const current = await fetchGoal(goal.id)
    const newSg = { id: Date.now() + Math.random(), title: 'New subgoal', description: '', deadline: null, createdAt: new Date().toISOString(), status: 'not-started' }
    const newSubgoals = [...(current.subgoals || []), newSg]
    const result = await updateGoal(goal.id, { subgoals: newSubgoals })
    setGoal(result)
    startEditSg(newSg)
  }

  async function handleCoverUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    try {
      await uploadCover(goal.id, file)
      const updated = await fetchGoal(goal.id)
      setGoal(updated)
    } catch (err) {
      console.error(err)
    } finally {
      e.target.value = ''
    }
  }

  async function handleRemoveCover() {
    if (!confirm('Remove cover image?')) return
    await deleteCover(goal.id)
    const updated = await fetchGoal(goal.id)
    setGoal(updated)
  }

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadMedia(goal.id, file)
      const updated = await fetchGoal(goal.id)
      setGoal(updated)
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleDeleteMedia(filename) {
    if (!confirm('Remove this file?')) return
    await deleteMedia(goal.id, filename)
    const updated = await fetchGoal(goal.id)
    setGoal(updated)
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!goal) return <div className="loading">Goal not found</div>

  const progress = computeProgress(goal.subgoals)
  const overdue = goal.deadline && goal.status !== 'completed' && goal.status !== 'failed' && new Date(goal.deadline) < new Date()

  return (
    <div className="detail-page">
      <button className="btn btn-back" title="Back to goals list" onClick={() => navigate('/')}>← Back</button>
      <div className="detail-card">
        {goal.cover ? (
          <div className="detail-cover">
            <img src={`${MEDIA_BASE_URL}/${goal.id}/${goal.cover.filename}`} alt="cover" />
            <div className="cover-overlay">
              <button className="btn btn-sm" title="Change cover image" onClick={() => coverInputRef.current?.click()}>Change</button>
              <button className="btn btn-sm btn-danger" title="Remove cover image" onClick={handleRemoveCover}>Remove</button>
            </div>
            <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} />
          </div>
        ) : (
          <div className="cover-placeholder" onClick={() => coverInputRef.current?.click()}>
            + Add Cover Image
            <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} />
          </div>
        )}
        <div className="detail-header">
          {editing ? (
            <div className="edit-fields">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Description" />
              <div className="form-group">
                <label>Deadline</label>
                <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Importance</label>
                <div className="importance-selector">
                  {IMPORTANCE_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      className={`importance-btn${importance === level.value ? ' active' : ''}`}
                      style={importance === level.value ? { background: level.color, borderColor: level.color } : {}}
                      onClick={() => setImportance(level.value)}
                      title={level.label}
                    >
                      {level.emoji} {level.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Cover Photo</label>
                <div className="cover-edit-row">
                  {goal.cover ? (
                    <>
                      <img
                        src={`${MEDIA_BASE_URL}/${goal.id}/${goal.cover.filename}`}
                        alt="cover"
                        className="cover-thumb"
                      />
                      <div className="cover-edit-btns">
                        <button className="btn btn-sm" title="Change cover image" onClick={() => coverInputRef.current?.click()}>Change</button>
                        <button className="btn btn-sm btn-danger" title="Remove cover image" onClick={handleRemoveCover}>Remove</button>
                      </div>
                    </>
                  ) : (
                    <button className="btn btn-sm" onClick={() => coverInputRef.current?.click()}>+ Add Cover Photo</button>
                  )}
                </div>
              </div>
              <div className="edit-actions">
                <button className="btn btn-primary" title="Save changes" onClick={handleSave}>Save</button>
                <button className="btn btn-secondary" title="Discard changes" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h1>{goal.title}</h1>
                {goal.description && <p className="detail-desc">{goal.description}</p>}
              </div>
              <button className="btn btn-sm" title="Edit title, description and deadline" onClick={() => setEditing(true)}>Edit</button>
            </>
          )}
        </div>

        <div className="detail-meta">
          {(() => { const imp = getImportance(goal.importance); return (
            <span className="importance-badge" style={{ background: imp.color }} title={imp.label}>
              {imp.emoji} {imp.label}
            </span>
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

        {overdue && (
          <div className="overdue-warning">
            This goal's deadline has passed. Mark it as completed or it will auto-fail.
          </div>
        )}

        <div className="progress-section large">
          <div className="progress-header">
            <span>Overall Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-bar large">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="status-actions">
          <span>Change status:</span>
          <div className="status-buttons">
            {statuses.map((s) => (
              <button
                key={s}
                className={`btn btn-sm ${goal.status === s ? 'active' : ''}`}
                title={goal.status === s ? `Current status: ${statusLabel(s)}` : `Set status to "${statusLabel(s)}"`}
                onClick={() => handleStatusChange(s)}
                style={goal.status === s ? { background: statusColor(s), borderColor: statusColor(s), color: '#fff' } : {}}
              >
                {statusLabel(s)}
              </button>
            ))}
          </div>
        </div>

        <div className="subgoals-section">
          <div className="subgoals-header">
            <h2>Subgoals {goal.subgoals ? `(${goal.subgoals.filter((s) => s.status === 'completed').length}/${goal.subgoals.length})` : ''}</h2>
            <button className="btn btn-sm" title="Add a new subgoal" onClick={addSubgoal}>+ Add</button>
          </div>
          {goal.subgoals && goal.subgoals.length > 0 ? (
            <div className="subgoal-list">
              {goal.subgoals.map((sg) => (
                <div key={sg.id} className={`subgoal-item ${sg.status}${editSgId === sg.id ? ' editing' : ''}`}>
                  <div className="subgoal-check clickable" title="Click to cycle status" onClick={() => handleSubgoalToggle(sg.id)} style={{
                    background: sg.status === 'completed' ? 'var(--green)' :
                      sg.status === 'in-progress' ? 'var(--amber)' :
                      sg.status === 'failed' ? 'var(--red)' : 'var(--surface)',
                    cursor: 'pointer'
                  }}>
                    {subgoalIcon(sg.status)}
                  </div>
                  <div className="subgoal-content">
                    {editSgId === sg.id ? (
                      <div className="subgoal-edit-form">
                        <input
                          className="subgoal-edit-input"
                          value={editSgTitle}
                          onChange={(e) => setEditSgTitle(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveSubgoalTitle(sg.id); if (e.key === 'Escape') cancelEditSg() }}
                          placeholder="Subgoal title"
                          autoFocus
                        />
                        <textarea
                          className="subgoal-edit-textarea"
                          value={editSgDescription}
                          onChange={(e) => setEditSgDescription(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Escape') cancelEditSg() }}
                          placeholder="Optional description"
                          rows={2}
                        />
                        <input
                          type="date"
                          className="subgoal-edit-input"
                          value={editSgDeadline}
                          onChange={(e) => setEditSgDeadline(e.target.value)}
                          placeholder="Deadline"
                          style={{ fontSize: '0.8rem' }}
                        />
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          <button className="btn btn-sm btn-primary" title="Save subgoal" onClick={() => saveSubgoalTitle(sg.id)} style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}>Save</button>
                          <button className="btn btn-sm btn-secondary" title="Discard changes" onClick={cancelEditSg} style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="subgoal-view">
                        <span className={sg.status === 'failed' ? 'failed-text' : ''} onDoubleClick={() => startEditSg(sg)}>{sg.title}</span>
                        {sg.description && <span className="subgoal-desc">{sg.description}</span>}
                        {sg.deadline && (
                          <span className={`subgoal-deadline-badge ${new Date(sg.deadline) < new Date() && sg.status !== 'completed' && sg.status !== 'failed' ? 'overdue' : ''}`}>
                            {formatDate(sg.deadline)}
                            {(() => {
                              const ri = remainingInfo(sg.deadline, sg.createdAt || goal.createdAt)
                              return ri ? <span className="days-pill" style={{ background: ri.color }}>{ri.days}d</span> : null
                            })()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="subgoal-status">{subgoalLabel(sg.status)}</span>
                  <button className="btn-icon-subgoal edit" onClick={() => startEditSg(sg)} title="Edit subgoal">✏</button>
                  <button className="btn-icon-subgoal remove" onClick={() => removeSubgoal(sg.id)} title="Delete subgoal">🗑</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="hint">No subgoals yet. Click "+ Add" to create one.</p>
          )}
          <p className="hint">Click status icon to cycle · Double-click title to edit</p>
        </div>

        <div className="media-section">
          <div className="media-header">
            <h2>Media</h2>
            <button className="btn btn-sm" title="Attach an image or video" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? 'Uploading…' : '+ Add'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              style={{ display: 'none' }}
              onChange={handleUpload}
            />
          </div>
          {goal.media && goal.media.length > 0 ? (
            <div className="media-grid">
              {goal.media.map((m) => (
                <div key={m.filename} className="media-item">
                  {m.mimetype.startsWith('image/') ? (
                    <img
                      src={`${MEDIA_BASE_URL}/${goal.id}/${m.filename}`}
                      alt={m.originalName}
                      onClick={() => window.open(`${MEDIA_BASE_URL}/${goal.id}/${m.filename}`, '_blank')}
                    />
                  ) : (
                    <video src={`${MEDIA_BASE_URL}/${goal.id}/${m.filename}`} controls />
                  )}
                  <button className="media-delete" onClick={() => handleDeleteMedia(m.filename)} title="Remove">✕</button>
                  <span className="media-name" title={m.originalName}>{m.originalName}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="hint">No media yet. Click "+ Add" to attach images or videos.</p>
          )}
        </div>

        <div className="detail-actions">
          <button className="btn btn-danger" title="Permanently delete this goal" onClick={handleDelete}>🗑 Delete Goal</button>
        </div>
      </div>
    </div>
  )
}
