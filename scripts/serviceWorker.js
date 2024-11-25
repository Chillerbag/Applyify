// we want a listener for when a new tab is opened, and check it for a list
// of constants (job sites). If there is a match, then the serviceworker should open the sidepanel.


// TODO: we need to probably populate this with more
// also another problem here, this is too specific. we need to have a general way of checking that we're on the
// correct website.
const JOB_SITES = [
    "https://www.linkedin.com",
    "www.seek.com.au",
    "https://www.indeed.com",
    "https://glassdoor.com"
]

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tabId === tabId) {
        try {
            const url = new URL(tab.url);
            console.log(url.hostname);

            const matchedSite = JOB_SITES.find((s) => url.hostname.includes(s));

            if (matchedSite) {
                await chrome.sidePanel.open({tabId: tab.id});
            }
        } catch (error) {
            console.error(error); // probs dont need to error to the user here, since whats going on here doesnt matter
        }
    }
});