// API key for OpenWeatherMap

const API_KEY = "0ffbba88c429e73c2b0b7df517398d3c";


const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const errorMsg = document.getElementById("errorMsg");
const currentWeather = document.getElementById("currentWeather");
const cityNameEl = document.getElementById("cityName");
const tempEl = document.getElementById("temperature");
const conditionEl = document.getElementById("condition");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const toggleUnitBtn = document.getElementById("toggleUnit");
const alertBox = document.getElementById("alertBox");
const forecastDiv = document.getElementById("forecast");
const recentCitiesSelect = document.getElementById("recentCities");

let isCelsius = true;
let currentTempC = 0;

/* EVENTS */
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) return showError("Please enter a city name");
  fetchWeatherByCity(city);
});

locationBtn.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    pos => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
    () => showError("Location access denied")
  );
});

toggleUnitBtn.addEventListener("click", () => {
  if (isCelsius) {
    tempEl.textContent = ((currentTempC * 9) / 5 + 32).toFixed(1) + " °F";
    toggleUnitBtn.textContent = "°C";
  } else {
    tempEl.textContent = currentTempC + " °C";
    toggleUnitBtn.textContent = "°F";
  }
  isCelsius = !isCelsius;
});

recentCitiesSelect.addEventListener("change", () => {
  if (recentCitiesSelect.value) {
    fetchWeatherByCity(recentCitiesSelect.value);
  }
});

/* FUNCTIONS */
function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove("hidden");
}

function clearError() {
  errorMsg.classList.add("hidden");
}

// Fetch weather data using city names
function fetchWeatherByCity(city) {
  clearError();
  saveCity(city);

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) return showError("City not found");
      displayCurrent(data);
      fetchForecast(data.coord.lat, data.coord.lon);
    });
}

function fetchWeatherByCoords(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      displayCurrent(data);
      fetchForecast(lat, lon);
    });
}

function displayCurrent(data) {
  currentWeather.classList.remove("hidden");

  cityNameEl.textContent = data.name;
  conditionEl.textContent = data.weather[0].description;
  currentTempC = data.main.temp;

  tempEl.textContent = currentTempC + " °C";
  toggleUnitBtn.textContent = "°F";
  isCelsius = true;

  humidityEl.textContent = data.main.humidity;
  windEl.textContent = data.wind.speed;

  setBackground(data.weather[0].main);

  if (currentTempC > 40) {
    alertBox.textContent = "⚠ Extreme Heat Alert!";
    alertBox.classList.remove("hidden");
  } else {
    alertBox.classList.add("hidden");
  }
}

function fetchForecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      forecastDiv.innerHTML = "";
      const days = data.list.filter(item => item.dt_txt.includes("12:00:00"));

      days.slice(0, 5).forEach(day => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <p>${new Date(day.dt_txt).toDateString()}</p>
          <p>🌡 ${day.main.temp} °C</p>
          <p>💧 ${day.main.humidity}%</p>
          <p>💨 ${day.wind.speed} km/h</p>
        `;
        forecastDiv.appendChild(card);
      });
    });
}

function setBackground(type) {
  document.body.className = "";
  if (type === "Rain") document.body.classList.add("rain");
  else if (type === "Clear") document.body.classList.add("clear");
  else document.body.classList.add("clouds");
}

/* RECENT CITIES */
function saveCity(city) {
  let cities = JSON.parse(localStorage.getItem("cities")) || [];
  if (!cities.includes(city)) cities.unshift(city);
  localStorage.setItem("cities", JSON.stringify(cities.slice(0, 5)));
  loadCities();
}

function loadCities() {
  const cities = JSON.parse(localStorage.getItem("cities")) || [];
  if (cities.length === 0) return;

  recentCitiesSelect.classList.remove("hidden");
  recentCitiesSelect.innerHTML =
    `<option value="">Recently searched cities</option>` +
    cities.map(c => `<option value="${c}">${c}</option>`).join("");
}

loadCities();
