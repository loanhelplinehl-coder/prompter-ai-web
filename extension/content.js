// content.js - Auto-capture user input

document.addEventListener('input', (event) => {
  const target = event.target;
  // Check if the input is from a textarea or a contenteditable div, or an input field with sufficient size
  if (target.tagName === 'TEXTAREA' || 
      (target.tagName === 'DIV' && target.isContentEditable) ||
      (target.tagName === 'INPUT' && (target.type === 'text' || target.type === 'search') && target.offsetWidth > 100) // Heuristic for chat-like input
     ) {
    const text = target.value || target.innerText;
    if (text) {
      chrome.storage.local.set({ capturedInput: text });
    }
  }
});

// Additionally, send selected text to background script when a selection is made
document.addEventListener('selectionchange', () => {
  const selectedText = window.getSelection().toString();
  if (selectedText) {
    chrome.runtime.sendMessage({ action: 'updateSelectedText', data: selectedText });
  }
}); 
