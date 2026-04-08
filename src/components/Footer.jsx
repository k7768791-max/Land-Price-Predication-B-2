import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="lp-footer mt-auto">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="brand mb-2">Land<span>Pulse</span></div>
            <p className="small" style={{ color: 'rgba(255,255,255,0.55)' }}>
              AI-powered future land price prediction platform for smart real estate decisions in India.
            </p>
          </div>
          <div className="col-md-3">
            <h6 className="text-white fw-700 mb-3">Platform</h6>
            <ul className="list-unstyled small">
              <li className="mb-1"><Link to="/" className="text-white-50 text-decoration-none">Home</Link></li>
              <li className="mb-1"><Link to="/register" className="text-white-50 text-decoration-none">Register</Link></li>
              <li className="mb-1"><Link to="/login" className="text-white-50 text-decoration-none">Login</Link></li>
            </ul>
          </div>
          <div className="col-md-3">
            <h6 className="text-white fw-700 mb-3">For Users</h6>
            <ul className="list-unstyled small">
              <li className="mb-1"><span className="text-white-50">Browse Listings</span></li>
              <li className="mb-1"><span className="text-white-50">Contact Sellers</span></li>
              <li className="mb-1"><span className="text-white-50">Price Insights</span></li>
            </ul>
          </div>
          <div className="col-md-2">
            <h6 className="text-white fw-700 mb-3">For Agents</h6>
            <ul className="list-unstyled small">
              <li className="mb-1"><span className="text-white-50">AI Prediction</span></li>
              <li className="mb-1"><span className="text-white-50">List Property</span></li>
              <li className="mb-1"><span className="text-white-50">Subscriptions</span></li>
            </ul>
          </div>
        </div>
        <hr className="border-secondary mt-4" />
        <div className="d-flex flex-wrap justify-content-between align-items-center small" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <span>© 2026 LandPulse. All rights reserved.</span>
          <span>Powered by XGBoost AI Model</span>
        </div>
      </div>
    </footer>
  )
}
