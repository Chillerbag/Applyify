const JOB_SITES = {
    'linkedin.com': {
        patterns: ['jobs', 'careers', 'vacancy'],
    },
    'seek.com.au': {
        patterns: ['jobs', 'search'],
    },
    'indeed.com': {
        patterns: ['jobs', 'career', 'vcac'],
    },
    'glassdoor.com': {
        patterns: ['Jobs', 'job-list'],
    }
};

// Store the last detected job site
let lastDetectedJobSite = null;

// Function to check if URL matches job site patterns
function isJobSitePage(url) {
    try {
        const hostname = new URL(url).hostname;
        for (const [site, config] of Object.entries(JOB_SITES)) {
            if (hostname.includes(site)) {
                // Check if URL contains any of the patterns
                const urlMatches = config.patterns.some(pattern =>
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

// Listen for tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        const jobSiteMatch = isJobSitePage(tab.url);

        if (jobSiteMatch) {

            // send out a message to change what happens onclick of the icon
            // Update extension icon to indicate job site detected
            chrome.action.setBadgeText({
                text: "✓",
                tabId: tabId
            });
            chrome.action.setBadgeBackgroundColor({
                color: "#4CAF50",
                tabId: tabId
            });
            chrome.action.setPopup(
                {
                    popup: ''
                }
            );
            chrome.action.onClicked.addListener(async () => {
                const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
                await chrome.sidePanel.open({ tabId: tab.id });
            })

        } else {
            // Reset badge if not on job site, and reset popup event
            chrome.action.setBadgeText({
                text: "",
                tabId: tabId
            });

            chrome.action.setPopup(
            {
                popup: '/popup/popup.html'
            });
        }
    }
});
