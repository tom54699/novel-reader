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
import { toTraditional } from './utils/traditional'

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
  const [loadedChapterCount, setLoadedChapterCount] = useState(1)

  const openFilePicker = () => {
    setError(null)
    fileInputRef.current?.click()
  }

  // Recompute search hits when query or displayed text changes
  useEffect(() => {
    const activeDoc = docs.find((d) => d.id === activeId)
    let baseText = ''
    if (activeDoc) {
      if (activeChapterIndex != null && activeDoc.chapters && activeDoc.chapters[activeChapterIndex]) {
        // Concatenate chapters up to loadedChapterCount for infinite scroll
        const startIdx = activeChapterIndex
        const endIdx = Math.min(activeDoc.chapters.length - 1, startIdx + loadedChapterCount - 1)
        let concat = ''
        for (let i = startIdx; i <= endIdx; i++) {
          const { start, end } = activeDoc.chapters[i]
          concat += activeDoc.content.slice(start, end) + '\n\n'
        }
        baseText = concat
      } else {
        baseText = activeDoc.content
      }
    }
    const displayText = displayTraditional ? toTraditional(baseText) : baseText
    if (!activeDoc || !searchState.query) {
      setSearchState((s) => ({ ...s, hits: [], currentIndex: 0 }))
      return
    }
    const hits = searchInText(displayText, searchState.query)
    setSearchState((s) => ({ ...s, hits, currentIndex: hits.length ? Math.min(s.currentIndex, hits.length - 1) : 0 }))
  }, [searchState.query, activeId, docs, activeChapterIndex, displayTraditional, loadedChapterCount])

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
      setLoadedChapterCount(1)
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
          onSelectDoc={(id: string) => { setActiveId(id); setActiveChapterIndex(null); setLoadedChapterCount(1) }}
          onSelectChapter={(idx: number) => { setActiveChapterIndex(idx); setLoadedChapterCount(1) }}
          traditional={displayTraditional}
        />
      </aside>
      <main className="content">
        <ContentView
          doc={(function () {
            const d = docs.find((x) => x.id === activeId) || null
            if (!d) return null
            const baseText = (() => {
              if (activeChapterIndex != null && d.chapters && d.chapters[activeChapterIndex]) {
                const { start, end } = d.chapters[activeChapterIndex]
                return d.content.slice(start, end)
              }
              return d.content
            })()
            const displayText = displayTraditional ? toTraditional(baseText) : baseText
            const key = activeChapterIndex != null ? `ch-${activeChapterIndex}` : 'all'
            return { ...d, content: displayText, scrollTop: d.scroll?.[key] ?? d.scrollTop }
          })()}
          searchState={searchState}
          messages={(function () {
            const d = docs.find((x) => x.id === activeId)
            if (!d) return []
            if (activeChapterIndex == null || !d.chapters?.length) return []
            const msgs = [] as Array<{ key: string; title: string; text: string }>
            const startIdx = activeChapterIndex
            const endIdx = Math.min(d.chapters.length - 1, startIdx + loadedChapterCount - 1)
            for (let i = startIdx; i <= endIdx; i++) {
              const ch = d.chapters[i]
              const text = d.content.slice(ch.start, ch.end)
              msgs.push({ key: `ch-${i}`, title: displayTraditional ? toTraditional(ch.title) : ch.title, text: displayTraditional ? toTraditional(text) : text })
            }
            return msgs
          })()}
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
            if (!d || activeChapterIndex == null || !d.chapters?.length) return
            const endIdx = Math.min(d.chapters.length - 1, activeChapterIndex + loadedChapterCount - 1)
            if (endIdx < d.chapters.length - 1) {
              setLoadedChapterCount((c) => c + 1)
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
