import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BottomBar } from '../BottomBar'

describe('BottomBar', () => {
  it('shows search placeholder', () => {
    render(<BottomBar searchState={{ query: '' }} onSearch={() => {}} onNavigateSearch={() => {}} onAddFile={() => {}} />)
    const input = screen.getByPlaceholderText('Search in file')
    expect(input).toBeTruthy()
  })

  it('triggers add file on + click', async () => {
    const onAdd = vi.fn()
    render(<BottomBar searchState={{ query: '' }} onSearch={() => {}} onNavigateSearch={() => {}} onAddFile={onAdd} />)
    await userEvent.click(screen.getByRole('button', { name: /add file/i }))
    expect(onAdd).toHaveBeenCalled()
  })
})

