from datetime import datetime, date, timedelta
import os

def calculate_countdown(target_date_str):
    """Calculates days remaining until a target date."""
    try:
        target_date = datetime.strptime(target_date_str, '%Y-%m-%d').date()
        today = date.today()
        delta = target_date - today
        return delta.days
    except ValueError:
        return None

def get_workout_for_day(training_plan, day_of_week):
    """
    Returns the workout for a given day of the week based on the training plan.
    day_of_week: 0 (Monday) to 6 (Sunday)
    """
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    day_name = days[day_of_week]
    workout = training_plan.get(day_name, "Rest Day")
    
    # If legacy string format, convert to simple object for frontend consistency
    if isinstance(workout, str):
        return {
            "title": workout,
            "type": "N/A",
            "duration_mins": 0,
            "distance_km": 0,
            "intensity_zone": "N/A",
            "briefing": "No detailed briefing available."
        }
    return workout

def process_dashboard_data(events, calendar_items, gmail_items, training_plan, env_data=None, history=None):
    """Aggregates all data for the dashboard."""
    today_dw = date.today().weekday()
    
    countdown_results = []
    for event in events:
        days_left = calculate_countdown(event['date'])
        countdown_results.append({
            'id': event.get('id'),
            'name': event['name'],
            'days_left': days_left,
            'date': event['date']
        })
        
    return {
        "countdown": countdown_results,
        "training_today": get_workout_for_day(training_plan, today_dw),
        "plan_metadata": training_plan.get("_metadata", {"source": "legacy"}),
        "calendar_events": calendar_items,
        "gmail_highlights": gmail_items,
        "environmental": env_data,
        "training_history": history or []
    }

def generate_training_context(db, calendar_items):
    """Compiles Firestore and Calendar data into a Markdown context file."""
    if not db:
        return "Database disconnected."

    # 1. North Star
    events_ref = db.collection('custom_events')
    custom_events = [doc.to_dict() for doc in events_ref.stream()]
    
    # 2. Last Week's Performance
    last_week = datetime.now() - timedelta(days=7)
    from google.cloud.firestore_v1.base_query import FieldFilter
    workouts_ref = db.collection('completed_workouts').where(filter=FieldFilter('start_date', '>=', last_week.isoformat()))
    completed = [doc.to_dict() for doc in workouts_ref.stream()]
    
    context = "# Training Context for LLM\n\n"
    context += "## North Star Goals\n"
    for ev in custom_events:
        days = calculate_countdown(ev['date'])
        if days is not None:
            context += f"- {ev['name']}: {days} days remaining ({ev['date']})\n"
    
    context += "\n## Last Week's Strava Performance\n"
    if not completed:
        context += "No activities recorded last week.\n"
    for act in completed:
        dist_km = round(act['distance'] / 1000, 2)
        mins = round(act['moving_time'] / 60, 1)
        context += f"- {act['start_date'][:10]} {act['type']}: {dist_km}km, {mins} mins, Avg HR: {act.get('average_heartrate', 'N/A')}, Effort: {act.get('suffer_score', 'N/A')}\n"
    
    context += "\n## Next Week's Calendar Load\n"
    for item in calendar_items:
        start = item.get('start', {}).get('dateTime', item.get('start', {}).get('date'))
        if start:
            context += f"- {start[:10]}: {item['summary']}\n"

    context += "\n## Task\n"
    context += "Based on the performance and upcoming load, generate a 7-day training plan for NEXT week (Monday to Sunday).\n"
    context += "Return ONLY a JSON object where each day is a key, and the value is an object with this structure:\n"
    context += "{\n"
    context += "  \"title\": \"Short Title (e.g. Threshold Run)\",\n"
    context += "  \"type\": \"Run/Ride/Rest/Gym\",\n"
    context += "  \"duration_mins\": 60,\n"
    context += "  \"distance_km\": 10,\n"
    context += "  \"intensity_zone\": \"e.g. Z4 (Threshold)\",\n"
    context += "  \"briefing\": \"Specific instructions: warm up, intervals, cool down.\"\n"
    context += "}\n"
    context += "Example: {\"Monday\": {\"title\": \"Recovery Spin\", \"type\": \"Ride\", \"duration_mins\": 45, ...}, ...}\n"

    with open('training_context.md', 'w') as f:
        f.write(context)
    
    return context
