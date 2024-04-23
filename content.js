let toggleState = false;

chrome.storage.local.get(['toggle'], (result) => {
	toggleState = result.toggle || false;
});

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
	if (request.type === 'toggleChanged') {
		toggleState = request.toggleState;
		chrome.storage.local.set({ toggle: toggleState });
		sendResponse({ status: 'Toggle state updated' });
	}
});

document.addEventListener('mouseup', () => {
	clearExistingMessage();

	if (toggleState) {
		let selectedText = window.getSelection().toString().trim();

		// send the selected text
		if (selectedText.length > 0) {
			chrome.runtime.sendMessage({ type: 'TEXT_SELECTED', text: selectedText }, ({ text, index }) => {
				const div = document.createElement('div');

				// if index is found, display the text
				div.innerHTML = index !== -1 ? text : 'not found';
				showMessageOnPage(div, selectedText);
			});
		}
	}
});

const showMessageOnPage = (rawDiv, selectedText) => {
	clearExistingMessage();

	// add id and styling to the div
	rawDiv.id = 'extensionMessageDiv';
	rawDiv.innerHTML = rawDiv.innerHTML.replace(selectedText, `<span style="background-color: yellow; color: black;">${selectedText}</span>`);
	Object.assign(rawDiv.style, {
		position: 'fixed',
		bottom: '20px',
		right: '20px',
		padding: '10px',
		zIndex: '10000',
		backgroundColor: 'white',
		color: 'black',
		border: '1px solid black',
		'max-width': '800px',
		'max-height': '800px',
		'overflow-y': 'auto',
		borderRadius: '5px',
	});

	// set message text and show it
	document.body.appendChild(rawDiv);
};

const clearExistingMessage = () => {
	let existingMessage = document.getElementById('extensionMessageDiv');
	if (existingMessage) {
		existingMessage.parentNode.removeChild(existingMessage);
	}
};
