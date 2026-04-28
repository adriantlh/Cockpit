import os
import json
import time

CACHE_FILE = 'cache.json'
CACHE_EXPIRY = 1800 # 30 minutes in seconds

def get_cached_data():
    """Returns cached dashboard data if not expired."""
    if not os.path.exists(CACHE_FILE):
        return None
    
    try:
        with open(CACHE_FILE, 'r') as f:
            cache = json.load(f)
            
        if time.time() - cache.get('timestamp', 0) < CACHE_EXPIRY:
            print("Dashboard: Loading from local cache.")
            return cache.get('data')
    except Exception:
        return None
    return None

def save_to_cache(data):
    """Saves dashboard data to local cache."""
    try:
        cache = {
            'timestamp': time.time(),
            'data': data
        }
        with open(CACHE_FILE, 'w') as f:
            json.dump(cache, f)
    except Exception as e:
        print(f"Failed to save cache: {e}")

def save_current_plan(plan):
    """Saves a local backup of the AI mission."""
    try:
        with open('current_plan.json', 'w') as f:
            json.dump(plan, f)
    except Exception as e:
        print(f"Failed to save plan locally: {e}")

def load_local_plan():
    """Loads the mission from local backup if DB fails."""
    if os.path.exists('current_plan.json'):
        try:
            with open('current_plan.json', 'r') as f:
                return json.load(f)
        except:
            return None
    return None
