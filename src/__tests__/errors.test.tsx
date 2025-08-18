import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

describe('Error handling', () => {
  it('shows error when non-txt uploaded', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: /add file/i }))
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['bad'], 'bad.csv', { type: 'text/csv' })
    await userEvent.upload(input, file)
    expect(screen.getByRole('alert').textContent).toMatch(/僅支援/)
  })
})

