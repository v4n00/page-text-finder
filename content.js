document.addEventListener('mouseup', () => {
	clearExistingMessage();

	let selectedText = window.getSelection().toString();
	console.log(selectedText);

	// send the selected text
	if (selectedText.length > 0) {
		chrome.runtime.sendMessage({ text: selectedText }, (response) => {
			showMessageOnPage(response);
		});
	}
});

const showMessageOnPage = (text) => {
	clearExistingMessage();

	// create message div with styling
	let messageDiv = document.createElement('div');
	messageDiv.id = 'extensionMessageDiv';
	Object.assign(messageDiv.style, {
		position: 'fixed',
		bottom: '20px',
		right: '20px',
		padding: '10px',
		zIndex: '10000',
		backgroundColor: 'white',
		border: '1px solid black',
		borderRadius: '5px',
	});

	// set message text and show it
	messageDiv.textContent = text;
	document.body.appendChild(messageDiv);
};

const clearExistingMessage = () => {
	let existingMessage = document.getElementById('extensionMessageDiv');
	if (existingMessage) {
		existingMessage.parentNode.removeChild(existingMessage);
	}
};
