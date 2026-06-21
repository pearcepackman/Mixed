import { Routes, Route } from 'react-router'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Cocktails from './pages/Cocktails'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cocktails"
        element={
          <ProtectedRoute>
            <Cocktails />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
