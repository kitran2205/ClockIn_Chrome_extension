let countdown;
let time = 5 * 60; // Initial timer set for 5 minutes
let isActive = false;
let isOnBreak = false;
let breakDuration = 60; // 1 minute for the short break
let breakFrequency = 10 * 60; // Number of seconds before a break
let nextBreak = breakFrequency; // Counter for the next break
let sessionTotal = 5 * 60;
let breakTimeLeft = 0; // Track remaining break time


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === 'start') {
        time = (message.duration || 5) * 60;
        sessionTotal = time;
        breakDuration = (message.breakDuration || 1) * 60;
        breakFrequency = (message.breakFrequency || 1) * 60;
        nextBreak = breakFrequency;
        isOnBreak = false;
        startTimer();
    } else if (message.command === 'stop') {
        resetTimer();
    }
});

function startTimer() {
    clearInterval(countdown);
    countdown = setInterval(() => {
        if (!isOnBreak) {
            if (time > 0) {
                time--;
                if ((sessionTotal - time) === nextBreak && time > breakDuration) {
                    isOnBreak = true;
                    breakTimeLeft = breakDuration; // Start break countdown
                    chrome.runtime.sendMessage({ workOrBreak: "Break!" });
                    nextBreak += breakFrequency;
                } else {
                    chrome.runtime.sendMessage({ workOrBreak: "Session is active!" });
                }
                updatePopup();
            } else {
                completeTimer();
            }
        } else {
            // During break, count down breakTimeLeft
            if (breakTimeLeft > 0) {
                breakTimeLeft--;
                chrome.runtime.sendMessage({ workOrBreak: "Break!" });
                updatePopup();
            } else {
                isOnBreak = false;
                chrome.runtime.sendMessage({ workOrBreak: "Session is active!" });
            }
        }
    }, 1000);
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

    let timeUntilNextBreak = isOnBreak ? 0 : nextBreak - (sessionTotal - time);
    timeUntilNextBreak = timeUntilNextBreak < 0 ? 0 : timeUntilNextBreak;

    chrome.runtime.sendMessage({ 
        timer: `${minutes}:${seconds}`,
        breakTimeLeft: breakTimeLeft,
        timeUntilNextBreak: timeUntilNextBreak,
     });
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
                    chrome.tabs.update(tabId, { url: "https://canvas.unl.edu" });
                }
            });
        }
    }
}

chrome.tabs.onUpdated.addListener(checkForBlockedWebsite);
