import React from 'react'
import { Document, Page, Text, View, StyleSheet, Link, Image, Font, Svg, Path } from '@react-pdf/renderer'



// Define styles in points (1 inch = 72 points)
// 12mm top/bottom margin ≈ 34pt
// 14mm left/right margin ≈ 40pt

const ExternalLinkIcon = () => (
  <Svg viewBox="0 0 24 24" style={{ width: 10, height: 10, marginLeft: 3, marginTop: 1 }}>
    <Path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="#000000" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Path d="M15 3h6v6" stroke="#000000" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Path d="M10 14L21 3" stroke="#000000" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingBottom: 34,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    fontSize: 9,
    lineHeight: 1.4,
    color: '#000000',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 10,
    borderBottomWidth: 0,
    paddingBottom: 8,
  },
  headerPhoto: {
    width: 93, // 33mm ≈ 93.5pt
    height: 124, // 44mm ≈ 124.7pt
    marginRight: 23, // 8mm ≈ 22.6pt
    objectFit: 'cover',
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  headerInfo: {
    // Dynamically applied in render
  },
  headerName: {
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 4,
    color: '#000000',
    textAlign: 'center',
  },
  headerContactsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 2,
    minHeight: 12, // Prevent WASM Yoga zero-height collapse
    width: '100%',
  },
  headerContactsText: {
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    color: '#333333',
  },
  headerLink: {
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    color: '#000000',
    textDecoration: 'none',
  },
  headerSummary: {
    fontSize: 9,
    color: '#111111',
    textAlign: 'justify',
    marginTop: 6,
    lineHeight: 1.4,
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    fontSize: 10,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 2,
    marginBottom: 6,
  },
  entry: {
    marginBottom: 6,
  },
  entryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  entryTitle: {
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    fontSize: 9,
  },
  entryDate: {
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    fontSize: 9,
  },
  entrySub: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  entryCompany: {
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    color: '#333333',
  },
  entryLocation: {
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    color: '#555555',
  },
  entryExtra: {
    fontSize: 8.5,
    color: '#333333',
    marginBottom: 2,
  },
  entryDesc: {
    fontSize: 8.5,
    color: '#333333',
    marginBottom: 2,
    textAlign: 'justify',
  },
  bulletList: {
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 8,
  },
  bulletDot: {
    width: 8,
    fontSize: 8.5,
  },
  bulletText: {
    flex: 1,
    fontSize: 8.5,
    lineHeight: 1.35,
    color: '#111111',
  },
  skillsRow: {
    fontSize: 8.5,
    marginBottom: 3,
  },
  languages: {
    fontSize: 8.5,
  },
  pdfLink: {
    color: '#000000',
    textDecoration: 'none',
  },
})

// Regex to detect **bold** and [label](url)
const INLINE_REGEX = /(\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\))/g

function parseMarkdownPDF(text) {
  if (!text || typeof text !== 'string') {
    return text || ''
  }

  const nodes = []
  let lastIndex = 0
  let match

  INLINE_REGEX.lastIndex = 0

  while ((match = INLINE_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<Text key={`text-${lastIndex}`}>{text.slice(lastIndex, match.index)}</Text>)
    }

    if (match[2] !== undefined) {
      // **bold**
      nodes.push(
        <Text key={match.index} style={{ fontFamily: 'Helvetica', fontWeight: 'bold' }}>
          {match[2]}
        </Text>
      )
    } else if (match[3] !== undefined && match[4] !== undefined) {
      // [text](url)
      const href = match[4].trim()
      const label = match[3]
      const fullHref = href.startsWith('http') ? href : `https://${href}`
      nodes.push(
        <View key={match.index} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Link src={fullHref} style={styles.pdfLink}>
            <Text>{label}</Text>
          </Link>
          <ExternalLinkIcon />
        </View>
      )
    }

    lastIndex = INLINE_REGEX.lastIndex
  }

  if (lastIndex < text.length) {
    nodes.push(<Text key={`text-end-${lastIndex}`}>{text.slice(lastIndex)}</Text>)
  }

  return nodes.length > 0 ? nodes : text
}

const ensureHttp = (url) =>
  url && !url.startsWith('http') ? `https://${url}` : url

// PDF Document Component
export default function CVDocumentPDF({ cvData }) {
  const {
    personalInfo = {},
    workExperience = [],
    education = [],
    organizationalExperience = [],
    skills = {},
    languages = [],
    certifications = [],
    awards = [],
    publications = [],
    projects = [],
  } = cvData

  const { name, location, email, phone, linkedin, github, portfolio, photo, summary } = personalInfo

  // Header Contacts Setup
  const row1 = [location, email, phone].filter(Boolean)
  const row1Links = []
  if (linkedin) row1Links.push({ label: linkedin, href: linkedin })

  const row2Links = []
  if (github) row2Links.push({ label: github, href: github })
  if (portfolio) row2Links.push({ label: portfolio, href: portfolio })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── HEADER ── */}
        <View style={styles.header}>
          {photo ? (
            <Image
              src={photo}
              style={styles.headerPhoto}
            />
          ) : null}

          <View style={[
            styles.headerInfo,
            photo ? { width: '78%', flex: 'none', marginTop: 15 } : { flex: 1, marginTop: 15 }
          ]}>
            <Text style={styles.headerName}>{name || 'Your Name'}</Text>
            
            {/* Contacts Row 1 */}
            {(row1.length > 0 || row1Links.length > 0) && (
              <View style={styles.headerContactsRow}>
                <Text style={styles.headerContactsText}>{row1.join(' • ')}</Text>
                {row1.length > 0 && row1Links.length > 0 && <Text style={styles.headerContactsText}> • </Text>}
                {row1Links.map((link, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {i > 0 && <Text style={styles.headerContactsText}> • </Text>}
                    <Link src={ensureHttp(link.href)} style={styles.headerLink}><Text>{link.label}</Text></Link><ExternalLinkIcon />
                  </View>
                ))}
              </View>
            )}

            {/* Contacts Row 2 */}
            {row2Links.length > 0 && (
              <View style={styles.headerContactsRow}>
                {row2Links.map((link, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {i > 0 && <Text style={styles.headerContactsText}> • </Text>}
                    <Link src={ensureHttp(link.href)} style={styles.headerLink}><Text>{link.label}</Text></Link><ExternalLinkIcon />
                  </View>
                ))}
              </View>
            )}

            {summary ? <Text style={styles.headerSummary}>{summary}</Text> : null}
          </View>
        </View>

        {/* ── WORK EXPERIENCE ── */}
        {workExperience?.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {workExperience.map((job) => (
              <View key={job.id} style={styles.entry} wrap={false}>
                <View style={styles.entryTop}>
                  <View style={{...styles.entryTitle, flexDirection: 'row', flexWrap: 'wrap'}}>{parseMarkdownPDF(job.jobTitle)}</View>
                  <Text style={styles.entryDate}>
                    {[job.startDate, job.endDate].filter(Boolean).join(' - ')}
                  </Text>
                </View>
                {(job.company || job.location) ? (
                  <View style={styles.entrySub}>
                    <Text style={styles.entryCompany}>{job.company}</Text>
                    <Text style={styles.entryLocation}>{job.location}</Text>
                  </View>
                ) : null}
                {job.bullets?.length > 0 && (
                  <View style={styles.bulletList}>
                    {job.bullets.map((b, i) => (
                      <View key={i} style={styles.bulletRow} wrap={false}>
                        <Text style={styles.bulletDot}>•</Text>
                        <View style={styles.bulletText}>{parseMarkdownPDF(b)}</View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ── EDUCATION ── */}
        {education?.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu) => (
              <View key={edu.id} style={styles.entry} wrap={false}>
                <View style={styles.entryTop}>
                  <View style={{...styles.entryTitle, flexDirection: 'row', flexWrap: 'wrap'}}>{parseMarkdownPDF(edu.degree)}</View>
                  <Text style={styles.entryDate}>
                    {[edu.startDate, edu.endDate].filter(Boolean).join(' - ')}
                  </Text>
                </View>
                {(edu.institution || edu.location) ? (
                  <View style={styles.entrySub}>
                    <Text style={styles.entryCompany}>{edu.institution}</Text>
                    <Text style={styles.entryLocation}>{edu.location}</Text>
                  </View>
                ) : null}
                {edu.gpa ? (
                  <View style={styles.entryExtra}>{parseMarkdownPDF(edu.gpa)}</View>
                ) : null}
                {edu.bullets?.length > 0 && (
                  <View style={styles.bulletList}>
                    {edu.bullets.map((b, i) => (
                      <View key={i} style={styles.bulletRow} wrap={false}>
                        <Text style={styles.bulletDot}>•</Text>
                        <View style={styles.bulletText}>{parseMarkdownPDF(b)}</View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ── ORGANIZATIONAL EXPERIENCE ── */}
        {organizationalExperience?.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Organizational & Volunteer Experience</Text>
            {organizationalExperience.map((org) => (
              <View key={org.id} style={styles.entry} wrap={false}>
                <View style={styles.entryTop}>
                  <View style={{...styles.entryTitle, flexDirection: 'row', flexWrap: 'wrap'}}>{parseMarkdownPDF(org.role)}</View>
                  <Text style={styles.entryDate}>
                    {[org.startDate, org.endDate].filter(Boolean).join(' - ')}
                  </Text>
                </View>
                {(org.organization || org.location) ? (
                  <View style={styles.entrySub}>
                    <Text style={styles.entryCompany}>{org.organization}</Text>
                    <Text style={styles.entryLocation}>{org.location}</Text>
                  </View>
                ) : null}
                {org.description ? (
                  <View style={styles.entryDesc}>{parseMarkdownPDF(org.description)}</View>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* ── SKILLS ── */}
        {(skills?.technology || skills?.businessProfessional) ? (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {skills.technology ? (
              <Text style={styles.skillsRow}>
                <Text style={{ fontFamily: 'Helvetica', fontWeight: 'bold' }}>Technology: </Text>
                {skills.technology}
              </Text>
            ) : null}
            {skills.businessProfessional ? (
              <Text style={styles.skillsRow}>
                <Text style={{ fontFamily: 'Helvetica', fontWeight: 'bold' }}>Business & Professional Skills: </Text>
                {skills.businessProfessional}
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* ── LANGUAGES ── */}
        {languages?.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <Text style={styles.languages}>
              {languages.map((l, i) => (
                <Text key={l.id}>
                  <Text style={{ fontFamily: 'Helvetica', fontWeight: 'bold' }}>{l.name}</Text>
                  {l.proficiency && ` (${l.proficiency})`}
                  {i < languages.length - 1 && ' • '}
                </Text>
              ))}
            </Text>
          </View>
        )}

        {/* ── CERTIFICATIONS ── */}
        {certifications?.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {certifications.map((cert) => (
              <View key={cert.id} style={styles.entry} wrap={false}>
                <View style={styles.entryTop}>
                  <Text style={styles.entryTitle}>
                    {cert.name}
                    {cert.credentialId ? ` (Credential ID: ${cert.credentialId})` : ''} by {cert.issuer}
                  </Text>
                  <Text style={styles.entryDate}>{cert.date}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── AWARDS ── */}
        {awards?.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Awards</Text>
            {awards.map((award) => (
              <View key={award.id} style={styles.entry} wrap={false}>
                <View style={styles.entryTop}>
                  <Text style={styles.entryTitle}>{award.title} by {award.issuer}</Text>
                  <Text style={styles.entryDate}>{award.date}</Text>
                </View>
                {award.description ? (
                  <View style={styles.entryDesc}>{parseMarkdownPDF(award.description)}</View>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* ── PUBLICATIONS ── */}
        {publications?.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Publications</Text>
            {publications.map((pub) => (
              <View key={pub.id} style={styles.entry} wrap={false}>
                <View style={styles.entryTop}>
                  <View style={{...styles.entryTitle, flexDirection: 'row', flexWrap: 'wrap'}}>
                    {pub.url ? parseMarkdownPDF(`[${pub.title}](${pub.url})`) : <Text>{pub.title}</Text>}
                  </View>
                  <Text style={styles.entryDate}>{pub.date}</Text>
                </View>
                {pub.conference ? (
                  <View style={styles.entrySub}>
                    <Text style={styles.entryCompany}>{pub.conference}</Text>
                  </View>
                ) : null}
                {pub.description ? (
                  <View style={styles.entryDesc}>{parseMarkdownPDF(pub.description)}</View>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* ── PROJECTS ── */}
        {projects?.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((proj) => (
              <View key={proj.id} style={styles.entry} wrap={false}>
                <View style={styles.entryTop}>
                  <View style={{...styles.entryTitle, flexDirection: 'row', flexWrap: 'wrap'}}>
                    {proj.url ? parseMarkdownPDF(`[${proj.title}](${proj.url})`) : <Text>{proj.title}</Text>}
                  </View>
                  <Text style={styles.entryDate}>
                    {[proj.startDate, proj.endDate].filter(Boolean).join(' - ')}
                  </Text>
                </View>
                {proj.description ? (
                  <View style={styles.entryDesc}>{parseMarkdownPDF(proj.description)}</View>
                ) : null}
                {proj.bullets?.length > 0 && (
                  <View style={styles.bulletList}>
                    {proj.bullets.map((b, i) => (
                      <View key={i} style={styles.bulletRow} wrap={false}>
                        <Text style={styles.bulletDot}>•</Text>
                        <View style={styles.bulletText}>{parseMarkdownPDF(b)}</View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  )
}
