import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import FounderHome from './pages/FounderHome'
import InvestorHome from './pages/InvestorHome'

import FounderProfile from './pages/FounderProfile'
import InvestorProfile from './pages/InvestorProfile'

import AdminVerification from './pages/AdminVerification'
import AdminDashboard from './pages/AdminDashboard'
import StartupSchool from './pages/StartupSchool'
import StartupSchoolModule from './pages/StartupSchoolModule'
import PitchSubmission from './pages/PitchSubmission'
import MyPitches from './pages/MyPitches'
import Feed from './pages/Feed'
import DealRooms from './pages/DealRooms'
import Messages from './pages/Messages'
import DealRoom from './pages/DealRoom'

import LiveSessions from './pages/LiveSessions'

import Login from './pages/Login'
import Signup from './pages/Signup'
import NotFound from './pages/NotFound'



function App() {
  return (
    <Routes>

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Main application */}
      <Route element={<Layout />}>

        {/* Role-aware homepage */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Public feed */}
        <Route path="/feed" element={<Feed />} />

        {/* Founder */}
        <Route
          path="/founder-home"
          element={
            <ProtectedRoute>
              <FounderHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/founder"
          element={
            <ProtectedRoute>
              <FounderProfile />
            </ProtectedRoute>
          }
        />

        {/* Investor */}
        <Route
          path="/investor-home"
          element={
            <ProtectedRoute>
              <InvestorHome />
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

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminVerification />
            </ProtectedRoute>
          }
        />

        {/* Founder learning */}
        <Route
          path="/startup-school"
          element={
            <ProtectedRoute>
              <StartupSchool />
            </ProtectedRoute>
          }
        />

        <Route
          path="/startup-school/:id"
          element={
            <ProtectedRoute>
              <StartupSchoolModule />
            </ProtectedRoute>
          }
        />

        {/* Founder pitch */}
        <Route
          path="/pitch"
          element={
            <ProtectedRoute>
              <PitchSubmission />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pitch/:id"
          element={
            <ProtectedRoute>
              <PitchSubmission />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pitches/mine"
          element={
            <ProtectedRoute>
              <MyPitches />
            </ProtectedRoute>
          }
        />

        {/* Deal Room */}
        <Route
          path="/dealrooms"
          element={
            <ProtectedRoute>
              <DealRooms />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dealrooms/:dealRoomId"
          element={
            <ProtectedRoute>
              <DealRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/live-sessions"
          element={
            <ProtectedRoute>
              <LiveSessions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/live-sessions"
          element={
            <ProtectedRoute>
              <LiveSessions />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Route>

    </Routes>
  )
}

export default App