export const retrieveFromStorage = (key, callback = undefined) => {
	chrome.storage.sync.get(null, (items) => {
		const chunkCount = items[`${key}_count`];
		let storage = '';

		for (let index = 0; index < chunkCount; index++) {
			const chunkKey = `${key}_${index}`;
			storage += items[chunkKey];
		}

		callback(storage);
	});
};

export const saveToStorage = (key, string) => {
	const chunkSize = chrome.storage.sync.QUOTA_BYTES_PER_ITEM - (2 ** 7 + 2 ** 6);
	let index = 0;
	let startIndex = 0;

	while (startIndex < string.length) {
		const chunk = string.substring(startIndex, startIndex + chunkSize);
		chrome.storage.sync.set({ [`${key}_${index}`]: chunk });

		startIndex += chunkSize;
		index++;
	}

	chrome.storage.sync.set({ [`${key}_count`]: index });
};
