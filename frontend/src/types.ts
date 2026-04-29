export interface Event {
  id?: string
  name: string
  days_left?: number
  date: string
}

export interface EnvironmentalData {
  temp: number
  feels_like: number
  humidity: number
  precipitation: number
  aqi: number
  pm2_5: number
  condition_code: number
}

export interface MissionProfile {
  title: string
  type: string
  duration_mins: number
  distance_km: number
  intensity_zone: string
  briefing: string
}

export interface DashboardData {
  countdown: Event[]
  training_today: MissionProfile
  plan_metadata?: {
    source: string
    model?: string
  }
  calendar_events: any[]
  gmail_highlights: { 
    id: string; 
    threadId: string;
    snippet: string; 
    sender: string;
    subject: string;
    date: string;
    link: string;
  }[]
  environmental: EnvironmentalData | null
  training_history: any[]
}
