import { useState } from 'react'
import { parseCSV, toCSV, downloadCSV } from '../../utils/csv'
import { YEARS } from '../../utils/naacData'
import { Button } from '../ui'

const normalizeKey = (s = '') => s.toLowerCase().replace(/[^a-z0-9]/g, '')

function normalizeDate(val = '') {
  if (!val) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val
  const m = val.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
  if (m) { const [, d, mo, y] = m; return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}` }
  return val
}

function bestYearMatch(val = '') {
  if (YEARS.includes(val)) return val
  const m = val.match(/^(\d{4})/)
  if (m) {
    const found = YEARS.find(y => y.startsWith(m[1]))
    if (found) return found
  }
  return val
}

export default function CSVImport({ metric, onImport, onClose, color }) {
  const [stage, setStage]     = useState('pick') // pick | map | preview
  const [fileName, setFileName] = useState('')
  const [headers, setHeaders] = useState([])
  const [records, setRecords] = useState([])
  const [mapping, setMapping] = useState({})
  const [error, setError]     = useState('')

  const handleFile = async (file) => {
    setError('')
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a .csv file.'); return
    }
    const text = await file.text()
    const { headers: h, records: r } = parseCSV(text)
    if (!h.length || !r.length) {
      setError('No data rows found in this file.'); return
    }
    setFileName(file.name); setHeaders(h); setRecords(r)

    const autoMap = {}
    const used = new Set()
    h.forEach(header => {
      const nh = normalizeKey(header)
      const col = metric.columns.find(c => !used.has(c.key) &&
        (normalizeKey(c.key) === nh || normalizeKey(c.label) === nh))
      autoMap[header] = col ? col.key : ''
      if (col) used.add(col.key)
    })
    setMapping(autoMap)
    setStage('map')
  }

  const downloadTemplate = () => {
    downloadCSV(`${metric.id}_template.csv`, toCSV(metric.columns.map(c => c.label), []))
  }

  const mappedKeys = new Set(Object.values(mapping).filter(Boolean))
  const missingRequired = metric.columns
    .filter(c => c.required && !mappedKeys.has(c.key))

  const buildRows = () => records.map((rec, i) => {
    const row = Object.fromEntries(metric.columns.map(c => [c.key, '']))
    Object.entries(mapping).forEach(([header, colKey]) => {
      if (!colKey) return
      const col = metric.columns.find(c => c.key === colKey)
      let val = rec[header] ?? ''
      if (col?.type === 'date') val = normalizeDate(val)
      if (col?.type === 'year') val = bestYearMatch(val)
      if (col?.type === 'select' && col.options?.length) {
        const match = col.options.find(o => o.toLowerCase() === val.toLowerCase())
        if (match) val = match
      }
      row[colKey] = val
    })
    row._id = Date.now() + i
    return row
  })

  const rowsPreview = stage === 'preview' ? buildRows() : []
  const rowIssues = (row) => metric.columns.filter(c => c.required && !row[c.key])

  const confirmImport = () => {
    onImport(buildRows())
    onClose()
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#0a1520', border: `1px solid ${color}50`, borderRadius: 16, padding: '26px 28px', width: '100%', maxWidth: 720, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.8)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: '#f1f5f9', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 17 }}>
            Import CSV — {metric.title}
          </h3>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>

        {error && (
          <div style={{ background: '#1a0000', border: '1px solid #7f1d1d', borderRadius: 8, padding: '8px 14px', color: '#fca5a5', fontSize: 12, marginBottom: 14 }}>
            ✕ {error}
          </div>
        )}

        {stage === 'pick' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Upload a CSV with one row per record. Column headers can match either the field
              label or key shown for this metric — we'll try to match them automatically.
            </div>
            <button onClick={downloadTemplate} style={{ alignSelf: 'flex-start', background: '#0f172a', border: '1px solid #334155', color: '#94a3b8', borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer' }}>
              ⬇ Download CSV Template
            </button>
            <label style={{ border: `2px dashed ${color}50`, borderRadius: 10, padding: '30px 20px', textAlign: 'center', cursor: 'pointer', color: '#64748b', fontSize: 13 }}>
              <input type="file" accept=".csv" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
              📄 Click to choose a .csv file, or drag one here
            </label>
          </div>
        )}

        {stage === 'map' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 12, color: '#475569' }}>
              {fileName} — {records.length} row{records.length !== 1 ? 's' : ''} found. Confirm the column mapping below.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {headers.map(h => (
                <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ flex: 1, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>{h}</span>
                  <span style={{ color: '#334155' }}>→</span>
                  <select
                    value={mapping[h] || ''}
                    onChange={e => setMapping(m => ({ ...m, [h]: e.target.value }))}
                    style={{ flex: 1, background: '#060d18', border: '1px solid #1e293b', borderRadius: 6, color: '#e2e8f0', padding: '6px 10px', fontSize: 12 }}
                  >
                    <option value="">— ignore this column —</option>
                    {metric.columns.map(c => (
                      <option key={c.key} value={c.key}>{c.label}{c.required ? ' *' : ''}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            {missingRequired.length > 0 && (
              <div style={{ background: '#1a0e00', border: '1px solid #92400e', borderRadius: 8, padding: '8px 14px', fontSize: 12, color: '#fbbf24' }}>
                ⚠ Required field{missingRequired.length !== 1 ? 's' : ''} not mapped: {missingRequired.map(c => c.label).join(', ')}.
                You can still import and fill these in manually afterward.
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" onClick={() => setStage('pick')}>← Back</Button>
              <Button onClick={() => setStage('preview')}>Preview →</Button>
            </div>
          </div>
        )}

        {stage === 'preview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 12, color: '#475569' }}>
              {rowsPreview.length} row{rowsPreview.length !== 1 ? 's' : ''} will be added to the table below — nothing is saved to the database until you click "Save to Database".
            </div>
            <div style={{ overflowX: 'auto', maxHeight: 300, border: '1px solid #1e293b', borderRadius: 8 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#0a1520' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', color: '#475569' }}>#</th>
                    {metric.columns.map(c => (
                      <th key={c.key} style={{ padding: '8px 10px', textAlign: 'left', color: '#475569', whiteSpace: 'nowrap' }}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rowsPreview.map((row, i) => {
                    const issues = rowIssues(row)
                    return (
                      <tr key={row._id} style={{ borderTop: '1px solid #0f172a' }}>
                        <td style={{ padding: '6px 10px', color: issues.length ? '#f87171' : '#475569' }}>{i + 1}</td>
                        {metric.columns.map(c => (
                          <td key={c.key} style={{ padding: '6px 10px', color: !row[c.key] && c.required ? '#f87171' : '#cbd5e1' }}>
                            {row[c.key] || (c.required ? '— missing —' : '—')}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" onClick={() => setStage('map')}>← Back</Button>
              <Button onClick={confirmImport}>Import {rowsPreview.length} Row{rowsPreview.length !== 1 ? 's' : ''}</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}