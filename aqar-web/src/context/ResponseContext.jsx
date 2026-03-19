import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { initResponses } from '../utils/naacData'
import {
  fetchAllResponses, saveMetricRows,
  uploadDocument, deleteDocument,
  fetchSettings, saveSettings as apiSaveSettings,
  fetchSubmissionStatus, submitData,
} from '../api/formApi'
import api from '../api/formApi'
export const ResponseContext = createContext()

export function ResponseProvider({ children }) {
  const { user, isHOD } = useAuth()

  const [responses,    setResponses]    = useState(initResponses)
  const [collegeName,  setCollegeName]  = useState('Your Institution')
  const [aqarYear,     setAqarYear]     = useState('2023-24')
  const [loading,      setLoading]      = useState(false)
  const [syncError,    setSyncError]    = useState(null)
  const [isSubmitted,  setIsSubmitted]  = useState(false)
  const [submittedAt,  setSubmittedAt]  = useState(null)

  useEffect(() => {
    if (!user || !isHOD) return
    setLoading(true)
    setSyncError(null)

    Promise.all([fetchAllResponses(), fetchSettings(), fetchSubmissionStatus()])
      .then(([serverData, serverSettings, subStatus]) => {
        if (serverData && typeof serverData === 'object') {
          setResponses(prev => {
            const next = { ...prev }
            Object.entries(serverData).forEach(([metricId, rows]) => {
              if (Array.isArray(rows) && rows.length > 0) {
                next[metricId] = {
                  ...prev[metricId],
                  rows: rows.map((row, i) => ({ ...row, _id: row._id || row.id || Date.now() + i })),
                  saved: true,
                }
              }
            })
            return next
          })
        }
        if (serverSettings?.college_name) setCollegeName(serverSettings.college_name)
        if (serverSettings?.aqar_year)    setAqarYear(serverSettings.aqar_year)

        // submission lock
        if (subStatus?.is_submitted) {
          setIsSubmitted(true)
          setSubmittedAt(subStatus.submitted_at)
        }
      })
      .catch(err => {
        console.error('Failed to load from server:', err)
        setSyncError('Could not load saved data — working offline.')
      })
      .finally(() => setLoading(false))
  }, [user, isHOD])

  const updateResponse = useCallback((metricId, value) => {
    setResponses(prev => ({
      ...prev,
      [metricId]: { ...prev[metricId], ...value, saved: false },
    }))
  }, [])

  const saveResponse = useCallback(async (metricId) => {
    if (isSubmitted) return { success: false, error: 'Data is locked after submission.' }
    const current = responses[metricId]
    if (!current) return { success: false }
    const rows = (current.rows || []).map(({ _id, ...rest }) => rest)
    try {
      await saveMetricRows(metricId, rows)
      setResponses(prev => ({ ...prev, [metricId]: { ...prev[metricId], saved: true } }))
      return { success: true }
    } catch (err) {
      console.error(`Save failed for ${metricId}:`, err)
      return { success: false, error: err.response?.data || 'Save failed' }
    }
  }, [responses, isSubmitted])

  const uploadFile = useCallback(async (metricId, file) => {
    if (isSubmitted) return { success: false, error: 'Data is locked after submission.' }
    try {
      const doc = await uploadDocument(metricId, file)
      const entry = {
        id: doc.id, name: doc.original_name,
        size: doc.file_size, ext: doc.extension,
        url: doc.url, fromServer: true,
      }
      setResponses(prev => ({
        ...prev,
        [metricId]: {
          ...prev[metricId],
          documents: [...(prev[metricId]?.documents || []), entry],
        },
      }))
      return { success: true, doc: entry }
    } catch (err) {
      return { success: false, error: err.response?.data || 'Upload failed' }
    }
  }, [isSubmitted])

  const removeDocument = useCallback(async (metricId, docId, isServerDoc) => {
    if (isSubmitted) return
    setResponses(prev => ({
      ...prev,
      [metricId]: {
        ...prev[metricId],
        documents: (prev[metricId]?.documents || []).filter(d => d.id !== docId),
      },
    }))
    if (isServerDoc) {
      try { await deleteDocument(docId) } catch (e) { console.error(e) }
    }
  }, [isSubmitted])

  const saveCollegeSettings = useCallback(async (name, year) => {
    setCollegeName(name)
    setAqarYear(year)
    try {
      await apiSaveSettings({ college_name: name, aqar_year: year })
      return { success: true }
    } catch (err) {
      return { success: false }
    }
  }, [])

const submitAllData = async () => {
  try {
    const res = await api.post('/form/submit/')
    setIsSubmitted(true)
    setSubmittedAt(res.data?.submitted_at || null)
    return {
      success: true,
      report_pdf:   res.data?.report_pdf   || null,
      report_excel: res.data?.report_excel || null,
    }
  } catch (err) {
    const data = err.response?.data
    // Pass validation errors back to caller if backend blocked submission
    if (err.response?.status === 422) {
      return {
        success: false,
        error: data?.error || 'Required fields are empty.',
        validation_errors: data?.validation_errors || [],
      }
    }
    return {
      success: false,
      error: data?.error || 'Submission failed. Please try again.',
    }
  }
}
  const getTotalDocs = () => Object.values(responses).reduce((s, r) => s + (r?.documents?.length || 0), 0)
  const getTotalRows = () => Object.values(responses).reduce((s, r) => s + (r?.rows?.length || 0), 0)

  return (
    <ResponseContext.Provider value={{
      responses, updateResponse, saveResponse,
      uploadFile, removeDocument,
      collegeName, setCollegeName, aqarYear, setAqarYear,
      saveCollegeSettings,
      getTotalDocs, getTotalRows,
      loading, syncError,
      isSubmitted, submittedAt, submitAllData,
    }}>
      {children}
    </ResponseContext.Provider>
  )
}

export const useResponses = () => useContext(ResponseContext)
