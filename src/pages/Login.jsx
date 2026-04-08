import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, loginWithGoogle, currentUser, userProfile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
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
      await loginWithGoogle()
    } catch (err) {
      setLoading(false)
      setError(err.message.replace('Firebase: ', '').replace(/\(.*\)/, '').trim())
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
    } catch (err) {
      setLoading(false)
      setError(err.message.replace('Firebase: ', '').replace(/\(.*\)/, '').trim())
    }
  }

  return (
    <div className="min-vh-100 d-flex" style={{ background: 'var(--off-white)' }}>
      {/* Left branding panel */}
      <div className="d-none d-lg-flex flex-column justify-content-center p-5" style={{ width: '45%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)' }}>
        <Link to="/" className="text-decoration-none mb-5" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>
          Land<span style={{ color: 'var(--accent)' }}>Pulse</span>
        </Link>
        <h2 className="text-white fw-800 mb-3">Welcome back to<br />your dashboard</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}>
          Access AI-powered land price predictions, manage listings, and grow your real estate portfolio.
        </p>
        <div className="mt-5">
          {['Real Estate Professionals', 'Land Buyers', 'Platform Admins'].map(r => (
            <div key={r} className="d-flex align-items-center gap-2 mb-2" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
              <i className="bi bi-check-circle-fill" style={{ color: 'var(--accent)' }} /> {r}
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
        <div style={{ maxWidth: 420, width: '100%' }}>
          <div className="lp-card p-4 p-md-5">
            <Link to="/" className="text-decoration-none d-lg-none mb-4 d-block" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
              Land<span style={{ color: 'var(--accent)' }}>Pulse</span>
            </Link>
            <h4 className="fw-800 mb-1" style={{ color: 'var(--primary)' }}>Sign In</h4>
            <p className="text-muted small mb-4">Enter your credentials to access your account</p>

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2" style={{ fontSize: '0.85rem', borderRadius: 8 }}>
                <i className="bi bi-exclamation-triangle-fill" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="lp-form">
              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
              </div>
              <button type="submit" className="btn btn-gold w-100 py-2 mb-3" disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Signing in...</> : 'Sign In'}
              </button>

              <div className="text-center position-relative mb-3">
                <hr style={{ borderColor: 'var(--border)' }} />
                <span className="position-absolute top-50 start-50 translate-middle px-2" style={{ background: 'white', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  or continue with
                </span>
              </div>

              <button type="button" onClick={handleGoogleLogin} className="btn w-100 py-2 d-flex align-items-center justify-content-center gap-2" style={{ border: '1px solid var(--border)', borderRadius: 8, background: 'white', color: 'var(--text-dark)', fontWeight: 600 }} disabled={loading}>
                <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
                Google
              </button>
            </form>

            <p className="text-center text-muted small mt-4 mb-0">
              Don't have an account? <Link to="/register" className="fw-600" style={{ color: 'var(--accent)' }}>Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
