export function BottomBar(props: any) {
  const { searchState = { query: '', hits: [], currentIndex: 0 }, onSearch = () => {}, onNavigateSearch = () => {}, onAddFile = () => {}, inputRef } = props
  return (
    <div className="bottombar-inner">
      <div className="bar-surface">
        <button className="add-btn" aria-label="Add file" title="Add file" onClick={onAddFile}>
          +
        </button>
        <input
          ref={inputRef}
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
          <div className="search-count" aria-live="polite">
            {searchState.hits.length ? `${Math.min(searchState.currentIndex + 1, searchState.hits.length)}/${searchState.hits.length}` : '0/0'}
          </div>
        </div>
      </div>
    </div>
  )
}
