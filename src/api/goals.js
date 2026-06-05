const BASE_URL = 'http://localhost:3001'
export const MEDIA_BASE_URL = `${BASE_URL}/media/goals`

export async function fetchGoals() {
  const res = await fetch(`${BASE_URL}/goals`)
  if (!res.ok) throw new Error('Failed to fetch goals')
  return res.json()
}

export async function fetchGoal(id) {
  const res = await fetch(`${BASE_URL}/goals/${id}`)
  if (!res.ok) throw new Error('Failed to fetch goal')
  return res.json()
}

export async function createGoal(goal) {
  const res = await fetch(`${BASE_URL}/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(goal),
  })
  if (!res.ok) throw new Error('Failed to create goal')
  return res.json()
}

export async function updateGoal(id, updates) {
  const res = await fetch(`${BASE_URL}/goals/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  if (!res.ok) throw new Error('Failed to update goal')
  return res.json()
}

export async function deleteGoal(id) {
  const res = await fetch(`${BASE_URL}/goals/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete goal')
  return res.json()
}

export async function uploadMedia(goalId, file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${BASE_URL}/upload/${goalId}`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('Failed to upload file')
  return res.json()
}

export async function deleteMedia(goalId, filename) {
  const res = await fetch(`${BASE_URL}/upload/${goalId}/${encodeURIComponent(filename)}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete file')
  return res.json()
}

export async function uploadCover(goalId, file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${BASE_URL}/cover/${goalId}`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('Failed to upload cover')
  return res.json()
}

export async function deleteCover(goalId) {
  const res = await fetch(`${BASE_URL}/cover/${goalId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to remove cover')
  return res.json()
}

export async function uploadNoteMedia(goalId, noteId, file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${BASE_URL}/note-upload/${goalId}/${noteId}`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('Failed to upload note file')
  return res.json()
}

export async function deleteNoteMedia(goalId, noteId, filename) {
  const res = await fetch(`${BASE_URL}/note-upload/${goalId}/${noteId}/${encodeURIComponent(filename)}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete note file')
  return res.json()
}
