let isExtensionOn = false;
let foundIndexes = [];
let currentFoundIndex = -1;
let isResizing = false;
let outerDivSize = { width: '400', height: '300' };

chrome.storage.local.get(['toggle', 'outerDivWidth', 'outerDivHeight'], (result) => {
	isExtensionOn = result.toggle || false;
	outerDivSize.width = result.outerDivWidth || '400';
	outerDivSize.height = result.outerDivHeight || '300';
});

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
	if (request.type === 'toggleChanged') {
		isExtensionOn = request.toggleState;
		chrome.storage.local.set({ toggle: isExtensionOn });
		sendResponse({ status: 'Toggle state updated' });
	}
});

document.addEventListener('mouseup', async () => {
	if (!isResizing) {
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
	}
});

const showMessageOnPage = (displayedText, selectedText, bufferSize) => {
	clearExistingMessage();

	const outerDiv = document.createElement('div');
	outerDiv.addEventListener('mouseup', (e) => {
		if (!isResizing) e.stopPropagation();
	});
	outerDiv.id = '_outerDiv_';
	if (displayedText !== 'not found') {
		outerDiv.style.width = `${outerDivSize.width}px`;
		outerDiv.style.height = `${outerDivSize.height}px`;

		const resizeHandle = document.createElement('div');
		resizeHandle.id = '_resizeHandle_';
		resizeHandle.innerHTML = '\u21F1 ';

		let startX, startY, startWidth, startHeight;

		resizeHandle.addEventListener('mousedown', (e) => {
			e.stopPropagation();
			e.preventDefault();
			isResizing = true;
			startX = e.clientX;
			startY = e.clientY;
			startWidth = parseInt(document.defaultView.getComputedStyle(outerDiv).width, 10);
			startHeight = parseInt(document.defaultView.getComputedStyle(outerDiv).height, 10);
		});

		document.addEventListener('mousemove', (e) => {
			if (isResizing) {
				outerDivSize.width = startWidth - (e.clientX - startX);
				outerDivSize.height = startHeight - (e.clientY - startY);
				outerDiv.style.width = `${Math.max(outerDivSize.width, 100)}px`;
				outerDiv.style.height = `${Math.max(outerDivSize.height, 50)}px`;
			}
		});

		document.addEventListener('mouseup', (e) => {
			isResizing = false;
			chrome.storage.local.set({ outerDivWidth: outerDivSize.width, outerDivHeight: outerDivSize.height });
		});

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
		innerDiv.innerHTML = wrapFindings(displayedText, selectedText, bufferSize);

		outerDiv.appendChild(resizeHandle);
		optionsDiv.appendChild(prevButton);
		optionsDiv.appendChild(matchesText);
		optionsDiv.appendChild(nextButton);
		outerDiv.appendChild(innerDiv);
		outerDiv.appendChild(optionsDiv);
	} else {
		outerDiv.innerHTML = displayedText;
	}
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
		if (offset === index) {
			return `<span id="_selectedTextExact_">${match}</span>`; // Wrap the word at the specific index with unique ID
		} else {
			return `<span id="_selectedTextNeighbors_">${match}</span>`; // Wrap other instances with general ID
		}
	});

	return result;
}
