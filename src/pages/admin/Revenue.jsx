import { useState, useEffect } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { db } from '../../firebase'
import DashboardLayout from '../../components/DashboardLayout'

const COLORS = ['#c9a84c', '#3b82f6', '#10b981', '#8b5cf6']

const PAYMENT_LABELS = {
  'one-time': 'User One-Time',
  'user-monthly': 'User Monthly',
  're-monthly': 'Agent Monthly',
  're-quarterly': 'Agent Quarterly',
  're-yearly': 'Agent Yearly',
}

export default function AdminRevenue() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'payments'), orderBy('timestamp', 'desc')))
        setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0)

  // Monthly revenue chart data
  const monthlyData = {}
  payments.forEach(p => {
    const date = p.timestamp?.toDate?.()
    if (!date) return
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!monthlyData[key]) monthlyData[key] = { month: key, revenue: 0, count: 0 }
    monthlyData[key].revenue += p.amount || 0
    monthlyData[key].count += 1
  })
  const barData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month)).slice(-6)

  // Plan distribution
  const planData = {}
  payments.forEach(p => {
    const label = PAYMENT_LABELS[p.type] || p.type
    if (!planData[label]) planData[label] = { name: label, value: 0 }
    planData[label].value += p.amount || 0
  })
  const pieData = Object.values(planData)

  return (
    <DashboardLayout role="admin">
      <div className="lp-topbar">
        <div>
          <h5 className="fw-700 mb-0">Revenue Analytics</h5>
          <small className="text-muted">Total: <strong style={{ color: '#c9a84c' }}>₹{totalRevenue.toLocaleString('en-IN')}</strong></small>
        </div>
      </div>

      <div className="lp-content">
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border" style={{ color: '#c9a84c' }} /></div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="row g-4 mb-5">
              {[
                { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: 'bi-currency-rupee', color: '#c9a84c' },
                { label: 'Total Transactions', value: payments.length, icon: 'bi-receipt', color: '#10b981' },
                { label: 'Avg Transaction', value: `₹${payments.length ? Math.round(totalRevenue / payments.length).toLocaleString() : 0}`, icon: 'bi-graph-up', color: '#3b82f6' },
                { label: 'This Month', value: `₹${(barData.at(-1)?.revenue || 0).toLocaleString('en-IN')}`, icon: 'bi-calendar-month', color: '#8b5cf6' },
              ].map(s => (
                <div className="col-md-6 col-lg-3" key={s.label}>
                  <div className="lp-card p-4">
                    <div className="d-flex align-items-center gap-3">
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className={`bi ${s.icon}`} style={{ fontSize: '1.4rem', color: s.color }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1a2e' }}>{s.value}</div>
                        <div className="text-muted small">{s.label}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="row g-4 mb-5">
              <div className="col-lg-8">
                <div className="lp-card p-4">
                  <h6 className="fw-700 mb-4">Monthly Revenue (Last 6 Months)</h6>
                  {barData.length === 0 ? (
                    <div className="text-center py-4 text-muted">No data yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                        <Bar dataKey="revenue" fill="#c9a84c" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
              <div className="col-lg-4">
                <div className="lp-card p-4">
                  <h6 className="fw-700 mb-4">Revenue by Plan</h6>
                  {pieData.length === 0 ? (
                    <div className="text-center py-4 text-muted">No data yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                          {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Legend formatter={(v) => <span style={{ fontSize: '0.78rem' }}>{v}</span>} />
                        <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Recent transactions */}
            <div className="lp-card">
              <div className="p-4 pb-0"><h6 className="fw-700">Recent Transactions</h6></div>
              <div className="table-responsive p-3">
                <table className="table lp-table mb-0">
                  <thead><tr><th>Type</th><th>Amount</th><th>Date</th></tr></thead>
                  <tbody>
                    {payments.slice(0, 15).map(p => (
                      <tr key={p.id}>
                        <td>{PAYMENT_LABELS[p.type] || p.type}</td>
                        <td className="fw-600" style={{ color: '#c9a84c' }}>₹{p.amount?.toLocaleString()}</td>
                        <td className="text-muted small">{p.timestamp?.toDate?.().toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                    {payments.length === 0 && <tr><td colSpan={3} className="text-center text-muted">No transactions yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
