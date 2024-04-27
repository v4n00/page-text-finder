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

	const outerDiv = document.createElement('div');
	outerDiv.addEventListener('mouseup', (e) => {
		e.stopPropagation();
	});
	outerDiv.id = 'extensionMessageDiv';
	Object.assign(outerDiv.style, {
		position: 'fixed',
		display: 'flex',
		'flex-direction': 'column',
		gap: '10px',
		'justify-content': 'center',
		'align-items': 'center',
		bottom: '20px',
		right: '20px',
		padding: '10px',
		zIndex: '10000',
		backgroundColor: 'white',
		color: 'black',
		border: '1px solid black',
		'max-width': '50%',
		'max-height': '75%',
		borderRadius: '5px',
	});

	const optionsDiv = document.createElement('div');
	Object.assign(optionsDiv.style, {
		display: 'flex',
		'justify-content': 'space-around',
		'align-items': 'center',
		width: '100%',
	});

	const matchesText = document.createElement('span');
	matchesText.innerHTML = `Matches: ${currentFoundIndex + 1}/${foundIndexes.length}`;
	Object.assign(matchesText.style, {
		color: 'red',
		fontWeight: 'bold',
		'font-size': '1.2em',
	});

	const prevButton = document.createElement('button');
	prevButton.innerHTML = 'Prev';
	prevButton.onmouseup = () => {
		if (currentFoundIndex > 0) {
			currentFoundIndex--;
			showNewMessage(selectedText);
		}
	};

	const nextButton = document.createElement('button');
	nextButton.innerHTML = 'Next';
	nextButton.onmouseup = () => {
		if (currentFoundIndex < foundIndexes.length - 1) {
			currentFoundIndex++;
			showNewMessage(selectedText);
		}
	};

	const innerDiv = document.createElement('div');
	innerDiv.innerHTML = displayedText;
	innerDiv.innerHTML = innerDiv.innerHTML.replace(selectedText, `<span style="background-color: yellow; color: black;">${selectedText}</span>`);
	Object.assign(innerDiv.style, {
		backgroundColor: 'white',
		color: 'black',
		border: '1px solid black',
		width: '100%',
		height: '100%',
		'overflow-y': 'auto',
		borderRadius: '5px',
	});

	optionsDiv.appendChild(prevButton);
	optionsDiv.appendChild(matchesText);
	optionsDiv.appendChild(nextButton);
	outerDiv.appendChild(innerDiv);
	outerDiv.appendChild(optionsDiv);
	document.body.appendChild(outerDiv);
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

const showNewMessage = (selectedText) => {
	chrome.storage.local.get(['textStorage', 'bufferSize'], (data) => {
		displayedText = data.textStorage.substring(foundIndexes[currentFoundIndex] - 1000, foundIndexes[currentFoundIndex] + parseInt(data.bufferSize));

		showMessageOnPage(displayedText, selectedText);
	});
};
