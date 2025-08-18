function truncateMiddle(str: string, max = 30) {
  if (str.length <= max) return str
  const half = Math.floor((max - 1) / 2)
  return str.slice(0, half) + '…' + str.slice(-half)
}

export function Sidebar(props: any) {
  const { docs = [], activeId = null, activeChapterIndex = null, onSelectDoc = () => {}, onSelectChapter = () => {} } = props
  const activeDoc = docs.find((d: any) => d.id === activeId)
  return (
    <div className="sidebar-inner">
      <div className="sidebar-header">Files</div>
      <ul className="file-list">
        {docs.map((doc: any) => (
          <li key={doc.id}>
            <div
              className={doc.id === activeId ? 'file-item active' : 'file-item'}
              onClick={() => onSelectDoc(doc.id)}
              title={doc.name}
            >
              <span className="file-name">{truncateMiddle(doc.name, 40)}</span>
            </div>
            {activeDoc && doc.id === activeDoc.id && Array.isArray(activeDoc.chapters) && activeDoc.chapters.length > 0 && (
              <ul className="chapter-list">
                {activeDoc.chapters.map((ch: any, idx: number) => (
                  <li
                    key={idx}
                    className={activeChapterIndex === idx ? 'chapter-item active' : 'chapter-item'}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectChapter(idx)
                    }}
                    title={ch.title}
                  >
                    <span className="chapter-name">{truncateMiddle(ch.title, 36)}</span>
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
