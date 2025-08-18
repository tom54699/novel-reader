export interface Doc {
  id: string
  name: string
  size: number
  content: string
  scrollTop?: number
}

export interface SearchHit {
  start: number
  end: number
}

export interface SearchState {
  query: string
  hits: SearchHit[]
  currentIndex: number
}

export interface AppState {
  docs: Doc[]
  activeId: string | null
  searchState: SearchState
}

