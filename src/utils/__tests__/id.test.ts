import { describe, it, expect } from 'vitest'
import { generateId } from '../id'

describe('generateId', () => {
  it('generates unique ids', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 1000; i++) ids.add(generateId())
    expect(ids.size).toBe(1000)
  })

  it('matches UUID v4 pattern', () => {
    const id = generateId()
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  })
})

