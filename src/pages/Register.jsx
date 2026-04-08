import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLES = [
  { value: 'user', label: 'Property Buyer / Investor', icon: 'bi-person', desc: 'Browse listings, view price predictions, contact sellers' },
  { value: 'realEstate', label: 'Real Estate Agent / Company', icon: 'bi-buildings', desc: 'Post listings, use AI predictions, manage properties' },
]

export default function Register() {
  const { register, loginWithGoogle, currentUser, userProfile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'user' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (currentUser && userProfile) {
      if (userProfile.role === 'admin') navigate('/admin')
      else if (userProfile.role === 'realEstate') navigate('/realestate')
      else navigate('/user')
    }
  }, [currentUser, userProfile, navigate])

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      await loginWithGoogle(form.role)
    } catch (err) {
      setLoading(false)
      setError(err.message.replace('Firebase: ', '').replace(/\(.*\)/, '').trim())
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    setError('')
    setLoading(true)
    try {
      await register(form.email, form.password, form.role, form.name)
    } catch (err) {
      setLoading(false)
      setError(err.message.replace('Firebase: ', '').replace(/\(.*\)/, '').trim())
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-4" style={{ background: 'var(--off-white)' }}>
      <div style={{ maxWidth: 520, width: '100%' }}>
        <div className="text-center mb-4">
          <Link to="/" className="text-decoration-none" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
            Land<span style={{ color: 'var(--accent)' }}>Pulse</span>
          </Link>
          <h5 className="fw-700 mt-2 mb-0">Create your account</h5>
          <p className="text-muted small">Join thousands of real estate professionals</p>
        </div>

        <div className="lp-card p-4">
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2" style={{ fontSize: '0.85rem', borderRadius: 8 }}>
              <i className="bi bi-exclamation-triangle-fill" /> {error}
            </div>
          )}

          {/* Role Selection */}
          <div className="mb-4">
            <label className="form-label fw-600">I am a...</label>
            <div className="row g-3">
              {ROLES.map(r => (
                <div className="col-6" key={r.value}>
                  <div
                    className="p-3 text-center"
                    style={{
                      border: `2px solid ${form.role === r.value ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 12,
                      cursor: 'pointer',
                      background: form.role === r.value ? 'rgba(0,0,0,0.02)' : 'white',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => setForm(p => ({ ...p, role: r.value }))}
                  >
                    <i className={`bi ${r.icon} d-block mb-2`} style={{ fontSize: '1.6rem', color: form.role === r.value ? 'var(--accent)' : 'var(--text-muted)' }} />
                    <div className="fw-600" style={{ fontSize: '0.82rem', color: form.role === r.value ? 'var(--primary)' : 'var(--text-muted)' }}>{r.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="lp-form">
            <div className="row g-3 mb-3">
              <div className="col-12">
                <label className="form-label">Full Name</label>
                <input className="form-control" placeholder="Your Name" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="col-12">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
              <div className="col-6">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" placeholder="••••••••" value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
              </div>
              <div className="col-6">
                <label className="form-label">Confirm Password</label>
                <input type="password" className="form-control" placeholder="••••••••" value={form.confirmPassword}
                  onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} required />
              </div>
            </div>

            <button type="submit" className="btn btn-gold w-100 py-2 mb-3" disabled={loading}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2" />Creating account...</> : 'Create Account'}
            </button>

            <div className="text-center position-relative mb-3">
              <hr style={{ borderColor: 'var(--border)' }} />
              <span className="position-absolute top-50 start-50 translate-middle px-2" style={{ background: 'white', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                or sign up with
              </span>
            </div>

            <button type="button" onClick={handleGoogleLogin} className="btn w-100 py-2 d-flex align-items-center justify-content-center gap-2" style={{ border: '1px solid var(--border)', borderRadius: 8, background: 'white', color: 'var(--text-dark)', fontWeight: 600 }} disabled={loading}>
              <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
              Google
            </button>
          </form>

          <p className="text-center text-muted small mt-3 mb-0">
            Already have an account? <Link to="/login" className="fw-600" style={{ color: 'var(--accent)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
