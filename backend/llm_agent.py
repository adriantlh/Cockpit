import os
import json
import requests

def generate_training_plan():
    """Reads the training context and uses Global Z.ai (api.z.ai) with standard Bearer auth."""
    api_key = os.getenv("ZAI_API_KEY")
    if not api_key:
        print("Z.ai API Key missing.")
        return None

    if not os.path.exists('training_context.md'):
        print("Training context file missing.")
        return None

    with open('training_context.md', 'r') as f:
        context = f.read()

    # Updated Tier List based on user priority
    model_tiers = ["glm-4.6", "glm-4.5", "glm-4.6v", "glm-4-flash"]
    
    for model_id in model_tiers:
        try:
            print(f"Attempting to use Global Z.ai model: {model_id}")
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}"
            }
            
            # Optimized payload for speed and clarity
            payload = {
                "model": model_id,
                "messages": [
                    {
                        "role": "system", 
                        "content": "Professional coach. Output JSON only. Keys: Monday-Sunday. Sub-keys: title, type, duration_mins, distance_km, intensity_zone, briefing."
                    },
                    {
                        "role": "user", 
                        "content": f"Context:\n{context}\n\nJSON output:"
                    }
                ],
                "response_format": { "type": "json_object" }
            }

            # Increased timeout for large reasoning models
            response = requests.post(url, headers=headers, json=payload, timeout=90)
            
            if response.status_code == 429:
                print(f"Model {model_id} rate limited (429): {response.text}")
                continue
            
            if response.status_code == 401:
                print(f"Model {model_id} Unauthorized (401): Check your API Key.")
                return None
                
            response.raise_for_status()
            
            result = response.json()
            if result and 'choices' in result:
                text = result['choices'][0]['message']['content']
                text = text.replace('```json', '').replace('```', '').strip()
                plan = json.loads(text)
                plan["_metadata"] = {"source": "ai", "model": model_id}
                return plan
            
        except Exception as e:
            print(f"Global Z.ai Model {model_id} failed: {e}")
            continue
    
    # FINAL FALLBACK
    print("CRITICAL: All Global AI models failed. Using Safe Fallback Plan.")
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
