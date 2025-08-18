import { describe, it, expect } from 'vitest'
import { validateFile } from '../file'

function makeFile(name: string, size: number, type = 'text/plain') {
  return new File([new Uint8Array(size)], name, { type })
}

describe('validateFile', () => {
  it('accepts valid .txt under 5MB', () => {
    const f = makeFile('hello.txt', 10)
    expect(validateFile(f)).toEqual({ valid: true })
  })

  it('rejects non-txt files', () => {
    const f = makeFile('hello.md', 10)
    expect(validateFile(f)).toEqual({ valid: false, error: '僅支援 .txt' })
  })

  it('rejects files over 5MB', () => {
    const f = makeFile('big.txt', 5 * 1024 * 1024 + 1)
    expect(validateFile(f)).toEqual({ valid: false, error: '檔案過大' })
  })
})

