function displayTemperature(city, temperature) {
  document.querySelector("#current-city").innerHTML = city;
  document.querySelector("#current-temperature").innerHTML =
    Math.round(temperature);
}

function search(event) {
  event.preventDefault();
  const searchInputElement = document.querySelector("#search-input");
  const city = searchInputElement.value;

  const apiKey = "3tfa81d976oc0653bcbabb4fe03a6e27";
  const apiUrl = `https://api.shecodes.io/weather/v1/current?query=${city}&key=${apiKey}&units=metric`;

  axios
    .get(apiUrl)
    .then((response) => {
      const { city, temperature } = response.data;
      displayTemperature(city, temperature.current);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

function formatDate(date) {
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const day = date.getDay();

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const formattedDay = days[day];
  return `${formattedDay} ${hours}:${minutes}`;
}

const searchForm = document.querySelector("#search-form");
searchForm.addEventListener("submit", search);

const currentDateElement = document.querySelector("#current-date");
const currentDate = new Date();
currentDateElement.innerHTML = formatDate(currentDate);
