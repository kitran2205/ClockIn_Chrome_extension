
document.getElementById('openDashboard').addEventListener('click', () => {
  chrome.tabs.create({ url: "dashboard.html" });
});

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

  document.querySelector('.dropdown-trigger .button').addEventListener('click', () => {
    dropdown.classList.toggle('is-active'); // Toggle dropdown visibility
  });

function saveTask(taskInput, diffculty, isChecked = false){
  chrome.storage.local.get([diffculty], (result) => {
    let tasks = result[diffculty] || [];
    tasks.push({ task: taskInput, checked: isChecked });
    chrome.storage.local.set({ [diffculty]: tasks }, () => {
      console.log(`${taskInput} saved under ${diffculty} and is done: ${isChecked}`);
    })
  })
}

function isTaskDone(diffculty, index, isChecked){
  chrome.storage.local.get([diffculty], (result) => {
    let tasks = result[diffculty] || [];
    tasks[index].checked = isChecked;
    chrome.storage.local.set({ [diffculty]: tasks }, () => {
      console.log(`Task at ${index} in ${diffculty} is ${isChecked} ? 'checked' : 'unchecked'}`);
    });
  });
}

function loadTask() {
  const arr = ['Hard', 'Medium', 'Easy'];
  arr.forEach((diffculty) => {
    chrome.storage.local.get([diffculty], (result) => {
      const tasks = result[diffculty] || [];
      const difficultySection = document.getElementById(`${diffculty.toLowerCase()}task`);
      tasks.forEach((data, index) => {
        const item = document.createElement('p');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = data.checked;
        checkbox.addEventListener('change', () => {
          isTaskDone(diffculty, index, checkbox.checked);
        })
        item.appendChild(checkbox);
        item.appendChild(document.createTextNode(` - ${data.task}`));
        difficultySection.appendChild(item);
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', loadTask);

document.getElementById('submit').addEventListener('click', () => {
  const taskInput = document.querySelector('.input').value.trim(); // Get the task input value
  const difficulty = document.getElementById('currentDifficulty').textContent; // Get the selected difficulty
  let difficultySection;
  if (!taskInput) return;
  
  if (difficulty === 'Hard') {
    difficultySection = document.getElementById('hardtask');
  } else if (difficulty === 'Medium') {
    difficultySection = document.getElementById('mediumtask');
  } else {
    difficultySection = document.getElementById('easytask');
  }

  const taskItem = document.createElement('p');
  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox';
  checkbox.checked = false;
  saveTask(taskInput, difficulty, checkbox.checked);
  taskItem.appendChild(checkbox);
  taskItem.appendChild(document.createTextNode(` - ${taskInput}`));
  difficultySection.appendChild(taskItem);
  checkbox.addEventListener('change', () => {
    const index = Array.from(difficultySection.children).indexOf(taskItem);
    isTaskDone(difficulty, difficultySection.children.length - 1, checkbox.checked);
  });

  document.querySelector('.input').value = '';
});