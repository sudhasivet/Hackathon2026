import { useState, useRef, useEffect } from 'react'
import { useResponses } from '../../context/ResponseContext'
import { getFieldInfo } from '../../utils/naacFieldInfo'
import FileUpload from './FileUpload'
import { Button } from '../ui'

function InfoPopover({ metricId, col, color }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const info = getFieldInfo(metricId, col.key)

  useEffect(() => {
    if (!open) return
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  if (!info) return null

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: 4 }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
        title="Field info"
        style={{
          background: open ? `${color}30` : 'transparent',
          border: `1px solid ${open ? color : '#334155'}`,
          color: open ? color : '#475569',
          borderRadius: '50%',
          width: 14, height: 14,
          fontSize: 9, fontWeight: 700, lineHeight: 1,
          cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          padding: 0, flexShrink: 0, transition: 'all .15s',
        }}
      >
        i
      </button>

      {open && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            width: 290,
            background: '#0d1f33',
            border: `1px solid ${color}50`,
            borderRadius: 10,
            boxShadow: `0 8px 32px rgba(0,0,0,0.7)`,
            padding: '12px 14px',
          }}
        >
          <span style={{
            position: 'absolute', top: -5, left: '50%',
            width: 8, height: 8,
            background: '#0d1f33',
            border: `1px solid ${color}50`,
            borderBottom: 'none', borderRight: 'none',
            transform: 'translateX(-50%) rotate(45deg)',
            display: 'block',
          }} />
          <div style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 7, lineHeight: 1.4 }}>
            {info.label}
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.65, whiteSpace: 'pre-line' }}>
            {info.description}
          </div>
        </div>
      )}
    </span>
  )
}

function validateRows(rows, columns) {
  const required = columns.filter(c => c.required)
  if (!required.length) return []
  const errors = []
  rows.forEach((row, rowIdx) => {
    required.forEach(col => {
      const val = row[col.key]
      if (val === '' || val === null || val === undefined)
        errors.push({ rowIdx, colKey: col.key, colLabel: col.label })
    })
  })
  return errors
}

function Cell({ col, value, onChange, color, readOnly, hasError }) {
  const isRequired = col.required === true
  const base = {
    width: '100%',
    background: readOnly ? '#040a12' : hasError ? '#1a0000' : '#060d18',
    color: '#e2e8f0',
    border: `1.5px solid ${readOnly ? '#0f172a' : hasError ? '#ef4444' : '#1e293b'}`,
    borderRadius: 6, padding: '7px 10px',
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12,
    outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s',
    cursor: readOnly ? 'default' : 'text',
  }
  const onFocus = e => { if (!readOnly) e.target.style.borderColor = color }
  const onBlur  = e => {
    if (readOnly) return
    const v = e.target.value
    const err = isRequired && (v === '' || v == null)
    e.target.style.borderColor = err ? '#ef4444' : '#1e293b'
    e.target.style.background  = err ? '#1a0000' : '#060d18'
  }
  const placeholder = readOnly ? '' : isRequired ? `${col.label} *` : col.label

  if (col.type === 'select') return (
    <select value={value || ''} onChange={e => !readOnly && onChange(e.target.value)}
      disabled={readOnly} style={{ ...base, cursor: readOnly ? 'default' : 'pointer' }}
      onFocus={onFocus} onBlur={onBlur}>
      <option value="">{isRequired ? '— required —' : '— select —'}</option>
      {(col.options || []).map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )

  if (col.type === 'textarea') return (
    <textarea value={value || ''} onChange={e => !readOnly && onChange(e.target.value)}
      rows={2} placeholder={placeholder} readOnly={readOnly}
      style={{ ...base, resize: readOnly ? 'none' : 'vertical', minHeight: 56 }}
      onFocus={onFocus} onBlur={onBlur} />
  )

  return (
    <input
      type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : col.type === 'email' ? 'email' : col.type === 'url' ? 'url' : 'text'}
      value={value || ''} onChange={e => !readOnly && onChange(e.target.value)}
      placeholder={placeholder} readOnly={readOnly}
      style={base} onFocus={onFocus} onBlur={onBlur}
    />
  )
}

export default function TableForm({ metric, response, onChange, onSave, color, readOnly = false }) {
  const { uploadFile, removeDocument } = useResponses()
  const [expandedRow,      setExpandedRow]      = useState(null)
  const [validationErrors, setValidationErrors] = useState([])
  const [showValidation,   setShowValidation]   = useState(false)

  const rows       = response.rows || []
  const inlineCols = metric.columns.slice(0, 4)
  const extraCols  = metric.columns.slice(4)
  const hasExtra   = extraCols.length > 0

  const emptyRow = () => Object.fromEntries(metric.columns.map(c => [c.key, '']))

  const addRow = () => {
    if (readOnly) return
    const newRows = [...rows, { ...emptyRow(), _id: Date.now() }]
    onChange({ ...response, rows: newRows, saved: false })
    setExpandedRow(newRows.length - 1)
    setValidationErrors([])
    setShowValidation(false)
  }

  const updateCell = (rowIdx, key, val) => {
    if (readOnly) return
    const newRows = rows.map((r, i) => i === rowIdx ? { ...r, [key]: val } : r)
    onChange({ ...response, rows: newRows, saved: false })
    if (val !== '' && val !== null && val !== undefined)
      setValidationErrors(prev => prev.filter(e => !(e.rowIdx === rowIdx && e.colKey === key)))
  }

  const deleteRow = idx => {
    if (readOnly) return
    const newRows = rows.filter((_, i) => i !== idx)
    onChange({ ...response, rows: newRows, saved: false })
    if (expandedRow === idx) setExpandedRow(null)
    else if (expandedRow > idx) setExpandedRow(expandedRow - 1)
    setValidationErrors(validateRows(newRows, metric.columns))
  }

  const duplicateRow = idx => {
    if (readOnly) return
    const newRows = [...rows.slice(0, idx + 1), { ...rows[idx], _id: Date.now() }, ...rows.slice(idx + 1)]
    onChange({ ...response, rows: newRows, saved: false })
  }

  const handleSave = () => {
    if (!rows.length) return
    const errors = validateRows(rows, metric.columns)
    if (errors.length) { setValidationErrors(errors); setShowValidation(true); return }
    setValidationErrors([]); setShowValidation(false)
    onSave()
  }

  const cellHasError = (rowIdx, colKey) =>
    showValidation && validationErrors.some(e => e.rowIdx === rowIdx && e.colKey === colKey)

  const errorsByRow = {}
  validationErrors.forEach(e => {
    if (!errorsByRow[e.rowIdx]) errorsByRow[e.rowIdx] = []
    errorsByRow[e.rowIdx].push(e.colLabel)
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{
          fontFamily: 'monospace', fontSize: 11,
          background: rows.length > 0 ? `${color}20` : '#1e293b',
          color: rows.length > 0 ? color : '#475569',
          border: `1px solid ${rows.length > 0 ? color + '40' : '#334155'}`,
          borderRadius: 20, padding: '3px 12px',
        }}>
          {rows.length} {rows.length === 1 ? 'record' : 'records'}
        </span>
        {response.saved && <span style={{ fontSize: 11, color: '#22c55e', fontFamily: 'monospace' }}>✓ saved to DB</span>}
        {readOnly && <span style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>🔒 read-only</span>}
        {!readOnly && metric.columns.some(c => c.required) && (
          <span style={{ fontSize: 10, color: '#a78bfa', fontFamily: 'monospace', marginLeft: 'auto' }}>* required field</span>
        )}
      </div>

      {showValidation && validationErrors.length > 0 && (
        <div style={{ background: '#1a0000', border: '1px solid #991b1b', borderRadius: 10, padding: '12px 16px' }}>
          <div style={{ fontSize: 13, color: '#fca5a5', fontWeight: 700, marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            ✕ Cannot save — {validationErrors.length} required field{validationErrors.length !== 1 ? 's' : ''} empty:
          </div>
          {Object.entries(errorsByRow).map(([rowIdx, labels]) => (
            <div key={rowIdx} style={{ marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: '#f87171', fontFamily: 'monospace' }}>Row {+rowIdx + 1}:</span>
              <span style={{ fontSize: 11, color: '#fca5a5', fontFamily: "'Plus Jakarta Sans', sans-serif", marginLeft: 8 }}>{labels.join(', ')}</span>
            </div>
          ))}
        </div>
      )}

      {rows.length > 0 && (
        <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #1e293b' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
            <thead>
              <tr style={{ background: '#0a1520' }}>
                <th style={TH}>#</th>
                {inlineCols.map(c => (
                  <th key={c.key} style={TH}>
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                      {c.label}
                      {c.required && <span style={{ color: '#f87171', marginLeft: 2 }}>*</span>}
                      <InfoPopover metricId={metric.id} col={c} color={color} />
                    </span>
                  </th>
                ))}
                {hasExtra && <th style={TH}>More</th>}
                {!readOnly && <th style={TH}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <>
                  <tr
                    key={row._id || idx}
                    style={{
                      borderBottom: expandedRow === idx ? 'none' : '1px solid #0f172a',
                      background: expandedRow === idx ? '#0a1929' : idx % 2 === 0 ? '#060d18' : '#080e16',
                    }}
                  >
                    <td style={{ ...TD, color: '#475569', fontFamily: 'monospace', width: 36 }}>
                      {idx + 1}
                      {showValidation && errorsByRow[idx] && <span style={{ color: '#ef4444', marginLeft: 4 }}>●</span>}
                    </td>
                    {inlineCols.map(c => (
                      <td key={c.key} style={TD}>
                        <Cell col={c} value={row[c.key]} color={color} readOnly={readOnly}
                          hasError={cellHasError(idx, c.key)} onChange={val => updateCell(idx, c.key, val)} />
                      </td>
                    ))}
                    {hasExtra && (
                      <td style={TD}>
                        <button onClick={() => setExpandedRow(expandedRow === idx ? null : idx)} style={{
                          background: expandedRow === idx ? `${color}20` : '#1e293b',
                          border: `1px solid ${expandedRow === idx ? color : '#334155'}`,
                          color: expandedRow === idx ? color : '#64748b',
                          borderRadius: 5, padding: '4px 10px', fontSize: 11, cursor: 'pointer',
                        }}>
                          {expandedRow === idx ? '▲ Less' : `▼ +${extraCols.length}`}
                        </button>
                      </td>
                    )}
                    {!readOnly && (
                      <td style={{ ...TD, whiteSpace: 'nowrap' }}>
                        <button onClick={() => duplicateRow(idx)} title="Duplicate" style={AB('#334155', '#94a3b8')}>⧉</button>
                        <button onClick={() => deleteRow(idx)}    title="Delete"    style={AB('#3f1010', '#ef4444')}>✕</button>
                      </td>
                    )}
                  </tr>

                  {hasExtra && expandedRow === idx && (
                    <tr key={`${idx}-ex`} style={{ background: '#0a1929', borderBottom: '1px solid #1e293b' }}>
                      <td />
                      <td colSpan={inlineCols.length + (readOnly ? 1 : 2)} style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 10 }}>
                          {extraCols.map(c => (
                            <div key={c.key}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                                <span style={{ fontSize: 10, color: c.required ? '#a78bfa' : '#475569', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                                  {c.label}{c.required ? ' *' : ''}
                                </span>
                                <InfoPopover metricId={metric.id} col={c} color={color} />
                              </div>
                              <Cell col={c} value={row[c.key]} color={color} readOnly={readOnly}
                                hasError={cellHasError(idx, c.key)} onChange={val => updateCell(idx, c.key, val)} />
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows.length === 0 && (
        <div style={{ border: '2px dashed #1e293b', borderRadius: 10, padding: '32px 20px', textAlign: 'center', color: '#334155', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
          <div style={{ fontSize: 13, marginBottom: 4 }}>{readOnly ? 'No records were entered.' : 'No records yet'}</div>
          {!readOnly && <div style={{ fontSize: 11, color: '#1e293b' }}>Click "+ Add Row" to start entering data</div>}
        </div>
      )}

      {!readOnly && (
        <button onClick={addRow} style={{
          background: `${color}15`, border: `1.5px dashed ${color}50`, color,
          borderRadius: 8, padding: '10px', fontSize: 13, cursor: 'pointer',
          fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, transition: 'all .15s',
        }}
          onMouseOver={e => { e.currentTarget.style.background = `${color}25`; e.currentTarget.style.borderColor = color }}
          onMouseOut={e => { e.currentTarget.style.background = `${color}15`; e.currentTarget.style.borderColor = `${color}50` }}
        >
          + Add Row
        </button>
      )}

      {/* File upload */}
      {!readOnly && (
        <FileUpload
          documents={response.documents || []}
          onUpload={file => uploadFile(metric.id, file)}
          onRemove={(docId, isServerDoc) => removeDocument(metric.id, docId, isServerDoc)}
          accentColor={color}
        />
      )}

      {/* Save button */}
      {!readOnly && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button
            onClick={handleSave} disabled={!rows.length}
            variant={rows.length ? 'primary' : 'secondary'}
            style={rows.length ? { background: `linear-gradient(135deg,${color},${color}cc)` } : {}}
          >
            {response.saved ? '✓ Saved' : 'Save to Database'}
          </Button>
          {!rows.length && <span style={{ fontSize: 12, color: '#475569', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Add at least one record to save</span>}
          {rows.length > 0 && !response.saved && !validationErrors.length && <span style={{ fontSize: 12, color: '#64748b', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{rows.length} unsaved record{rows.length !== 1 ? 's' : ''}</span>}
          {response.saved && !validationErrors.length && <span style={{ fontSize: 12, color: '#22c55e', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>✓ {rows.length} record{rows.length !== 1 ? 's' : ''} saved</span>}
        </div>
      )}

      {readOnly && (response.documents || []).length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: '#475569', marginBottom: 8, fontFamily: 'monospace', letterSpacing: 1 }}>UPLOADED DOCUMENTS</div>
          {(response.documents || []).map(doc => (
            <div key={doc.id} style={{ background: '#0a1929', border: '1px solid #1e293b', borderRadius: 8, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span>📄</span>
              <span style={{ fontSize: 12, color: '#cbd5e1', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {doc.url ? <a href={doc.url} target="_blank" rel="noreferrer" style={{ color: '#7dd3fc', textDecoration: 'none' }}>{doc.name}</a> : doc.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const TH = { textAlign: 'left', padding: '10px 12px', fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'monospace', borderBottom: '1px solid #1e293b', whiteSpace: 'nowrap' }
const TD = { padding: '8px 10px', verticalAlign: 'top' }
const AB = (bg, fg) => ({ background: bg, border: 'none', color: fg, borderRadius: 4, padding: '4px 7px', fontSize: 12, cursor: 'pointer', marginLeft: 4 })