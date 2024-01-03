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

searchFormElement.addEventListener("submit", async (event) => {
  event.preventDefault();
  const searchInput = document.querySelector("#search-input").value;
  if (searchInput) {
    await searchCity(`q=${searchInput}`);
  }
});

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
  const reverseGeocodingUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${OPENWEATHER_API_KEY}`;
  const response = await axios.get(reverseGeocodingUrl);
  return response.data[0]?.name || "Unknown";
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
