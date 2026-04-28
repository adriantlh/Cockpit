import os
import json
import google.generativeai as genai

def generate_training_plan():
    """Reads the training context and uses Gemini to generate a new plan."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Gemini API Key missing.")
        return None

    if not os.path.exists('training_context.md'):
        print("Training context file missing.")
        return None

    with open('training_context.md', 'r') as f:
        context = f.read()

    try:
        print(f"Configuring Gemini with API Key (prefix): {api_key[:8]}...")
        genai.configure(api_key=api_key)
        
        # List models to see what we actually have access to
        try:
            print("Available models:")
            for m in genai.list_models():
                if 'generateContent' in m.supported_generation_methods:
                    print(f"- {m.name}")
        except Exception as list_err:
            print(f"Could not list models: {list_err}")

        # Try models in order of preference, including explicit prefixes and legacy models
        model_names = [
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-pro',
            'models/gemini-1.5-flash',
            'models/gemini-pro'
        ]
        last_error = None
        
        for name in model_names:
            try:
                print(f"Attempting to use model: {name}")
                model = genai.GenerativeModel(name)
                response = model.generate_content(context)
                
                if response and response.text:
                    text = response.text
                    if "```json" in text:
                        text = text.split("```json")[1].split("```")[0].strip()
                    elif "```" in text:
                        text = text.split("```")[1].split("```")[0].strip()
                    
                    return json.loads(text)
            except Exception as e:
                print(f"Model {name} failed: {e}")
                last_error = e
                continue
        
        # FINAL FALLBACK: If all AI calls fail, generate a basic functional plan
        print("CRITICAL: All Gemini models failed (likely billing/prepayment). Using Safe Fallback Plan.")
        return {
            "Monday": {"title": "Recovery Day", "type": "Rest", "duration_mins": 0, "distance_km": 0, "intensity_zone": "Z1", "briefing": "Focus on sleep and hydration. AI coach is currently offline due to billing."},
            "Tuesday": {"title": "Base Aerobic Run", "type": "Run", "duration_mins": 45, "distance_km": 8, "intensity_zone": "Z2", "briefing": "Easy pace. Keep heart rate low."},
            "Wednesday": {"title": "Strength & Mobility", "type": "Gym", "duration_mins": 40, "distance_km": 0, "intensity_zone": "Z2", "briefing": "Core work and single-leg stability exercises."},
            "Thursday": {"title": "Tempo Intervals", "type": "Run", "duration_mins": 50, "distance_km": 10, "intensity_zone": "Z3", "briefing": "20 mins warm up, 15 mins at tempo pace, 15 mins cool down."},
            "Friday": {"title": "Rest & Active Recovery", "type": "Rest", "duration_mins": 0, "distance_km": 0, "intensity_zone": "Z1", "briefing": "Light stretching or walking only."},
            "Saturday": {"title": "Long Endurance Ride", "type": "Ride", "duration_mins": 120, "distance_km": 40, "intensity_zone": "Z2", "briefing": "Consistent effort. Practice fueling."},
            "Sunday": {"title": "Long Endurance Run", "type": "Run", "duration_mins": 90, "distance_km": 15, "intensity_zone": "Z2", "briefing": "Slow and steady distance build-up."}
        }
    except Exception as e:
        print(f"Failed to generate plan with Gemini: {e}")
        return None
