import { useState, useEffect } from 'react'
import { CRITERIA, getOverallCompletion, getCriterionCompletion, isMetricComplete } from '../utils/naacData'
import { useResponses } from '../context/ResponseContext'
import { useAuth } from '../context/AuthContext'
import { Card, ProgressBar, Badge } from '../components/ui'

const BACKEND = 'https://naac-navigator.onrender.com'

// Auth-aware file download — passes JWT token, triggers browser Save-As
async function downloadWithAuth(url, filename) {
  const token = localStorage.getItem('access')
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      // Try token refresh if 401
      if (res.status === 401) {
        const refresh = localStorage.getItem('refresh')
        if (refresh) {
          const r2 = await fetch(`${BACKEND}/api/auth/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh }),
          })
          if (r2.ok) {
            const { access } = await r2.json()
            localStorage.setItem('access', access)
            const r3 = await fetch(url, { headers: { Authorization: `Bearer ${access}` } })
            if (!r3.ok) throw new Error('Download failed after token refresh')
            const blob = await r3.blob()
            triggerDownload(blob, filename)
            return { success: true }
          }
        }
        throw new Error('Session expired — please log in again')
      }
      throw new Error(`Download failed (${res.status})`)
    }
    const blob = await res.blob()
    triggerDownload(blob, filename)
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

function triggerDownload(blob, filename) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(a.href)
}

// ── Submission Report Download Card ──────────────────────────────────────────
function SubmissionReportCard({ onToast }) {
  const { isSubmitted, submittedAt } = useResponses()
  const { user } = useAuth()
  const [downloading, setDownloading] = useState({ pdf: false, excel: false })

  if (!isSubmitted) return null

  // Get dept id from user profile (backend returns it)
  const deptId = user?.department_id

  const handleDownload = async (fmt) => {
    if (!deptId) {
      onToast('Department ID not found — contact admin', 'error')
      return
    }
    setDownloading(d => ({ ...d, [fmt]: true }))
    const ext      = fmt === 'pdf' ? 'pdf' : 'xlsx'
    const label    = fmt === 'pdf' ? 'PDF' : 'Excel'
    const deptName = (user?.department || 'dept').replace(/\s+/g, '_')
    const date     = submittedAt ? new Date(submittedAt).toISOString().slice(0,10) : 'report'
    const filename = `AQAR_${deptName}_${date}.${ext}`
    const url      = `${BACKEND}/form/report/${deptId}/${fmt}/`
    const result   = await downloadWithAuth(url, filename)
    setDownloading(d => ({ ...d, [fmt]: false }))
    if (result.success) {
      onToast(`${label} report downloaded successfully!`, 'success')
    } else {
      onToast(`Download failed: ${result.error}`, 'error')
    }
  }

  return (
    <Card style={{ padding: 26 }}>
      <div style={{ fontSize: 10, color: '#475569', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 14, fontFamily: 'monospace' }}>
        SUBMITTED AQAR REPORTS
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: 20 }}>✅</span>
        <div>
          <div style={{ fontSize: 14, color: '#86efac', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Data submitted to Admin
          </div>
          {submittedAt && (
            <div style={{ fontSize: 11, color: '#4ade80', fontFamily: 'monospace' }}>
              {new Date(submittedAt).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: 13, lineHeight: 1.6, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Your AQAR report was auto-generated at submission. Download your copy below — the admin also has access to these reports.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* PDF */}
        <button
          onClick={() => handleDownload('pdf')}
          disabled={downloading.pdf}
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 18px', borderRadius: 10, cursor: downloading.pdf ? 'wait' : 'pointer',
            background: downloading.pdf ? '#0f172a' : 'linear-gradient(135deg,#1a0a00,#2d1200)',
            border: '1px solid #c2410c', opacity: downloading.pdf ? 0.6 : 1,
            transition: 'all .15s', textAlign: 'left',
          }}
          onMouseOver={e => { if (!downloading.pdf) e.currentTarget.style.borderColor = '#f97316' }}
          onMouseOut={e => { if (!downloading.pdf) e.currentTarget.style.borderColor = '#c2410c' }}
        >
          <span style={{ fontSize: 28 }}>{downloading.pdf ? '⏳' : '📄'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f97316', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {downloading.pdf ? 'Downloading PDF…' : 'Download PDF Report'}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>
              Criterion-wise summary + full data tables
            </div>
          </div>
          {!downloading.pdf && <span style={{ fontSize: 18, color: '#f97316' }}>↓</span>}
        </button>

        {/* Excel */}
        <button
          onClick={() => handleDownload('excel')}
          disabled={downloading.excel}
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 18px', borderRadius: 10, cursor: downloading.excel ? 'wait' : 'pointer',
            background: downloading.excel ? '#0f172a' : 'linear-gradient(135deg,#001a0a,#00331a)',
            border: '1px solid #15803d', opacity: downloading.excel ? 0.6 : 1,
            transition: 'all .15s', textAlign: 'left',
          }}
          onMouseOver={e => { if (!downloading.excel) e.currentTarget.style.borderColor = '#22c55e' }}
          onMouseOut={e => { if (!downloading.excel) e.currentTarget.style.borderColor = '#15803d' }}
        >
          <span style={{ fontSize: 28 }}>{downloading.excel ? '⏳' : '📊'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#22c55e', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {downloading.excel ? 'Downloading Excel…' : 'Download Excel Report'}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>
              All metrics in spreadsheet format
            </div>
          </div>
          {!downloading.excel && <span style={{ fontSize: 18, color: '#22c55e' }}>↓</span>}
        </button>
      </div>
    </Card>
  )
}

// ── Admin Report Download — import this in AdminDeptData.jsx ─────────────────
// import { AdminReportDownload } from '../reports'
// Then in the header section where you show "✓ Submitted", add:
// <AdminReportDownload deptId={dept.id} deptName={dept.name} submittedAt={dept.submitted_at} onToast={onToast} />
export function AdminReportDownload({ deptId, deptName, submittedAt, onToast }) {
  const [downloading, setDownloading] = useState({ pdf: false, excel: false })

  const handleDownload = async (fmt) => {
    setDownloading(d => ({ ...d, [fmt]: true }))
    const ext      = fmt === 'pdf' ? 'pdf' : 'xlsx'
    const label    = fmt === 'pdf' ? 'PDF' : 'Excel'
    const safeName = (deptName || 'dept').replace(/\s+/g, '_')
    const date     = submittedAt ? new Date(submittedAt).toISOString().slice(0,10) : 'report'
    const filename = `AQAR_${safeName}_${date}.${ext}`
    const url      = `${BACKEND}/form/report/${deptId}/${fmt}/`
    const result   = await downloadWithAuth(url, filename)
    setDownloading(d => ({ ...d, [fmt]: false }))
    if (result.success) {
      onToast(`${label} report downloaded!`, 'success')
    } else {
      onToast(`Download failed: ${result.error}`, 'error')
    }
  }

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      {[
        { fmt: 'pdf',   label: 'PDF Report',   icon: '📄', color: '#f97316', border: '#c2410c' },
        { fmt: 'excel', label: 'Excel Report', icon: '📊', color: '#22c55e', border: '#15803d' },
      ].map(({ fmt, label, icon, color, border }) => (
        <button
          key={fmt}
          onClick={() => handleDownload(fmt)}
          disabled={downloading[fmt]}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 8, cursor: downloading[fmt] ? 'wait' : 'pointer',
            background: '#060d18', border: `1px solid ${border}`,
            color, fontSize: 12, fontWeight: 700,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            opacity: downloading[fmt] ? 0.6 : 1,
            transition: 'all .15s',
          }}
        >
          <span>{downloading[fmt] ? '⏳' : icon}</span>
          {downloading[fmt] ? 'Downloading…' : `Download ${label}`}
          {!downloading[fmt] && <span style={{ fontSize: 14 }}>↓</span>}
        </button>
      ))}
    </div>
  )
}

// ── Main Reports Page ─────────────────────────────────────────────────────────
export default function Reports({ onToast }) {
  const { responses, collegeName, aqarYear, isSubmitted } = useResponses()
  const { done, total, pct } = getOverallCompletion(responses)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Submission report download — only shows after HOD submits */}
      <SubmissionReportCard onToast={onToast} />

      {/* Progress overview */}
      <Card style={{ padding: 26 }}>
        <div style={{ fontSize: 10, color: '#475569', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 14, fontFamily: 'monospace' }}>
          AQAR PROGRESS OVERVIEW
        </div>
        <h2 style={{ margin: '0 0 8px', color: '#f1f5f9', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20 }}>
          {isSubmitted ? 'Report Submitted ✓' : 'Generate Your AQAR Report'}
        </h2>
        <p style={{ margin: '0 0 22px', color: '#64748b', fontSize: 13, lineHeight: 1.6, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {isSubmitted
            ? 'Your data has been submitted and reports generated. Download them above or from the lock banner.'
            : 'Complete all metrics and submit to Admin — PDF and Excel reports will be auto-generated on submission.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 22 }}>
          {[
            { label: 'Metrics Complete', value: `${done}/${total}`,  color: '#22c55e' },
            { label: 'Overall Readiness', value: `${pct}%`,          color: '#818cf8' },
            { label: 'Institution',       value: collegeName,         color: '#38bdf8', small: true },
            { label: 'AQAR Year',         value: aqarYear,            color: '#fbbf24' },
          ].map(({ label, value, color, small }) => (
            <div key={label} style={{ background: '#060d18', border: `1px solid ${color}30`, borderRadius: 10, padding: '14px 18px' }}>
              <div style={{ fontSize: 11, color: '#475569', marginBottom: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{label}</div>
              <div style={{ fontFamily: small ? "'Plus Jakarta Sans', sans-serif" : 'monospace', fontSize: small ? 13 : 18, color, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
            </div>
          ))}
        </div>

        <ProgressBar pct={pct} color={pct >= 80 ? '#22c55e' : '#818cf8'} height={8} />
        <div style={{ fontSize: 11, color: '#334155', marginTop: 6, fontFamily: 'monospace' }}>{pct}% complete</div>

        {!isSubmitted && (
          <div style={{ marginTop: 18, padding: '12px 16px', background: '#0a1520', border: '1px solid #1e3a5f', borderRadius: 8 }}>
            <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.6 }}>
              💡 PDF and Excel reports are <strong style={{ color: '#7dd3fc' }}>automatically generated</strong> when you click "Submit to Admin" at the bottom of the page. You can download them from this page after submitting.
            </p>
          </div>
        )}
      </Card>

      {/* Criterion summary */}
      <Card style={{ padding: 24 }}>
        <div style={{ fontSize: 10, color: '#475569', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 16, fontFamily: 'monospace' }}>
          CRITERION SUMMARY
        </div>
        {CRITERIA.map(criterion => {
          const { done, total, pct } = getCriterionCompletion(criterion, responses)
          return (
            <div key={criterion.key} style={{ marginBottom: 22, paddingBottom: 22, borderBottom: '1px solid #0f172a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span>{criterion.icon}</span>
                <span style={{ color: criterion.color, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14 }}>{criterion.label}</span>
                <span style={{ fontSize: 11, color: '#475569' }}>· {criterion.subtitle}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#334155', marginLeft: 'auto' }}>{done}/{total} · {pct}%</span>
              </div>
              <ProgressBar pct={pct} color={criterion.color} height={4} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {criterion.metrics.map(m => {
                  const ok = isMetricComplete(m, responses[m.id])
                  return (
                    <div key={m.id} style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: ok ? '#052e16' : '#0a0a0a',
                      border: `1px solid ${ok ? '#16a34a' : '#1e293b'}`,
                      borderRadius: 6, padding: '3px 10px',
                    }}>
                      <span style={{ color: ok ? '#22c55e' : '#475569', fontSize: 11 }}>{ok ? '✓' : '○'}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: 10, color: ok ? '#86efac' : '#475569' }}>{m.id}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </Card>
    </div>
  )
}