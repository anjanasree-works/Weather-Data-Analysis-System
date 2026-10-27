import os
from datetime import datetime, timedelta
from flask import Flask, jsonify, render_template, request
import requests
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
API_KEY = os.getenv("OPENWEATHER_API_KEY", "").strip()
BASE_URL = "https://api.openweathermap.org/data/2.5"


def demo_weather(city):
    """Clearly labelled illustrative data for running without an API key."""
    now = datetime.now()
    temps = [27, 29, 28, 30, 26]
    forecast = []
    for i, temp in enumerate(temps):
        day = now + timedelta(days=i)
        forecast.append({
            "date": day.strftime("%a, %d %b"),
            "short_day": day.strftime("%a"),
            "temp": temp,
            "min": temp - 4,
            "max": temp + 2,
            "description": ["Partly cloudy", "Sunny", "Light rain", "Cloudy", "Clear sky"][i],
            "icon": ["⛅", "☀️", "🌦️", "☁️", "🌤️"][i],
            "humidity": [64, 52, 78, 69, 48][i],
            "wind": [12, 9, 16, 11, 8][i],
        })
    return {
        "city": city.title(),
        "country": "DEMO",
        "description": "Partly cloudy",
        "icon": "⛅",
        "temp": 28,
        "feels_like": 30,
        "min": 24,
        "max": 31,
        "humidity": 64,
        "wind": 12,
        "pressure": 1012,
        "visibility": 10,
        "sunrise": "06:12",
        "sunset": "18:24",
        "updated": now.strftime("%d %b %Y, %I:%M %p"),
        "forecast": forecast,
        "demo": True,
    }


def openweather_weather(city):
    current_response = requests.get(
        f"{BASE_URL}/weather",
        params={"q": city, "appid": API_KEY, "units": "metric"},
        timeout=10,
    )
    current_response.raise_for_status()
    current = current_response.json()

    forecast_response = requests.get(
        f"{BASE_URL}/forecast",
        params={"q": city, "appid": API_KEY, "units": "metric"},
        timeout=10,
    )
    forecast_response.raise_for_status()
    raw_forecast = forecast_response.json().get("list", [])

    # Pick one forecast near midday for each date, falling back to first available.
    by_date = {}
    for item in raw_forecast:
        date = item["dt_txt"][:10]
        hour = int(item["dt_txt"][11:13])
        if date not in by_date or abs(hour - 12) < abs(int(by_date[date]["dt_txt"][11:13]) - 12):
            by_date[date] = item
    forecast = []
    for date, item in list(by_date.items())[:5]:
        weather = item["weather"][0]
        day = datetime.strptime(date, "%Y-%m-%d")
        forecast.append({
            "date": day.strftime("%a, %d %b"),
            "short_day": day.strftime("%a"),
            "temp": round(item["main"]["temp"]),
            "min": round(item["main"]["temp_min"]),
            "max": round(item["main"]["temp_max"]),
            "description": weather["description"].title(),
            "icon": weather_emoji(weather["icon"]),
            "humidity": item["main"]["humidity"],
            "wind": round(item["wind"]["speed"] * 3.6),
        })
    sys = current.get("sys", {})
    return {
        "city": current.get("name", city),
        "country": sys.get("country", ""),
        "description": current["weather"][0]["description"].title(),
        "icon": weather_emoji(current["weather"][0]["icon"]),
        "temp": round(current["main"]["temp"]),
        "feels_like": round(current["main"]["feels_like"]),
        "min": round(current["main"]["temp_min"]),
        "max": round(current["main"]["temp_max"]),
        "humidity": current["main"]["humidity"],
        "wind": round(current["wind"]["speed"] * 3.6),
        "pressure": current["main"]["pressure"],
        "visibility": round(current.get("visibility", 0) / 1000, 1),
        "sunrise": datetime.fromtimestamp(sys["sunrise"]).strftime("%H:%M") if sys.get("sunrise") else "—",
        "sunset": datetime.fromtimestamp(sys["sunset"]).strftime("%H:%M") if sys.get("sunset") else "—",
        "updated": datetime.now().strftime("%d %b %Y, %I:%M %p"),
        "forecast": forecast,
        "demo": False,
    }


def weather_emoji(icon_code):
    return {
        "01d": "☀️", "01n": "🌙", "02d": "🌤️", "02n": "☁️",
        "03d": "☁️", "03n": "☁️", "04d": "☁️", "04n": "☁️",
        "09d": "🌧️", "09n": "🌧️", "10d": "🌦️", "10n": "🌧️",
        "11d": "⛈️", "11n": "⛈️", "13d": "❄️", "13n": "❄️",
        "50d": "🌫️", "50n": "🌫️",
    }.get(icon_code, "🌤️")


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/api/weather")
def weather_api():
    city = request.args.get("city", "Hyderabad").strip()
    if not city or len(city) > 100:
        return jsonify({"error": "Enter a valid city name (up to 100 characters)."}), 400
    try:
        if API_KEY:
            data = openweather_weather(city)
        else:
            data = demo_weather(city)
        return jsonify(data)
    except requests.exceptions.HTTPError as exc:
        status = exc.response.status_code if exc.response is not None else 502
        if status == 404:
            message = "We couldn't find that city. Check the spelling and try again."
        elif status == 401:
            message = "The weather API key was rejected. Check OPENWEATHER_API_KEY in your .env file."
        else:
            message = "The weather service returned an error. Please try again shortly."
        return jsonify({"error": message}), 502
    except requests.exceptions.RequestException:
        return jsonify({"error": "Weather service is unreachable. Check your internet connection and try again."}), 502


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)