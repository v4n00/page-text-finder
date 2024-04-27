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
					displayedText = data.textStorage.substring(foundIndexes[currentFoundIndex] - parseInt(data.bufferSize) / 3, foundIndexes[currentFoundIndex] + parseInt(data.bufferSize));
				} else resetFoundIndexes();

				showMessageOnPage(displayedText, selectedText, parseInt(data.bufferSize) / 3);
			});
		} else resetFoundIndexes();
	}
});

const showMessageOnPage = (displayedText, selectedText, bufferSize) => {
	clearExistingMessage();

	const outerDiv = document.createElement('div');
	outerDiv.addEventListener('mouseup', (e) => {
		e.stopPropagation();
	});
	outerDiv.id = '_outerDiv_';

	const optionsDiv = document.createElement('div');
	optionsDiv.id = '_optionsDiv_';

	const matchesText = document.createElement('span');
	matchesText.id = '_matchesText_';
	matchesText.innerHTML = `Matches: ${currentFoundIndex + 1}/${foundIndexes.length}`;

	const prevButton = document.createElement('button');
	prevButton.id = '_prevButton_';
	prevButton.innerHTML = 'Prev';
	prevButton.onmouseup = () => {
		if (currentFoundIndex > 0) {
			currentFoundIndex--;
			showNewMessage(selectedText, bufferSize);
		}
	};

	const nextButton = document.createElement('button');
	nextButton.id = '_nextButton_';
	nextButton.innerHTML = 'Next';
	nextButton.onmouseup = () => {
		if (currentFoundIndex < foundIndexes.length - 1) {
			currentFoundIndex++;
			showNewMessage(selectedText, bufferSize);
		}
	};

	const innerDiv = document.createElement('div');
	innerDiv.id = '_innerDiv_';
	// innerDiv.innerHTML = displayedText;
	innerDiv.innerHTML = wrapFindings(displayedText, selectedText, bufferSize);

	// innerDiv.innerHTML = innerDiv.innerHTML.replace(new RegExp(`${selectedText}`, 'g'), `<span id="_selectedText_">${selectedText}</span>`);

	optionsDiv.appendChild(prevButton);
	optionsDiv.appendChild(matchesText);
	optionsDiv.appendChild(nextButton);
	outerDiv.appendChild(innerDiv);
	outerDiv.appendChild(optionsDiv);
	document.body.appendChild(outerDiv);
};

// utils

const clearExistingMessage = () => {
	let existingMessage = document.getElementById('_outerDiv_');
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

const showNewMessage = (selectedText, bufferSize) => {
	chrome.storage.local.get(['textStorage', 'bufferSize'], (data) => {
		displayedText = data.textStorage.substring(foundIndexes[currentFoundIndex] - 1000, foundIndexes[currentFoundIndex] + parseInt(data.bufferSize));

		showMessageOnPage(displayedText, selectedText, bufferSize);
	});
};

function wrapFindings(text, word, index) {
	const regex = new RegExp(`${word}`, 'g'); // Regex to match whole words only
	let result = text.replace(regex, (match, offset) => {
		console.log(offset, index);
		if (offset === index) {
			return `<span id="_selectedTextExact_">${match}</span>`; // Wrap the word at the specific index with unique ID
		} else {
			return `<span id="_selectedTextNeighbors_">${match}</span>`; // Wrap other instances with general ID
		}
	});

	return result;
}
