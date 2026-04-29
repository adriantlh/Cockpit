import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'
import { ThemeProvider } from '../context/ThemeContext'

describe('Cockpit Smoke Test', () => {
  it('renders the loading state initially', () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>
    )
    expect(screen.getByText(/Initializing Systems/i)).toBeDefined()
  })
})
