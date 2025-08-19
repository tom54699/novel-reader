import { useEffect, useMemo, useRef } from 'react'

export function ContentView(props: any) {
  const {
    doc = null,
    onScroll = () => {},
    onEndReached = () => {},
    onStartReached = () => {},
    searchState = { query: '', hits: [], currentIndex: 0 },
    messages,
    hasPrev = true,
    hasNext = true,
    edgeText = '已無更多內容',
    onVisibleChapterIndex = (_idx: number) => {},
  } = props
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const prevScrollHeightRef = useRef<number | null>(null)
  const prevScrollTopRef = useRef<number | null>(null)
  const topGateRef = useRef(false)
  const bottomGateRef = useRef(false)
  const pendingPrependRef = useRef(false)

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
  }, [doc?.id, (doc as any)?.scrollTop])

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
    const hits = searchState.hits as Array<{ start: number; end: number }>
    if (!hits.length) return <pre className="text-content">{text}</pre>

    const segments: Array<{ text: string; isHit?: boolean; isCurrent?: boolean; idx?: number }> = []
    let cursor = 0
    const endOffset = startOffset + text.length
    const localHits = hits
      .map((h: { start: number; end: number }, idx: number) => ({ ...h, idx }))
      .filter((h: { start: number; end: number; idx: number }) => h.end > startOffset && h.start < endOffset)
      .sort((a: { start: number }, b: { start: number }) => a.start - b.start)

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

  // Compensate scroll on prepend when messages count changes
  usePrependScrollCompensation(
    scrollerRef,
    pendingPrependRef,
    prevScrollHeightRef,
    prevScrollTopRef,
    Array.isArray(messages) ? messages.length : 0,
  )

  const reportVisibleChapter = () => {
    const el = scrollerRef.current
    if (!el) return
    if (!Array.isArray(messages) || !messages.length) return
    const containerTop = el.getBoundingClientRect().top
    const rows = Array.from(el.querySelectorAll('.bubble-stack .message-row')) as HTMLElement[]
    for (const row of rows) {
      const rect = row.getBoundingClientRect()
      const top = rect.top - containerTop
      if (top >= -20) {
        const key = row.getAttribute('data-key') || ''
        const idx = key.startsWith('ch-') ? Number(key.slice(3)) : NaN
        if (!Number.isNaN(idx)) onVisibleChapterIndex(idx)
        return
      }
    }
    // If scrolled past all, report last one
    const last = rows[rows.length - 1]
    if (last) {
      const key = last.getAttribute('data-key') || ''
      const idx = key.startsWith('ch-') ? Number(key.slice(3)) : NaN
      if (!Number.isNaN(idx)) onVisibleChapterIndex(idx)
    }
  }

  return (
    <div
      ref={scrollerRef}
      className="content-inner"
      onScroll={(e) => {
        const el = e.target as HTMLDivElement
        onScroll(el.scrollTop)
        if (el.scrollTop < 160 && !topGateRef.current) {
          topGateRef.current = true
          // record current scroll for prepend compensation
          prevScrollHeightRef.current = el.scrollHeight
          prevScrollTopRef.current = el.scrollTop
          pendingPrependRef.current = true
          onStartReached()
          setTimeout(() => (topGateRef.current = false), 200)
        }
        if (el.scrollHeight - el.scrollTop - el.clientHeight < 240) {
          if (!bottomGateRef.current) {
            bottomGateRef.current = true
            onEndReached()
            setTimeout(() => (bottomGateRef.current = false), 200)
          }
        }
        reportVisibleChapter()
      }}
    >
      {doc ? (
        <div className="bubble-stack">
          {!hasPrev ? (
            <div className="edge-notice">{edgeText}</div>
          ) : null}
          {Array.isArray(messages) && messages.length > 0 ? (
            (() => {
              const offsets: number[] = []
              let acc = 0
              for (const m of messages) {
                offsets.push(acc)
                acc += (m.text?.length ?? 0) + 2
              }
              return messages.map((m: any, idx: number) => (
                <div className="message-row" key={m.key ?? idx} data-key={m.key ?? `idx-${idx}`}>
                  <div className="avatar">TXT</div>
                  <article className={'bubble assistant'}>
                    {m.title ? <div className="bubble-meta">{m.title}</div> : null}
                    {renderWithHighlights(String(m.text ?? ''), offsets[idx] ?? 0)}
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
          {!hasNext ? (
            <div className="edge-notice">{edgeText}</div>
          ) : null}
        </div>
      ) : (
        <div className="placeholder">Upload a .txt file to start</div>
      )}
    </div>
  )
}

// Keep viewport stable when messages are prepended at the top
// We hook after render when messages length changes and a prepend was requested
// so we can compensate scrollTop by the increased scrollHeight.
export function usePrependScrollCompensation(
  scrollerRef: React.RefObject<HTMLDivElement>,
  pendingPrependRef: React.MutableRefObject<boolean>,
  prevScrollHeightRef: React.MutableRefObject<number | null>,
  prevScrollTopRef: React.MutableRefObject<number | null>,
  dep: any,
) {
  useEffect(() => {
    if (!pendingPrependRef.current) return
    const el = scrollerRef.current
    if (!el) return
    const prevH = prevScrollHeightRef.current ?? el.scrollHeight
    const prevTop = prevScrollTopRef.current ?? el.scrollTop
    const newH = el.scrollHeight
    const delta = newH - prevH
    el.scrollTop = prevTop + delta
    pendingPrependRef.current = false
    prevScrollHeightRef.current = null
    prevScrollTopRef.current = null
  }, [dep])
}
