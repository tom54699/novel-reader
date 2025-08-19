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
    camouflage = false,
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

  // Camouflage Q&A content (two pairs, longer answers)
  const buildCamouflageQA = () => {
    const q1 = `我正在重構一個 React/TypeScript 專案，想請你示範：\n1) 如何切分大型元件並最佳化重新渲染\n2) 搜尋/高亮的實作要點\n3) GitHub Pages 部署注意事項（Vite base）`
    const a1 = `在重構 React/TS 專案時，建議從「資料流」、「邊界切割」、「效能觀測」三個面向並行：\n\n(一) 資料與狀態\n- 將大型 props/全域狀態拆成更細的衍生資料（例如把全文切成章節 messages，讓 re-render 粒度更小）。\n- 使用 useMemo/useCallback 保障引用穩定性，避免不必要 re-render；對 expensive 計算（例如搜尋映射）採延遲或快取。\n- 將外部副作用（I/O、計時器、事件）包在 custom hooks 中，統一清理與依賴管理。\n\n(二) 視圖邊界與分段載入\n- 以視覺/行為分層：Sidebar（清單/章節）、Content（訊息堆疊/高亮）、BottomBar（搜尋/工具）。\n- 分段載入章節：靠滾動事件的上下臨界載入下一段/上一段；向上插入時補償 scrollTop（以 scrollHeight 差計算）。\n- 搜尋高亮：以 [start,end] 命中記錄；渲染時切割文字為 segments 再包 <mark>，同時標記 data-idx 方便程式定位。\n\n(三) 觀測與測試\n- 以 React Profiler/Performance 面板量測；確保切換章節、搜尋跳轉、分段載入時的 re-render 次數合理。\n- 加上基本 E2E 或元件測試，確認折疊/展開、鍵盤快捷（Ctrl/Cmd+F、Enter、偽裝模式）等互動行為。\n\n(四) GitHub Pages 部署\n- Vite base 預設改成 './'，或由 CI 以 BASE_URL 注入（user site => '/'；project pages => '/<repo>/')。\n- 自動複製 dist/404.html 以支援 SPA 回退。\n- CI 以 Corepack 啟用對應的封包管理器（pnpm/yarn/npm），並以 lockfile 做快取鍵。\n\n(五) 簡繁轉換\n- 使用 opencc-js 的 Converter({ from:'cn', to:'tw' })；切換時重建當前 messages，避免部分轉換的過渡畫面。\n- 若效能顧慮，可將轉換搬至 Web Worker。`
    const q2 = `搜尋高亮與章節同步如何實作得穩定？尤其是向上插入內容時，避免畫面跳動與命中座標錯亂。`
    const a2 = `核心做法是「命中計算與視圖捲動解耦」：\n\n1) 命中座標\n- 以全文偏移（start,end）儲存搜尋命中；在渲染某段時，將該段的 localStart=globalStart-offset 做切片。\n- segments 依據命中切割：普通片段與 <mark> 片段合併，當前命中以 data-idx 標示。\n\n2) 章節同步\n- 在 Content 容器 onScroll 內，掃描第一个（或最後一個不超過頂緣）的 .message-row，解析 data-key=ch-<idx> 作為可見章節回報。\n- App 層接收後更新 activeChapterIndex，側欄高亮即可連動。\n\n3) 向上插入補償\n- 觸發載入上一段（頂部臨界）前，記錄 prevScrollHeight 與 prevScrollTop；插入完成後，將 scrollTop 補上高度差，畫面穩定無跳動。\n\n4) 其他細節\n- 對繁體切換設計為『切換即重建 messages』，避免 quick-map 與 OpenCC 混合的短暫不一致。\n- 將外觀參數（字體、行距、寬度）用 CSS 變數控管，讀者設定可即時套用到所有章節。`
    return [
      { q: q1, a: a1 },
      { q: q2, a: a2 },
    ]
  }
  const reportVisibleChapter = () => {
    const el = scrollerRef.current
    if (!el) return
    if (!Array.isArray(messages) || !messages.length) return
    const rows = Array.from(el.querySelectorAll('.bubble-stack .message-row')) as HTMLElement[]
    // pick the last row whose top is <= threshold (i.e., its header is at/above viewport top)
    let chosen: HTMLElement | null = null
    const threshold = 10
    for (const row of rows) {
      const top = row.offsetTop - el.scrollTop
      if (top <= threshold) chosen = row
      else break
    }
    if (!chosen) chosen = rows[0] || null
    if (!chosen) return
    const key = chosen.getAttribute('data-key') || ''
    const idx = key.startsWith('ch-') ? Number(key.slice(3)) : NaN
    if (!Number.isNaN(idx)) onVisibleChapterIndex(idx)
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
          {Array.isArray(messages) ? (
            camouflage ? (
              <>
                {buildCamouflageQA().map((pair, i) => (
                  <div key={i}>
                    <div className="message-row">
                      <div className="avatar">YOU</div>
                      <article className="bubble user">
                        <pre className="text-content">{pair.q}</pre>
                      </article>
                    </div>
                    <div className="message-row">
                      <div className="avatar">GPT</div>
                      <article className="bubble assistant">
                        <pre className="text-content">{pair.a}</pre>
                      </article>
                    </div>
                  </div>
                ))}
              </>
            ) : messages.length > 0 ? (
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
                      {!camouflage && m.title ? <div className="bubble-meta">{m.title}</div> : null}
                      {renderWithHighlights(String(m.text ?? ''), offsets[idx] ?? 0)}
                    </article>
                  </div>
                ))
              })()
            ) : (
              <div className="message-row">
                <div className="avatar">TXT</div>
                <article className="bubble assistant">
                  {!camouflage ? <div className="bubble-meta">{doc.name}</div> : null}
                  <div className="text-content">載入章節中…</div>
                </article>
              </div>
            )
          ) : (
            camouflage ? (
              <>
                {buildCamouflageQA().map((pair, i) => (
                  <div key={i}>
                    <div className="message-row">
                      <div className="avatar">YOU</div>
                      <article className="bubble user">
                        <pre className="text-content">{pair.q}</pre>
                      </article>
                    </div>
                    <div className="message-row">
                      <div className="avatar">GPT</div>
                      <article className="bubble assistant">
                        <pre className="text-content">{pair.a}</pre>
                      </article>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="message-row">
                <div className="avatar">TXT</div>
                <article className="bubble assistant">
                  <div className="bubble-meta">{doc.name}</div>
                  {renderWithHighlights(content, 0)}
                </article>
              </div>
            )
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
