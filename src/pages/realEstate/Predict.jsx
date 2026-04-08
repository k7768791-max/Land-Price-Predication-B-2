import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore'
import axios from 'axios'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'
import { RE_PLANS } from '../../utils/razorpay'

const initialForm = {
  city: '', state: '', city_tier: 2, zoning: 'Agricultural',
  land_area_sqft: '', dist_city_center_km: '', dist_highway_km: '',
  dist_transport_km: '', dist_amenities_km: '', historical_growth_pct: '',
  population_growth_pct: '', road_quality_score: '', utility_access: 1,
  govt_dev_plan: 1, flood_risk: 0, current_price: '',
}

const ZONING_OPTS = ['Agricultural', 'Residential', 'Commercial', 'Industrial', 'Mixed']
const CITIES = ['Jaipur', 'Mysuru', 'Nashik', 'Gwalior', 'Nagpur', 'Bhopal', 'Lucknow', 'Agra', 'Kanpur', 'Varanasi', 'Patna', 'Ranchi', 'Indore', 'Bhubaneswar', 'Coimbatore', 'Kochi', 'Surat', 'Vadodara', 'Rajkot', 'Ludhiana', 'Amritsar', 'Jabalpur', 'Raipur', 'Dehradun', 'Jodhpur', 'Udaipur']
const STATES = ['Rajasthan', 'Karnataka', 'Maharashtra', 'Madhya Pradesh', 'Uttar Pradesh', 'Bihar', 'Jharkhand', 'Odisha', 'Gujarat', 'Punjab', 'Chhattisgarh', 'Uttarakhand', 'Tamil Nadu', 'Kerala', 'Telangana', 'Andhra Pradesh']

export default function PredictPage() {
  const { currentUser, userProfile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sub = userProfile?.subscription || {}
  const isActive = sub.plan && sub.plan !== 'free' && sub.expiry?.toDate?.() > new Date()
  const predictionCount = sub.predictionCount || 0
  
  const limit = isActive && RE_PLANS[sub.plan] ? RE_PLANS[sub.plan].predictions : 2
  const canPredict = predictionCount < limit
  const remaining = limit === 999999 ? '∞' : Math.max(0, limit - predictionCount)

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setForm(p => ({ ...p, [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canPredict) {
      navigate('/realestate/subscription')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)

    try {
      const payload = {
        ...form,
        city_tier: Number(form.city_tier),
        land_area_sqft: Number(form.land_area_sqft),
        dist_city_center_km: Number(form.dist_city_center_km),
        dist_highway_km: Number(form.dist_highway_km),
        dist_transport_km: Number(form.dist_transport_km),
        dist_amenities_km: Number(form.dist_amenities_km),
        historical_growth_pct: Number(form.historical_growth_pct),
        population_growth_pct: Number(form.population_growth_pct),
        road_quality_score: Number(form.road_quality_score),
        utility_access: Number(form.utility_access),
        govt_dev_plan: Number(form.govt_dev_plan),
        flood_risk: Number(form.flood_risk),
        current_price: Number(form.current_price),
      }

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/predict`,
        payload
      )
      const data = res.data

      // Save prediction to Firestore
      await addDoc(collection(db, 'predictions'), {
        userId: currentUser.uid,
        inputs: form,
        result: data,
        timestamp: serverTimestamp(),
      })

      // Increment prediction count for all users
      await updateDoc(doc(db, 'users', currentUser.uid), {
        'subscription.predictionCount': increment(1),
      })
      await refreshProfile()

      setResult(data)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Prediction failed. Is the backend server running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout role="realEstate">
      <div className="lp-topbar">
        <div>
          <h5 className="fw-700 mb-0"><i className="bi bi-cpu me-2" />AI Land Price Prediction</h5>
          <small className="text-muted">
            {limit === 999999 ? 'Unlimited predictions' : `Predictions remaining: `}
            {limit !== 999999 && <strong style={{ color: remaining > 0 ? '#c9a84c' : '#dc3545' }}>{remaining}/{limit}</strong>}
          </small>
        </div>
      </div>

      <div className="lp-content">
        {/* Limit warning */}
        {!canPredict && (
          <div className="alert d-flex align-items-center justify-content-between gap-3 mb-4" style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 12 }}>
            <div><i className="bi bi-lock me-2" /><strong>Prediction limit reached.</strong> Upgrade to continue predictions.</div>
            <button className="btn btn-gold btn-sm" onClick={() => navigate('/realestate/subscription')}>Upgrade Plan</button>
          </div>
        )}

        <div className="row g-4">
          {/* Form */}
          <div className="col-lg-7">
            <div className="lp-card p-4">
              <h6 className="fw-700 mb-4">Enter Property Details</h6>
              <form onSubmit={handleSubmit} className="lp-form">
                <div className="row g-3">
                  {/* City & State */}
                  <div className="col-md-6">
                    <label className="form-label">City *</label>
                    <select className="form-select" name="city" value={form.city} onChange={handleChange} required>
                      <option value="">Select City</option>
                      {CITIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">State *</label>
                    <select className="form-select" name="state" value={form.state} onChange={handleChange} required>
                      <option value="">Select State</option>
                      {STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">City Tier</label>
                    <select className="form-select" name="city_tier" value={form.city_tier} onChange={handleChange}>
                      <option value={1}>Tier 1 (Metro)</option>
                      <option value={2}>Tier 2</option>
                      <option value={3}>Tier 3</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Zoning</label>
                    <select className="form-select" name="zoning" value={form.zoning} onChange={handleChange}>
                      {ZONING_OPTS.map(z => <option key={z}>{z}</option>)}
                    </select>
                  </div>

                  {/* Numeric fields */}
                  <div className="col-md-6">
                    <label className="form-label">Land Area (sqft) *</label>
                    <input type="number" className="form-control" name="land_area_sqft" value={form.land_area_sqft} onChange={handleChange} placeholder="e.g. 10776.99" required step="0.01" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Current Price/sqft (₹) *</label>
                    <input type="number" className="form-control" name="current_price" value={form.current_price} onChange={handleChange} placeholder="e.g. 4830.36" required step="0.01" />
                  </div>

                  <div className="col-12"><hr className="my-1" /><p className="text-muted small fw-600 mb-0">Distance & Infrastructure</p></div>
                  <div className="col-md-6">
                    <label className="form-label">Dist. City Center (km)</label>
                    <input type="number" className="form-control" name="dist_city_center_km" value={form.dist_city_center_km} onChange={handleChange} placeholder="18.43" required step="0.01" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Dist. Highway (km)</label>
                    <input type="number" className="form-control" name="dist_highway_km" value={form.dist_highway_km} onChange={handleChange} placeholder="0.94" required step="0.01" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Dist. Transport (km)</label>
                    <input type="number" className="form-control" name="dist_transport_km" value={form.dist_transport_km} onChange={handleChange} placeholder="2.77" required step="0.01" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Dist. Amenities (km)</label>
                    <input type="number" className="form-control" name="dist_amenities_km" value={form.dist_amenities_km} onChange={handleChange} placeholder="1.83" required step="0.01" />
                  </div>

                  <div className="col-12"><hr className="my-1" /><p className="text-muted small fw-600 mb-0">Growth & Quality</p></div>
                  <div className="col-md-4">
                    <label className="form-label">Historical Growth %</label>
                    <input type="number" className="form-control" name="historical_growth_pct" value={form.historical_growth_pct} onChange={handleChange} placeholder="14.17" required step="0.01" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Population Growth %</label>
                    <input type="number" className="form-control" name="population_growth_pct" value={form.population_growth_pct} onChange={handleChange} placeholder="2.08" required step="0.01" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Road Quality (1-10)</label>
                    <input type="number" className="form-control" name="road_quality_score" value={form.road_quality_score} onChange={handleChange} placeholder="5.89" required step="0.01" min="0" max="10" />
                  </div>

                  <div className="col-12"><hr className="my-1" /><p className="text-muted small fw-600 mb-0">Boolean Factors</p></div>
                  <div className="col-md-4">
                    <label className="form-label">Utility Access</label>
                    <select className="form-select" name="utility_access" value={form.utility_access} onChange={handleChange}>
                      <option value={1}>Yes</option>
                      <option value={0}>No</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Govt. Dev. Plan</label>
                    <select className="form-select" name="govt_dev_plan" value={form.govt_dev_plan} onChange={handleChange}>
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
                </div>

                {error && (
                  <div className="alert alert-danger mt-3 py-2" style={{ borderRadius: 8, fontSize: '0.85rem' }}>
                    <i className="bi bi-exclamation-triangle me-2" />{error}
                  </div>
                )}

                <button type="submit" className="btn btn-gold w-100 mt-4 py-2" disabled={loading || (!canPredict)}>
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2" />Predicting...</>
                  ) : !canPredict ? (
                    <><i className="bi bi-lock me-2" />Upgrade to Predict</>
                  ) : (
                    <><i className="bi bi-play-fill me-2" />Predict Future Land Price</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Result panel */}
          <div className="col-lg-5">
            {!result ? (
              <div className="lp-card p-4 h-100 d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
                <div className="text-center" style={{ color: '#adb5bd' }}>
                  <i className="bi bi-graph-up-arrow mb-3 d-block" style={{ fontSize: '4rem' }} />
                  <p className="mb-0">Fill in the form and click Predict to see AI results</p>
                </div>
              </div>
            ) : (
              <div className="prediction-result animate-in">
                <div className="d-flex align-items-center gap-2 mb-4">
                  <i className="bi bi-check-circle-fill" style={{ color: '#4ade80', fontSize: '1.4rem' }} />
                  <div>
                    <div className="fw-700 fs-6">Prediction Complete</div>
                    <div style={{ opacity: 0.6, fontSize: '0.8rem' }}>{form.city}, {form.state} • {form.zoning}</div>
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <div className="metric-box">
                      <div className="metric-label">Current Price/sqft</div>
                      <div className="metric-value">₹{result.current_price_per_sqft?.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="metric-box">
                      <div className="metric-label">Future Price/sqft</div>
                      <div className="metric-value accent">₹{result.future_price_per_sqft?.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="metric-box">
                      <div className="metric-label">Expected Profit</div>
                      <div className="metric-value profit">₹{result.expected_profit_per_sqft?.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="metric-box">
                      <div className="metric-label">Return on Investment</div>
                      <div className="metric-value profit">{result.roi_percent}%</div>
                    </div>
                  </div>
                </div>

                {/* Total land values */}
                <div className="p-3 rounded-3 mb-3" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="row">
                    <div className="col-6 border-end" style={{ borderColor: 'rgba(255,255,255,0.15) !important' }}>
                      <div style={{ fontSize: '0.72rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Total Value</div>
                      <div className="fw-700" style={{ fontSize: '1rem' }}>₹{(form.current_price * form.land_area_sqft).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                    </div>
                    <div className="col-6 ps-3">
                      <div style={{ fontSize: '0.72rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Future Total Value</div>
                      <div className="fw-700" style={{ fontSize: '1rem', color: '#c9a84c' }}>₹{(result.future_price_per_sqft * form.land_area_sqft).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', opacity: 0.5, textAlign: 'center', marginBottom: '1rem' }}>
                  Powered by XGBoost AI Model • Prediction saved to history
                </div>

                <button 
                  className="btn btn-light w-100 py-2 fw-700 mt-2" 
                  style={{ color: 'var(--primary)' }}
                  onClick={() => navigate('/realestate/post', { state: { ...form, predictedPrice: result.future_price_per_sqft } })}
                >
                  <i className="bi bi-list-ul me-2"></i> List this Property
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
