import axios from 'axios'

const BACKEND = import.meta.env.VITE_API_URL || 'https://naac-navigator.onrender.com'

const api = axios.create({ baseURL: BACKEND })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Metric ID alias map ───────────────────────────────────────────────────────
const METRIC_ALIASES = {
  '1.2.2 , 1.2.3': '1-2-2',
  '1.2.3':          '1-2-2',
  '2.4.2':          '2-4-2',
  '3.4.3':          '3-4-3',
}

const slug = (metricId) => {
  if (METRIC_ALIASES[metricId]) return METRIC_ALIASES[metricId]
  return metricId.replace(/\./g, '-')
}

// ── Active year helper ────────────────────────────────────────────────────────
const getYear = () => localStorage.getItem('aqar_year') || '2023-24'

// ═══════════════════════════════════════════════════════════════════════════════
// HOD — metric CRUD (year-aware)
// ═══════════════════════════════════════════════════════════════════════════════

export const fetchMetricRows = (metricSlug, year = getYear()) =>
  api.get(`/form/${slug(metricSlug)}/`, { params: { year } }).then(r => r.data)

export const saveMetricRows = (metricSlug, rows, year = getYear()) =>
  api.post(`/form/${slug(metricSlug)}/`, rows, { params: { year } }).then(r => r.data)

export const addMetricRow = (metricSlug, data, year = getYear()) =>
  api.post(`/form/${slug(metricSlug)}/`, data, { params: { year } }).then(r => r.data)

export const updateMetricRow = (metricSlug, pk, data, year = getYear()) =>
  api.put(`/form/${slug(metricSlug)}/${pk}/`, data, { params: { year } }).then(r => r.data)

export const deleteMetricRow = (metricSlug, pk, year = getYear()) =>
  api.delete(`/form/${slug(metricSlug)}/${pk}/`, { params: { year } })

// ═══════════════════════════════════════════════════════════════════════════════
// HOD — submit + status
// ═══════════════════════════════════════════════════════════════════════════════

export const submitData = (year = getYear()) =>
  api.post('/form/submit/', { aqar_year: year }).then(r => r.data)

export const fetchSubmissionStatus = (year = getYear()) =>
  api.get('/form/submission-status/', { params: { year } }).then(r => r.data)

// ═══════════════════════════════════════════════════════════════════════════════
// HOD — responses (all metrics at once)
// ═══════════════════════════════════════════════════════════════════════════════

export const fetchAllResponses = (year = getYear()) =>
  api.get('/form/responses/', { params: { year } }).then(r => r.data)

// ═══════════════════════════════════════════════════════════════════════════════
// HOD — documents
// ═══════════════════════════════════════════════════════════════════════════════

export const uploadDocument = async (metricId, file) => {
  const fd = new FormData()
  fd.append('metric_id', metricId)
  fd.append('file', file)
  const r = await api.post('/form/document/upload/', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return r.data
}

export const fetchDocuments = (metricId) =>
  api.get(`/form/documents/${encodeURIComponent(metricId)}/`).then(r => r.data)

export const deleteDocument = (docId) =>
  api.delete(`/form/document/${docId}/`)

// ═══════════════════════════════════════════════════════════════════════════════
// Settings + Completion
// ═══════════════════════════════════════════════════════════════════════════════

export const fetchSettings = () =>
  api.get('/form/settings/').then(r => r.data)

export const saveSettings = (data) =>
  api.post('/form/settings/', data).then(r => r.data)

export const fetchCompletion = (year = getYear()) =>
  api.get('/form/completion/', { params: { year } }).then(r => r.data)

// ═══════════════════════════════════════════════════════════════════════════════
// Admin — departments
// ═══════════════════════════════════════════════════════════════════════════════

export const fetchDepartments = () =>
  api.get('/form/departments/').then(r => r.data)

export const createDepartment = (data) =>
  api.post('/form/departments/', data).then(r => r.data)

export const updateDepartment = (id, data) =>
  api.put(`/form/departments/${id}/`, data).then(r => r.data)

export const deleteDepartment = (id) =>
  api.delete(`/form/departments/${id}/`)

// ═══════════════════════════════════════════════════════════════════════════════
// Admin — HOD accounts
// ═══════════════════════════════════════════════════════════════════════════════

export const fetchHODs = () =>
  api.get('/form/hods/').then(r => r.data)

export const createHOD = (data) =>
  api.post('/form/hods/', data).then(r => r.data)

export const deleteHOD = (id) =>
  api.delete(`/form/hods/${id}/`)

// ═══════════════════════════════════════════════════════════════════════════════
// Admin — dept responses + unlock
// ═══════════════════════════════════════════════════════════════════════════════

export const fetchDeptResponses = (deptId, year = getYear()) =>
  api.get(`/form/admin/responses/${deptId}/`, { params: { year } }).then(r => r.data)

export const fetchAdminResponses = (deptId, metricSlug, year = getYear()) =>
  api.get(`/form/admin/responses/${deptId}/${slug(metricSlug)}/`, { params: { year } }).then(r => r.data)

export const adminSaveMetric = async (deptId, metricId, rows, year = getYear()) => {
  const metrics = metricId.includes(',')
    ? metricId.split(',').map(m => m.trim())
    : [metricId]
  for (const m of metrics) {
    await api.post(`/form/admin/responses/${deptId}/${slug(m)}/`, rows, { params: { year } })
  }
}

export const adminUnlockDept = (deptId, year = getYear()) =>
  api.post(`/form/admin/unlock/${deptId}/`, { aqar_year: year }).then(r => r.data)

// Keep old name as alias so any component using it still works
export const adminUnlock = adminUnlockDept

export const fetchAllSubmissions = (year = getYear()) =>
  api.get('/form/submission-status/', { params: { year } }).then(r => r.data)

// ═══════════════════════════════════════════════════════════════════════════════
// Report downloads (browser direct-open with ?token= — no fetch/Blob needed)
// ═══════════════════════════════════════════════════════════════════════════════

export const openReportDownload = (deptId, fmt, year = getYear()) => {
  const token = localStorage.getItem('access')
  window.open(
    `${BACKEND}/form/report/${deptId}/${fmt}/?year=${year}&token=${token}`,
    '_blank'
  )
}

export const openCombinedReport = (fmt, year = getYear()) => {
  const token = localStorage.getItem('access')
  window.open(
    `${BACKEND}/form/admin/combined-report/?fmt=${fmt}&year=${year}&token=${token}`,
    '_blank'
  )
}

export default api