import { useRef, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { ContentView } from './components/ContentView'
import { BottomBar } from './components/BottomBar'
import type { AppState, Doc, SearchState } from './types'
import { validateFile, readFileAsText } from './utils/file'
import { generateId } from './utils/id'
import { searchInText } from './utils/search'
import { useEffect } from 'react'
import { parseChapters } from './utils/chapters'
import { toTraditional as toTraditionalQuick, ensureOpenCC, toTraditionalOpenCC } from './utils/traditional'

export default function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [activeId, setActiveId] = useState<AppState['activeId']>(null)
  const [docs, setDocs] = useState<AppState['docs']>([])
  const [searchState, setSearchState] = useState<SearchState>({ query: '', hits: [], currentIndex: 0 })
  const [error, setError] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeChapterIndex, setActiveChapterIndex] = useState<number | null>(null)
  const [displayTraditional, setDisplayTraditional] = useState(false)
  const [loadedStartChapterIndex, setLoadedStartChapterIndex] = useState<number | null>(null)
  const [loadedMessages, setLoadedMessages] = useState<Array<{ key: string; title: string; text: string }>>([])
  const [wholeConverted, setWholeConverted] = useState<string | null>(null)

  const openFilePicker = () => {
    setError(null)
    fileInputRef.current?.click()
  }

  // Recompute search hits when query or displayed text changes
  useEffect(() => {
    const activeDoc = docs.find((d) => d.id === activeId)
    let displayText = ''
    if (activeDoc) {
      if (activeChapterIndex != null && loadedMessages.length) {
        // Use already-rendered messages (possibly converted at creation time)
        displayText = loadedMessages.map((m) => m.text).join('\n\n')
      } else {
        // Whole document view
        displayText = displayTraditional ? (wholeConverted ?? toTraditionalQuick(activeDoc.content)) : activeDoc.content
      }
    }
    if (!activeDoc || !searchState.query) {
      setSearchState((s) => ({ ...s, hits: [], currentIndex: 0 }))
      return
    }
    const hits = searchInText(displayText, searchState.query)
    setSearchState((s) => ({ ...s, hits, currentIndex: hits.length ? Math.min(s.currentIndex, hits.length - 1) : 0 }))
  }, [searchState.query, activeId, docs, activeChapterIndex, displayTraditional, loadedMessages, wholeConverted])

  // When toggling Traditional in non-chapter mode, compute OpenCC result lazily
  useEffect(() => {
    const d = docs.find((x) => x.id === activeId)
    setWholeConverted(null)
    if (!displayTraditional || !d) return
    if (activeChapterIndex != null) return
    let alive = true
    ;(async () => {
      await ensureOpenCC()
      if (!alive) return
      const txt = await toTraditionalOpenCC(d.content)
      if (!alive) return
      setWholeConverted(txt)
    })()
    return () => {
      alive = false
    }
  }, [displayTraditional, activeId, activeChapterIndex, docs])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        searchInputRef.current?.focus()
      } else if (e.key === 'Enter') {
        if (searchState.hits.length) {
          e.preventDefault()
          setSearchState((s) => {
            const total = s.hits.length
            if (!total) return s
            const next = e.shiftKey ? (s.currentIndex - 1 + total) % total : (s.currentIndex + 1) % total
            return { ...s, currentIndex: next }
          })
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchState.hits.length])

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Reset value to allow re-selecting same file later
    e.target.value = ''
    if (!file) return

    const validation = validateFile(file)
    if (!validation.valid) {
      setError(validation.error || '無法上傳檔案')
      return
    }

    try {
      setLoading(true)
      const content = await readFileAsText(file)
      const chapters = parseChapters(content)
      const newDoc: Doc = { id: generateId(), name: file.name, size: file.size, content, chapters }
      setDocs((prev) => [newDoc, ...prev])
      setActiveId(newDoc.id)
      setActiveChapterIndex(null)
      setLoadedStartChapterIndex(null)
      setLoadedMessages([])
    } catch (err: any) {
      setError(err?.message || '無法解析文字')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-root">
      <aside className="sidebar">
        <Sidebar
          docs={docs}
          activeId={activeId}
          activeChapterIndex={activeChapterIndex}
          onSelectDoc={(id: string) => {
            setActiveId(id)
            setActiveChapterIndex(null)
            setLoadedStartChapterIndex(null)
            setLoadedMessages([])
          }}
          onSelectChapter={(idx: number) => {
            setActiveChapterIndex(idx)
            setLoadedStartChapterIndex(idx)
            const d = docs.find((x) => x.id === activeId)
            if (d && d.chapters && d.chapters[idx]) {
              const ch = d.chapters[idx]
              const text = d.content.slice(ch.start, ch.end)
              const titleQuick = displayTraditional ? toTraditionalQuick(ch.title) : ch.title
              const textQuick = displayTraditional ? toTraditionalQuick(text) : text
              setLoadedMessages([{ key: `ch-${idx}`, title: titleQuick, text: textQuick }])
              if (displayTraditional) {
                ;(async () => {
                  await ensureOpenCC()
                  const betterTitle = await toTraditionalOpenCC(ch.title)
                  const better = await toTraditionalOpenCC(text)
                  setLoadedMessages([{ key: `ch-${idx}`, title: betterTitle, text: better }])
                })()
              }
            } else {
              setLoadedMessages([])
            }
          }}
          traditional={displayTraditional}
        />
      </aside>
      <main className="content">
        <ContentView
          doc={(function () {
            const d = docs.find((x) => x.id === activeId) || null
            if (!d) return null
            const key = activeChapterIndex != null ? `ch-${activeChapterIndex}` : 'all'
            // In non-chapter mode, convert whole content according to toggle
            const content = activeChapterIndex == null
              ? (displayTraditional ? (wholeConverted ?? toTraditionalQuick(d.content)) : d.content)
              : d.content
            return { ...d, content, scrollTop: d.scroll?.[key] ?? d.scrollTop }
          })()}
          searchState={searchState}
          messages={activeChapterIndex != null ? loadedMessages : []}
          onScroll={(scrollTop: number) => {
            if (!activeId) return
            setDocs((prev) => prev.map((d) => {
              if (d.id !== activeId) return d
              const key = activeChapterIndex != null ? `ch-${activeChapterIndex}` : 'all'
              return { ...d, scroll: { ...(d.scroll || {}), [key]: scrollTop } }
            }))
          }}
          onEndReached={() => {
            const d = docs.find((x) => x.id === activeId)
            if (!d || loadedStartChapterIndex == null || !d.chapters?.length) return
            const nextIdx = loadedStartChapterIndex + loadedMessages.length
            if (nextIdx >= d.chapters.length) return
            const ch = d.chapters[nextIdx]
            const text = d.content.slice(ch.start, ch.end)
            const titleQuick = displayTraditional ? toTraditionalQuick(ch.title) : ch.title
            const textQuick = displayTraditional ? toTraditionalQuick(text) : text
            setLoadedMessages((arr) => [...arr, { key: `ch-${nextIdx}`, title: titleQuick, text: textQuick }])
            if (displayTraditional) {
              ;(async () => {
                await ensureOpenCC()
                const betterTitle = await toTraditionalOpenCC(ch.title)
                const better = await toTraditionalOpenCC(text)
                setLoadedMessages((arr) => arr.map((m) => (m.key === `ch-${nextIdx}` ? { ...m, title: betterTitle, text: better } : m)))
              })()
            }
          }}
        />
      </main>
      <div className="bottombar">
        <BottomBar
          searchState={searchState}
          onSearch={(q: string) => setSearchState((s) => ({ ...s, query: q, currentIndex: 0 }))}
          onNavigateSearch={(direction: 'next' | 'prev') => {
            setSearchState((s) => {
              const total = s.hits.length
              if (!total) return s
              const delta = direction === 'next' ? 1 : -1
              const next = (s.currentIndex + delta + total) % total
              return { ...s, currentIndex: next }
            })
          }}
          onAddFile={openFilePicker}
          inputRef={searchInputRef}
          onToggleTraditional={() => setDisplayTraditional((v) => !v)}
          traditional={displayTraditional}
        />
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt"
        onChange={onFileSelected}
        style={{ display: 'none' }}
      />
      {error && <div className="error-banner" role="alert">{error}</div>}
      {loading && <div className="loading-indicator">Loading…</div>}
    </div>
  )
}
