let mockData = {};
let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];

async function fetchMockData() {
  const res = await fetch('weatherData.json');
  mockData = await res.json();
}

function updateUI(data) {
  document.getElementById("temperature").textContent = `Temperature: ${data.current.temperature}°C`;
  document.getElementById("humidity").textContent = `Humidity: ${data.current.humidity}%`;
  document.getElementById("wind").textContent = `Wind: ${data.current.windSpeed} km/h`;
  document.getElementById("condition").textContent = `Condition: ${data.current.condition}`;

  const forecastContainer = document.getElementById("forecastDays");
  forecastContainer.innerHTML = "";
  data.forecast.forEach(day => {
    forecastContainer.innerHTML += `
      <div class="forecast-day">
        <strong>${day.day}</strong><br>
        H: ${day.high}°C<br>
        L: ${day.low}°C
      </div>
    `;
  });

  updateChart(data.forecast);
}

function updateChart(forecast) {
  const ctx = document.getElementById("chartCanvas").getContext("2d");
  if (window.weatherChart) window.weatherChart.destroy();
  window.weatherChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: forecast.map(day => day.day),
      datasets: [
        {
          label: 'High Temp (°C)',
          data: forecast.map(day => day.high),
          borderColor: '#f44336',
          fill: false
        },
        {
          label: 'Low Temp (°C)',
          data: forecast.map(day => day.low),
          borderColor: '#2196f3',
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}

function updateHistory(city) {
  if (!history.includes(city)) {
    history.unshift(city);
    if (history.length > 5) history.pop();
    localStorage.setItem("weatherHistory", JSON.stringify(history));
    renderHistory();
  }
}

function renderHistory() {
  const list = document.getElementById("searchHistory");
  list.innerHTML = "";
  history.forEach(city => {
    const li = document.createElement("li");
    li.textContent = city;
    list.appendChild(li);
  });
}

async function searchWeather() {
  const city = document.getElementById("cityInput").value.trim();
  const errorMsg = document.getElementById("errorMsg");

  if (!city) {
    errorMsg.textContent = "Please enter a city.";
    return;
  }

  await fetchMockData();

  if (city.toLowerCase() !== mockData.city.toLowerCase()) {
    errorMsg.textContent = "City not found in mock data.";
    return;
  }

  errorMsg.textContent = "";
  updateUI(mockData);
  updateHistory(city);
}

renderHistory();
fetchMockData().then(() => updateUI(mockData));
