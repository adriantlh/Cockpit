import React from 'react'
import { Plus, Trophy, Save, Activity, ShieldAlert, Check, X, Edit2, Trash2 } from 'lucide-react'
import axios from 'axios'
import type { DashboardData, Event } from '../../types'

interface SettingsViewProps {
  data: DashboardData | null
  newEvent: { name: string; date: string }
  setNewEvent: (event: { name: string; date: string }) => void
  editingEvent: Event | null
  setEditingEvent: (event: Event | null) => void
  trainingPlan: Record<string, string>
  setTrainingPlan: (plan: Record<string, string>) => void
  isRefreshing: boolean
  setIsRefreshing: (val: boolean) => void
  onRefresh: (force?: boolean) => void
  onAddEvent: (e: React.FormEvent) => void
  onDeleteEvent: (id: string) => void
  onUpdateEvent: (e: React.FormEvent) => void
  onUpdatePlan: () => void
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  data, newEvent, setNewEvent, editingEvent, setEditingEvent, trainingPlan, setTrainingPlan,
  isRefreshing, setIsRefreshing, onRefresh, onAddEvent, onDeleteEvent, onUpdateEvent, onUpdatePlan
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="space-y-4">
        <div className="card shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="text-amber-600 dark:text-amber-400 w-5 h-5" />
            <h2 className="text-lg font-semibold">Add North Star</h2>
          </div>
          <form onSubmit={onAddEvent} className="space-y-3">
            <input 
              type="text" value={newEvent.name} onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
              className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm" placeholder="Event Name" required
            />
            <input 
              type="date" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
              className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm" required
            />
            <button type="submit" className="w-full bg-amber-600 dark:bg-amber-500 text-white font-bold py-1.5 rounded-lg shadow-md text-sm">
              Initialize Target
            </button>
          </form>
        </div>

        <div className="card shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="text-amber-600 dark:text-amber-400 w-5 h-5" />
            <h2 className="text-lg font-semibold">Manage Events</h2>
          </div>
          <div className="space-y-2">
            {data?.countdown.map((event) => (
              <article key={event.id} className="p-2 bg-surface-hover border border-border rounded-lg flex items-center justify-between group">
                {editingEvent && editingEvent.id === event.id ? (
                  <form onSubmit={onUpdateEvent} className="flex gap-2 w-full">
                    <input 
                      type="text" value={editingEvent.name} onChange={(e) => setEditingEvent({...editingEvent, name: e.target.value})}
                      className="bg-background border border-border rounded-md px-2 py-0.5 flex-1 text-xs"
                    />
                    <button type="submit" className="text-emerald-600"><Check className="w-4 h-4" /></button>
                    <button type="button" onClick={() => setEditingEvent(null)} className="text-red-600"><X className="w-4 h-4" /></button>
                  </form>
                ) : (
                  <>
                    <p className="font-bold text-sm">{event.name}</p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingEvent(event)} className="p-1.5 text-muted hover:text-blue-500"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => event.id && onDeleteEvent(event.id)} className="p-1.5 text-muted hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="space-y-4">
        <section className="card shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Save className="text-emerald-600 dark:text-emerald-400 w-5 h-5" />
            <h2 className="text-lg font-semibold">Weekly Mission</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(trainingPlan).map((day) => (
              <div key={day}>
                <label className="block text-[9px] uppercase font-bold text-muted">{day}</label>
                <input 
                  type="text" value={trainingPlan[day]} onChange={(e) => setTrainingPlan({...trainingPlan, [day]: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs"
                />
              </div>
            ))}
          </div>
          <button onClick={onUpdatePlan} className="w-full mt-4 bg-emerald-600 dark:bg-emerald-500 text-white font-bold py-1.5 rounded-lg shadow-md text-sm">
            Sync Mission Plan
          </button>
        </section>

        <section className="card shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="text-blue-600 dark:text-blue-400 w-5 h-5" />
            <h2 className="text-lg font-semibold">Ops Center</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={async () => {
                setIsRefreshing(true);
                try { await axios.get('http://localhost:8000/api/cron/sync-strava'); onRefresh(true); alert('Strava Synced'); }
                catch (e) { alert('Sync failed'); } finally { setIsRefreshing(false); }
              }}
              disabled={isRefreshing}
              className="flex items-center justify-center gap-2 bg-surface border border-border hover:bg-surface-hover py-2 rounded-lg text-xs font-bold"
            >
              <Activity className="w-3.5 h-3.5 text-orange-500" /> Sync Strava
            </button>
            <button 
              onClick={async () => {
                setIsRefreshing(true);
                try { await axios.get('http://localhost:8000/api/cron/generate-plan'); onRefresh(true); alert('AI Generated'); }
                catch (e) { alert('Failed'); } finally { setIsRefreshing(false); }
              }}
              disabled={isRefreshing}
              className="flex items-center justify-center gap-2 bg-surface border border-border hover:bg-surface-hover py-2 rounded-lg text-xs font-bold"
            >
              <Trophy className="w-3.5 h-3.5 text-emerald-500" /> AI Mission
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
