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

// Handle dropdown diffculty selector
const dropdownItems = document.querySelectorAll('.dropdown-item');
  const currentDifficultyText = document.getElementById('currentDifficulty');
  const dropdown = document.querySelector('.dropdown'); // Dropdown container
  
  dropdownItems.forEach(item => {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      
      // Get the selected difficulty
      const selectedDifficulty = event.target.textContent;
      
      // Update the difficulty button text
      currentDifficultyText.textContent = selectedDifficulty;

      // Close the dropdown
      dropdown.classList.remove('is-active');
    });
  });

  // Toggle dropdown on button click
  document.querySelector('.dropdown-trigger .button').addEventListener('click', () => {
    dropdown.classList.toggle('is-active'); // Toggle dropdown visibility
  });

