function truncateMiddle(str: string, max = 30) {
  if (str.length <= max) return str
  const half = Math.floor((max - 1) / 2)
  return str.slice(0, half) + '…' + str.slice(-half)
}

export function Sidebar(props: any) {
  const { docs = [], activeId = null, onSelectDoc = () => {} } = props
  return (
    <div className="sidebar-inner">
      <div className="sidebar-header">Files</div>
      <ul className="file-list">
        {docs.map((doc: any) => (
          <li
            key={doc.id}
            className={doc.id === activeId ? 'file-item active' : 'file-item'}
            onClick={() => onSelectDoc(doc.id)}
            title={doc.name}
          >
            <span className="file-name">{truncateMiddle(doc.name, 40)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
