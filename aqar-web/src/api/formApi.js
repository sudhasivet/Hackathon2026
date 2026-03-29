// import axios from 'axios'

// const BACKEND = 'https://naac-navigator.onrender.com'

// const api = axios.create({ baseURL: BACKEND })

// api.interceptors.request.use(config => {
//   const token = localStorage.getItem('access')
//   if (token) config.headers.Authorization = `Bearer ${token}`
//   return config
// })
// const METRIC_ALIASES = {
//   '1.2.2 , 1.2.3': '1-2-2',
//   '1.2.3':          '1-2-2',
//   '2.4.2':          '2-4-2',
//   '3.4.3':          '3-4-3',
// }
// const slug = (metricId) => {
//   if (METRIC_ALIASES[metricId]) return METRIC_ALIASES[metricId]
//   return metricId.replace(/\./g, '-')
// }
// export const fetchAllResponses  = ()           => api.get('/form/responses/').then(r => r.data)
// export const saveMetricRows     = (id, rows)   => api.post(`/form/${slug(id)}/`, { rows }).then(r => r.data)
// export const addMetricRow       = (id, data)   => api.post(`/form/${slug(id)}/`, data).then(r => r.data)
// export const updateMetricRow    = (id, pk, data) => api.put(`/form/${slug(id)}/${pk}/`, data).then(r => r.data)
// export const deleteMetricRow    = (id, pk)     => api.delete(`/form/${slug(id)}/${pk}/`)

// export const submitData         = ()           => api.post('/form/submit/').then(r => r.data)
// export const fetchSubmissionStatus = ()        => api.get('/form/submission-status/').then(r => r.data)

// export const uploadDocument = async (metricId, file) => {
//   const fd = new FormData()
//   fd.append('metric_id', metricId)
//   fd.append('file', file)
//   const r = await api.post('/form/document/upload/', fd, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   })
//   return r.data
// }
// export const fetchDocuments  = (metricId) => api.get(`/form/documents/${encodeURIComponent(metricId)}/`).then(r => r.data)
// export const deleteDocument  = (docId)    => api.delete(`/form/document/${docId}/`)

// export const fetchSettings   = ()     => api.get('/form/settings/').then(r => r.data)
// export const saveSettings    = (data) => api.post('/form/settings/', data).then(r => r.data)
// export const fetchCompletion = ()     => api.get('/form/completion/').then(r => r.data)

// export const fetchDepartments   = ()           => api.get('/form/departments/').then(r => r.data)
// export const createDepartment   = (data)       => api.post('/form/departments/', data).then(r => r.data)
// export const updateDepartment   = (id, data)   => api.put(`/form/departments/${id}/`, data).then(r => r.data)
// export const deleteDepartment   = (id)         => api.delete(`/form/departments/${id}/`)

// export const fetchHODs          = ()           => api.get('/form/hods/').then(r => r.data)
// export const createHOD          = (data)       => api.post('/form/hods/', data).then(r => r.data)
// export const deleteHOD          = (id)         => api.delete(`/form/hods/${id}/`)

// export const fetchDeptResponses = (deptId)     => api.get(`/form/admin/responses/${deptId}/`).then(r => r.data)
// export const adminSaveMetric = async (deptId, metricId, rows) => {
//   const metrics = metricId.includes(',')
//     ? metricId.split(',').map(m => m.trim())
//     : [metricId]

//   for (const m of metrics) {
//     await api.post(`/form/admin/responses/${deptId}/${slug(m)}/`, { rows })
//   }
// }
// export const adminUnlockDept    = (deptId)     => api.post(`/form/admin/unlock/${deptId}/`).then(r => r.data)
// export const fetchAllSubmissions = ()          => api.get('/form/submission-status/').then(r => r.data)
// export default api

import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Metric ID alias map (fixes 404 for combined metric slugs) ─────────────────
const METRIC_ALIASES = {
  '1.2.2 , 1.2.3': '1-2-2',
  '1.2.3':          '1-2-2',
}

const slug = (metricId) => {
  if (METRIC_ALIASES[metricId]) return METRIC_ALIASES[metricId]
  return metricId.replace(/\./g, '-')
}

// ── HOD — read metric rows for THIS year ─────────────────────────────────────
export const fetchMetricRows = (metricSlug, year) =>
  api.get(`/form/${slug(metricSlug)}/`, { params: { year } })

// ── HOD — save rows (stamped with year on backend) ────────────────────────────
export const saveMetricRows = (metricSlug, rows, year) =>
  api.post(`/form/${slug(metricSlug)}/`, rows, { params: { year } })

// ── HOD — delete a single row ─────────────────────────────────────────────────
export const deleteMetricRow = (metricSlug, id, year) =>
  api.delete(`/form/${slug(metricSlug)}/${id}/`, { params: { year } })

// ── Admin — read dept responses for THIS year ─────────────────────────────────
export const fetchAdminResponses = (deptId, metricSlug, year) =>
  api.get(`/form/admin/responses/${deptId}/${slug(metricSlug)}/`, { params: { year } })

// ── Admin — overwrite dept metric for THIS year ───────────────────────────────
export const adminSaveMetric = (deptId, metricSlug, rows, year) =>
  api.post(`/form/admin/responses/${deptId}/${slug(metricSlug)}/`, rows, { params: { year } })

// ── Submit (HOD) ──────────────────────────────────────────────────────────────
export const submitData = (year) =>
  api.post('/form/submit/', { aqar_year: year })

// ── Submission status ─────────────────────────────────────────────────────────
export const fetchSubmissionStatus = (year) =>
  api.get('/form/submission-status/', { params: { year } })

// ── Admin unlock ──────────────────────────────────────────────────────────────
export const adminUnlock = (deptId, year) =>
  api.post(`/form/admin/unlock/${deptId}/`, { aqar_year: year })

// ── Report download (browser direct-open with ?token=) ────────────────────────
const BACKEND = import.meta.env.VITE_API_URL || 'https://naac-navigator.onrender.com'

export const openReportDownload = (deptId, fmt, year) => {
  const token = localStorage.getItem('access')
  window.open(
    `${BACKEND}/form/report/${deptId}/${fmt}/?year=${year}&token=${token}`,
    '_blank'
  )
}

// ── Admin combined report download ────────────────────────────────────────────
export const openCombinedReport = (fmt, year) => {
  const token = localStorage.getItem('access')
  window.open(
    `${BACKEND}/form/admin/combined-report/?fmt=${fmt}&year=${year}&token=${token}`,
    '_blank'
  )
}

export default api