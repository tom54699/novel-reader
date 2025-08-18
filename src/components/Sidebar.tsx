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
            <span className="file-name">{doc.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

