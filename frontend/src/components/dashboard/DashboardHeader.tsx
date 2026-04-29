import React from 'react'
import { RefreshCw, Moon, Sun, Settings, X } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useLiveClock } from '../../hooks/useLiveClock'

interface DashboardHeaderProps {
  isRefreshing: boolean
  showSettings: boolean
  onRefresh: () => void
  onToggleSettings: () => void
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isRefreshing, showSettings, onRefresh, onToggleSettings,
}) => {
  const { theme, toggleTheme } = useTheme()
  const now = useLiveClock()

  return (
    <header className="flex-none mb-6 grid grid-cols-1 md:grid-cols-3 items-center border-b border-border pb-4 gap-4">
      <div className="text-left">
        <h1 className="text-2xl font-bold tracking-tight">COCKPIT</h1>
        <p className="text-muted text-[10px] font-black uppercase tracking-widest">Daily Operations</p>
      </div>

      <div className="flex flex-col items-center justify-center">
        <p className="text-3xl font-mono font-black tracking-tighter tabular-nums">
          {now.toLocaleTimeString('en-SG', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
        <p className="text-[9px] uppercase tracking-[0.4em] text-muted font-black">Operational Time</p>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button onClick={onRefresh} disabled={isRefreshing} className="p-2 border border-border rounded-lg hover:bg-surface-hover">
          <RefreshCw className={`w-5 h-5 text-blue-500 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
        <button onClick={toggleTheme} className="p-2 border border-border rounded-lg hover:bg-surface-hover">
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
        <button onClick={onToggleSettings} className="p-2 border border-border rounded-lg hover:bg-surface-hover">
          {showSettings ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
        </button>
      </div>
    </header>
  )
}
