import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '../components/ui'

export default function Login() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [form,    setForm]    = useState({ username: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.mesh} />
      <div style={s.card}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={s.logo}>🎓</div>
          <h1 style={s.title}>NAAC Navigator</h1>
          <p style={s.sub}>Sign in with your IQAC credentials</p>
        </div>

        {error && (
          <div style={s.error}>
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={s.label}>Username</label>
            <input
              style={s.input}
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="Enter your username"
              required autoFocus
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#1e293b'}
            />
          </div>
          <div>
            <label style={s.label}>Password</label>
            <input
              style={s.input} type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#1e293b'}
            />
          </div>
          <button type="submit" disabled={loading} style={s.btn}>
            {loading ? <Spinner size={18} /> : 'Sign In'}
          </button>
        </form>

        {/* Info note — no register link */}
        <div style={{
          marginTop: 24, padding: '12px 16px',
          background: '#060d18', border: '1px solid #1e293b',
          borderRadius: 8, textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontSize: 12, color: '#475569', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.6 }}>
            Account access is provided by the AQAR Cell Head.<br />
            Contact your administrator if you need an account.
          </p>
        </div>
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh', background: '#030a12',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    position: 'relative', overflow: 'hidden',
  },
  mesh: {
    position: 'absolute', inset: 0, zIndex: 0,
    background: 'radial-gradient(ellipse at 20% 50%, #1e1b4b30 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #0c1a3a40 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative', zIndex: 1,
    width: 400, background: '#0a1520',
    border: '1px solid #1e3a5f', borderRadius: 20,
    padding: '40px 36px',
    boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
  },
  logo: {
    width: 60, height: 60, borderRadius: 16,
    background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 30, margin: '0 auto 14px',
    boxShadow: '0 8px 24px #4f46e540',
  },
  title: { margin: '0 0 6px', fontSize: 22, color: '#f1f5f9', fontWeight: 800 },
  sub:   { margin: 0, color: '#475569', fontSize: 13 },
  label: {
    display: 'block', fontSize: 11, color: '#64748b',
    marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600,
  },
  input: {
    width: '100%', padding: '11px 14px',
    background: '#060d18', border: '1.5px solid #1e293b',
    borderRadius: 9, color: '#e2e8f0', fontSize: 14, outline: 'none',
    boxSizing: 'border-box', fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: 'border-color .2s',
  },
  btn: {
    width: '100%', padding: '13px 0', borderRadius: 9,
    background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
    color: '#fff', border: 'none', cursor: 'pointer',
    fontWeight: 700, fontSize: 15, marginTop: 4,
    boxShadow: '0 4px 14px #4f46e540',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'opacity .2s',
  },
  error: {
    background: '#1a0000', border: '1px solid #7f1d1d',
    borderRadius: 8, padding: '10px 14px', marginBottom: 16,
    color: '#fca5a5', fontSize: 13,
    display: 'flex', alignItems: 'center', gap: 8,
  },
}
