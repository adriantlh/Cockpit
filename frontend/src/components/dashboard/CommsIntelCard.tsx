import React from 'react'
import { Mail } from 'lucide-react'

interface EmailHighlight {
  id: string
  threadId: string
  snippet: string
  sender: string
  subject: string
  date: string
  link: string
}

interface CommsIntelCardProps {
  emails: EmailHighlight[]
}

/**
 * Section for triage of critical unread emails.
 */
export const CommsIntelCard: React.FC<CommsIntelCardProps> = ({ emails }) => {
  return (
    <section className="card shadow-md flex flex-col h-full overflow-hidden">
      <div className="flex-none flex items-center gap-2 mb-3 border-b border-border pb-1.5">
        <Mail className="text-purple-600 dark:text-purple-400 w-5 h-5" />
        <h2 className="text-lg font-semibold uppercase tracking-tight flex-1">Comms Intel</h2>
        {emails && emails.length > 0 && (
          <span className="text-[10px] font-mono font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
            {emails.length} New
          </span>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
        {emails.map((msg, idx) => {
          // Cleanup sender name (remove email address and quotes)
          const senderName = (msg.sender || "Unknown Sender")
            .split('<')[0]
            .trim()
            .replace(/"/g, '');
            
          const dateObj = new Date(msg.date || new Date());
          const isToday = dateObj.toDateString() === new Date().toDateString();
          
          const formattedDate = isToday 
            ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

          return (
            <a 
              key={msg.id || idx} 
              href={msg.link || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => console.log('Opening email:', msg.link)}
              className="relative z-10 block bg-surface-hover border border-border p-2 rounded-lg hover:border-purple-500/50 hover:shadow-sm transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-0.5">
                <p className="text-[10px] font-black text-foreground truncate flex-1 mr-2 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  {senderName}
                </p>
                <p className="text-[8px] font-mono text-muted uppercase whitespace-nowrap">
                  {formattedDate}
                </p>
              </div>
              <p className="text-[10px] font-bold text-foreground/80 truncate mb-1 line-clamp-1">
                {msg.subject || "No Subject"}
              </p>
              <p className="text-[9px] text-muted leading-snug line-clamp-2">
                {msg.snippet}
              </p>
            </a>
          );
        })}

        {(!emails || emails.length === 0) && (
          <div className="h-full flex flex-col items-center justify-center py-8 opacity-50">
            <Mail className="w-8 h-8 text-muted mb-2 stroke-[1px]" />
            <p className="text-muted italic text-[10px]">No critical messages.</p>
          </div>
        )}
      </div>
    </section>
  )
}
