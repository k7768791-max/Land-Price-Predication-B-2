import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'

const ZONING_OPTS = ['Agricultural', 'Residential', 'Commercial', 'Industrial', 'Mixed']
const STATES = ['Rajasthan', 'Karnataka', 'Maharashtra', 'Madhya Pradesh', 'Uttar Pradesh', 'Bihar', 'Jharkhand', 'Odisha', 'Gujarat', 'Punjab', 'Chhattisgarh', 'Uttarakhand', 'Tamil Nadu', 'Kerala', 'Telangana', 'Andhra Pradesh']

const initialForm = {
  title: '', city: '', state: '', zoning: 'Residential', price: '', area: '',
  city_tier: 2, description: '', contactName: '', contactPhone: '', contactEmail: '',
  dist_city_center_km: '', dist_highway_km: '', utility_access: 1, govt_dev_plan: 0, flood_risk: 0,
}

export default function PostListing() {
  const { currentUser, userProfile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sub = userProfile?.subscription || {}
  const isActive = sub.plan !== 'free' && sub.expiry?.toDate?.() > new Date()
  
  const predictedData = location.state || null

  useEffect(() => {
    if (predictedData) {
      setForm(p => ({
        ...p,
        city: predictedData.city || '',
        state: predictedData.state || '',
        zoning: predictedData.zoning || 'Residential',
        price: predictedData.current_price || '',
        area: predictedData.land_area_sqft || '',
        city_tier: predictedData.city_tier || 2,
        dist_city_center_km: predictedData.dist_city_center_km || '',
        dist_highway_km: predictedData.dist_highway_km || '',
        utility_access: predictedData.utility_access !== undefined ? predictedData.utility_access : 1,
        govt_dev_plan: predictedData.govt_dev_plan !== undefined ? predictedData.govt_dev_plan : 0,
        flood_risk: predictedData.flood_risk !== undefined ? predictedData.flood_risk : 0,
      }))
    }
  }, [predictedData])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setForm(p => ({ ...p, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isActive) {
      setError('You need an active subscription to post listings. Please upgrade.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await addDoc(collection(db, 'listings'), {
        ...form,
        price: Number(form.price),
        area: Number(form.area),
        city_tier: Number(form.city_tier),
        dist_city_center_km: Number(form.dist_city_center_km) || 0,
        dist_highway_km: Number(form.dist_highway_km) || 0,
        utility_access: Number(form.utility_access),
        govt_dev_plan: Number(form.govt_dev_plan),
        flood_risk: Number(form.flood_risk),
        predicted_price_sqft: predictedData?.predictedPrice || null,
        postedBy: currentUser.uid,
        postedByName: userProfile?.name,
        approved: false,
        createdAt: serverTimestamp(),
      })
      navigate('/realestate/listings')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout role="realEstate">
      <div className="lp-topbar">
        <div>
          <h5 className="fw-700 mb-0">Post New Listing</h5>
          <small className="text-muted">Fill in property details for admin review</small>
        </div>
      </div>

      <div className="lp-content">
        {!isActive && (
          <div className="alert mb-4" style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 12 }}>
            <i className="bi bi-info-circle me-2" /><strong>Subscription required</strong> to post listings.
            <a href="/realestate/subscription" style={{ color: '#c9a84c', marginLeft: 8 }}>Upgrade now →</a>
          </div>
        )}

        <div className="lp-card p-4" style={{ maxWidth: 700 }}>
          <form onSubmit={handleSubmit} className="lp-form">
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Property Title *</label>
                <input className="form-control" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Prime Agricultural Land in Jaipur" required />
              </div>
              <div className="col-md-6">
                <label className="form-label">City *</label>
                <input className="form-control" name="city" value={form.city} onChange={handleChange} placeholder="City" required />
              </div>
              <div className="col-md-6">
                <label className="form-label">State *</label>
                <select className="form-select" name="state" value={form.state} onChange={handleChange} required>
                  <option value="">Select State</option>
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Zoning</label>
                <select className="form-select" name="zoning" value={form.zoning} onChange={handleChange}>
                  {ZONING_OPTS.map(z => <option key={z}>{z}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Price / sqft (₹) *</label>
                <input type="number" className="form-control" name="price" value={form.price} onChange={handleChange} placeholder="4830" required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Total Area (sqft) *</label>
                <input type="number" className="form-control" name="area" value={form.area} onChange={handleChange} placeholder="10000" required />
              </div>
              <div className="col-md-4">
                <label className="form-label">City Tier</label>
                <select className="form-select" name="city_tier" value={form.city_tier} onChange={handleChange}>
                  <option value={1}>Tier 1</option>
                  <option value={2}>Tier 2</option>
                  <option value={3}>Tier 3</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Utility Access</label>
                <select className="form-select" name="utility_access" value={form.utility_access} onChange={handleChange}>
                  <option value={1}>Yes</option>
                  <option value={0}>No</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Flood Risk</label>
                <select className="form-select" name="flood_risk" value={form.flood_risk} onChange={handleChange}>
                  <option value={0}>No</option>
                  <option value={1}>Yes</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe the property..." />
              </div>
              <div className="col-12"><hr className="my-1" /><p className="text-muted small fw-600">Contact Details (shown after payment)</p></div>
              <div className="col-md-4">
                <label className="form-label">Contact Name *</label>
                <input className="form-control" name="contactName" value={form.contactName} onChange={handleChange} placeholder="Your Name" required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Phone *</label>
                <input className="form-control" name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Email *</label>
                <input type="email" className="form-control" name="contactEmail" value={form.contactEmail} onChange={handleChange} placeholder="contact@email.com" required />
              </div>
            </div>

            {error && <div className="alert alert-danger mt-3 py-2" style={{ fontSize: '0.85rem', borderRadius: 8 }}>{error}</div>}

            <div className="d-flex gap-3 mt-4">
              <button type="submit" className="btn btn-gold" disabled={loading || !isActive}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Submitting...</> : 'Submit for Review'}
              </button>
              <button type="button" className="btn btn-outline-dark-custom" onClick={() => navigate('/realestate/listings')}>Cancel</button>
            </div>
            <p className="text-muted small mt-2 mb-0"><i className="bi bi-info-circle me-1" />Listing will be reviewed by admin before going live.</p>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
