import { callCVImportMapper } from './groqClient'

/**
 * Checks if the imported JSON already matches the strict CV Maker schema.
 * @param {Object} parsedJson 
 * @returns {boolean}
 */
export function isDefaultSchema(parsedJson) {
  // A simple heuristic: check for some standard keys
  if (!parsedJson) return false
  const keys = Object.keys(parsedJson)
  const hasPersonalInfo = keys.includes('personalInfo')
  const hasWorkExperience = keys.includes('workExperience')
  const hasSkills = keys.includes('skills')
  return hasPersonalInfo || hasWorkExperience || hasSkills
}

/**
 * Processes an imported JSON string.
 * If it's a known schema, parses and returns it.
 * If it's foreign, calls the AI to map it.
 * @param {string} rawJsonString 
 * @returns {Promise<Object>}
 */
export async function processImportedJSON(rawJsonString) {
  try {
    const parsed = JSON.parse(rawJsonString)
    if (isDefaultSchema(parsed)) {
      return parsed
    }
  } catch (err) {
    throw new Error('File JSON tidak valid.')
  }

  // If it didn't match the default schema, we need to map it via AI
  try {
    console.log('Detected foreign JSON schema. Triggering AI Import Mapper...')
    const mapped = await callCVImportMapper(rawJsonString)
    return mapped
  } catch (err) {
    throw new Error('Gagal memetakan struktur file menggunakan AI: ' + err.message)
  }
}
