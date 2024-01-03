const OPENWEATHER_API_KEY = "32542c149071351abe4519b6b8467242";
const OPENWEATHER_API_URL = "https://api.openweathermap.org/data/2.5";

const searchFormElement = document.querySelector("#search-form");
const loadingSpinner = document.getElementById("loading-spinner");

document.addEventListener("DOMContentLoaded", () => {
  // Fetch weather for the user's current location
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const city = await getCityNameByCoords(latitude, longitude);
        searchCity(`q=${city}`);
      },
      (error) => {
        console.error("Error getting user location:", error);
        // Handle error, maybe default to a specific city
      }
    );
  } else {
    console.error("Geolocation not supported");
    // Handle geolocation not supported
  }
});

searchFormElement.addEventListener("submit", handleSearchSubmit);

async function handleSearchSubmit(event) {
  event.preventDefault();
  const searchInput = document.querySelector("#search-input").value;
  if (searchInput) {
    await searchCity(`q=${searchInput}`);
  }
}

async function searchCity(query) {
  showLoading(true);

  try {
    // Fetch current weather data
    const currentWeatherUrl = `${OPENWEATHER_API_URL}/weather?${query}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const response = await axios.get(currentWeatherUrl);
    const currentWeatherData = response.data;

    refreshWeather(currentWeatherData);

    // Fetch 5-day forecast
    const forecastUrl = `${OPENWEATHER_API_URL}/forecast?${query}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const forecastResponse = await axios.get(forecastUrl);
    const forecastData = forecastResponse.data;

    displayForecast(forecastData);
  } catch (error) {
    console.error("Error fetching data:", error);
    showLoading(false);
  }
}

async function getCityNameByCoords(latitude, longitude) {
  const reverseGeocodingUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${OPENWEATHER_API_KEY}`;

  try {
    const response = await axios.get(reverseGeocodingUrl);
    const city = response.data[0]?.name || "Unknown";
    return city;
  } catch (error) {
    console.error("Error fetching city name:", error);
    // Handle error, maybe return a default city
    return "DefaultCity";
  }
}

function refreshWeather(data) {
  const {
    name: city,
    dt: time,
    weather: [{ description, icon }],
    main: { humidity, temp },
    wind: { speed },
  } = data;

  updateElement("#current-city", city);
  updateElement("#current-date", formatDate(new Date(time * 1000)));
  updateElement("#current-description", description);

  // Add classes to style humidity and wind differently
  updateElement(
    "#current-humidity",
    `<span class="humidity">${humidity}%</span>`
  );
  updateElement("#current-wind", `<span class="wind">${speed} m/s</span>`);

  updateElement("#current-temperature", `${Math.round(temp)}°C`);
  updateElement(
    "#current-icon",
    `<img src="http://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon" />`
  );

  showLoading(false);
}

function displayForecast(data) {
  const forecastElement = document.getElementById("forecast");
  forecastElement.innerHTML = ""; // Clear previous forecast data

  const forecastList = data.list;

  // Display the forecast for the next 5 days
  for (let i = 0; i < forecastList.length; i += 8) {
    const forecast = forecastList[i];
    const {
      dt,
      main: { temp_min, temp_max },
      weather: [{ icon }],
    } = forecast;

    const forecastDate = new Date(dt * 1000);
    const dayOfWeek = forecastDate.toLocaleDateString("en-US", {
      weekday: "short",
    });

    const forecastHtml = `
        <div class="forecast-day">
          <div class="forecast-date">${dayOfWeek}</div>
          <img src="http://openweathermap.org/img/wn/${icon}.png" alt="Forecast Icon" />
          <div class="forecast-temperatures">
          <div class="forecast-temperature">
            <strong>${Math.round(temp_max)}°C</strong> ${Math.round(temp_min)}°C
          </div>
          </div>
        </div>
      `;

    forecastElement.innerHTML += forecastHtml;
  }

  showLoading(false);
}

function updateElement(elementId, content) {
  document.querySelector(elementId).innerHTML = content;
}

function showLoading(isLoading) {
  if (loadingSpinner) {
    loadingSpinner.style.display = isLoading ? "block" : "none";
  } else {
    console.error("Loading spinner element not found.");
  }
}

function formatDate(date) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}
