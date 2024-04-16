const saveButton = document.getElementById('saveButton');
const helpButton = document.getElementById('helpButton');
const clearButton = document.getElementById('clearButton');
const textBox = document.getElementById('textBox');
const bufferSize = document.getElementById('bufferSize');

const defaultText = 'This text box serves as the storage that the extension will search through for any text you select on any web page.</br></br>To start, copy and paste something in this box, then hit save. Highlight anything on a page and it will be searched through.</br></br>To disable the extension, click Clear and then Save.</br></br>The number input below specifies the buffer size, which is the number of characters that will be displayed after the successful word match. Change this number based on the content, as it certain content may be too long to display in the popup.';

// retrieve text from storage
chrome.storage.local.get(['textStorage', 'bufferSize'], (data) => {
	textBox.innerHTML = data.textStorage || '';
	bufferSize.value = data.bufferSize || 3000;
});

// save text to storage
saveButton.addEventListener('click', () => {
	console.log(textBox.innerHTML);
	chrome.storage.local.set({ textStorage: textBox.innerHTML, bufferSize: bufferSize.value });
});

helpButton.addEventListener('click', () => {
	textBox.innerHTML = defaultText;
});

clearButton.addEventListener('click', () => {
	textBox.innerHTML = '';
	chrome.storage.local.set({ textStorage: '', bufferSize: bufferSize.value });
});
