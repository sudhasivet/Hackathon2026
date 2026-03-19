// src/utils/validateAllMetrics.js
// Called before HOD submits to admin.
// Checks every metric's saved rows for empty required fields.
// Returns { valid: bool, errors: [{metricId, metricTitle, rowIdx, fieldLabel}] }

import { ALL_METRICS } from './naacData'

export function validateAllMetrics(responses) {
  const errors = []

  ALL_METRICS.forEach(metric => {
    const response = responses[metric.id]
    const rows = response?.rows || []

    // Skip metrics with no rows — not required to fill every metric
    if (rows.length === 0) return

    const requiredCols = metric.columns.filter(c => c.required)
    if (!requiredCols.length) return

    rows.forEach((row, rowIdx) => {
      requiredCols.forEach(col => {
        const val = row[col.key]
        const isEmpty = val === '' || val === null || val === undefined
        if (isEmpty) {
          errors.push({
            metricId:    metric.id,
            metricTitle: metric.title,
            rowIdx,
            fieldLabel:  col.label,
            colKey:      col.key,
          })
        }
      })
    })
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Group errors by metric for display
export function groupErrorsByMetric(errors) {
  const grouped = {}
  errors.forEach(e => {
    if (!grouped[e.metricId]) {
      grouped[e.metricId] = { metricId: e.metricId, metricTitle: e.metricTitle, fields: [] }
    }
    grouped[e.metricId].fields.push(`Row ${e.rowIdx + 1}: ${e.fieldLabel}`)
  })
  return Object.values(grouped)
}
