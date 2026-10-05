export function parseCSV(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  let i = 0
  const pushField = () => { row.push(field); field = '' }
  const pushRow = () => { pushField(); rows.push(row); row = [] }

  while (i < text.length) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue }
        inQuotes = false; i++; continue
      }
      field += char; i++; continue
    }
    if (char === '"') { inQuotes = true; i++; continue }
    if (char === ',') { pushField(); i++; continue }
    if (char === '\r') { i++; continue }
    if (char === '\n') { pushRow(); i++; continue }
    field += char; i++
  }
  if (field.length > 0 || row.length > 0) pushRow()
  while (rows.length && rows[rows.length - 1].every(c => c === '')) rows.pop()

  if (!rows.length) return { headers: [], records: [] }
  const headers = rows[0].map(h => h.trim())
  const records = rows.slice(1).map(r => {
    const obj = {}
    headers.forEach((h, idx) => { obj[h] = (r[idx] ?? '').trim() })
    return obj
  })
  return { headers, records }
}

function csvEscape(val) {
  const s = String(val ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCSV(headers, rows = []) {
  const lines = [headers.map(csvEscape).join(',')]
  rows.forEach(r => lines.push(headers.map(h => csvEscape(r[h])).join(',')))
  return lines.join('\r\n')
}

export function downloadCSV(filename, csvText) {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  URL.revokeObjectURL(url)
}