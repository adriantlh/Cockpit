import React from 'react'
import { Trophy, Activity, Clock, Calendar, Wind, Thermometer } from 'lucide-react'
import type { DashboardData } from '../../types'
import { ScheduleItem } from './ScheduleItem'
import { CommsIntelCard } from './CommsIntelCard'
import { groupCalendarEvents } from '../../utils/eventHelpers'

interface DashboardGridProps {
  data: DashboardData
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ data }) => {
  const groups = groupCalendarEvents(data.calendar_events);

  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-500">
      
      {/* North Stars */}
      <section className="card shadow-md flex flex-col h-full overflow-hidden">
        <div className="flex-none flex items-center gap-2 mb-3 border-b border-border pb-1.5">
          <Trophy className="text-amber-600 dark:text-amber-400 w-5 h-5" />
          <h2 className="text-lg font-semibold uppercase tracking-tight">North Stars</h2>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
          {data.countdown.map((event, idx) => (
            <article key={event.id || idx} className="flex justify-between items-center p-2 bg-surface-hover border border-border rounded-lg shadow-sm">
              <div>
                <p className="font-bold text-sm">{event.name}</p>
                <p className="text-[10px] text-muted font-mono">{event.date}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-amber-600 dark:text-amber-500 tracking-tighter">T-{event.days_left}</p>
                <p className="text-[8px] uppercase tracking-widest text-muted font-bold">Days</p>
              </div>
            </article>
          ))}
          {(!data.countdown || data.countdown.length === 0) && (
            <p className="text-muted italic text-center py-4 text-xs">No targets set.</p>
          )}
        </div>
      </section>

      {/* Today's Mission */}
      <section className="card shadow-md border-emerald-200 dark:border-emerald-900 ring-2 ring-emerald-500/10 relative overflow-hidden flex flex-col h-full">
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-full border shadow-sm ${
            data.plan_metadata?.source === 'ai' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 animate-pulse'
          }`}>
            {data.plan_metadata?.source === 'ai' ? `${data.plan_metadata?.model || 'GLM'}` : 'Fallback'}
          </span>
        </div>

        <div className="flex-none flex items-center gap-2 mb-3 border-b border-border pb-1.5">
          <Activity className="text-emerald-600 dark:text-emerald-400 w-5 h-5" />
          <h2 className="text-lg font-semibold uppercase tracking-tight text-emerald-700 dark:text-emerald-400">Today's Mission</h2>
        </div>
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-none mb-3">
            <p className="text-[9px] uppercase tracking-[0.3em] text-emerald-600/70 dark:text-emerald-500/70 mb-0.5 font-black">Objective</p>
            <h3 className="text-xl font-black text-foreground leading-tight tracking-tighter uppercase line-clamp-2">{data.training_today.title}</h3>
          </div>

          <div className="flex-none grid grid-cols-3 gap-2 mb-3">
            <div className="p-2 bg-surface-hover border border-border rounded-lg text-center">
              <p className="text-[8px] uppercase tracking-widest text-muted font-bold">Time</p>
              <p className="text-base font-black text-foreground">{data.training_today.duration_mins}m</p>
            </div>
            <div className="p-2 bg-surface-hover border border-border rounded-lg text-center">
              <p className="text-[8px] uppercase tracking-widest text-muted font-bold">Dist</p>
              <p className="text-base font-black text-foreground">{data.training_today.distance_km}km</p>
            </div>
            <div className="p-2 bg-surface-hover border border-border rounded-lg text-center">
              <p className="text-[8px] uppercase tracking-widest text-muted font-bold">Zone</p>
              <p className="text-xs font-black text-foreground leading-tight h-5 flex items-center justify-center">{data.training_today.intensity_zone}</p>
            </div>
          </div>

          <div className="flex-1 bg-emerald-50/50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30 mb-3 overflow-y-auto custom-scrollbar">
            <p className="text-[9px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-black mb-1.5">Tactical Briefing</p>
            <p className="text-xs leading-relaxed text-foreground/90 italic">
              "{data.training_today.briefing}"
            </p>
          </div>

          <div className="flex-none flex gap-2 text-muted text-[9px] bg-background border border-border px-3 py-1.5 rounded-full font-mono uppercase tracking-wider justify-center">
            <Clock className="w-2.5 h-2.5" />
            <span>Optimum Window: 07:00 - 08:30</span>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="card shadow-md flex flex-col h-full overflow-hidden">
        <div className="flex-none flex items-center gap-2 mb-3 border-b border-border pb-1.5">
          <Calendar className="text-blue-600 dark:text-blue-400 w-5 h-5" />
          <h2 className="text-lg font-semibold uppercase tracking-tight flex-1">Timeline</h2>
        </div>
        
        <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
          <div className="relative">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-2">Today</p>
            <div className="space-y-2 border-l border-slate-200 dark:border-slate-800 ml-1 pl-4">
              {groups.today.map((event, idx) => <ScheduleItem key={idx} event={event} />)}
              {groups.today.length === 0 && <p className="text-[10px] text-muted italic">No missions today.</p>}
            </div>
          </div>
          <div className="relative">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted mb-2">Tomorrow</p>
            <div className="space-y-2 border-l border-slate-200 dark:border-slate-800 ml-1 pl-4">
              {groups.tomorrow.map((event, idx) => <ScheduleItem key={idx} event={event} />)}
              {groups.tomorrow.length === 0 && <p className="text-[10px] text-muted italic">Clear horizon.</p>}
            </div>
          </div>
        </div>
      </section>

      <CommsIntelCard emails={data.gmail_highlights} />

      {/* Mission Log */}
      <section className="card shadow-md flex flex-col h-full overflow-hidden">
        <div className="flex-none flex items-center gap-2 mb-3 border-b border-border pb-1.5">
          <Trophy className="text-orange-600 dark:text-orange-400 w-5 h-5" />
          <h2 className="text-lg font-semibold uppercase tracking-tight">Mission Log</h2>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
          {data.training_history.map((workout, idx) => (
            <article key={idx} className="p-2 bg-surface-hover border border-border rounded-lg">
              <div className="flex justify-between items-start mb-0.5">
                <p className="text-[10px] font-bold truncate flex-1 mr-1">{workout.name}</p>
                <p className="text-[8px] font-mono text-muted uppercase">
                  {new Date(workout.start_date).toLocaleDateString('en-SG', { day: '2-digit', month: 'short' })}
                </p>
              </div>
              <div className="flex gap-2 mt-1">
                <div className="text-[9px] uppercase font-bold text-orange-500">{Math.round(workout.distance / 100) / 10}km</div>
                <div className="text-[9px] uppercase font-bold text-muted">{Math.round(workout.moving_time / 60)}m</div>
              </div>
            </article>
          ))}
          {(!data.training_history || data.training_history.length === 0) && (
            <p className="text-muted italic text-center py-4 text-[10px]">No records found.</p>
          )}
        </div>
      </section>

      {/* Environmental Intel */}
      <section className="card shadow-md flex flex-col h-full overflow-hidden">
        <div className="flex-none flex items-center gap-2 mb-3 border-b border-border pb-1.5">
          <Wind className="text-cyan-600 dark:text-cyan-400 w-5 h-5" />
          <h2 className="text-lg font-semibold uppercase tracking-tight">Environmental Intel</h2>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
          {data.environmental ? (
            <div className="flex items-center justify-between p-2 bg-cyan-50/50 dark:bg-cyan-900/10 rounded-lg border border-cyan-100 dark:border-cyan-900/30">
              <div>
                <p className="text-2xl font-black tracking-tighter">{data.environmental.temp}°C</p>
                <p className="text-[8px] uppercase tracking-widest text-muted font-bold">Feels like {data.environmental.feels_like}°C</p>
              </div>
              <Thermometer className="text-cyan-600 dark:text-cyan-400 w-8 h-8" />
            </div>
          ) : (
            <p className="text-muted italic text-center py-4 text-xs">Telemetry offline.</p>
          )}
        </div>
      </section>
    </div>
  )
}
