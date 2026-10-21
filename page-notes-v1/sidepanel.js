// v1.0 - initial build
// Page Notes - the side panel's code: count what is on the page, and
// remember a note for each page.

// Reading speed used for the estimate. 230 words a minute is a common
// average for adults reading on a screen.
const WORDS_PER_MINUTE = 230;

// The note box and the page we're currently looking at.
const noteBox = document.getElementById("note");
let currentAddress = null;

// -------------------------------------------------------------------
// countThePage runs INSIDE the web page (not in this panel), so it can
// only use what's on that page. It hands back a small summary.
//
// "No alt text" means NO alt attribute at all. An image with alt=""
// is CORRECT - it's how a page tells a screen reader "this picture is
// decoration, skip it" - so it must not be counted as a problem.
// -------------------------------------------------------------------
function countThePage() {
  const text = document.body ? document.body.innerText : "";
  // Split on any run of spaces or line breaks, and ignore empty bits.
  const words = text.split(/\s+/).filter(function (w) { return w.length > 0; }).length;
  const images = Array.from(document.images);
  return {
    address: location.href,
    title: document.title,
    words: words,
    links: document.querySelectorAll("a[href]").length,
    images: images.length,
    noAlt: images.filter(function (img) { return !img.hasAttribute("alt"); }).length,
  };
}

// -------------------------------------------------------------------
// Ask Chrome to run countThePage in the tab you're looking at.
// This only works right after you clicked our icon on that page
// (that's activeTab). If it fails, we explain instead of breaking.
// -------------------------------------------------------------------
async function readPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: countThePage,
    });
    showCounts(results[0].result);
  } catch (error) {
    showMessage("I can only see a page after you click the Page Notes icon on it. " +
                "Click the icon now to count this page. (Chrome's own pages, the " +
                "Web Store and files on your computer can't be read at all.)");
  }
}

// -------------------------------------------------------------------
// Put the numbers on screen, then load this page's note.
// -------------------------------------------------------------------
function showCounts(summary) {
  document.getElementById("message").hidden = true;
  document.getElementById("counts").hidden = false;
  document.getElementById("note-area").hidden = false;

  document.getElementById("page-title").textContent = summary.title || summary.address;
  document.getElementById("words").textContent = summary.words.toLocaleString();
  const minutes = Math.max(1, Math.round(summary.words / WORDS_PER_MINUTE));
  document.getElementById("reading").textContent = minutes + " min";
  document.getElementById("links").textContent = summary.links;
  document.getElementById("images").textContent = summary.images;

  const noAlt = document.getElementById("no-alt");
  noAlt.textContent = summary.noAlt;
  noAlt.className = summary.noAlt > 0 ? "bad" : "good";

  loadNote(summary.address);
}

function showMessage(words) {
  const message = document.getElementById("message");
  message.textContent = words;
  message.hidden = false;
  document.getElementById("counts").hidden = true;
  document.getElementById("note-area").hidden = true;
  currentAddress = null;
}

// -------------------------------------------------------------------
// Notes are saved with localStorage: pairs of a KEY and a VALUE.
// The key is "note:" plus the page's address, so every page gets its
// own note. localStorage here belongs to this extension and lives on
// this computer, in this browser, only.
// -------------------------------------------------------------------
function loadNote(address) {
  currentAddress = address;
  noteBox.value = localStorage.getItem("note:" + address) || "";
  document.getElementById("saved").textContent = "";
}

// Save on every keystroke. A note is small, so this is cheap.
noteBox.addEventListener("input", function () {
  if (!currentAddress) return;
  if (noteBox.value.trim() === "") {
    localStorage.removeItem("note:" + currentAddress);   // an empty note is no note
  } else {
    localStorage.setItem("note:" + currentAddress, noteBox.value);
  }
  document.getElementById("saved").textContent = "Saved on this computer.";
});

// -------------------------------------------------------------------
// background.js sends "read-page" when the icon is clicked while the
// panel is already open. Read the page again when it does.
// -------------------------------------------------------------------
chrome.runtime.onMessage.addListener(function (message) {
  if (message && message.type === "read-page") readPage();
});

// And read the page once as the panel first opens.
readPage();
