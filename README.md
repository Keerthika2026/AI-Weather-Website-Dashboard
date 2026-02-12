# AI Smart Weather Dashboard

A browser-based weather dashboard built with HTML, CSS, and JavaScript. It fetches live weather data, applies a transparent rule-based AI risk analysis, and displays local time/day insights for any searched location.

## Overview

This project combines:
- Frontend web development (HTML, CSS, Vanilla JS)
- Public weather APIs (OpenWeather)
- Explainable AI-style scoring logic for weather risk levels

Users can search places globally, use current geolocation, view weather metrics, and get AI-generated risk interpretation with reasons.

## Features

- Global location search with autocomplete suggestions
- Current-location weather lookup using browser geolocation
- Real-time weather data (temperature, humidity, wind, pressure, visibility)
- AI risk scoring with levels: `LOW`, `MEDIUM`, `HIGH`
- Explainable risk reasons (for example: strong wind, high humidity, low visibility)
- Local time and weekday calculation based on API timezone offset
- Daylight/night detection
- Sunrise and sunset time display
- Tourist place highlights using Wikipedia API
- Theme toggle (light/dark) with `localStorage` persistence
- Google Translate widget toggle
- Responsive card-based UI with animated visual effects
- Separate designer credit page with auto-redirect

## Tech Stack

- HTML5
- CSS3
- JavaScript (Vanilla)
- OpenWeather API
- Wikipedia API
- Google Translate Embed API

## Project Structure

```text
AI-Weather-Website-Dashboard-main/
|-- index.html         # Main dashboard UI
|-- style.css          # Primary styling
|-- d-n.css            # Light/dark theme overrides
|-- script.js          # Weather fetch, UI updates, interactions
|-- ai.js              # AI scoring and explainable decision logic
|-- designers.html     # Designer credits page (auto-redirect)
|-- README.md
|-- LICENSE
```

## How It Works

1. User enters a location (or uses current location).
2. Coordinates are resolved through OpenWeather Geocoding API.
3. Current weather is fetched from OpenWeather Current Weather API.
4. `aiDecision()` computes a risk score from weather factors:
   - Temperature
   - Humidity
   - Wind speed
   - Air-quality/visibility-related conditions (fog, haze, mist, smoke, dust)
5. Score is mapped to risk levels:
   - `LOW`
   - `MEDIUM`
   - `HIGH`
6. UI shows the score, confidence estimate, and reason tags.

## Run Locally

1. Clone or download this repository.
2. Open `index.html` in a modern browser.
3. Search any location and click **Analyze Weather**.

No build step or package installation is required.

## API Key Note

The OpenWeather key is stored client-side (base64-encoded in `script.js`). This is acceptable for a learning/demo project, but not secure for production.

For production deployments:
- Move API requests to a backend service.
- Store keys in server-side environment variables.
- Add request throttling and abuse protection.

## Limitations

- Client-side API key exposure
- Browser geolocation permission required for current-location mode
- External APIs may fail or rate-limit requests
- AI risk model is rule-based and educational, not a certified forecasting system

## License

Licensed under the MIT License. See `LICENSE`.

## Author

Project designer listed in `designers.html`.
