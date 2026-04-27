import os
import json
import google.generativeai as genai

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def generate_training_plan():
    """Reads the training context and uses Gemini to generate a new plan."""
    if not GEMINI_API_KEY:
        print("Gemini API Key missing.")
        return None

    if not os.path.exists('training_context.md'):
        print("Training context file missing.")
        return None

    with open('training_context.md', 'r') as f:
        context = f.read()

    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        response = model.generate_content(context)
        
        # Extract JSON from response (handling potential markdown formatting)
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        
        plan = json.loads(text)
        return plan
    except Exception as e:
        print(f"Failed to generate plan with Gemini: {e}")
        return None
