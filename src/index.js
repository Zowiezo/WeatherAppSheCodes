// API Constants
const SHECODES_API_KEY = "3tfa81d976oc0653bcbabb4fe03a6e27";
const SHECODES_WEATHER_API_URL = "https://api.shecodes.io/weather/v1";

// DOM Elements
const cityElement = document.querySelector("#city");
const timeElement = document.querySelector("#time");
const descriptionElement = document.querySelector("#description");
const humidityElement = document.querySelector("#humidity");
const windSpeedElement = document.querySelector("#wind-speed");
const temperatureElement = document.querySelector("#temperature");
const iconElement = document.querySelector("#icon");
const searchFormElement = document.querySelector("#search-form");

// Event Listener for Form Submission
searchFormElement.addEventListener("submit", handleSearchSubmit);

// Function to handle form submission
function handleSearchSubmit(event) {
  event.preventDefault();
  const searchInput = document.querySelector("#search-form-input").value;
  if (searchInput) {
    searchCity(searchInput);
  }
}

// Function to search for city weather
function searchCity(city) {
  const apiUrl = `${SHECODES_WEATHER_API_URL}/current?query=${city}&key=${SHECODES_API_KEY}&units=metric`;
  showLoading(true);

  axios
    .get(apiUrl)
    .then((response) => {
      refreshWeather(response.data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      showLoading(false);
    });
}

// Function to refresh weather information on the page
function refreshWeather(data) {
  const {
    city,
    time,
    condition: { description, icon_url },
    temperature: { current },
    humidity,
    wind: { speed },
  } = data;

  updateElement("#city", city);
  updateElement("#time", formatDate(new Date(time * 1000)));
  updateElement("#description", description);
  updateElement("#humidity", `Humidity: ${humidity}%`);
  updateElement("#wind-speed", `Wind Speed: ${speed} km/h`);
  updateElement("#temperature", `Temperature: ${Math.round(current)}°C`);
  updateElement("#icon", `<img src="${icon_url}" class="weather-app-icon" />`);

  showLoading(false);
}

// Function to update HTML element content
function updateElement(elementId, content) {
  document.querySelector(elementId).innerHTML = content;
}

// Function to show/hide loading indicator
function showLoading(isLoading) {
  const loadingSpinner = document.getElementById("loading-spinner");
  if (isLoading) {
    loadingSpinner.style.display = "block";
  } else {
    loadingSpinner.style.display = "none";
  }
}

// Function to format date
function formatDate(date) {
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const hours = date.getHours();
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const day = days[date.getDay()];

  return `${day} ${hours}:${minutes}`;
}
