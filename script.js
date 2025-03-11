function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // Month is zero-indexed
    const day = now.getDate();
    return new Date(year, month, day);
}

function calculateSunset(latitude, longitude, date) {
    // Convert latitude and longitude to radians
    const phi = latitude * Math.PI / 180;
    const lambda_ = longitude * Math.PI / 180;

    // Calculate the Julian Day (JD)
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const n = (date - startOfYear) / (1000 * 60 * 60 * 24);
    const jd = n + 1.0008;

    // Calculate the solar noon (in days since 2000-01-01 12:00 UTC)
    const J = jd - longitude / 360;

    // Calculate the solar mean anomaly (M)
    let M = (357.5291 + 0.98560028 * J) % 360;
    const M_rad = M * Math.PI / 180;

    // Calculate the equation of center (C)
    const C = 1.9148 * Math.sin(M_rad) + 0.0200 * Math.sin(2 * M_rad) + 0.0003 * Math.sin(3 * M_rad);

    // Calculate the ecliptic longitude (lambda_sun)
    let lambda_sun = (M + C + 180 + 102.9372) % 360;
    const lambda_sun_rad = lambda_sun * Math.PI / 180;

    // Calculate the Sun's declination (delta)
    const delta = Math.asin(Math.sin(lambda_sun_rad) * Math.sin(23.44 * Math.PI / 180));

    // Calculate the hour angle (H)
    const zenith = 90.83 * Math.PI / 180;  // Official sunset zenith
    const cos_H = (Math.cos(zenith) - Math.sin(phi) * Math.sin(delta)) / (Math.cos(phi) * Math.cos(delta));
    const H = Math.acos(Math.min(Math.max(cos_H, -1), 1));  // Ensure cos_H is within valid range

    // Convert hour angle to hours
    const H_deg = H * 180 / Math.PI;
    const H_hours = H_deg / 15;

    // Calculate solar noon and sunset time
    const solar_noon = 2451545.0009 + J + 0.0053 * Math.sin(M_rad) - 0.0069 * Math.sin(2 * lambda_sun_rad);
    const sunset_jd = solar_noon + H_hours / 24;

    // Convert Julian Day to datetime
    const sunset_utc = new Date(Date.UTC(2000, 0, 1, 12) + (sunset_jd - 2451545.0) * 86400000);
    //alert(sunset_utc)
    return sunset_utc;
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}

// Function to get user's location and calculate sunset
/*function getUserLocationAndCalculateSunset() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                // Update location text
                document.getElementById("location").textContent = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;

                // Get current date
                const date = getCurrentDate();

                // Calculate sunset in UTC
                const sunset_utc = calculateSunset(latitude, longitude, date);

                // Adjust for local time (Bangladesh Standard Time, UTC+6)
                const timezoneOffset = 6;
                const sunset_local = new Date(sunset_utc.getTime() + timezoneOffset * 60 * 60 * 1000);

                // Display results
                document.getElementById("date").textContent = date.toDateString();
                document.getElementById("sunsetUTC").textContent = formatTime(sunset_utc);
                document.getElementById("sunsetLocal").textContent = formatTime(sunset_local);
            },
            (error) => {
                // Handle errors
                if (error.code === error.PERMISSION_DENIED) {
                    alert("Please enable your location services to use this feature.");
                } else {
                    console.error("Error fetching location:", error);
                    alert("Unable to retrieve your location. Please try again later.");
                }
                document.getElementById("location").textContent = "Location unavailable.";
            }
        );
    } else {
        console.error("Geolocation is not supported by this browser.");
        alert("Your browser does not support geolocation. Please use a modern browser.");
        document.getElementById("location").textContent = "Geolocation not supported.";
    }
}

// Call the function to get location and calculate sunset
getUserLocationAndCalculateSunset();
*/
function getUserLocationAndCalculateSunset() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                // Update location text
                document.getElementById("location").textContent = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;

                // Get current date
                const date = getCurrentDate();

                // Calculate sunset in UTC
                const sunset_utc = calculateSunset(latitude, longitude, date);

                // Adjust for local time (Bangladesh Standard Time, UTC+6)
                const timezoneOffset = 6;
                const sunset_local = new Date(sunset_utc.getTime() + timezoneOffset * 60 * 60 * 1000);

                // Display results
                document.getElementById("date").textContent = date.toDateString();
                document.getElementById("sunsetUTC").textContent = formatTime(sunset_local);
                
                document.getElementById("sunsetLocal").textContent = formatTime(sunset_utc);

                // Save sunset local time in localStorage
                localStorage.setItem("sunsetLocalTime", sunset_local.toISOString());
                console.log("Sunset local time saved to localStorage:", sunset_local.toISOString());
            },
            (error) => {
                // Handle errors
                if (error.code === error.PERMISSION_DENIED) {
                    alert("Please enable your location services to use this feature.");
                } else {
                    console.error("Error fetching location:", error);
                    alert("Unable to retrieve your location. Please try again later.");
                }
                document.getElementById("location").textContent = "Location unavailable.";
            }
        );
    } else {
        console.error("Geolocation is not supported by this browser.");
        alert("Your browser does not support geolocation. Please use a modern browser.");
        document.getElementById("location").textContent = "Geolocation not supported.";
    }
}

// Call the function to get location and calculate sunset
getUserLocationAndCalculateSunset();