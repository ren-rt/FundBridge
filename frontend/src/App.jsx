import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import FounderProfile from './pages/FounderProfile'
import InvestorProfile from './pages/InvestorProfile'
import AdminVerification from './pages/AdminVerification'
import Login from './pages/Login'
import Signup from './pages/Signup'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />

        <Route
          path="/profile/founder"
          element={
            <ProtectedRoute>
              <FounderProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/investor"
          element={
            <ProtectedRoute>
              <InvestorProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminVerification />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App