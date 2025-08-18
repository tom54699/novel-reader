import { describe, it, expect } from 'vitest'
import { escapeRegExp, searchInText } from '../search'

describe('escapeRegExp', () => {
  it('escapes special characters', () => {
    expect(escapeRegExp('a+b*c?')).toBe('a\\+b\\*c\\?')
  })
})

describe('searchInText', () => {
  it('returns empty for empty query', () => {
    expect(searchInText('hello', '')).toEqual([])
  })

  it('finds case-insensitive matches', () => {
    const hits = searchInText('Hello hello HELLO', 'hello')
    expect(hits.length).toBe(3)
    expect(hits[0]).toEqual({ start: 0, end: 5 })
  })

  it('finds multiple occurrences', () => {
    const hits = searchInText('aaaa', 'aa')
    expect(hits).toEqual([
      { start: 0, end: 2 },
      { start: 2, end: 4 },
    ])
  })
})

