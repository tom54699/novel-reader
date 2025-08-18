import { describe, it, expect } from 'vitest'
import { readFileAsText } from '../file'

describe('readFileAsText', () => {
  it('reads text content as utf-8', async () => {
    const content = 'Hello world! 你好'
    const file = new File([content], 'hello.txt', { type: 'text/plain' })
    const text = await readFileAsText(file)
    expect(text).toBe(content)
  })
})

