import dotenv from 'dotenv';
dotenv.config();

import express, { json } from 'express'
import { generateParagraph, generateAllParagraphs, clearCache } from './generator.js'

const app  = express()
const PORT = 3700

app.use(json({ limit: '5mb' }))

app.get('/health', (req, res) => {
  res.json({ status: 'ok', model: process.env.LLM_MODEL || 'mistral', port: PORT })
})
app.get('/ping',(req,res)=>{
  res.status(200).send("ok")
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

app.post("/api/generate/all", async (req, res) => {
  try {
    const { metricsData = {}, deptId, departmentName, collegeName, aqarYear } = req.body;
    console.log("Incoming request:", req.body);
    if (!metricsData || Object.keys(metricsData).length === 0) {
      return res.json({
        "1.2.2": {
          text: "The institution ensures structured curriculum delivery and academic planning aligned with institutional goals."
        }
      });
    }
    const result = await generateAllParagraphs(metricsData, { deptId, departmentName, collegeName, aqarYear });
    if (!result || typeof result !== "object") {
      return res.json({});
    }
    res.json(result);
  } catch (err) {
    console.error("AI CRASH:", err);
    res.status(200).json({});
  }
});

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