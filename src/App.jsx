import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Public pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import LandDetail from './pages/LandDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import Profile from './pages/Profile'

// User dashboard
import UserDashboard from './pages/user/Dashboard'
import UserListings from './pages/user/Listings'
import UserPayments from './pages/user/Payments'

// Real Estate dashboard
import RealEstateDashboard from './pages/realEstate/Dashboard'
import PredictPage from './pages/realEstate/Predict'
import MyListings from './pages/realEstate/MyListings'
import PostListing from './pages/realEstate/PostListing'
import RealEstateSubscription from './pages/realEstate/Subscription'

// Admin dashboard
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminListings from './pages/admin/Listings'
import AdminRevenue from './pages/admin/Revenue'

function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, userProfile } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(userProfile?.role)) {
    return <Navigate to="/" replace />
  }
  return children
}

function DashboardRedirector() {
  const { userProfile } = useAuth()
  if (!userProfile) return <Navigate to="/login" replace />
  if (userProfile.role === 'admin') return <Navigate to="/admin" replace />
  if (userProfile.role === 'realEstate') return <Navigate to="/realestate" replace />
  return <Navigate to="/user" replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/land/:id" element={<LandDetail />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />

      {/* User */}
      <Route path="/user" element={
        <ProtectedRoute allowedRoles={['user']}>
          <UserDashboard />
        </ProtectedRoute>
      } />
      <Route path="/user/listings" element={
        <ProtectedRoute allowedRoles={['user']}>
          <UserListings />
        </ProtectedRoute>
      } />
      <Route path="/user/payments" element={
        <ProtectedRoute allowedRoles={['user']}>
          <UserPayments />
        </ProtectedRoute>
      } />

      {/* Real Estate */}
      <Route path="/realestate" element={
        <ProtectedRoute allowedRoles={['realEstate']}>
          <RealEstateDashboard />
        </ProtectedRoute>
      } />
      <Route path="/realestate/predict" element={
        <ProtectedRoute allowedRoles={['realEstate']}>
          <PredictPage />
        </ProtectedRoute>
      } />
      <Route path="/realestate/listings" element={
        <ProtectedRoute allowedRoles={['realEstate']}>
          <MyListings />
        </ProtectedRoute>
      } />
      <Route path="/realestate/post" element={
        <ProtectedRoute allowedRoles={['realEstate']}>
          <PostListing />
        </ProtectedRoute>
      } />
      <Route path="/realestate/subscription" element={
        <ProtectedRoute allowedRoles={['realEstate']}>
          <RealEstateSubscription />
        </ProtectedRoute>
      } />

      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminUsers />
        </ProtectedRoute>
      } />
      <Route path="/admin/listings" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminListings />
        </ProtectedRoute>
      } />
      <Route path="/admin/revenue" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminRevenue />
        </ProtectedRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardRedirector />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
