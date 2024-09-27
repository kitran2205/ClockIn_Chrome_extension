let countdown;
let time = 1 * 60; // Initial timer set for 25 minutes

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === 'start') {
        startTimer();
    } else if (message.command === 'reset') {
        resetTimer();
    }
});

function startTimer() {
    if (time === 25 * 60 || countdown === undefined) { // Start a new timer if it's reset or not set
        clearInterval(countdown); // Clear any existing intervals
        countdown = setInterval(() => {
            if (time > 0) {
                time--;
                updatePopup();
            } else {
                completeTimer(); // Handle the completion of the timer
            }
        }, 1000);
    } else { // Resume the existing timer
        countdown = setInterval(() => {
            if (time > 0) {
                time--;
                updatePopup();
            } else {
                completeTimer(); // Handle the completion of the timer
            }
        }, 1000);
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Existing message handling for 'start' and 'reset'

    if (message.command === 'stop') {
        stopTimer(); // Implement this function to pause the timer
    }
});

function stopTimer() {
    clearInterval(countdown);
    // Do not reset the time variable here to allow the timer to resume from where it was paused
}

function resetTimer() {
    clearInterval(countdown);
    time = 1 * 60; // Reset the timer to 25 minutes
    isRunning = false; // Ensure to mark the timer as not running
    updatePopup(); // Update the popup with the new time
}

function completeTimer() {
    clearInterval(countdown); // Stop the countdown
    // Reset the time for the next session but don't start counting down automatically
    time = 10;
    updatePopup(); // Update the popup with the reset time

    // Trigger the notification
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon-16.png',
        title: 'Time to Hydrate',
        message: "Everyday I'm Guzzlin'!",
        buttons: [{ title: 'Keep it Flowing.' }],
        priority: 0
    });
}

function updatePopup() {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    chrome.runtime.sendMessage({ timer: `${minutes}:${seconds}` });
}

