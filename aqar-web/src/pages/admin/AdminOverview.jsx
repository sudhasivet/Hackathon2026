import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  openCombinedReport,
  fetchSubmissionStatus,
  adminUnlockDept,
  openReportDownload,
} from '../../api/formApi'

const AQAR_YEARS = ['2021-22', '2022-23', '2023-24', '2024-25', '2025-26']

export default function AdminOverview({ onNavigateDept, onToast }) {
  const { logout } = useAuth()

  const [year,      setYear]      = useState(
    () => localStorage.getItem('aqar_year') || '2023-24'
  )
  const [depts,     setDepts]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [unlocking, setUnlocking] = useState(null)

  const handleYearChange = (y) => {
    setYear(y)
    localStorage.setItem('aqar_year', y)
  }

  // ── Load submission status for current year ──────────────────────────────
  useEffect(() => {
    setLoading(true)
    fetchSubmissionStatus(year)
      .then(data => {
        // fetchSubmissionStatus already unwraps r.data in formApi.js
        // For admin, backend returns an array; for HOD, a plain object.
        // Normalise to always set an array here.
        if (Array.isArray(data)) {
          setDepts(data)
        } else if (data && typeof data === 'object') {
          // HOD shape — shouldn't happen on admin page, but guard anyway
          setDepts([data])
        } else {
          setDepts([])
        }
      })
      .catch(() => setDepts([]))
      .finally(() => setLoading(false))
  }, [year])

  const handleUnlock = async (deptId) => {
    setUnlocking(deptId)
    try {
      await adminUnlockDept(deptId, year)
      setDepts(prev =>
        prev.map(d => d.department_id === deptId ? { ...d, is_submitted: false } : d)
      )
      onToast?.('Department unlocked', 'success')
    } catch (e) {
      onToast?.('Unlock failed: ' + (e.response?.data?.error || e.message), 'error')
    } finally {
      setUnlocking(null)
    }
  }

  return (
    <div style={S.wrap}>

      {/* Year switcher */}
      <div style={S.bar}>
        <div style={S.barLabel}>AQAR Year</div>
        <select value={year} onChange={e => handleYearChange(e.target.value)} style={S.yearSel}>
          {AQAR_YEARS.map(y => <option key={y}>{y}</option>)}
        </select>

        {/* Combined report download */}
        <div style={{ flex: 1 }} />
        <div style={S.combinedBox}>
          <span style={S.combinedTitle}>Combined Institution Report</span>
          <div style={S.combinedBtns}>
            <button onClick={() => openCombinedReport('pdf',   year)} style={S.pdfBtn}>
              📄 PDF
            </button>
            <button onClick={() => openCombinedReport('excel', year)} style={S.xlBtn}>
              📊 Excel
            </button>
          </div>
        </div>
      </div>

      {/* Department grid */}
      <div style={S.gridHeader}>
        <span style={S.gridTitle}>
          Departments — {year}
          <span style={S.gridCount}>{depts.length}</span>
        </span>
      </div>

      {loading ? (
        <div style={S.empty}>Loading departments…</div>
      ) : depts.length === 0 ? (
        <div style={S.empty}>No departments found for {year}.</div>
      ) : (
        <div style={S.grid}>
          {depts.map(dept => (
            <DeptCard
              key={dept.department_id}
              dept={dept}
              year={year}
              onUnlock={handleUnlock}
              unlocking={unlocking === dept.department_id}
              onView={() => onNavigateDept?.({
                id:           dept.department_id,
                name:         dept.department_name,
                stream:       dept.stream,
                is_submitted: dept.is_submitted,
                hod_username: dept.hod,
              })}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Department card ───────────────────────────────────────────────────────────
function DeptCard({ dept, year, onUnlock, unlocking, onView }) {
  return (
    <div style={S.card}>
      <div style={S.cardTop}>
        <div>
          <div style={S.cardName}>{dept.department_name}</div>
          <div style={S.cardMeta}>
            {dept.stream || '—'} · HOD: {dept.hod || '—'}
          </div>
        </div>
        <span style={{
          ...S.badge,
          background: dept.is_submitted ? '#166534' : '#7f1d1d',
        }}>
          {dept.is_submitted ? '✓ Submitted' : 'Pending'}
        </span>
      </div>

      {dept.submitted_at && (
        <div style={S.subDate}>
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
            >PDF</button>
            <button
              onClick={() => openReportDownload(dept.department_id, 'excel', year)}
              style={S.dlBtn}
            >Excel</button>
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

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  wrap:         { display: 'flex', flexDirection: 'column', gap: 18 },
  bar:          { display: 'flex', alignItems: 'center', gap: 12,
                  background: '#0a1520', border: '1px solid #1e293b',
                  borderRadius: 10, padding: '12px 18px', flexWrap: 'wrap' },
  barLabel:     { fontSize: 12, color: '#64748b', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  yearSel:      { padding: '6px 10px', borderRadius: 6, border: '1px solid #1e3a5f',
                  background: '#060d18', color: '#7dd3fc', cursor: 'pointer',
                  fontSize: 13, fontFamily: 'monospace' },
  combinedBox:  { display: 'flex', alignItems: 'center', gap: 10,
                  background: '#0d1f33', border: '1px solid #1e3a5f',
                  borderRadius: 8, padding: '8px 14px' },
  combinedTitle:{ fontSize: 11, color: '#64748b',
                  fontFamily: "'Plus Jakarta Sans', sans-serif" },
  combinedBtns: { display: 'flex', gap: 6 },
  pdfBtn:       { background: '#7f1d1d', color: '#fca5a5', border: 'none',
                  padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
                  fontSize: 12, fontWeight: 700 },
  xlBtn:        { background: '#14532d', color: '#86efac', border: 'none',
                  padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
                  fontSize: 12, fontWeight: 700 },
  gridHeader:   { display: 'flex', alignItems: 'center', gap: 10 },
  gridTitle:    { fontSize: 11, color: '#475569', letterSpacing: 2,
                  textTransform: 'uppercase', fontWeight: 700,
                  fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 8 },
  gridCount:    { background: '#1e293b', color: '#94a3b8', borderRadius: 20,
                  padding: '1px 8px', fontSize: 10 },
  empty:        { textAlign: 'center', padding: '48px 0',
                  color: '#475569', fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 14 },
  grid:         { display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 14 },
  card:         { background: '#0a1520', border: '1px solid #1e293b',
                  borderRadius: 12, padding: '16px 18px' },
  cardTop:      { display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', marginBottom: 6 },
  cardName:     { fontSize: 14, fontWeight: 700, color: '#f1f5f9',
                  fontFamily: "'Plus Jakarta Sans', sans-serif" },
  cardMeta:     { fontSize: 11, color: '#475569', marginTop: 2 },
  badge:        { color: '#fff', padding: '2px 8px', borderRadius: 999,
                  fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
                  fontFamily: 'monospace' },
  subDate:      { fontSize: 11, color: '#475569', marginBottom: 8,
                  fontFamily: 'monospace' },
  cardActions:  { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 },
  viewBtn:      { background: '#1e3a5f', color: '#7dd3fc', border: 'none',
                  padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
                  fontSize: 12, fontWeight: 600 },
  dlBtn:        { background: '#0f2e28', color: '#34d399', border: 'none',
                  padding: '6px 10px', borderRadius: 6, cursor: 'pointer',
                  fontSize: 11 },
  unlockBtn:    { background: '#1a0e00', color: '#fbbf24',
                  border: '1px solid #92400e',
                  padding: '6px 12px', borderRadius: 6, cursor: 'pointer',
                  fontSize: 11, fontWeight: 600 },
}