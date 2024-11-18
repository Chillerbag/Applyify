// popup.js
// handles the buttons and stuff in the popup using a callback function
document.addEventListener('DOMContentLoaded', () => {
    // TODO: ONLY OPEN IF A RESUME IS UPLOADED!
    const openSidePanelButton = document.getElementById('openSidePanel');
    
    openSidePanelButton.addEventListener('click', async () => {
      try {
        // Get the current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Open the side panel

        // CHECK HERE IF WE CAN OPEN THE SIDEPANEL OR NOT, I.E, ARE WE ON LINKEDIN.
        await chrome.sidePanel.open({ tabId: tab.id });
        
        // Optionally close the popup
        window.close();
      } catch (error) {
        console.error('Error opening side panel:', error);
      }
    });
  });