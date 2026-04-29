import os
import json
import requests

def generate_training_plan():
    """Reads the training context and uses Global Z.ai (api.z.ai) with high-compatibility settings."""
    api_key = os.getenv("ZAI_API_KEY")
    if not api_key:
        print("Z.ai API Key missing.")
        return None

    if not os.path.exists('training_context.md'):
        print("Training context file missing.")
        return None

    with open('training_context.md', 'r') as f:
        context = f.read()

    # User-specified coding-optimized endpoint
    url = "https://api.z.ai/api/coding/paas/v4/chat/completions"
    
    # High-compatibility model list
    model_tiers = ["glm-4.6", "glm-4.5", "glm-4.6v", "glm-4-flash", "glm-4.7", "glm-4.5-flash"]
    
    for model_id in model_tiers:
        try:
            print(f"Attempting to use Z.ai model: {model_id}")
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}"
            }
            
            # Use a single user message for maximum compatibility across all model versions
            payload = {
                "model": model_id,
                "messages": [
                    {
                        "role": "user", 
                        "content": f"You are a professional athletic coach. Context:\n{context}\n\nTask: Output a 7-day training plan in valid JSON format. JSON keys must be Monday-Sunday. Each day must have: title, type, duration_mins, distance_km, intensity_zone, briefing. Return ONLY the raw JSON object."
                    }
                ],
                "temperature": 0.7
            }
            
            # Only use json_object for specific known compatible models
            if model_id in ["glm-4.6", "glm-4.5", "glm-4.7"]:
                payload["response_format"] = { "type": "json_object" }

            response = requests.post(url, headers=headers, json=payload, timeout=90)
            
            if response.status_code != 200:
                print(f"Model {model_id} Error {response.status_code}: {response.text}")
                continue
                
            result = response.json()
            if result and 'choices' in result:
                text = result['choices'][0]['message']['content']
                # Aggressive cleanup of markdown blocks
                text = text.replace('```json', '').replace('```', '').strip()
                plan = json.loads(text)
                plan["_metadata"] = {"source": "ai", "model": model_id}
                return plan
            
        except Exception as e:
            print(f"Z.ai Model {model_id} failed: {e}")
            continue
    
    # FINAL FALLBACK
    print("CRITICAL: All AI models failed. Using Safe Fallback Plan.")
    return {
        "_metadata": {"source": "fallback"},
        "Monday": {"title": "Recovery Day", "type": "Rest", "duration_mins": 0, "distance_km": 0, "intensity_zone": "Z1", "briefing": "Focus on sleep and hydration. AI coach is currently offline."},
        "Tuesday": {"title": "Base Aerobic Run", "type": "Run", "duration_mins": 45, "distance_km": 8, "intensity_zone": "Z2", "briefing": "Easy pace. Keep heart rate low."},
        "Wednesday": {"title": "Strength & Mobility", "type": "Gym", "duration_mins": 40, "distance_km": 0, "intensity_zone": "Z2", "briefing": "Core work and single-leg stability exercises."},
        "Thursday": {"title": "Tempo Intervals", "type": "Run", "duration_mins": 50, "distance_km": 10, "intensity_zone": "Z3", "briefing": "20 mins warm up, 15 mins at tempo pace, 15 mins cool down."},
        "Friday": {"title": "Rest & Active Recovery", "type": "Rest", "duration_mins": 0, "distance_km": 0, "intensity_zone": "Z1", "briefing": "Light stretching or walking only."},
        "Saturday": {"title": "Long Endurance Ride", "type": "Ride", "duration_mins": 120, "distance_km": 40, "intensity_zone": "Z2", "briefing": "Consistent effort. Practice fueling."},
        "Sunday": {"title": "Long Endurance Run", "type": "Run", "duration_mins": 90, "distance_km": 15, "intensity_zone": "Z2", "briefing": "Slow and steady distance build-up."}
    }
