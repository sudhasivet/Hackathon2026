import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { initResponses } from '../utils/naacData'
import {
  fetchAllResponses, saveMetricRows,
  uploadDocument, deleteDocument,
  fetchSettings, saveSettings as apiSaveSettings,
  fetchSubmissionStatus, submitData,
  openReportDownload,
} from '../api/formApi'

export const ResponseContext = createContext()

export function ResponseProvider({ children }) {
  const { user, isHOD } = useAuth()

  const [responses,   setResponses]   = useState(initResponses)
  const [collegeName, setCollegeName] = useState('Your Institution')
  const [aqarYear,    setAqarYear]    = useState(
    () => localStorage.getItem('aqar_year') || '2023-24'
  )
  const [loading,     setLoading]     = useState(false)
  const [syncError,   setSyncError]   = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedAt, setSubmittedAt] = useState(null)

  // ── Keep localStorage in sync with state ──────────────────────────────────
  useEffect(() => {
    localStorage.setItem('aqar_year', aqarYear)
  }, [aqarYear])

  // ── Load data on mount (HOD only) ─────────────────────────────────────────
  useEffect(() => {
    if (!user || !isHOD) return
    setLoading(true)
    setSyncError(null)

    Promise.all([
      fetchAllResponses(aqarYear),
      fetchSettings(),
      fetchSubmissionStatus(aqarYear),
    ])
      .then(([serverData, serverSettings, subStatus]) => {

        // ── Merge server rows into local state ──────────────────────────────
        // fetchAllResponses returns { metricId: [...rows], ... }
        // Guard against unexpected shapes (array, null, etc.)
        if (serverData && typeof serverData === 'object' && !Array.isArray(serverData)) {
          setResponses(prev => {
            const next = { ...prev }
            Object.entries(serverData).forEach(([metricId, rows]) => {
              // rows must be an array — skip if not
              if (!Array.isArray(rows) || rows.length === 0) return
              next[metricId] = {
                ...prev[metricId],
                rows: rows.map((row, i) => ({
                  ...row,
                  _id: row._id || row.id || Date.now() + i,
                })),
                saved: true,
              }
            })
            return next
          })
        }

        // ── Settings ────────────────────────────────────────────────────────
        if (serverSettings?.college_name) setCollegeName(serverSettings.college_name)
        if (serverSettings?.aqar_year) {
          setAqarYear(serverSettings.aqar_year)
          localStorage.setItem('aqar_year', serverSettings.aqar_year)
        }

        // ── Submission lock ─────────────────────────────────────────────────
        // subStatus is a plain object { is_submitted, submitted_at, ... }
        if (subStatus && subStatus.is_submitted) {
          setIsSubmitted(true)
          setSubmittedAt(subStatus.submitted_at)
        } else {
          setIsSubmitted(false)
          setSubmittedAt(null)
        }
      })
      .catch(err => {
        console.error('Failed to load from server:', err)
        setSyncError('Could not load saved data — working offline.')
      })
      .finally(() => setLoading(false))
  }, [user, isHOD, aqarYear])   // re-run when year changes → fresh dataset

  // ── Update a metric's local state ────────────────────────────────────────
  const updateResponse = useCallback((metricId, value) => {
    setResponses(prev => ({
      ...prev,
      [metricId]: { ...prev[metricId], ...value, saved: false },
    }))
  }, [])

  // ── Save one metric to server ─────────────────────────────────────────────
  const saveResponse = useCallback(async (metricId) => {
    if (isSubmitted) return { success: false, error: 'Data is locked after submission.' }
    const current = responses[metricId]
    if (!current) return { success: false }
    const rows = (current.rows || []).map(({ _id, ...rest }) => rest)
    try {
      await saveMetricRows(metricId, rows, aqarYear)
      setResponses(prev => ({ ...prev, [metricId]: { ...prev[metricId], saved: true } }))
      return { success: true }
    } catch (err) {
      console.error(`Save failed for ${metricId}:`, err)
      return { success: false, error: err.response?.data || 'Save failed' }
    }
  }, [responses, isSubmitted, aqarYear])

  // ── File upload / removal ─────────────────────────────────────────────────
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

  // ── College settings ──────────────────────────────────────────────────────
  const saveCollegeSettings = useCallback(async (name, year) => {
    setCollegeName(name)
    setAqarYear(year)
    localStorage.setItem('aqar_year', year)
    try {
      await apiSaveSettings({ college_name: name, aqar_year: year })
      return { success: true }
    } catch (err) {
      return { success: false }
    }
  }, [])

  // ── Report download ───────────────────────────────────────────────────────
  // Uses window.open with ?token= — no blob/fetch timeout issues on Render
  const downloadReport = (deptId, format = 'pdf') => {
    openReportDownload(deptId, format, aqarYear)
  }

  // ── Submit all data ───────────────────────────────────────────────────────
  const submitAllData = async () => {
    try {
      const res = await submitData(aqarYear)
      setIsSubmitted(true)
      setSubmittedAt(res?.submitted_at || null)
      return {
        success:      true,
        dept_id:      res?.dept_id      || null,
        report_pdf:   res?.report_pdf   || null,
        report_excel: res?.report_excel || null,
      }
    } catch (err) {
      const data = err.response?.data
      if (err.response?.status === 422) {
        return {
          success:           false,
          error:             data?.error || 'Required fields are empty.',
          validation_errors: data?.validation_errors || [],
        }
      }
      return {
        success: false,
        error:   data?.error || 'Submission failed. Please try again.',
      }
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getTotalDocs = () =>
    Object.values(responses).reduce((s, r) => s + (r?.documents?.length || 0), 0)
  const getTotalRows = () =>
    Object.values(responses).reduce((s, r) => s + (r?.rows?.length || 0), 0)

  return (
    <ResponseContext.Provider value={{
      responses, updateResponse, saveResponse,
      uploadFile, removeDocument,
      collegeName, setCollegeName,
      aqarYear,    setAqarYear,
      saveCollegeSettings,
      getTotalDocs, getTotalRows,
      loading, syncError,
      isSubmitted, submittedAt,
      submitAllData, downloadReport,
    }}>
      {children}
    </ResponseContext.Provider>
  )
}

export const useResponses = () => useContext(ResponseContext)