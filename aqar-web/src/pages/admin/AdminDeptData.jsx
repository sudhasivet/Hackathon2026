import { useState, useEffect, useCallback } from 'react'
import { fetchDeptResponses, adminSaveMetric, adminUnlockDept } from '../../api/formApi'
import { CRITERIA, getCriterionCompletion } from '../../utils/naacData'
import { Card } from '../../components/ui'
import MetricCard from '../../components/metrics/MetricCard'
import { AdminReportDownload } from '../reports'
import { ResponseContext } from '../../context/ResponseContext'

export default function AdminDeptData({ dept, onToast }) {
  const [responses,   setResponses]   = useState({})
  const [loading,     setLoading]     = useState(true)
  const [activeCrit,  setActiveCrit]  = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(dept?.is_submitted || false)

  useEffect(() => {
    if (!dept) return
    setLoading(true)
    setIsSubmitted(dept.is_submitted || false)
    fetchDeptResponses(dept.id)
      .then(data => {
        const mapped = {}
        Object.entries(data).forEach(([metricId, rows]) => {
          mapped[metricId] = {
            rows: (Array.isArray(rows) ? rows : []).map((r, i) => ({
              ...r, _id: r._id || r.id || Date.now() + i,
            })),
            documents: [],
            saved: true,
          }
        })
        setResponses(mapped)
      })
      .catch(() => onToast('Failed to load department data', 'error'))
      .finally(() => setLoading(false))
  }, [dept?.id])

  const updateResponse = useCallback((metricId, value) => {
    setResponses(prev => ({
      ...prev,
      [metricId]: { ...prev[metricId], ...value, saved: false },
    }))
  }, [])

  const saveResponse = useCallback(async (metricId) => {
    const current = responses[metricId]
    if (!current) return { success: false }
    const rows = (current.rows || []).map(({ _id, ...rest }) => rest)
    try {
      await adminSaveMetric(dept.id, metricId, rows)
      setResponses(prev => ({
        ...prev,
        [metricId]: { ...prev[metricId], saved: true },
      }))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data || 'Save failed' }
    }
  }, [responses, dept?.id])

  const uploadFile     = useCallback(async () => ({ success: false, error: 'Not available in admin view' }), [])
  const removeDocument = useCallback(async () => {}, [])

  const handleUnlock = async () => {
    try {
      await adminUnlockDept(dept.id)
      setIsSubmitted(false)
      onToast('Department unlocked for editing by HOD', 'success')
    } catch {
      onToast('Failed to unlock', 'error')
    }
  }

  if (!dept) return (
    <div style={{ color: '#475569', textAlign: 'center', padding: 60, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      Select a department to view its data.
    </div>
  )

  if (loading) return (
    <div style={{ color: '#475569', textAlign: 'center', padding: 60, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      Loading data for {dept.name}…
    </div>
  )

  const streamLabel = dept.stream === 'aided' ? 'Aided' : 'Self Finance'
  const streamColor = dept.stream === 'aided' ? '#22c55e' : '#818cf8'

  const fakeContextValue = {
    responses,
    updateResponse,
    saveResponse,
    uploadFile,
    removeDocument,
    collegeName: dept.name,
    aqarYear: '',
    setCollegeName: () => {},
    setAqarYear: () => {},
    saveCollegeSettings: async () => ({ success: false }),
    getTotalDocs: () => 0,
    getTotalRows: () => Object.values(responses).reduce((s, r) => s + (r?.rows?.length || 0), 0),
    loading: false,
    syncError: null,
    isSubmitted: false,
    submittedAt: null,
    submitAllData: async () => ({ success: false }),
  }

  return (
    <ResponseContext.Provider value={fakeContextValue}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* ── Header ── */}
        <div style={{
          background: 'linear-gradient(135deg, #060d18 0%, #0a1520 100%)',
          border: `1px solid ${streamColor}40`, borderRadius: 16, padding: '22px 26px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
        }}>
          {/* Left — name + stream */}
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: 22, color: '#f1f5f9', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800 }}>
              {dept.name}
            </h2>
            <span style={{ fontSize: 12, fontWeight: 700, color: streamColor, fontFamily: 'monospace' }}>
              {streamLabel} Stream
            </span>
            {dept.hod_username && (
              <span style={{ fontSize: 11, color: '#475569', marginLeft: 12 }}>
                HOD: {dept.hod_username}
              </span>
            )}
          </div>

          {/* Right — status + unlock + download */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
            {isSubmitted ? (
              <>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#22c55e', fontFamily: 'monospace' }}>✓ Submitted</span>
                  <button
                    onClick={handleUnlock}
                    style={{
                      padding: '8px 18px', borderRadius: 8,
                      background: '#1a0e00', border: '1px solid #92400e',
                      color: '#fbbf24', cursor: 'pointer', fontSize: 13,
                      fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600,
                    }}
                  >
                    Unlock for Editing
                  </button>
                </div>
                <AdminReportDownload deptId={dept.id} onToast={onToast} />
              </>
            ) : (
              <span style={{ fontSize: 12, color: '#fbbf24', fontFamily: 'monospace' }}>⏳ Not Submitted</span>
            )}
          </div>
        </div>

        {/* ── Criterion filter tabs ── */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CRITERIA.map(c => {
            const { pct } = getCriterionCompletion(c, responses)
            const active  = activeCrit === c.key
            return (
              <button
                key={c.key}
                onClick={() => setActiveCrit(active ? null : c.key)}
                style={{
                  padding: '7px 16px', borderRadius: 20,
                  background: active ? `${c.color}20` : '#0a1520',
                  border: `1.5px solid ${active ? c.color : '#1e293b'}`,
                  color: active ? c.color : '#475569',
                  cursor: 'pointer', fontSize: 12,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: active ? 700 : 400,
                  transition: 'all .15s',
                }}
              >
                {c.icon} {c.label} · {pct}%
              </button>
            )
          })}
          {activeCrit && (
            <button
              onClick={() => setActiveCrit(null)}
              style={{
                padding: '7px 14px', borderRadius: 20,
                background: 'transparent', border: '1px solid #334155',
                color: '#475569', cursor: 'pointer', fontSize: 12,
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* ── Metrics per criterion ── */}
        {CRITERIA
          .filter(c => !activeCrit || c.key === activeCrit)
          .map(criterion => (
            <div key={criterion.key}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
                paddingBottom: 8, borderBottom: `1px solid ${criterion.color}20`,
              }}>
                <span style={{ fontSize: 18 }}>{criterion.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: criterion.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {criterion.label}
                </span>
                <span style={{ fontSize: 11, color: '#475569' }}>· {criterion.subtitle}</span>
                <div style={{ flex: 1 }} />
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#334155' }}>
                  {getCriterionCompletion(criterion, responses).done}/{criterion.metrics.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {criterion.metrics.map(metric => (
                  <MetricCard
                    key={metric.id}
                    metric={metric}
                    response={responses[metric.id] || { rows: [], documents: [], saved: false }}
                    color={criterion.color}
                    readOnly={false}
                    onChange={(val) => updateResponse(metric.id, val)}
                    onSave={async () => {
                      const result = await saveResponse(metric.id)
                      if (result?.success) onToast(`Metric ${metric.id} saved ✓`, 'success')
                      else onToast(`Failed to save ${metric.id}`, 'error')
                    }}
                  />
                ))}
              </div>
            </div>
          ))
        }
      </div>
    </ResponseContext.Provider>
  )
}