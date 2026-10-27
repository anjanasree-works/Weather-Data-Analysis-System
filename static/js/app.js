const $ = (id) => document.getElementById(id);
let temperatureChart = null;
let rangeChart = null;

const safeText = (value) => String(value ?? "");
const escapeHtml = (value) => safeText(value).replace(/[&<>"']/g, (ch) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[ch]));

function setNotice(message = "") {
  $("notice").textContent = message;
  $("notice").hidden = !message;
}

function renderForecast(days) {
  $("forecastGrid").innerHTML = days.map((day, index) => `
    <article class="forecast-card">
      <div class="forecast-day">${index === 0 ? "Today" : escapeHtml(day.short_day)}</div>
      <div class="forecast-date">${escapeHtml(day.date)}</div>
      <div class="forecast-icon">${escapeHtml(day.icon)}</div>
      <div class="forecast-desc">${escapeHtml(day.description)}</div>
      <div class="forecast-temp">${day.temp}° <small>C</small></div>
      <div class="forecast-range">${day.max}° / ${day.min}°</div>
    </article>`).join("");
  $("forecastTable").innerHTML = days.map((day, index) => `
    <tr>
      <td>${index === 0 ? "Today" : escapeHtml(day.date)}</td>
      <td><div class="table-condition"><span>${escapeHtml(day.icon)}</span>${escapeHtml(day.description)}</div></td>
      <td><strong>${day.temp}°C</strong></td>
      <td><span class="temp-chip">${day.max}°</span> &nbsp; ${day.min}°</td>
      <td><div class="humidity-cell">${day.humidity}% <span class="humidity-mini"><i style="width:${Math.max(0, Math.min(100, day.humidity))}%"></i></span></div></td>
      <td>${day.wind} km/h</td>
    </tr>`).join("");
  $("tableCount").textContent = `${days.length} DAYS`;
}

function renderCharts(days) {
  if (typeof Chart === "undefined") return;
  const labels = days.map((d) => d.short_day);
  if (temperatureChart) temperatureChart.destroy();
  if (rangeChart) rangeChart.destroy();

  const commonOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: "#234b68", padding: 11, displayColors: false } },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { color: "#83a0b5", font: { family: "DM Sans", size: 10 } } },
      y: { border: { display: false, dash: [4, 5] }, grid: { color: "rgba(113,159,190,.15)" }, ticks: { color: "#83a0b5", font: { family: "DM Sans", size: 10 }, callback: (v) => `${v}°` } }
    }
  };
  temperatureChart = new Chart($("temperatureChart"), {
    type: "line",
    data: { labels, datasets: [{
      label: "Temperature", data: days.map((d) => d.temp),
      borderColor: "#54a7d4", backgroundColor: (context) => {
        const chart = context.chart, area = chart.chartArea;
        if (!area) return "rgba(84,167,212,.14)";
        const gradient = chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
        gradient.addColorStop(0, "rgba(84,167,212,.32)");
        gradient.addColorStop(1, "rgba(84,167,212,.015)");
        return gradient;
      }, fill: true, tension: .42, borderWidth: 3, pointRadius: 4, pointHoverRadius: 6,
      pointBackgroundColor: "#fff", pointBorderColor: "#54a7d4", pointBorderWidth: 2
    }] },
    options: { ...commonOptions, interaction: { intersect: false, mode: "index" } }
  });
  rangeChart = new Chart($("rangeChart"), {
    type: "bar",
    data: { labels, datasets: [
      { label: "High", data: days.map((d) => d.max), backgroundColor: "#f3c578", borderRadius: 7, maxBarThickness: 17 },
      { label: "Low", data: days.map((d) => d.min), backgroundColor: "#77c4e0", borderRadius: 7, maxBarThickness: 17 }
    ] },
    options: { ...commonOptions, scales: { ...commonOptions.scales, x: { ...commonOptions.scales.x, stacked: false }, y: { ...commonOptions.scales.y, beginAtZero: false } }, datasets: { bar: { categoryPercentage: .62, barPercentage: .82 } } }
  });
}

function renderWeather(data) {
  $("locationName").textContent = `${data.city}${data.country && data.country !== "DEMO" ? `, ${data.country}` : data.demo ? " · Sample" : ""}`;
  $("description").textContent = data.description;
  $("temperature").textContent = data.temp;
  $("currentIcon").textContent = data.icon;
  $("feelsLike").textContent = `${data.feels_like}°C`;
  $("highTemp").textContent = `${data.max}°`;
  $("lowTemp").textContent = `${data.min}°`;
  $("humidity").textContent = `${data.humidity}%`;
  $("wind").textContent = `${data.wind} km/h`;
  $("pressure").textContent = `${data.pressure} hPa`;
  $("visibility").textContent = `${data.visibility} km`;
  $("humidityBar").style.width = `${Math.min(100, data.humidity)}%`;
  $("windBar").style.width = `${Math.min(100, data.wind * 2)}%`;
  $("pressureBar").style.width = `${Math.min(100, Math.max(0, (data.pressure - 950) / 1.1))}%`;
  $("visibilityBar").style.width = `${Math.min(100, data.visibility * 10)}%`;
  $("sunrise").textContent = data.sunrise;
  $("sunset").textContent = data.sunset;
  $("updatedAt").textContent = `Updated ${data.updated}`;
  $("dataMode").textContent = data.demo ? "✦ DEMO DATA" : "● LIVE WEATHER";
  $("statusText").textContent = data.demo ? "Preview mode" : "Live conditions";
  renderForecast(data.forecast);
  renderCharts(data.forecast);
}

async function loadWeather(city) {
  setNotice("");
  $("statusText").textContent = "Reading the sky…";
  const button = $("searchForm").querySelector("button");
  button.disabled = true;
  button.style.opacity = ".7";
  try {
    const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Something went wrong.");
    renderWeather(data);
    $("cityInput").value = data.city;
  } catch (error) {
    setNotice(error.message || "Could not load weather. Please try again.");
    $("statusText").textContent = "Could not update";
  } finally {
    button.disabled = false;
    button.style.opacity = "1";
  }
}

$("searchForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const city = $("cityInput").value.trim();
  if (!city) {
    setNotice("Type a city name to explore its weather.");
    $("cityInput").focus();
    return;
  }
  loadWeather(city);
});
$("todayLabel").textContent = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(new Date());
loadWeather("Hyderabad");
