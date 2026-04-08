import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, orderBy, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { openRazorpay, USER_PLANS } from '../../utils/razorpay'
import DashboardLayout from '../../components/DashboardLayout'

export default function UserPayments() {
  const { currentUser, userProfile, refreshProfile } = useAuth()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [payLoading, setPayLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  const access = userProfile?.userAccess || {}
  const isMonthlyActive = access.plan === 'monthly' && access.expiry?.toDate?.() > new Date()

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, 'payments'), where('userId', '==', currentUser.uid), orderBy('timestamp', 'desc'))
        const snap = await getDocs(q)
        setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetch()
  }, [currentUser.uid])

  const handleMonthlySubscribe = async () => {
    setPayLoading(true)
    setMsg(null)
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
      setMsg({ type: 'success', text: '✅ Monthly access activated! You can now view all seller contacts.' })
    } catch (e) {
      setMsg({ type: 'danger', text: e.message })
    } finally {
      setPayLoading(false)
    }
  }

  return (
    <DashboardLayout role="user">
      <div className="lp-topbar">
        <div>
          <h5 className="fw-700 mb-0">My Subscriptions & Payments</h5>
          <small className="text-muted">Manage your access plans</small>
        </div>
      </div>

      <div className="lp-content">
        {msg && <div className={`alert alert-${msg.type} mb-4`} style={{ borderRadius: 12 }}>{msg.text}</div>}

        {/* Current Status */}
        <div className="row g-4 mb-5">
          <div className="col-md-6">
            <div className={`plan-card ${isMonthlyActive ? 'featured' : ''} h-100`}>
              <div className="d-flex align-items-start justify-content-between mb-3">
                <div>
                  <div className="plan-price">₹{USER_PLANS.oneTime.price} <small>/property</small></div>
                  <h5 className="fw-700 mt-2">One-Time Access</h5>
                </div>
                <div style={{ width: 50, height: 50, borderRadius: 12, background: 'linear-gradient(135deg, #1a1a2e, #0f3460)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-person-check" style={{ color: '#c9a84c', fontSize: '1.4rem' }} />
                </div>
              </div>
              <ul className="list-unstyled mb-4">
                {['Pay per property', 'Instant contact unlock', 'No subscription needed'].map(f => (
                  <li key={f} className="mb-2 text-muted small"><i className="bi bi-check2-circle me-2" style={{ color: '#c9a84c' }} />{f}</li>
                ))}
              </ul>
              <p className="text-muted small">Go to a listing page and click "One-Time" to unlock.</p>
            </div>
          </div>

          <div className="col-md-6">
            <div className="plan-card featured h-100">
              <div className="d-flex align-items-start justify-content-between mb-3">
                <div>
                  <div className="plan-price">₹{USER_PLANS.monthly.price} <small>/month</small></div>
                  <h5 className="fw-700 mt-2">Monthly Access</h5>
                </div>
                <div style={{ width: 50, height: 50, borderRadius: 12, background: 'linear-gradient(135deg, #c9a84c, #f0c96e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-calendar-month" style={{ color: '#1a1a2e', fontSize: '1.4rem' }} />
                </div>
              </div>
              <ul className="list-unstyled mb-4">
                {['All contacts for 30 days', 'Unlimited property views', 'Best value for buyers'].map(f => (
                  <li key={f} className="mb-2 text-muted small"><i className="bi bi-check2-circle me-2" style={{ color: '#c9a84c' }} />{f}</li>
                ))}
              </ul>
              {isMonthlyActive ? (
                <div className="alert alert-success py-2 mb-0" style={{ borderRadius: 8, fontSize: '0.85rem' }}>
                  <i className="bi bi-check-circle me-1" />Active until {access.expiry?.toDate?.().toLocaleDateString('en-IN')}
                </div>
              ) : (
                <button className="btn btn-gold w-100" onClick={handleMonthlySubscribe} disabled={payLoading}>
                  {payLoading ? <><span className="spinner-border spinner-border-sm me-2" />Processing...</> : 'Subscribe via Razorpay'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Payment history */}
        <div className="lp-card">
          <div className="p-4 pb-3">
            <h6 className="fw-700 mb-0">Payment History</h6>
          </div>
          {loading ? (
            <div className="text-center py-4"><div className="spinner-border spinner-border-sm" style={{ color: '#c9a84c' }} /></div>
          ) : payments.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-credit-card" style={{ fontSize: '2rem' }} /><br />
              <span className="small">No payment history</span>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table lp-table mb-0">
                <thead><tr><th>Type</th><th>Amount</th><th>Date</th></tr></thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id}>
                      <td>{p.type === 'user-monthly' ? 'Monthly Access' : 'One-Time Unlock'}</td>
                      <td className="fw-600">₹{p.amount}</td>
                      <td className="text-muted">{p.timestamp?.toDate?.().toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
