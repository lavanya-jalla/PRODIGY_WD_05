let tempChart = null;
let humidityChart = null;
let windChart = null;
let rainChart = null;

window.onload = () => {
  navigator.geolocation.getCurrentPosition(
    pos => loadWeather(pos.coords.latitude, pos.coords.longitude),
    () => {}
  );
};


async function loadWeather(lat, lon) {
  const w = await fetch(`/weather?lat=${lat}&lon=${lon}`);
  const weather = await w.json();

  const f = await fetch(`/forecast?lat=${lat}&lon=${lon}`);
  const forecast = await f.json();

 
  document.getElementById("city").innerText = weather.name;
  document.getElementById("temp").innerText = weather.main.temp + "°C";
  document.getElementById("desc").innerText = weather.weather[0].description;
  document.getElementById("icon").src =
    `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;

  document.getElementById("feels").innerText = weather.main.feels_like;
  document.getElementById("humidity").innerText = weather.main.humidity;
  document.getElementById("wind").innerText = weather.wind.speed;
  document.getElementById("pressure").innerText = weather.main.pressure;
  document.getElementById("visibility").innerText = (weather.visibility / 1000).toFixed(1);
  document.getElementById("minmax").innerText =
    `${weather.main.temp_min}° / ${weather.main.temp_max}°`;

  document.getElementById("sunrise").innerText =
    new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  document.getElementById("sunset").innerText =
    new Date(weather.sys.sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // APPLY BACKGROUND + THEME
  applyTheme(weather);

  // FORECAST (NEXT HOURS)
  const hours = forecast.list.slice(0, 10);
  const hourlyLabels = hours.map(i =>
    new Date(i.dt_txt).toLocaleTimeString([], { hour: "2-digit" })
  );

  // TEMPERATURE CHART
  drawTempChart(hourlyLabels, hours.map(i => i.main.temp));

  // HUMIDITY CHART
  drawHumidityChart(hourlyLabels, hours.map(i => i.main.humidity));

  // WIND CHART
  drawWindChart(hourlyLabels, hours.map(i => i.wind.speed));

  // RAIN CHART
  drawRainChart(hourlyLabels, hours.map(i => (i.pop || 0) * 100));

  // 5-DAY FORECAST
  renderFiveDayForecast(forecast.list);
}

// APPLY WEATHER BACKGROUNDS + AUTO DAY/NIGHT
function applyTheme(weather) {
  const body = document.body;
  body.className = "";

  const cond = weather.weather[0].main.toLowerCase();
  const now = Date.now() / 1000;

  if (cond.includes("rain")) body.classList.add("rainy");
  else if (cond.includes("cloud")) body.classList.add("cloudy");
  else if (cond.includes("snow")) body.classList.add("snowy");
  else if (cond.includes("thunder")) body.classList.add("thunder");
  else body.classList.add("sunny");

  if (now > weather.sys.sunrise && now < weather.sys.sunset) {
    body.classList.add("day-mode");
  } else {
    body.classList.add("night-mode");
  }
}

/* -------------------- CHARTS ----------------------- */

// TEMP CHART
function drawTempChart(labels, data) {
  if (tempChart) tempChart.destroy();

  const ctx = document.getElementById("tempChart");

  const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 350);
  gradient.addColorStop(0, "rgba(0, 200, 255, 0.7)");
  gradient.addColorStop(1, "rgba(0, 200, 255, 0.05)");

  tempChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "°C",
        data,
        borderColor: "#00e5ff",
        backgroundColor: gradient,
        borderWidth: 4,
        pointRadius: 5,
        pointHoverRadius: 10,
        tension: 0.35,
        fill: true,
      }]
    },
    options: baseChartOptions()
  });
}

// HUMIDITY BAR CHART
function drawHumidityChart(labels, data) {
  if (humidityChart) humidityChart.destroy();

  humidityChart = new Chart(document.getElementById("humidityChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "%",
        data,
        backgroundColor: "rgba(0, 200, 255, 0.6)",
      }]
    },
    options: baseChartOptions()
  });
}

// WIND SPEED
function drawWindChart(labels, data) {
  if (windChart) windChart.destroy();

  windChart = new Chart(document.getElementById("windChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "km/h",
        data,
        borderColor: "#00f2ff",
        borderWidth: 3,
        tension: 0.35
      }]
    },
    options: baseChartOptions()
  });
}

// RAIN PROBABILITY
function drawRainChart(labels, data) {
  if (rainChart) rainChart.destroy();

  rainChart = new Chart(document.getElementById("rainChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "%",
        data,
        fill: true,
        backgroundColor: "rgba(0, 150, 255, 0.3)",
        borderColor: "#0096ff",
        borderWidth: 3
      }]
    },
    options: baseChartOptions()
  });
}

// COMMON OPTIONS
function baseChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: "#fff" },
        grid: { color: "rgba(255,255,255,0.1)" }
      },
      y: {
        ticks: { color: "#fff" },
        grid: { color: "rgba(255,255,255,0.1)" }
      }
    },
    plugins: {
      legend: {
        labels: { color: "#fff" }
      }
    }
  };
}

/* -------------------- FORECAST ----------------------- */

function renderFiveDayForecast(list) {
  const box = document.getElementById("forecast");
  box.innerHTML = "";

  const days = {};

  list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!days[date]) days[date] = [];
    days[date].push(item);
  });

  Object.keys(days).slice(0, 5).forEach(day => {
    const arr = days[day];
    const avgTemp = (arr.reduce((a, b) => a + b.main.temp, 0) / arr.length).toFixed(1);
    const icon = arr[0].weather[0].icon;
    const desc = arr[0].weather[0].description;

    box.innerHTML += `
      <div class="forecast-card">
        <h4>${new Date(day).toDateString()}</h4>
        <img src="https://openweathermap.org/img/wn/${icon}.png">
        <p>${desc}</p>
        <h3>${avgTemp}°C</h3>
      </div>
    `;
  });
}

// SEARCH CITY
function searchCity() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return alert("Enter a city name");

  fetch(`/weather?city=${city}`)
    .then(r => r.json())
    .then(d => loadWeather(d.coord.lat, d.coord.lon))
    .catch(() => alert("City not found"));
}
