import { useState, useEffect } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../../firebase'
import DashboardLayout from '../../components/DashboardLayout'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'))
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase())
  )

  const roleBadge = (role) => {
    const cls = { user: 'role-user', realEstate: 'role-realEstate', admin: 'role-admin' }
    const label = { user: 'User', realEstate: 'Real Estate', admin: 'Admin' }
    return <span className={`role-badge ${cls[role] || 'role-user'}`}>{label[role] || role}</span>
  }

  const planBadge = (plan) => {
    const colors = { free: 'secondary', monthly: 'primary', quarterly: 'success', yearly: 'warning' }
    return <span className={`badge bg-${colors[plan] || 'secondary'} text-capitalize`}>{plan || 'free'}</span>
  }

  return (
    <DashboardLayout role="admin">
      <div className="lp-topbar">
        <div>
          <h5 className="fw-700 mb-0">Users</h5>
          <small className="text-muted">{users.length} registered users</small>
        </div>
      </div>

      <div className="lp-content">
        <div className="lp-card">
          <div className="p-4 pb-0">
            <input className="form-control" style={{ maxWidth: 320, borderRadius: 8 }} placeholder="Search by name or email..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border" style={{ color: '#c9a84c' }} /></div>
          ) : (
            <div className="table-responsive p-3">
              <table className="table lp-table mb-0">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Plan</th><th>Predictions</th><th>Joined</th></tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id}>
                      <td className="fw-600">{u.name || '—'}</td>
                      <td className="text-muted small">{u.email}</td>
                      <td>{roleBadge(u.role)}</td>
                      <td>{planBadge(u.subscription?.plan)}</td>
                      <td>{u.subscription?.predictionCount || 0}</td>
                      <td className="text-muted small">{u.createdAt?.toDate?.().toLocaleDateString('en-IN') || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <div className="text-center py-4 text-muted">No users found</div>}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
