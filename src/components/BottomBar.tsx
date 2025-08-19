import { useState } from 'react'

export function BottomBar(props: any) {
  const { searchState = { query: '', hits: [], currentIndex: 0 }, onSearch = () => {}, onNavigateSearch = () => {}, onAddFile = () => {}, onAddFolder = () => {}, inputRef, onToggleTraditional = () => {}, traditional = false, onAdjustFont = (_d: number) => {}, onAdjustLine = (_d: number) => {}, onAdjustWidth = (_d: number) => {}, history = [], onOpenHistory = (_item: any) => {}, onToggleCamouflage = () => {}, camouflage = false } = props
  const [menuOpen, setMenuOpen] = useState(false)
  const [submenu, setSubmenu] = useState<null | 'settings' | 'history'>(null)
  return (
    <div className="bottombar-inner">
      <div className="bar-surface">
        <div className="tool-wrap">
          <button className="add-btn" aria-label="Open tools" title="工具" onClick={() => { setMenuOpen((v) => !v); setSubmenu(null) }}>
            +
          </button>
          {menuOpen && (
            <div className="tool-menu" role="menu">
              {submenu === null && (
                <>
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
                    className="menu-item"
                    onClick={() => {
                      setMenuOpen(false)
                      onAddFolder()
                    }}
                  >
                    選擇資料夾匯入
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
                  <button type="button" className="menu-item" onClick={() => setSubmenu('settings')}>閱讀設定…</button>
                  <button type="button" className="menu-item" onClick={() => setSubmenu('history')}>觀看紀錄…</button>
                  <button
                    type="button"
                    className={camouflage ? 'menu-item checked' : 'menu-item'}
                    onClick={() => {
                      onToggleCamouflage()
                      setMenuOpen(false)
                    }}
                  >
                    {camouflage ? '✓ ' : ''}偽裝模式（Ctrl/Cmd+Shift+H）
                  </button>
                </>
              )}
              {submenu === 'settings' && (
                <div>
                  <button className="menu-item" onClick={() => setSubmenu(null)}>← 返回</button>
                  <div className="menu-item">字體： <button className="nav-btn" onClick={() => onAdjustFont(-1)}>-</button> <button className="nav-btn" onClick={() => onAdjustFont(+1)}>+</button></div>
                  <div className="menu-item">行距： <button className="nav-btn" onClick={() => onAdjustLine(-0.1)}>-</button> <button className="nav-btn" onClick={() => onAdjustLine(+0.1)}>+</button></div>
                  <div className="menu-item">寬度： <button className="nav-btn" onClick={() => onAdjustWidth(-80)}>窄</button> <button className="nav-btn" onClick={() => onAdjustWidth(+80)}>寬</button></div>
                </div>
              )}
              {submenu === 'history' && (
                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  <button className="menu-item" onClick={() => setSubmenu(null)}>← 返回</button>
                  {Array.isArray(history) && history.length > 0 ? (
                    history.map((h: any, i: number) => (
                      <button key={i} className="menu-item" onClick={() => { onOpenHistory(h); setMenuOpen(false); setSubmenu(null) }} title={`${h.docName} - ${h.chapterTitle}`}>
                        <span className="file-name">{h.docName}</span>
                        <br />
                        <span style={{ color: '#9aa0a6' }}>{h.chapterTitle || '全文'}</span>
                      </button>
                    ))
                  ) : (
                    <div className="menu-item" style={{ color: '#9aa0a6' }}>尚無紀錄</div>
                  )}
                </div>
              )}
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
