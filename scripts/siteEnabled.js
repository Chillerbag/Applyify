const LINKEDIN_URL = 'https://www.linkedin.com'

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
    if (!tab.url) return;
    const url = new URL(tab.url);
    if (url.origin === LINKEDIN_URL) {
      await chrome.sidePanel.setOptions({
        tabId,
        path: 'sidePanel.html',
        enabled: true
      });
    } else {
      // Disables the side panel on all other sites
      await chrome.sidePanel.setOptions({
        tabId,
        enabled: false
      });
    }
  });