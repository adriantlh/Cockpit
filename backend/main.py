from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables first!
load_dotenv()

import google_api
import processor
import weather_api
import strava_api
import llm_agent
from firebase_admin import credentials, firestore, initialize_app

app = FastAPI(title="Cockpit API")

# Configure CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Default Vite port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firestore
# Note: In production, use environment variables for credentials
try:
    if os.path.exists("serviceAccountKey.json"):
        cred = credentials.Certificate("serviceAccountKey.json")
        initialize_app(cred)
    else:
        # Fallback for local development if credentials aren't present yet
        initialize_app()
    # Explicitly specify the database ID 'cockpit'
    db = firestore.client(database_id="cockpit")
except Exception as e:
    print(f"Firestore initialization failed: {e}")
    db = None

@app.get("/")
async def root():
    return {"message": "Cockpit API is running"}

@app.get("/api/dashboard")
async def get_dashboard():
    # 1. Fetch from Firestore (Mocked if DB not connected)
    custom_events = []
    training_history = []
    training_plan = {
        "Monday": "Rest", "Tuesday": "Intervals", "Wednesday": "Easy Run",
        "Thursday": "Tempo", "Friday": "Rest", "Saturday": "Long Ride", "Sunday": "Easy Run"
    }
    
    if db:
        events_ref = db.collection('custom_events')
        custom_events = []
        for doc in events_ref.stream():
            event_data = doc.to_dict()
            event_data['id'] = doc.id
            custom_events.append(event_data)
        
        # Fetch History
        history_ref = db.collection('completed_workouts').order_by('start_date', direction=firestore.Query.DESCENDING).limit(5)
        training_history = [doc.to_dict() for doc in history_ref.stream()]

        plan_ref = db.collection('training_plans').document('current')
        plan_doc = plan_ref.get()
        if plan_doc.exists:
            training_plan = plan_doc.to_dict()

    # 2. Fetch from Google APIs (Mocked if credentials missing)
    calendar_items = []
    gmail_highlights = []
    
    if os.path.exists("credentials.json"):
        calendar_items = google_api.get_calendar_events()
        gmail_highlights = google_api.get_gmail_highlights()
    else:
        print("WARNING: credentials.json missing. Using placeholders for Google data.")
        calendar_items = [{"summary": "Meeting placeholder (credentials.json missing)", "start": {"dateTime": "2023-01-01T00:00:00Z"}}]

    # 3. Fetch Environmental Data
    env_data = weather_api.get_environmental_data()

    # 4. Process and Aggregate
    data = processor.process_dashboard_data(
        custom_events, 
        calendar_items, 
        gmail_highlights, 
        training_plan,
        env_data,
        training_history
    )
    return data

@app.post("/api/events")
async def add_event(event: dict):
    if not db:
        raise HTTPException(status_code=500, detail="Database not connected")
    db.collection('custom_events').add(event)
    return {"status": "success"}

@app.delete("/api/events/{event_id}")
async def delete_event(event_id: str):
    if not db:
        raise HTTPException(status_code=500, detail="Database not connected")
    db.collection('custom_events').document(event_id).delete()
    return {"status": "success"}

@app.put("/api/events/{event_id}")
async def update_event(event_id: str, event: dict):
    if not db:
        raise HTTPException(status_code=500, detail="Database not connected")
    db.collection('custom_events').document(event_id).set(event, merge=True)
    return {"status": "success"}

@app.get("/api/cron/send-summary")
async def send_summary():
    # 1. Gather all data (reuse dashboard logic)
    data = await get_dashboard()
    
    # 2. Format as Markdown
    summary = f"# Cockpit Daily Briefing - {processor.date.today()}\n\n"
    summary += f"## 🏃 Today's Mission\n**{data['training_today']}**\n\n"
    
    summary += "## 🏆 North Stars\n"
    for event in data['countdown']:
        summary += f"- {event['name']}: T-{event['days_left']} days ({event['date']})\n"
    
    summary += "\n## 📅 Schedule\n"
    for event in data['calendar_events']:
        start = event.get('start', {}).get('dateTime', 'All Day')
        summary += f"- {event['summary']} ({start})\n"
        
    summary += "\n## 📩 Comms Intelligence\n"
    for msg in data['gmail_highlights']:
        summary += f"- {msg['snippet']}...\n"
    
    # 3. Send via Gmail (Replace with your actual email)
    recipient = os.getenv("SUMMARY_EMAIL", "your-email@example.com")
    result = google_api.send_gmail_message(
        to=recipient,
        subject=f"Cockpit Briefing: {data['training_today']}",
        body=summary
    )
    
    return {"status": "email_sent", "details": result}

@app.get("/api/cron/sync-strava")
async def sync_strava():
    if not db:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    # Increased lookback to 30 days to ensure history populates
    activities = strava_api.get_strava_activities(after_days=30)
    for act in activities:
        # Use ID as document name to avoid duplicates
        db.collection('completed_workouts').document(act['id']).set(act)
    
    return {"status": "success", "synced_count": len(activities)}

@app.get("/api/cron/generate-plan")
async def generate_plan():
    if not db:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    # 1. Fetch data for context
    calendar_items = []
    if os.path.exists("credentials.json"):
        calendar_items = google_api.get_calendar_events()
    
    # 2. Generate Context File
    processor.generate_training_context(db, calendar_items)
    
    # 3. Call LLM
    new_plan = llm_agent.generate_training_plan()
    if not new_plan:
        raise HTTPException(status_code=500, detail="Failed to generate plan with AI")
    
    # 4. Update Firestore
    db.collection('training_plans').document('current').set(new_plan)
    
    return {"status": "success", "plan": new_plan}
