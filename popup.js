document.addEventListener('DOMContentLoaded', () => {
	let saveButton = document.getElementById('saveButton');
	let textBox = document.getElementById('textBox');

	// load saved text from storage
	chrome.storage.sync.get('savedText', function (data) {
		textBox.value = data.savedText || '';
	});

	// save text to storage
	saveButton.addEventListener('click', function () {
		chrome.storage.sync.set({ savedText: textBox.value });
	});
});
