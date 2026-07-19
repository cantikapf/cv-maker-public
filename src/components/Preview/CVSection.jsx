/* CVSection — renders one titled section of the CV */
export default function CVSection({ title, children }) {
  if (!children) return null

  return (
    <section className="cv-section">
      <h2 className="cv-section__title">{title}</h2>
      <div className="cv-section__body">{children}</div>
    </section>
  )
}
