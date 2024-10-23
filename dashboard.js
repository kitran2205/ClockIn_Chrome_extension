const breakDurationInput = document.getElementById('breakDuration');
const breakDurationValue = document.getElementById('breakDurationValue');
const breakFrequencyInput = document.getElementById('breakFrequency');
const breakFrequencyValue = document.getElementById('breakFrequencyValue');

breakDurationInput.addEventListener('input', function () {
    breakDurationValue.textContent = `${this.value} minutes`;
});

breakFrequencyInput.addEventListener('input', function () {
    breakFrequencyValue.textContent = `Every ${this.value} minutes`;
});


document.getElementById('submitWebsite').addEventListener('click', () => {
    const websiteInput = document.getElementById('websiteInput').value.trim();

    if (websiteInput) {
        chrome.storage.local.get(['blockedSites'], (result) => {
            const blockedSites = result.blockedSites || [];
            if (!blockedSites.includes(websiteInput)) {
                blockedSites.push(websiteInput);
                chrome.storage.local.set({ blockedSites: blockedSites }, () => {
                    console.log(`${websiteInput} has been added to the blocked sites list.`);
                    displayBlockedWebsite(websiteInput);
                });
            }
        });

        document.getElementById('websiteInput').value = '';
    }
});

function displayBlockedWebsite(website) {
    const blockedList = document.getElementById('blockedList');
    const listItem = document.createElement('li');
    listItem.textContent = website;
    blockedList.appendChild(listItem);
}

function loadBlockedWebsites() {
    chrome.storage.local.get(['blockedSites'], (result) => {
        const blockedSites = result.blockedSites || [];
        blockedSites.forEach((site) => {
            displayBlockedWebsite(site);
        });
    });
}
document.addEventListener('DOMContentLoaded', loadBlockedWebsites);


// timer functionality
document.getElementById('start').addEventListener('click', () => {
    chrome.runtime.sendMessage({ command: 'start' });
    document.getElementById('start').disabled = true;
    document.getElementById('stop').disabled = false;
    document.getElementById('reset').disabled = false;
});

document.getElementById('stop').addEventListener('click', () => {
    chrome.runtime.sendMessage({ command: 'stop' });
    document.getElementById('start').disabled = false;
    document.getElementById('stop').disabled = true;
    document.getElementById('reset').disabled = false;
});

document.getElementById('reset').addEventListener('click', () => {
    chrome.runtime.sendMessage({ command: 'reset' });
    document.getElementById('start').disabled = false;
    document.getElementById('stop').disabled = false;
    document.getElementById('reset').disabled = true;
});




// Listener for messages from the background script to update the timer display
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.timer) {
        document.getElementById('timer').textContent = message.timer;
    }
});
// Function to save tasks to chrome storage
function saveTask(taskInput, difficulty, isChecked = false) {
    chrome.storage.local.get([difficulty], (result) => {
        let tasks = result[difficulty] || [];
        tasks.push({ task: taskInput, checked: isChecked });
        chrome.storage.local.set({ [difficulty]: tasks }, () => {
            console.log(`${taskInput} saved under ${difficulty} and is done: ${isChecked}`);
        });
    });
}

// Function to update task completion status in chrome storage
function updateTaskCompletion(difficulty, index, isChecked) {
    chrome.storage.local.get([difficulty], (result) => {
        let tasks = result[difficulty] || [];
        tasks[index].checked = isChecked;
        chrome.storage.local.set({ [difficulty]: tasks }, () => {
            console.log(`Task at index ${index} in ${difficulty} is ${isChecked ? 'checked' : 'unchecked'}`);
        });
    });
}

// Function to load tasks from chrome storage on page load
function loadTasks() {
    const difficulties = ['Hard', 'Medium', 'Easy'];
    difficulties.forEach((difficulty) => {
        chrome.storage.local.get([difficulty], (result) => {
            const tasks = result[difficulty] || [];
            const taskListElement = document.getElementById(`${difficulty.toLowerCase()}Tasks`);

            tasks.forEach((taskData, index) => {
                const taskItem = document.createElement('p');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = taskData.checked;
                checkbox.addEventListener('change', () => {
                    updateTaskCompletion(difficulty, index, checkbox.checked);
                });

                taskItem.appendChild(checkbox);
                taskItem.appendChild(document.createTextNode(` - ${taskData.task}`));
                taskListElement.appendChild(taskItem);
            });
        });
    });
}

// Event listener for DOM content load to ensure tasks are loaded
document.addEventListener('DOMContentLoaded', loadTasks);

// Dropdown functionality 
document.addEventListener('DOMContentLoaded', function () {
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    const currentDifficulty = document.getElementById('currentDifficulty');
    const dropdown = document.querySelector('.dropdown');

    dropdownItems.forEach(item => {
        item.addEventListener('click', function (event) {
            event.preventDefault();
            const selectedDifficulty = this.textContent;
            currentDifficulty.textContent = selectedDifficulty;
            dropdown.classList.remove('is-active');
        });
    });


    document.querySelector('.dropdown-trigger .button').addEventListener('click', () => {
        dropdown.classList.toggle('is-active');
    });
});

// Task submission functionality
document.getElementById('submitTask').addEventListener('click', () => {
    const taskInput = document.getElementById('taskInput').value.trim();
    const difficulty = document.getElementById('currentDifficulty').textContent.toLowerCase();

    if (!taskInput) {
        return;
    }
    const taskListElement = document.getElementById(`${difficulty}Tasks`);
    const taskItem = document.createElement('p');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = false;

    saveTask(taskInput, difficulty, checkbox.checked);  // Save task to storage

    taskItem.appendChild(checkbox);
    taskItem.appendChild(document.createTextNode(` - ${taskInput}`));
    taskListElement.appendChild(taskItem);

    // Event listener to update task completion in storage
    checkbox.addEventListener('change', () => {
        const index = Array.from(taskListElement.children).indexOf(taskItem);
        updateTaskCompletion(difficulty, index, checkbox.checked);
    });

    document.getElementById('taskInput').value = '';
});
