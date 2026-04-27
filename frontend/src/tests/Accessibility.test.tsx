import { expect, test, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ThemeProvider } from '../context/ThemeContext'
import App from '../App'
import axios from 'axios'
import * as matchers from 'vitest-axe'
import { axe } from 'vitest-axe'

expect.extend(matchers)
vi.mock('axios')

test('Dashboard should have no accessibility violations', async () => {
  (axios.get as any).mockResolvedValue({
    data: {
      countdown: [{ id: '1', name: 'Race', days_left: 10, date: '2026-05-01' }],
      training_today: 'Rest',
      calendar_events: [],
      gmail_highlights: []
    }
  })

  const { container } = render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  )

  await waitFor(() => {
    expect(screen.queryByText(/Loading Cockpit/i)).not.toBeInTheDocument()
  })

  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
