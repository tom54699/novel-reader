function truncateMiddle(str: string, max = 30) {
  if (str.length <= max) return str
  const half = Math.floor((max - 1) / 2)
  return str.slice(0, half) + '…' + str.slice(-half)
}

import { toTraditional } from '../utils/traditional'

export function Sidebar(props: any) {
  const { docs = [], activeId = null, activeChapterIndex = null, onSelectDoc = () => {}, onSelectChapter = () => {}, traditional = false } = props
  const activeDoc = docs.find((d: any) => d.id === activeId)
  return (
    <div className="sidebar-inner">
      <div className="sidebar-header">Files</div>
      <ul className="file-list">
        {docs.map((doc: any) => (
          <li key={doc.id}>
            <button
              type="button"
              className={doc.id === activeId ? 'file-item active' : 'file-item'}
              onClick={() => onSelectDoc(doc.id)}
              title={traditional ? toTraditional(doc.name) : doc.name}
            >
              <span className="file-name">{truncateMiddle(traditional ? toTraditional(doc.name) : doc.name, 40)}</span>
            </button>
            {activeDoc && doc.id === activeDoc.id && Array.isArray(activeDoc.chapters) && activeDoc.chapters.length > 0 && (
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
