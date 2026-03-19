import axios from 'axios'

const BACKEND = 'https://naac-navigator.onrender.com'

const api = axios.create({ baseURL: BACKEND })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const slug = (metricId) => metricId.replace(/\./g, '-')

export const fetchAllResponses  = ()           => api.get('/form/responses/').then(r => r.data)
export const saveMetricRows     = (id, rows)   => api.post(`/form/${slug(id)}/`, { rows }).then(r => r.data)
export const addMetricRow       = (id, data)   => api.post(`/form/${slug(id)}/`, data).then(r => r.data)
export const updateMetricRow    = (id, pk, data) => api.put(`/form/${slug(id)}/${pk}/`, data).then(r => r.data)
export const deleteMetricRow    = (id, pk)     => api.delete(`/form/${slug(id)}/${pk}/`)

export const submitData         = ()           => api.post('/form/submit/').then(r => r.data)
export const fetchSubmissionStatus = ()        => api.get('/form/submission-status/').then(r => r.data)

export const uploadDocument = async (metricId, file) => {
  const fd = new FormData()
  fd.append('metric_id', metricId)
  fd.append('file', file)
  const r = await api.post('/form/document/upload/', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return r.data
}
export const fetchDocuments  = (metricId) => api.get(`/form/documents/${encodeURIComponent(metricId)}/`).then(r => r.data)
export const deleteDocument  = (docId)    => api.delete(`/form/document/${docId}/`)

export const fetchSettings   = ()     => api.get('/form/settings/').then(r => r.data)
export const saveSettings    = (data) => api.post('/form/settings/', data).then(r => r.data)
export const fetchCompletion = ()     => api.get('/form/completion/').then(r => r.data)

export const fetchDepartments   = ()           => api.get('/form/departments/').then(r => r.data)
export const createDepartment   = (data)       => api.post('/form/departments/', data).then(r => r.data)
export const updateDepartment   = (id, data)   => api.put(`/form/departments/${id}/`, data).then(r => r.data)
export const deleteDepartment   = (id)         => api.delete(`/form/departments/${id}/`)

export const fetchHODs          = ()           => api.get('/form/hods/').then(r => r.data)
export const createHOD          = (data)       => api.post('/form/hods/', data).then(r => r.data)
export const deleteHOD          = (id)         => api.delete(`/form/hods/${id}/`)

export const fetchDeptResponses = (deptId)     => api.get(`/form/admin/responses/${deptId}/`).then(r => r.data)
export const adminSaveMetric    = (deptId, metricId, rows) =>
  api.post(`/form/admin/responses/${deptId}/${slug(metricId)}/`, { rows }).then(r => r.data)
export const adminUnlockDept    = (deptId)     => api.post(`/form/admin/unlock/${deptId}/`).then(r => r.data)
export const fetchAllSubmissions = ()          => api.get('/form/submission-status/').then(r => r.data)
export default api