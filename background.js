chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
	(async () => {
		console.log('hi');
		if (request.text) {
			chrome.storage.local.get('textStorage', ({ textStorage }) => {
				const index = textStorage.indexOf(request.text);

				if (index !== -1) {
					sendResponse({ text: textStorage.substring(index - 1000, index + 5000), index });
				} else {
					sendResponse({ text: request.text, index: -1 });
				}
			});
		}
	})();
	return true;
});
