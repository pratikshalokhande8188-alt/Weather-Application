const API_KEY = '2833164ab887ad6aae4c494f660d1e5d'; 
const BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherInfo = document.getElementById('weather-info');
const errorMsg = document.getElementById('error-message');
const spinner = document.getElementById('loading-spinner');

const cityName = document.getElementById('city-name');
const weatherCondition = document.getElementById('weather-condition');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const forecastContainer = document.getElementById('forecast-container');

searchBtn.addEventListener('click', performSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

function performSearch() {
    const city = cityInput.value.trim();
    if (city === "") {
        showError("Please enter a city name first!");
        return;
    }
    getWeatherAndForecastData(city);
}

async function getWeatherAndForecastData(city) {
    spinner.classList.remove('hidden');
    weatherInfo.classList.add('hidden');
    errorMsg.classList.add('hidden');

    const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('City not found. Please check spelling!');
        }
        const data = await response.json();
        displayAllWeatherData(data);
    } catch (error) {
        showError(error.message);
    } finally {
        spinner.classList.add('hidden');
    }
}

function displayAllWeatherData(data) {
    errorMsg.classList.add('hidden');
    weatherInfo.classList.remove('hidden');

    const current = data.list[0];
    cityName.textContent = `${data.city.name}, ${data.city.country}`;
    weatherCondition.textContent = current.weather[0].description;
    
    temperature.textContent = Math.round(current.main.temp);
    humidity.textContent = current.main.humidity;
    windSpeed.textContent = current.wind.speed;

    const iconCode = current.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    
    updateBackground(current.weather[0].main);

    forecastContainer.innerHTML = ''; 
    
    const dailyRecords = data.list.filter(item => item.dt_txt.includes("12:00:00"));
    const displays = dailyRecords.length > 0 ? dailyRecords : data.list.filter((_, i) => i % 8 === 0);

    displays.slice(0, 5).forEach(dayData => {
        const date = new Date(dayData.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const cardTemp = Math.round(dayData.main.temp);
        const cardIcon = dayData.weather[0].icon;

        const card = document.createElement('div');
        card.classList.add('forecast-card');
        card.innerHTML = `
            <div class="day-name">${dayName}</div>
            <img src="https://openweathermap.org/img/wn/${cardIcon}@2x.png" alt="forecast icon">
            <div class="forecast-temp">${cardTemp}°C</div>
        `;
        forecastContainer.appendChild(card);
    });
}

function showError(message) {
    weatherInfo.classList.add('hidden');
    errorMsg.classList.remove('hidden');
    errorMsg.textContent = message;
    document.body.className = 'default-bg';
}

function updateBackground(weatherMain) {
    document.body.className = ''; 
    switch (weatherMain.toLowerCase()) {
        case 'clear': document.body.classList.add('clear-bg'); break;
        case 'clouds': document.body.classList.add('clouds-bg'); break;
        case 'rain':
        case 'drizzle':
        case 'thunderstorm': document.body.classList.add('rain-bg'); break;
        case 'snow': document.body.classList.add('snow-bg'); break;
        default: document.body.classList.add('default-bg'); break;
    }
}
