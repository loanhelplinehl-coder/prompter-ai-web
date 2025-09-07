// background.js - Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log('Prompter AI Extension Installed');
});

// Function to capture selected text from the active tab
async function getSelectedTextFromActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    const response = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => window.getSelection().toString(),
    });
    return response[0].result;
  }
  return '';
}

// Listener for messages from popup.js or content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureSelectedText') {
    // When popup.js requests to capture, get it from active tab and store it.
    getSelectedTextFromActiveTab().then((selectedText) => {
      chrome.storage.local.set({ capturedSelectedText: selectedText });
      sendResponse({ status: "success", selectedText: selectedText });
    }).catch((error) => {
      console.error('Error capturing selected text:', error);
      sendResponse({ status: "error", message: 'Failed to capture text.' });
    });
    return true; // Indicates that sendResponse will be called asynchronously
  } else if (request.action === 'updateSelectedText') {
    // When content.js sends selected text, store it.
    chrome.storage.local.set({ capturedSelectedText: request.data });
  }
});
