import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../firebase'
import DashboardLayout from '../../components/DashboardLayout'

const ZONING_COLORS = { Agricultural: 'success', Residential: 'primary', Commercial: 'warning', Industrial: 'danger' }

export default function UserListings() {
  const [listings, setListings] = useState([])
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ city: '', zoning: '', minPrice: '', maxPrice: '' })

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, 'listings'), where('approved', '==', true))
        const snap = await getDocs(q)
        const data = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        setAll(data)
        setListings(data)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  const applyFilters = () => {
    let filtered = [...all]
    if (filters.city) filtered = filtered.filter(l => l.city?.toLowerCase().includes(filters.city.toLowerCase()))
    if (filters.zoning) filtered = filtered.filter(l => l.zoning === filters.zoning)
    if (filters.minPrice) filtered = filtered.filter(l => Number(l.price) >= Number(filters.minPrice))
    if (filters.maxPrice) filtered = filtered.filter(l => Number(l.price) <= Number(filters.maxPrice))
    setListings(filtered)
  }

  const resetFilters = () => {
    setFilters({ city: '', zoning: '', minPrice: '', maxPrice: '' })
    setListings(all)
  }

  return (
    <DashboardLayout role="user">
      <div className="lp-topbar">
        <div>
          <h5 className="fw-700 mb-0">Browse Land Listings</h5>
          <small className="text-muted">{listings.length} properties available</small>
        </div>
      </div>

      <div className="lp-content">
        {/* Filters */}
        <div className="lp-card p-3 mb-4">
          <div className="row g-3 align-items-end lp-form">
            <div className="col-md-3">
              <label className="form-label">City</label>
              <input className="form-control" placeholder="Search city..." value={filters.city}
                onChange={e => setFilters(p => ({ ...p, city: e.target.value }))} />
            </div>
            <div className="col-md-2">
              <label className="form-label">Zoning</label>
              <select className="form-select" value={filters.zoning} onChange={e => setFilters(p => ({ ...p, zoning: e.target.value }))}>
                <option value="">All</option>
                <option>Agricultural</option>
                <option>Residential</option>
                <option>Commercial</option>
                <option>Industrial</option>
                <option>Mixed</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Min Price/sqft</label>
              <input type="number" className="form-control" placeholder="₹" value={filters.minPrice}
                onChange={e => setFilters(p => ({ ...p, minPrice: e.target.value }))} />
            </div>
            <div className="col-md-2">
              <label className="form-label">Max Price/sqft</label>
              <input type="number" className="form-control" placeholder="₹" value={filters.maxPrice}
                onChange={e => setFilters(p => ({ ...p, maxPrice: e.target.value }))} />
            </div>
            <div className="col-md-3 d-flex gap-2">
              <button className="btn btn-gold flex-grow-1" onClick={applyFilters}>
                <i className="bi bi-search me-1" />Filter
              </button>
              <button className="btn btn-outline-dark-custom" onClick={resetFilters}><i className="bi bi-x-lg" /></button>
            </div>
          </div>
        </div>

        {/* Listing grid */}
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border" style={{ color: '#c9a84c' }} /></div>
        ) : listings.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-search" style={{ fontSize: '3rem' }} /><br />
            <span>No listings match your filters</span>
          </div>
        ) : (
          <div className="row g-4">
            {listings.map(l => (
              <div className="col-md-6 col-lg-4" key={l.id}>
                <div className="listing-card h-100">
                  <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #0f3460)', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="bi bi-geo-alt-fill" style={{ fontSize: '2.5rem', color: '#c9a84c' }} />
                  </div>
                  <div className="p-3">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h6 className="fw-700 mb-0" style={{ color: '#1a1a2e', fontSize: '0.95rem' }}>{l.title}</h6>
                      <span className={`badge bg-${ZONING_COLORS[l.zoning] || 'secondary'}`} style={{ fontSize: '0.68rem' }}>{l.zoning}</span>
                    </div>
                    <p className="text-muted mb-2" style={{ fontSize: '0.83rem' }}><i className="bi bi-geo-alt me-1" />{l.city}, {l.state}</p>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#c9a84c' }}>₹{Number(l.price).toLocaleString()}</span>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>/sqft</span>
                      </div>
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>{Number(l.area).toLocaleString()} sqft</span>
                    </div>
                    <Link to={`/land/${l.id}`} className="btn btn-gold w-100 btn-sm">View Details</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
