const apiKey = atob("NzVlNDBlZTUxN2Y4ZTUyM2Q1MTEyYmU1Y2Q1YWZjMjk=");

/* ================================
   GLOBAL SELECTION STATE
================================ */
let selectedLat = null;
let selectedLon = null;
let selectedPlaceName = "";

/* ================================
   TYPING EFFECT
================================ */
function typeText(el, text, speed = 28) {
  el.textContent = "";
  let i = 0;
  const t = setInterval(() => {
    el.textContent += text.charAt(i++);
    if (i >= text.length) clearInterval(t);
  }, speed);
}

/* ================================
   CORRECT LOCAL TIME (API BASED)
================================ */
function getCorrectLocalTime(timezoneOffsetSeconds) {
  const utcNow = Date.now();
  const utcTime = utcNow + new Date().getTimezoneOffset() * 60000;
  return new Date(utcTime + timezoneOffsetSeconds * 1000);
}

function formatTime(date) {
  let h = date.getHours();
  let m = date.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}

function getDayName(date) {
  return date.toLocaleDateString(undefined, { weekday: "long" });
}

/* ================================
   LOCATION SUGGESTIONS
================================ */
function showSuggestions() {
  const q = cityInput.value.trim();
  if (q.length < 2) {
    suggestions.innerHTML = "";
    return;
  }

  fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=5&appid=${apiKey}`
  )
    .then(res => res.json())
    .then(data => {
      suggestions.innerHTML = "";

      data.forEach(loc => {
        const item = document.createElement("div");
        const name =
          `${loc.name}${loc.state ? ", " + loc.state : ""}, ${loc.country}`;

        item.textContent = name;

        item.onclick = () => {
          cityInput.value = name;
          selectedLat = loc.lat;
          selectedLon = loc.lon;
          selectedPlaceName = name;
          suggestions.innerHTML = "";
        };

        suggestions.appendChild(item);
      });
    });
}

/* Close dropdown on outside click */
document.addEventListener("click", e => {
  if (!e.target.closest(".location-wrapper")) {
    suggestions.innerHTML = "";
  }
});

/* ================================
   GET WEATHER
================================ */
function getWeather() {
  suggestions.innerHTML = "";

  if (selectedLat !== null && selectedLon !== null) {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${selectedLat}&lon=${selectedLon}&appid=${apiKey}&units=metric`
    )
      .then(res => res.json())
      .then(data => updateUI(selectedPlaceName, data));
    return;
  }

  const loc = cityInput.value.trim();
  if (!loc) return alert("Enter a location");

  fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${loc}&limit=1&appid=${apiKey}`
  )
    .then(res => res.json())
    .then(g => {
      if (!g.length) throw "";
      const { lat, lon, name, state, country } = g[0];

      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      )
        .then(res => res.json())
        .then(data =>
          updateUI(`${name}${state ? ", " + state : ""}, ${country}`, data)
        );
    })
    .catch(() => alert("Location not found"));
}

/* ================================
   CURRENT LOCATION
================================ */
function useCurrentLocation() {
  locationStatus.textContent = "📡 Requesting location access...";

  navigator.geolocation.getCurrentPosition(
    pos => {
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=${apiKey}&units=metric`
      )
        .then(res => res.json())
        .then(data => {
          selectedLat = null;
          selectedLon = null;
          updateUI(`${data.name}, ${data.sys.country}`, data);
        });
    },
    () => {
      locationStatus.textContent =
        "⚠️ Location denied. Please use manual search.";
    }
  );
}

/* ================================
   UPDATE UI (FORMAT YOU ASKED)
================================ */
function updateUI(place, d) {
  cityName.textContent = "Location: " + place;
  temp.textContent = "Temperature: " + d.main.temp + " °C";
  humidity.textContent = "Humidity: " + d.main.humidity + " %";
  wind.textContent = "Wind Speed: " + d.wind.speed + " km/h";
  condition.textContent = "Condition: " + d.weather[0].description;

  const localTime = getCorrectLocalTime(d.timezone);
  const timeText = formatTime(localTime);
  const dayName = getDayName(localTime);
  const isDay = localTime.getHours() >= 6 && localTime.getHours() < 18;

  const ai = aiDecision(
    d.main.temp,
    d.main.humidity,
    d.wind.speed,
    d.weather[0].description
  );

  // ✅ EXACT FORMAT REQUESTED
  const aiText =
`${ai.message}

🕒 Local Time: ${timeText}
📅 ${dayName}
${isDay ? "🌤 Daylight" : "🌙 Night-time"}`;

  typeText(aiMessage, aiText);

  aiTemp.textContent = `AI Risk Score: ${ai.score} / 100`;
  aiHumidity.textContent = `Risk Level: ${ai.risk} (${ai.confidence}% confidence)`;
  aiRisk.textContent =
    ai.reasons.length
      ? "• " + ai.reasons.join("\n• ")
      : "• No major threats detected";
}
/* ================================
   DARK / LIGHT MODE TOGGLE
================================ */
function toggleTheme() {
  const body = document.body;
  const btn = document.getElementById("themeBtn");

  if (body.classList.contains("dark-mode")) {
    body.classList.remove("dark-mode");
    body.classList.add("light-mode");
    btn.textContent = "🌙";
    localStorage.setItem("theme", "light");
  } else {
    body.classList.remove("light-mode");
    body.classList.add("dark-mode");
    btn.textContent = "☀️";
    localStorage.setItem("theme", "dark");
  }
}

/* Load saved theme */
(function () {
  const savedTheme = localStorage.getItem("theme") || "light";
  const btn = document.getElementById("themeBtn");

  document.body.classList.add(savedTheme + "-mode");
  if (savedTheme === "dark") btn.textContent = "☀️";
})();
