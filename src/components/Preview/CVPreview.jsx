import './print.css'
import CVHeader from './CVHeader'
import CVSection from './CVSection'
import { parseMarkdown } from '../../utils/parseMarkdown'

/* ── Row: title left, date right ─────────────────────── */
function EntryRow({ title, subtitle, location, startDate, endDate, extra }) {
  const dateStr = [startDate, endDate].filter(Boolean).join(' - ')
  return (
    <div className="cv-entry">
      <div className="cv-entry__top">
        <span className="cv-entry__title">{parseMarkdown(title)}</span>
        {dateStr && <span className="cv-entry__date">{dateStr}</span>}
      </div>
      {(subtitle || location) && (
        <div className="cv-entry__sub">
          {subtitle && <span className="cv-entry__company">{subtitle}</span>}
          {location && <span className="cv-entry__location">{location}</span>}
        </div>
      )}
      {extra && <p className="cv-entry__extra">{parseMarkdown(extra)}</p>}
    </div>
  )
}

/* ── Bullet list ──────────────────────────────────────── */
function BulletList({ bullets }) {
  if (!bullets?.length) return null
  return (
    <ul className="cv-bullets">
      {bullets.map((b, i) => (
        <li key={i}>{parseMarkdown(b)}</li>
      ))}
    </ul>
  )
}

/* ── Main CVPreview ───────────────────────────────────── */
export default function CVPreview({ cvData }) {
  const {
    personalInfo,
    workExperience,
    education,
    organizationalExperience,
    skills,
    languages,
    certifications,
    awards,
    publications,
    projects,
  } = cvData

  const sectionOrder = cvData.sectionConfig?.sectionOrder || [
    'workExperience',
    'education',
    'organizationalExperience',
    'skills',
    'languages',
    'certifications',
    'awards',
    'publications',
    'projects',
  ]
  const hiddenSections = cvData.sectionConfig?.hiddenSections || []

  // Ensure any custom sections not in sectionOrder are appended
  const allSectionsToRender = [...sectionOrder]
  if (cvData.customSections) {
    cvData.customSections.forEach(cs => {
      if (!allSectionsToRender.includes(cs.id)) {
        allSectionsToRender.push(cs.id)
      }
    })
  }

  const renderSection = (secId) => {
    if (hiddenSections.includes(secId)) return null

    if (secId === 'workExperience' && workExperience?.length > 0) {
      return (
        <CVSection key={secId} title="Work Experience">
          {workExperience.map((job) => (
            <div key={job.id}>
              <EntryRow
                title={job.jobTitle}
                subtitle={job.company}
                location={job.location}
                startDate={job.startDate}
                endDate={job.endDate}
              />
              <BulletList bullets={job.bullets} />
            </div>
          ))}
        </CVSection>
      )
    }

    if (secId === 'education' && education?.length > 0) {
      return (
        <CVSection key={secId} title="Education">
          {education.map((edu) => (
            <div key={edu.id}>
              <EntryRow
                title={edu.degree}
                subtitle={edu.institution}
                location={edu.location}
                startDate={edu.startDate}
                endDate={edu.endDate}
                extra={edu.gpa}
              />
              <BulletList bullets={edu.bullets} />
            </div>
          ))}
        </CVSection>
      )
    }

    if (secId === 'organizationalExperience' && organizationalExperience?.length > 0) {
      return (
        <CVSection key={secId} title="Organizational & Volunteer Experience">
          {organizationalExperience.map((org) => (
            <div key={org.id}>
              <EntryRow
                title={org.role}
                subtitle={org.organization}
                location={org.location}
                startDate={org.startDate}
                endDate={org.endDate}
              />
              {org.description && <p className="cv-entry__desc">{org.description}</p>}
            </div>
          ))}
        </CVSection>
      )
    }

    if (secId === 'skills' && skills?.length > 0) {
      return (
        <CVSection key={secId} title="Skills">
          {skills.map((skill) => (
            <p className="cv-skills__row" key={skill.id}>
              <strong>{skill.category}:</strong> {skill.items}
            </p>
          ))}
        </CVSection>
      )
    }

    if (secId === 'languages' && languages?.length > 0) {
      return (
        <CVSection key={secId} title="Languages">
          <p className="cv-languages">
            {languages.map((l, i) => (
              <span key={l.id}>
                <strong>{l.name}</strong>
                {l.proficiency && ` (${l.proficiency})`}
                {i < languages.length - 1 && ' • '}
              </span>
            ))}
          </p>
        </CVSection>
      )
    }

    if (secId === 'certifications' && certifications?.length > 0) {
      return (
        <CVSection key={secId} title="Certifications">
          {certifications.map((cert) => (
            <EntryRow
              key={cert.id}
              title={`${cert.name}${cert.credentialId ? ` (Credential ID: ${cert.credentialId})` : ''} by ${cert.issuer}`}
              startDate={cert.date}
            />
          ))}
        </CVSection>
      )
    }

    if (secId === 'awards' && awards?.length > 0) {
      return (
        <CVSection key={secId} title="Awards">
          {awards.map((award) => (
            <div key={award.id}>
              <EntryRow
                title={`${award.title} by ${award.issuer}`}
                startDate={award.date}
              />
              {award.description && <p className="cv-entry__desc">{parseMarkdown(award.description)}</p>}
            </div>
          ))}
        </CVSection>
      )
    }

    if (secId === 'publications' && publications?.length > 0) {
      return (
        <CVSection key={secId} title="Publications">
          {publications.map((pub) => (
            <div key={pub.id}>
              <EntryRow
                title={pub.url ? `[${pub.title}](${pub.url})` : pub.title}
                subtitle={pub.conference}
                startDate={pub.date}
              />
              {pub.description && <p className="cv-entry__desc">{parseMarkdown(pub.description)}</p>}
            </div>
          ))}
        </CVSection>
      )
    }

    if (secId === 'projects' && projects?.length > 0) {
      return (
        <CVSection key={secId} title="Projects">
          {projects.map((proj) => (
            <div key={proj.id}>
              <EntryRow
                title={proj.url ? `[${proj.title}](${proj.url})` : proj.title}
                startDate={proj.startDate}
                endDate={proj.endDate}
              />
              {proj.description && <p className="cv-entry__desc">{parseMarkdown(proj.description)}</p>}
              <BulletList bullets={proj.bullets} />
            </div>
          ))}
        </CVSection>
      )
    }

    if (secId.startsWith('cs_')) {
      const customSec = cvData.customSections?.find(cs => cs.id === secId)
      if (customSec && customSec.entries && customSec.entries.length > 0) {
        return (
          <CVSection key={secId} title={customSec.title}>
            {customSec.entries.map((entry) => (
              <div key={entry.id}>
                <EntryRow
                  title={entry.jobTitle || entry.title || entry.name}
                  subtitle={entry.company || entry.subtitle || entry.institution}
                  location={entry.location}
                  startDate={entry.startDate || entry.date}
                  endDate={entry.endDate}
                  extra={entry.extra || entry.gpa}
                />
                {entry.description && <p className="cv-entry__desc">{parseMarkdown(entry.description)}</p>}
                <BulletList bullets={entry.bullets} />
              </div>
            ))}
          </CVSection>
        )
      }
    }

    return null
  }

  return (
    <div className="cv-preview-wrap">
      <div id="cv-document" className="cv-document">
        {/* ── HEADER ── */}
        <CVHeader personalInfo={personalInfo} />

        {/* ── SECTIONS ── */}
        {allSectionsToRender.map(secId => renderSection(secId))}
      </div>
    </div>
  )
}
