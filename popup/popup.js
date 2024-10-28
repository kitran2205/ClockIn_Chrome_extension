
document.getElementById('openDashboard').addEventListener('click', () => {
  chrome.tabs.create({ url: "dashboard.html" });
});

// Listener for messages from the background script to update the timer display
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.timer) {
    document.getElementById('timer').textContent = message.timer;
  }
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.workOrBreak) {
    document.getElementById('workOrBreak').textContent = message.workOrBreak;
  }
});

function isTaskDone(difficulty, index, isChecked) {
  chrome.storage.local.get([difficulty], (result) => {
    let tasks = result[difficulty] || [];
    tasks[index].checked = isChecked;
    chrome.storage.local.set({ [difficulty]: tasks }, () => {
      console.log(`Task at ${index} in ${difficulty} is ${isChecked} ? 'checked' : 'unchecked'}`);
    });
  });
}

function loadTask() {
  const arr = ['hard', 'medium', 'easy'];
  arr.forEach((diffculty) => {
    chrome.storage.local.get([diffculty], (result) => {
      const tasks = result[diffculty] || [];
      const difficultySection = document.getElementById(`${diffculty}task`);
      tasks.forEach((data, index) => {
        const item = document.createElement('p');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = data.checked;
        // Apply strikethrough if task is checked
        if (data.checked) {
          item.style.textDecoration = 'line-through';
        }
        checkbox.addEventListener('change', () => {
          isTaskDone(diffculty, index, checkbox.checked);
          item.style.textDecoration = checkbox.checked ? 'line-through' : 'none';
        })
        item.appendChild(checkbox);
        item.appendChild(document.createTextNode(` - ${data.task}`));
        difficultySection.appendChild(item);
      });
    });
  });
}

function deleteTask() {

}

document.addEventListener('DOMContentLoaded', loadTask);
