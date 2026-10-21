// v1.0 - initial build
// Launch Pad - the code behind newtab.html.

// ===================================================================
// EDIT ME: your name and your links.
// Add a link by copying one line and changing the words in quotes.
// This is JavaScript, so a comma after the last link is fine here.
// (In manifest.json the same comma would stop the whole extension
// from loading - that file is JSON, which is stricter.)
// ===================================================================
const MY_NAME = "Dave";

const LINKS = [
  { label: "Brightspace", url: "https://brightspace.flcc.edu/" },
  { label: "Email",       url: "https://outlook.office.com/mail/" },
  { label: "My site",     url: "https://corydave.github.io/vibe-coding/" },
  { label: "GitHub",      url: "https://github.com/" },
  { label: "Calendar",    url: "https://outlook.office.com/calendar/" },
  { label: "Weather",     url: "https://weather.gov/" },
  { label: "FLX AI Hub",  url: "https://flcc.ai/" },          // the seventh link, added in Make it yours
];

// -------------------------------------------------------------------
// Build the list of links on the page from the LINKS list above.
// For each link we make an <li> with an <a> inside it.
// textContent (not innerHTML) is used so a label can never be
// mistaken for code.
// -------------------------------------------------------------------
const list = document.getElementById("links");
LINKS.forEach(function (link) {
  const item = document.createElement("li");
  const anchor = document.createElement("a");
  anchor.href = link.url;
  anchor.textContent = link.label;
  item.appendChild(anchor);
  list.appendChild(item);
});

// -------------------------------------------------------------------
// Update the clock, the date and the greeting.
// toLocaleTimeString and toLocaleDateString format the time the way
// this computer is set up to show it (12 or 24 hour, and so on).
// -------------------------------------------------------------------
function tick() {
  const now = new Date();
  document.getElementById("clock").textContent =
    now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  document.getElementById("date").textContent =
    now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
  document.getElementById("greeting").textContent = "Hello, " + MY_NAME;
}

tick();                      // run once straight away, so the page is never blank
setInterval(tick, 1000);     // then again every 1000 milliseconds (one second)
