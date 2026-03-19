import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useResponses } from '../context/ResponseContext'
import { useNavigate } from 'react-router-dom'
import { CRITERIA, getCriterionCompletion, getOverallCompletion } from '../utils/naacData'
import { validateAllMetrics, groupErrorsByMetric } from '../utils/validateAllMetrics'
import CriterionPage from './criteria/CriterionPage'

export default function DashboardShell() {
  const { user, logout } = useAuth()
  const { responses, isSubmitted, submittedAt, submitAllData, collegeName, aqarYear } = useResponses()
  const navigate = useNavigate()

  const [activeCrit,       setActiveCrit]       = useState(null)
  const [showConfirm,      setShowConfirm]       = useState(false)
  const [showValidErrors,  setShowValidErrors]   = useState(false)
  const [validationErrors, setValidationErrors]  = useState([])   // grouped by metric
  const [submitting,       setSubmitting]        = useState(false)
  const [submitError,      setSubmitError]       = useState('')

  const overall = getOverallCompletion(responses)

  const handleSubmitClick = () => {
    const { valid, errors } = validateAllMetrics(responses)
    if (!valid) {
      setValidationErrors(groupErrorsByMetric(errors))
      setShowValidErrors(true)
      return   // BLOCK — don't show confirm dialog
    }
    setShowValidErrors(false)
    setValidationErrors([])
    setShowConfirm(true)
  }

  const handleConfirmSubmit = async () => {
    setSubmitting(true)
    setSubmitError('')
    try {
      const result = await submitAllData()
      if (result?.success) {
        setShowConfirm(false)
      } else {
        setSubmitError(result?.error || 'Submission failed. Please try again.')
      }
    } catch {
      setSubmitError('Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const activeCriterion = CRITERIA.find(c => c.key === activeCrit)

  return (
    <div style={{ minHeight: '100vh', background: '#020c18', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      <div style={{
        background: '#040e1c', borderBottom: '1px solid #0f172a',
        padding: '0 24px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', letterSpacing: -0.5 }}>AQAR Portal</span>
          {collegeName && <span style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>· {collegeName}</span>}
          {aqarYear    && <span style={{ fontSize: 11, color: '#334155', fontFamily: 'monospace' }}>{aqarYear}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 12, color: '#475569' }}>
            {user?.department_name || user?.username}
          </span>
          <button onClick={handleLogout} style={{
            background: '#0f172a', border: '1px solid #1e293b', color: '#94a3b8',
            borderRadius: 7, padding: '6px 14px', fontSize: 12, cursor: 'pointer',
          }}>
            Logout
          </button>
        </div>
      </div>

      {isSubmitted && (
        <div style={{
          background: 'linear-gradient(90deg,#052e16,#064e3b)',
          border: '1px solid #166534', borderRadius: 0,
          padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 16 }}>✅</span>
          <span style={{ fontSize: 13, color: '#86efac', fontWeight: 600 }}>
            Data submitted to Admin
            {submittedAt && <span style={{ fontWeight: 400, color: '#4ade80', marginLeft: 8, fontSize: 11 }}>
              on {new Date(submittedAt).toLocaleString()}
            </span>}
          </span>
          <span style={{ fontSize: 11, color: '#166534', marginLeft: 8 }}>
            Forms are now read-only. Contact admin to unlock.
          </span>
        </div>
      )}

      <div style={{ display: 'flex', height: 'calc(100vh - 56px)' }}>

        <div style={{
          width: 240, background: '#040e1c', borderRight: '1px solid #0f172a',
          display: 'flex', flexDirection: 'column', flexShrink: 0,
          overflowY: 'auto',
        }}>
          <div style={{ padding: '18px 16px 12px' }}>
            <div style={{ fontSize: 10, color: '#334155', fontFamily: 'monospace', letterSpacing: 1, marginBottom: 8 }}>
              OVERALL PROGRESS
            </div>
            <div style={{ height: 4, background: '#0f172a', borderRadius: 4, marginBottom: 6 }}>
              <div style={{ height: '100%', width: `${overall.pct}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: 4, transition: 'width .4s' }} />
            </div>
            <div style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>
              {overall.done}/{overall.total} metrics · {overall.pct}%
            </div>
          </div>

          <div style={{ height: 1, background: '#0f172a', margin: '0 16px' }} />

          <nav style={{ padding: '8px 8px', flex: 1 }}>
            <button
              onClick={() => setActiveCrit(null)}
              style={{
                width: '100%', textAlign: 'left', padding: '9px 12px',
                background: !activeCrit ? '#0a1929' : 'transparent',
                border: `1px solid ${!activeCrit ? '#1e3a5f' : 'transparent'}`,
                borderRadius: 8, color: !activeCrit ? '#e2e8f0' : '#475569',
                cursor: 'pointer', fontSize: 12, marginBottom: 2,
                transition: 'all .15s',
              }}
            >
              📊 Overview
            </button>
            {CRITERIA.map(c => {
              const { done, total, pct } = getCriterionCompletion(c, responses)
              const active = activeCrit === c.key
              return (
                <button
                  key={c.key}
                  onClick={() => setActiveCrit(c.key)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '9px 12px',
                    background: active ? `${c.color}15` : 'transparent',
                    border: `1px solid ${active ? c.color + '40' : 'transparent'}`,
                    borderRadius: 8, cursor: 'pointer', marginBottom: 2,
                    transition: 'all .15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13 }}>{c.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: active ? 700 : 400, color: active ? c.color : '#475569' }}>
                      {c.label}
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: active ? c.color : '#334155', fontFamily: 'monospace' }}>
                      {done}/{total}
                    </span>
                  </div>
                  <div style={{ height: 2, background: '#0f172a', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: c.color, borderRadius: 2, opacity: 0.6, transition: 'width .3s' }} />
                  </div>
                </button>
              )
            })}
          </nav>

          {!isSubmitted && (
            <div style={{ padding: '12px 12px 16px' }}>
              <button
                onClick={handleSubmitClick}
                style={{
                  width: '100%', padding: '11px',
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  border: 'none', borderRadius: 10,
                  color: '#fff', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
                  transition: 'opacity .15s',
                }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                Submit to Admin →
              </button>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {activeCriterion ? (
            <CriterionPage criterion={activeCriterion} readOnly={isSubmitted} />
          ) : (
            <OverviewPanel responses={responses} isSubmitted={isSubmitted} />
          )}
        </div>
      </div>

      {showValidErrors && (
        <div style={OVERLAY} onClick={() => setShowValidErrors(false)}>
          <div style={{
            background: '#0d1f33', border: '1px solid #991b1b',
            borderRadius: 16, padding: '28px 30px',
            maxWidth: 560, width: '90%', maxHeight: '80vh',
            overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>

            <div style={{ fontSize: 18, fontWeight: 800, color: '#fca5a5', marginBottom: 6 }}>
              ✕ Cannot Submit
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 18 }}>
              The following required fields are empty in your saved data.
              Please go back and fill them before submitting.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {validationErrors.map(group => (
                <div key={group.metricId} style={{
                  background: '#1a0000', border: '1px solid #7f1d1d',
                  borderRadius: 10, padding: '12px 14px',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#f87171', marginBottom: 8, fontFamily: 'monospace' }}>
                    Metric {group.metricId} — {group.metricTitle}
                  </div>
                  {group.fields.map((f, i) => (
                    <div key={i} style={{ fontSize: 11, color: '#fca5a5', marginBottom: 3 }}>• {f}</div>
                  ))}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowValidErrors(false)}
              style={{
                marginTop: 20, width: '100%', padding: '10px',
                background: '#1e293b', border: '1px solid #334155',
                borderRadius: 8, color: '#94a3b8',
                fontSize: 13, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Close — Go Fix Fields
            </button>
          </div>
        </div>
      )}

      {showConfirm && (
        <div style={OVERLAY} onClick={() => !submitting && setShowConfirm(false)}>
          <div style={{
            background: '#0d1f33', border: '1px solid #1e3a5f',
            borderRadius: 16, padding: '28px 30px',
            maxWidth: 440, width: '90%',
          }} onClick={e => e.stopPropagation()}>

            <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>
              Submit to Admin?
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, lineHeight: 1.6 }}>
              All your data will be submitted to the admin for review.
              After submission, forms will become <strong style={{ color: '#e2e8f0' }}>read-only</strong>.
              You will need admin approval to make further changes.
            </div>

            {submitError && (
              <div style={{ background: '#1a0000', border: '1px solid #991b1b', borderRadius: 8, padding: '10px 12px', marginBottom: 16, fontSize: 12, color: '#fca5a5' }}>
                {submitError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => !submitting && setShowConfirm(false)}
                disabled={submitting}
                style={{
                  flex: 1, padding: '10px',
                  background: '#0f172a', border: '1px solid #1e293b',
                  borderRadius: 8, color: '#64748b',
                  fontSize: 13, cursor: submitting ? 'default' : 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={submitting}
                style={{
                  flex: 2, padding: '10px',
                  background: submitting ? '#334155' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  border: 'none', borderRadius: 8,
                  color: '#fff', fontSize: 13, fontWeight: 700,
                  cursor: submitting ? 'default' : 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {submitting ? 'Submitting…' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function OverviewPanel({ responses, isSubmitted }) {
  const overall = getOverallCompletion(responses)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>
          Dashboard Overview
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>
          {isSubmitted ? 'Data submitted — read-only mode.' : `${overall.done} of ${overall.total} metrics have data entered.`}
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
        {CRITERIA.map(c => {
          const { done, total, pct } = getCriterionCompletion(c, responses)
          return (
            <div key={c.key} style={{
              background: '#060d18', border: `1px solid ${c.color}20`,
              borderRadius: 14, padding: '18px 20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>{c.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: c.color }}>{c.label}</div>
                  <div style={{ fontSize: 10, color: '#334155' }}>{c.subtitle}</div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 18, fontWeight: 800, color: pct === 100 ? '#22c55e' : c.color }}>
                  {pct}%
                </span>
              </div>
              <div style={{ height: 4, background: '#0f172a', borderRadius: 4 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: c.color, borderRadius: 4, transition: 'width .4s' }} />
              </div>
              <div style={{ fontSize: 10, color: '#334155', marginTop: 6, fontFamily: 'monospace' }}>
                {done}/{total} metrics have data
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const OVERLAY = {
  position: 'fixed', inset: 0, zIndex: 1000,
  background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}