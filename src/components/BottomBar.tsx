import { useState } from 'react'

export function BottomBar(props: any) {
  const { searchState = { query: '', hits: [], currentIndex: 0 }, onSearch = () => {}, onNavigateSearch = () => {}, onAddFile = () => {}, inputRef, onToggleTraditional = () => {}, traditional = false } = props
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className="bottombar-inner">
      <div className="bar-surface">
        <div className="tool-wrap">
          <button className="add-btn" aria-label="Open tools" title="工具" onClick={() => setMenuOpen((v) => !v)}>
            +
          </button>
          {menuOpen && (
            <div className="tool-menu" role="menu">
              <button
                type="button"
                className="menu-item"
                onClick={() => {
                  setMenuOpen(false)
                  onAddFile()
                }}
              >
                上傳 .txt 檔案
              </button>
              <button
                type="button"
                className={traditional ? 'menu-item checked' : 'menu-item'}
                onClick={() => {
                  onToggleTraditional()
                  setMenuOpen(false)
                }}
              >
                {traditional ? '✓ ' : ''}繁體顯示
              </button>
            </div>
          )}
        </div>
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
