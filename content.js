let isExtensionOn = false;
let foundIndexes = [];
let currentFoundIndex = -1;

chrome.storage.local.get(['toggle'], (result) => {
	isExtensionOn = result.toggle || false;
});

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
	if (request.type === 'toggleChanged') {
		isExtensionOn = request.toggleState;
		chrome.storage.local.set({ toggle: isExtensionOn });
		sendResponse({ status: 'Toggle state updated' });
	}
});

document.addEventListener('mouseup', async () => {
	clearExistingMessage();

	if (isExtensionOn) {
		await new Promise((resolve) => setTimeout(resolve, 0));
		let selectedText = window.getSelection().toString().trim();

		if (selectedText.length > 0) {
			chrome.storage.local.get(['textStorage', 'bufferSize'], (data) => {
				foundIndexes = findAllInstances(data.textStorage, selectedText);
				let displayedText = 'not found';

				if (foundIndexes.length > 0) {
					currentFoundIndex = 0;
					displayedText = data.textStorage.substring(foundIndexes[currentFoundIndex] - 1000, foundIndexes[currentFoundIndex] + parseInt(data.bufferSize));
				} else resetFoundIndexes();

				showMessageOnPage(displayedText, selectedText);
			});
		} else resetFoundIndexes();
	}
});

const showMessageOnPage = (displayedText, selectedText) => {
	clearExistingMessage();

	const innerDiv = document.createElement('div');
	innerDiv.innerHTML = displayedText;
	innerDiv.id = 'extensionMessageDiv';
	innerDiv.innerHTML = innerDiv.innerHTML.replace(selectedText, `<span style="background-color: yellow; color: black;">${selectedText}</span>`);
	Object.assign(innerDiv.style, {
		position: 'fixed',
		bottom: '20px',
		right: '20px',
		padding: '10px',
		zIndex: '10000',
		backgroundColor: 'white',
		color: 'black',
		border: '1px solid black',
		'max-width': '50%',
		'max-height': '75%',
		'overflow-y': 'auto',
		borderRadius: '5px',
	});

	document.body.appendChild(innerDiv);
};

// utils

const clearExistingMessage = () => {
	let existingMessage = document.getElementById('extensionMessageDiv');
	if (existingMessage) {
		existingMessage.parentNode.removeChild(existingMessage);
	}
};

const findAllInstances = (source, target) => {
	let indexes = [];
	let i = source.indexOf(target);

	while (i !== -1) {
		indexes.push(i);
		i = source.indexOf(target, i + 1);
	}

	return indexes;
};

const resetFoundIndexes = () => {
	foundIndexes = [];
	currentFoundIndex = -1;
};
