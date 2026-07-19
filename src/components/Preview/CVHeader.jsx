/* CVHeader — name, 2-line contacts, optional photo, and summary */
export default function CVHeader({ personalInfo }) {
  const { name, location, email, phone, linkedin, github, portfolio, photo, summary } = personalInfo

  // Row 1: location, email, phone, linkedin
  const row1 = [location, email, phone].filter(Boolean)
  const row1Links = []
  if (linkedin) row1Links.push({ label: linkedin, href: linkedin })

  // Row 2: github, portfolio
  const row2Links = []
  if (github) row2Links.push({ label: github, href: github })
  if (portfolio) row2Links.push({ label: portfolio, href: portfolio })

  const ensureHttp = (url) =>
    url && !url.startsWith('http') ? `https://${url}` : url

  return (
    <header className={`cv-header ${photo ? 'cv-header--has-photo' : ''}`}>
      {photo && (
        <img
          src={photo}
          alt="Profile"
          className="cv-header__photo"
        />
      )}

      <div className="cv-header__info">
        <h1 className="cv-header__name">{name || 'Your Name'}</h1>

        {/* Row 1 */}
        {(row1.length > 0 || row1Links.length > 0) && (
          <p className="cv-header__contacts">
            {row1.join(' • ')}
            {row1.length > 0 && row1Links.length > 0 && ' • '}
            {row1Links.map((link, i) => (
              <span key={i}>
                {i > 0 && ' • '}
                <a
                  href={ensureHttp(link.href)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cv-header__link"
                >
                  {link.label}
                </a>
              </span>
            ))}
          </p>
        )}

        {/* Row 2 — github & portfolio */}
        {row2Links.length > 0 && (
          <p className="cv-header__contacts cv-header__contacts--row2">
            {row2Links.map((link, i) => (
              <span key={i}>
                {i > 0 && ' • '}
                <a
                  href={ensureHttp(link.href)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cv-header__link"
                >
                  {link.label}
                </a>
              </span>
            ))}
          </p>
        )}

        {summary && <p className="cv-header__summary">{summary}</p>}
      </div>
    </header>
  )
}
