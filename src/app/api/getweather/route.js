import { fetchWeatherApi } from 'openmeteo';

// This function handles a POST request to fetch weather data
export async function POST(req) {
    try {
        // Parse the request body for location data (latitude and longitude)
        const { latitude, longitude } = { latitude: 40.813958, longitude: -73.5996}; // Expecting latitude and longitude in the body

        // Default to New York if no latitude and longitude provided
        const params = {
            latitude: latitude,  // Default to New York latitude
            longitude: longitude, // Default to New York longitude
            current: ["temperature_2m", "weather_code", "wind_speed_10m"],
            hourly: "precipitation",
            temperature_unit: "fahrenheit",
            wind_speed_unit: "mph",
            precipitation_unit: "inch",
            forecast_days: 1
        };

        const url = "https://api.open-meteo.com/v1/forecast";

        // Fetch weather data from the Open-Meteo API
        const responses = await fetchWeatherApi(url, params);

        // Assuming there's only one response (first location), process it
        const response = responses[0];
        const utcOffsetSeconds = response.utcOffsetSeconds();
        const timezone = response.timezone();
        const current = response.current();
        const hourly = response.hourly();

        // Helper function to form time ranges (if needed for further processing)
        const range = (start, stop, step) =>
            Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

        // Prepare the weather data
        const weatherData = {
            timezone,
            latitude: response.latitude(),
            longitude: response.longitude(),
            current: {
            time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
            temperature2m: current.variables(0) ? current.variables(0).value() : null,
            weatherCode: current.variables(1) ? current.variables(1).value() : null,
            windSpeed10m: current.variables(2) ? current.variables(2).value() : null,
            },
            hourly: {
            time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
                (t) => new Date((t + utcOffsetSeconds) * 1000)
            ),
            precipitation: hourly.variables(0) ? hourly.variables(0).valuesArray() : [],
            averagePrecipitation: hourly.variables(0) ? 
            Math.round(hourly.variables(0).valuesArray().reduce((sum, value) => sum + value, 0) / hourly.variables(0).valuesArray().length * 100) : 0,
            },
        };

        console.log('Weather Data:', weatherData);

        // Return the weather data as the response
        return new Response(JSON.stringify({ message: 'Weather data fetched successfully', data: weatherData }), {
            status: 200,
        });
    } catch (error) {
        console.error('Error processing the request:', error);
        return new Response(JSON.stringify({ message: 'Error processing the request' }), { status: 500 });
    }
}
