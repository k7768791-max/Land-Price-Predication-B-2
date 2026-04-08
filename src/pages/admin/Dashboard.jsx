import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase'
import DashboardLayout from '../../components/DashboardLayout'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, listings: 0, predictions: 0, revenue: 0, pendingListings: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [usersSnap, listingsSnap, predictionsSnap, paymentsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'listings')),
          getDocs(collection(db, 'predictions')),
          getDocs(collection(db, 'payments')),
        ])
        const revenue = paymentsSnap.docs.reduce((sum, d) => sum + (d.data().amount || 0), 0)
        const pendingListings = listingsSnap.docs.filter(d => !d.data().approved).length
        setStats({
          users: usersSnap.size,
          listings: listingsSnap.size,
          predictions: predictionsSnap.size,
          revenue,
          pendingListings,
        })
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  if (loading) return (
    <DashboardLayout role="admin">
      <div className="d-flex align-items-center justify-content-center" style={{ height: '80vh' }}>
        <div className="spinner-border" style={{ color: '#c9a84c' }} />
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout role="admin">
      <div className="lp-topbar">
        <div>
          <h5 className="fw-700 mb-0">Admin Dashboard</h5>
          <small className="text-muted">Full platform overview</small>
        </div>
      </div>

      <div className="lp-content">
        <div className="row g-4 mb-5">
          {[
            { label: 'Total Users', value: stats.users, icon: 'bi-people', color: '#3b82f6' },
            { label: 'Total Listings', value: stats.listings, icon: 'bi-buildings', color: '#8b5cf6' },
            { label: 'Total Predictions', value: stats.predictions, icon: 'bi-cpu', color: '#10b981' },
            { label: 'Total Revenue (₹)', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: 'bi-currency-rupee', color: '#c9a84c' },
          ].map(s => (
            <div className="col-md-6 col-lg-3" key={s.label}>
              <div className="lp-card p-4">
                <div className="d-flex align-items-center gap-3">
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: `${s.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`bi ${s.icon}`} style={{ fontSize: '1.6rem', color: s.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1a1a2e' }}>{s.value}</div>
                    <div className="text-muted small">{s.label}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {stats.pendingListings > 0 && (
          <div className="alert mb-4 d-flex align-items-center justify-content-between gap-3" style={{ background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: 12 }}>
            <div>
              <i className="bi bi-exclamation-triangle me-2" style={{ color: '#f59e0b' }} />
              <strong>{stats.pendingListings} listing(s)</strong> waiting for approval
            </div>
            <a href="/admin/listings" className="btn btn-sm btn-gold">Review Now</a>
          </div>
        )}

        {/* Quick links */}
        <div className="row g-4">
          {[
            { icon: 'bi-people', title: 'Manage Users', desc: 'View all users, roles, subscriptions', link: '/admin/users', color: '#3b82f6' },
            { icon: 'bi-buildings', title: 'Manage Listings', desc: 'Approve or reject property listings', link: '/admin/listings', color: '#8b5cf6' },
            { icon: 'bi-graph-up', title: 'Revenue Analytics', desc: 'Track payments and revenue trends', link: '/admin/revenue', color: '#c9a84c' },
          ].map(q => (
            <div className="col-md-4" key={q.title}>
              <a href={q.link} className="text-decoration-none">
                <div className="lp-card p-4 h-100 lp-card-gold">
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${q.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <i className={`bi ${q.icon}`} style={{ fontSize: '1.4rem', color: q.color }} />
                  </div>
                  <h6 className="fw-700">{q.title}</h6>
                  <p className="text-muted small mb-0">{q.desc}</p>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
