import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { collection, addDoc, serverTimestamp, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { openRazorpay, USER_PLANS } from '../utils/razorpay'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function LandDetail() {
  const { id } = useParams()
  const { currentUser, userProfile, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [payLoading, setPayLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const snap = await getDoc(doc(db, 'listings', id))
        if (snap.exists()) setListing({ id: snap.id, ...snap.data() })
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchListing()
  }, [id])

  const hasAccess = () => {
    if (!userProfile) return false
    if (userProfile.role === 'admin') return true
    if (userProfile.role === 'realEstate' && listing?.postedBy === currentUser?.uid) return true

    const access = userProfile.userAccess || {}
    // Monthly active
    if (access.plan === 'monthly' && access.expiry?.toDate?.() > new Date()) return true
    // One-time unlock
    if (access.unlockedListings?.includes(id)) return true
    return false
  }

  const payOneTime = async () => {
    if (!currentUser) return navigate('/login')
    setPayLoading(true)
    try {
      await openRazorpay({
        amount: USER_PLANS.oneTime.price,
        description: `Unlock contact – ${listing?.title}`,
        prefill: { name: userProfile?.name, email: currentUser.email },
      })
      // Payment success – save to Firestore
      await addDoc(collection(db, 'payments'), {
        userId: currentUser.uid,
        type: 'one-time',
        listingId: id,
        amount: USER_PLANS.oneTime.price,
        timestamp: serverTimestamp(),
      })
      // Update user access
      await updateDoc(doc(db, 'users', currentUser.uid), {
        'userAccess.unlockedListings': arrayUnion(id),
      })
      await refreshProfile()
      setMsg({ type: 'success', text: 'Payment successful! Contact details unlocked.' })
    } catch (e) {
      setMsg({ type: 'danger', text: e.message })
    } finally {
      setPayLoading(false)
    }
  }

  const payMonthly = async () => {
    if (!currentUser) return navigate('/login')
    setPayLoading(true)
    try {
      await openRazorpay({
        amount: USER_PLANS.monthly.price,
        description: 'Monthly Access – All Properties',
        prefill: { name: userProfile?.name, email: currentUser.email },
      })
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + 30)

      await addDoc(collection(db, 'payments'), {
        userId: currentUser.uid,
        type: 'user-monthly',
        amount: USER_PLANS.monthly.price,
        timestamp: serverTimestamp(),
        expiry,
      })
      await updateDoc(doc(db, 'users', currentUser.uid), {
        'userAccess.plan': 'monthly',
        'userAccess.expiry': expiry,
      })
      await refreshProfile()
      setMsg({ type: 'success', text: 'Monthly access activated! You can view all contacts now.' })
    } catch (e) {
      setMsg({ type: 'danger', text: e.message })
    } finally {
      setPayLoading(false)
    }
  }

  if (loading) return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="flex-grow-1 d-flex align-items-center justify-content-center">
        <div className="spinner-border" style={{ color: '#c9a84c' }} />
      </div>
    </div>
  )

  if (!listing) return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="flex-grow-1 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <i className="bi bi-exclamation-circle" style={{ fontSize: '3rem', color: '#c9a84c' }} />
          <h5 className="mt-3">Listing not found</h5>
        </div>
      </div>
    </div>
  )

  const canSee = hasAccess()

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="flex-grow-1 py-5" style={{ background: '#f5f6fa' }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-8">
              {/* Header */}
              <div className="lp-card p-4 mb-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h3 className="fw-800 mb-1" style={{ color: '#1a1a2e' }}>{listing.title}</h3>
                    <p className="text-muted mb-0"><i className="bi bi-geo-alt me-1" />{listing.city}, {listing.state}</p>
                  </div>
                  <span className={`badge bg-${({ Agricultural: 'success', Residential: 'primary', Commercial: 'warning', Industrial: 'danger' }[listing.zoning] || 'secondary')} fs-6`}>
                    {listing.zoning}
                  </span>
                </div>
                <div className="row g-4">
                  {[
                    { label: 'Current Price / sqft', value: `₹${Number(listing.price).toLocaleString('en-IN')}`, icon: 'bi-currency-rupee', color: 'var(--primary)' },
                    ...(listing.predicted_price_sqft ? [{ label: 'AI Predicted Future / sqft', value: `₹${Number(listing.predicted_price_sqft).toLocaleString('en-IN')}`, icon: 'bi-graph-up-arrow', color: 'var(--accent)' }] : []),
                    { label: 'Area', value: `${Number(listing.area).toLocaleString()} sqft`, icon: 'bi-rulers', color: 'var(--primary)' },
                    { label: 'City Tier', value: `Tier ${listing.city_tier || 'N/A'}`, icon: 'bi-building', color: 'var(--primary)' },
                    { label: 'Total Value', value: `₹${(Number(listing.price) * Number(listing.area)).toLocaleString('en-IN')}`, icon: 'bi-bank', color: 'var(--primary)' },
                  ].map(m => (
                    <div className="col-6 col-md-3" key={m.label}>
                      <div className="text-center p-3 rounded-3" style={{ background: 'var(--off-white)', border: m.label.includes('AI') ? '1px dashed var(--accent)' : 'none' }}>
                        <i className={`bi ${m.icon} mb-2 d-block`} style={{ fontSize: '1.3rem', color: m.color }} />
                        <div className="fw-800 fs-5" style={{ color: 'var(--primary)' }}>{m.value}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{m.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="lp-card p-4">
                <h5 className="fw-700 mb-3">Property Description</h5>
                <p className="text-muted">{listing.description || 'No description provided.'}</p>
                {listing.features && (
                  <div className="mt-3">
                    <h6 className="fw-700 mb-2">Features</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {listing.features.map(f => (
                        <span key={f} className="badge px-3 py-2" style={{ background: '#f5f6fa', color: '#1a1a2e', borderRadius: '50px', fontWeight: 500 }}>
                          <i className="bi bi-check2 me-1" />{f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar – Contact */}
            <div className="col-lg-4">
              {msg && (
                <div className={`alert alert-${msg.type} animate-in mb-3`} style={{ borderRadius: 12 }}>
                  <i className={`bi bi-${msg.type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`} />
                  {msg.text}
                </div>
              )}

              <div className="lp-card p-4 lp-card-gold">
                <h5 className="fw-700 mb-3">Seller Contact</h5>

                {canSee ? (
                  <div>
                    <div className="mb-3 p-3 rounded-3" style={{ background: '#f5f6fa' }}>
                      <div className="fw-600 mb-1"><i className="bi bi-person me-2" style={{ color: '#c9a84c' }} />{listing.contactName || 'Contact Name'}</div>
                      <div className="text-muted small"><i className="bi bi-phone me-2" />{listing.contactPhone || listing.phone || 'N/A'}</div>
                      <div className="text-muted small"><i className="bi bi-envelope me-2" />{listing.contactEmail || listing.email || 'N/A'}</div>
                    </div>
                    <div className="alert alert-success py-2" style={{ fontSize: '0.8rem', borderRadius: 8 }}>
                      <i className="bi bi-shield-check me-1" />Contact details verified
                    </div>
                  </div>
                ) : (
                  <div>
                    {!currentUser && (
                      <div className="text-center py-3">
                        <i className="bi bi-lock-fill mb-2 d-block" style={{ fontSize: '2rem', color: '#c9a84c' }} />
                        <p className="text-muted small mb-3">Login to access contact details</p>
                        <a href="/login" className="btn btn-gold w-100">Login to View</a>
                      </div>
                    )}

                    {currentUser && (
                      <div>
                        <div className="text-center py-2 mb-3">
                          <i className="bi bi-lock-fill mb-2 d-block" style={{ fontSize: '2rem', color: '#c9a84c' }} />
                          <p className="text-muted small">Choose a plan to unlock contact details</p>
                        </div>

                        <div className="d-grid gap-2">
                          <button className="btn btn-gold" onClick={payOneTime} disabled={payLoading}>
                            <i className="bi bi-person-check me-2" />One-Time – ₹{USER_PLANS.oneTime.price}
                            <div style={{ fontSize: '0.72rem', opacity: 0.8, fontWeight: 400 }}>Unlock this listing only</div>
                          </button>
                          <button className="btn btn-outline-dark-custom" onClick={payMonthly} disabled={payLoading}>
                            <i className="bi bi-calendar-month me-2" />Monthly – ₹{USER_PLANS.monthly.price}/mo
                            <div style={{ fontSize: '0.72rem', opacity: 0.8, fontWeight: 400 }}>View all contacts for 30 days</div>
                          </button>
                        </div>

                        {payLoading && (
                          <div className="text-center mt-3">
                            <div className="spinner-border spinner-border-sm me-2" style={{ color: '#c9a84c' }} />
                            <span className="small text-muted">Processing payment...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick stats */}
              <div className="lp-card p-4 mt-3">
                <h6 className="fw-700 mb-3">Location Details</h6>
                {[
                  { label: 'Dist. City Center', value: listing.dist_city_center_km ? `${listing.dist_city_center_km} km` : 'N/A' },
                  { label: 'Dist. Highway', value: listing.dist_highway_km ? `${listing.dist_highway_km} km` : 'N/A' },
                  { label: 'Utility Access', value: listing.utility_access ? 'Yes' : 'No' },
                  { label: 'Govt. Dev. Plan', value: listing.govt_dev_plan ? 'Yes' : 'No' },
                  { label: 'Flood Risk', value: listing.flood_risk ? 'Yes' : 'No' },
                ].map(r => (
                  <div key={r.label} className="d-flex justify-content-between py-2 border-bottom" style={{ fontSize: '0.88rem' }}>
                    <span className="text-muted">{r.label}</span>
                    <span className="fw-600">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
