document.getElementById('start').addEventListener('click', () => {
  chrome.runtime.sendMessage({ command: 'start' });
  document.getElementById('reset').disabled = false;
});

document.getElementById('stop').addEventListener('click', () => {
  chrome.runtime.sendMessage({ command: 'stop' });
  document.getElementById('start').disabled = false;
});

document.getElementById('reset').addEventListener('click', () => {
  chrome.runtime.sendMessage({ command: 'reset' });
  document.getElementById('start').disabled = false;
});

// Listener for messages from the background script to update the timer display
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.timer) {
    document.getElementById('timer').textContent = message.timer;
  }
});

