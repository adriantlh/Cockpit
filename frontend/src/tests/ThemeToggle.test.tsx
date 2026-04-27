import { expect, test, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeProvider } from '../context/ThemeContext'
import App from '../App'
import axios from 'axios'
import '@testing-library/jest-dom'

vi.mock('axios')

test('Theme toggle changes theme and persists in localStorage', async () => {
  (axios.get as any).mockResolvedValue({
    data: {
      countdown: [],
      training_today: 'Rest',
      calendar_events: [],
      gmail_highlights: []
    }
  })

  render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  )

  // Wait for loading to disappear
  await waitFor(() => {
    expect(screen.queryByText(/Loading Cockpit/i)).not.toBeInTheDocument()
  })

  const toggleBtn = screen.getByLabelText(/Switch to (light|dark) mode/i)
  
  const isInitialDark = toggleBtn.getAttribute('aria-label')?.includes('light mode')
  
  fireEvent.click(toggleBtn)
  
  const expectedTheme = isInitialDark ? 'light' : 'dark'
  expect(localStorage.getItem('theme')).toBe(expectedTheme)
})
