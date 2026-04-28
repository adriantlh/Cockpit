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

interface MissionProfile {
  title: string
  type: string
  duration_mins: number
  distance_km: number
  intensity_zone: string
  briefing: string
}

interface DashboardData {
  countdown: Event[]
  training_today: MissionProfile
  calendar_events: any[]
  gmail_highlights: { id: string; snippet: string }[]
  environmental: EnvironmentalData | null
  training_history: any[]
}

const ScheduleItem = ({ event }: { event: any }) => {
  const eventDate = event.start?.dateTime ? new Date(event.start.dateTime) : (event.start?.date ? new Date(event.start.date) : null);
  const isAllDay = !event.start?.dateTime;
  const now = new Date();
  
  const diffMs = eventDate ? eventDate.getTime() - now.getTime() : 0;
  const diffHours = diffMs / (1000 * 60 * 60);
  const isUrgent = !isAllDay && diffHours > 0 && diffHours < 2;
  const hasStarted = !isAllDay && diffMs < 0;

  const getRelativeTime = () => {
    if (isAllDay) return 'All Day';
    if (hasStarted) return 'Active Now';
    const hours = Math.floor(diffHours);
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `in ${hours}h ${mins}m` : `in ${mins}m`;
  };

  return (
    <article 
      className={`relative group p-4 border-l-4 rounded-r-2xl transition-all duration-300 ${
        isUrgent 
          ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)] ring-1 ring-amber-500/20' 
          : hasStarted
            ? 'bg-emerald-500/10 border-emerald-500 opacity-80'
            : 'bg-surface-hover border-blue-500 hover:bg-surface'
      }`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className={`text-sm font-black leading-tight mb-1 ${isUrgent ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
            {event.summary}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-muted uppercase tracking-tighter">
              {isAllDay ? 'Block' : eventDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className={`text-[11px] font-mono font-black uppercase ${
              isUrgent ? 'text-amber-500 animate-pulse' : hasStarted ? 'text-emerald-500' : 'text-blue-500'
            }`}>
              {getRelativeTime()}
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-[10px] font-black text-muted/50 uppercase tracking-widest leading-none">
            {eventDate?.toLocaleDateString('en-SG', { day: '2-digit' })}
          </p>
          <p className="text-[10px] font-bold text-muted/50 uppercase tracking-tighter">
            {eventDate?.toLocaleDateString('en-SG', { month: 'short' })}
          </p>
        </div>
      </div>

      {/* Fuel Gauge (Progress bar for urgent items) */}
      {isUrgent && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-500/20 overflow-hidden rounded-b-2xl">
          <div 
            className="h-full bg-amber-500 transition-all duration-1000" 
            style={{ width: `${Math.max(0, 100 - (diffHours * 50))}%` }}
          />
        </div>
      )}
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

  // Helper to group events
  const groupedEvents = () => {
    if (!data?.calendar_events) return { today: [], tomorrow: [], upcoming: [] };
    const today = new Date().toDateString();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toDateString();

    return data.calendar_events.reduce((acc: any, event: any) => {
      const date = event.start?.dateTime ? new Date(event.start.dateTime) : (event.start?.date ? new Date(event.start.date) : null);
      if (!date) return acc;
      
      const dateStr = date.toDateString();
      if (dateStr === today) acc.today.push(event);
      else if (dateStr === tomorrowStr) acc.tomorrow.push(event);
      else acc.upcoming.push(event);
      
      return acc;
    }, { today: [], tomorrow: [], upcoming: [] });
  };

  const groups = groupedEvents();

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
                    className="w-full flex items-center justify-center gap-2 bg-surface border border-border hover:bg-surface-hover text-foreground py-3 rounded-xl transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500"
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
                      } catch (e) { alert('AI Generation failed. Check Z.ai API key.'); }
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-surface border border-border hover:bg-surface-hover text-foreground py-3 rounded-xl transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500"
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
                    className="w-full flex items-center justify-center gap-2 bg-surface border border-border hover:bg-surface-hover text-foreground py-3 rounded-xl transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500"
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
              
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-600/70 dark:text-emerald-500/70 mb-1 font-black">Objective</p>
                  <h3 className="text-3xl font-black text-foreground leading-tight tracking-tighter uppercase">{data?.training_today.title}</h3>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="p-3 bg-surface-hover border border-border rounded-xl text-center">
                    <p className="text-[10px] uppercase tracking-widest text-muted font-bold mb-1">Time</p>
                    <p className="text-xl font-black text-foreground">{data?.training_today.duration_mins}m</p>
                  </div>
                  <div className="p-3 bg-surface-hover border border-border rounded-xl text-center">
                    <p className="text-[10px] uppercase tracking-widest text-muted font-bold mb-1">Dist</p>
                    <p className="text-xl font-black text-foreground">{data?.training_today.distance_km}km</p>
                  </div>
                  <div className="p-3 bg-surface-hover border border-border rounded-xl text-center">
                    <p className="text-[10px] uppercase tracking-widest text-muted font-bold mb-1">Zone</p>
                    <p className="text-sm font-black text-foreground leading-tight h-7 flex items-center justify-center">{data?.training_today.intensity_zone}</p>
                  </div>
                </div>

                <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 mb-6">
                  <p className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-black mb-3">Tactical Briefing</p>
                  <p className="text-sm leading-relaxed text-foreground/90 italic">
                    "{data?.training_today.briefing}"
                  </p>
                </div>

                <div className="mt-auto flex gap-2 text-muted text-[10px] bg-background border border-border px-4 py-2 rounded-full font-mono uppercase tracking-wider justify-center">
                  <Clock className="w-3 h-3" />
                  <span>Optimum Window: 07:00 - 08:30</span>
                </div>
              </div>
            </section>

            <section className="card shadow-md flex flex-col h-full overflow-hidden">
              <div className="flex items-center gap-3 mb-6 border-b border-border pb-3">
                <Calendar className="text-blue-600 dark:text-blue-400 w-6 h-6" />
                <h2 className="text-xl font-semibold uppercase tracking-tight">Timeline</h2>
              </div>
              
              <div className="space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                {/* Today */}
                <div className="relative">
                  <div className="sticky top-0 z-10 bg-surface/80 backdrop-blur-sm py-1 mb-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-ping" />
                      Today
                    </p>
                  </div>
                  <div className="space-y-3 relative border-l border-slate-200 dark:border-slate-800 ml-1.5 pl-6">
                    {groups.today.length > 0 ? (
                      groups.today.map((event: any, idx: number) => <ScheduleItem key={`today-${idx}`} event={event} />)
                    ) : (
                      <p className="text-xs text-muted italic py-2">No missions today.</p>
                    )}
                  </div>
                </div>

                {/* Tomorrow */}
                <div className="relative">
                  <div className="sticky top-0 z-10 bg-surface/80 backdrop-blur-sm py-1 mb-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-muted rounded-full" />
                      Tomorrow
                    </p>
                  </div>
                  <div className="space-y-3 relative border-l border-slate-200 dark:border-slate-800 ml-1.5 pl-6">
                    {groups.tomorrow.length > 0 ? (
                      groups.tomorrow.map((event: any, idx: number) => <ScheduleItem key={`tmr-${idx}`} event={event} />)
                    ) : (
                      <p className="text-xs text-muted italic py-2">Clear horizon.</p>
                    )}
                  </div>
                </div>

                {/* Upcoming */}
                {groups.upcoming.length > 0 && (
                  <div className="relative">
                    <div className="sticky top-0 z-10 bg-surface/80 backdrop-blur-sm py-1 mb-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/50 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-muted/50 rounded-full" />
                        Upcoming
                      </p>
                    </div>
                    <div className="space-y-3 relative border-l border-slate-200 dark:border-slate-800 ml-1.5 pl-6">
                      {groups.upcoming.map((event: any, idx: number) => <ScheduleItem key={`up-${idx}`} event={event} />)}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="card shadow-md">
              <div className="flex items-center gap-3 mb-6 border-b border-border pb-3">
                <Mail className="text-purple-600 dark:text-purple-400 w-6 h-6" />
                <h2 className="text-xl font-semibold uppercase tracking-tight">Comms Intel</h2>
              </div>
              <div className="space-y-4">
                {data?.gmail_highlights.map((msg, idx) => (
                  <article key={idx} className="bg-surface-hover border border-border p-4 rounded-xl hover:shadow-sm transition-all duration-300">
                    <p className="text-[11px] text-foreground leading-relaxed italic line-clamp-3">"{msg.snippet}..."</p>
                  </article>
                ))}
                {(!data?.gmail_highlights || data.gmail_highlights.length === 0) && (
                  <p className="text-muted italic text-center py-6 text-xs">No mission-critical messages.</p>
                )}
              </div>
            </section>

            {/* Training History (Mission Log) */}
            <section className="card shadow-md">
              <div className="flex items-center gap-3 mb-6 border-b border-border pb-3">
                <Trophy className="text-orange-600 dark:text-orange-400 w-6 h-6" />
                <h2 className="text-xl font-semibold uppercase tracking-tight">Mission Log</h2>
              </div>
              <div className="space-y-4">
                {data?.training_history && data.training_history.length > 0 ? (
                  data.training_history.map((workout, idx) => (
                    <article key={idx} className="p-3 bg-surface-hover border border-border rounded-xl">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-xs font-bold truncate flex-1 mr-2">{workout.name}</p>
                        <p className="text-[10px] font-mono text-muted uppercase whitespace-nowrap">
                          {new Date(workout.start_date).toLocaleDateString('en-SG', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                      <div className="flex gap-3 mt-2">
                        <div className="text-[10px] uppercase font-bold text-orange-500">
                          {Math.round(workout.distance / 100) / 10}km
                        </div>
                        <div className="text-[10px] uppercase font-bold text-muted">
                          {Math.round(workout.moving_time / 60)}m
                        </div>
                        {workout.suffer_score && (
                          <div className="text-[10px] uppercase font-black text-red-500 ml-auto">
                            SR {workout.suffer_score}
                          </div>
                        )}
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="text-muted italic text-center py-6 text-xs">No records found. Run sync.</p>
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
