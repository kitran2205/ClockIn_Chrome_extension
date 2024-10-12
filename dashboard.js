document.getElementById('submitWebsite').addEventListener('click', () => {
    const websiteInput = document.getElementById('websiteInput');
    const website = websiteInput.value.trim();

    if (website) {
        const blockedList = document.getElementById('blockedList');
        const listItem = document.createElement('li');
        listItem.textContent = website;
        blockedList.appendChild(listItem);
        websiteInput.value = '';
    }
});
