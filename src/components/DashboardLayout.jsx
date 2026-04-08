import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navConfigs = {
  user: [
    { to: '/user', label: 'Dashboard', icon: 'bi-grid' },
    { to: '/user/listings', label: 'Browse Listings', icon: 'bi-map' },
    { to: '/user/payments', label: 'My Subscriptions', icon: 'bi-credit-card' },
  ],
  realEstate: [
    { to: '/realestate', label: 'Dashboard', icon: 'bi-grid' },
    { to: '/realestate/predict', label: 'AI Prediction', icon: 'bi-cpu' },
    { to: '/realestate/listings', label: 'My Listings', icon: 'bi-list-ul' },
    { to: '/realestate/post', label: 'Post New Listing', icon: 'bi-plus-square' },
    { to: '/realestate/subscription', label: 'Subscription', icon: 'bi-star' },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: 'bi-grid' },
    { to: '/admin/users', label: 'Users', icon: 'bi-people' },
    { to: '/admin/listings', label: 'Listings', icon: 'bi-buildings' },
    { to: '/admin/revenue', label: 'Revenue', icon: 'bi-graph-up' },
  ],
}

export default function DashboardLayout({ children, role }) {
  const { userProfile, logout } = useAuth()
  const navigate = useNavigate()
  const navItems = navConfigs[role] || []

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <nav className="lp-sidebar">
        <div className="brand">Land<span>Pulse</span></div>

        <div className="p-2 flex-grow-1" style={{ overflowY: 'auto', marginTop: '0.5rem' }}>
          <NavLink to="/" end className="nav-link mb-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <i className="bi bi-house-door" />
            Back to Home
          </NavLink>
          
          <div className="px-3 mb-2" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255,255,255,0.35)' }}>
            {role === 'admin' ? 'Admin Panel' : role === 'realEstate' ? 'Agent Portal' : 'My Account'}
          </div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split('/').length <= 2}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <i className={`bi ${item.icon}`} />
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Profile + logout at bottom */}
        <div className="p-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #c9a84c, #f0c96e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#1a1a2e', fontSize: '0.9rem', flexShrink: 0 }}>
              {userProfile?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="text-white fw-600" style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userProfile?.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userProfile?.email}</div>
            </div>
          </div>
          <button className="btn btn-sm w-100" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', borderRadius: 8, border: 'none' }} onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-1" />Sign Out
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="lp-main flex-grow-1">
        {children}
      </main>
    </div>
  )
}
