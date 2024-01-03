const OPENWEATHER_API_KEY = "32542c149071351abe4519b6b8467242";
const OPENWEATHER_API_URL = "https://api.openweathermap.org/data/2.5";

const searchFormElement = document.querySelector("#search-form");
const loadingSpinner = document.getElementById("loading-spinner");

document.addEventListener("DOMContentLoaded", () => {
  // Fetch weather for the user's current location
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const city = await getCityNameByCoords(latitude, longitude);
          searchCity(`q=${city}`);
        } catch (error) {
          console.error("Error getting city name by coordinates:", error);
          showLoading(false);
        }
      },
      (error) => {
        console.error("Error getting user location:", error);
        // Handle error, maybe default to a specific city
        showLoading(false);
      }
    );
  } else {
    console.error("Geolocation not supported");
    // Handle geolocation not supported
    showLoading(false);
  }
});

searchFormElement.addEventListener("submit", handleSearchSubmit);

async function searchCity(query) {
  showLoading(true);

  try {
    // Fetch current weather data
    const currentWeatherUrl = `${OPENWEATHER_API_URL}/weather?${query}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const response = await axios.get(currentWeatherUrl);
    const currentWeatherData = response.data;

    refreshWeather(currentWeatherData);
  } catch (error) {
    console.error("Error fetching data:", error);
    showLoading(false);
  }
}

async function getCityNameByCoords(latitude, longitude) {
  try {
    const reverseGeocodingUrl = `${OPENWEATHER_API_URL}/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${OPENWEATHER_API_KEY}`;
    const response = await axios.get(reverseGeocodingUrl);
    return response.data[0]?.name || "Unknown";
  } catch (error) {
    console.error("Error fetching city name:", error);
    // Handle error, maybe return a default city
    return "Unknown";
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
  updateElement("#current-humidity", `Humidity: ${humidity}%`);
  updateElement("#current-wind", `Wind Speed: ${speed} m/s`);
  updateElement("#current-temperature", `Temperature: ${Math.round(temp)}°C`);
  updateElement(
    "#current-icon",
    `<img src="http://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon" />`
  );

  showLoading(false);
}

function updateElement(elementId, content) {
  const element = document.querySelector(elementId);
  if (element) {
    element.innerHTML = content;
  } else {
    console.error(`Element with id ${elementId} not found.`);
  }
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
