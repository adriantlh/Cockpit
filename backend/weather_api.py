import requests
from datetime import datetime

def get_environmental_data(lat=1.3521, lon=103.8198):
    """
    Fetches weather and AQI data from Open-Meteo.
    Defaults to Singapore coordinates.
    """
    try:
        # 1. Fetch Weather Data
        weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code&timezone=auto"
        weather_res = requests.get(weather_url).json()
        current_weather = weather_res.get('current', {})

        # 2. Fetch Air Quality Data
        aqi_url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=pm2_5,pm10,us_aqi&timezone=auto"
        aqi_res = requests.get(aqi_url).json()
        current_aqi = aqi_res.get('current', {})

        return {
            "temp": current_weather.get("temperature_2m"),
            "feels_like": current_weather.get("apparent_temperature"),
            "humidity": current_weather.get("relative_humidity_2m"),
            "precipitation": current_weather.get("precipitation"),
            "aqi": current_aqi.get("us_aqi"),
            "pm2_5": current_aqi.get("pm2_5"),
            "condition_code": current_weather.get("weather_code")
        }
    except Exception as e:
        print(f"Failed to fetch environmental data: {e}")
        return None

def get_weather_description(code):
    """Interprets WMO Weather interpretation codes."""
    codes = {
        0: "Clear sky",
        1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
        45: "Fog", 48: "Depositing rime fog",
        51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
        61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
        80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
        95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail"
    }
    return codes.get(code, "Unknown Conditions")
