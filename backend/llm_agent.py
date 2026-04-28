import os
import json
import requests

def generate_training_plan():
    """Reads the training context and uses Z.ai (GLM 4.7) to generate a new plan."""
    api_key = os.getenv("ZAI_API_KEY")
    if not api_key:
        print("Z.ai API Key missing.")
        return None

    if not os.path.exists('training_context.md'):
        print("Training context file missing.")
        return None

    with open('training_context.md', 'r') as f:
        context = f.read()

    try:
        url = "https://api.z.ai/api/paas/v4/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        
        payload = {
            "model": "glm-4.7",
            "messages": [
                {
                    "role": "system", 
                    "content": "You are a professional athletic coach. You will be provided with a context file in Markdown. Your task is to output a 7-day training plan in valid JSON format only."
                },
                {
                    "role": "user", 
                    "content": context
                }
            ],
            "response_format": { "type": "json_object" }
        }

        print(f"Attempting to use Z.ai model: glm-4.7")
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        
        result = response.json()
        if result and 'choices' in result:
            text = result['choices'][0]['message']['content']
            return json.loads(text)
        
        print("Z.ai returned an unexpected response format.")
        
    except Exception as e:
        print(f"Z.ai Model failed: {e}")
    
    # FINAL FALLBACK: If AI calls fail
    print("CRITICAL: Z.ai call failed. Using Safe Fallback Plan.")
    return {
        "Monday": {"title": "Recovery Day", "type": "Rest", "duration_mins": 0, "distance_km": 0, "intensity_zone": "Z1", "briefing": "Focus on sleep and hydration. AI coach is currently offline."},
        "Tuesday": {"title": "Base Aerobic Run", "type": "Run", "duration_mins": 45, "distance_km": 8, "intensity_zone": "Z2", "briefing": "Easy pace. Keep heart rate low."},
        "Wednesday": {"title": "Strength & Mobility", "type": "Gym", "duration_mins": 40, "distance_km": 0, "intensity_zone": "Z2", "briefing": "Core work and single-leg stability exercises."},
        "Thursday": {"title": "Tempo Intervals", "type": "Run", "duration_mins": 50, "distance_km": 10, "intensity_zone": "Z3", "briefing": "20 mins warm up, 15 mins at tempo pace, 15 mins cool down."},
        "Friday": {"title": "Rest & Active Recovery", "type": "Rest", "duration_mins": 0, "distance_km": 0, "intensity_zone": "Z1", "briefing": "Light stretching or walking only."},
        "Saturday": {"title": "Long Endurance Ride", "type": "Ride", "duration_mins": 120, "distance_km": 40, "intensity_zone": "Z2", "briefing": "Consistent effort. Practice fueling."},
        "Sunday": {"title": "Long Endurance Run", "type": "Run", "duration_mins": 90, "distance_km": 15, "intensity_zone": "Z2", "briefing": "Slow and steady distance build-up."}
    }
