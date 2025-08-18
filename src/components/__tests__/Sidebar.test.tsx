import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sidebar } from '../Sidebar'

describe('Sidebar', () => {
  const docs = [
    { id: '1', name: 'short.txt', size: 10, content: '' },
    { id: '2', name: 'averyveryverylongfilename_that_should_be_truncated.txt', size: 10, content: '' },
  ]

  it('renders files and highlights active', () => {
    render(<Sidebar docs={docs} activeId={'1'} onSelectDoc={() => {}} />)
    const items = screen.getAllByRole('listitem')
    expect(items.length).toBe(2)
    expect(items[0].className).toContain('active')
  })

  it('truncates long names in the middle', () => {
    render(<Sidebar docs={docs} activeId={null} onSelectDoc={() => {}} />)
    expect(screen.getByText(/averyvery/).textContent).toMatch(/…/)
  })

  it('invokes onSelectDoc when clicked', async () => {
    const onSelect = vi.fn()
    render(<Sidebar docs={docs} activeId={null} onSelectDoc={onSelect} />)
    await userEvent.click(screen.getAllByRole('listitem')[1])
    expect(onSelect).toHaveBeenCalledWith('2')
  })
})

