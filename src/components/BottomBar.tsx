export function BottomBar(props: any) {
  const { searchState = { query: '' }, onSearch = () => {}, onNavigateSearch = () => {}, onAddFile = () => {} } = props
  return (
    <div className="bottombar-inner">
      <button className="add-btn" aria-label="Add file" title="Add file" onClick={onAddFile}>
        +
      </button>
      <input
        className="search-input"
        placeholder="Search in file"
        value={searchState.query}
        onChange={(e) => onSearch(e.target.value)}
      />
      <div className="search-actions">
        <button className="nav-btn" onClick={() => onNavigateSearch('prev')} aria-label="Previous hit">
          ↑
        </button>
        <button className="nav-btn" onClick={() => onNavigateSearch('next')} aria-label="Next hit">
          ↓
        </button>
      </div>
    </div>
  )
}
