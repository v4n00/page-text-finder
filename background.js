chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
	(async () => {
		if (request.text) {
			chrome.storage.local.get(['textStorage', 'bufferSize'], (data) => {
				if (data.textStorage === '') return;
				const index = data.textStorage.indexOf(request.text);
				let response = '';

				if (index !== -1) {
					response = data.textStorage.substring(index - 1000, index + data.bufferSize);
				}

				sendResponse({ text: response, index });
			});
		}
	})();

	return true;
});
