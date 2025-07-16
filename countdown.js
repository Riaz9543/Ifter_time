// Countdown functionality for Iftar time
let countdownInterval;
let iftarTime;
let currentLocation = '';

// Helper function to format time consistently
function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: true 
    });
}

// Calculate sunset time (same logic as main script)
function calculateSunset(latitude, longitude, date) {
    const phi = latitude * Math.PI / 180;
    const lambda_ = longitude * Math.PI / 180;

    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const n = (date - startOfYear) / (1000 * 60 * 60 * 24);
    const jd = n + 1.0008;

    const J = jd - longitude / 360;
    let M = (357.5291 + 0.98560028 * J) % 360;
    const M_rad = M * Math.PI / 180;

    const C = 1.9148 * Math.sin(M_rad) + 0.0200 * Math.sin(2 * M_rad) + 0.0003 * Math.sin(3 * M_rad);
    let lambda_sun = (M + C + 180 + 102.9372) % 360;
    const lambda_sun_rad = lambda_sun * Math.PI / 180;

    const delta = Math.asin(Math.sin(lambda_sun_rad) * Math.sin(23.44 * Math.PI / 180));
    const zenith = 90.83 * Math.PI / 180;
    const cos_H = (Math.cos(zenith) - Math.sin(phi) * Math.sin(delta)) / (Math.cos(phi) * Math.cos(delta));
    const H = Math.acos(Math.min(Math.max(cos_H, -1), 1));

    const H_deg = H * 180 / Math.PI;
    const H_hours = H_deg / 15;

    const solar_noon = 2451545.0009 + J + 0.0053 * Math.sin(M_rad) - 0.0069 * Math.sin(2 * lambda_sun_rad);
    const sunset_jd = solar_noon + H_hours / 24;

    const sunset_utc = new Date(Date.UTC(2000, 0, 1, 12) + (sunset_jd - 2451545.0) * 86400000);
    return sunset_utc;
}

// Get current date
function getCurrentDate() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// Get user location and calculate Iftar time
function getLocationAndCalculateIftar() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                
                currentLocation = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
                document.getElementById('location').textContent = currentLocation;

                const date = getCurrentDate();
                const sunset_utc = calculateSunset(latitude, longitude, date);
                const timezoneOffset = 6; // Bangladesh Standard Time, UTC+6
                iftarTime = new Date(sunset_utc.getTime() + timezoneOffset * 60 * 60 * 1000);

                document.getElementById('iftarTime').textContent = formatTime(iftarTime);
                localStorage.setItem("sunsetLocalTime", iftarTime.toISOString());
                
                startCountdown();
            },
            (error) => {
                console.error("Geolocation error:", error);
                document.getElementById('location').textContent = "Location unavailable";
                
                // Try to use stored Iftar time if available
                const storedTime = localStorage.getItem("sunsetLocalTime");
                if (storedTime) {
                    iftarTime = new Date(storedTime);
                    document.getElementById('iftarTime').textContent = formatTime(iftarTime);
                    startCountdown();
                } else {
                    document.getElementById('iftarTime').textContent = "Please enable location";
                }
            }
        );
    } else {
        document.getElementById('location').textContent = "Geolocation not supported";
    }
}

// Initialize Iftar time
function initializeIftarTime() {
    // Try to get from localStorage first
    const storedTime = localStorage.getItem("sunsetLocalTime");
    if (storedTime) {
        iftarTime = new Date(storedTime);
        const today = getCurrentDate();
        const storedDate = new Date(iftarTime.getFullYear(), iftarTime.getMonth(), iftarTime.getDate());
        
        // Check if stored time is for today
        if (today.getTime() === storedDate.getTime()) {
            document.getElementById('iftarTime').textContent = formatTime(iftarTime);
            startCountdown();
            return;
        }
    }
    
    // If no valid stored time, get location and calculate
    getLocationAndCalculateIftar();
}

// Update motivational message based on time remaining
function updateMotivationalMessage(hoursLeft, minutesLeft) {
    const motivationalText = document.getElementById('motivationalText');
    
    if (hoursLeft > 6) {
        motivationalText.textContent = "The day is still young, stay strong in your fast! 🌅";
    } else if (hoursLeft > 3) {
        motivationalText.textContent = "Halfway through the day, you're doing great! 💪";
    } else if (hoursLeft > 1) {
        motivationalText.textContent = "Almost there! Just a few more hours! ⏰";
    } else if (minutesLeft > 30) {
        motivationalText.textContent = "Less than an hour left, you've got this! 🌙";
    } else if (minutesLeft > 10) {
        motivationalText.textContent = "Final stretch! Iftar is approaching! 🕌";
    } else if (minutesLeft > 0) {
        motivationalText.textContent = "Almost time to break your fast! 🌅";
    } else {
        motivationalText.textContent = "Time to break your fast! Ramadan Mubarak! 🎉";
    }
}

// Update progress bar
function updateProgressBar() {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    
    const totalDayMs = dayEnd - dayStart;
    const elapsedMs = now - dayStart;
    const progressPercentage = Math.min((elapsedMs / totalDayMs) * 100, 100);
    
    document.getElementById('progressFill').style.width = `${progressPercentage}%`;
    document.getElementById('progressText').textContent = `${Math.round(progressPercentage)}% of the day completed`;
}

// Show Iftar modal
function showIftarModal() {
    document.getElementById('iftarModal').style.display = 'block';
    
    // Play notification sound if supported
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCEOY6NOYTQwNUrDo67NdGAg+ltryxnkpBSl+zPLaizsIGGS57OihUgwOVKzj67dvJAo+ltrzxnkqBSh9y/HZjDkIF2W67OihUQwOVKzj67dvJAo9ltrzxnkqBSh9y/HZjDkIF2W67OihUQwOVKzj67dvJAo9ltrzxnkqBSh9y/HZjDkIF2W67OihUQwOVKzj67dvJAo9ltrzxnkqBSh9y/HZjDkIF2W67OihUQwOVKzj67dvJAo9ltrzxnkqBSh9y/HZjDkIF2W67OihUQwOVKzj67dvJA==');
        audio.play();
    } catch (e) {
        console.log('Audio notification not supported');
    }
}

// Close modal
function closeModal() {
    document.getElementById('iftarModal').style.display = 'none';
}

// Main countdown function
function updateCountdown() {
    const now = new Date();
    const timeDiff = iftarTime - now;
    
    if (timeDiff <= 0) {
        // Iftar time has arrived or passed
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        
        updateMotivationalMessage(0, 0);
        clearInterval(countdownInterval);
        showIftarModal();
        return;
    }
    
    // Calculate time components
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    // Update display
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    
    // Update motivational message
    updateMotivationalMessage(hours, minutes);
    
    // Update progress bar
    updateProgressBar();
}

// Start countdown
function startCountdown() {
    // Clear any existing interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    // Update immediately
    updateCountdown();
    
    // Update every second
    countdownInterval = setInterval(updateCountdown, 1000);
}

// Initialize current date display
function initializeDateDisplay() {
    const currentDate = new Date();
    document.getElementById('currentDate').textContent = currentDate.toDateString();
}

// Handle page visibility change
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && iftarTime) {
        updateCountdown();
    }
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeDateDisplay();
    updateProgressBar();
    
    // Set initial motivational message
    document.getElementById('motivationalText').textContent = "Loading your Iftar countdown... 🕌";
    
    // Initialize Iftar time and start countdown
    initializeIftarTime();
});

// Handle window beforeunload
window.addEventListener('beforeunload', function() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
});

// Allow closing modal by clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('iftarModal');
    if (event.target == modal) {
        closeModal();
    }
}

// Handle escape key to close modal
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});