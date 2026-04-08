import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/DashboardLayout'

export default function Profile() {
  const { userProfile, currentUser } = useAuth()

  if (!userProfile) return null

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'System Administrator'
      case 'realEstate': return 'Real Estate Agent'
      default: return 'Property Investor / User'
    }
  }

  const role = userProfile.role || 'user'

  return (
    <DashboardLayout role={role}>
      <div className="lp-topbar">
        <div>
          <h5 className="fw-700 mb-0">Digital Profile</h5>
          <small className="text-muted">Manage your personal information</small>
        </div>
      </div>

      <div className="lp-content">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="lp-card overflow-hidden">
              <div style={{ height: 140, background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', position: 'relative' }}>
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center shadow" 
                  style={{
                    width: 100, height: 100, 
                    position: 'absolute', bottom: -50, left: 40,
                    background: 'var(--accent)', color: 'white',
                    fontSize: '3rem', fontWeight: 800, border: '4px solid white'
                  }}
                >
                  {userProfile.name?.charAt(0)?.toUpperCase()}
                </div>
              </div>
              <div className="p-4 p-md-5 pt-5 mt-4">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <h3 className="fw-800 mb-1 text-dark">{userProfile.name || 'Unnamed User'}</h3>
                    <p className="text-muted mb-0 d-flex align-items-center gap-2">
                      <i className="bi bi-briefcase-fill" style={{ color: 'var(--accent)' }}/> {getRoleLabel(role)}
                    </p>
                  </div>
                  <span className={`role-badge role-${role}`}>{role.toUpperCase()}</span>
                </div>

                <hr className="my-4" style={{ borderColor: 'var(--border)' }}/>

                <h6 className="fw-700 mb-3 text-dark">Contact Information</h6>
                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <label className="text-muted small fw-600 mb-1 d-block">Email Address</label>
                    <div className="p-3 rounded d-flex align-items-center gap-3" style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}>
                      <i className="bi bi-envelope fs-5" style={{ color: 'var(--accent)' }}/>
                      <span className="fw-500">{currentUser.email}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small fw-600 mb-1 d-block">Account Created</label>
                    <div className="p-3 rounded d-flex align-items-center gap-3" style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}>
                      <i className="bi bi-calendar fs-5" style={{ color: 'var(--accent)' }}/>
                      <span className="fw-500">{userProfile.createdAt?.toDate?.().toLocaleDateString('en-IN') || 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                <h6 className="fw-700 mt-5 mb-3 text-dark">Subscription Summary</h6>
                {role === 'realEstate' ? (
                  <div className="p-4 rounded" style={{ background: 'rgba(37,99,235,0.05)', border: '1px dashed var(--accent)' }}>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted fw-600">Current Plan</span>
                      <strong className="text-capitalize" style={{ color: 'var(--accent)' }}>{userProfile.subscription?.plan || 'Free'}</strong>
                    </div>
                    <div className="d-flex justify-content-between mt-2">
                      <span className="text-muted fw-600">Predictions Used</span>
                      <strong>{userProfile.subscription?.predictionCount || 0}</strong>
                    </div>
                  </div>
                ) : role === 'user' ? (
                  <div className="p-4 rounded" style={{ background: 'rgba(37,99,235,0.05)', border: '1px dashed var(--accent)' }}>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted fw-600">Active Monthly Pass</span>
                      <strong className="text-capitalize" style={{ color: 'var(--accent)' }}>
                        {userProfile.userAccess?.plan === 'monthly' && userProfile.userAccess?.expiry?.toDate() > new Date() ? 'Yes' : 'No'}
                      </strong>
                    </div>
                    <div className="d-flex justify-content-between mt-2">
                      <span className="text-muted fw-600">Unlocked Properties</span>
                      <strong>{userProfile.userAccess?.unlockedListings?.length || 0}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded text-center text-muted border">
                    Admins have full platform access without subscription boundaries.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
