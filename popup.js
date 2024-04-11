let saveButton = document.getElementById('saveButton');
let textBox = document.getElementById('textBox');

// retrieve text from storage
chrome.storage.local.get('textStorage', (data) => {
	textBox.innerHTML = data.textStorage || '';
});

// save text to storage
saveButton.addEventListener('click', () => {
	chrome.storage.local.set({ textStorage: textBox.innerHTML });
});
