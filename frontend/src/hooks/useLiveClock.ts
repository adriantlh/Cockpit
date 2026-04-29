import { useState, useEffect } from 'react'

/**
 * Hook to provide the current time, updating every second.
 */
export const useLiveClock = () => {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return now
}
