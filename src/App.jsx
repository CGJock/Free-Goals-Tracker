import { BrowserRouter, Routes, Route } from 'react-router-dom'
import GoalList from './components/GoalList'
import CreateGoal from './components/CreateGoal'
import GoalDetail from './components/GoalDetail'
import Profile from './components/Profile'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<GoalList />} />
          <Route path="/create" element={<CreateGoal />} />
          <Route path="/goal/:id" element={<GoalDetail />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
