import React from 'react'

interface ScheduleItemProps {
  event: any
}

/**
 * Individual timeline event card with status indicators and relative time.
 */
export const ScheduleItem: React.FC<ScheduleItemProps> = ({ event }) => {
  const eventDate = event.start?.dateTime ? new Date(event.start.dateTime) : (event.start?.date ? new Date(event.start.date) : null);
  const isAllDay = !event.start?.dateTime;
  const now = new Date();
  
  const diffMs = eventDate ? eventDate.getTime() - now.getTime() : 0;
  const diffHours = diffMs / (1000 * 60 * 60);
  
  // Urgent if within the next 2 hours
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
      className={`relative group p-2 border-l-4 rounded-r-xl transition-all duration-300 ${
        isUrgent 
          ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)] ring-1 ring-amber-500/20' 
          : hasStarted
            ? 'bg-emerald-500/10 border-emerald-500 opacity-80'
            : 'bg-surface-hover border-blue-500 hover:bg-surface'
      }`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className={`text-sm font-black leading-tight mb-1 ${
            isUrgent ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'
          }`}>
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
