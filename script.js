// Name: Joshua Roberts
// Description: Hunting Trip Logger Script

//   Function to get Location.
function getLocation() {
  // Create a new promise
  // Access the current position of the user:
  let locationPromise = new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition((pos) => {
      // Grab the lat and long
      let long = pos.coords.longitude;
      let lat = pos.coords.latitude;

      // Resolve with an object or reject if not
      resolve({ lat, long });
    }, reject);
  });

  return locationPromise;
}

// Load all saved logs from localStorage and display them
const loadLogs = () => {
  const $container = $("#logContainer");
  $container.empty();

  const logsString = localStorage.getItem("huntingLogs");

  // If nothing saved yet
  if (!logsString) {
    $container.html("<p>No hunting logs saved yet.</p>");
    return;
  }

  let logs;

  try {
    logs = JSON.parse(logsString);
  } catch (err) {
    console.error("Error parsing huntingLogs from localStorage", err);
    $container.html("<p>There was an issue reading your saved logs.</p>");
    return;
  }

  if (!Array.isArray(logs) || logs.length === 0) {
    $container.html("<p>No hunting logs saved yet.</p>");
    return;
  }

  // Build an entry for each log
  logs.forEach((log) => {
    const latitudeText =
      typeof log.latitude === "number" ? log.latitude.toFixed(6) : log.latitude;

    const longitudeText =
      typeof log.longitude === "number"
        ? log.longitude.toFixed(6)
        : log.longitude;

    const temperatureText =
      log.temperature !== null && log.temperature !== undefined
        ? log.temperature + " °F"
        : "N/A";

    const entryHtml = `
      <div class="entry">
        <p><strong>Date:</strong> ${log.date || ""}</p>
        <p><strong>Location:</strong> ${latitudeText}, ${longitudeText}</p>
        <p><strong>Sunrise:</strong> ${log.sunriseTime || ""}</p>
        <p><strong>Sunset:</strong> ${log.sunsetTime || ""}</p>
        <p><strong>Temperature:</strong> ${temperatureText}</p>
        <p><strong>Notes:</strong> ${log.notes || ""}</p>
      </div>
    `;

    $container.append(entryHtml);
  });
};

// Save a single log entry into localStorage
const saveLogEntry = (entry) => {
  const key = "huntingLogs";
  const existing = localStorage.getItem(key);

  let logsArray = [];

  if (existing) {
    try {
      logsArray = JSON.parse(existing);
      if (!Array.isArray(logsArray)) {
        logsArray = [];
      }
    } catch (err) {
      console.error("Error parsing existing logs, resetting array", err);
      logsArray = [];
    }
  }

  logsArray.push(entry);
  localStorage.setItem(key, JSON.stringify(logsArray));
};

// Run when the page is ready
$("body").ready(() => {
  // Show logs that were already saved
  loadLogs();

  // Handle the form submit
  $("#tripForm").on("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const tripDate = formData.get("tripDate");
    const notes = formData.get("notes") || "";

    if (!tripDate) {
      alert("Please select a date for your hunting trip.");
      return;
    }

    try {
      // Get current location (lat/long)
      const location = await getLocation();
      const lat = location.lat;
      const long = location.long;

      // Build Open-Meteo URL
      const apiUrl =
        "https://api.open-meteo.com/v1/forecast" +
        "?latitude=" +
        lat +
        "&longitude=" +
        long +
        "&daily=sunrise,sunset" +
        "&current=temperature_2m" +
        "&timezone=auto" +
        "&forecast_days=1" +
        "&temperature_unit=fahrenheit";

      // Call the API with Axios
      const { data } = await axios.get(apiUrl);

      let sunriseTime = "";
      let sunsetTime = "";
      let temperature = null;

      // Sunrise / sunset (daily arrays)
      if (data && data.daily) {
        if (
          Array.isArray(data.daily.sunrise) &&
          data.daily.sunrise.length > 0
        ) {
          sunriseTime = data.daily.sunrise[0];
        }
        if (Array.isArray(data.daily.sunset) && data.daily.sunset.length > 0) {
          sunsetTime = data.daily.sunset[0];
        }
      }

      // Current temperature – handle either "current" or "current_weather"
      if (data && data.current && data.current.temperature_2m !== undefined) {
        temperature = data.current.temperature_2m;
      } else if (
        data &&
        data.current_weather &&
        data.current_weather.temperature !== undefined
      ) {
        temperature = data.current_weather.temperature;
      }

      // Build log entry object
      const logEntry = {
        date: tripDate,
        notes: notes,
        latitude: lat,
        longitude: long,
        sunriseTime: sunriseTime,
        sunsetTime: sunsetTime,
        temperature: temperature,
      };

      // Save and refresh UI
      saveLogEntry(logEntry);
      loadLogs();

      // Clear form
      this.reset();
    } catch (err) {
      console.error("Error saving hunting log", err);
      alert(
        "There was a problem getting your location or weather data. Please check location permissions and try again."
      );
    }
  });
});
