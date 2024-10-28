const breakDurationInput = document.getElementById('breakDuration');
const breakDurationValue = document.getElementById('breakDurationValue');
const breakFrequencyInput = document.getElementById('breakFrequency');
const breakFrequencyValue = document.getElementById('breakFrequencyValue');

const tabs = document.querySelectorAll('[data-tab-target]')
const tabContents = document.querySelectorAll('[data-tab-content]')

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = document.querySelector(tab.dataset.tabTarget)
        tabContents.forEach(tabContent => {
            tabContent.classList.remove('active')
        })
        tabs.forEach(tab => {
            tab.classList.remove('active')
        })
        tab.classList.add('active')
        target.classList.add('active')
    })
})

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
    listItem.classList.add('deletebutton')
    listItem.textContent = website;

    const deleteButton = document.createElement('button');
    // deleteButton.classList.add('deletebutton');
    deleteButton.style.marginLeft = '10px';
    deleteButton.textContent = 'X';

    blockedList.appendChild(listItem);
    deleteButton.addEventListener('click', () => confirmDelete(website));

    listItem.appendChild(deleteButton);
    blockedList.appendChild(listItem);

}

function confirmDelete(website) {
    if (confirm(`Are you sure you want to delete ${website}?`)) {
        chrome.storage.local.get(['blockedSites'], (result) => {
            const blockedSites = result.blockedSites || [];
            const updatedSites = blockedSites.filter((site) => site !== website);

            chrome.storage.local.set({ blockedSites: updatedSites }, () => {
                console.log(`${website} has been removed from the blocked sites list.`);
                loadBlockedWebsites();
            });
        });
    }
}

function loadBlockedWebsites() {
    const blockedList = document.getElementById('blockedList');
    blockedList.innerHTML = '';
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
});

document.getElementById('stop').addEventListener('click', () => {
    chrome.runtime.sendMessage({ command: 'stop' });
    document.getElementById('start').disabled = false;
    document.getElementById('stop').disabled = true;
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
    const difficulties = ['hard', 'medium', 'easy'];
    difficulties.forEach((difficulty) => {
        chrome.storage.local.get([difficulty], (result) => {
            const tasks = result[difficulty] || [];
            const taskListElement = document.getElementById(`${difficulty}Tasks`);

            tasks.forEach((taskData, index) => {
                const taskItem = document.createElement('p');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = taskData.checked;
                // Apply strikethrough if task is checked
                if (taskData.checked) {
                    taskItem.style.textDecoration = 'line-through';
                }
                checkbox.addEventListener('change', () => {
                    updateTaskCompletion(difficulty, index, checkbox.checked);
                    taskItem.style.textDecoration = checkbox.checked ? 'line-through' : 'none';
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

    console.log(`Saving task: ${taskInput} under difficulty: $ difficulty}`);

    saveTask(taskInput, difficulty, checkbox.checked);  // Save task to storage

    taskItem.appendChild(checkbox);
    taskItem.appendChild(document.createTextNode(` - ${taskInput}`));
    taskListElement.appendChild(taskItem);

    // Reset dropdown to default
    document.getElementById('currentDifficulty').textContent = "Select Difficulty";

    // Add strikethrough on checkbox change
    checkbox.addEventListener('change', () => {
        const index = Array.from(taskListElement.children).indexOf(taskItem);
        updateTaskCompletion(difficulty, index, checkbox.checked);
        taskItem.style.textDecoration = checkbox.checked ? 'line-through' : 'none';
    });

    // Event listener to update task completion in storage
    checkbox.addEventListener('change', () => {
        const index = Array.from(taskListElement.children).indexOf(taskItem);
        updateTaskCompletion(difficulty, index, checkbox.checked);
    });

    document.getElementById('taskInput').value = '';
});
