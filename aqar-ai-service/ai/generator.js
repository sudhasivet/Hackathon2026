const { formatMetricData }  = require('./dataFormatter')
const { extractFacts }      = require('./ruleEngine')
const { buildPrompt }       = require('./promptBuilder')
const { generateAIContent } = require('./llmClient')

// Output validator 
function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function validate(text) {
  const errors = []
  const words  = countWords(text)
  // if (words < 100)  errors.push(`Too short: ${words} words`)
  if (words > 220)  errors.push(`Too long: ${words} words`)
  if (text.includes('{') || text.includes('[')) errors.push('Contains JSON characters')
  if (/^\s*[-•*]\s/m.test(text))  errors.push('Contains bullet points')
  if (/^\s*\d+\.\s/m.test(text))  errors.push('Contains numbered list')
  return { valid: errors.length === 0, errors, wordCount: words }
}

// In-memory cache ─
const cache = new Map()

function makeHash(rows) {
  return JSON.stringify(rows)
    .split('')
    .reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0xffffffff, 0)
    .toString(16)
}

function generateFallback(metricId, facts, options = {}) {
  const { collegeName = 'The institution', aqarYear = '2023-24' } = options
  const signal = facts.signal || 'structured practices are followed in this area.'
  const parts  = [`${collegeName} ensures that ${signal.toLowerCase()}`]

  if (facts.totalRecords > 0) {
    parts.push(`During ${aqarYear}, a total of ${facts.totalRecords} records were documented for this metric, reflecting consistent institutional engagement.`)
  }
  if (facts.years && facts.years.length > 1) {
    parts.push('These activities have been carried out across multiple academic years, demonstrating a sustained and systematic approach.')
  }
  parts.push('The institution continuously monitors and evaluates its processes in alignment with NAAC quality parameters, with a strong focus on continuous improvement and student-centred outcomes.')
  return parts.join(' ')
}

// Main: generate one metric paragraph
async function generateParagraph(metricId, rawRows, options = {}, forceRegenerate = false) {
  const { deptId = 'default' } = options
  const cacheKey = `${deptId}:${metricId}`
  const hash     = makeHash(rawRows)

  // Return cached version if data unchanged
  if (!forceRegenerate && cache.has(cacheKey)) {
    const cached = cache.get(cacheKey)
    if (cached.hash === hash) {
      return { ...cached.result, fromCache: true }
    }
  }

  // 1. Format → 2. Extract facts → 3. Build prompt
  const formattedContext = formatMetricData(metricId, rawRows)
  const facts            = extractFacts(metricId, formattedContext)
  const prompt           = buildPrompt(metricId, facts, options)

  // 4. Call external AI API
  // in generateParagraph, track whether the AI actually succeeded
let text, usedFallback = false
try {
  text = await generateAIContent(prompt)
} catch (err) {
  console.error(`[Generator] AI call failed for ${metricId}:`, err.message)
  text = generateFallback(metricId, facts, options)
  usedFallback = true
}

  // 5. Validate — retry once if invalid
  const validation = validate(text)
  if (!validation.valid) {
    console.warn(`[Generator] Validation failed for ${metricId}:`, validation.errors)
    try {
      const retryPrompt = prompt + '\n\nCRITICAL: Write exactly 140-170 words in ONE paragraph. No lists, no headings.'
      text = await generateAIContent(retryPrompt)
    } catch {
      text = generateFallback(metricId, facts, options)
    }
  }

  const result = {
    text,
    wordCount:   countWords(text),
    fromCache:   false,
    metricId,
    generatedAt: new Date().toISOString(),
  }

  if (!usedFallback) cache.set(cacheKey, { hash, result })
  return result
}

// Batch generator ─
async function generateAllParagraphs(metricsData, options = {}) {
  const results   = {}
  const metricIds = Object.keys(metricsData)
  console.log(`[Generator] Generating ${metricIds.length} paragraphs for dept ${options.deptId}...`)

  for (const metricId of metricIds) {
    try {
      console.log(`[Generator] → ${metricId}`)
      const r = await generateParagraph(metricId, metricsData[metricId] || [], options)
      results[metricId] = r
      if (!r.fromCache) await new Promise(res => setTimeout(res, 500))
    } catch (err) {
      console.error(`[Generator] Failed for ${metricId}:`, err.message)
      const facts = extractFacts(metricId, formatMetricData(metricId, metricsData[metricId] || []))
      results[metricId] = {
        text:      generateFallback(metricId, facts, options),
        wordCount: 0,
        fromCache: false,
        metricId,
        error:     err.message,
      }
    }
  }
  return results
}

function clearCache(deptId) {
  for (const key of cache.keys()) {
    if (key.startsWith(`${deptId}:`)) cache.delete(key)
  }
}

module.exports = { generateParagraph, generateAllParagraphs, clearCache }