import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ContentView } from '../ContentView'

describe('ContentView', () => {
  it('shows placeholder when no doc', () => {
    render(<ContentView doc={null} searchState={{ query: '', hits: [], currentIndex: 0 }} onScroll={() => {}} />)
    expect(screen.getByText(/Upload a .txt file/i)).toBeTruthy()
  })

  it('renders the entire text in a single block', () => {
    const content = 'para1 line1\nline2\n\n\npara2\nlineB'
    render(
      <ContentView
        doc={{ id: '1', name: 'a.txt', size: 1, content }}
        searchState={{ query: '', hits: [], currentIndex: 0 }}
        onScroll={() => {}}
      />,
    )
    const bubbles = document.querySelectorAll('.bubble')
    expect(bubbles.length).toBe(1)
    expect(document.querySelector('.text-content')?.textContent).toContain('para1')
    expect(document.querySelector('.text-content')?.textContent).toContain('para2')
  })
})
