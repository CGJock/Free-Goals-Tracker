import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGoal } from '../api/goals'
import { IMPORTANCE_LEVELS, DEFAULT_IMPORTANCE } from '../utils/importance'

const emptySubgoal = () => ({ id: Date.now() + Math.random(), title: '', description: '', deadline: '', createdAt: new Date().toISOString(), status: 'not-started' })

function toDateInput(iso) {
  if (!iso) return ''
  return iso.slice(0, 10)
}

export default function CreateGoal() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [deadline, setDeadline] = useState('')
  const [subgoals, setSubgoals] = useState([])
  const [importance, setImportance] = useState(DEFAULT_IMPORTANCE)
  const [saving, setSaving] = useState(false)

  function addSubgoal() {
    setSubgoals((prev) => [...prev, emptySubgoal()])
  }

  function updateSubgoal(id, field, value) {
    setSubgoals((prev) =>
      prev.map((sg) => (sg.id === id ? { ...sg, [field]: value } : sg))
    )
  }

  function removeSubgoal(id) {
    setSubgoals((prev) => prev.filter((sg) => sg.id !== id))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    const goal = {
      title: title.trim(),
      description: description.trim(),
      status: 'in-progress',
      importance,
      year,
      deadline: deadline || null,
      createdAt: new Date().toISOString(),
      subgoals: subgoals
        .filter((sg) => sg.title.trim())
        .map((sg) => ({
          id: Date.now() + Math.random(),
          title: sg.title.trim(),
          description: (sg.description || '').trim(),
          deadline: sg.deadline || null,
          createdAt: new Date().toISOString(),
          status: 'not-started',
        })),
    }
    await createGoal(goal)
    navigate('/')
  }

  return (
    <div className="form-page">
      <div className="form-container">
        <h1>Create New Goal</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want to achieve?"
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details about this goal"
              rows={3}
            />
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
          <div className="form-row">
            <div className="form-group">
              <label>Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={2020}
                max={2030}
              />
            </div>
            <div className="form-group">
              <label>Deadline (optional)</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="subgoal-header">
              <label>Subgoals (optional)</label>
              <button type="button" className="btn btn-sm" onClick={addSubgoal}>
                + Add Subgoal
              </button>
            </div>
            {subgoals.map((sg, i) => (
              <div key={sg.id} className="subgoal-row">
                <span className="subgoal-index">{i + 1}.</span>
                <div className="subgoal-fields">
                  <input
                    value={sg.title}
                    onChange={(e) => updateSubgoal(sg.id, 'title', e.target.value)}
                    placeholder="Subgoal title"
                  />
                  <div className="subgoal-row-inline">
                    <input
                      value={sg.description || ''}
                      onChange={(e) => updateSubgoal(sg.id, 'description', e.target.value)}
                      placeholder="Optional description"
                      className="subgoal-desc-input"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="date"
                      value={sg.deadline || ''}
                      onChange={(e) => updateSubgoal(sg.id, 'deadline', e.target.value)}
                      title="Deadline"
                      style={{ width: 'auto', fontSize: '0.8rem', padding: '0.4rem 0.5rem' }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-icon remove"
                  onClick={() => removeSubgoal(sg.id)}
                >
                  ×
                </button>
              </div>
            ))}
            {subgoals.length === 0 && (
              <p className="hint">Add measurable steps to track your progress</p>
            )}
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving || !title.trim()}>
              {saving ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
