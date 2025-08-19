function truncateMiddle(str: string, max = 30) {
  if (str.length <= max) return str
  const half = Math.floor((max - 1) / 2)
  return str.slice(0, half) + '…' + str.slice(-half)
}

import { useState } from 'react'
import { toTraditional } from '../utils/traditional'

export function Sidebar(props: any) {
  const { docs = [], activeId = null, activeChapterIndex = null, onSelectDoc = () => {}, onSelectChapter = () => {}, traditional = false, camouflage = false } = props
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const activeDoc = docs.find((d: any) => d.id === activeId)
  const mask = (name: string, idx: number) => {
    const pool = ['New chat', 'API Design Tips', 'Debugging Guide', 'React Patterns', 'SQL Basics', 'TypeScript Notes', 'Performance Tuning', 'Unit Testing']
    return pool[idx % pool.length]
  }
  return (
    <div className="sidebar-inner">
      <div className="sidebar-header">{camouflage ? 'ChatGPT' : 'Files'}</div>
      <ul className="file-list">
        {docs.map((doc: any, i: number) => (
          <li key={doc.id}>
            <button
              type="button"
              className={doc.id === activeId ? 'file-item active' : 'file-item'}
              onClick={() => onSelectDoc(doc.id)}
              title={camouflage ? mask(doc.name, i) : (traditional ? toTraditional(doc.name) : doc.name)}
            >
              <span className="file-name">{truncateMiddle(camouflage ? mask(doc.name, i) : (traditional ? toTraditional(doc.name) : doc.name), 40)}</span>
              {!camouflage && doc.id === activeId && Array.isArray(activeDoc?.chapters) && activeDoc.chapters.length > 0 ? (
                <span
                  style={{ float: 'right', opacity: 0.8 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCollapsed((m) => ({ ...m, [doc.id]: !m[doc.id] }))
                  }}
                  aria-label={collapsed[doc.id] ? '展開章節' : '收合章節'}
                >
                  {collapsed[doc.id] ? '▶' : '▼'}
                </span>
              ) : null}
            </button>
            {!camouflage && activeDoc && doc.id === activeDoc.id && Array.isArray(activeDoc.chapters) && activeDoc.chapters.length > 0 && !collapsed[doc.id] && (
              <ul className="chapter-list">
                {activeDoc.chapters.map((ch: any, idx: number) => (
                  <li key={idx}>
                    <button
                      type="button"
                      className={activeChapterIndex === idx ? 'chapter-item active' : 'chapter-item'}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectChapter(idx)
                      }}
                      title={traditional ? toTraditional(ch.title) : ch.title}
                    >
                      <span className="chapter-name">{truncateMiddle(traditional ? toTraditional(ch.title) : ch.title, 36)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
