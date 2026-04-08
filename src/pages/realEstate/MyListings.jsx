import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'

export default function MyListings() {
  const { currentUser } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    try {
      const q = query(collection(db, 'listings'), where('postedBy', '==', currentUser.uid))
      const snap = await getDocs(q)
      
      const sortedListings = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
        
      setListings(sortedListings)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [currentUser.uid])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return
    await deleteDoc(doc(db, 'listings', id))
    setListings(p => p.filter(l => l.id !== id))
  }

  return (
    <DashboardLayout role="realEstate">
      <div className="lp-topbar">
        <div>
          <h5 className="fw-700 mb-0">My Listings</h5>
          <small className="text-muted">{listings.length} properties posted</small>
        </div>
        <Link to="/realestate/post" className="btn btn-gold btn-sm">
          <i className="bi bi-plus-lg me-1" />Post New
        </Link>
      </div>

      <div className="lp-content">
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border" style={{ color: '#c9a84c' }} /></div>
        ) : listings.length === 0 ? (
          <div className="lp-card p-5 text-center">
            <i className="bi bi-buildings mb-3 d-block" style={{ fontSize: '3.5rem', color: '#dee2e6' }} />
            <h6 className="fw-700 mb-1">No listings yet</h6>
            <p className="text-muted small mb-3">Post your first land listing to get started</p>
            <Link to="/realestate/post" className="btn btn-gold">Post a Listing</Link>
          </div>
        ) : (
          <div className="lp-card">
            <div className="table-responsive">
              <table className="table lp-table mb-0">
                <thead>
                  <tr><th>Property</th><th>Location</th><th>Zoning</th><th>Price/sqft</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {listings.map(l => (
                    <tr key={l.id}>
                      <td className="fw-600">{l.title}</td>
                      <td className="text-muted">{l.city}, {l.state}</td>
                      <td><span className="badge bg-secondary">{l.zoning}</span></td>
                      <td className="fw-600" style={{ color: '#c9a84c' }}>₹{Number(l.price).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${l.approved ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {l.approved ? '✓ Live' : '⏳ Pending'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(l.id)}>
                          <i className="bi bi-trash" />
                        </button>
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
