import { useEffect, useRef } from 'react'

export function ContentView(props: any) {
  const { doc = null, onScroll = () => {} } = props
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    if (doc && typeof doc.scrollTop === 'number') {
      el.scrollTop = doc.scrollTop
    } else {
      el.scrollTop = 0
    }
  }, [doc?.id])

  if (!doc)
    return (
      <div ref={scrollerRef} className="content-inner">
        <div className="placeholder">Upload a .txt file to start</div>
      </div>
    )

  const parts = String(doc.content).split(/\n{2,}/g)
  return (
    <div ref={scrollerRef} className="content-inner" onScroll={(e) => onScroll((e.target as HTMLDivElement).scrollTop)}>
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
