import { useState, useEffect } from 'react'
import axios from 'axios'
import type { DashboardData } from '../types'

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchDashboard = async (force = false) => {
    if (force) setIsRefreshing(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/dashboard?force=${force}`)
      setData(response.data)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  return { data, loading, isRefreshing, fetchDashboard }
}
