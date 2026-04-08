import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const ZONING_COLORS = {
  Agricultural: 'success',
  Residential: 'primary',
  Commercial: 'warning',
  Industrial: 'danger',
  Mixed: 'info',
}

export default function Home() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const q = query(collection(db, 'listings'), where('approved', '==', true), orderBy('createdAt', 'desc'), limit(6))
        const snap = await getDocs(q)
        setListings(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchListings()
  }, [])

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      {/* Section 1: Slider of 4 images */}
      <section className="position-relative" style={{ height: '85vh', overflow: 'hidden' }}>
        <div id="homeCarousel" className="carousel slide carousel-fade h-100" data-bs-ride="carousel">
          <div className="carousel-indicators">
            <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="0" className="active"></button>
            <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="1"></button>
            <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="2"></button>
            <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="3"></button>
          </div>
          <div className="carousel-inner h-100">
            {/* Slide 1 */}
            <div className="carousel-item active h-100">
              <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1920" className="d-block w-100 h-100 object-fit-cover" alt="Modern Building" style={{ filter: 'brightness(0.5)' }} />
              <div className="carousel-caption d-flex flex-column justify-content-center h-100 pb-0" style={{ top: 0 }}>
                <h1 className="display-3 fw-900 text-white mb-3" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>Discover Prime Properties</h1>
                <p className="lead text-white-50 mb-4 px-md-5">Find the perfect commercial and residential spaces built for the future.</p>
                <div><Link to="/user/listings" className="btn btn-gold btn-lg px-5">Explore Now</Link></div>
              </div>
            </div>
            {/* Slide 2 */}
            <div className="carousel-item h-100">
              <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1920" className="d-block w-100 h-100 object-fit-cover" alt="Vast Lands" style={{ filter: 'brightness(0.5)' }} />
              <div className="carousel-caption d-flex flex-column justify-content-center h-100 pb-0" style={{ top: 0 }}>
                <h1 className="display-3 fw-900 text-white mb-3" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>Vast Agricultural Land</h1>
                <p className="lead text-white-50 mb-4 px-md-5">Invest in high-yield agricultural plots with certified zoning and accurate histories.</p>
                <div><Link to="/register" className="btn btn-gold btn-lg px-5">Get Started</Link></div>
              </div>
            </div>
            {/* Slide 3 */}
            <div className="carousel-item h-100">
              <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1920" className="d-block w-100 h-100 object-fit-cover" alt="Luxury Homes" style={{ filter: 'brightness(0.5)' }} />
              <div className="carousel-caption d-flex flex-column justify-content-center h-100 pb-0" style={{ top: 0 }}>
                <h1 className="display-3 fw-900 text-white mb-3" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>Luxury Residential Assets</h1>
                <p className="lead text-white-50 mb-4 px-md-5">Premium listings hand-picked for high ROI and outstanding build quality.</p>
                <div><Link to="/login" className="btn btn-gold btn-lg px-5">View Insights</Link></div>
              </div>
            </div>
            {/* Slide 4 */}
            <div className="carousel-item h-100">
              <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1920" className="d-block w-100 h-100 object-fit-cover" alt="Cityscape" style={{ filter: 'brightness(0.5)' }} />
              <div className="carousel-caption d-flex flex-column justify-content-center h-100 pb-0" style={{ top: 0 }}>
                <h1 className="display-3 fw-900 text-white mb-3" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>Urban Masterpieces</h1>
                <p className="lead text-white-50 mb-4 px-md-5">Invest in rapidly growing metropolitan zones guided by advanced AI analytics.</p>
                <div><Link to="/user/listings" className="btn btn-gold btn-lg px-5">Check the Land</Link></div>
              </div>
            </div>
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#homeCarousel" data-bs-slide="prev">
            <span className="carousel-control-prev-icon"></span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#homeCarousel" data-bs-slide="next">
            <span className="carousel-control-next-icon"></span>
          </button>
        </div>
      </section>

      {/* Section 2: About the Real Estate */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0 pe-lg-5">
              <h2 className="fw-800" style={{ color: 'var(--primary)', fontSize: '2.5rem' }}>The Evolution of Real Estate</h2>
              <div className="mt-4">
                <p className="text-muted" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
                  Real estate has transformed from a traditional, localized business into a hyper-connected, data-driven global market.
                  Today's properties are valued not just by brick and mortar, but by their proximity to emerging tech hubs, infrastructural
                  developments, and micro-economic metrics.
                </p>
                <p className="text-muted" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
                  At LandPulse, we embrace this modern paradigm. We cater to every vertical—from massive agricultural acreages to sleek
                  urban skyscrapers. We harness big data to decode zoning laws, track historical appreciation rates, and evaluate future
                  government projects, providing a crystal-clear lens into what a property is truly worth today—and tomorrow.
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="position-relative">
                <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="About Real Estate" className="img-fluid rounded-4 shadow-lg" />
                <div className="position-absolute bg-white p-4 rounded-3 shadow" style={{ bottom: '-30px', left: '-30px' }}>
                  <div className="fw-800 fs-3" style={{ color: 'var(--accent)' }}>$20 Trillion+</div>
                  <div className="text-muted small fw-600">Global Market Value Analyzed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: How can select the best property */}
      <section className="py-5" style={{ background: 'var(--off-white)' }}>
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="fw-800" style={{ color: 'var(--primary)', fontSize: '2.5rem' }}>How To Select The Best Property</h2>
            <p className="text-muted lead">A comprehensive guide to making foolproof real estate investments</p>
          </div>
          <div className="row g-4 position-relative">
            {/* Steps */}
            {[
              {
                step: '01',
                title: 'Data-Driven Location Scouting',
                desc: 'Always prioritize location, but look beyond the obvious. Check distance to highways, emerging transport hubs, and future government developmental zones.',
                icon: 'bi-geo-alt'
              },
              {
                step: '02',
                title: 'Check Zoning & Legal Compliance',
                desc: 'A plot is only as valuable as what you can legally build on it. Ensure the zoning (Agricultural vs Commercial) aligns with your investment horizon.',
                icon: 'bi-file-earmark-check'
              },
              {
                step: '03',
                title: 'Analyze Historical Trends',
                desc: 'Historical population growth and past price appreciations are excellent predictors. Use tools that map minimum 5-year historical growth percentages.',
                icon: 'bi-bar-chart-line'
              },
              {
                step: '04',
                title: 'Evaluate Environmental Risks',
                desc: 'Assess physical risks such as flood zones and structural soil quality. Even the cheapest land is a bad investment if it is ecologically vulnerable.',
                icon: 'bi-shield-exclamation'
              }
            ].map((s, idx) => (
              <div className="col-lg-3 col-md-6" key={s.step}>
                <div className="lp-card p-4 h-100 border-0 shadow-sm text-center" style={{ transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div className="mb-3 d-flex justify-content-center">
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`bi ${s.icon}`} style={{ fontSize: '2rem', color: 'var(--accent)' }}></i>
                    </div>
                  </div>
                  <h5 className="fw-700 mb-2" style={{ color: 'var(--primary)' }}>{s.title}</h5>
                  <p className="text-muted small">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Real Estate Features */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)' }}>
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-lg-5 mb-5 mb-lg-0 text-white pe-lg-5">
              <h2 className="fw-800 mb-4" style={{ fontSize: '2.5rem' }}>Platform Features</h2>
              <p className="lead mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
                LandPulse brings institutional-grade analysis down to the retail investor. Experience unprecedented transparency.
              </p>
              <ul className="list-unstyled">
                {['Predictive XGBoost Engine', 'Real-time ROI Tracking', 'Automated Risk Assessment (Flood & Zoning)', 'Direct Seller Connectivity'].map(f => (
                  <li key={f} className="mb-3 d-flex align-items-center fw-600" style={{ fontSize: '1.1rem' }}>
                    <i className="bi bi-check-circle-fill me-3" style={{ color: 'var(--accent)' }}></i>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="btn btn-lg mt-4 px-5 fw-700" style={{ background: 'var(--accent)', color: 'white', border: 'none' }}>Start Your Journey</Link>
            </div>
            <div className="col-lg-7">
              <div className="row g-4">
                {[
                  { icon: 'bi-cpu', title: 'AI Driven', desc: 'Models trained on millions of data points.' },
                  { icon: 'bi-shield-check', title: 'Verified', desc: '100% manually vetted legal documents.' },
                  { icon: 'bi-globe-central-south-asia', title: 'Pan-India', desc: 'Covering 50+ major cities and expanding.' },
                  { icon: 'bi-lightning-charge', title: 'Real-Time', desc: 'Live market rates instantly updated.' },
                ].map(f => (
                  <div className="col-sm-6" key={f.title}>
                    <div className="p-4 rounded-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <i className={`bi ${f.icon} mb-3 d-block`} style={{ fontSize: '2.5rem', color: 'var(--accent)' }}></i>
                      <h4 className="text-white fw-700 mb-2">{f.title}</h4>
                      <p className="mb-0 text-white-50">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Preview (Optional Quick Links) */}
      <section className="py-5 bg-white text-center">
        <div className="container py-4">
          <h2 className="fw-800 mb-4" style={{ color: 'var(--primary)' }}>Ready to see the market?</h2>
          <Link to="/user/listings" className="btn btn-outline-dark fs-5 px-5 py-3 fw-600 shadow-sm" style={{ borderColor: 'var(--primary)', color: 'var(--primary)', borderRadius: '12px' }}>
            Browse All Active Listings <i className="bi bi-arrow-right ms-2" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
