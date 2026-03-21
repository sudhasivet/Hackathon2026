// src/pages/admin/AdminOverview.jsx
import { useState, useEffect } from 'react'
import { fetchDepartments, fetchHODs, adminUnlockDept } from '../../api/formApi'
import { Card, ProgressBar } from '../../components/ui'
import { AdminReportDownload } from '../reports'

export default function AdminOverview({ onNavigateDept, onToast }) {
  const [depts,   setDepts]   = useState([])
  const [hods,    setHods]    = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([fetchDepartments(), fetchHODs()])
      .then(([d, h]) => { setDepts(d); setHods(h) })
      .catch(() => onToast('Failed to load data', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const submitted  = depts.filter(d => d.is_submitted).length
  const withHOD    = depts.filter(d => d.hod_username).length
  const noHOD      = depts.filter(d => !d.hod_username).length
  const pct        = depts.length ? Math.round((submitted / depts.length) * 100) : 0

  const handleUnlock = async (dept) => {
    if (!window.confirm(`Unlock ${dept.name} (${dept.stream_display}) for editing?`)) return
    try {
      await adminUnlockDept(dept.id)
      onToast(`${dept.name} unlocked`, 'success')
      load()
    } catch {
      onToast('Failed to unlock', 'error')
    }
  }

  const streamColor = (stream) => stream === 'aided' ? '#22c55e' : '#818cf8'

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60, color: '#475569', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      Loading…
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 14 }}>
        {[
          { label: 'Departments',  value: depts.length,  icon: '🏛️', color: '#818cf8' },
          { label: 'Submitted',    value: submitted,      icon: '✅', color: '#22c55e' },
          { label: 'Pending',      value: depts.length - submitted, icon: '⏳', color: '#fbbf24' },
          { label: 'HODs Created', value: hods.length,   icon: '👤', color: '#38bdf8' },
          { label: 'No HOD Yet',   value: noHOD,         icon: '⚠️', color: '#f97316' },
        ].map(({ label, value, icon, color }) => (
          <Card key={label} style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: 30, fontWeight: 800, fontFamily: 'monospace', color, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 12, color: '#475569', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{label}</div>
          </Card>
        ))}
      </div>

      {/* Overall submission progress */}
      <Card style={{ padding: 24 }}>
        <div style={{ fontSize: 10, color: '#475569', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 12, fontFamily: 'monospace' }}>
          OVERALL SUBMISSION PROGRESS
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: '#94a3b8', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {submitted} of {depts.length} departments submitted
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: 16, color: pct === 100 ? '#22c55e' : '#818cf8', fontWeight: 700 }}>{pct}%</span>
        </div>
        <ProgressBar pct={pct} color={pct === 100 ? '#22c55e' : '#818cf8'} height={8} />
      </Card>

      {/* Department cards */}
      <Card style={{ padding: 24 }}>
        <div style={{ fontSize: 10, color: '#475569', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 16, fontFamily: 'monospace' }}>
          ALL DEPARTMENTS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {depts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#334155', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              No departments yet. Go to Departments to add them.
            </div>
          ) : depts.map(dept => (
            <div key={dept.id} style={{
              background: '#060d18', border: '1px solid #1e293b',
              borderRadius: 10, padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
            }}>
              {/* Status dot */}
              <div style={{
                width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                background: dept.is_submitted ? '#22c55e' : '#334155',
                boxShadow: dept.is_submitted ? '0 0 6px #22c55e80' : 'none',
              }} />

              {/* Dept name */}
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ fontSize: 14, color: '#f1f5f9', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {dept.name}
                </div>
                <div style={{ fontSize: 11, color: streamColor(dept.stream), fontFamily: 'monospace', fontWeight: 700 }}>
                  {dept.stream_display}
                </div>
              </div>

              {/* HOD badge */}
              <div style={{ minWidth: 120 }}>
                {dept.hod_username ? (
                  <span style={{ fontSize: 11, color: '#38bdf8', fontFamily: 'monospace' }}>
                    👤 {dept.hod_username}
                  </span>
                ) : (
                  <span style={{ fontSize: 11, color: '#f97316', fontFamily: 'monospace' }}>⚠ No HOD</span>
                )}
              </div>

              {/* Submission status */}
              <div style={{ minWidth: 100, textAlign: 'right' }}>
                {dept.is_submitted ? (
                  <div>
                    <span style={{ fontSize: 11, color: '#22c55e', fontFamily: 'monospace' }}>✓ Submitted</span>
                    {dept.submitted_at && (
                      <div style={{ fontSize: 9, color: '#334155' }}>
                        {new Date(dept.submitted_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ) : (
                  <span style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>○ Pending</span>
                )}
              </div>

              {/* Actions */}
               <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
           onClick={() => onNavigateDept(dept)}
           style={{ padding: '6px 14px', borderRadius: 6, background: '#0a1929', border: '1px solid #1e3a5f', color: '#7dd3fc', cursor: 'pointer', fontSize: 12, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}
         >
           View Data
         </button>
         {dept.is_submitted && (
           <button
             onClick={() => handleUnlock(dept)}
             style={{ padding: '6px 14px', borderRadius: 6, background: '#1a0e00', border: '1px solid #92400e', color: '#fbbf24', cursor: 'pointer', fontSize: 12, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
           >
             Unlock
           </button>
         )}
       </div>
       {dept.is_submitted && (
         <AdminReportDownload deptId={dept.id} onToast={onToast} />
       )}
     </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
