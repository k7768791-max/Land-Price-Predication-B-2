import { useState } from 'react'
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { openRazorpay, RE_PLANS } from '../../utils/razorpay'
import DashboardLayout from '../../components/DashboardLayout'

export default function RealEstateSubscription() {
  const { currentUser, userProfile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(null)
  const [msg, setMsg] = useState(null)

  const sub = userProfile?.subscription || {}
  const isActive = sub.plan !== 'free' && sub.expiry?.toDate?.() > new Date()
  const currentPlan = sub.plan || 'free'

  const handleSubscribe = async (planKey) => {
    const plan = RE_PLANS[planKey]
    setLoading(planKey)
    setMsg(null)
    try {
      await openRazorpay({
        amount: plan.price,
        description: `LandPulse ${plan.label} Plan`,
        prefill: { name: userProfile?.name, email: currentUser.email },
      })

      const expiry = new Date()
      expiry.setDate(expiry.getDate() + plan.duration)

      // Save payment record
      await addDoc(collection(db, 'payments'), {
        userId: currentUser.uid,
        type: `re-${planKey}`,
        amount: plan.price,
        plan: planKey,
        timestamp: serverTimestamp(),
        expiry,
      })

      // Update user subscription
      await updateDoc(doc(db, 'users', currentUser.uid), {
        'subscription.plan': planKey,
        'subscription.expiry': expiry,
        'subscription.predictionCount': 0,
        'subscription.listingCount': 0,
      })

      await refreshProfile()
      setMsg({ type: 'success', text: `🎉 ${plan.label} plan activated! Expires ${expiry.toLocaleDateString('en-IN')}` })
    } catch (e) {
      setMsg({ type: 'danger', text: e.message })
    } finally {
      setLoading(null)
    }
  }

  return (
    <DashboardLayout role="realEstate">
      <div className="lp-topbar">
        <div>
          <h5 className="fw-700 mb-0">Subscription Plans</h5>
          <small className="text-muted">Current: <span className="fw-600 text-capitalize" style={{ color: '#c9a84c' }}>{currentPlan}</span></small>
        </div>
      </div>

      <div className="lp-content">
        {msg && <div className={`alert alert-${msg.type} mb-4`} style={{ borderRadius: 12 }}>{msg.text}</div>}

        {isActive && (
          <div className="alert alert-success mb-4 d-flex align-items-center gap-3" style={{ borderRadius: 12 }}>
            <i className="bi bi-check-circle-fill fs-4" />
            <div>
              <div className="fw-700 text-capitalize">{currentPlan} Plan Active</div>
              <div className="small">Expires: {sub.expiry?.toDate?.().toLocaleDateString('en-IN')} · You can still upgrade to a higher tier</div>
            </div>
          </div>
        )}

        {/* Free tier info */}
        <div className="lp-card p-4 mb-4 d-flex align-items-center gap-3">
          <div style={{ width: 50, height: 50, borderRadius: 12, background: '#f5f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="bi bi-gift" style={{ fontSize: '1.5rem', color: '#6c757d' }} />
          </div>
          <div>
            <div className="fw-700">Free Tier</div>
            <div className="text-muted small">2 AI predictions · No listing posts · Always available</div>
          </div>
          <div className="ms-auto"><span className="badge bg-secondary fs-6">₹0</span></div>
        </div>

        {/* Paid plans */}
        <div className="row g-4">
          {Object.entries(RE_PLANS).map(([key, plan]) => (
            <div className="col-md-4" key={key}>
              <div className={`plan-card h-100 ${key === 'quarterly' ? 'featured' : ''}`}>
                <div className="mb-3">
                  <div className="plan-price">
                    ₹{plan.price.toLocaleString()} <small>/{plan.durationLabel}</small>
                  </div>
                  <h5 className="fw-700 mt-2">{plan.label}</h5>
                </div>
                <ul className="list-unstyled mb-4">
                  <li className="mb-2 text-muted small">
                    <i className="bi bi-cpu me-2" style={{ color: '#c9a84c' }} />
                    {plan.predictions === 999999 ? 'Unlimited predictions' : `${plan.predictions} predictions`}
                  </li>
                  <li className="mb-2 text-muted small">
                    <i className="bi bi-buildings me-2" style={{ color: '#c9a84c' }} />
                    {plan.listings === 999999 ? 'Unlimited listings' : `${plan.listings} listing${plan.listings > 1 ? 's' : ''} at a time`}
                  </li>
                  <li className="mb-2 text-muted small">
                    <i className="bi bi-calendar me-2" style={{ color: '#c9a84c' }} />{plan.durationLabel} access
                  </li>
                  <li className="mb-2 text-muted small">
                    <i className="bi bi-headset me-2" style={{ color: '#c9a84c' }} />Priority support
                  </li>
                </ul>
                <button
                  className="btn btn-gold w-100"
                  onClick={() => handleSubscribe(key)}
                  disabled={loading === key || currentPlan === key}
                >
                  {loading === key ? (
                    <><span className="spinner-border spinner-border-sm me-2" />Processing...</>
                  ) : currentPlan === key ? '✓ Current Plan' : `Subscribe via Razorpay`}
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-muted small mt-4">
          <i className="bi bi-shield-lock me-1" />Payments processed securely by Razorpay. No subscription auto-renewal.
        </p>
      </div>
    </DashboardLayout>
  )
}
