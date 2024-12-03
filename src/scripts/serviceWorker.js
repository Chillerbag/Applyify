/*
File: serviceWorker.js
Description:  the background agent which checks if we're on a jobsite, and allows for immediate
  activation of the sidepanel if so. Also adds a green tick in the case we are on one of the 4 jobsites
Last modified: 29/11/2024 by Ethan
*/

// -------------------------------------------------------------------
//                                 Constants
// -------------------------------------------------------------------
const POPUP_HTML = "src/popup/popup.html";

const JOB_SITES = {
  "linkedin.com": {
    patterns: ["jobs", "careers", "vacancy"],
  },
  "seek.com": {
    patterns: ["jobs", "search"],
  },
  "indeed.com": {
    patterns: ["jobs", "career", "vcac"],
  },
  "glassdoor.com": {
    patterns: ["Jobs", "job-list"],
  },
};

// -------------------------------------------------------------------
//                                 Listeners
// -------------------------------------------------------------------
chrome.tabs.onActivated.addListener(async () => {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  const tabId = tab.id;
  if (tab.url) {
    const jobSiteMatch = isJobSitePage(tab.url);
    if (jobSiteMatch) {
      onSiteMatch(tabId);
    } else {
      enableMainPopup(tabId);
    }
  } else {
    enableMainPopup(tabId);
  }
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const jobSiteMatch = isJobSitePage(tab.url);
    if (jobSiteMatch) {
      onSiteMatch(tabId);
    } else {
      // Reset badge if not on job site, and reset popup event
      enableMainPopup(tabId);
    }
  }
});

// -------------------------------------------------------------------
//                            Helper functions
// -------------------------------------------------------------------

function onSiteMatch(tabId) {
  // send out a message to change what happens onclick of the icon
  // Update extension icon to indicate job site detected
  chrome.action.setBadgeText({
    text: "✓",
    tabId: tabId,
  });
  chrome.action.setBadgeBackgroundColor({
    color: "#4CAF50",
    tabId: tabId,
  });
  chrome.action.setPopup({
    popup: "",
  });
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
}

function enableMainPopup(tabId) {
  chrome.action.setPopup({
    popup: POPUP_HTML,
  });

  chrome.action.setBadgeText({
    text: "",
    tabId: tabId,
  });

  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
}

// Function to check if URL matches job site patterns
function isJobSitePage(url) {
  try {
    const hostname = new URL(url).hostname;
    for (const [site, config] of Object.entries(JOB_SITES)) {
      if (hostname.includes(site)) {
        // Check if URL contains any of the patterns
        const urlMatches = config.patterns.some((pattern) =>
          url.toLowerCase().includes(pattern.toLowerCase())
        );
        return urlMatches ? { site, config } : false;
      }
    }
    return false;
  } catch {
    return false;
  }
}
