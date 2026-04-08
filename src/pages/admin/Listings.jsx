import { useState, useEffect } from 'react'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import DashboardLayout from '../../components/DashboardLayout'

export default function AdminListings() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  const fetch = async () => {
    try {
      const snap = await getDocs(collection(db, 'listings'))
      setListings(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const handleApprove = async (id, approve) => {
    await updateDoc(doc(db, 'listings', id), { approved: approve })
    setListings(p => p.map(l => l.id === id ? { ...l, approved: approve } : l))
  }

  const filtered = filter === 'all' ? listings
    : filter === 'pending' ? listings.filter(l => !l.approved)
      : listings.filter(l => l.approved)

  return (
    <DashboardLayout role="admin">
      <div className="lp-topbar">
        <div>
          <h5 className="fw-700 mb-0">Manage Listings</h5>
          <small className="text-muted">
            <span className="text-warning fw-600">{listings.filter(l => !l.approved).length}</span> pending · {listings.filter(l => l.approved).length} live
          </small>
        </div>
        <div className="btn-group btn-group-sm">
          {['pending', 'approved', 'all'].map(f => (
            <button key={f} className={`btn ${filter === f ? 'btn-gold' : 'btn-outline-dark-custom'}`}
              onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="lp-content">
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border" style={{ color: '#c9a84c' }} /></div>
        ) : filtered.length === 0 ? (
          <div className="lp-card p-5 text-center text-muted">
            <i className="bi bi-buildings mb-3 d-block" style={{ fontSize: '3rem' }} />
            <span>No listings in this category</span>
          </div>
        ) : (
          <div className="lp-card">
            <div className="table-responsive">
              <table className="table lp-table mb-0">
                <thead>
                  <tr><th>Property</th><th>Agent</th><th>Location</th><th>Zoning</th><th>Price</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map(l => (
                    <tr key={l.id}>
                      <td className="fw-600" style={{ maxWidth: 160 }}>{l.title}</td>
                      <td className="text-muted small">{l.postedByName || '—'}</td>
                      <td className="text-muted small">{l.city}, {l.state}</td>
                      <td><span className="badge bg-secondary">{l.zoning}</span></td>
                      <td className="fw-600" style={{ color: '#c9a84c' }}>₹{Number(l.price).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${l.approved ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {l.approved ? 'Live' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          {!l.approved && (
                            <button className="btn btn-sm btn-success" onClick={() => handleApprove(l.id, true)}>
                              <i className="bi bi-check-lg" /> Approve
                            </button>
                          )}
                          {l.approved && (
                            <button className="btn btn-sm btn-outline-warning" onClick={() => handleApprove(l.id, false)}>
                              <i className="bi bi-pause" /> Unpublish
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
