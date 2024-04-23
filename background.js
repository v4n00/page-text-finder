chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
	(async () => {
		if (request.type === 'TEXT_SELECTED') {
			chrome.storage.local.get(['textStorage', 'bufferSize'], (data) => {
				const index = data.textStorage.indexOf(request.text);
				let response = '';

				if (index !== -1) {
					response = data.textStorage.substring(index - 1000, index + parseInt(data.bufferSize));
				}

				sendResponse({ text: response, index });
			});
		}
	})();

	return true;
});
