let countdown;
let time = 5 * 60; // Initial timer set for 5 minutes
let shortBreakTime = 60; // New 1-minute timer
let breakTime = [4 * 60, 2 * 60];
let resumeTime;
let isActive = false;
let isShortBreak = false; // Track if the short break timer is running


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === 'start') {
        startTimer();
    } else if (message.command === 'stop') {
        resetTimer();
    }
});

function startTimer() {
    if (time === 5 * 60 || countdown === undefined) { // Start a new timer if it's reset or not set
        clearInterval(countdown); // Clear any existing intervals
        countdown = setInterval(() => {
            if (time > 0) {
                time--;
                isActive = true;
                // Automatically switch to the 1-minute timer when 4 minutes remain
                if (breakTime.includes(time)) {
                    resumeTime = time;
                    time = shortBreakTime; // Switch to the 1-minute timer
                    isShortBreak = true; // Set flag for short break
                    isActive = false;
                } if (isShortBreak) {
                    isActive = false;
                }
                updatePopup();
                updateStatus();

            } else {
                if (isShortBreak) {
                    // When the 1-minute timer ends, switch back to the 4-minute timer
                    time = resumeTime - 1;
                    isShortBreak = false; // Short break has ended
                    isActive = true;
                    updatePopup();
                    updateStatus();
                } else {
                    completeTimer(); // Complete the main timer
                }
            }
        }, 1000);
    } else { // Resume the existing timer
        countdown = setInterval(() => {
            if (time > 0) {
                time--;
                isActive = true;
                // Automatically switch to the 1-minute timer when 4 minutes remain
                if (time.includes(breakTime)) {
                    resumeTime = time;
                    time = shortBreakTime; // Switch to the 1-minute timer
                    isShortBreak = true;
                    isActive = false;
                } if (isShortBreak) {
                    isActive = false;
                }
                updatePopup();
                updateStatus();
            } else {
                if (isShortBreak) {
                    // When the 1-minute timer ends, switch back to the 4-minute timer
                    time = resumeTime - 1;
                    isShortBreak = false; // Short break has ended
                    isActive = true;
                    updatePopup();
                    updateStatus();
                } else {
                    completeTimer(); // Complete the main timer
                }
            }
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(countdown);
    time = 5 * 60; // Reset the timer
    isActive = false;
    updatePopup();
    updateStatus();
}

function completeTimer() {
    clearInterval(countdown); // Stop the countdown
    // Reset the time for the next session but don't start counting down automatically
    time = 60 * 5;

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
    updatePopup();
    updateStatus();
}

function updatePopup() {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    chrome.runtime.sendMessage({ timer: `${minutes}:${seconds}` });
}
function updateStatus() {
    if (isActive) {
        chrome.runtime.sendMessage({ workOrBreak: `Session is active!` });
    } else if (isShortBreak) {
        chrome.runtime.sendMessage({ workOrBreak: `Break!` });
    } else {
        chrome.runtime.sendMessage({ workOrBreak: `Session is not active!` });
    }

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
