export function ContentView(props: any) {
  const { doc = null } = props
  return (
    <div className="content-inner">
      {!doc ? (
        <div className="placeholder">Upload a .txt file to start</div>
      ) : (
        <article className="bubble">
          <pre className="text-content">{doc.content}</pre>
        </article>
      )}
    </div>
  )
}

