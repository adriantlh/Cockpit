/**
 * Groups calendar events into Today, Tomorrow, and Upcoming categories.
 * Filters out events that ended more than 1 hour ago.
 */
export const groupCalendarEvents = (calendarEvents: any[]) => {
  if (!calendarEvents) return { today: [], tomorrow: [], upcoming: [] };
  
  const now = new Date();
  const today = now.toDateString();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toDateString();

  // Sort by date chronologically
  const sorted = [...calendarEvents].sort((a, b) => {
    const dateA = a.start?.dateTime ? new Date(a.start.dateTime) : (a.start?.date ? new Date(a.start.date) : new Date(0));
    const dateB = b.start?.dateTime ? new Date(b.start.dateTime) : (b.start?.date ? new Date(b.start.date) : new Date(0));
    return dateA.getTime() - dateB.getTime();
  });

  return sorted.reduce((acc: { today: any[], tomorrow: any[], upcoming: any[] }, event: any) => {
    const date = event.start?.dateTime ? new Date(event.start.dateTime) : (event.start?.date ? new Date(event.start.date) : null);
    if (!date) return acc;

    // Filter out events that ended more than 1 hour ago (stale events)
    const endDate = event.end?.dateTime ? new Date(event.end.dateTime) : (event.end?.date ? new Date(event.end.date) : date);
    if (endDate.getTime() < now.getTime() - (1000 * 60 * 60)) return acc;

    const dateStr = date.toDateString();
    if (dateStr === today) {
      acc.today.push(event);
    } else if (dateStr === tomorrowStr) {
      acc.tomorrow.push(event);
    } else if (date.getTime() > now.getTime()) {
      acc.upcoming.push(event);
    }

    return acc;
  }, { today: [], tomorrow: [], upcoming: [] });
};
