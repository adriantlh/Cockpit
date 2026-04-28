import requests
import time
import os
from datetime import datetime, timedelta

def get_strava_access_token():
    """Refreshes and returns the Strava access token."""
    client_id = os.getenv("STRAVA_CLIENT_ID")
    client_secret = os.getenv("STRAVA_CLIENT_SECRET")
    refresh_token = os.getenv("STRAVA_REFRESH_TOKEN")

    if not client_id or not client_secret or not refresh_token:
        print("Strava credentials missing in environment.")
        return None

    payload = {
        'client_id': client_id,
        'client_secret': client_secret,
        'refresh_token': refresh_token,
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

def get_strava_activities(limit=50):
    """Fetches the most recent activities."""
    token = get_strava_access_token()
    if not token:
        return []

    headers = {'Authorization': f'Bearer {token}'}
    params = {
        'per_page': limit
    }

    try:
        res = requests.get("https://www.strava.com/api/v3/athlete/activities", headers=headers, params=params)
        activities = res.json()
        
        if not isinstance(activities, list):
            print(f"Strava API error or unexpected response: {activities}")
            return []

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
