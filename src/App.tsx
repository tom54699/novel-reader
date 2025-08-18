import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { ContentView } from './components/ContentView'
import { BottomBar } from './components/BottomBar'

export default function App() {
  // Placeholder state; real types and logic in later tasks
  const [activeId, setActiveId] = useState<string | null>(null)
  const [docs, setDocs] = useState<any[]>([])
  const [searchState, setSearchState] = useState<any>({ query: '', hits: [], currentIndex: 0 })

  return (
    <div className="app-root">
      <aside className="sidebar">
        <Sidebar docs={docs} activeId={activeId} onSelectDoc={setActiveId} />
      </aside>
      <main className="content">
        <ContentView doc={docs.find((d) => d.id === activeId) || null} searchState={searchState} onScroll={() => {}} />
      </main>
      <div className="bottombar">
        <BottomBar
          searchState={searchState}
          onSearch={(q: string) => setSearchState((s: any) => ({ ...s, query: q }))}
          onNavigateSearch={() => {}}
          onAddFile={() => {}}
        />
      </div>
    </div>
  )
}

