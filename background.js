let countdown;
let time = 5 * 60; // Initial timer set for 5 minutes
let isActive = false;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === 'start') {
        startTimer();
    } else if (message.command === 'reset') {
        resetTimer();
    } else if (message.command === 'stop') {
        stopTimer();
    }
});

function startTimer() {
    if (time === 5 * 60 || countdown === undefined) { // Start a new timer if it's reset or not set
        clearInterval(countdown); // Clear any existing intervals
        countdown = setInterval(() => {
            if (time > 0) {
                time--;
                updatePopup();
                isActive = true;

            }
            else {
                completeTimer(); // Handle the completion of the timer
            }
        }, 1000);
    } else { // Resume the existing timer
        countdown = setInterval(() => {
            if (time > 0) {
                time--;
                updatePopup();
                isActive = true;
            } else {
                completeTimer(); // Handle the completion of the timer
            }
        }, 1000);
    }
}

function stopTimer() {
    clearInterval(countdown);
    isActive = false; // Ensure to mark the timer as not running
    updatePopup();
}

function resetTimer() {
    clearInterval(countdown);
    time = 5 * 60; // Reset the timer
    updatePopup(); // Update the popup with the new time
    isActive = false;
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
    isActive = false;
}

function updatePopup() {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    chrome.runtime.sendMessage({ timer: `${minutes}:${seconds}` });
}

function checkForBlockedWebsite(tabId, changeInfo, tab) {
    if (isActive) {
        if (changeInfo.status === 'complete' && tab.url) {
            chrome.storage.local.get(['blockedSites'], (result) => {
                const blockedSites = result.blockedSites || [];
                const isBlocked = blockedSites.some((site) => tab.url.includes(site));

                if (isBlocked) {
                    chrome.tabs.update(tabId, { url: "https://canvas.com" });
                }
            });
        }
    }
}

chrome.tabs.onUpdated.addListener(checkForBlockedWebsite);
