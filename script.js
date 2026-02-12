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
  if (el._typeTimer) clearInterval(el._typeTimer);
  const t = setInterval(() => {
    el.textContent += text.charAt(i++);
    if (i >= text.length) {
      clearInterval(t);
      el._typeTimer = null;
    }
  }, speed);
  el._typeTimer = t;
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

function formatTimeUTC(date) {
  let h = date.getUTCHours();
  let m = date.getUTCMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatTimeFromUnix(unixSeconds, timezoneOffsetSeconds) {
  if (!unixSeconds && unixSeconds !== 0) return "--";
  const d = new Date((unixSeconds + timezoneOffsetSeconds) * 1000);
  return formatTimeUTC(d);
}

function getDayName(date) {
  return date.toLocaleDateString(undefined, { weekday: "long" });
}

function titleCase(text) {
  return text
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map(w => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

/* ================================
   WIKIPEDIA HIGHLIGHTS (ALL LOCATIONS)
================================ */
const WIKI_API = "https://en.wikipedia.org/w/api.php";

async function wikiSearchTitles(query, limit = 6) {
  const url =
    `${WIKI_API}?action=query&list=search&srsearch=${encodeURIComponent(query)}` +
    `&srlimit=${limit}&format=json&origin=*`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Wiki search failed");
  const data = await res.json();
  const hits = (data.query && data.query.search) || [];
  return hits.map(h => h.title);
}

function normalizeTokens(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function matchTitles(titles, mustInclude) {
  const tokens = normalizeTokens(mustInclude);
  if (!tokens.length) return titles;
  return titles.filter(t => {
    const tl = t.toLowerCase();
    return tokens.every(tok => tl.includes(tok));
  });
}

function toWikiItems(titles, limit = 2) {
  return titles.slice(0, limit).map(t => ({
    title: t,
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(t.replace(/ /g, "_"))}`
  }));
}

async function wikiGeoSearch(lat, lon, limit = 8) {
  const url =
    `${WIKI_API}?action=query&list=geosearch&gscoord=${lat}|${lon}` +
    `&gsradius=10000&gslimit=${limit}&format=json&origin=*`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Wiki geosearch failed");
  const data = await res.json();
  const hits = (data.query && data.query.geosearch) || [];
  return hits.map(h => h.title);
}

function filterPlaceTitles(titles) {
  const good = [];
  const badWords = ["school", "college", "airport", "railway", "station"];
  for (const t of titles) {
    const tl = t.toLowerCase();
    if (badWords.some(b => tl.includes(b))) continue;
    good.push(t);
  }
  return good;
}


async function getTwoWikiItems(primaryQuery, fallbackQuery, mustInclude) {
  let titles = await wikiSearchTitles(primaryQuery, 6).catch(() => []);
  titles = matchTitles(titles, mustInclude);
  if (titles.length < 2 && fallbackQuery) {
    let more = await wikiSearchTitles(fallbackQuery, 6).catch(() => []);
    more = matchTitles(more, mustInclude);
    titles = titles.concat(more);
  }
  const uniq = Array.from(new Set(titles));
  return toWikiItems(uniq, 2);
}

function buildPlaceText(items, fallbackText) {
  if (!items.length) return fallbackText;
  return items.map(it => it.title).join("  ");
}

async function updateWikiHighlights(place, coords) {
  try {
    const parts = place.split(",").map(p => p.trim()).filter(Boolean);
    const base = parts[0] || place;
    const region = parts[1] || "";
    const country = parts[2] || "";

    let placeTitles = [];
    if (coords && typeof coords.lat === "number" && typeof coords.lon === "number") {
      placeTitles = await wikiGeoSearch(coords.lat, coords.lon, 10).catch(() => []);
      placeTitles = filterPlaceTitles(placeTitles);
    }
    let placeItems = toWikiItems(placeTitles, 2);
    if (placeItems.length < 2) {
      placeItems = await getTwoWikiItems(
        `Tourist attractions in ${base} ${region} ${country}`.trim(),
        `${base} landmarks`,
        base
      );
    }

    const placesText = buildPlaceText(
      placeItems,
      "Historic center  major landmarks"
    );

    typeText(
      aiPlaces,
      `📍 Famous Tourist Places:\n🏛️ ${placesText}`
    );
  } catch (e) {
    typeText(
      aiPlaces,
      "📍 Famous Tourist Places:\n🏛️ Historic center  major landmarks"
    );
  }
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
  condition.textContent = "Condition: " + titleCase(d.weather[0].description);
  const pressureVal = typeof d.main.pressure === "number" ? d.main.pressure : "--";
  const visibilityKm =
    typeof d.visibility === "number" ? (d.visibility / 1000).toFixed(1) : "--";
  pressure.textContent = "Air pressure: " + pressureVal + " hPa";
  visibility.textContent = "Visibility: " + visibilityKm + " km";
  sunrise.textContent =
    "Sun rise: " + formatTimeFromUnix(d.sys.sunrise, d.timezone);
  sunset.textContent =
    "Sun set: " + formatTimeFromUnix(d.sys.sunset, d.timezone);

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

  aiPlaces.textContent = "📍 Famous Tourist Places:\n🏛️ Loading...";
  updateWikiHighlights(place, d.coord);

  // ✅ EXACT FORMAT REQUESTED
  const aiText =
`${ai.message}

🕒 Local Time: ${timeText}

📅 ${dayName}

${isDay ? "🌤 Daylight" : "🌙 Night-time"}

🌞 Sun rise: ${formatTimeFromUnix(d.sys.sunrise, d.timezone)}

🌤️ Sun set: ${formatTimeFromUnix(d.sys.sunset, d.timezone)}`;

  typeText(aiMessage, aiText);
  sunrise.textContent = "";
  sunset.textContent = "";

  const riskEmoji = ai.risk === "HIGH" ? "🔴" : ai.risk === "MEDIUM" ? "🟡" : "🟢";
  typeText(aiTemp, `📊 AI Risk Score: ${ai.score} / 100`);
  typeText(
    aiHumidity,
    `${riskEmoji} Risk Level: ${ai.risk} (${ai.confidence}% confidence)`
  );

  const reasonEmojiMap = {
    "High humidity": "💧",
    "Strong wind activity": "🌬️",
    "Reduced air quality or visibility": "🌫️",
    "High temperature": "🔥",
    "Extreme heat": "🔥",
    "Low temperature": "🧊",
    "Freezing temperature": "🧊"
  };
  const reasonsText = ai.reasons.length
    ? ai.reasons
        .map(r => `${reasonEmojiMap[r] || "⚠️"} ${r}`)
        .join("\n")
    : "✅ No major threats detected";

  typeText(aiRisk, `🌫️ Conditions:\n${reasonsText}`);
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

/* ================================
   TRANSLATE TOGGLE
================================ */
function toggleTranslate() {
  const wrap = document.getElementById("translateWrap");
  if (!wrap) return;
  wrap.classList.toggle("active");
}
