require('dotenv').config()

const AI_PROVIDER = (process.env.AI_PROVIDER || 'groq').toLowerCase()
const TIMEOUT_MS  = parseInt(process.env.AI_TIMEOUT_MS || '30000', 10)

async function fetchWithTimeout(url, options, timeoutMs = TIMEOUT_MS) {
  const controller = new AbortController()
  const timer      = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    return res
  } finally {
    clearTimeout(timer)
  }
}

function cleanResponse(raw) {
  return raw
    .replace(/^(Here is|Here's|Below is|The following is)[^:\n]*[:\n]+\s*/i, '')
    .replace(/^Paragraph:\s*/i, '')
    .replace(/^---+\s*/gm, '')
    .replace(/\*\*/g, '')
    .replace(/^\s*[-•*]\s+/gm, '')     // strip any bullet points
    .replace(/^\s*\d+\.\s+/gm, '')     // strip numbered lists
    .split(/\n\n+/)[0]                 // take only first paragraph
    .trim()
}


async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not set');
  }

  const model =
    process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

  const res = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: 'You are a professional NAAC AQAR report writer for Indian colleges. Write one formal, factual paragraph. Do not invent data. Do not use headings, lists, bullets, or JSON.'
          }]
        },
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500
        }
      })
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = await res.json();

  const text = data.candidates?.[0]?.content?.parts
    ?.map(part => part.text || '')
    .join('')
    .trim();

  if (!text) {
    throw new Error(
      `Gemini returned no text: ${JSON.stringify(data).slice(0, 300)}`
    );
  }

  return text;
}

async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY not set in environment')

  const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant'

  const res = await fetchWithTimeout(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role:    'system',
            content: 'You are a professional NAAC AQAR report writer for Indian colleges. Write formal institutional paragraphs only. No lists, no JSON, no bullet points.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens:  350,
        top_p:       0.85,
        stream:      false,
      }),
    },
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq API ${res.status}: ${err.slice(0, 200)}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

async function callTogether(prompt) {
  const apiKey = process.env.TOGETHER_API_KEY
  if (!apiKey) throw new Error('TOGETHER_API_KEY not set in environment')

  const model = process.env.TOGETHER_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2'

  const res = await fetchWithTimeout(
    'https://api.together.xyz/v1/chat/completions',
    {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role:    'system',
            content: 'You are a professional NAAC AQAR report writer for Indian colleges. Write formal institutional paragraphs only. No lists, no JSON, no bullet points.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens:  350,
        top_p:       0.85,
        stop:        ['\n\n\n'],
      }),
    },
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Together AI ${res.status}: ${err.slice(0, 200)}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

async function callHuggingFace(prompt) {
  const apiKey = process.env.HF_API_KEY
  if (!apiKey) throw new Error('HF_API_KEY not set in environment')

  const model = process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2'

  const res = await fetchWithTimeout(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputs: `<s>[INST] ${prompt} [/INST]`,
        parameters: {
          temperature:    0.3,
          max_new_tokens: 350,
          top_p:          0.85,
          return_full_text: false,
        },
      }),
    },
  )

  if (res.status === 503) {
    console.warn('[HF] Model loading, retrying in 20s...')
    await new Promise(r => setTimeout(r, 20000))
    return callHuggingFace(prompt)
  }

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`HuggingFace API ${res.status}: ${err.slice(0, 200)}`)
  }

  const data = await res.json()
  // HF returns an array
  const raw = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text
  return raw || ''
}


const PROVIDERS = {
  gemini: {
    fn: callGemini,
    name: 'Google Gemini'
  },
  // groq: {
  //   fn: callGroq,
  //   name: 'Groq'
  // },
  together: {
    fn: callTogether,
    name: 'Together AI'
  },
  huggingface: {
    fn: callHuggingFace,
    name: 'HuggingFace'
  },
};


function getCallOrder() {
  const primary  = PROVIDERS[AI_PROVIDER] ? AI_PROVIDER : 'groq'
  const fallbacks = Object.keys(PROVIDERS).filter(k => k !== primary)
  return [primary, ...fallbacks]
}

/**
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function generateAIContent(prompt) {
  const order = getCallOrder()
  let lastError

  for (const providerKey of order) {
    const provider = PROVIDERS[providerKey]
    if (!provider) continue

    const keyMap = { groq: 'GROQ_API_KEY', together: 'TOGETHER_API_KEY', huggingface: 'HF_API_KEY' }
    if (!process.env[keyMap[providerKey]]) {
      console.log(`[AI] Skipping ${provider.name} — no API key set`)
      continue
    }

    try {
      console.log(`[AI] Calling ${provider.name}...`)
      const raw     = await provider.fn(prompt)
      const cleaned = cleanResponse(raw)

      if (!cleaned || cleaned.length < 50) {
        throw new Error(`Response too short (${cleaned.length} chars)`)
      }

      console.log(`[AI] ✓ ${provider.name} succeeded (${cleaned.split(/\s+/).length} words)`)
      return cleaned
    } catch (err) {
      console.warn(`[AI] ${provider.name} failed: ${err.message}`)
      lastError = err

      if (err.message.includes('429') || err.message.includes('rate')) {
        console.warn('[AI] Rate limited — waiting 3s before fallback...')
        await new Promise(r => setTimeout(r, 3000))
      }
    }
  }

  throw new Error(`All AI providers failed. Last error: ${lastError?.message}`)
}

module.exports = { generateAIContent }