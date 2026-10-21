// v1.0 - initial build
// Word Swap - a content script. Chrome drops this file into every page
// that matches the "matches" line in manifest.json (right now: English
// Wikipedia only) and runs it after the page has loaded.
//
// PERMISSIONS: none in the "permissions" list. The "matches" line IS the
// permission - it is what makes Chrome say this extension can "read and
// change your data on en.wikipedia.org". One site, on purpose.

// ===================================================================
// EDIT ME: what to find, and what to put in its place.
// Capital letters count: "The cloud" will not match "the cloud".
// Do not put the FIND words inside REPLACE - see the lab's
// troubleshooting for why.
// ===================================================================
const FIND    = "artificial intelligence";   // changed in Make it yours (was "the cloud")
const REPLACE = "a very confident autocomplete";

// -------------------------------------------------------------------
// Tags whose text we must NEVER touch:
//   SCRIPT / STYLE / NOSCRIPT - the page's own code, not words
//   TEXTAREA / INPUT / SELECT / OPTION - boxes a person types into
//   CODE / PRE - examples of code that should stay exact
// -------------------------------------------------------------------
const SKIP = "script, style, noscript, textarea, input, select, option, code, pre, [contenteditable]";

// -------------------------------------------------------------------
// Step 1: collect every TEXT NODE on the page.
// A text node is one run of readable words with no tags inside it.
// A "tree walker" visits them one at a time, like reading a book page
// by page, and we keep the ones that are safe to change.
// -------------------------------------------------------------------
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
const textNodes = [];
let node;
while ((node = walker.nextNode())) {
  const parent = node.parentElement;
  if (parent && !parent.closest(SKIP)) {
    textNodes.push(node);
  }
}

// -------------------------------------------------------------------
// Step 2: change them.
// We collected the whole list FIRST and change it SECOND, so the script
// never goes back over its own work. split + join replaces every copy
// of FIND in that run of text, and leaves everything else alone.
// -------------------------------------------------------------------
let swaps = 0;
textNodes.forEach(function (textNode) {
  if (textNode.nodeValue.includes(FIND)) {
    const pieces = textNode.nodeValue.split(FIND);
    swaps += pieces.length - 1;
    textNode.nodeValue = pieces.join(REPLACE);
  }
});

// A note in the Developer Console, so you can check it ran even on a
// page where the word never appears.
console.log("Word Swap ran: " + swaps + " swap(s) on this page.");
