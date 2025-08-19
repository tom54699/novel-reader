export interface HistoryEntry {
  docId: string
  docName: string
  chapterIndex: number | null
  chapterTitle: string
  ts: number
}

const KEY = 'novelReader.history'

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr.filter((x) => x && typeof x.docId === 'string' && 'ts' in x)
  } catch {
    return []
  }
}

export function saveHistory(list: HistoryEntry[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {}
}

export function upsertHistory(list: HistoryEntry[], entry: HistoryEntry, max = 50): HistoryEntry[] {
  const key = `${entry.docId}|${entry.chapterIndex ?? -1}`
  const filtered = list.filter((e) => `${e.docId}|${e.chapterIndex ?? -1}` !== key)
  const next = [{ ...entry }, ...filtered]
  return next.slice(0, max)
}

