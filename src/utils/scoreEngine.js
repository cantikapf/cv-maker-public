/**
 * scoreEngine.js
 * Resume scoring engine — NodeFlair 3-dimension system × Harvard Resume Guidelines
 * Source: https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/
 *
 * Formula: Total = (Structure × 35%) + (Impact × 40%) + (Keywords × 25%)
 */

// ─── Harvard Action Verbs List ────────────────────────────────────────────────
export const ACTION_VERBS = [
  // Leadership
  'led','managed','directed','supervised','coordinated','spearheaded','oversaw','chaired',
  'guided','headed','mentored','mobilized','motivated','orchestrated','pioneered',
  // Analysis
  'analyzed','assessed','evaluated','researched','identified','investigated','examined',
  'audited','benchmarked','calculated','diagnosed','forecasted','mapped','measured','tracked',
  // Communication
  'presented','negotiated','authored','collaborated','facilitated','communicated','advised',
  'advocated','briefed','consulted','corresponded','documented','drafted','edited','liaised',
  // Achievement
  'achieved','delivered','improved','increased','reduced','generated','exceeded','secured',
  'accelerated','accomplished','attained','boosted','completed','demonstrated','doubled',
  'enhanced','exceeded','expanded','maximized','optimized','outperformed','strengthened',
  // Creation
  'developed','designed','created','implemented','launched','built','established','produced',
  'architected','authored','constructed','deployed','engineered','formulated','initiated',
  'innovated','introduced','invented','launched','pioneered','programmed','revamped',
  // Support
  'assisted','supported','contributed','organized','prepared','maintained','administered',
  'allocated','arranged','compiled','completed','coordinated','executed','facilitated',
  'processed','provided','reviewed','scheduled','streamlined','updated',
]

// ─── Passive Phrases to Avoid (Harvard: active not passive) ──────────────────
export const PASSIVE_PHRASES = [
  'was responsible for',
  'responsible for',
  'helped with',
  'worked on',
  'was involved in',
  'duties included',
  'assisted with',
  'participated in',
  'was part of',
  'my role was',
  'i was',
  'we were',
]

// ─── Utility Helpers ──────────────────────────────────────────────────────────
export function countWords(text = '') {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function hasNumbers(text = '') {
  return /\d/.test(text)
}

export function hasPercentOrMetric(text = '') {
  return /\d+\s*(%|percent|x|×|million|billion|k\b|thousand|users|customers|revenue|usd|idr|sales)/i.test(text)
}

export function hasPersonalPronoun(text = '') {
  return /\b(i|we|my|our|me|us|myself)\b/i.test(text)
}

export function startsWithActionVerb(bullet = '') {
  const firstWord = bullet.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '') || ''
  return ACTION_VERBS.includes(firstWord)
}

export function hasPassivePhrase(text = '') {
  const lower = text.toLowerCase()
  return PASSIVE_PHRASES.some((phrase) => lower.includes(phrase))
}

function countSkillItems(skills = {}) {
  const tech = (skills.technology || '').split(/[,\n]/).filter((s) => s.trim()).length
  const biz = (skills.businessProfessional || '').split(/[,\n]/).filter((s) => s.trim()).length
  return tech + biz
}

// ─── Feedback item factory ────────────────────────────────────────────────────
function feedback(id, dimension, category, title, description, points, action, section, entryIndex = null) {
  return { id, dimension, category, title, description, points, action, section, entryIndex }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1️⃣  RESUME STRUCTURE (35%) — Format & Completeness
// ─────────────────────────────────────────────────────────────────────────────
export function scoreStructure(cvData) {
  const { personalInfo = {}, workExperience = [], education = [] } = cvData
  const feedbackItems = []
  let earned = 0
  const max = 100

  // Email (20pts) — Harvard Mistake #2
  if (personalInfo.email?.trim()) {
    earned += 20
  } else {
    feedbackItems.push(feedback(
      'no-email', 'structure', 'important',
      'Email address is missing.',
      'Add your email address to contact info. (Harvard: missing contact info is Mistake #2)',
      '+20pts', 'add', 'personal'
    ))
  }

  // Phone (15pts) — Harvard Mistake #2
  if (personalInfo.phone?.trim()) {
    earned += 15
  } else {
    feedbackItems.push(feedback(
      'no-phone', 'structure', 'important',
      'Phone number is missing.',
      'Add your phone number so recruiters can contact you.',
      '+15pts', 'add', 'personal'
    ))
  }

  // Work Experience with date (20pts) — Harvard: reverse chronological
  const jobsWithDate = workExperience.filter((j) => j.startDate?.trim())
  if (jobsWithDate.length > 0) {
    earned += 20
  } else {
    feedbackItems.push(feedback(
      'no-work-experience', 'structure', 'important',
      'Work Experience section is empty or missing dates.',
      'Add at least one work experience with dates. (Harvard: list in reverse chronological order)',
      '+20pts', 'add', 'workExperience'
    ))
  }

  // Education (15pts) — Harvard: completeness
  if (education.length > 0 && education[0].degree?.trim()) {
    earned += 15
  } else {
    feedbackItems.push(feedback(
      'no-education', 'structure', 'important',
      'Education section is empty.',
      'Add your educational background.',
      '+15pts', 'add', 'education'
    ))
  }

  // Work experience has at least 1 bullet per job (15pts) — Harvard Mistake #4
  const jobsWithBullets = workExperience.filter((j) => j.bullets?.some((b) => b.trim()))
  if (workExperience.length > 0 && jobsWithBullets.length === workExperience.length) {
    earned += 15
  } else if (workExperience.length > 0) {
    const missing = workExperience.filter((j) => !j.bullets?.some((b) => b.trim()))
    missing.forEach((job, i) => {
      feedbackItems.push(feedback(
        `no-bullets-job-${i}`, 'structure', 'important',
        `${job.jobTitle || 'Work Experience'} at ${job.company || ''} has no bullet points.`,
        'Add bullet points to describe your responsibilities and achievements.',
        '+15pts', 'edit', 'workExperience', workExperience.indexOf(job)
      ))
    })
  }

  // Summary exists (5pts) — Harvard: easy to read
  if (personalInfo.summary?.trim()) {
    earned += 5
  } else {
    feedbackItems.push(feedback(
      'no-summary', 'structure', 'recommended',
      'Professional summary is missing.',
      'Add a concise summary (20–50 words) at the top of your resume.',
      '+5pts', 'add', 'personal'
    ))
  }

  // Skills section (5pts) — Harvard: written for scanners
  const { skills = {} } = cvData
  if (skills.technology?.trim() || skills.businessProfessional?.trim()) {
    earned += 5
  } else {
    feedbackItems.push(feedback(
      'no-skills', 'structure', 'recommended',
      'Skills section is empty.',
      'Add your technical and professional skills. Recruiters scan this section first.',
      '+5pts', 'add', 'skills'
    ))
  }

  // All jobs have complete dates (3pts) — Harvard: no gaps
  const allHaveDates = workExperience.every((j) => j.startDate?.trim() && (j.endDate?.trim() || j.isCurrent))
  if (workExperience.length > 0 && allHaveDates) {
    earned += 3
  } else if (workExperience.length > 0) {
    feedbackItems.push(feedback(
      'incomplete-dates', 'structure', 'recommended',
      'Some work experiences are missing dates.',
      'Fill in start and end dates for all positions. (Harvard: avoid information gaps)',
      '+3pts', 'edit', 'workExperience'
    ))
  }

  // No empty entries without bullets (2pts) — niceTohave
  const totalBullets = workExperience.reduce((acc, j) => acc + (j.bullets?.filter((b) => b.trim()).length || 0), 0)
  if (workExperience.length > 0 && totalBullets >= workExperience.length * 2) {
    earned += 2
  } else if (workExperience.length > 0) {
    feedbackItems.push(feedback(
      'few-bullets', 'structure', 'niceTohave',
      'Some work experiences have very few bullet points.',
      'Aim for 2–4 bullet points per position to fully describe your role.',
      '+2pts', 'edit', 'workExperience'
    ))
  }

  return {
    score: Math.round(Math.min((earned / max) * 100, 100)),
    feedbackItems,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2️⃣  RESUME IMPACT (40%) — Content Quality
// ─────────────────────────────────────────────────────────────────────────────
export function scoreImpact(cvData) {
  const { personalInfo = {}, workExperience = [] } = cvData
  const feedbackItems = []
  let earned = 0
  const max = 100

  // Action verbs in work experience bullets (25pts) — Harvard Mistake #3
  if (workExperience.length > 0) {
    const jobsWithActionVerbs = workExperience.filter((job) =>
      job.bullets?.some((b) => startsWithActionVerb(b))
    )
    const ratio = jobsWithActionVerbs.length / workExperience.length
    earned += Math.round(ratio * 25)

    const missingVerbs = workExperience.filter((job) =>
      job.bullets?.length > 0 && !job.bullets.some((b) => startsWithActionVerb(b))
    )
    missingVerbs.forEach((job) => {
      feedbackItems.push(feedback(
        `no-action-verbs-${job.id}`, 'impact', 'important',
        `Action words is missing in ${job.company || 'Work Experience'}.`,
        `Add action verbs to showcase your impact. (Harvard: avoid passive language, use words like Led, Managed, Developed...)`,
        '+5pts', 'edit', 'workExperience', workExperience.indexOf(job)
      ))
    })
  }

  // Quantified results in bullets (20pts) — Harvard Mistake #5
  const allBullets = workExperience.flatMap((j) => j.bullets || [])
  const quantifiedBullets = allBullets.filter((b) => hasNumbers(b))
  if (allBullets.length > 0 && quantifiedBullets.length >= Math.ceil(allBullets.length * 0.3)) {
    earned += 20
  } else if (allBullets.length > 0 && quantifiedBullets.length > 0) {
    earned += 10
    feedbackItems.push(feedback(
      'few-quantified', 'impact', 'important',
      'Add more quantified achievements to your bullet points.',
      'Include numbers, percentages, or metrics to demonstrate impact. (Harvard: not demonstrating results is Mistake #5)',
      '+10pts', 'edit', 'workExperience'
    ))
  } else if (allBullets.length > 0) {
    feedbackItems.push(feedback(
      'no-quantified', 'impact', 'important',
      'No quantified achievements found in Work Experience.',
      'Add numbers/percentages to show impact. e.g. "Increased sales by 20%" instead of "Increased sales". (Harvard Mistake #5)',
      '+20pts', 'edit', 'workExperience'
    ))
  }

  // No personal pronouns in summary (15pts) — Harvard DON'T
  const summary = personalInfo.summary || ''
  if (!hasPersonalPronoun(summary)) {
    earned += 15
  } else {
    feedbackItems.push(feedback(
      'personal-pronoun', 'impact', 'important',
      'Summary uses personal pronouns (I, We, My).',
      'Remove personal pronouns — write in third-person implied. (Harvard DON\'T: use personal pronouns)',
      '+15pts', 'edit', 'personal'
    ))
  }

  // Summary length 20–50 words (15pts) — NodeFlair best practice
  if (summary.trim()) {
    const wordCount = countWords(summary)
    if (wordCount >= 20 && wordCount <= 50) {
      earned += 15
    } else if (wordCount > 50) {
      feedbackItems.push(feedback(
        'summary-too-long', 'impact', 'recommended',
        `Summary is too long. Shorten it to be between 20 to 50 words. Right now you use ${wordCount} words.`,
        'Recruiters scan resumes quickly — keep your summary concise and impactful.',
        '+15pts', 'edit', 'personal'
      ))
    } else {
      feedbackItems.push(feedback(
        'summary-too-short', 'impact', 'recommended',
        `Summary is too short (${wordCount} words). Aim for 20–50 words.`,
        'Expand your summary to better showcase your professional profile.',
        '+15pts', 'edit', 'personal'
      ))
    }
  }

  // Bullets not too long (≤30 words per bullet) (10pts) — Harvard: scan quickly
  const longBullets = allBullets.filter((b) => countWords(b) > 30)
  if (longBullets.length === 0 && allBullets.length > 0) {
    earned += 10
  } else if (longBullets.length > 0) {
    feedbackItems.push(feedback(
      'long-bullets', 'impact', 'recommended',
      `${longBullets.length} bullet point(s) are too long (over 30 words).`,
      'Keep bullets concise. Recruiters scan resumes — shorter bullets are easier to read. (Harvard: written for people who scan quickly)',
      '+10pts', 'edit', 'workExperience'
    ))
  }

  // No passive phrases (15pts) — Harvard: active language
  const bulletsWithPassive = allBullets.filter((b) => hasPassivePhrase(b))
  if (bulletsWithPassive.length === 0 && allBullets.length > 0) {
    earned += 15
  } else if (bulletsWithPassive.length > 0) {
    feedbackItems.push(feedback(
      'passive-phrases', 'impact', 'recommended',
      `${bulletsWithPassive.length} bullet point(s) use passive language.`,
      'Replace phrases like "was responsible for" or "helped with" with strong action verbs. (Harvard: active rather than passive)',
      '+15pts', 'edit', 'workExperience'
    ))
  }

  // At least 2 quantified achievements overall (5pts) — niceTohave
  const quantifiedAchievements = allBullets.filter((b) => hasPercentOrMetric(b))
  if (quantifiedAchievements.length >= 2) {
    earned += 5
  } else {
    feedbackItems.push(feedback(
      'few-metrics', 'impact', 'niceTohave',
      'Add more specific metrics (%, $, numbers) to bullet points.',
      'Strong resumes quantify impact. e.g. "Managed budget of $50K", "Grew team by 3x"',
      '+5pts', 'edit', 'workExperience'
    ))
  }

  return {
    score: Math.round(Math.min((earned / max) * 100, 100)),
    feedbackItems,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3️⃣  KEYWORD USAGE (25%) — ATS Optimization
// ─────────────────────────────────────────────────────────────────────────────
export function scoreKeywords(cvData, jobDescription = '') {
  const { personalInfo = {}, skills = {}, certifications = [], awards = [], publications = [], projects = [] } = cvData
  const feedbackItems = []
  let earned = 0
  const max = 100

  const skillCount = countSkillItems(skills)
  const hasJobDesc = jobDescription.trim().length > 50

  if (hasJobDesc) {
    // ── Mode B: Job Description provided ──────────────────────────────────────
    const jobWords = jobDescription.toLowerCase().match(/\b[a-z]{3,}\b/g) || []
    const stopWords = new Set(['and','the','for','are','with','that','this','you','your','our','have','will','from','they','their','been','also','more','into','over','such'])
    const jobKeywords = [...new Set(jobWords.filter((w) => !stopWords.has(w)))]

    const cvText = [
      personalInfo.summary || '',
      skills.technology || '',
      skills.businessProfessional || '',
      ...(cvData.workExperience || []).flatMap((j) => [...(j.bullets || []), j.jobTitle || '']),
      ...(cvData.education || []).map((e) => e.degree || ''),
    ].join(' ').toLowerCase()

    const matched = jobKeywords.filter((kw) => cvText.includes(kw))
    const matchRatio = jobKeywords.length > 0 ? matched.length / jobKeywords.length : 0
    earned = Math.round(Math.min(matchRatio * 100, 100))

    if (matchRatio < 0.5) {
      feedbackItems.push(feedback(
        'low-keyword-match', 'keywords', 'important',
        `Only ${Math.round(matchRatio * 100)}% of job description keywords found in your CV.`,
        'Add more relevant keywords from the job description to your summary and skills.',
        '+pts', 'edit', 'personal'
      ))
    } else if (matchRatio < 0.75) {
      feedbackItems.push(feedback(
        'medium-keyword-match', 'keywords', 'recommended',
        `${Math.round(matchRatio * 100)}% keyword match with job description. Add more to improve ATS score.`,
        'Consider adding missing keywords to your Skills or Summary section.',
        '+pts', 'edit', 'skills'
      ))
    }
  } else {
    // ── Mode A: No job description — profile completeness ─────────────────────
    // Skills ≥ 5 items (25pts) — Harvard: specific skills
    if (skillCount >= 5) {
      earned += 25
    } else {
      feedbackItems.push(feedback(
        'few-skills', 'keywords', 'important',
        `Skills section has only ${skillCount} item(s). Add at least 5.`,
        'List your technical and professional skills. Recruiters and ATS scan this section.',
        '+25pts', 'edit', 'skills'
      ))
    }

    // LinkedIn URL (20pts)
    if (personalInfo.linkedin?.trim()) {
      earned += 20
    } else {
      feedbackItems.push(feedback(
        'no-linkedin', 'keywords', 'recommended',
        'LinkedIn URL is missing.',
        'Add your LinkedIn profile URL to increase credibility with recruiters.',
        '+20pts', 'add', 'personal'
      ))
    }

    // Portfolio / GitHub (15pts)
    if (personalInfo.github?.trim() || personalInfo.portfolio?.trim()) {
      earned += 15
    } else {
      feedbackItems.push(feedback(
        'no-portfolio', 'keywords', 'recommended',
        'No portfolio or GitHub link found.',
        'Add a portfolio or GitHub link to showcase your work and stand out.',
        '+15pts', 'add', 'personal'
      ))
    }

    // Projects section (15pts)
    if (projects.length > 0 && projects.some((p) => p.description?.trim() || p.bullets?.length > 0)) {
      earned += 15
    } else {
      feedbackItems.push(feedback(
        'no-projects', 'keywords', 'niceTohave',
        'Projects section is empty.',
        'Add personal or academic projects to demonstrate your skills.',
        '+15pts', 'add', 'projects'
      ))
    }

    // Certifications or Awards (15pts)
    if (certifications.length > 0 || awards.length > 0) {
      earned += 15
    } else {
      feedbackItems.push(feedback(
        'no-certs-awards', 'keywords', 'niceTohave',
        'No certifications or awards listed.',
        'Add certifications, awards, or achievements to strengthen your profile.',
        '+15pts', 'add', 'certifications'
      ))
    }

    // Publications (10pts)
    if (publications.length > 0) {
      earned += 10
    } else {
      feedbackItems.push(feedback(
        'no-publications', 'keywords', 'niceTohave',
        'No publications listed.',
        'If you have published work or research, include it to stand out.',
        '+10pts', 'add', 'publications'
      ))
    }
  }

  return {
    score: Math.round(Math.min((earned / max) * 100, 100)),
    feedbackItems,
    hasJobDesc,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN: scoreCV — weighted total + merged feedback
// ─────────────────────────────────────────────────────────────────────────────
export function scoreCV(cvData, jobDescription = '') {
  const structureResult = scoreStructure(cvData)
  const impactResult = scoreImpact(cvData)
  const keywordsResult = scoreKeywords(cvData, jobDescription)

  const total = Math.round(
    structureResult.score * 0.35 +
    impactResult.score * 0.40 +
    keywordsResult.score * 0.25
  )

  const allFeedback = [
    ...structureResult.feedbackItems,
    ...impactResult.feedbackItems,
    ...keywordsResult.feedbackItems,
  ]

  return {
    total,
    structure: structureResult.score,
    impact: impactResult.score,
    keywords: keywordsResult.score,
    hasJobDesc: keywordsResult.hasJobDesc,
    important: allFeedback.filter((f) => f.category === 'important'),
    recommended: allFeedback.filter((f) => f.category === 'recommended'),
    niceTohave: allFeedback.filter((f) => f.category === 'niceTohave'),
  }
}
