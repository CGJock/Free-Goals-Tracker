const express = require('express')
const jsonServer = require('json-server')
const multer = require('multer')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = 3001
const DB_PATH = path.join(__dirname, 'db.json')
const MEDIA_DIR = path.join(__dirname, 'media')

if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ goals: [] }, null, 2))
}

app.use(cors())
app.use('/media', express.static(MEDIA_DIR))

const router = jsonServer.router(DB_PATH)

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(MEDIA_DIR, 'goals', req.params.goalId)
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, unique + path.extname(file.originalname))
  },
})
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } })

const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(MEDIA_DIR, 'goals', req.params.goalId)
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    cb(null, `cover-${Date.now()}${path.extname(file.originalname)}`)
  },
})
const coverUpload = multer({ storage: coverStorage, limits: { fileSize: 10 * 1024 * 1024 } })

app.post('/upload/:goalId', upload.single('file'), (req, res) => {
  const goalId = parseInt(req.params.goalId)
  const goal = router.db.get('goals').find({ id: goalId }).value()
  if (!goal) {
    fs.unlinkSync(req.file.path)
    return res.status(404).json({ error: 'Goal not found' })
  }
  const entry = {
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    uploadedAt: new Date().toISOString(),
  }
  const media = [...(goal.media || []), entry]
  router.db.get('goals').find({ id: goalId }).assign({ media }).write()
  res.json(entry)
})

app.delete('/upload/:goalId/:filename', (req, res) => {
  const goalId = parseInt(req.params.goalId)
  const { filename } = req.params
  const goal = router.db.get('goals').find({ id: goalId }).value()
  if (!goal) return res.status(404).json({ error: 'Goal not found' })

  const media = (goal.media || []).filter((m) => m.filename !== filename)
  router.db.get('goals').find({ id: goalId }).assign({ media }).write()

  const filePath = path.join(MEDIA_DIR, 'goals', String(goalId), filename)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)

  res.json({ success: true })
})

const noteStorage = multer.diskStorage({
  destination: (req, cb) => {
    const dir = path.join(MEDIA_DIR, 'goals', req.params.goalId)
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    cb(null, `note-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`)
  },
})
const noteUpload = multer({ storage: noteStorage, limits: { fileSize: 25 * 1024 * 1024 } })

app.post('/note-upload/:goalId/:noteId', noteUpload.single('file'), (req, res) => {
  const goalId = parseInt(req.params.goalId)
  const noteId = parseInt(req.params.noteId)
  const goal = router.db.get('goals').find({ id: goalId }).value()
  if (!goal) {
    fs.unlinkSync(req.file.path)
    return res.status(404).json({ error: 'Goal not found' })
  }
  const entry = {
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    uploadedAt: new Date().toISOString(),
  }
  const notes = (goal.notes || []).map((n) => {
    if (n.id !== noteId) return n
    return { ...n, media: [...(n.media || []), entry] }
  })
  router.db.get('goals').find({ id: goalId }).assign({ notes }).write()
  res.json(entry)
})

app.delete('/note-upload/:goalId/:noteId/:filename', (req, res) => {
  const goalId = parseInt(req.params.goalId)
  const noteId = parseInt(req.params.noteId)
  const { filename } = req.params
  const goal = router.db.get('goals').find({ id: goalId }).value()
  if (!goal) return res.status(404).json({ error: 'Goal not found' })

  const notes = (goal.notes || []).map((n) => {
    if (n.id !== noteId) return n
    return { ...n, media: (n.media || []).filter((m) => m.filename !== filename) }
  })
  router.db.get('goals').find({ id: goalId }).assign({ notes }).write()

  const filePath = path.join(MEDIA_DIR, 'goals', String(goalId), filename)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)

  res.json({ success: true })
})

app.post('/cover/:goalId', coverUpload.single('file'), (req, res) => {
  const goalId = parseInt(req.params.goalId)
  const goal = router.db.get('goals').find({ id: goalId }).value()
  if (!goal) {
    fs.unlinkSync(req.file.path)
    return res.status(404).json({ error: 'Goal not found' })
  }
  if (goal.cover) {
    const oldPath = path.join(MEDIA_DIR, 'goals', String(goalId), goal.cover.filename)
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
  }
  const cover = { filename: req.file.filename, mimetype: req.file.mimetype }
  router.db.get('goals').find({ id: goalId }).assign({ cover }).write()
  res.json(cover)
})

app.delete('/cover/:goalId', (req, res) => {
  const goalId = parseInt(req.params.goalId)
  const goal = router.db.get('goals').find({ id: goalId }).value()
  if (!goal) return res.status(404).json({ error: 'Goal not found' })
  if (goal.cover) {
    const filePath = path.join(MEDIA_DIR, 'goals', String(goalId), goal.cover.filename)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  }
  router.db.get('goals').find({ id: goalId }).assign({ cover: null }).write()
  res.json({ success: true })
})

const middlewares = jsonServer.defaults({ logger: false })
app.use(middlewares)
app.use(router)

app.listen(PORT, () => {
  console.log(`Goals Tracker server → http://localhost:${PORT}`)
})
