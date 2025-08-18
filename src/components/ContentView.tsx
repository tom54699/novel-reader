import { useEffect, useMemo, useRef } from 'react'

export function ContentView(props: any) {
  const {
    doc = null,
    onScroll = () => {},
    onEndReached = () => {},
    searchState = { query: '', hits: [], currentIndex: 0 },
    messages,
  } = props
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  // Compute entire content as one block to mimic a single ChatGPT message
  const content = useMemo(() => String(doc?.content ?? ''), [doc?.content])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    if (doc && typeof doc.scrollTop === 'number') {
      el.scrollTop = doc.scrollTop
    } else {
      el.scrollTop = 0
    }
  }, [doc?.id])

  // Scroll current hit into view smoothly
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const current = el.querySelector(`mark.hit[data-idx="${searchState.currentIndex}"]`) as HTMLElement | null
    if (current) {
      current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    }
  }, [searchState.currentIndex, doc?.id])

  const renderWithHighlights = (text: string, startOffset: number) => {
    const hits = searchState.hits
    if (!hits.length) return <pre className="text-content">{text}</pre>

    const segments: Array<{ text: string; isHit?: boolean; isCurrent?: boolean; idx?: number }> = []
    let cursor = 0
    const endOffset = startOffset + text.length
    const localHits = hits
      .map((h, idx) => ({ ...h, idx }))
      .filter((h) => h.end > startOffset && h.start < endOffset)
      .sort((a, b) => a.start - b.start)

    for (const h of localHits) {
      const s = Math.max(0, h.start - startOffset)
      const e = Math.min(text.length, h.end - startOffset)
      if (s > cursor) segments.push({ text: text.slice(cursor, s) })
      segments.push({ text: text.slice(s, e), isHit: true, isCurrent: h.idx === searchState.currentIndex, idx: h.idx })
      cursor = e
    }
    if (cursor < text.length) segments.push({ text: text.slice(cursor) })

    return (
      <pre className="text-content">
        {segments.map((seg, i) =>
          seg.isHit ? (
            <mark key={i} className={seg.isCurrent ? 'hit hit-current' : 'hit'} data-idx={seg.idx}>
              {seg.text}
            </mark>
          ) : (
            <span key={i}>{seg.text}</span>
          ),
        )}
      </pre>
    )
  }

  return (
    <div
      ref={scrollerRef}
      className="content-inner"
      onScroll={(e) => {
        const el = e.target as HTMLDivElement
        onScroll(el.scrollTop)
        if (el.scrollHeight - el.scrollTop - el.clientHeight < 240) {
          onEndReached()
        }
      }}
    >
      {doc ? (
        <div className="bubble-stack">
          {Array.isArray(messages) && messages.length > 0 ? (
            (() => {
              const offsets: number[] = []
              let acc = 0
              for (const m of messages) {
                offsets.push(acc)
                acc += (m.text?.length ?? 0) + 2
              }
              return messages.map((m: any, idx: number) => (
                <div className="message-row" key={m.key ?? idx}>
                  <div className="avatar">TXT</div>
                  <article className={idx % 2 === 0 ? 'bubble assistant' : 'bubble user'}>
                    {m.title ? <div className="bubble-meta">{m.title}</div> : null}
                    {renderWithHighlights(String(m.text ?? ''), offsets[idx])}
                  </article>
                </div>
              ))
            })()
          ) : (
            <div className="message-row">
              <div className="avatar">TXT</div>
              <article className="bubble assistant">
                <div className="bubble-meta">{doc.name}</div>
                {renderWithHighlights(content, 0)}
              </article>
            </div>
          )}
        </div>
      ) : (
        <div className="placeholder">Upload a .txt file to start</div>
      )}
    </div>
  )
}
