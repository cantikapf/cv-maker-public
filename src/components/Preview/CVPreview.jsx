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

  return (
    <div className="cv-preview-wrap">
      <div id="cv-document" className="cv-document">
        {/* ── HEADER ── */}
        <CVHeader personalInfo={personalInfo} />

        {/* ── WORK EXPERIENCE ── */}
        {workExperience?.length > 0 && (
          <CVSection title="Work Experience">
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
        )}

        {/* ── EDUCATION ── */}
        {education?.length > 0 && (
          <CVSection title="Education">
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
        )}

        {/* ── ORGANIZATIONAL & VOLUNTEER ── */}
        {organizationalExperience?.length > 0 && (
          <CVSection title="Organizational & Volunteer Experience">
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
        )}

        {/* ── SKILLS ── */}
        {skills?.length > 0 && (
          <CVSection title="Skills">
            {skills.map((skill) => (
              <p className="cv-skills__row" key={skill.id}>
                <strong>{skill.category}:</strong> {skill.items}
              </p>
            ))}
          </CVSection>
        )}

        {/* ── LANGUAGES ── */}
        {languages?.length > 0 && (
          <CVSection title="Languages">
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
        )}

        {/* ── CERTIFICATIONS ── */}
        {certifications?.length > 0 && (
          <CVSection title="Certifications">
            {certifications.map((cert) => (
              <EntryRow
                key={cert.id}
                title={`${cert.name}${cert.credentialId ? ` (Credential ID: ${cert.credentialId})` : ''} by ${cert.issuer}`}
                startDate={cert.date}
              />
            ))}
          </CVSection>
        )}

        {/* ── AWARDS ── */}
        {awards?.length > 0 && (
          <CVSection title="Awards">
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
        )}

        {/* ── PUBLICATIONS ── */}
        {publications?.length > 0 && (
          <CVSection title="Publications">
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
        )}

        {/* ── PROJECTS ── */}
        {projects?.length > 0 && (
          <CVSection title="Projects">
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
        )}
      </div>
    </div>
  )
}
