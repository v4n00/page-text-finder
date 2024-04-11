import { retrieveFromStorage, saveToStorage } from './functions.js';

let saveButton = document.getElementById('saveButton');
let textBox = document.getElementById('textBox');

// load saved text from storage
retrieveFromStorage('textStorage', function (data) {
	textBox.innerHTML = data || '';
});

// save text to storage
saveButton.addEventListener('click', function () {
	saveToStorage('textStorage', textBox.innerHTML);
});
