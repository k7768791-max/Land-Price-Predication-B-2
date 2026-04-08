import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { currentUser, userProfile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const dashboardLink = () => {
    if (!userProfile) return '/login'
    if (userProfile.role === 'admin') return '/admin'
    if (userProfile.role === 'realEstate') return '/realestate'
    return '/user'
  }

  return (
    <nav className="navbar navbar-expand-lg lp-navbar px-3">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Land<span>Pulse</span>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navMain">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/' ? 'fw-semibold' : ''}`} to="/">
                <i className="bi bi-house me-1" />Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/about' ? 'fw-semibold' : ''}`} to="/about">
                <i className="bi bi-info-circle me-1" />About Us
              </Link>
            </li>
            {userProfile?.role === 'user' && (
              <li className="nav-item">
                <Link className={`nav-link ${location.pathname === '/user/listings' ? 'fw-semibold' : ''}`} to="/user/listings">
                  <i className="bi bi-map me-1" />Check the Land
                </Link>
              </li>
            )}
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/contact' ? 'fw-semibold' : ''}`} to="/contact">
                <i className="bi bi-envelope me-1" />Contact Us
              </Link>
            </li>
          </ul>
          <div className="d-flex align-items-center gap-2">
            {currentUser ? (
              <>
                <Link to="/profile" className="text-muted small d-none d-md-inline text-decoration-none">
                  <i className="bi bi-person-circle me-1" />{userProfile?.name || currentUser.email}
                </Link>
                <Link to={dashboardLink()} className="btn btn-sm btn-outline-dark-custom">
                  <i className="bi bi-grid me-1" />Dashboard
                </Link>
                <button onClick={handleLogout} className="btn btn-sm btn-gold">
                  <i className="bi bi-box-arrow-right me-1" />Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-sm btn-outline-dark-custom">Login</Link>
                <Link to="/register" className="btn btn-sm btn-gold">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
