function aiDecision(temp, humidity, wind, condition) {
  let score = 0;
  let reasons = [];
  let message = "";
  let emoji = "";

  /* =========================
     TEMPERATURE ANALYSIS
  ========================= */
  if (temp >= 24 && temp <= 35) {
    message = "Weather conditions are normal and comfortable.";
    emoji = "😊";
    score += 10;
  }
  else if (temp >= 18 && temp < 24) {
    message = "Weather conditions are mild and pleasant.";
    emoji = "🙂";
    score += 15;
  }
  else if (temp > 35 && temp <= 40) {
    message = "Weather is hot. Stay hydrated and avoid prolonged sun exposure.";
    emoji = "😓";
    score += 30;
    reasons.push("High temperature");
  }
  else if (temp > 40) {
    message = "Extreme heat conditions detected. Outdoor activity is not recommended.";
    emoji = "🔥";
    score += 45;
    reasons.push("Extreme heat");
  }
  else if (temp >= 5 && temp < 18) {
    message = "Cool weather conditions detected.";
    emoji = "🧥";
    score += 20;
  }
  else if (temp >= 0 && temp < 5) {
    message = "Cold weather detected. Wear warm clothing.";
    emoji = "❄️";
    score += 30;
    reasons.push("Low temperature");
  }
  else if (temp < 0) {
    message = "Harsh freezing conditions detected. Avoid unnecessary travel.";
    emoji = "🧊⚠️";
    score += 50;
    reasons.push("Freezing temperature");
  }

  /* =========================
     HUMIDITY ANALYSIS
  ========================= */
  if (humidity >= 85) {
    score += 15;
    reasons.push("High humidity");
  }

  /* =========================
     WIND ANALYSIS
  ========================= */
  if (wind >= 35) {
    score += 20;
    reasons.push("Strong wind activity");
  }

  /* =========================
     AIR QUALITY / VISIBILITY
  ========================= */
  const c = condition.toLowerCase();
  const poorAir = ["fog", "haze", "mist", "smoke", "dust"].some(x => c.includes(x));
  if (poorAir) {
    score += 15;
    reasons.push("Reduced air quality or visibility");
  }

  /* =========================
     RISK LEVEL
  ========================= */
  let risk = "LOW";
  if (score >= 70) risk = "HIGH";
  else if (score >= 40) risk = "MEDIUM";

  let confidence = Math.min(score + 10, 95);

  return {
    score,
    risk,
    confidence,
    message: `${emoji} ${message}`,
    reasons,
    poorAir
  };
}
