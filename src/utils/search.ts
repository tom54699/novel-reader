import type { SearchHit } from '../types'

export function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function searchInText(text: string, query: string): SearchHit[] {
  if (!query) return []
  const pattern = new RegExp(escapeRegExp(query), 'gi')
  const hits: SearchHit[] = []
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    hits.push({ start: match.index, end: match.index + match[0].length })
    if (match.index === pattern.lastIndex) pattern.lastIndex++
  }
  return hits
}

