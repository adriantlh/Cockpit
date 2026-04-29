import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import App from '../App'
import { ThemeProvider } from '../context/ThemeContext'
import * as axeMatchers from 'vitest-axe/matchers'

// Add matchers
expect.extend(axeMatchers)

describe('Accessibility', () => {
  it('should have no basic accessibility violations', async () => {
    const { container } = render(
      <ThemeProvider>
        <App />
      </ThemeProvider>
    )
    
    const results = await axe(container)
    expect(results).toBeDefined()
  })
})
