import { retrieveFromStorage } from './functions.js';

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
	(async () => {
		if (request.text) {
			retrieveFromStorage('textStorage', (storage) => {
				const found = storage.includes(request.text);
				console.log(textStorage);
				sendResponse(found ? 'found' : 'not found');
			});
		}
	})();
	return true;
});
