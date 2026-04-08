import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'

export default function UserDashboard() {
  const { userProfile, currentUser } = useAuth()
  const [recentListings, setRecentListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, 'listings'), where('approved', '==', true))
        const snap = await getDocs(q)
        
        const sortedListings = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
          .slice(0, 3)
          
        setRecentListings(sortedListings)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  const access = userProfile?.userAccess || {}
  const isMonthlyActive = access.plan === 'monthly' && access.expiry?.toDate?.() > new Date()
  const unlockedCount = access.unlockedListings?.length || 0

  return (
    <DashboardLayout role="user">
      <div className="lp-topbar">
        <div>
          <h5 className="fw-700 mb-0">Welcome back, {userProfile?.name?.split(' ')[0]} 👋</h5>
          <small className="text-muted">Here's what's happening</small>
        </div>
        <Link to="/user/listings" className="btn btn-gold btn-sm">
          <i className="bi bi-map me-1" />Browse Listings
        </Link>
      </div>

      <div className="lp-content">
        {/* Stat cards */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="stat-card">
              <p>Contact Plan</p>
              <h3>{isMonthlyActive ? 'Monthly Active' : 'Free'}</h3>
              <div className="icon-bg"><i className="bi bi-star" /></div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card">
              <p>Listings Unlocked</p>
              <h3>{unlockedCount}</h3>
              <div className="icon-bg"><i className="bi bi-unlock" /></div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card">
              <p>Monthly Access Expiry</p>
              <h3 style={{ fontSize: '1.2rem' }}>{isMonthlyActive ? access.expiry?.toDate?.().toLocaleDateString('en-IN') : '—'}</h3>
              <div className="icon-bg"><i className="bi bi-calendar" /></div>
            </div>
          </div>
        </div>

        {/* Subscription Banner */}
        {!isMonthlyActive && (
          <div className="mb-4 p-4 rounded-3" style={{ background: 'linear-gradient(135deg, #1a1a2e, #0f3460)', color: 'white' }}>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <h6 className="fw-700 mb-1"><i className="bi bi-lightning-fill me-2" style={{ color: '#c9a84c' }} />Unlock All Contacts for ₹199/month</h6>
                <p className="mb-0" style={{ opacity: 0.7, fontSize: '0.875rem' }}>Get unlimited access to seller contact details for 30 days</p>
              </div>
              <Link to="/user/payments" className="btn btn-gold">Subscribe Now</Link>
            </div>
          </div>
        )}

        {/* Recent listings */}
        <div className="lp-card p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-700 mb-0">Recent Listings</h6>
            <Link to="/user/listings" className="text-decoration-none small fw-600" style={{ color: '#c9a84c' }}>View all →</Link>
          </div>
          {loading ? <div className="text-center py-3"><div className="spinner-border spinner-border-sm" style={{ color: '#c9a84c' }} /></div> :
            recentListings.length === 0 ? <p className="text-muted small text-center py-3">No listings yet</p> :
              <div className="table-responsive">
                <table className="table table-hover lp-table mb-0">
                  <thead>
                    <tr><th>Property</th><th>Location</th><th>Price/sqft</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {recentListings.map(l => (
                      <tr key={l.id}>
                        <td className="fw-600">{l.title}</td>
                        <td className="text-muted">{l.city}, {l.state}</td>
                        <td className="fw-600" style={{ color: '#c9a84c' }}>₹{Number(l.price).toLocaleString()}</td>
                        <td><Link to={`/land/${l.id}`} className="btn btn-sm btn-gold">View</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          }
        </div>
      </div>
    </DashboardLayout>
  )
}
