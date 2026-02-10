🌍 AI-Weather-Website

AI Smart Weather Dashboard built using HTML, CSS, and JavaScript, providing real-time global weather insights with explainable AI-based decision making.

📌 Project Overview

The AI Smart Weather Dashboard is a browser-based web application that delivers real-time weather information for locations across the world.
It integrates cloud-based weather APIs with an explainable AI model to analyze environmental conditions and present risk-aware, human-readable decisions.

This project is developed as an academic project, focusing on:

Cloud computing concepts

Explainable Artificial Intelligence (XAI)

Frontend web development technologies

✨ Features

🌍 Global weather search (city, district, or area)

☁️ Real-time weather data using the OpenWeather API

🤖 AI-based weather risk analysis (LOW / MEDIUM / HIGH)

🧠 Explainable AI logic with score-based decisions

🕒 Location-based local time detection

📅 Day name and time awareness

☀️ Daylight / 🌙 Night-time detection

🌐 Animated and modern UI elements

📱 Fully responsive design (mobile & desktop)

🎨 Floating glassmorphism-style UI

👨‍💻 Designer credits page with auto-redirect feature

🌗 Light / Dark mode toggle

🛠️ Technologies Used

HTML5

CSS3

JavaScript (Vanilla JS)

OpenWeather API

GitHub Pages (for deployment)

🧠 AI Logic Explanation

The AI module evaluates multiple weather parameters, including:

Temperature

Humidity

Wind speed

Weather conditions (rain, haze, fog, dust, etc.)

Each parameter contributes to a weighted risk score, which is classified into:

🟢 LOW Risk – Normal and safe conditions

🟡 MEDIUM Risk – Caution advised

🔴 HIGH Risk – Potentially dangerous conditions

The system also provides natural-language explanations and confidence levels, making the AI decisions transparent and understandable.

📂 Project Structure
AI-Weather-Website/
│
├── index.html
├── style.css
├── d-n.css
├── script.js
├── ai.js
├── designers.html
└── README.md

🚀 How to Run the Project

Download or clone this repository

Open index.html in any modern web browser

Enter a location and click Analyze Weather

Optionally, use Current Location or Dark Mode

🔐 API Security Note

This project uses a free public API from OpenWeather.
The API key is obfuscated on the client side, and usage is limited.

⚠️ For production-level systems, API keys should always be handled securely using a backend server.

📜 License

This project is licensed under the MIT License and is intended strictly for educational and academic purposes.

> Acknowledgement
Thank you for visiting and reviewing this project.
