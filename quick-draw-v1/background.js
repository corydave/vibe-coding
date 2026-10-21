// v1.0 - initial build
// Quick Draw - the service worker. It runs in the background, outside
// every web page, because the right-click menu belongs to Chrome, not
// to any page.
//
// PERMISSIONS (manifest.json can't hold comments, so they're explained here):
//   contextMenus - to add our items to the right-click menu.
//   activeTab    - picking one of our menu items gives us the tab you
//                  are on, for that moment only. No list of websites,
//                  no access to anything until you right-click.
//   scripting    - to run the small "type this in" function inside that tab.

// ===================================================================
// EDIT ME: your snippets. "label" is what the menu shows; "text" is
// what gets typed. Add one by copying a line. Then reload the
// extension at chrome://extensions - the menu is built when it starts.
// For more than one line, put \n where each new line should begin.
// ===================================================================
const SNIPPETS = [
  { label: "Lorem ipsum",     text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  { label: "Email signature", text: "Dave Ghidiu\nComputing Sciences\nFinger Lakes Community College" },
  { label: "Standard reply",  text: "Thanks for reaching out! I'll take a look and get back to you within two business days." },
  { label: "Mailing address", text: "3325 Marvin Sands Drive, Canandaigua, NY 14424" },
];

// -------------------------------------------------------------------
// Build the menu when the extension is installed or reloaded.
// contexts: ["editable"] means the menu ONLY appears when you
// right-click something you can type into - a search box, an email,
// a comment field. Everywhere else, it stays out of the way.
// -------------------------------------------------------------------
chrome.runtime.onInstalled.addListener(function () {
  // Start clean, so a reload never leaves an old copy of the menu behind.
  chrome.contextMenus.removeAll(function () {
    // One parent item, so all the snippets sit together in a little sub-menu.
    chrome.contextMenus.create({
      id: "quick-draw",
      title: "Quick Draw",
      contexts: ["editable"],
    });
    // One child item per snippet. Its id remembers which snippet it is.
    SNIPPETS.forEach(function (snippet, index) {
      chrome.contextMenus.create({
        id: "snippet-" + index,
        parentId: "quick-draw",
        title: snippet.label,
        contexts: ["editable"],
      });
    });
  });
});

// -------------------------------------------------------------------
// When a menu item is picked: work out which snippet it was, then run
// insertSnippet (below) INSIDE the page, in the exact box you
// right-clicked. frameIds points at the right frame, because some boxes
// live in a page-inside-a-page.
// -------------------------------------------------------------------
chrome.contextMenus.onClicked.addListener(function (info, tab) {
  const index = Number(String(info.menuItemId).replace("snippet-", ""));
  const snippet = SNIPPETS[index];
  if (!snippet || !tab) return;

  chrome.scripting.executeScript({
    target: { tabId: tab.id, frameIds: [info.frameId] },
    func: insertSnippet,
    args: [snippet.text],
  }).catch(function (error) {
    // Chrome's own pages and the Web Store refuse all extensions.
    console.log("Quick Draw could not type here: " + error.message);
  });
});

// -------------------------------------------------------------------
// This function is copied INTO the web page and runs there, so it can
// only use what it is given (the text) - nothing else from this file.
// The box you right-clicked still has the cursor in it, so
// document.activeElement is that box.
// -------------------------------------------------------------------
function insertSnippet(text) {
  const box = document.activeElement;
  if (!box) return;

  // insertText types at the cursor, replaces any selected text, works in
  // plain boxes AND fancy editors, and keeps Undo (Ctrl+Z) working.
  const worked = document.execCommand("insertText", false, text);

  // Backup plan for a plain box where insertText did nothing.
  if (!worked && typeof box.setRangeText === "function") {
    box.setRangeText(text, box.selectionStart, box.selectionEnd, "end");
    // Tell the page the box changed, the way real typing would.
    box.dispatchEvent(new Event("input", { bubbles: true }));
  }
}
