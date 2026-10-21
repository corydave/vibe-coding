// v1.0 - initial build
// Page Notes - the service worker. Its only job: when you click the
// toolbar icon, open the side panel and tell it to read this page.
//
// WHY THIS IS ITS OWN FILE: the click happens before the panel exists,
// so the panel's own code can't be the thing that listens for it.
//
// PERMISSIONS (manifest.json can't hold comments, so they're explained here):
//   sidePanel - to open our panel beside the page.
//   activeTab - clicking our icon lets us read THAT tab, for that page
//               only. Go to a different website and we can't see it
//               until you click the icon again.
//   scripting - to run the counting code inside the page.

chrome.action.onClicked.addListener(function (tab) {
  // Open the panel straight away. Chrome only allows this as a direct
  // response to a click, so it must come first, before anything else.
  chrome.sidePanel.open({ windowId: tab.windowId });

  // If the panel was already open, ask it to read the new page.
  // (If it was closed, it reads the page by itself as it opens, and
  // nobody is listening for this message yet - that's fine.)
  chrome.runtime.sendMessage({ type: "read-page" }).catch(function () {});
});
