import { useState } from 'react'
import { CRITERIA, getOverallCompletion, getCriterionCompletion, isMetricComplete, countWords } from '../utils/naacData'
import { useResponses } from '../context/ResponseContext'
import { Card, ProgressBar, Badge, Button } from '../components/ui'

function ValidationPanel({ responses }) {
  const issues = []

  CRITERIA.forEach(criterion => {
    criterion.metrics.forEach(metric => {
      const r = responses[metric.id]
      if (!r) {
        issues.push({ id: metric.id, criterion: criterion.label, issue: 'No response entered', severity: 'error' })
        return
      }
      if (metric.type === 'QlM') {
        const words = countWords(r.text || '')
        if (!r.text) issues.push({ id: metric.id, criterion: criterion.label, issue: 'Description is empty', severity: 'error' })
        else if (words < 100) issues.push({ id: metric.id, criterion: criterion.label, issue: `Too short: ${words}/100 words`, severity: 'error' })
        else if (words > 200) issues.push({ id: metric.id, criterion: criterion.label, issue: `Too long: ${words}/200 words`, severity: 'warning' })
      } else {
        const vals = Object.values(r.data || {})
        if (!vals.some(v => v !== '')) issues.push({ id: metric.id, criterion: criterion.label, issue: 'No numeric data entered', severity: 'error' })
        else if (vals.some(v => v !== '' && parseFloat(v) < 0)) issues.push({ id: metric.id, criterion: criterion.label, issue: 'Contains negative values', severity: 'error' })
      }
    })
  })

  const errors = issues.filter(i => i.severity === 'error')
  const warnings = issues.filter(i => i.severity === 'warning')

  return (
    <Card style={{ padding: 24 }}>
      <div style={{ fontSize: 10, color: '#475569', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 16, fontFamily: 'monospace' }}>
        VALIDATION REPORT
      </div>

      {issues.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 15, color: '#22c55e', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>All validations passed!</div>
          <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>Your AQAR data is complete and ready to export.</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ background: '#1a0000', border: '1px solid #7f1d1d', borderRadius: 8, padding: '8px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ color: '#ef4444', fontWeight: 800, fontFamily: 'monospace' }}>{errors.length}</span>
              <span style={{ fontSize: 12, color: '#fca5a5' }}>Errors</span>
            </div>
            <div style={{ background: '#1a1000', border: '1px solid #92400e', borderRadius: 8, padding: '8px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ color: '#fbbf24', fontWeight: 800, fontFamily: 'monospace' }}>{warnings.length}</span>
              <span style={{ fontSize: 12, color: '#fde68a' }}>Warnings</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
            {issues.map((issue, i) => (
              <div key={i} style={{
                background: issue.severity === 'error' ? '#0d0505' : '#0d0a00',
                border: `1px solid ${issue.severity === 'error' ? '#7f1d1d' : '#92400e'}`,
                borderRadius: 8, padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{issue.severity === 'error' ? '✕' : '⚠'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>{issue.id}</span>
                    <span style={{ fontSize: 10, color: '#334155' }}>{issue.criterion}</span>
                  </div>
                  <div style={{ fontSize: 12, color: issue.severity === 'error' ? '#fca5a5' : '#fde68a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {issue.issue}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}

export default function Reports({ onToast }) {
  const { responses, collegeName, aqarYear } = useResponses()
  const { done, total, pct } = getOverallCompletion(responses)
  const [exported, setExported] = useState(false)
  const { downloadReport } = useResponses()
  const [reportLinks, setReportLinks] = useState(null)
  const deptId = reportLinks?.pdf?.split('/')[3]
  const generateJSON = () => {
    const report = {
      institution: collegeName,
      aqarYear,
      generatedAt: new Date().toISOString(),
      readiness: `${pct}%`,
      criteria: {},
    }
    CRITERIA.forEach(c => {
      report.criteria[c.key] = {
        label: c.label, subtitle: c.subtitle,
        completion: `${getCriterionCompletion(c, responses).pct}%`,
        metrics: c.metrics.map(m => ({
          id: m.id, title: m.title, type: m.type,
          complete: isMetricComplete(m, responses[m.id]),
          response: responses[m.id] || null,
        })),
      }
    })
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `AQAR_${aqarYear.replace('-', '_')}_${collegeName.replace(/\s+/g, '_')}.json`
    a.click()
    setExported(true)
    onToast('AQAR JSON report downloaded!', 'success')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <Card style={{ padding: 26 }}>
        <div style={{ fontSize: 10, color: '#475569', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 14, fontFamily: 'monospace' }}>
          AQAR REPORT GENERATOR
        </div>
        <h2 style={{ margin: '0 0 8px', color: '#f1f5f9', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20 }}>
          Generate Your AQAR Report
        </h2>
        <p style={{ margin: '0 0 22px', color: '#64748b', fontSize: 13, lineHeight: 1.6, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Compile all entered data into a structured NAAC AQAR report. The system validates all fields before generating the final document.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 22 }}>
          {[
            { label: 'Metrics Complete', value: `${done}/${total}`, color: '#22c55e' },
            { label: 'Overall Readiness', value: `${pct}%`, color: '#818cf8' },
            { label: 'Institution', value: collegeName, color: '#38bdf8', small: true },
            { label: 'AQAR Year', value: aqarYear, color: '#fbbf24' },
          ].map(({ label, value, color, small }) => (
            <div key={label} style={{
              background: '#060d18', border: `1px solid ${color}30`,
              borderRadius: 10, padding: '14px 18px',
            }}>
              <div style={{ fontSize: 11, color: '#475569', marginBottom: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{label}</div>
              <div style={{ fontFamily: small ? "'Plus Jakarta Sans', sans-serif" : 'monospace', fontSize: small ? 13 : 18, color, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
            </div>
          ))}
        </div>

        <ProgressBar pct={pct} color={pct >= 80 ? '#22c55e' : '#818cf8'} height={8} />
        <div style={{ fontSize: 11, color: '#334155', marginTop: 6, fontFamily: 'monospace' }}>{pct}% complete</div>

        <div style={{ display: 'flex', gap: 12, marginTop: 22, flexWrap: 'wrap' }}>
          <button onClick={()=> downloadReport(deptId,'excel')} style={{
            padding: '12px 24px', borderRadius: 8,
            background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
            color: '#fff', border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif",
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 14px #4f46e530',
          }}>
            <span>📄</span> Export excel
          </button>
          <button onClick={()=> downloadReport(deptId,'excel')} style={{
            padding: '12px 24px', borderRadius: 8,
            background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
            color: '#fff', border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif",
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 14px #4f46e530',
          }}>
            <span>📄</span> Export pdf 
          </button>
          <button onClick={generateJSON} style={{
            padding: '12px 24px', borderRadius: 8,
            background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
            color: '#fff', border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif",
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 14px #4f46e530',
          }}>
            <span>📄</span> Export JSON
          </button>
        </div>
        {exported && (
          <p style={{ margin: '14px 0 0', color: '#22c55e', fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            ✓ Report downloaded successfully!
          </p>
        )}
      </Card>

      <ValidationPanel responses={responses} />

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
                      <Badge type={m.type} />
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