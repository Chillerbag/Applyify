// siteEnabled.js
// enables the sidepanel if the user accesses the site. we cant automatically open the side panel on access of the site
// unfortunately. Due to security reasons. 

// TODO: add more sitess
// TODO: error out if no resume is uploaded to storage
const LINKEDIN_URL = 'https://www.linkedin.com';

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {

  // wait until we have fully loaded the site
  if (!tab.url || info.status !== 'complete') return;

  try {
    const url = new URL(tab.url);
    
    if (url.origin === LINKEDIN_URL) {
      await chrome.sidePanel.setOptions({
        tabId,
        path: 'sidepanel/sidePanel.html',
        enabled: true
      });
    } else {
      await chrome.sidePanel.setOptions({
        tabId,
        enabled: false
      });
      // TODO. FIGURE OUT HOW TO CLOSE THE SIDE PANEL AUTOMATICALLY WHEN A USER LEAVES LINKEDIN. 
      window.close();
    }
  } catch (error) {
    console.error('Error in side panel handler:', error);
  }
});