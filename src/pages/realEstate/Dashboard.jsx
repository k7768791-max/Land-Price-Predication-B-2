import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'

import { RE_PLANS } from '../../utils/razorpay'

export default function RealEstateDashboard() {
  const { userProfile, currentUser } = useAuth()
  const [predictions, setPredictions] = useState([])
  const [myListings, setMyListings] = useState([])
  const [loading, setLoading] = useState(true)

  const sub = userProfile?.subscription || {}
  const isActive = sub.plan && sub.plan !== 'free' && sub.expiry?.toDate?.() > new Date()
  const predictionCount = sub.predictionCount || 0
  const maxPredictions = isActive && RE_PLANS[sub.plan] ? RE_PLANS[sub.plan].predictions : 2

  useEffect(() => {
    const fetch = async () => {
      try {
        const [pSnap, lSnap] = await Promise.all([
          getDocs(query(collection(db, 'predictions'), where('userId', '==', currentUser.uid))),
          getDocs(query(collection(db, 'listings'), where('postedBy', '==', currentUser.uid))),
        ])

        const sortedPredictions = pSnap.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.timestamp?.toMillis?.() || 0) - (a.timestamp?.toMillis?.() || 0))
        const sortedListings = lSnap.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))

        setPredictions(sortedPredictions)
        setMyListings(sortedListings)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetch()
  }, [currentUser.uid])

  const getPlanBadge = (plan) => {
    const map = { free: 'secondary', monthly: 'primary', quarterly: 'success', yearly: 'warning' }
    return <span className={`badge bg-${map[plan] || 'secondary'} text-capitalize`}>{plan}</span>
  }

  return (
    <DashboardLayout role="realEstate">
      <div className="lp-topbar">
        <div>
          <h5 className="fw-700 mb-0">Agent Dashboard</h5>
          <small className="text-muted">{userProfile?.name} – {getPlanBadge(sub.plan || 'free')}</small>
        </div>
        <Link to="/realestate/predict" className="btn btn-gold btn-sm">
          <i className="bi bi-cpu me-1" />Run Prediction
        </Link>
      </div>

      <div className="lp-content">
        {/* Stat cards */}
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="stat-card">
              <p>Total Predictions</p>
              <h3>{predictions.length}</h3>
              <div className="icon-bg"><i className="bi bi-cpu" /></div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card">
              <p>{isActive ? 'Predictions Used' : 'Free Pre. Used'}</p>
              <h3>{maxPredictions === 999999 ? `${predictionCount} / ∞` : `${Math.min(predictions.length, maxPredictions)}/${maxPredictions}`}</h3>
              <div className="icon-bg"><i className="bi bi-bar-chart" /></div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card">
              <p>My Listings</p>
              <h3>{myListings.length}</h3>
              <div className="icon-bg"><i className="bi bi-buildings" /></div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card">
              <p>Plan</p>
              <h3 style={{ fontSize: '1.4rem', textTransform: 'capitalize' }}>{sub.plan || 'Free'}</h3>
              <div className="icon-bg"><i className="bi bi-star" /></div>
            </div>
          </div>
        </div>

        {/* Upgrade prompt if free and used predictions */}
        {!isActive && predictionCount >= maxPredictions && (
          <div className="mb-4 p-4 rounded-3" style={{ background: 'linear-gradient(135deg, #1a1a2e, #0f3460)', color: 'white' }}>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <h6 className="fw-700 mb-1"><i className="bi bi-lock-fill me-2" style={{ color: '#c9a84c' }} />Free predictions used up</h6>
                <p className="mb-0" style={{ opacity: 0.7, fontSize: '0.875rem' }}>Upgrade to continue using AI predictions and post listings</p>
              </div>
              <Link to="/realestate/subscription" className="btn btn-gold">Upgrade Plan</Link>
            </div>
          </div>
        )}

        {/* Subscription status */}
        {isActive && (
          <div className="alert alert-success mb-4 d-flex align-items-center gap-3" style={{ borderRadius: 12 }}>
            <i className="bi bi-check-circle-fill fs-4 text-success" />
            <div>
              <div className="fw-700">{sub.plan?.charAt(0).toUpperCase() + sub.plan?.slice(1)} plan active</div>
              <div className="small text-muted">Expires: {sub.expiry?.toDate?.().toLocaleDateString('en-IN')}</div>
            </div>
          </div>
        )}

        {/* Recent predictions */}
        <div className="lp-card mb-4">
          <div className="d-flex justify-content-between align-items-center p-4 pb-0">
            <h6 className="fw-700 mb-0">Recent Predictions</h6>
            <Link to="/realestate/predict" className="text-decoration-none small fw-600" style={{ color: '#c9a84c' }}>New →</Link>
          </div>
          {loading ? <div className="text-center py-4"><div className="spinner-border spinner-border-sm" style={{ color: '#c9a84c' }} /></div> :
            predictions.slice(0, 4).length === 0 ? <p className="text-center text-muted small py-4">No predictions yet</p> :
              <div className="table-responsive p-3">
                <table className="table lp-table mb-0">
                  <thead><tr><th>City</th><th>Future Price</th><th>ROI%</th><th>Date</th></tr></thead>
                  <tbody>
                    {predictions.slice(0, 4).map(p => (
                      <tr key={p.id}>
                        <td className="fw-600">{p.inputs?.city}, {p.inputs?.state}</td>
                        <td style={{ color: '#c9a84c', fontWeight: 700 }}>₹{p.result?.future_price_per_sqft?.toLocaleString()}</td>
                        <td><span className="badge bg-success">{p.result?.roi_percent}%</span></td>
                        <td className="text-muted">{p.timestamp?.toDate?.().toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          }
        </div>

        {/* My listings */}
        <div className="lp-card">
          <div className="d-flex justify-content-between align-items-center p-4 pb-0">
            <h6 className="fw-700 mb-0">My Listings</h6>
            <Link to="/realestate/post" className="text-decoration-none small fw-600" style={{ color: '#c9a84c' }}>Post New →</Link>
          </div>
          {loading ? <div className="text-center py-4"><div className="spinner-border spinner-border-sm" style={{ color: '#c9a84c' }} /></div> :
            myListings.length === 0 ? <p className="text-center text-muted small py-4">No listings yet</p> :
              <div className="table-responsive p-3">
                <table className="table lp-table mb-0">
                  <thead><tr><th>Property</th><th>Location</th><th>Price</th><th>Status</th></tr></thead>
                  <tbody>
                    {myListings.slice(0, 4).map(l => (
                      <tr key={l.id}>
                        <td className="fw-600">{l.title}</td>
                        <td className="text-muted">{l.city}, {l.state}</td>
                        <td>₹{Number(l.price).toLocaleString()}</td>
                        <td><span className={`badge ${l.approved ? 'bg-success' : 'bg-warning text-dark'}`}>{l.approved ? 'Approved' : 'Pending'}</span></td>
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
