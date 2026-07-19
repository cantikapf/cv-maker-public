const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

/**
 * Sanitizes the raw model response by stripping markdown code block wrapping.
 * @param {string} raw
 * @returns {string}
 */
export function cleanJSON(raw) {
  if (!raw) return ''
  let text = raw.trim()
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
  }
  return text
}

/**
 * Retrieves all Groq API keys dynamically from environment variables matching VITE_GROQ_API_KEY*.
 * Supports comma-separated keys within a single env variable as well.
 * @returns {string[]}
 */
export function getApiKeys() {
  const keys = []
  for (const envKey in import.meta.env) {
    if (envKey.startsWith('VITE_GROQ_API_KEY')) {
      const val = import.meta.env[envKey]
      if (typeof val === 'string' && val.trim()) {
        val.split(',').forEach(k => {
          const trimmed = k.trim()
          if (trimmed && !keys.includes(trimmed)) {
            keys.push(trimmed)
          }
        })
      }
    }
  }
  return keys
}

/**
 * Performs fetch to Groq API (or Nvidia NIM as fallback) with automatic fallback/retry over available API keys.
 * @param {Object} payload
 * @returns {Promise<Response>}
 */
export async function fetchWithFallback(payload) {
  const keys = getApiKeys()
  if (keys.length === 0) {
    throw new Error('Tidak ada API Key Groq/Nvidia yang terkonfigurasi. Pastikan VITE_GROQ_API_KEY diset di file .env')
  }

  let lastError = null
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const isNvidia = key.startsWith('nvapi-')
    const url = isNvidia
      ? 'https://integrate.api.nvidia.com/v1/chat/completions'
      : GROQ_API_URL

    // Clone payload and map model if calling Nvidia NIM API
    const adjustedPayload = { ...payload }
    if (isNvidia) {
      adjustedPayload.model = 'meta/llama-3.1-70b-instruct'
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adjustedPayload),
      })

      if (!response.ok) {
        const errText = await response.text()
        const status = response.status
        console.warn(`[groqClient] API Key #${i + 1} (${isNvidia ? 'Nvidia' : 'Groq'}) failed with status ${status}: ${errText}`)
        
        if (status === 400) {
          throw new Error(`API error 400: ${errText}`)
        }
        
        lastError = new Error(`Key #${i + 1} (${isNvidia ? 'Nvidia' : 'Groq'}) failed with status ${status}: ${errText}`)
        continue
      }

      return response
    } catch (err) {
      console.error(`[groqClient] Error using Key #${i + 1} (${isNvidia ? 'Nvidia' : 'Groq'}):`, err)
      if (err.message.includes('API error 400')) {
        throw err
      }
      lastError = err
    }
  }

  throw new Error(`Semua API Key (Groq/Nvidia) gagal. Error terakhir: ${lastError?.message || 'Unknown network error'}`)
}

/**
 * Strip large binary/base64 data from CV data before sending to LLM context to prevent token overflow.
 * @param {Object} cvData
 * @returns {Object}
 */
export function cleanCVDataForAI(cvData) {
  if (!cvData) return null
  const cleaned = { ...cvData }
  if (cleaned.personalInfo) {
    const { photo, ...rest } = cleaned.personalInfo
    cleaned.personalInfo = {
      ...rest,
      photo: photo ? '[BASE64_IMAGE_DATA_OMITTED]' : undefined
    }
  }
  return cleaned
}

export const SYSTEM_PROMPT = `You are an expert CV editor assistant integrated into a CV editing web application.
Your role is to help the user edit, improve, and manage their CV content.

You follow the Harvard Career Services Resume Guide as your primary reference:
https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/

### HARVARD RESUME PRINCIPLES (apply to ALL suggestions):
- Use SPECIFIC, ACTIVE language — not passive ("Led" not "was responsible for")
- Express, not impress — articulate, not flowery
- FACT-BASED: always suggest adding numbers/metrics to quantify impact
- Action verbs ONLY to start bullets: Led, Managed, Developed, Analyzed, Coordinated...
- NO personal pronouns (I, We, My, Our) in any CV text
- NO narrative style — concise bullet points only
- Reverse chronological order for all entries
- Demonstrate RESULTS, not just responsibilities
- Summary should be 20-50 words

### HARVARD TOP 5 MISTAKES to always avoid:
1. Spelling and grammar errors
2. Missing contact info (email, phone)
3. Passive language instead of action words
4. Disorganized, not easy to skim
5. Not demonstrating results (no metrics)

### YOUR CAPABILITIES:
1. ADD new entries to any CV section
2. UPDATE/EDIT existing entries in any CV section
3. DELETE entries (requires user confirmation first)
4. IMPROVE writing: fix grammar, make bullet points more impactful, enhance professional tone
5. SUGGEST improvements proactively when you notice areas that could be stronger
6. REORDER entries within a section (e.g., sort by date, newest to oldest). You must provide the exact new array of IDs.
7. BATCH UPDATE multiple sections/entries at once — use this for bulk operations like translating the entire CV to English, or restructuring multiple sections.

### RESPONSE FORMAT:
You MUST always respond with a valid JSON object. No extra text outside the JSON. Use this exact structure for SINGLE operations:
{
  "message": "Your conversational reply to the user in Bahasa Indonesia",
  "action": "none" | "add" | "update" | "delete" | "confirm_required" | "improve" | "reorder" | "batch_update",
  "section": "workExperience" | "education" | "skills" | "languages" | "certifications" | "awards" | "publications" | "projects" | "organizationalExperience" | "personalInfo" | null,
  "targetId": "ID of the entry to update/delete, if applicable, or null",
  "data": { the new or updated data object } or ["id1", "id2", ...] (an array of string IDs) if action is "reorder", or null,
  "confirmMessage": "Message to show user for confirmation dialog, if action is confirm_required, else null",
  "updates": null
}

For BATCH UPDATE operations (translating entire CV, bulk improvements across multiple sections), use this structure instead:
{
  "message": "Your conversational reply to the user in Bahasa Indonesia",
  "action": "batch_update",
  "section": null,
  "targetId": null,
  "data": null,
  "confirmMessage": "Ringkasan perubahan yang akan dilakukan: [list perubahan singkat]",
  "updates": [
    { "section": "personalInfo", "targetId": null, "data": { "summary": "translated text..." } },
    { "section": "workExperience", "targetId": "we_001", "data": { "jobTitle": "...", "bullets": ["..."] } },
    { "section": "skills", "targetId": "skill_001", "data": { "category": "Technology Skills", "items": "..." } }
  ]
}

### IMPORTANT RULES:
- For DELETE operations: ALWAYS use action="confirm_required" first. Set confirmMessage. Only delete after user explicitly confirms.
- For UPDATE operations on existing entries: ALWAYS use action="confirm_required" first. Show a diff-like summary in the message.
- For ADD operations: use action="add" directly, no confirmation needed.
- For IMPROVE operations on existing text: use action="confirm_required". Show what changed and why in "message".
- For REORDER operations: use action="reorder" directly. Set "data" to an array containing the exact IDs in the new desired order.
- For BULK operations (translate all, improve all, etc.): ALWAYS use action="batch_update" with an "updates" array. Set confirmMessage to a clear summary. The system will ask user to confirm before applying.
- Write ALL CV content (bullet points, descriptions, job titles, degree names) in English to maintain CV consistency.
- Respond to the user ("message" field) ONLY in Bahasa Indonesia.
- When improving text, be specific about what you changed and why in the "message".
- Always reference the current CV data to avoid creating duplicate entries.
- If the user's request is ambiguous or you need more details, ask for clarification and use action="none".
- When adding bullets, write them in strong action-verb format with quantifiable impact where possible.
- Generate unique IDs for new entries using format: section_timestamp (e.g., "workExperience_1720000000000").

### CV DATA SCHEMA (use this when creating or updating entries):
- Work Experience: { id, jobTitle, company, location, startDate, endDate, bullets: string[] }
- Education: { id, degree, institution, location, startDate, endDate, gpa, bullets: string[] }
- Organization: { id, role, organization, location, startDate, endDate, description }
- Project: { id, title, url, startDate, endDate, description, bullets: string[] }
- Certification: { id, name, issuer, date, credentialId }
- Award: { id, title, issuer, date, description }
- Publication: { id, title, conference, date, url, description }
- Language: { id, name, proficiency }
- Skills: { id, category: string, items: string } (Array of objects, e.g. [{ id: "skill_1", category: "Technology Skills", items: "Python, React" }])
- Personal Info: { name, location, email, phone, linkedin, github, portfolio, summary }`

/**
 * Calls the Groq API with the given message history and current CV context.
 * @param {Array} messages - Full chat history array [{role, content}]
 * @param {Object} cvData - Current CV data to inject as context
 * @returns {Promise<{message, action, section, targetId, data, confirmMessage}>}
 */
export async function callGroq(messages, cvData) {
  const cleanedCvData = cleanCVDataForAI(cvData)
  // Keep only the last 8 messages for API payload to avoid context length overflow
  const trimmedMessages = messages.slice(-8)

  // Inject current CV data into the last user message for full context
  const messagesWithContext = trimmedMessages.map((msg, idx) => {
    if (idx === trimmedMessages.length - 1 && msg.role === 'user') {
      return {
        ...msg,
        content: `[CURRENT CV DATA]\n${JSON.stringify(cleanedCvData, null, 2)}\n\n[USER REQUEST]\n${msg.content}`,
      }
    }
    return msg
  })

  const payload = {
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messagesWithContext,
    ],
    response_format: { type: 'json_object' },
    temperature: 0.4,
    max_tokens: 4096,
  }

  const response = await fetchWithFallback(payload)
  const json = await response.json()
  const raw = cleanJSON(json.choices?.[0]?.message?.content || '')

  try {
    const parsed = JSON.parse(raw)
    return {
      message: parsed.message ?? 'Terjadi kesalahan pada respons AI.',
      action: parsed.action ?? 'none',
      section: parsed.section ?? null,
      targetId: parsed.targetId ?? null,
      data: parsed.data ?? null,
      confirmMessage: parsed.confirmMessage ?? null,
      updates: parsed.updates ?? null,
    }
  } catch {
    console.error('[groqClient] Failed to parse AI response:', raw)
    return {
      message: 'Maaf, respons AI tidak dapat diproses. Coba lagi.',
      action: 'none',
      section: null,
      targetId: null,
      data: null,
      confirmMessage: null,
    }
  }
}

/**
 * Calls Groq to match CV content against a job description.
 * Returns matched keywords, missing keywords, and suggestions.
 * @param {Object} cvData
 * @param {string} jobDescription
 * @returns {Promise<{matched: string[], missing: string[], suggestions: string[], message: string}>}
 */
export async function callJobMatch(cvData, jobDescription) {
  const cleanedCvData = cleanCVDataForAI(cvData)
  const systemPrompt = `You are an expert ATS (Applicant Tracking System) resume optimizer.
You follow the Harvard Career Services Resume Guide principles.
Analyze the CV against the job description and identify keyword gaps.

Respond ONLY with valid JSON in this exact format:
{
  "matched": ["keyword1", "keyword2"],
  "missing": ["keyword3", "keyword4"],
  "suggestions": ["Add 'Python' to your Skills section", "Mention 'stakeholder management' in your summary"],
  "message": "Analisis dalam Bahasa Indonesia — ringkasan kecocokan CV dengan job description"
}`

  const userContent = `[JOB DESCRIPTION]\n${jobDescription}\n\n[CURRENT CV DATA]\n${JSON.stringify(cleanedCvData, null, 2)}`

  const payload = {
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 1024,
  }

  const response = await fetchWithFallback(payload)
  const json = await response.json()
  const raw = cleanJSON(json.choices?.[0]?.message?.content || '')
  try {
    const parsed = JSON.parse(raw)
    return {
      matched: parsed.matched ?? [],
      missing: parsed.missing ?? [],
      suggestions: parsed.suggestions ?? [],
      message: parsed.message ?? '',
    }
  } catch {
    console.error('[groqClient:callJobMatch] Failed to parse:', raw)
    return { matched: [], missing: [], suggestions: [], message: 'Gagal menganalisis job description.' }
  }
}

/**
 * Calls Groq to perform a summary action (enhance, fix grammar, generate samples, etc.)
 * @param {string} currentSummary - Existing summary text
 * @param {Object} cvData - Full CV for context
 * @param {'enhance'|'fix-grammar'|'highlight-keywords'|'generate-samples'|'write-from-resume'|'make-compact'} action
 * @returns {Promise<{result: string|string[], message: string}>}
 */
export async function callSummaryAction(currentSummary, cvData, action) {
  const cleanedCvData = cleanCVDataForAI(cvData)
  const actionPrompts = {
    enhance: 'Improve the existing summary — make it more impactful, concise (20-50 words), and professional. Keep the user\'s voice but strengthen it.',
    'fix-grammar': 'Fix spelling and grammar errors in the summary. Keep content the same but ensure it is polished and professional.',
    'highlight-keywords': 'Identify and bold the most important professional keywords in the summary using **word** markdown syntax.',
    'generate-samples': 'Generate 3 different sample summaries (each 20-50 words) based on the user\'s CV data. Return them as an array in the "samples" field.',
    'write-from-resume': 'Write a professional summary (20-50 words) based on the user\'s work experience, education, and skills. NO personal pronouns.',
    'make-compact': 'Shorten and condense the summary to be strictly between 20 to 50 words maximum. Pick only the most impactful accomplishments, use active verbs, and remove any personal pronouns.'
  }

  const systemPrompt = `You are an expert resume summary writer following Harvard Career Services guidelines.
Rules:
- 20-50 words maximum
- NO personal pronouns (I, We, My, Our)
- Active language, specific, fact-based
- Express, not impress — articulate, not flowery
- Start with a strong professional descriptor

Task: ${actionPrompts[action] || actionPrompts.enhance}

Respond ONLY with valid JSON:
{
  "result": "improved summary text" (string) OR for generate-samples: null,
  "samples": ["sample1", "sample2", "sample3"] (only for generate-samples action, else null),
  "message": "Brief explanation in Bahasa Indonesia of what was changed/generated"
}`

  const userContent = `[CURRENT SUMMARY]\n${currentSummary || '(empty)'}\n\n[CV CONTEXT]\n${JSON.stringify({ personalInfo: cleanedCvData.personalInfo, workExperience: cleanedCvData.workExperience?.slice(0, 3), education: cleanedCvData.education?.slice(0, 2), skills: cleanedCvData.skills }, null, 2)}`

  const payload = {
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.6,
    max_tokens: 1024,
  }

  const response = await fetchWithFallback(payload)
  const json = await response.json()
  const raw = cleanJSON(json.choices?.[0]?.message?.content || '')
  try {
    const parsed = JSON.parse(raw)
    // Robust key matching for varying model outputs
    const result = parsed.result ?? parsed.summary ?? parsed.text ?? parsed.improvedSummary ?? parsed.compact_summary ?? null
    return {
      result,
      samples: parsed.samples ?? null,
      message: parsed.message ?? '',
    }
  } catch {
    console.error('[groqClient:callSummaryAction] Failed to parse:', raw)
    return { result: null, samples: null, message: 'Gagal memproses permintaan AI.' }
  }
}

/**
 * Calls Groq/Nvidia API to analyze GitHub repository metadata and README to produce a CV Project entry.
 * @param {Object} repoMetadata - GitHub API repository metadata object
 * @param {string} readmeText - Markdown README content (truncated)
 * @returns {Promise<{title: string, url: string, startDate: string, endDate: string, description: string, bullets: string[]}>}
 */
export async function callGithubProjectAnalysis(repoMetadata, readmeText) {
  const systemPrompt = `You are an expert resume writer specialized in technical portfolios and Harvard Career Services Resume Guide.
Analyze the provided GitHub repository metadata and README file to generate a professional CV Project entry.

Rules for generated content:
- Title: Project Title (must be clean, professional, title-cased)
- URL: The GitHub repository URL (from metadata)
- Dates: Estimate Start Date and End Date based on the creation and last push dates. Format as "Month Year" (e.g. "Jan 2024", "Feb 2024"). If the dates are very close (less than 1 month), use the same month/year or a 1-month range.
- Description: A concise 1-sentence description in English summarizing the project's purpose.
- Bullets: Exactly 3 professional bullet points in English.
  - Must start with strong Harvard active verbs (e.g. "Developed", "Architected", "Optimized", "Integrated", "Engineered").
  - Do NOT use personal pronouns (I, We, My).
  - Quantify impact or describe technical complexity/architecture (e.g. state management, API integration, performance, deployment).

Respond ONLY with valid JSON in this exact format:
{
  "title": "Clean Project Title",
  "url": "https://github.com/...",
  "startDate": "Month Year",
  "endDate": "Month Year",
  "description": "1-sentence description",
  "bullets": [
    "Bullet point 1",
    "Bullet point 2",
    "Bullet point 3"
  ]
}`

  const userContent = `[REPOSITORY METADATA]
Name: ${repoMetadata.name}
Description: ${repoMetadata.description || 'No description provided'}
Primary Language: ${repoMetadata.language || 'N/A'}
Topics: ${repoMetadata.topics?.join(', ') || 'None'}
Created At: ${repoMetadata.created_at}
Pushed At: ${repoMetadata.pushed_at}
Stars: ${repoMetadata.stargazers_count}
Forks: ${repoMetadata.forks_count}
URL: ${repoMetadata.html_url}

[README CONTENT]
${readmeText || 'No README file available.'}`

  const payload = {
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 1024,
  }

  const response = await fetchWithFallback(payload)
  const json = await response.json()
  const raw = cleanJSON(json.choices?.[0]?.message?.content || '')
  try {
    const parsed = JSON.parse(raw)
    return {
      title: parsed.title || repoMetadata.name,
      url: parsed.url || repoMetadata.html_url,
      startDate: parsed.startDate || '',
      endDate: parsed.endDate || '',
      description: parsed.description || '',
      bullets: parsed.bullets || [],
    }
  } catch {
    console.error('[groqClient:callGithubProjectAnalysis] Failed to parse:', raw)
    throw new Error('Gagal memproses analisis repositori GitHub.')
  }
}

/**
 * Maps a foreign JSON CV format into the strict CV Maker schema.
 * @param {string} rawJsonString 
 * @returns {Promise<Object>}
 */
export async function callCVImportMapper(rawInputString) {
  const systemPrompt = `You are an expert data migration assistant. Your job is to map an unknown CV/Resume format into our strict target CV schema.
The input might be a raw JSON string from a foreign CV maker application, OR it might be unstructured raw text extracted from a PDF CV file.
Map the fields intelligently. For example, "Work Experiences" -> "workExperience", "Education Level" -> "education", "Skills, Achievements & Other Experience" -> "skills", etc.
If the input data is in Bahasa Indonesia or any other language, keep the content in that language, just map the keys/sections properly.
If the input is raw unstructured text from a PDF, do your best to extract all relevant information (personal info, work history, education, skills, projects) and structure it according to the TARGET SCHEMA. If a section is missing, just omit it or leave it as an empty array/object.

### TARGET SCHEMA:
{
  "personalInfo": {
    "name": "string",
    "location": "string",
    "email": "string",
    "phone": "string",
    "linkedin": "string",
    "github": "string",
    "portfolio": "string",
    "summary": "string"
  },
  "workExperience": [
    { "id": "we_timestamp", "jobTitle": "string", "company": "string", "location": "string", "startDate": "string", "endDate": "string", "bullets": ["string"] }
  ],
  "education": [
    { "id": "edu_timestamp", "degree": "string", "institution": "string", "location": "string", "startDate": "string", "endDate": "string", "gpa": "string", "bullets": ["string"] }
  ],
  "skills": [
    { "id": "skill_timestamp", "category": "string (e.g. Technology Skills)", "items": "string (e.g. React, Python)" }
  ],
  "projects": [
    { "id": "proj_timestamp", "title": "string", "url": "string", "startDate": "string", "endDate": "string", "description": "string", "bullets": ["string"] }
  ],
  "languages": [
    { "id": "lang_timestamp", "name": "string", "proficiency": "string" }
  ],
  "certifications": [
    { "id": "cert_timestamp", "name": "string", "issuer": "string", "date": "string", "url": "string" }
  ],
  "awards": [
    { "id": "awd_timestamp", "title": "string", "issuer": "string", "date": "string", "description": "string" }
  ],
  "publications": [
    { "id": "pub_timestamp", "title": "string", "publisher": "string", "date": "string", "url": "string" }
  ],
  "organizationalExperience": [
    { "id": "org_timestamp", "role": "string", "organization": "string", "location": "string", "startDate": "string", "endDate": "string", "bullets": ["string"] }
  ]
}

Ensure all IDs are generated uniquely (e.g. appending a random number or timestamp).
IMPORTANT: Return ONLY valid JSON matching the exact target schema. DO NOT wrap the output in any markdown block or include conversational text.`

  const payload = {
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: rawInputString },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1, // Keep it deterministic
    max_tokens: 4000,
  }

  const response = await fetchWithFallback(payload)
  const json = await response.json()
  const raw = cleanJSON(json.choices?.[0]?.message?.content || '')
  try {
    return JSON.parse(raw)
  } catch (err) {
    console.error('[groqClient:callCVImportMapper] Failed to parse mapping:', raw)
    throw new Error('Gagal memetakan JSON CV asing.')
  }
}


