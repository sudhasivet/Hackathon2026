import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { openCombinedReport, fetchSubmissionStatus, adminUnlock } from '../../api/formApi'

const AQAR_YEARS = ['2023-24', '2024-25', '2025-26']

export default function AdminOverview() {
  const { user, logout }         = useAuth()
  const navigate                  = useNavigate()
  const [year, setYear]           = useState(
    localStorage.getItem('aqar_year') || '2023-24'
  )
  const [departments, setDepts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [unlocking, setUnlocking] = useState(null)

  // ── Persist chosen year globally ─────────────────────────────────────────
  const handleYearChange = (y) => {
    setYear(y)
    localStorage.setItem('aqar_year', y)
    // Optionally broadcast to other tabs:
    window.dispatchEvent(new CustomEvent('aqar_year_change', { detail: y }))
  }

  // ── Fetch submission status for current year ──────────────────────────────
  useEffect(() => {
    setLoading(true)
    fetchSubmissionStatus(year)
      .then(res => setDepts(res.data))
      .catch(() => setDepts([]))
      .finally(() => setLoading(false))
  }, [year])

  const handleUnlock = async (deptId) => {
    setUnlocking(deptId)
    try {
      await adminUnlock(deptId, year)
      setDepts(prev => prev.map(d =>
        d.department_id === deptId ? { ...d, is_submitted: false } : d
      ))
    } catch (e) {
      alert('Unlock failed: ' + (e.response?.data?.error || e.message))
    } finally {
      setUnlocking(null)
    }
  }

  return (
    <div style={S.page}>
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div style={S.topBar}>
        <div style={S.logo}>
          <span style={S.logoIcon}>🎓</span>
          <div>
            <div style={S.logoTitle}>NAAC AQAR</div>
            <div style={S.logoSub}>Admin Panel</div>
          </div>
        </div>

        {/* Year selector */}
        <div style={S.yearBox}>
          <label style={S.yearLabel}>AQAR Year</label>
          <select
            value={year}
            onChange={e => handleYearChange(e.target.value)}
            style={S.yearSelect}
          >
            {AQAR_YEARS.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>

        <button onClick={() => { logout(); navigate('/login') }} style={S.logoutBtn}>
          Logout
        </button>
      </div>

      <div style={S.body}>
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={S.header}>
          <div>
            <h1 style={S.h1}>Admin Overview</h1>
            <p style={S.sub}>Viewing: <strong>{year}</strong> — {departments.length} departments</p>
          </div>

          {/* ── Combined Report buttons (Feature 1) ─────────────────────── */}
          <div style={S.combinedRow}>
            <div style={S.combinedLabel}>Combined Institution Report</div>
            <div style={S.combinedBtns}>
              <button
                onClick={() => openCombinedReport('pdf', year)}
                style={S.pdfBtn}
              >
                📄 Download PDF
              </button>
              <button
                onClick={() => openCombinedReport('excel', year)}
                style={S.xlBtn}
              >
                📊 Download Excel
              </button>
            </div>
          </div>
        </div>

        {/* ── Department grid ──────────────────────────────────────────────── */}
        {loading ? (
          <div style={S.loading}>Loading departments for {year}…</div>
        ) : (
          <div style={S.grid}>
            {departments.map(dept => (
              <DeptCard
                key={dept.department_id}
                dept={dept}
                year={year}
                onUnlock={handleUnlock}
                unlocking={unlocking === dept.department_id}
                onView={() => navigate(`/admin/departments/${dept.department_id}?year=${year}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DeptCard({ dept, year, onUnlock, unlocking, onView }) {
  const { openReportDownload } = require('../../api/formApi')

  return (
    <div style={S.card}>
      <div style={S.cardTop}>
        <div>
          <div style={S.cardName}>{dept.department_name}</div>
          <div style={S.cardMeta}>{dept.stream} · HOD: {dept.hod || '—'}</div>
        </div>
        <span style={{ ...S.badge, background: dept.is_submitted ? '#166534' : '#b91c1c' }}>
          {dept.is_submitted ? '✓ Submitted' : 'Pending'}
        </span>
      </div>

      {dept.submitted_at && (
        <div style={S.submittedAt}>
          Submitted: {new Date(dept.submitted_at).toLocaleDateString('en-IN')}
        </div>
      )}

      <div style={S.cardActions}>
        <button onClick={onView} style={S.viewBtn}>View Data</button>

        {dept.is_submitted && (
          <>
            <button
              onClick={() => openReportDownload(dept.department_id, 'pdf', year)}
              style={S.dlBtn}
            >
              PDF
            </button>
            <button
              onClick={() => openReportDownload(dept.department_id, 'excel', year)}
              style={S.dlBtn}
            >
              Excel
            </button>
            <button
              onClick={() => onUnlock(dept.department_id)}
              disabled={unlocking}
              style={S.unlockBtn}
            >
              {unlocking ? '…' : 'Unlock'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const S = {
  page:        { minHeight: '100vh', background: '#f0f2f5', fontFamily: 'system-ui, sans-serif' },
  topBar:      { background: '#1a2744', padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' },
  logo:        { display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 },
  logoIcon:    { fontSize: '1.6rem' },
  logoTitle:   { color: '#fff', fontWeight: 700, fontSize: '1rem' },
  logoSub:     { color: '#94a3b8', fontSize: '0.75rem' },
  yearBox:     { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  yearLabel:   { color: '#94a3b8', fontSize: '0.8rem' },
  yearSelect:  { padding: '0.35rem 0.6rem', borderRadius: '6px', border: 'none', fontSize: '0.85rem', background: '#2d4a8a', color: '#fff', cursor: 'pointer' },
  logoutBtn:   { background: '#c1272d', color: '#fff', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  body:        { padding: '1.5rem' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  h1:          { margin: 0, fontSize: '1.6rem', color: '#1a2744' },
  sub:         { margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.9rem' },
  combinedRow: { background: '#fff', border: '2px solid #2d4a8a', borderRadius: '10px', padding: '0.75rem 1rem' },
  combinedLabel:{ fontSize: '0.8rem', color: '#2d4a8a', fontWeight: 700, marginBottom: '0.5rem' },
  combinedBtns:{ display: 'flex', gap: '0.5rem' },
  pdfBtn:      { background: '#c1272d', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 },
  xlBtn:       { background: '#166534', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 },
  loading:     { textAlign: 'center', padding: '3rem', color: '#64748b' },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' },
  card:        { background: '#fff', borderRadius: '10px', padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  cardTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' },
  cardName:    { fontWeight: 700, color: '#1a2744', fontSize: '0.95rem' },
  cardMeta:    { color: '#64748b', fontSize: '0.78rem', marginTop: '0.1rem' },
  badge:       { color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap' },
  submittedAt: { fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' },
  cardActions: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.75rem' },
  viewBtn:     { background: '#2d4a8a', color: '#fff', border: 'none', padding: '0.35rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  dlBtn:       { background: '#0f766e', color: '#fff', border: 'none', padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem' },
  unlockBtn:   { background: '#d97706', color: '#fff', border: 'none', padding: '0.35rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem' },
}