import { useState } from 'react'
import axios from 'axios'
import { RefreshCw } from 'lucide-react'

// Hooks
import { useDashboard } from './hooks/useDashboard'

// Types
import type { Event } from './types'

// Components
import { DashboardHeader } from './components/dashboard/DashboardHeader'
import { DashboardGrid } from './components/dashboard/DashboardGrid'
import { SettingsView } from './components/dashboard/SettingsView'

/**
 * Main Cockpit Application Entry Point.
 */
function App() {
  const { data, loading, isRefreshing, fetchDashboard } = useDashboard()
  const [showSettings, setShowSettings] = useState(false)
  
  const [newEvent, setNewEvent] = useState({ name: '', date: '' })
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [trainingPlan, setTrainingPlan] = useState<Record<string, string>>({
    Monday: '', Tuesday: '', Wednesday: '', Thursday: '', Friday: '', Saturday: '', Sunday: ''
  })
  const [refreshingManual, setRefreshingManual] = useState(false)

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:8000/api/events', newEvent)
      setNewEvent({ name: '', date: '' })
      fetchDashboard()
    } catch (error) {
      alert('Error adding event.')
    }
  }

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    try {
      await axios.delete(`http://localhost:8000/api/events/${id}`)
      fetchDashboard()
    } catch (error) {
      alert('Error deleting event.')
    }
  }

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEvent?.id) return
    try {
      const { id, days_left, ...updateData } = editingEvent
      await axios.put(`http://localhost:8000/api/events/${id}`, updateData)
      setEditingEvent(null)
      fetchDashboard()
    } catch (error) {
      alert('Error updating event.')
    }
  }

  const handleUpdatePlan = async () => {
    try {
      await axios.post('http://localhost:8000/api/plans', trainingPlan)
      alert('Training plan updated!')
      fetchDashboard()
    } catch (error) {
      alert('Error updating plan.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-background text-foreground">
        <div className="animate-pulse text-2xl font-black uppercase tracking-tighter">
          Initializing Systems...
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full bg-background text-foreground p-4 md:p-6 font-sans transition-colors duration-300 flex flex-col overflow-hidden">
      
      {(isRefreshing || refreshingManual) && (
        <div className="fixed top-0 left-0 w-full z-[100] animate-in fade-in duration-300">
          <div className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.3em] py-1 px-4 flex items-center justify-center gap-2">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Synchronizing Mission Telemetry...</span>
          </div>
        </div>
      )}

      <DashboardHeader 
        isRefreshing={isRefreshing || refreshingManual}
        showSettings={showSettings}
        onRefresh={() => fetchDashboard(true)}
        onToggleSettings={() => setShowSettings(!showSettings)}
      />

      <main className="flex-1 overflow-hidden">
        {showSettings ? (
          <SettingsView 
            data={data}
            newEvent={newEvent}
            setNewEvent={setNewEvent}
            editingEvent={editingEvent}
            setEditingEvent={setEditingEvent}
            trainingPlan={trainingPlan}
            setTrainingPlan={setTrainingPlan}
            isRefreshing={refreshingManual}
            setIsRefreshing={setRefreshingManual}
            onRefresh={fetchDashboard}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
            onUpdateEvent={handleUpdateEvent}
            onUpdatePlan={handleUpdatePlan}
          />
        ) : (
          data && <DashboardGrid data={data} />
        )}
      </main>
    </div>
  )
}

export default App
