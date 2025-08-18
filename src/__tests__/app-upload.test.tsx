import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

describe('App upload flow', () => {
  it('adds uploaded .txt to top of list and shows content', async () => {
    render(<App />)

    // Click the + button to trigger input (we will then manually fire change)
    await userEvent.click(screen.getByRole('button', { name: /add file/i }))

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['Hello from test'], 'testfile.txt', { type: 'text/plain' })
    // Simulate user picking a file
    await userEvent.upload(input, file)

    // Sidebar shows the file name at top
    const items = document.querySelectorAll('.file-item')
    expect(items.length).toBe(1)
    expect(within(items[0] as HTMLElement).getByText(/testfile/)).toBeTruthy()

    // Content shows the file text
    expect(screen.getByText('Hello from test')).toBeTruthy()
  })
})

