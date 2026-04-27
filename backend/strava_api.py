import requests
import time
import os
from datetime import datetime, timedelta

STRAVA_CLIENT_ID = os.getenv("STRAVA_CLIENT_ID")
STRAVA_CLIENT_SECRET = os.getenv("STRAVA_CLIENT_SECRET")
STRAVA_REFRESH_TOKEN = os.getenv("STRAVA_REFRESH_TOKEN")

def get_strava_access_token():
    """Refreshes and returns the Strava access token."""
    if not STRAVA_CLIENT_ID or not STRAVA_CLIENT_SECRET or not STRAVA_REFRESH_TOKEN:
        print("Strava credentials missing in environment.")
        return None

    payload = {
        'client_id': STRAVA_CLIENT_ID,
        'client_secret': STRAVA_CLIENT_SECRET,
        'refresh_token': STRAVA_REFRESH_TOKEN,
        'grant_type': 'refresh_token',
        'f': 'json'
    }

    try:
        res = requests.post("https://www.strava.com/oauth/token", data=payload)
        res_json = res.json()
        return res_json.get('access_token')
    except Exception as e:
        print(f"Failed to refresh Strava token: {e}")
        return None

def get_strava_activities(after_days=1):
    """Fetches activities from the last X days."""
    token = get_strava_access_token()
    if not token:
        return []

    after_timestamp = int((datetime.now() - timedelta(days=after_days)).timestamp())
    
    headers = {'Authorization': f'Bearer {token}'}
    params = {'after': after_timestamp}

    try:
        res = requests.get("https://www.strava.com/api/v3/athlete/activities", headers=headers, params=params)
        activities = res.json()
        
        parsed_activities = []
        for act in activities:
            parsed_activities.append({
                'id': str(act['id']),
                'name': act['name'],
                'distance': act['distance'], # meters
                'moving_time': act['moving_time'], # seconds
                'type': act['type'],
                'start_date': act['start_date_local'],
                'average_heartrate': act.get('average_heartrate'),
                'max_heartrate': act.get('max_heartrate'),
                'suffer_score': act.get('suffer_score') # Relative Effort
            })
        return parsed_activities
    except Exception as e:
        print(f"Failed to fetch Strava activities: {e}")
        return []
