# Weather Data Analysis System ☀️

A responsive weather dashboard with a sky-inspired UI, current conditions, 5-day forecast, search history, and charts. Built with **Python + Flask**, HTML/CSS, and Chart.js.

## Features
- Search weather by city using OpenWeather's current-weather and 5-day forecast APIs.
- Sky-themed dashboard with sun/cloud/rain icons, glass cards, stats, forecast table, and temperature chart.
- Friendly loading and error states.
- Demo mode works without an API key and uses clearly labelled sample data.
- Responsive layout for desktop and mobile.

## Requirements
- Python 3.10+
- An OpenWeather API key for live data (optional for demo mode)

## Run locally
1. Extract the ZIP and open a terminal in `Weather-Data-Analysis-System`.
2. Create and activate a virtual environment:
   - Windows PowerShell: `py -m venv .venv` then `.venv\\Scripts\\Activate.ps1`
   - macOS/Linux: `python3 -m venv .venv` then `source .venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Copy `.env.example` to `.env` and add your API key as `OPENWEATHER_API_KEY=your_key_here`. Leave it blank to use demo mode.
5. Start the app: `python app.py`
6. Open `http://127.0.0.1:5000` in your browser.

## Get live weather
Create a free API key at [OpenWeather](https://openweathermap.org/api), put it in `.env`, and restart the app. New API keys may take a little time to activate.

## Git and GitHub
From the project folder:
```bash
git init
git add .
git commit -m "Initial commit: Weather Data Analysis System"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/Weather-Data-Analysis-System.git
git push -u origin main
```
Create an empty repository on GitHub first, then replace `YOUR-USERNAME` with your GitHub username. If Git asks you to authenticate, complete the browser/device login flow. Never commit `.env` or publish your API key.

## Project structure
```text
Weather-Data-Analysis-System/
├── app.py
├── requirements.txt
├── .env.example
├── .gitignore
├── README.md
├── data/
│   └── README.md
├── tests/
│   └── test_app.py
├── templates/
│   └── index.html
└── static/
    ├── css/style.css
    └── js/app.js
```

## Notes
- Demo values are illustrative, not live observations.
- This is an educational starter project; do not rely on it for safety-critical weather decisions.
