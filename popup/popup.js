// popup.js
// handles the buttons and stuff in the popup using a callback function
document.addEventListener('DOMContentLoaded', () => {
    // TODO: ONLY OPEN IF A RESUME IS UPLOADED!
    const openSidePanelButton = document.getElementById('openSidePanel');
    // handle the button 
    openSidePanelButton.addEventListener('click', async () => {
      try {
        console.log("ok that worked!")
        // Get the current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Open the side panel

        // CHECK HERE IF WE CAN OPEN THE SIDEPANEL OR NOT, I.E, ARE WE ON LINKEDIN.
        await chrome.sidePanel.open({ tabId: tab.id });
        
      } catch (error) {
        console.error('Error opening side panel:', error);
      }
    });
  });