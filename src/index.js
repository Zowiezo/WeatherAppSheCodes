const searchFormElement = document.querySelector("#search-form");
const loadingSpinner = document.getElementById("loading-spinner");

searchFormElement.addEventListener("submit", handleSearchSubmit);

function handleSearchSubmit(event) {
  event.preventDefault();
  const searchInput = document.querySelector("#search-form-input").value;
  if (searchInput) {
    searchCity(searchInput);
  }
}

async function searchCity(city) {
  showLoading(true);

  try {
    // Fetch current weather data
    const currentWeatherUrl = `${OPENWEATHER_API_URL}/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const response = await axios.get(currentWeatherUrl);
    const currentWeatherData = response.data;

    refreshWeather(currentWeatherData);

    // Fetch 5-day forecast
    const forecastUrl = `${OPENWEATHER_API_URL}/forecast?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const forecastResponse = await axios.get(forecastUrl);
    const forecastData = forecastResponse.data;

    displayForecast(forecastData);
  } catch (error) {
    console.error("Error fetching data:", error);
    showLoading(false);
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

  updateElement("#city", city);
  updateElement("#time", formatDate(new Date(time * 1000)));
  updateElement("#description", description);
  updateElement("#humidity", `Humidity: ${humidity}%`);
  updateElement("#wind-speed", `Wind Speed: ${speed} m/s`);
  updateElement("#temperature", `Temperature: ${Math.round(temp)}°C`);
  updateElement(
    "#icon",
    `<img src="http://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon" />`
  );

  showLoading(false);
}

function displayForecast(data) {
  const forecastElement = document.getElementById("forecast");
  forecastElement.innerHTML = ""; // Clear previous forecast data

  const forecastList = data.list;
  const forecastDays = {};

  // Group forecast data by date
  forecastList.forEach((forecast) => {
    const date = new Date(forecast.dt * 1000);
    const day = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;

    if (!forecastDays[day]) {
      forecastDays[day] = [];
    }

    forecastDays[day].push(forecast);
  });

  // Display the first forecast entry for each day
  for (const day in forecastDays) {
    const firstForecast = forecastDays[day][0];
    const {
      dt,
      main: { temp_min, temp_max },
      weather: [{ icon }],
    } = firstForecast;

    const forecastHtml = `
                    <div class="forecast-day">
                        <div class="forecast-date">${formatDate(
                          new Date(dt * 1000)
                        )}</div>
                        <div class="forecast-temperature">
                            <strong>${Math.round(
                              temp_max
                            )}°C</strong> / ${Math.round(temp_min)}°C
                        </div>
                        <img src="http://openweathermap.org/img/wn/${icon}.png" alt="Forecast Icon" />
                    </div>
                `;

    forecastElement.innerHTML += forecastHtml;
  }
}

function updateElement(elementId, content) {
  document.querySelector(elementId).innerHTML = content;
}

function showLoading(isLoading) {
  loadingSpinner.style.display = isLoading ? "block" : "none";
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
