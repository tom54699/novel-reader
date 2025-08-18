export function ContentView(props: any) {
  const { doc = null } = props
  if (!doc)
    return (
      <div className="content-inner">
        <div className="placeholder">Upload a .txt file to start</div>
      </div>
    )

  const parts = String(doc.content).split(/\n{2,}/g)
  return (
    <div className="content-inner">
      <div className="bubble-stack">
        {parts.map((part, idx) => (
          <article className="bubble" key={idx}>
            <pre className="text-content">{part}</pre>
          </article>
        ))}
      </div>
    </div>
  )
}
