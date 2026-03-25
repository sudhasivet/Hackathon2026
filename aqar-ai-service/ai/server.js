import dotenv from 'dotenv';
dotenv.config();

import express, { json } from 'express'
import { generateParagraph, generateAllParagraphs, clearCache } from './generator.js'

const app  = express()
const PORT = process.env.AI_PORT || 3700

app.use(json({ limit: '5mb' }))

app.get('/health', (req, res) => {
  res.json({ status: 'ok', model: process.env.LLM_MODEL || 'mistral', port: PORT })
})

app.post('/api/generate/metric', async (req, res) => {
  const { metricId, rows, deptId, departmentName, collegeName, aqarYear } = req.body

  if (!metricId) {
    return res.status(400).json({ error: 'metricId is required' })
  }

  try {
    const result = await generateParagraph(
      metricId,
      rows || [],
      { deptId, departmentName, collegeName, aqarYear },
    )
    res.json(result)
  } catch (err) {
    console.error('[API] Error generating metric:', err)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/generate/all', async (req, res) => {
  const { metricsData, deptId, departmentName, collegeName, aqarYear } = req.body

  if (!metricsData || typeof metricsData !== 'object') {
    return res.status(400).json({ error: 'metricsData object is required' })
  }

  try {
    const results = await generateAllParagraphs(
      metricsDSaveViewata,
      { deptId, departmentName, collegeName, aqarYear },
    )
    res.json(results)
  } catch (err) {
    console.error('[API] Error generating all paragraphs:', err)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/cache/clear', (req, res) => {
  const { deptId } = req.body
  if (deptId) clearCache(deptId)
  res.json({ cleared: true, deptId })
})

app.listen(PORT, () => {
  console.log(`[AI Service] Running on http://localhost:${PORT}`)
  console.log(`[AI Service] LLM: ${process.env.LLM_MODEL || 'mistral'} via Ollama at ${process.env.OLLAMA_URL || 'http://localhost:11434'}`)
})

export default app