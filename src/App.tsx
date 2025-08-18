import { useRef, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { ContentView } from './components/ContentView'
import { BottomBar } from './components/BottomBar'
import type { AppState, Doc, SearchState } from './types'
import { validateFile, readFileAsText } from './utils/file'
import { generateId } from './utils/id'
import { searchInText } from './utils/search'
import { useEffect } from 'react'

export default function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [activeId, setActiveId] = useState<AppState['activeId']>(null)
  const [docs, setDocs] = useState<AppState['docs']>([])
  const [searchState, setSearchState] = useState<SearchState>({ query: '', hits: [], currentIndex: 0 })
  const [error, setError] = useState<string | null>(null)

  const openFilePicker = () => {
    setError(null)
    fileInputRef.current?.click()
  }

  // Recompute search hits when query, active doc, or docs change
  useEffect(() => {
    const activeDoc = docs.find((d) => d.id === activeId)
    if (!activeDoc || !searchState.query) {
      setSearchState((s) => ({ ...s, hits: [], currentIndex: 0 }))
      return
    }
    const hits = searchInText(activeDoc.content, searchState.query)
    setSearchState((s) => ({ ...s, hits, currentIndex: hits.length ? Math.min(s.currentIndex, hits.length - 1) : 0 }))
  }, [searchState.query, activeId, docs])

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
      const content = await readFileAsText(file)
      const newDoc: Doc = { id: generateId(), name: file.name, size: file.size, content }
      setDocs((prev) => [newDoc, ...prev])
      setActiveId(newDoc.id)
    } catch (err: any) {
      setError(err?.message || '無法解析文字')
    }
  }

  return (
    <div className="app-root">
      <aside className="sidebar">
        <Sidebar docs={docs} activeId={activeId} onSelectDoc={setActiveId} />
      </aside>
      <main className="content">
        <ContentView
          doc={docs.find((d) => d.id === activeId) || null}
          searchState={searchState}
          onScroll={(scrollTop: number) => {
            if (!activeId) return
            setDocs((prev) => prev.map((d) => (d.id === activeId ? { ...d, scrollTop } : d)))
          }}
        />
      </main>
      <div className="bottombar">
        <BottomBar
          searchState={searchState}
          onSearch={(q: string) => setSearchState((s) => ({ ...s, query: q, currentIndex: 0 }))}
          onNavigateSearch={() => {}}
          onAddFile={openFilePicker}
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
    </div>
  )
}
