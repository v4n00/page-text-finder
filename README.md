# Page Text Finder

A simple Chrome extension that allows users to search for text on a page when selecting it.  
The user will specify the text in which the extension performs the search before using the extension.

## Download

1. Download [page-text-finder.crx](https://github.com/v4n00/page-text-finder/releases/download/v1.0.0/page-text-finder.crx) from the releases page of this repository.
2. Open Chrome and go to `chrome://extensions/`
3. Enable Developer mode (top right corner)
4. Drag'n'drop `page-text-finder.crx` into the Chrome window
5. Click `Add extension`

**If you get the error** *"This extension is not listed in the Chrome Web Store and may have been added without your knowledge."***, then follow the next steps (this will only happen while the extension is still NOT approved in the Chrome Web Store, Google please hurry up):**

1. Remove the extension
2. Clone this repository
3. Unarchive the `page-text-finder-master` folder
4. Open Chrome and go to `chrome://extensions/`
5. Enable Developer mode (top right corner)
6. Click on "Load unpacked" and select the folder where you unarchived the repository
7. Restart Chrome

## Usage

1. Enter the text you want to use as a reference in the extension popup.
2. (Optional) Change the buffer size. This allows for the search result to provide more text after a match.
3. Click `Save`.
4. Highlight text on any page.
