import { Routes, Route, useLocation } from 'react-router'
import ProtectedRoute from './components/ProtectedRoute'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Cocktails from './pages/Cocktails'
import Cabinet from './pages/Cabinet'
import Discover from './pages/Discover'
import Log from './pages/Log'

const NAV_ROUTES = ['/cabinet', '/discover', '/log', '/profile']

export default function AppRoutes() {
  const { pathname } = useLocation()
  const showNav = NAV_ROUTES.some((r) => pathname.startsWith(r))

  return (
    <>
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
        <Route
          path="/cabinet"
          element={
            <ProtectedRoute>
              <Cabinet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/discover"
          element={
            <ProtectedRoute>
              <Discover />
            </ProtectedRoute>
          }
        />
        <Route
          path="/log"
          element={
            <ProtectedRoute>
              <Log />
            </ProtectedRoute>
          }
        />
      </Routes>
      {showNav && <BottomNav />}
    </>
  )
}
