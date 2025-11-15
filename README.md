# Hunting Log

A small assignment to build a hunting log web app that captures date and notes from a form, grabs the user's geolocation, fetches sunrise/sunset and current temperature data from the Open-Meteo API, and stores log entries in `localStorage`. The app displays saved logs using jQuery.

---

## Features

* Collects date and notes via `FormData`.
* Uses `navigator.geolocation` (via a helper `getLocation()` that returns a `Promise`) to obtain latitude and longitude.
* Fetches weather data (sunrise, sunset, current temperature) from Open-Meteo using Axios.
* Persists log entries in `localStorage` under the key `huntingLogs` as an array of objects.
* Renders saved logs into the page using jQuery.

---

## API URL template

Replace `LAT` and `LONG` with the user's coordinates:

```
https://api.open-meteo.com/v1/forecast?latitude=LAT&longitude=LONG&daily=sunrise,sunset&current=temperature_2m&timezone=auto&forecast_days=1&temperature_unit=fahrenheit
```

---

## Log entry shape

Each saved log should be an object with at least the following fields:

```js
{
  latitude: <number>,
  longitude: <number>,
  date: "YYYY-MM-DD",   // string from the form
  sunriseTime: DATEIME from API,
  sunsetTime: DATETIME from API,
  notes: "notes from form string",
  temperature: <number> // current temperature from API
}
```

---

## TODO 1 — Handle form submission (implementation steps)

1. Using jQuery create a submit event for the form.
2. On form `submit` event, call `event.preventDefault()`.
3. Create a `FormData` instance from the form and extract `date` and `notes`.
4. Call `getLocation()` (which returns a `Promise`) to obtain `{ latitude, longitude }`.
5. Build the Open-Meteo URL from the coordinates and fetch the weather using Axios.
   * Read `daily.sunrise[0]` and `daily.sunset[0]` (or the appropriate fields returned by the API) and `current_weather`/`temperature_2m` if available.
5. Construct a `logEntry` object matching the shape above (include `notes` from the form).
6. Save the entry to `localStorage` under the key `huntingLogs`:
   * If `huntingLogs` exists, `JSON.parse()` it, push the new entry, then `JSON.stringify()` and save.
   * If not, create a new array containing the entry and save it.
7. Call `loadLogs()` to refresh the UI.

---

## TODO 2 — loadLogs() (displaying logs with jQuery)

1. Read the `huntingLogs` value from `localStorage`.
2. If it exists, `JSON.parse()` it into an array.
3. If the array is empty, render a friendly "no logs" message.
4. Otherwise, iterate (or map) over the array and build HTML for each log item. Include:

   * Date
   * Coordinates (latitude/longitude)
   * Sunrise and sunset times
   * Notes 
   * Temperature
5. Use jQuery to set the container's HTML

6. Call `loadLogs()` once on page load so previously saved logs are shown automatically.
