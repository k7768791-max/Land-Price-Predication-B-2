import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function About() {
  return (
    <div className="d-flex flex-column min-vh-100 bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="position-relative d-flex align-items-center justify-content-center" style={{ minHeight: '50vh', background: 'var(--primary)', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=1920" alt="About Header" className="position-absolute w-100 h-100 object-fit-cover" style={{ opacity: 0.3 }} />
        <div className="container position-relative z-1 text-center py-5">
          <h1 className="display-4 fw-900 text-white mb-3" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>About Our Project</h1>
          <p className="lead text-white-50 mx-auto" style={{ maxWidth: 700 }}>Revolutionizing Land Price Prediction with Data-Driven AI Intelligence</p>
        </div>
      </section>

      {/* Content Container */}
      <div className="container py-5">
        
        {/* Section 1: What We Have Done */}
        <section className="mb-5 pb-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="position-relative p-2 rounded-4" style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}>
                <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800" alt="What we do" className="img-fluid rounded-4 shadow-sm w-100 object-fit-cover" style={{ height: 400 }} />
                <div className="position-absolute bg-white p-3 rounded-3 shadow d-flex align-items-center gap-3" style={{ bottom: '-20px', right: '-20px', borderTop: '3px solid var(--accent)' }}>
                  <i className="bi bi-robot fs-2" style={{ color: 'var(--primary)' }} />
                  <div>
                    <div className="fw-800 fs-5 text-dark">XGBoost ML</div>
                    <div className="text-muted small">Algorithm Trained</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <span className="badge px-3 py-2 mb-3" style={{ background: 'rgba(249, 115, 22, 0.1)', color: 'var(--accent)', borderRadius: '50px', fontWeight: 600 }}>Achieved Milestones</span>
              <h2 className="fw-800 mb-4" style={{ color: 'var(--primary)', fontSize: '2.5rem' }}>What We Have Done</h2>
              <p className="text-muted" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
                We have developed a comprehensive SaaS platform that leverages advanced Machine Learning techniques, specifically the <strong>XGBoost Algorithm</strong>, to predict future land prices. 
              </p>
              <p className="text-muted" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
                Our data scientists trained the model on extensive historical and geographical datasets to ensure pinpoint accuracy. We seamlessly integrated this model into a full-stack, cloud-native web application featuring robust role-based access control for Property Buyers, Real Estate Agents, and System Administrators.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: What It Is */}
        <section className="mb-5 pb-4">
          <div className="row flex-lg-row-reverse align-items-center g-5">
            <div className="col-lg-6">
              <div className="position-relative p-2 rounded-4" style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}>
                <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80" alt="What it is" className="img-fluid rounded-4 shadow-sm w-100 object-fit-cover" style={{ height: 400 }} />
                <div className="position-absolute bg-white p-3 rounded-3 shadow d-flex align-items-center gap-3" style={{ bottom: '-20px', left: '-20px', borderTop: '3px solid var(--accent)' }}>
                  <i className="bi bi-graph-up-arrow fs-2" style={{ color: 'var(--primary)' }} />
                  <div>
                    <div className="fw-800 fs-5 text-dark">Real-time</div>
                    <div className="text-muted small">Market Analytics</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 pe-lg-5">
              <span className="badge px-3 py-2 mb-3" style={{ background: 'rgba(249, 115, 22, 0.1)', color: 'var(--accent)', borderRadius: '50px', fontWeight: 600 }}>The Core Platform</span>
              <h2 className="fw-800 mb-4" style={{ color: 'var(--primary)', fontSize: '2.5rem' }}>What Is LandPulse?</h2>
              <p className="text-muted" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
                LandPulse is a next-generation intelligent real estate marketplace and predictive analytics tool, built specifically for the vast and dynamic Indian market.
              </p>
              <p className="text-muted" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
                We bridge the gap between raw unstructured data and actionable investment insights. By processing spatial and temporal factors—such as distance to city centers, zoning classifications, historical appreciation curves, and live median prices—our platform delivers a highly reliable forecast of property value to optimize your ROI.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: The Technology Stack */}
        <section className="mb-5 pb-4">
          <div className="text-center mb-5">
            <span className="badge px-3 py-2 mb-3" style={{ background: 'rgba(249, 115, 22, 0.1)', color: 'var(--accent)', borderRadius: '50px', fontWeight: 600 }}>Architecture</span>
            <h2 className="fw-800" style={{ color: 'var(--primary)', fontSize: '2.5rem' }}>Our Technology Stack</h2>
            <p className="text-muted mx-auto lead" style={{ maxWidth: '600px' }}>Powered by industry-leading frameworks for maximum scalability, security, and performance.</p>
          </div>
          <div className="row g-4 justify-content-center">
            {[
              { title: 'Machine Learning', desc: 'Predictive XGBoost Engine & Scikit-Learn pipelines mapping non-linear data.', icon: 'bi-cpu', img: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=400' },
              { title: 'Backend API', desc: 'Scalable Python Flask infrastructure handling massive parallel inference requests.', icon: 'bi-server', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=400' },
              { title: 'Frontend UI', desc: 'React.js & Vite ecosystem delivering a blazing-fast, responsive user experience.', icon: 'bi-window', img: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=400' },
              { title: 'Cloud Database', desc: 'Firebase Authentication & Firestore powering secure real-time data synchronization.', icon: 'bi-cloud-check', img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=400' },
            ].map((tech, idx) => (
              <div className="col-md-6 col-lg-3 d-flex" key={idx}>
                <div className="lp-card h-100 border-0 shadow-sm overflow-hidden d-flex flex-column w-100">
                  <div style={{ height: 160, overflow: 'hidden' }}>
                    <img src={tech.img} alt={tech.title} className="w-100 h-100 object-fit-cover" style={{ filter: 'brightness(0.8)' }} />
                  </div>
                  <div className="p-4 flex-grow-1 d-flex flex-column bg-white position-relative">
                    <div className="position-absolute" style={{ top: '-25px', right: '20px', background: 'var(--accent)', color: 'white', width: 50, height: 50, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      <i className={`bi ${tech.icon} fs-4`}></i>
                    </div>
                    <h5 className="fw-800 text-dark mb-3 mt-2">{tech.title}</h5>
                    <p className="text-muted small mb-0 flex-grow-1" style={{ lineHeight: '1.6' }}>{tech.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Section 4: Our Mission (Full Width) */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)' }}>
        <div className="container text-center text-white py-5">
          <i className="bi bi-bullseye mb-4 d-block" style={{ fontSize: '3rem', color: 'var(--accent)' }}></i>
          <h2 className="fw-900 mb-4" style={{ fontSize: '2.5rem' }}>Our Mission</h2>
          <p className="lead mx-auto" style={{ maxWidth: 800, lineHeight: '1.8', color: 'rgba(255,255,255,0.85)' }}>
            To democratize access to institutional-grade real estate intelligence, empowering both retail buyers to make secure investments 
            and real estate agencies to scale their portfolios with data-driven confidence.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
