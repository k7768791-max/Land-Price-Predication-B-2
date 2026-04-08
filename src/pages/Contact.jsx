import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      await addDoc(collection(db, 'messages'), {
        ...form,
        timestamp: serverTimestamp(),
        read: false,
      })
      setStatus({ type: 'success', text: 'Thank you for your message. Our team will contact you shortly!' })
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      setStatus({ type: 'danger', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="bg-light min-vh-100 pb-5">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h1 className="fw-800" style={{ color: 'var(--primary)' }}>Contact Us</h1>
            <p className="lead text-muted">We'd love to hear from you</p>
          </div>

          <div className="row g-5">
            {/* Map & Details */}
            <div className="col-lg-6">
              <div className="lp-card h-100 d-flex flex-column overflow-hidden">
                <div style={{ height: '350px', background: '#e9ecef' }}>
                  <iframe
                    title="Map Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.452664539659!2d78.3789452153835!3d17.445209988042457!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93dc8c5d69df%3A0x19688beb557fa0ee!2sHITEC%20City%2C%20Hyderabad%2C%20Telangana%20500081!5e0!3m2!1sen!2sin!4v1684307524945!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="p-4 p-md-5">
                  <h4 className="fw-700 mb-4" style={{ color: 'var(--text-dark)' }}>Get In Touch</h4>
                  <ul className="list-unstyled mb-0">
                    <li className="d-flex align-items-center mb-3">
                      <i className="bi bi-geo-alt-fill me-3" style={{ fontSize: '1.5rem', color: 'var(--accent)' }} />
                      <span className="text-muted">HITEC City, Hyderabad, Telangana 500081</span>
                    </li>
                    <li className="d-flex align-items-center mb-3">
                      <i className="bi bi-envelope-fill me-3" style={{ fontSize: '1.5rem', color: 'var(--accent)' }} />
                      <span className="text-muted">support@landpulse.com</span>
                    </li>
                    <li className="d-flex align-items-center">
                      <i className="bi bi-telephone-fill me-3" style={{ fontSize: '1.5rem', color: 'var(--accent)' }} />
                      <span className="text-muted">+91 98765 43210</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Message Form & FAQs */}
            <div className="col-lg-6">
              <div className="lp-card p-4 p-md-5 mb-4">
                <h4 className="fw-700 mb-4" style={{ color: 'var(--text-dark)' }}>Send a Message</h4>
                {status && (
                  <div className={`alert alert-${status.type} py-2`} style={{ borderRadius: 8 }}>
                    {status.text}
                  </div>
                )}
                <form className="lp-form" onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input type="text" className="form-control" placeholder="Your Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Message</label>
                    <textarea className="form-control" rows="4" placeholder="How can we help you?" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required></textarea>
                  </div>
                  <button type="submit" className="btn btn-gold w-100" disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm" /> : 'Send Message'}
                  </button>
                </form>
              </div>

              {/* FAQs */}
              <div className="lp-card p-4 p-md-5">
                <h4 className="fw-700 mb-4" style={{ color: 'var(--text-dark)' }}>Frequently Asked Questions</h4>
                <div className="accordion" id="faqAccordion">
                  {[
                    { q: 'How accurate is the prediction?', a: 'Our XGBoost model is trained on a vast dataset and typically provides high-accuracy predictive insights subject to market volatility.' },
                    { q: 'Do I need a subscription to test?', a: 'Agents are provided with 2 free predictions to test the platform. Contact access requires a dedicated buyer subscription.' },
                    { q: 'How long until my listing is approved?', a: 'Our admin team reviews listings daily. Typically it takes less than 24 hours to go live.' },
                  ].map((faq, idx) => (
                    <div className="accordion-item" key={idx} style={{ border: 'none', borderBottom: '1px solid var(--border)' }}>
                      <h2 className="accordion-header" id={`heading${idx}`}>
                        <button className="accordion-button collapsed px-0 shadow-none bg-white font-weight-bold" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${idx}`}>
                          {faq.q}
                        </button>
                      </h2>
                      <div id={`collapse${idx}`} className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                        <div className="accordion-body px-0 text-muted small">
                          {faq.a}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
