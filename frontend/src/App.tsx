import { useEffect, useState } from 'react'
import axios from 'axios'
import { Calendar, Mail, Trophy, Activity, Clock, Settings, Plus, Save, X, Moon, Sun, Trash2, Edit2, Check, Wind, CloudRain, Thermometer, ShieldAlert } from 'lucide-react'
import { useTheme } from './context/ThemeContext'

interface Event {
  id?: string
  name: string
  days_left: number
  date: string
}

interface EnvironmentalData {
  temp: number
  feels_like: number
  humidity: number
  precipitation: number
  aqi: number
  pm2_5: number
  condition_code: number
}

interface DashboardData {
  countdown: Event[]
  training_today: string
  calendar_events: any[]
  gmail_highlights: { id: string; snippet: string }[]
  environmental: EnvironmentalData | null
}

const ScheduleItem = ({ event }: { event: any }) => {
  const [viewMode, setViewMode] = useState<'time' | 'countdown'>('time');
  const eventDate = event.start?.dateTime ? new Date(event.start.dateTime) : (event.start?.date ? new Date(event.start.date) : null);
  
  const getCountdown = () => {
    if (!eventDate) return 'N/A';
    const diff = eventDate.getTime() - new Date().getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours < 0) return 'Started';
    return `${hours}h ${mins}m to go`;
  };

  return (
    <article 
      onClick={() => setViewMode(viewMode === 'time' ? 'countdown' : 'time')}
      className="border-l-4 border-blue-600 dark:border-blue-500 pl-4 py-2 bg-blue-50/50 dark:bg-blue-900/10 rounded-r-xl cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors group"
    >
      <div className="flex justify-between items-start mb-1">
        <p className="text-sm font-bold leading-snug flex-1">{event.summary}</p>
        <p className="text-[10px] font-mono text-blue-600/70 dark:text-blue-400/70 ml-2 uppercase">
          {eventDate?.toLocaleDateString('en-SG', { day: '2-digit', month: 'short' })}
        </p>
      </div>
      <p className="text-xs text-muted font-mono">
        {viewMode === 'time' ? (
          event.start?.dateTime ? new Date(event.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day'
        ) : (
          <span className="text-blue-600 dark:text-blue-400 font-bold animate-pulse">{getCountdown()}</span>
        )}
      </p>
    </article>
  );
};

function App() {
  const { theme, toggleTheme } = useTheme()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [newEvent, setNewEvent] = useState({ name: '', date: '' })
  const [trainingPlan, setTrainingPlan] = useState<Record<string, string>>({
    Monday: '', Tuesday: '', Wednesday: '', Thursday: '', Friday: '', Saturday: '', Sunday: ''
  })
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/dashboard')
      setData(response.data)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

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
        <div className="animate-pulse text-2xl font-light">Loading Cockpit...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground p-8 font-sans transition-colors duration-300">
      <header className="mb-12 flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">COCKPIT</h1>
          <p className="text-muted font-medium uppercase tracking-widest text-sm">Daily Operations Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block mr-4">
            <p className="text-2xl font-mono text-emerald-600 dark:text-emerald-400">
              {new Date().toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="p-3 bg-surface border border-border rounded-full hover:bg-surface-hover transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 shadow-sm"
          >
            {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            aria-label={showSettings ? "Close settings" : "Open settings"}
            className="p-3 bg-surface border border-border rounded-full hover:bg-surface-hover transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 shadow-sm"
          >
            {showSettings ? <X className="w-6 h-6" /> : <Settings className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <main>
        {showSettings ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="space-y-8">
              <div className="card shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <Plus className="text-amber-600 dark:text-amber-400 w-6 h-6" />
                  <h2 className="text-xl font-semibold">Add North Star</h2>
                </div>
                <form onSubmit={handleAddEvent} className="space-y-4">
                  <div>
                    <label htmlFor="event-name" className="block text-xs uppercase tracking-widest text-muted mb-1 font-bold">Event Name</label>
                    <input 
                      id="event-name"
                      type="text" 
                      value={newEvent.name}
                      onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      placeholder="e.g. 2XU Half Marathon"
                      required
                      aria-label="Event Name"
                    />
                  </div>
                  <div>
                    <label htmlFor="event-date" className="block text-xs uppercase tracking-widest text-muted mb-1 font-bold">Date</label>
                    <input 
                      id="event-date"
                      type="date" 
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      required
                      aria-label="Event Date"
                    />
                  </div>
                  <button type="submit" className="w-full bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 dark:hover:bg-amber-600 text-white dark:text-slate-950 font-bold py-2 rounded-xl transition-colors shadow-md">
                    Initialize Target
                  </button>
                </form>
              </div>

              <div className="card shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <Trophy className="text-amber-600 dark:text-amber-400 w-6 h-6" />
                  <h2 className="text-xl font-semibold">Manage Events</h2>
                </div>
                <div className="space-y-3">
                  {data?.countdown.map((event) => (
                    <article key={event.id} className="p-4 bg-surface-hover border border-border rounded-xl flex items-center justify-between group">
                      {editingEvent?.id === event.id ? (
                        <form onSubmit={handleUpdateEvent} className="flex gap-2 w-full">
                          <input 
                            type="text" 
                            value={editingEvent.name}
                            onChange={(e) => setEditingEvent({...editingEvent, name: e.target.value})}
                            className="bg-background border border-border rounded-lg px-2 py-1 flex-1 text-sm"
                            aria-label="Edit Event Name"
                          />
                          <input 
                            type="date" 
                            value={editingEvent.date}
                            onChange={(e) => setEditingEvent({...editingEvent, date: e.target.value})}
                            className="bg-background border border-border rounded-lg px-2 py-1 text-sm"
                            aria-label="Edit Event Date"
                          />
                          <button type="submit" aria-label="Save changes" className="p-1 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded">
                            <Check className="w-5 h-5" />
                          </button>
                          <button type="button" onClick={() => setEditingEvent(null)} aria-label="Cancel" className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
                            <X className="w-5 h-5" />
                          </button>
                        </form>
                      ) : (
                        <>
                          <div>
                            <p className="font-bold">{event.name}</p>
                            <p className="text-xs text-muted">{event.date}</p>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => setEditingEvent(event)}
                              aria-label={`Edit ${event.name}`}
                              className="p-2 text-muted hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => event.id && handleDeleteEvent(event.id)}
                              aria-label={`Delete ${event.name}`}
                              className="p-2 text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </article>
                  ))}
                  {(!data?.countdown || data.countdown.length === 0) && (
                    <p className="text-muted italic text-center py-4">No events found.</p>
                  )}
                </div>
              </div>
            </section>

            <div className="space-y-8 h-fit">
              <section className="card shadow-lg h-fit">
                <div className="flex items-center gap-3 mb-6">
                  <Save className="text-emerald-600 dark:text-emerald-400 w-6 h-6" />
                  <h2 className="text-xl font-semibold">Update Weekly Mission</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.keys(trainingPlan).map((day) => (
                    <div key={day}>
                      <label htmlFor={`day-${day}`} className="block text-xs uppercase tracking-widest text-muted mb-1 font-bold">{day}</label>
                      <input 
                        id={`day-${day}`}
                        type="text" 
                        placeholder="e.g. Rest or Tempo"
                        value={trainingPlan[day]}
                        onChange={(e) => setTrainingPlan({...trainingPlan, [day]: e.target.value})}
                        className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        aria-label={`${day} Workout`}
                      />
                    </div>
                  ))}
                </div>
                <button 
                  onClick={handleUpdatePlan}
                  className="w-full mt-6 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white dark:text-slate-950 font-bold py-2 rounded-xl transition-colors shadow-md"
                >
                  Sync Mission Plan
                </button>
              </section>

              <section className="card shadow-lg h-fit">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldAlert className="text-blue-600 dark:text-blue-400 w-6 h-6" />
                  <h2 className="text-xl font-semibold">Ops Center</h2>
                </div>
                <div className="space-y-4">
                  <button 
                    onClick={async () => {
                      try {
                        await axios.get('http://localhost:8000/api/cron/sync-strava');
                        alert('Strava activities synchronized!');
                        fetchDashboard();
                      } catch (e) { alert('Sync failed. Check Firestore setup.'); }
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-foreground py-3 rounded-xl transition-all border border-border shadow-sm"
                  >
                    <Activity className="w-4 h-4 text-orange-500" />
                    <span className="font-bold text-sm">Sync Strava Telemetry</span>
                  </button>

                  <button 
                    onClick={async () => {
                      try {
                        await axios.get('http://localhost:8000/api/cron/generate-plan');
                        alert('AI Mission generated!');
                        fetchDashboard();
                      } catch (e) { alert('AI Generation failed. Check Gemini API key.'); }
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-foreground py-3 rounded-xl transition-all border border-border shadow-sm"
                  >
                    <Trophy className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-sm">Regenerate AI Mission</span>
                  </button>

                  <button 
                    onClick={async () => {
                      try {
                        await axios.get('http://localhost:8000/api/cron/send-summary');
                        alert('Briefing sent to your inbox!');
                      } catch (e) { alert('Push failed. Check Gmail API.'); }
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-foreground py-3 rounded-xl transition-all border border-border shadow-sm"
                  >
                    <Mail className="w-4 h-4 text-purple-500" />
                    <span className="font-bold text-sm">Send Push Briefing</span>
                  </button>
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            <section className="card shadow-md">
              <div className="flex items-center gap-3 mb-6 border-b border-border pb-3">
                <Trophy className="text-amber-600 dark:text-amber-400 w-6 h-6" />
                <h2 className="text-xl font-semibold uppercase tracking-tight">North Stars</h2>
              </div>
              <div className="space-y-4">
                {data?.countdown.map((event) => (
                  <article key={event.id} className="flex justify-between items-center p-4 bg-surface-hover border border-border rounded-xl shadow-sm">
                    <div>
                      <p className="font-bold text-lg">{event.name}</p>
                      <p className="text-xs text-muted font-mono">{event.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-amber-600 dark:text-amber-500 tracking-tighter">T-{event.days_left}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Days to Go</p>
                    </div>
                  </article>
                ))}
                {(!data?.countdown || data.countdown.length === 0) && (
                  <p className="text-muted italic text-center py-6">No target events set.</p>
                )}
              </div>
            </section>

            <section className="card shadow-md border-emerald-200 dark:border-emerald-900 ring-2 ring-emerald-500/10">
              <div className="flex items-center gap-3 mb-6 border-b border-border pb-3">
                <Activity className="text-emerald-600 dark:text-emerald-400 w-6 h-6" />
                <h2 className="text-xl font-semibold uppercase tracking-tight text-emerald-700 dark:text-emerald-400">Today's Mission</h2>
              </div>
              <div className="flex flex-col items-center justify-center py-10">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-600/70 dark:text-emerald-500/70 mb-2 font-black">Current Objective</p>
                <p className="text-5xl font-black text-foreground text-center mb-6 leading-tight tracking-tighter uppercase">{data?.training_today}</p>
                <div className="flex gap-2 text-muted text-xs bg-background border border-border px-4 py-2 rounded-full font-mono uppercase tracking-wider">
                  <Clock className="w-4 h-4" />
                  <span>Optimum Window: 07:00 - 08:30</span>
                </div>
              </div>
            </section>

            <section className="card shadow-md">
              <div className="flex items-center gap-3 mb-6 border-b border-border pb-3">
                <Calendar className="text-blue-600 dark:text-blue-400 w-6 h-6" />
                <h2 className="text-xl font-semibold uppercase tracking-tight">Schedule</h2>
              </div>
              <div className="space-y-4">
                {data?.calendar_events.map((event, idx) => (
                  <ScheduleItem key={idx} event={event} />
                ))}
                {(!data?.calendar_events || data.calendar_events.length === 0) && (
                  <p className="text-muted italic text-center py-6">No meetings today.</p>
                )}
              </div>
            </section>

            <section className="lg:col-span-2 card shadow-md">
              <div className="flex items-center gap-3 mb-6 border-b border-border pb-3">
                <Mail className="text-purple-600 dark:text-purple-400 w-6 h-6" />
                <h2 className="text-xl font-semibold uppercase tracking-tight">Comms Intelligence</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {data?.gmail_highlights.map((msg, idx) => (
                  <article key={idx} className="bg-surface-hover border border-border p-5 rounded-xl hover:shadow-md transition-all duration-300">
                    <p className="text-sm text-foreground leading-relaxed italic border-l-2 border-purple-400 pl-4 py-1">"{msg.snippet}..."</p>
                  </article>
                ))}
                {(!data?.gmail_highlights || data.gmail_highlights.length === 0) && (
                  <p className="text-muted italic text-center py-6">No mission-critical messages.</p>
                )}
              </div>
            </section>

            {/* Environmental Intel */}
            <section className="card shadow-md">
              <div className="flex items-center gap-3 mb-6 border-b border-border pb-3">
                <Wind className="text-cyan-600 dark:text-cyan-400 w-6 h-6" />
                <h2 className="text-xl font-semibold uppercase tracking-tight">Environmental Intel</h2>
              </div>
              {data?.environmental ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-cyan-50/50 dark:bg-cyan-900/10 rounded-xl border border-cyan-100 dark:border-cyan-900/30">
                    <div>
                      <p className="text-3xl font-black tracking-tighter">{data.environmental.temp}°C</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Feels like {data.environmental.feels_like}°C</p>
                    </div>
                    <Thermometer className="text-cyan-600 dark:text-cyan-400 w-10 h-10" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-surface-hover border border-border rounded-xl">
                      <p className="text-[10px] uppercase tracking-widest text-muted font-bold mb-1">AQI Index</p>
                      <div className="flex items-center gap-2">
                        <ShieldAlert className={`w-4 h-4 ${data.environmental.aqi > 50 ? 'text-amber-500' : 'text-emerald-500'}`} />
                        <p className="text-xl font-black">{data.environmental.aqi}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-surface-hover border border-border rounded-xl">
                      <p className="text-[10px] uppercase tracking-widest text-muted font-bold mb-1">Precipitation</p>
                      <div className="flex items-center gap-2">
                        <CloudRain className="text-blue-500 w-4 h-4" />
                        <p className="text-xl font-black">{data.environmental.precipitation}mm</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-surface-hover border border-border rounded-xl text-center">
                    <p className="text-xs font-bold text-foreground">
                      {data.environmental.aqi > 100 ? '⚠️ High Pollution: Consider Indoor Training' : 
                       data.environmental.precipitation > 2 ? '🌧️ Heavy Rain: Adjust Gear' : 
                       '✅ Conditions Optimal for Deployment'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted italic text-center py-6">Telemetry offline.</p>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
